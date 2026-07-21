import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { UTApi } from 'uploadthing/server';
import { ZodError } from 'zod';
import { prisma } from '@/lib/prisma';
import { articleLocales, isArticleLocale, type ArticleLocale } from '@/lib/validations/article';
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
const AMSEEL_TRANSLATION_LOCALES = ['fr', 'es', 'de', 'pl'] as const;

type IncomingArticle = {
  article: NormalizedSeoArticleImport;
  publish: boolean;
};

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

function readRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Article import payload must be an object.');
  }
  return value as Record<string, unknown>;
}

function readString(record: Record<string, unknown>, key: string) {
  return typeof record[key] === 'string' ? record[key].trim() : '';
}

function readStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string').map((entry) => entry.trim()).filter(Boolean)
    : [];
}

function readKeywords(value: unknown) {
  if (typeof value === 'string') return value.split(',').map((entry) => entry.trim()).filter(Boolean);
  return readStringArray(value);
}

function shopyAdsArticleToNative(input: {
  record: Record<string, unknown>;
  locale: ArticleLocale;
  externalId: string;
  featuredImageUrl: string;
  publishedAt?: string;
  publish: boolean;
}) {
  const meta = readRecord(input.record.meta ?? {});
  const title = readString(input.record, 'title');
  const slug = readString(input.record, 'slug');
  const description = readString(input.record, 'excerpt') || readString(meta, 'description');
  const categories = readStringArray(input.record.categories);
  const keywords = readKeywords(input.record.keywords ?? meta.keywords);
  const featuredImageAlt = readString(input.record, 'featuredImageAlt') || title;
  const content = readString(input.record, 'html') || readString(input.record, 'content') || readString(input.record, 'markdown');

  return normalizeSeoArticleImport({
    externalId: input.externalId,
    locale: input.locale,
    slug,
    title,
    category: categories[0] || 'Car Rental',
    content,
    description: description || title,
    tags: keywords.length > 0 ? keywords : categories.length > 0 ? categories : [title],
    seo: {
      metaTitle: readString(input.record, 'metaTitle') || readString(meta, 'title') || title,
      metaDescription: readString(input.record, 'metaDescription') || readString(meta, 'description') || description || title,
      keywords: keywords.length > 0 ? keywords : [title],
    },
    coverImage: {
      sourceUrl: input.featuredImageUrl,
      metaTitle: title,
      altText: featuredImageAlt,
      caption: featuredImageAlt,
      description: featuredImageAlt,
    },
    bodyImages: [],
    publishedAt: input.publishedAt,
    indexable: input.publish,
  });
}

function normalizeIncomingArticles(body: unknown): { articles: IncomingArticle[]; sourceLocale: ArticleLocale } {
  const record = readRecord(body);
  if ('locale' in record && 'coverImage' in record) {
    const article = normalizeSeoArticleImport(record);
    return { articles: [{ article, publish: article.locale === 'fr' }], sourceLocale: article.locale };
  }

  const sourceLocaleValue = readString(record, 'language') || 'en';
  if (!isArticleLocale(sourceLocaleValue)) throw new Error(`Unsupported source locale: ${sourceLocaleValue}`);
  const featuredImageUrl = readString(record, 'featuredImageUrl');
  if (!featuredImageUrl) throw new Error('featuredImageUrl is required for Amseel imports.');
  const sourceSlug = readString(record, 'slug');
  const externalId = readString(record, 'externalId') || sourceSlug;
  if (!externalId) throw new Error('slug or externalId is required.');
  const publish = record.publish === true;
  const publishedAt = readString(record, 'publishedAt') || undefined;
  const sourceArticle = shopyAdsArticleToNative({
    record,
    locale: sourceLocaleValue,
    externalId,
    featuredImageUrl,
    publishedAt,
    publish,
  });

  const rawTranslations = Array.isArray(record.translations) ? record.translations : [];
  if (rawTranslations.length === 0) {
    return { articles: [{ article: sourceArticle, publish }], sourceLocale: sourceLocaleValue };
  }

  const translationsByLocale = new Map<ArticleLocale, Record<string, unknown>>();
  for (const value of rawTranslations) {
    const translation = readRecord(value);
    const locale = readString(translation, 'locale');
    if (!isArticleLocale(locale) || locale === sourceLocaleValue) {
      throw new Error(`Invalid translation locale: ${locale || '(empty)'}`);
    }
    if (translationsByLocale.has(locale)) throw new Error(`Duplicate translation locale: ${locale}`);
    translationsByLocale.set(locale, translation);
  }
  const missingLocales = AMSEEL_TRANSLATION_LOCALES.filter((locale) => !translationsByLocale.has(locale));
  if (sourceLocaleValue === 'en' && missingLocales.length > 0) {
    throw new Error(`Incomplete Amseel translation package. Missing: ${missingLocales.join(', ')}`);
  }

  const translatedArticles = [...translationsByLocale.entries()].map(([locale, translation]) => ({
    article: shopyAdsArticleToNative({
      record: translation,
      locale,
      externalId,
      featuredImageUrl,
      publishedAt,
      publish,
    }),
    publish,
  }));
  return {
    articles: [{ article: sourceArticle, publish }, ...translatedArticles],
    sourceLocale: sourceLocaleValue,
  };
}

