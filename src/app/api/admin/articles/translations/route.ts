import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';
import { z, ZodError } from 'zod';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import { articleLocales, isArticleLocale, type ArticleLocale } from '@/lib/validations/article';
import type { MediaMetadata } from '@/lib/validations/media';
import {
  normalizedImageUrlKey,
  SEO_ARTICLE_IMPORT_SOURCE,
  type SeoArticleImportImage,
} from '@/lib/seoArticleImport';
import {
  getSeoArticleTranslationModel,
  translateSeoArticleDraft,
  type SeoArticleTranslationSource,
} from '@/lib/seoArticleTranslation';

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

function fallbackImageMetadata(image: {
  metaTitle?: string | null;
  altText?: string | null;
  caption?: string | null;
  description?: string | null;
}): MediaMetadata {
  return {
    metaTitle: image.metaTitle?.trim() || image.altText?.trim() || 'Article image',
    altText: image.altText?.trim() || image.metaTitle?.trim() || 'Article image',
    caption: image.caption?.trim() || image.altText?.trim() || image.metaTitle?.trim() || 'Article image',
    description:
      image.description?.trim() ||
      image.caption?.trim() ||
      image.altText?.trim() ||
      image.metaTitle?.trim() ||
      'Article image',
  };
}

function readMediaMetadata(value: Prisma.JsonValue, locale: ArticleLocale): MediaMetadata {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const byLocale = value as Record<string, unknown>;
    const localized = byLocale[locale];
    if (localized && typeof localized === 'object' && !Array.isArray(localized)) {
      return fallbackImageMetadata(localized as Record<string, string>);
    }
  }
  return fallbackImageMetadata({});
}

