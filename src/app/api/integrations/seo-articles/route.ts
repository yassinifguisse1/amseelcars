import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { UTApi } from 'uploadthing/server';
import { ZodError } from 'zod';
import { prisma } from '@/lib/prisma';
import { articleLocales } from '@/lib/validations/article';
import type { MediaMetadataByLocale } from '@/lib/validations/media';
import {
  downloadImportImage,
  fileNameFromUrl,
  isTrustedImportHostedImageUrl,
  normalizeSeoArticleImport,
  normalizedImageUrlKey,
  rewriteImportedImageSources,
  SEO_ARTICLE_IMPORT_SOURCE,
  type NormalizedSeoArticleImport,
  type SeoArticleImportImage,
} from '@/lib/seoArticleImport';
import { isValidSeoArticleImportAuthorization } from '@/lib/seoArticleImportAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const utapi = new UTApi();

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

function unauthorized() {
  return createNoCacheResponse({ error: 'Unauthorized' }, 401);
}

function getCreatedBy() {
  return process.env.SEO_ARTICLE_IMPORT_CREATED_BY?.trim() || 'seo-platform-webhook';
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

async function createUniqueFolderSlug(baseValue: string, excludeId?: string) {
  const base = slugify(baseValue) || `seo-article-images-${Date.now()}`;
  let slug = base;
  let index = 2;

  while (true) {
    const existing = await prisma.blogMediaFolder.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) return slug;

    slug = `${base}-${index}`;
    index += 1;
  }
}

async function ensureMediaFolder(article: NormalizedSeoArticleImport, createdBy: string) {
  const existing = await prisma.blogMediaFolder.findFirst({
    where: { translationGroup: article.translationGroup },
  });
  const folderName = `${article.title} images`;
  const folderSlug = await createUniqueFolderSlug(`${article.slug}-images`, existing?.id);

  if (existing) {
    return prisma.blogMediaFolder.update({
      where: { id: existing.id },
      data: {
        name: folderName,
        slug: folderSlug,
        description: `Images imported for article: ${article.slug}`,
        articleSlug: article.slug,
        translationGroup: article.translationGroup,
      },
    });
  }

  return prisma.blogMediaFolder.create({
    data: {
      name: folderName,
      slug: folderSlug,
      description: `Images imported for article: ${article.slug}`,
      articleSlug: article.slug,
      translationGroup: article.translationGroup,
      createdBy,
    },
  });
}

function fallbackImageMetadata(image: SeoArticleImportImage) {
  return {
    metaTitle: image.metaTitle || image.altText || 'Article image',
    altText: image.altText || image.metaTitle || 'Article image',
    caption: image.caption || image.altText || image.metaTitle || 'Article image',
    description: image.description || image.caption || image.altText || image.metaTitle || 'Article image',
  };
}

function createMediaMetadata(image: SeoArticleImportImage): MediaMetadataByLocale {
  const metadata = fallbackImageMetadata(image);
  return Object.fromEntries(
    articleLocales.map((entryLocale) => [entryLocale, metadata]),
  ) as MediaMetadataByLocale;
}

function uniqueImages(article: NormalizedSeoArticleImport) {
  const seen = new Set<string>();
  const images: SeoArticleImportImage[] = [];

  for (const image of [article.coverImage, ...article.bodyImages]) {
    const key = normalizedImageUrlKey(image.sourceUrl);
    if (seen.has(key)) continue;
    seen.add(key);
    images.push(image);
  }

  return images;
}

async function uploadArticleImages(article: NormalizedSeoArticleImport) {
  const images = uniqueImages(article);
  const alreadyHosted = images.filter((image) => isTrustedImportHostedImageUrl(image.sourceUrl));
  const imagesToUpload = images.filter((image) => !isTrustedImportHostedImageUrl(image.sourceUrl));
  const downloaded = await Promise.all(
    imagesToUpload.map((image, index) => downloadImportImage(image, `${article.slug}-${index + 1}`)),
  );

  const uploadedResults = await utapi.uploadFiles(
    downloaded.map((image) => image.file),
    { concurrency: 2 },
  );

  const uploaded = uploadedResults.map((result, index) => {
    if (result.error || !result.data) {
      throw new Error(result.error?.message || 'UploadThing image upload failed.');
    }

    return {
      sourceUrl: downloaded[index].sourceUrl,
      hostedUrl: result.data.ufsUrl || result.data.url,
      fileName: downloaded[index].file.name,
      metadata: downloaded[index].metadata,
    };
  });

  return [
    ...alreadyHosted.map((image, index) => ({
      sourceUrl: image.sourceUrl,
      hostedUrl: image.sourceUrl,
      fileName: fileNameFromUrl(image.sourceUrl, `${article.slug}-hosted-${index + 1}`, 'image/webp'),
      metadata: image,
    })),
    ...uploaded,
  ];
}

