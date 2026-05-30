import { lookup } from 'dns/promises';
import { isIP } from 'net';
import { z } from 'zod';
import { articleLocales, type ArticleLocale } from '@/lib/validations/article';

export const SEO_ARTICLE_IMPORT_SOURCE = 'seo-article-platform';
export const MAX_IMPORT_BODY_IMAGES = 10;
export const MAX_IMPORT_IMAGE_BYTES = 4 * 1024 * 1024;
const IMAGE_FETCH_TIMEOUT_MS = 15000;
const MAX_REDIRECTS = 3;
const ALLOWED_IMAGE_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

export function isAllowedImportImageContentType(contentType: string) {
  return ALLOWED_IMAGE_CONTENT_TYPES.has(contentType.split(';')[0]?.trim().toLowerCase() || '');
}

export function isTrustedImportHostedImageUrl(sourceUrl: string) {
  try {
    const url = new URL(sourceUrl);
    return (
      url.protocol === 'https:' &&
      (url.hostname === 'utfs.io' || url.hostname.endsWith('.ufs.sh'))
    );
  } catch {
    return false;
  }
}

const importImageSchema = z.object({
  sourceUrl: z.string().url('Image sourceUrl must be a valid URL'),
  metaTitle: z.string().trim().optional().default(''),
  altText: z.string().trim().optional().default(''),
  caption: z.string().trim().optional().default(''),
  description: z.string().trim().optional().default(''),
});

const importAuthorSchema = z.object({
  name: z.string().trim().min(1).optional(),
  avatar: z.string().trim().optional().default(''),
  bio: z.string().trim().optional().default(''),
});

