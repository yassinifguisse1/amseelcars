import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ZodError } from 'zod';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import { articleLocales, isArticleLocale, type ArticleLocale } from '@/lib/validations/article';
import {
  mediaAssetDraftSchema,
  mediaAssetSchema,
  type BlogMediaAsset,
  type MediaMetadata,
  type MediaMetadataByLocale,
} from '@/lib/validations/media';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function createNoCacheResponse(data: unknown, status: number = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) {
    return { error: createNoCacheResponse({ error: 'Unauthorized' }, 401) };
  }

  const admin = await isAdmin();
  if (!admin) {
    return { error: createNoCacheResponse({ error: 'Forbidden: Admin access required' }, 403) };
  }

  return { userId };
}

function transformMediaAsset(asset: {
  id: string;
  url: string;
  fileName: string | null;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
}): BlogMediaAsset {
  return {
    id: asset.id,
    url: asset.url,
    fileName: asset.fileName ?? '',
    metadata: asset.metadata as MediaMetadataByLocale,
    createdAt: asset.createdAt.toISOString(),
    updatedAt: asset.updatedAt.toISOString(),
  };
}

function trimMetadata(metadata: {
  metaTitle?: string;
  altText?: string;
  caption?: string;
  description?: string;
}): MediaMetadata {
  return {
    metaTitle: metadata.metaTitle?.trim() ?? '',
    altText: metadata.altText?.trim() ?? '',
    caption: metadata.caption?.trim() ?? '',
    description: metadata.description?.trim() ?? '',
  };
}

function isCompleteMetadata(metadata: MediaMetadata) {
  return (
    metadata.metaTitle.length > 0 &&
    metadata.altText.length > 0 &&
    metadata.caption.length > 0 &&
    metadata.description.length > 0
  );
}

function normalizeMediaAssetBody(body: unknown) {
  const draft = mediaAssetDraftSchema.parse(body);
  const requestedSourceLocale: ArticleLocale = isArticleLocale(draft.sourceLocale)
    ? draft.sourceLocale
    : 'fr';

  const trimmedEntries = Object.fromEntries(
    articleLocales.map((locale) => [locale, trimMetadata(draft.metadata[locale])]),
  ) as MediaMetadataByLocale;

  const fallbackMetadata = isCompleteMetadata(trimmedEntries[requestedSourceLocale])
    ? trimmedEntries[requestedSourceLocale]
    : articleLocales.map((locale) => trimmedEntries[locale]).find(isCompleteMetadata);

  if (!fallbackMetadata) {
    throw new Error('Fill image metadata for at least one language before saving.');
  }

  const metadata = Object.fromEntries(
    articleLocales.map((locale) => [
      locale,
      isCompleteMetadata(trimmedEntries[locale]) ? trimmedEntries[locale] : fallbackMetadata,
    ]),
  ) as MediaMetadataByLocale;

  return mediaAssetSchema.parse({
    url: draft.url,
    fileName: draft.fileName,
    metadata,
  });
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if ('error' in authResult) return authResult.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const asset = await prisma.blogMediaAsset.findUnique({ where: { id } });
      if (!asset) {
        return createNoCacheResponse({ error: 'Media asset not found' }, 404);
      }
      return createNoCacheResponse({ asset: transformMediaAsset(asset) });
    }

    const assets = await prisma.blogMediaAsset.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return createNoCacheResponse({
      assets: assets.map(transformMediaAsset),
      total: assets.length,
    });
  } catch (error: unknown) {
    console.error('Error fetching media assets:', error);
    return createNoCacheResponse(
      { error: 'Failed to fetch media assets', message: error instanceof Error ? error.message : 'Unknown error' },
      500,
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if ('error' in authResult) return authResult.error;

    const body = await request.json();
    const validatedData = normalizeMediaAssetBody(body);

    const asset = await prisma.blogMediaAsset.create({
      data: {
        url: validatedData.url,
        fileName: validatedData.fileName || null,
        metadata: validatedData.metadata,
        createdBy: authResult.userId,
      },
    });

    return createNoCacheResponse(
      { message: 'Media asset created successfully', asset: transformMediaAsset(asset) },
      201,
    );
  } catch (error: unknown) {
    console.error('Error creating media asset:', error);

    if (error instanceof ZodError) {
      return createNoCacheResponse({ error: 'Validation error', details: error.issues }, 400);
    }

    if (error instanceof Error && error.message.includes('Fill image metadata')) {
      return createNoCacheResponse({ error: error.message }, 400);
    }

    return createNoCacheResponse(
      { error: 'Failed to create media asset', message: error instanceof Error ? error.message : 'Unknown error' },
      500,
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if ('error' in authResult) return authResult.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return createNoCacheResponse({ error: 'Media asset ID is required' }, 400);
    }

    const body = await request.json();
    const validatedData = normalizeMediaAssetBody(body);

    const asset = await prisma.blogMediaAsset.update({
      where: { id },
      data: {
        url: validatedData.url,
        fileName: validatedData.fileName || null,
        metadata: validatedData.metadata,
      },
    });

    return createNoCacheResponse({
      message: 'Media asset updated successfully',
      asset: transformMediaAsset(asset),
    });
  } catch (error: unknown) {
    console.error('Error updating media asset:', error);

    if (error instanceof ZodError) {
      return createNoCacheResponse({ error: 'Validation error', details: error.issues }, 400);
    }

    if (error instanceof Error && error.message.includes('Fill image metadata')) {
      return createNoCacheResponse({ error: error.message }, 400);
    }

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return createNoCacheResponse({ error: 'Media asset not found' }, 404);
    }

    return createNoCacheResponse(
      { error: 'Failed to update media asset', message: error instanceof Error ? error.message : 'Unknown error' },
      500,
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if ('error' in authResult) return authResult.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return createNoCacheResponse({ error: 'Media asset ID is required' }, 400);
    }

    const asset = await prisma.blogMediaAsset.delete({ where: { id } });

    return createNoCacheResponse({
      message: 'Media asset deleted successfully',
      deletedAsset: { id: asset.id, url: asset.url },
    });
  } catch (error: unknown) {
    console.error('Error deleting media asset:', error);

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return createNoCacheResponse({ error: 'Media asset not found' }, 404);
    }

    return createNoCacheResponse(
      { error: 'Failed to delete media asset', message: error instanceof Error ? error.message : 'Unknown error' },
      500,
    );
  }
}