async function saveMediaAssets(input: {
  article: NormalizedSeoArticleImport;
  uploadedImages: Array<{
    hostedUrl: string;
    fileName: string;
    metadata: SeoArticleImportImage;
  }>;
  createdBy: string;
}) {
  const folder = await ensureMediaFolder(input.article, input.createdBy);

  await Promise.all(
    input.uploadedImages.map(async (image) => {
      const existing = await prisma.blogMediaAsset.findFirst({
        where: { url: image.hostedUrl, folderId: folder.id },
        select: { id: true, metadata: true },
      });
      const metadata = existing
        ? {
            ...(existing.metadata as Record<string, unknown>),
            [input.article.locale]: fallbackImageMetadata(image.metadata),
          }
        : createMediaMetadata(image.metadata);

      const data = {
        url: image.hostedUrl,
        fileName: image.fileName || null,
        folderId: folder.id,
        folderName: folder.name,
        metadata: metadata as Prisma.InputJsonValue,
      };

      if (existing) {
        return prisma.blogMediaAsset.update({
          where: { id: existing.id },
          data,
        });
      }

      return prisma.blogMediaAsset.create({
        data: {
          ...data,
          createdBy: input.createdBy,
        },
      });
    }),
  );

  return folder;
}

export async function POST(request: NextRequest) {
  try {
    if (!isValidSeoArticleImportAuthorization(request.headers.get('authorization'))) {
      return unauthorized();
    }

    const body = await request.json();
    const normalizedArticle = normalizeSeoArticleImport(body);
    const createdBy = getCreatedBy();

    const existingImportedArticle = normalizedArticle.externalId
      ? await prisma.blogArticle.findFirst({
          where: {
            externalId: normalizedArticle.externalId,
            locale: normalizedArticle.locale,
            importSource: SEO_ARTICLE_IMPORT_SOURCE,
          },
        })
      : null;

    if (existingImportedArticle?.translationGroup) {
      normalizedArticle.translationGroup = existingImportedArticle.translationGroup;
    }

    const slugConflict = await prisma.blogArticle.findFirst({
      where: {
        slug: normalizedArticle.slug,
        locale: normalizedArticle.locale,
      },
      select: { id: true, slug: true, locale: true },
    });
    if (slugConflict && slugConflict.id !== existingImportedArticle?.id) {
      return createNoCacheResponse(
        {
          error: 'Article slug already exists for this locale.',
          slug: slugConflict.slug,
          locale: slugConflict.locale,
        },
        409,
      );
    }

    const uploadedImages = await uploadArticleImages(normalizedArticle);
    const coverUpload = uploadedImages.find(
      (image) => normalizedImageUrlKey(image.sourceUrl) === normalizedImageUrlKey(normalizedArticle.coverImage.sourceUrl),
    );

    if (!coverUpload) {
      throw new Error('Cover image upload did not complete.');
    }

    const rewrittenContent = rewriteImportedImageSources(normalizedArticle.content, uploadedImages);

    const mediaFolder = await saveMediaAssets({
      article: normalizedArticle,
      uploadedImages,
      createdBy,
    });

    const articleData = {
      slug: normalizedArticle.slug,
      locale: normalizedArticle.locale,
      translationGroup: normalizedArticle.translationGroup,
      translationSourceLocale: normalizedArticle.locale,
      externalId: normalizedArticle.externalId || null,
      importSource: SEO_ARTICLE_IMPORT_SOURCE,
      importedAt: new Date(),
      publicationCallback: normalizedArticle.publicationCallback || null,
      title: normalizedArticle.title,
      content: rewrittenContent,
      category: normalizedArticle.category,
      readTime: normalizedArticle.readTime,
      date: normalizedArticle.date,
      publishedAt: normalizedArticle.publishedAt,
      image: coverUpload.hostedUrl,
      imageMetaTitle: normalizedArticle.coverImage.metaTitle,
      altText: normalizedArticle.coverImage.altText,
      caption: normalizedArticle.coverImage.caption,
      imageDescription: normalizedArticle.coverImage.description,
      description: normalizedArticle.description,
      featured: normalizedArticle.featured,
      published:
        existingImportedArticle?.published ??
        normalizedArticle.locale === 'fr',
      indexable: normalizedArticle.indexable,
      tags: normalizedArticle.tags,
      author: normalizedArticle.author,
      seo: normalizedArticle.seo,
    };
    const article = existingImportedArticle
      ? await prisma.blogArticle.update({
          where: { id: existingImportedArticle.id },
          data: articleData,
        })
      : await prisma.blogArticle.create({
          data: {
            ...articleData,
            createdBy,
          },
        });

    return createNoCacheResponse(
      {
        message: existingImportedArticle
          ? 'Imported article source draft updated successfully.'
          : 'Imported article source draft created successfully.',
        article: {
          id: article.id,
          slug: article.slug,
          locale: article.locale,
          published: article.published,
          indexable: article.indexable,
        },
        mediaFolder: {
          id: mediaFolder.id,
          name: mediaFolder.name,
        },
      },
      existingImportedArticle ? 200 : 201,
    );
  } catch (error: unknown) {
    console.error('[seo-articles import] Error:', error);

    if (error instanceof ZodError) {
      return createNoCacheResponse({ error: 'Validation error', details: error.issues }, 400);
    }

    if (error instanceof SyntaxError) {
      return createNoCacheResponse({ error: 'Invalid JSON payload.' }, 400);
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message.includes('SEO_ARTICLE_IMPORT_TOKEN') ? 500 : 400;

    return createNoCacheResponse(
      {
        error: status === 500 ? 'Import endpoint is not configured.' : 'Failed to import article.',
        message,
      },
      status,
    );
  }
}
