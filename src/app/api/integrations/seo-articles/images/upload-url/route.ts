import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { MAX_IMPORT_IMAGE_BYTES, isAllowedImportImageContentType } from '@/lib/seoArticleImport';
import {
  createSeoArticleImageUploadToken,
  isValidSeoArticleImportAuthorization,
} from '@/lib/seoArticleImportAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const requestSchema = z.object({
  fileName: z.string().trim().min(1).max(120),
  contentType: z.string().trim().min(1),
  size: z.number().int().positive().max(MAX_IMPORT_IMAGE_BYTES),
  origin: z.string().url(),
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

export async function POST(request: NextRequest) {
  try {
    if (!isValidSeoArticleImportAuthorization(request.headers.get('authorization'))) {
      return createNoCacheResponse({ error: 'Unauthorized' }, 401);
    }

    const body = requestSchema.parse(await request.json());
    if (!isAllowedImportImageContentType(body.contentType)) {
      return createNoCacheResponse({ error: 'Unsupported image content type.' }, 400);
    }

    const origin = new URL(body.origin).origin;
    const token = createSeoArticleImageUploadToken({
      fileName: body.fileName,
      contentType: body.contentType.split(';')[0].trim().toLowerCase(),
      maxBytes: body.size,
      origin,
    });
    const uploadUrl = new URL('/api/integrations/seo-articles/images', request.nextUrl.origin);
    uploadUrl.searchParams.set('token', token);

    return createNoCacheResponse({ uploadUrl: uploadUrl.toString() });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return createNoCacheResponse({ error: 'Validation error', details: error.issues }, 400);
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message.includes('SEO_ARTICLE_IMPORT_TOKEN') ? 500 : 400;
    return createNoCacheResponse(
      {
        error: status === 500 ? 'Import endpoint is not configured.' : 'Failed to create image upload URL.',
        message,
      },
      status,
    );
  }
}