export const seoArticleImportSchema = z.object({
  externalId: z.string().trim().optional().default(''),
  locale: z.enum(articleLocales).default('fr'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  title: z.string().trim().min(1, 'Title is required'),
  category: z.string().trim().min(1, 'Category is required'),
  content: z.string().trim().min(1, 'Content is required'),
  description: z.string().trim().min(1, 'Description is required'),
  tags: z.array(z.string().trim().min(1)).min(1, 'At least one tag is required'),
  seo: z.object({
    metaTitle: z.string().trim().min(1, 'SEO metaTitle is required'),
    metaDescription: z.string().trim().min(1, 'SEO metaDescription is required'),
    keywords: z.array(z.string().trim().min(1)).min(1, 'At least one SEO keyword is required'),
    canonical: z.string().trim().optional().default(''),
  }),
  coverImage: importImageSchema.extend({
    metaTitle: z.string().trim().min(1, 'Cover image metaTitle is required'),
    altText: z.string().trim().min(1, 'Cover image altText is required'),
    caption: z.string().trim().min(1, 'Cover image caption is required'),
    description: z.string().trim().min(1, 'Cover image description is required'),
  }),
  bodyImages: z.array(importImageSchema).max(MAX_IMPORT_BODY_IMAGES).optional().default([]),
  readTime: z.string().trim().optional().default(''),
  publishedAt: z.string().datetime('publishedAt must be an ISO datetime').optional(),
  date: z.string().trim().optional().default(''),
  author: importAuthorSchema.optional(),
  featured: z.boolean().optional().default(false),
  indexable: z.boolean().optional(),
  publicationCallback: z
    .object({
      url: z.string().url('publicationCallback.url must be a valid URL'),
      secret: z.string().trim().min(1, 'publicationCallback.secret is required'),
      workspaceId: z.string().trim().min(1, 'publicationCallback.workspaceId is required'),
      pageId: z.string().trim().min(1, 'publicationCallback.pageId is required'),
    })
    .optional(),
});

export type SeoArticleImportPayload = z.infer<typeof seoArticleImportSchema>;
export type SeoArticleImportImage = SeoArticleImportPayload['coverImage'];

export interface DownloadedImportImage {
  sourceUrl: string;
  file: File;
  metadata: SeoArticleImportImage;
}

export interface NormalizedSeoArticleImport {
  externalId: string;
  locale: ArticleLocale;
  slug: string;
  translationGroup: string;
  title: string;
  content: string;
  category: string;
  readTime: string;
  date: string;
  publishedAt: Date;
  description: string;
  featured: boolean;
  indexable: boolean;
  tags: string[];
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    canonical: string;
  };
  coverImage: SeoArticleImportImage;
  bodyImages: SeoArticleImportImage[];
  publicationCallback?: {
    url: string;
    secret: string;
    workspaceId: string;
    pageId: string;
  };
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function estimateReadTime(content: string) {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min`;
}

function formatDisplayDate(date: Date, locale: ArticleLocale) {
  const localeMap: Record<ArticleLocale, string> = {
    fr: 'fr-FR',
    en: 'en-US',
    es: 'es-ES',
    de: 'de-DE',
    pl: 'pl-PL',
  };

  return new Intl.DateTimeFormat(localeMap[locale], {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function slugifyCategory(category: string) {
  return category
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function sanitizeArticleHtml(html: string) {
  return html
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|base|form|input|button|textarea|select|option)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|base|form|input|button|textarea|select|option)\b[^>]*\/?\s*>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s+(srcdoc|style)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s+(href|src)\s*=\s*(["'])\s*(?:javascript:|vbscript:|data:text\/html)[\s\S]*?\2/gi, '')
    .trim();
}

export function normalizeSeoArticleImport(body: unknown): NormalizedSeoArticleImport {
  const parsed = seoArticleImportSchema.parse(body);
  const publishedAt = parsed.publishedAt ? new Date(parsed.publishedAt) : new Date();
  const content = sanitizeArticleHtml(parsed.content);

  if (!stripHtml(content)) {
    throw new Error('Content is empty after sanitization.');
  }

  return {
    externalId: parsed.externalId,
    locale: parsed.locale,
    slug: parsed.slug,
    translationGroup: parsed.externalId || crypto.randomUUID(),
    title: parsed.title,
    content,
    category: parsed.category,
    readTime: parsed.readTime || estimateReadTime(content),
    date: parsed.date || formatDisplayDate(publishedAt, parsed.locale),
    publishedAt,
    description: parsed.description,
    featured: parsed.featured,
    indexable: parsed.indexable ?? false,
    tags: parsed.tags,
    author: {
      name: parsed.author?.name || 'Equipe AmseelCars',
      avatar: parsed.author?.avatar || '/images/team/amseel-team.jpg',
      bio: parsed.author?.bio || 'Experts en location de voitures premium a Agadir',
    },
    seo: {
      metaTitle: parsed.seo.metaTitle,
      metaDescription: parsed.seo.metaDescription,
      keywords: parsed.seo.keywords,
      canonical:
        parsed.seo.canonical ||
        `/${parsed.locale}/blog/${slugifyCategory(parsed.category)}/${parsed.slug}`,
    },
    coverImage: parsed.coverImage,
    bodyImages: parsed.bodyImages,
    publicationCallback: parsed.publicationCallback,
  };
}

function isPrivateIpv4(ip: string) {
  const parts = ip.split('.').map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return true;
  const [a, b] = parts;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isPrivateIpv6(ip: string) {
  const normalized = ip.toLowerCase();
  return (
    normalized === '::1' ||
    normalized === '::' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe80:') ||
    normalized.startsWith('::ffff:10.') ||
    normalized.startsWith('::ffff:127.') ||
    normalized.startsWith('::ffff:169.254.') ||
    normalized.startsWith('::ffff:192.168.')
  );
}

function isPrivateIpAddress(ip: string) {
  const family = isIP(ip);
  if (family === 4) return isPrivateIpv4(ip);
  if (family === 6) return isPrivateIpv6(ip);
  return true;
}

export async function assertSafeRemoteImageUrl(sourceUrl: string) {
  let url: URL;
  try {
    url = new URL(sourceUrl);
  } catch {
    throw new Error(`Invalid image URL: ${sourceUrl}`);
  }

  if (url.protocol !== 'https:') {
    throw new Error(`Image URL must use https: ${sourceUrl}`);
  }

  const hostname = url.hostname.toLowerCase();
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0'
  ) {
    throw new Error(`Image URL host is not allowed: ${sourceUrl}`);
  }

  if (isIP(hostname)) {
    if (isPrivateIpAddress(hostname)) {
      throw new Error(`Image URL IP is not allowed: ${sourceUrl}`);
    }
    return;
  }

  const addresses = await lookup(hostname, { all: true });
  if (!addresses.length || addresses.some((address) => isPrivateIpAddress(address.address))) {
    throw new Error(`Image URL resolves to a private or invalid address: ${sourceUrl}`);
  }
}

async function fetchImageWithRedirects(sourceUrl: string) {
  let currentUrl = sourceUrl;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    await assertSafeRemoteImageUrl(currentUrl);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), IMAGE_FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(currentUrl, {
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          Accept: 'image/avif,image/webp,image/apng,image/png,image/jpeg,image/gif,*/*;q=0.8',
        },
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) {
          throw new Error(`Image redirect missing Location header: ${sourceUrl}`);
        }
        currentUrl = new URL(location, currentUrl).toString();
        continue;
      }

      return response;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error(`Image URL has too many redirects: ${sourceUrl}`);
}

function fileExtensionFromContentType(contentType: string) {
  if (contentType.includes('png')) return 'png';
  if (contentType.includes('webp')) return 'webp';
  if (contentType.includes('gif')) return 'gif';
  if (contentType.includes('avif')) return 'avif';
  return 'jpg';
}

export function fileNameFromUrl(sourceUrl: string, fallbackBase: string, contentType: string) {
  const pathname = new URL(sourceUrl).pathname;
  const rawName = decodeURIComponent(pathname.split('/').filter(Boolean).pop() || '');
  const safeName = rawName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (safeName && /\.[a-z0-9]{2,5}$/i.test(safeName)) {
    return safeName.slice(0, 120);
  }

  return `${fallbackBase}.${fileExtensionFromContentType(contentType)}`.slice(0, 120);
}

export async function downloadImportImage(
  image: SeoArticleImportImage,
  fallbackBase: string,
): Promise<DownloadedImportImage> {
  const response = await fetchImageWithRedirects(image.sourceUrl);

  if (!response.ok) {
    throw new Error(`Failed to download image ${image.sourceUrl}: ${response.status}`);
  }

  const contentType = response.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() || '';
  if (!isAllowedImportImageContentType(contentType)) {
    throw new Error(`URL did not return a supported image content type: ${image.sourceUrl}`);
  }

  const contentLength = Number(response.headers.get('content-length') || 0);
  if (contentLength > MAX_IMPORT_IMAGE_BYTES) {
    throw new Error(`Image is larger than ${MAX_IMPORT_IMAGE_BYTES} bytes: ${image.sourceUrl}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_IMPORT_IMAGE_BYTES) {
    throw new Error(`Image is larger than ${MAX_IMPORT_IMAGE_BYTES} bytes: ${image.sourceUrl}`);
  }

  return {
    sourceUrl: image.sourceUrl,
    file: new File([arrayBuffer], fileNameFromUrl(image.sourceUrl, fallbackBase, contentType), {
      type: contentType,
    }),
    metadata: image,
  };
}

