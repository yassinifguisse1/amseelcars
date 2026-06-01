import { generateText, Output } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import type { ArticleLocale } from '@/lib/validations/article';
import {
  normalizedImageUrlKey,
  rewriteImportedImageSources,
  sanitizeArticleHtml,
  type SeoArticleImportImage,
} from '@/lib/seoArticleImport';

export const DEFAULT_SEO_ARTICLE_TRANSLATION_MODEL = 'gpt-4o-mini';

const localeLanguageNames: Record<ArticleLocale, string> = {
  fr: 'French',
  en: 'English',
  es: 'Spanish',
  de: 'German',
  pl: 'Polish',
};

const localeDateFormats: Record<ArticleLocale, string> = {
  fr: 'fr-FR',
  en: 'en-US',
  es: 'es-ES',
  de: 'de-DE',
  pl: 'pl-PL',
};

// OpenAI structured outputs reject the JSON Schema `format: "uri"` emitted by `.url()`,
// so the model-facing schema keeps this as a plain string and we validate it after parsing.
const translatedImageOutputSchema = z.object({
  sourceUrl: z.string().trim().min(1),
  metaTitle: z.string().trim().min(1),
  altText: z.string().trim().min(1),
  caption: z.string().trim().min(1),
  description: z.string().trim().min(1),
});

const translatedImageSchema = translatedImageOutputSchema.extend({
  sourceUrl: z.string().url(),
});

const translatedArticleMetadataOutputSchema = z.object({
  slug: z.string().trim().min(1),
  title: z.string().trim().min(1),
  category: z.string().trim().min(1),
  description: z.string().trim().min(1),
  tags: z.array(z.string().trim().min(1)).min(1),
  seo: z.object({
    metaTitle: z.string().trim().min(1),
    metaDescription: z.string().trim().min(1),
    keywords: z.array(z.string().trim().min(1)).min(1),
  }),
  images: z.array(translatedImageOutputSchema).min(1),
  authorBio: z.string().trim().min(1),
});

const translatedArticleMetadataSchema = translatedArticleMetadataOutputSchema.extend({
  images: z.array(translatedImageSchema).min(1),
});

const translatedHtmlSegmentsOutputSchema = z.object({
  segments: z.array(
    z.object({
      id: z.string().trim().min(1),
      text: z.string().trim().min(1),
    }),
  ).min(1),
});

const MAX_HTML_SEGMENT_BATCH_CHARACTERS = 6000;
const HTML_SEGMENT_TRANSLATION_CONCURRENCY = 3;

export interface SeoArticleTranslationSource {
  locale: ArticleLocale;
  slug: string;
  title: string;
  content: string;
  category: string;
  description: string;
  tags: string[];
  publishedAt: Date;
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  images: SeoArticleImportImage[];
}

export interface TranslatedSeoArticleDraft {
  locale: ArticleLocale;
  slug: string;
  title: string;
  content: string;
  category: string;
  description: string;
  tags: string[];
  readTime: string;
  date: string;
  author: SeoArticleTranslationSource['author'];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    canonical: string;
  };
  images: SeoArticleImportImage[];
}

