import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { isArticleLocale, type ArticleLocale } from '@/lib/validations/article';
import type { MediaMetadata } from '@/lib/validations/media';
import {
  normalizedImageUrlKey,
  SEO_ARTICLE_IMPORT_SOURCE,
  type SeoArticleImportImage,
} from '@/lib/seoArticleImport';
import {
  translateSeoArticleDraft,
  type SeoArticleTranslationSource,
} from '@/lib/seoArticleTranslation';

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

export type PersistTranslatedArticleInput = {
  sourceArticleId: string;
  targetLocale: ArticleLocale;
  overwrite?: boolean;
  published?: boolean;
  createdBy: string;
};

/**
 * Translate one locale from an SEO Nexus imported source article and save it.
 */
export async function persistTranslatedArticleFromSource(input: PersistTranslatedArticleInput) {
  const requestedArticle = await prisma.blogArticle.findUnique({
    where: { id: input.sourceArticleId },
  });
  if (!requestedArticle) {
    throw new Error('Source article not found.');
  }
  if (requestedArticle.importSource !== SEO_ARTICLE_IMPORT_SOURCE) {
    throw new Error('Translations are available only for SEO Nexus imported articles.');
  }
  const translationGroup = requestedArticle.translationGroup;
  if (!translationGroup) {
    throw new Error('Imported article is missing its translation group.');
  }

  const requestedSourceLocale = requestedArticle.translationSourceLocale ?? undefined;
  const sourceLocale: ArticleLocale = isArticleLocale(requestedSourceLocale)
    ? requestedSourceLocale
    : isArticleLocale(requestedArticle.locale)
      ? requestedArticle.locale
      : 'fr';
  if (input.targetLocale === sourceLocale) {
    throw new Error('The source locale does not need translation.');
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
    throw new Error('Original imported source article not found.');
  }

  const existingTranslation = await prisma.blogArticle.findFirst({
    where: {
      translationGroup,
      locale: input.targetLocale,
    },
  });
  if (existingTranslation && !input.overwrite) {
    throw new Error(
      `A ${input.targetLocale.toUpperCase()} translation already exists. Confirm regeneration to overwrite it.`,
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
  const relevantMediaAssets = mediaAssets.filter((asset) =>
    bodyImageKeys.has(normalizedImageUrlKey(asset.url)),
  );
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
    throw new Error(
      `Translated slug already exists for ${input.targetLocale.toUpperCase()}: ${translated.slug}`,
    );
  }

  const published = input.published ?? false;
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
    published,
    indexable: published || Boolean(sourceArticle.indexable),
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
          createdBy: input.createdBy,
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
  return {
    article,
    created: !existingTranslation,
    sourceLocale,
  };
}

/**
 * Generate every missing locale for a family and optionally publish them.
 * Runs with limited concurrency to stay within function time limits.
 */
export async function generateMissingLocalesForImport(input: {
  sourceArticleId: string;
  sourceLocale: ArticleLocale;
  targetLocales: ArticleLocale[];
  published: boolean;
  createdBy: string;
  concurrency?: number;
}) {
  const results: Array<{
    locale: ArticleLocale;
    ok: boolean;
    created?: boolean;
    error?: string;
    article?: { id: string; slug: string; locale: string; published: boolean | null };
  }> = [];

  let nextIndex = 0;
  const concurrency = Math.max(1, Math.min(input.concurrency ?? 2, input.targetLocales.length || 1));

  async function worker() {
    while (nextIndex < input.targetLocales.length) {
      const locale = input.targetLocales[nextIndex];
      nextIndex += 1;
      try {
        const saved = await persistTranslatedArticleFromSource({
          sourceArticleId: input.sourceArticleId,
          targetLocale: locale,
          overwrite: false,
          published: input.published,
          createdBy: input.createdBy,
        });
        results.push({
          locale,
          ok: true,
          created: saved.created,
          article: {
            id: saved.article.id,
            slug: saved.article.slug,
            locale: saved.article.locale,
            published: saved.article.published,
          },
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Translation failed.';
        // Already exists is fine on re-import — skip quietly.
        if (/already exists/i.test(message)) {
          results.push({ locale, ok: true, created: false, error: message });
          continue;
        }
        results.push({ locale, ok: false, error: message });
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}
