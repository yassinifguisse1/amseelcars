import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/auth';
import { articleLocales } from '@/lib/validations/article';
import { persistTranslatedArticleFromSource } from '@/lib/seoArticleAutoTranslate';
import { getSeoArticleTranslationModel } from '@/lib/seoArticleTranslation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 300;

const translationRequestSchema = z.object({
  sourceArticleId: z.string().trim().min(1),
  targetLocale: z.enum(articleLocales),
  overwrite: z.boolean().optional().default(false),
});

function createNoCacheResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) {
    return { error: createNoCacheResponse({ error: 'Unauthorized' }, 401) };
  }
  if (!(await isAdmin())) {
    return { error: createNoCacheResponse({ error: 'Forbidden: Admin access required' }, 403) };
  }
  return { userId };
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if ('error' in authResult) return authResult.error;

    const input = translationRequestSchema.parse(await request.json());
    const saved = await persistTranslatedArticleFromSource({
      sourceArticleId: input.sourceArticleId,
      targetLocale: input.targetLocale,
      overwrite: input.overwrite,
      // Manual admin translations stay drafts until "Publish all translations".
      published: false,
      createdBy: authResult.userId,
    });

    return createNoCacheResponse(
      {
        message: `${input.targetLocale.toUpperCase()} translation ${saved.created ? 'created' : 'regenerated'} successfully.`,
        article: {
          id: saved.article.id,
          slug: saved.article.slug,
          locale: saved.article.locale,
          published: saved.article.published,
          translationGroup: saved.article.translationGroup,
        },
        model: getSeoArticleTranslationModel(),
      },
      saved.created ? 201 : 200,
    );
  } catch (error: unknown) {
    console.error('[POST /api/admin/articles/translations] Translation failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (error instanceof ZodError) {
      return createNoCacheResponse({ error: 'Validation error', details: error.issues }, 400);
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = /already exists/i.test(message)
      ? 409
      : /not found/i.test(message)
        ? 404
        : /only for SEO Nexus/i.test(message) || /does not need translation/i.test(message)
          ? 400
          : 500;

    return createNoCacheResponse(
      {
        error: status === 409 ? message : 'Failed to generate article translation.',
        message,
      },
      status,
    );
  }
}
