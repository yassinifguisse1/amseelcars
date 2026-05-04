import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ZodError } from 'zod';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import {
  mediaFolderSchema,
  type BlogMediaFolder,
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function createUniqueSlug(baseValue: string, excludeId?: string) {
  const base = slugify(baseValue) || `media-folder-${Date.now()}`;
  let slug = base;
  let index = 2;

  while (true) {
    const existing = await prisma.blogMediaFolder.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) {
      return slug;
    }

    slug = `${base}-${index}`;
    index += 1;
  }
}

async function transformFolder(folder: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  articleSlug: string | null;
  translationGroup: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Promise<BlogMediaFolder> {
  const assetCount = await prisma.blogMediaAsset.count({
    where: { folderId: folder.id },
  });

  return {
    id: folder.id,
    name: folder.name,
    slug: folder.slug,
    description: folder.description ?? '',
    articleSlug: folder.articleSlug ?? '',
    translationGroup: folder.translationGroup ?? '',
    assetCount,
    createdAt: folder.createdAt.toISOString(),
    updatedAt: folder.updatedAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if ('error' in authResult) return authResult.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const folder = await prisma.blogMediaFolder.findUnique({ where: { id } });
      if (!folder) {
        return createNoCacheResponse({ error: 'Media folder not found' }, 404);
      }

      return createNoCacheResponse({ folder: await transformFolder(folder) });
    }

    const folders = await prisma.blogMediaFolder.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    return createNoCacheResponse({
      folders: await Promise.all(folders.map(transformFolder)),
      total: folders.length,
    });
  } catch (error: unknown) {
    console.error('Error fetching media folders:', error);
    return createNoCacheResponse(
      { error: 'Failed to fetch media folders', message: error instanceof Error ? error.message : 'Unknown error' },
      500,
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if ('error' in authResult) return authResult.error;

    const body = await request.json();
    const validatedData = mediaFolderSchema.parse(body);
    const slug = await createUniqueSlug(validatedData.slug || validatedData.articleSlug || validatedData.name);

    const folder = await prisma.blogMediaFolder.create({
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description || null,
        articleSlug: validatedData.articleSlug || null,
        translationGroup: validatedData.translationGroup || null,
        createdBy: authResult.userId,
      },
    });

    return createNoCacheResponse(
      { message: 'Media folder created successfully', folder: await transformFolder(folder) },
      201,
    );
  } catch (error: unknown) {
    console.error('Error creating media folder:', error);

    if (error instanceof ZodError) {
      return createNoCacheResponse({ error: 'Validation error', details: error.issues }, 400);
    }

    return createNoCacheResponse(
      { error: 'Failed to create media folder', message: error instanceof Error ? error.message : 'Unknown error' },
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
      return createNoCacheResponse({ error: 'Media folder ID is required' }, 400);
    }

    const body = await request.json();
    const validatedData = mediaFolderSchema.parse(body);
    const slug = await createUniqueSlug(validatedData.slug || validatedData.articleSlug || validatedData.name, id);

    const folder = await prisma.blogMediaFolder.update({
      where: { id },
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description || null,
        articleSlug: validatedData.articleSlug || null,
        translationGroup: validatedData.translationGroup || null,
      },
    });

    await prisma.blogMediaAsset.updateMany({
      where: { folderId: id },
      data: { folderName: folder.name },
    });

    return createNoCacheResponse({
      message: 'Media folder updated successfully',
      folder: await transformFolder(folder),
    });
  } catch (error: unknown) {
    console.error('Error updating media folder:', error);

    if (error instanceof ZodError) {
      return createNoCacheResponse({ error: 'Validation error', details: error.issues }, 400);
    }

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return createNoCacheResponse({ error: 'Media folder not found' }, 404);
    }

    return createNoCacheResponse(
      { error: 'Failed to update media folder', message: error instanceof Error ? error.message : 'Unknown error' },
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
      return createNoCacheResponse({ error: 'Media folder ID is required' }, 400);
    }

    const folder = await prisma.blogMediaFolder.delete({ where: { id } });

    await prisma.blogMediaAsset.updateMany({
      where: { folderId: id },
      data: {
        folderId: null,
        folderName: null,
      },
    });

    return createNoCacheResponse({
      message: 'Media folder deleted successfully',
      deletedFolder: { id: folder.id, name: folder.name },
    });
  } catch (error: unknown) {
    console.error('Error deleting media folder:', error);

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return createNoCacheResponse({ error: 'Media folder not found' }, 404);
    }

    return createNoCacheResponse(
      { error: 'Failed to delete media folder', message: error instanceof Error ? error.message : 'Unknown error' },
      500,
    );
  }
}