export function normalizedImageUrlKey(value: string) {
  try {
    const url = new URL(value.trim());
    return `${url.origin}${url.pathname}${url.search}`;
  } catch {
    return value.trim();
  }
}

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/\s+/g, ' ')
    .trim();
}

function getAttr(attrs: string, name: string) {
  const match = attrs.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'));
  return (match?.[1] ?? match?.[2] ?? '').trim();
}

function setOrAppendAttr(attrs: string, name: string, value: string, replaceExisting = false) {
  const escaped = escapeHtmlAttribute(value);
  const attrRe = new RegExp(`\\b${name}\\s*=\\s*(?:"[^"]*"|'[^']*')`, 'i');
  const normalizedAttrs = attrs.trim();

  if (attrRe.test(normalizedAttrs)) {
    return replaceExisting ? normalizedAttrs.replace(attrRe, `${name}="${escaped}"`) : normalizedAttrs;
  }

  return `${normalizedAttrs}${normalizedAttrs ? ' ' : ''}${name}="${escaped}"`;
}

export function rewriteImportedImageSources(
  html: string,
  replacements: Array<{ sourceUrl: string; hostedUrl: string; metadata: SeoArticleImportImage }>,
) {
  const bySource = new Map(
    replacements.map((replacement) => [normalizedImageUrlKey(replacement.sourceUrl), replacement]),
  );

  return html.replace(/<img\b\s*([^>]*?)\s*\/?>/gi, (full: string, attrs: string) => {
    const src = getAttr(attrs, 'src');
    if (!src) return full;

    const replacement = bySource.get(normalizedImageUrlKey(src));
    if (!replacement) return full;

    let nextAttrs = setOrAppendAttr(attrs, 'src', replacement.hostedUrl, true);
    if (replacement.metadata.altText) {
      nextAttrs = setOrAppendAttr(nextAttrs, 'alt', replacement.metadata.altText);
    }
    if (replacement.metadata.metaTitle) {
      nextAttrs = setOrAppendAttr(nextAttrs, 'title', replacement.metadata.metaTitle);
    }
    if (replacement.metadata.caption) {
      nextAttrs = setOrAppendAttr(nextAttrs, 'data-caption', replacement.metadata.caption);
    }
    if (replacement.metadata.description) {
      nextAttrs = setOrAppendAttr(nextAttrs, 'data-description', replacement.metadata.description);
    }

    return `<img ${nextAttrs}${full.trimEnd().endsWith('/>') ? ' /' : ''}>`;
  });
}