export function getSeoArticleTranslationModel() {
  return process.env.SEO_ARTICLE_TRANSLATION_MODEL?.trim() || DEFAULT_SEO_ARTICLE_TRANSLATION_MODEL;
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

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function estimateReadTime(content: string) {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min`;
}

function formatDisplayDate(date: Date, locale: ArticleLocale) {
  return new Intl.DateTimeFormat(localeDateFormats[locale], {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function imageSources(html: string) {
  return [...html.matchAll(/<img\b[^>]*\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*>/gi)]
    .map((match) => normalizedImageUrlKey(match[1] || match[2] || ''))
    .filter(Boolean)
    .sort();
}

function htmlStructure(html: string) {
  return [...html.matchAll(/<\s*(\/?)\s*([a-z0-9-]+)\b[^>]*>/gi)]
    .map((match) => `${match[1] ? '/' : ''}${match[2].toLowerCase()}`);
}

function linkTargets(html: string) {
  return [...html.matchAll(/<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*>/gi)]
    .map((match) => (match[1] || match[2] || '').trim());
}

interface HtmlTextSegment {
  id: string;
  text: string;
  start: number;
  end: number;
}

class HtmlSegmentTranslationMismatchError extends Error {}

function extractHtmlTextSegments(html: string) {
  const segments: HtmlTextSegment[] = [];
  const tagsAndComments = /<!--[\s\S]*?-->|<[^>]+>/g;
  let cursor = 0;

  const addTextSegment = (start: number, end: number) => {
    const rawText = html.slice(start, end);
    const match = rawText.match(/^(\s*)([\s\S]*?)(\s*)$/);
    const text = match?.[2] ?? '';
    if (!text) return;
    const leadingWhitespaceLength = match?.[1].length ?? 0;
    segments.push({
      id: `segment-${segments.length + 1}`,
      text,
      start: start + leadingWhitespaceLength,
      end: start + leadingWhitespaceLength + text.length,
    });
  };

  for (const match of html.matchAll(tagsAndComments)) {
    addTextSegment(cursor, match.index);
    cursor = match.index + match[0].length;
  }
  addTextSegment(cursor, html.length);

  return segments;
}

function chunkHtmlTextSegments(segments: HtmlTextSegment[]) {
  const chunks: HtmlTextSegment[][] = [];
  let currentChunk: HtmlTextSegment[] = [];
  let currentCharacters = 0;

  for (const segment of segments) {
    if (
      currentChunk.length > 0 &&
      currentCharacters + segment.text.length > MAX_HTML_SEGMENT_BATCH_CHARACTERS
    ) {
      chunks.push(currentChunk);
      currentChunk = [];
      currentCharacters = 0;
    }
    currentChunk.push(segment);
    currentCharacters += segment.text.length;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function escapeHtmlText(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function assertTranslatedHtmlSegmentsPreserved(
  sourceSegments: HtmlTextSegment[],
  translatedSegments: z.infer<typeof translatedHtmlSegmentsOutputSchema>['segments'],
) {
  const sourceIds = new Set(sourceSegments.map((segment) => segment.id));
  const translatedIds = new Set<string>();

  for (const segment of translatedSegments) {
    if (!sourceIds.has(segment.id) || translatedIds.has(segment.id)) {
      throw new HtmlSegmentTranslationMismatchError(
        'OpenAI translation changed, duplicated, or added an article text segment.',
      );
    }
    translatedIds.add(segment.id);
  }

  if (translatedIds.size !== sourceIds.size) {
    throw new HtmlSegmentTranslationMismatchError('OpenAI translation omitted an article text segment.');
  }
}

function rebuildTranslatedHtml(
  sourceContent: string,
  sourceSegments: HtmlTextSegment[],
  translatedSegments: z.infer<typeof translatedHtmlSegmentsOutputSchema>['segments'],
) {
  assertTranslatedHtmlSegmentsPreserved(sourceSegments, translatedSegments);
  const translatedById = new Map(translatedSegments.map((segment) => [segment.id, segment.text]));
  let cursor = 0;
  let content = '';

  for (const segment of sourceSegments) {
    content += sourceContent.slice(cursor, segment.start);
    content += escapeHtmlText(translatedById.get(segment.id) ?? segment.text);
    cursor = segment.end;
  }

  return content + sourceContent.slice(cursor);
}

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  mapper: (value: T, index: number) => Promise<R>,
) {
  const results = new Array<R>(values.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(values[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, () => worker()),
  );
  return results;
}

async function translateHtmlSegmentBatch(
  model: string,
  sourceLocale: ArticleLocale,
  targetLocale: ArticleLocale,
  segments: HtmlTextSegment[],
  splitDepth = 0,
): Promise<z.infer<typeof translatedHtmlSegmentsOutputSchema>['segments']> {
  const { output } = await generateText({
    model: openai(model),
    output: Output.object({
      name: 'LocalizedSeoArticleHtmlSegments',
      description: 'Translated text nodes for an SEO article while preserving every segment identifier.',
      schema: translatedHtmlSegmentsOutputSchema,
    }),
    system: [
      'You are a professional multilingual SEO editor for a premium car rental website in Agadir, Morocco.',
      'Translate every provided text segment naturally for local search intent.',
      'Preserve every id exactly and return every segment once in the original order.',
      'Return plain text only inside each text field. Do not add HTML, Markdown, sections, links, or claims.',
      'Preserve factual meaning and brand names.',
    ].join(' '),
    prompt: JSON.stringify({
      task: `Translate every article text segment from ${localeLanguageNames[sourceLocale]} to ${localeLanguageNames[targetLocale]}.`,
      targetLocale,
      segments: segments.map(({ id, text }) => ({ id, text })),
    }),
    maxOutputTokens: 6000,
  });

  const translatedSegments = translatedHtmlSegmentsOutputSchema.parse(output).segments;
  try {
    assertTranslatedHtmlSegmentsPreserved(segments, translatedSegments);
    return translatedSegments;
  } catch (error: unknown) {
    if (
      error instanceof HtmlSegmentTranslationMismatchError &&
      splitDepth < 2 &&
      segments.length > 1
    ) {
      const midpoint = Math.ceil(segments.length / 2);
      const translatedHalves = await Promise.all([
        translateHtmlSegmentBatch(model, sourceLocale, targetLocale, segments.slice(0, midpoint), splitDepth + 1),
        translateHtmlSegmentBatch(model, sourceLocale, targetLocale, segments.slice(midpoint), splitDepth + 1),
      ]);
      return translatedHalves.flat();
    }
    throw error;
  }
}

async function translateArticleHtml(
  model: string,
  sourceLocale: ArticleLocale,
  targetLocale: ArticleLocale,
  sourceContent: string,
) {
  const sourceSegments = extractHtmlTextSegments(sourceContent);
  if (sourceSegments.length === 0) {
    return sourceContent;
  }

  const chunks = chunkHtmlTextSegments(sourceSegments);
  const translatedChunks = await mapWithConcurrency(
    chunks,
    HTML_SEGMENT_TRANSLATION_CONCURRENCY,
    (chunk) => translateHtmlSegmentBatch(model, sourceLocale, targetLocale, chunk),
  );

  return rebuildTranslatedHtml(sourceContent, sourceSegments, translatedChunks.flat());
}

async function translateArticleMetadata(
  model: string,
  source: SeoArticleTranslationSource,
  targetLocale: ArticleLocale,
) {
  const { output } = await generateText({
    model: openai(model),
    output: Output.object({
      name: 'LocalizedSeoArticleMetadata',
      description: 'Localized metadata for one translated SEO article.',
      schema: translatedArticleMetadataOutputSchema,
    }),
    system: [
      'You are a professional multilingual SEO editor for a premium car rental website in Agadir, Morocco.',
      'Translate naturally for local search intent. Preserve factual meaning, image URLs, and brand names.',
      'Do not add claims, links, or images. Return every requested field in the target language.',
      'Keep every image sourceUrl unchanged and return images in the original order.',
      'Return exactly one images entry for each source image, including the cover image.',
      'Create a concise lowercase ASCII URL slug using hyphens only.',
    ].join(' '),
    prompt: JSON.stringify({
      task: `Translate this article metadata from ${localeLanguageNames[source.locale]} to ${localeLanguageNames[targetLocale]}.`,
      targetLocale,
      imageRequirements: {
        count: source.images.length,
        sourceUrls: source.images.map((image) => image.sourceUrl),
      },
      article: {
        slug: source.slug,
        title: source.title,
        category: source.category,
        description: source.description,
        tags: source.tags,
        author: source.author,
        seo: source.seo,
        images: source.images,
      },
    }),
    maxOutputTokens: 5000,
  });

  return translatedArticleMetadataSchema.parse(output);
}

function assertHtmlStructureAndLinksPreserved(sourceContent: string, translatedContent: string) {
  const sourceStructure = htmlStructure(sourceContent);
  const translatedStructure = htmlStructure(translatedContent);
  if (
    sourceStructure.length !== translatedStructure.length ||
    sourceStructure.some((tag, index) => tag !== translatedStructure[index])
  ) {
    throw new Error('OpenAI translation changed the article HTML structure.');
  }

  const sourceLinks = linkTargets(sourceContent);
  const translatedLinks = linkTargets(translatedContent);
  if (
    sourceLinks.length !== translatedLinks.length ||
    sourceLinks.some((link, index) => link !== translatedLinks[index])
  ) {
    throw new Error('OpenAI translation changed or removed an article link.');
  }
}

function assertContentImageSourcesPreserved(sourceContent: string, translatedContent: string) {
  const sourceImages = imageSources(sourceContent);
  const translatedImages = imageSources(translatedContent);
  if (
    sourceImages.length !== translatedImages.length ||
    sourceImages.some((sourceImage, index) => sourceImage !== translatedImages[index])
  ) {
    throw new Error('OpenAI translation changed or removed an article image URL.');
  }
}

function assertTranslatedImagesPreserved(
  sourceImages: SeoArticleImportImage[],
  translatedImages: z.infer<typeof translatedImageSchema>[],
) {
  for (const [index, sourceImage] of sourceImages.entries()) {
    if (!translatedImages[index]) {
      throw new Error('OpenAI translation omitted a media image entry.');
    }
    if (normalizedImageUrlKey(sourceImage.sourceUrl) !== normalizedImageUrlKey(translatedImages[index].sourceUrl)) {
      throw new Error('OpenAI translation changed a media image URL.');
    }
  }
}

function fallbackTranslatedImage(sourceImage: SeoArticleImportImage): z.infer<typeof translatedImageSchema> {
  return {
    sourceUrl: sourceImage.sourceUrl,
    metaTitle: sourceImage.metaTitle.trim() || sourceImage.altText.trim() || 'Article image',
    altText: sourceImage.altText.trim() || sourceImage.metaTitle.trim() || 'Article image',
    caption: sourceImage.caption.trim() || sourceImage.altText.trim() || sourceImage.metaTitle.trim() || 'Article image',
    description:
      sourceImage.description.trim() ||
      sourceImage.caption.trim() ||
      sourceImage.altText.trim() ||
      sourceImage.metaTitle.trim() ||
      'Article image',
  };
}

function mergeTranslatedImages(
  sourceImages: SeoArticleImportImage[],
  translatedImages: z.infer<typeof translatedImageSchema>[],
) {
  const sourceKeys = new Set(sourceImages.map((image) => normalizedImageUrlKey(image.sourceUrl)));
  const translatedByUrl = new Map<string, z.infer<typeof translatedImageSchema>>();
  const unexpectedSourceUrls: string[] = [];

  for (const image of translatedImages) {
    const key = normalizedImageUrlKey(image.sourceUrl);
    if (!sourceKeys.has(key)) {
      unexpectedSourceUrls.push(image.sourceUrl);
      continue;
    }
    if (!translatedByUrl.has(key)) {
      translatedByUrl.set(key, image);
    }
  }

  const missingSourceUrls: string[] = [];
  const images = sourceImages.map((sourceImage) => {
    const key = normalizedImageUrlKey(sourceImage.sourceUrl);
    const translatedImage = translatedByUrl.get(key);
    if (!translatedImage) {
      missingSourceUrls.push(sourceImage.sourceUrl);
      return fallbackTranslatedImage(sourceImage);
    }

    return {
      sourceUrl: sourceImage.sourceUrl,
      metaTitle: translatedImage.metaTitle,
      altText: translatedImage.altText,
      caption: translatedImage.caption,
      description: translatedImage.description,
    };
  });

  return {
    images,
    missingSourceUrls,
    unexpectedSourceUrls,
  };
}

export async function translateSeoArticleDraft(
  source: SeoArticleTranslationSource,
  targetLocale: ArticleLocale,
): Promise<TranslatedSeoArticleDraft> {
  const model = getSeoArticleTranslationModel();
  const startedAt = Date.now();
  console.info('[seo article translation] Starting translation.', {
    model,
    sourceLocale: source.locale,
    targetLocale,
  });

  try {
    const [translatedArticle, translatedHtml] = await Promise.all([
      translateArticleMetadata(model, source, targetLocale),
      translateArticleHtml(model, source.locale, targetLocale, source.content),
    ]);

    let content = sanitizeArticleHtml(translatedHtml);
    if (!stripHtml(content)) {
      throw new Error('OpenAI translation returned empty article content.');
    }
    assertHtmlStructureAndLinksPreserved(source.content, content);
    assertContentImageSourcesPreserved(source.content, content);
    const exactImageCountReturned = translatedArticle.images.length === source.images.length;
    if (exactImageCountReturned) {
      assertTranslatedImagesPreserved(source.images, translatedArticle.images);
    }

    const { images, missingSourceUrls, unexpectedSourceUrls } = mergeTranslatedImages(source.images, translatedArticle.images);
    if (missingSourceUrls.length || unexpectedSourceUrls.length) {
      console.warn('[seo article translation] Normalized translated image metadata.', {
        model,
        sourceLocale: source.locale,
        targetLocale,
        expectedCount: source.images.length,
        returnedCount: translatedArticle.images.length,
        missingSourceUrls,
        unexpectedSourceUrls,
      });
    }
    content = rewriteImportedImageSources(
      content,
      images.map((image) => ({
        sourceUrl: image.sourceUrl,
        hostedUrl: image.sourceUrl,
        metadata: image,
      })),
      { replaceMetadata: true },
    );

    const slug = slugify(translatedArticle.slug || translatedArticle.title);
    const categorySlug = slugify(translatedArticle.category);
    if (!slug || !categorySlug) {
      throw new Error('OpenAI translation returned an invalid slug or category.');
    }

    console.info('[seo article translation] Translation completed.', {
      model,
      sourceLocale: source.locale,
      targetLocale,
      durationMs: Date.now() - startedAt,
    });

    return {
      locale: targetLocale,
      slug,
      title: translatedArticle.title,
      content,
      category: translatedArticle.category,
      description: translatedArticle.description,
      tags: uniqueStrings(translatedArticle.tags),
      readTime: estimateReadTime(content),
      date: formatDisplayDate(source.publishedAt, targetLocale),
      author: {
        ...source.author,
        bio: translatedArticle.authorBio,
      },
      seo: {
        metaTitle: translatedArticle.seo.metaTitle,
        metaDescription: translatedArticle.seo.metaDescription,
        keywords: uniqueStrings(translatedArticle.seo.keywords),
        canonical: `/${targetLocale}/blog/${categorySlug}/${slug}`,
      },
      images,
    };
  } catch (error: unknown) {
    console.error('[seo article translation] Translation failed.', {
      model,
      sourceLocale: source.locale,
      targetLocale,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}
