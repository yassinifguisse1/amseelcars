import { NextRequest, NextResponse } from 'next/server';
import { UTApi } from 'uploadthing/server';
import { MAX_IMPORT_IMAGE_BYTES, isAllowedImportImageContentType } from '@/lib/seoArticleImport';
import { parseSeoArticleImageUploadToken } from '@/lib/seoArticleImportAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const utapi = new UTApi();

function fileExtensionFromContentType(contentType: string) {
  if (contentType.includes('png')) return 'png';
  if (contentType.includes('webp')) return 'webp';
  if (contentType.includes('gif')) return 'gif';
  if (contentType.includes('avif')) return 'avif';
  return 'jpg';
}

function sanitizeFileName(fileName: string, contentType: string) {
  const safeName = fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
  if (safeName && /\.[a-z0-9]{2,5}$/i.test(safeName)) return safeName;
  return `${safeName || 'article-image'}.${fileExtensionFromContentType(contentType)}`.slice(0, 120);
}

function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  };
}

function createResponse(data: unknown, status: number, origin = '') {
  return NextResponse.json(data, {
    status,
    headers: {
      ...(origin ? corsHeaders(origin) : {}),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function readUploadToken(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') ?? '';
  return parseSeoArticleImageUploadToken(token);
}

export async function OPTIONS(request: NextRequest) {
  try {
    const payload = readUploadToken(request);
    const requestOrigin = request.headers.get('origin') ?? '';
    if (!requestOrigin || requestOrigin !== payload.origin) {
      return createResponse({ error: 'Origin is not allowed.' }, 403);
    }
    return new NextResponse(null, { status: 204, headers: corsHeaders(payload.origin) });
  } catch (error: unknown) {
    return createResponse({ error: error instanceof Error ? error.message : 'Invalid upload token.' }, 401);
  }
}

export async function POST(request: NextRequest) {
  let origin = '';
  try {
    const payload = readUploadToken(request);
    origin = payload.origin;
    const requestOrigin = request.headers.get('origin') ?? '';
    if (!requestOrigin || requestOrigin !== payload.origin) {
      return createResponse({ error: 'Origin is not allowed.' }, 403, origin);
    }

    const contentType = request.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() || '';
    if (contentType !== payload.contentType || !isAllowedImportImageContentType(contentType)) {
      return createResponse({ error: 'Unsupported or mismatched image content type.' }, 400, origin);
    }

    const contentLength = Number(request.headers.get('content-length') || 0);
    const maxBytes = Math.min(payload.maxBytes, MAX_IMPORT_IMAGE_BYTES);
    if (contentLength > maxBytes) {
      return createResponse({ error: `Image is larger than ${maxBytes} bytes.` }, 400, origin);
    }

    const arrayBuffer = await request.arrayBuffer();
    if (!arrayBuffer.byteLength || arrayBuffer.byteLength > maxBytes) {
      return createResponse({ error: `Image is empty or larger than ${maxBytes} bytes.` }, 400, origin);
    }

    const fileName = sanitizeFileName(payload.fileName, contentType);
    const [result] = await utapi.uploadFiles([new File([arrayBuffer], fileName, { type: contentType })]);
    if (result.error || !result.data) {
      throw new Error(result.error?.message || 'UploadThing image upload failed.');
    }

    return createResponse(
      {
        url: result.data.ufsUrl || result.data.url,
        fileName,
      },
      201,
      origin,
    );
  } catch (error: unknown) {
    return createResponse(
      {
        error: 'Failed to upload image.',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      400,
      origin,
    );
  }
}