function uniqueImages(images: SeoArticleImportImage[]) {
  const seen = new Set<string>();
  return images.filter((image) => {
    const key = normalizedImageUrlKey(image.sourceUrl);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function imageUrlKeysFromHtml(html: string) {
  return new Set(
    [...html.matchAll(/<img\b[^>]*\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*>/gi)]
      .map((match) => normalizedImageUrlKey(match[1] || match[2] || ''))
      .filter(Boolean),
  );
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if ('error' in authResult) return authResult.error;

    const input = translationRequestSchema.parse(await request.json());
    const requestedArticle = await prisma.blogArticle.findUnique({
      where: { id: input.sourceArticleId },
    });
    if (!requestedArticle) {
      return createNoCacheResponse({ error: 'Source article not found.' }, 404);
    }
    if (requestedArticle.importSource !== SEO_ARTICLE_IMPORT_SOURCE) {
      return createNoCacheResponse({ error: 'Translations are available only for SEO Nexus imported drafts.' }, 400);
    }
    const translationGroup = requestedArticle.translationGroup;
    if (!translationGroup) {
      return createNoCacheResponse({ error: 'Imported article is missing its translation group.' }, 400);
    }

    const requestedSourceLocale = requestedArticle.translationSourceLocale ?? undefined;
    const sourceLocale: ArticleLocale = isArticleLocale(requestedSourceLocale)
      ? requestedSourceLocale
      : isArticleLocale(requestedArticle.locale)
        ? requestedArticle.locale
        : 'fr';
    if (input.targetLocale === sourceLocale) {
      return createNoCacheResponse({ error: 'The source locale does not need translation.' }, 400);
    }

    const sourceArticle =
      requestedArticle.locale === sourceLocale
        ? requestedArticle
        : await prisma.blogArticle.findFirst({
            where: {
              translationGroup,
              locale: sourceLocale,
              importSource: SEO_ARTICLE_IMPORT_SOURCE,
            },
          });
    if (!sourceArticle) {
      return createNoCacheResponse({ error: 'Original imported source article not found.' }, 404);
    }

    const existingTranslation = await prisma.blogArticle.findFirst({
      where: {
        translationGroup,
        locale: input.targetLocale,
      },
    });
    if (existingTranslation && !input.overwrite) {
      return createNoCacheResponse(
        { error: `A ${input.targetLocale.toUpperCase()} translation already exists. Confirm regeneration to overwrite it.` },
        409,
      );
    }

    const mediaFolder = await prisma.blogMediaFolder.findFirst({
      where: { translationGroup },
    });
    const mediaAssets = mediaFolder
      ? await prisma.blogMediaAsset.findMany({
          where: { folderId: mediaFolder.id },
          orderBy: { createdAt: 'asc' },
        })
      : [];
    const bodyImageKeys = imageUrlKeysFromHtml(sourceArticle.content);
    const relevantMediaAssets = mediaAssets.filter((asset) => bodyImageKeys.has(normalizedImageUrlKey(asset.url)));
    const sourceImages = uniqueImages([
      {
        sourceUrl: sourceArticle.image,
        metaTitle: sourceArticle.imageMetaTitle ?? '',
        altText: sourceArticle.altText,
        caption: sourceArticle.caption,
        description: sourceArticle.imageDescription ?? '',
      },
      ...relevantMediaAssets.map((asset) => ({
        sourceUrl: asset.url,
        ...readMediaMetadata(asset.metadata, sourceLocale),
      })),
    ]);

    const source: SeoArticleTranslationSource = {
      locale: sourceLocale,
      slug: sourceArticle.slug,
      title: sourceArticle.title,
      content: sourceArticle.content,
      category: sourceArticle.category,
      description: sourceArticle.description,
      tags: sourceArticle.tags,
      publishedAt: sourceArticle.publishedAt,
      author: sourceArticle.author as SeoArticleTranslationSource['author'],
      seo: sourceArticle.seo as SeoArticleTranslationSource['seo'],
      images: sourceImages,
    };
    const translated = await translateSeoArticleDraft(source, input.targetLocale);
    const translatedImagesByUrl = new Map(
      translated.images.map((image) => [normalizedImageUrlKey(image.sourceUrl), image]),
    );
    const translatedCover = translatedImagesByUrl.get(normalizedImageUrlKey(sourceArticle.image));
    if (!translatedCover) {
      throw new Error('Translated cover image metadata is missing.');
    }

    const slugConflict = await prisma.blogArticle.findFirst({
      where: {
        slug: translated.slug,
        locale: input.targetLocale,
      },
      select: { id: true },
    });
    if (slugConflict && slugConflict.id !== existingTranslation?.id) {
      return createNoCacheResponse(
        { error: `Translated slug already exists for ${input.targetLocale.toUpperCase()}: ${translated.slug}` },
        409,
      );
    }

    const articleData = {
      slug: translated.slug,
      locale: input.targetLocale,
      translationGroup,
      translationSourceLocale: sourceLocale,
      externalId: sourceArticle.externalId,
      importSource: SEO_ARTICLE_IMPORT_SOURCE,
      importedAt: sourceArticle.importedAt ?? new Date(),
      publicationCallback: null,
      title: translated.title,
      content: translated.content,
      category: translated.category,
      readTime: translated.readTime,
      date: translated.date,
      publishedAt: sourceArticle.publishedAt,
      image: sourceArticle.image,
      imageMetaTitle: translatedCover.metaTitle,
      altText: translatedCover.altText,
      caption: translatedCover.caption,
      imageDescription: translatedCover.description,
      description: translated.description,
      featured: sourceArticle.featured,
      published: false,
      indexable: sourceArticle.indexable,
      tags: translated.tags,
      author: translated.author,
      seo: translated.seo,
    };
    const articleOperation = existingTranslation
      ? prisma.blogArticle.update({
          where: { id: existingTranslation.id },
          data: articleData,
        })
      : prisma.blogArticle.create({
          data: {
            ...articleData,
            createdBy: authResult.userId,
          },
        });
    const mediaOperations = mediaAssets.flatMap((asset) => {
      const translatedImage = translatedImagesByUrl.get(normalizedImageUrlKey(asset.url));
      if (!translatedImage) return [];
      const metadata = {
        ...(asset.metadata as Record<string, unknown>),
        [input.targetLocale]: fallbackImageMetadata(translatedImage),
      };
      return [
        prisma.blogMediaAsset.update({
          where: { id: asset.id },
          data: { metadata: metadata as Prisma.InputJsonValue },
        }),
      ];
    });
    const [article] = await prisma.$transaction([articleOperation, ...mediaOperations]);

    return createNoCacheResponse(
      {
        message: `${input.targetLocale.toUpperCase()} translation ${existingTranslation ? 'regenerated' : 'created'} successfully.`,
        article: {
          id: article.id,
          slug: article.slug,
          locale: article.locale,
          published: article.published,
          translationGroup: article.translationGroup,
        },
        model: getSeoArticleTranslationModel(),
      },
      existingTranslation ? 200 : 201,
    );
  } catch (error: unknown) {
    console.error('[POST /api/admin/articles/translations] Translation failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (error instanceof ZodError) {
      return createNoCacheResponse({ error: 'Validation error', details: error.issues }, 400);
    }

    return createNoCacheResponse(
      {
        error: 'Failed to generate article translation.',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  }
}
