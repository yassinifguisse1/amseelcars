import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z, ZodError } from 'zod';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import { articleLocales } from '@/lib/validations/article';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const bodySchema = z.object({
  translationGroup: z.string().trim().min(1),
  /** Keep the source locale unpublished so EN (or FR) can be published manually. */
  excludeSourceLocale: z.boolean().optional().default(true),
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

/**
 * POST /api/admin/articles/publish-translations
 * Publish every non-source locale in a translation family (FR/ES/DE/PL drafts → live).
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createNoCacheResponse({ error: 'Unauthorized' }, 401);
    }
    if (!(await isAdmin())) {
      return createNoCacheResponse({ error: 'Forbidden: Admin access required' }, 403);
    }

    const parsed = bodySchema.parse(await request.json());
    const family = await prisma.blogArticle.findMany({
      where: { translationGroup: parsed.translationGroup },
      select: {
        id: true,
        locale: true,
        published: true,
        translationSourceLocale: true,
      },
    });

    if (family.length === 0) {
      return createNoCacheResponse({ error: 'Translation group not found.' }, 404);
    }

    const sourceLocale =
      family.find((article) => article.translationSourceLocale)?.translationSourceLocale ??
      family.find((article) => article.locale === 'en')?.locale ??
      family.find((article) => article.locale === 'fr')?.locale ??
      family[0].locale;

    const draftTranslations = family.filter((article) => {
      if (parsed.excludeSourceLocale && article.locale === sourceLocale) return false;
      return article.published !== true;
    });

    if (draftTranslations.length === 0) {
      return createNoCacheResponse({
        message: 'All translation locales are already published.',
        publishedCount: 0,
        sourceLocale,
        publishedLocales: [] as string[],
      });
    }

    const ids = draftTranslations.map((article) => article.id);
    await prisma.blogArticle.updateMany({
      where: { id: { in: ids } },
      data: {
        published: true,
        indexable: true,
      },
    });

    const publishedLocales = draftTranslations
      .map((article) => article.locale)
      .filter((locale): locale is (typeof articleLocales)[number] =>
        (articleLocales as readonly string[]).includes(locale),
      );

    return createNoCacheResponse({
      message: `Published ${publishedLocales.length} translation locale${publishedLocales.length === 1 ? '' : 's'}.`,
      publishedCount: publishedLocales.length,
      sourceLocale,
      publishedLocales,
    });
  } catch (error: unknown) {
    console.error('[POST /api/admin/articles/publish-translations] Failed:', error);
    if (error instanceof ZodError) {
      return createNoCacheResponse({ error: 'Validation error', details: error.issues }, 400);
    }
    return createNoCacheResponse(
      {
        error: 'Failed to publish translations.',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  }
}