async function importNormalizedArticle(
  input: IncomingArticle,
  sourceLocale: ArticleLocale,
  createdBy: string,
  translationGroup?: string,
) {
  const normalizedArticle = input.article;
  const existingImportedArticle = normalizedArticle.externalId
    ? await prisma.blogArticle.findFirst({
        where: {
          externalId: normalizedArticle.externalId,
          locale: normalizedArticle.locale,
          importSource: SEO_ARTICLE_IMPORT_SOURCE,
        },
      })
    : null;

  if (translationGroup) {
    normalizedArticle.translationGroup = translationGroup;
  } else if (existingImportedArticle?.translationGroup) {
    normalizedArticle.translationGroup = existingImportedArticle.translationGroup;
  }
  const slugConflict = await prisma.blogArticle.findFirst({
    where: { slug: normalizedArticle.slug, locale: normalizedArticle.locale },
    select: { id: true },
  });
  if (slugConflict && slugConflict.id !== existingImportedArticle?.id) {
    throw new Error(`Article slug already exists for ${normalizedArticle.locale}: ${normalizedArticle.slug}`);
  }

  const uploadedImages = await uploadArticleImages(normalizedArticle);
  const coverUpload = uploadedImages.find(
    (image) => normalizedImageUrlKey(image.sourceUrl) === normalizedImageUrlKey(normalizedArticle.coverImage.sourceUrl),
  );
  if (!coverUpload) throw new Error(`Cover image upload did not complete for ${normalizedArticle.locale}.`);
  const rewrittenContent = rewriteImportedImageSources(normalizedArticle.content, uploadedImages);
  const mediaFolder = await saveMediaAssets({ article: normalizedArticle, uploadedImages, createdBy });
  const articleData = {
    slug: normalizedArticle.slug,
    locale: normalizedArticle.locale,
    translationGroup: normalizedArticle.translationGroup,
    translationSourceLocale: sourceLocale,
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
    published: existingImportedArticle?.published ?? input.publish,
    indexable: normalizedArticle.indexable,
    tags: normalizedArticle.tags,
    author: normalizedArticle.author,
    seo: normalizedArticle.seo,
  };
  const article = existingImportedArticle
    ? await prisma.blogArticle.update({ where: { id: existingImportedArticle.id }, data: articleData })
    : await prisma.blogArticle.create({ data: { ...articleData, createdBy } });
  return { article, mediaFolder, created: !existingImportedArticle };
}

export async function POST(request: NextRequest) {
  try {
    if (!isValidSeoArticleImportAuthorization(request.headers.get('authorization'))) {
      return unauthorized();
    }

    const body = await request.json();
    const normalizedPackage = normalizeIncomingArticles(body);
    const createdBy = getCreatedBy();
    const imported: Awaited<ReturnType<typeof importNormalizedArticle>>[] = [];
    for (const incomingArticle of normalizedPackage.articles) {
      imported.push(
        await importNormalizedArticle(
          incomingArticle,
          normalizedPackage.sourceLocale,
          createdBy,
          imported[0]?.article.translationGroup ?? undefined,
        ),
      );
    }
    const sourceResult = imported[0];
    const sourceArticle = sourceResult.article;
    const articleUrl = (article: typeof sourceArticle) =>
      new URL(`/${article.locale}/blog/${slugify(article.category)}/${article.slug}`, request.nextUrl.origin).toString();

    return createNoCacheResponse(
      {
        success: true,
        id: sourceArticle.id,
        slug: sourceArticle.slug,
        language: sourceArticle.locale,
        status: sourceArticle.published ? 'published' : 'draft',
        url: articleUrl(sourceArticle),
        created: sourceResult.created,
        translations: imported.slice(1).map(({ article }) => ({
          language: article.locale,
          slug: article.slug,
          url: articleUrl(article),
        })),
        message: `Imported ${imported.length} linked article locale${imported.length === 1 ? '' : 's'} successfully.`,
        article: {
          id: sourceArticle.id,
          slug: sourceArticle.slug,
          locale: sourceArticle.locale,
          published: sourceArticle.published,
          indexable: sourceArticle.indexable,
        },
        mediaFolder: {
          id: sourceResult.mediaFolder.id,
          name: sourceResult.mediaFolder.name,
        },
      },
      sourceResult.created ? 201 : 200,
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
