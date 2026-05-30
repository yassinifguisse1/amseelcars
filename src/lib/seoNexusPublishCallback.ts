import { assertSafeRemoteImageUrl, SEO_ARTICLE_IMPORT_SOURCE } from '@/lib/seoArticleImport';

interface PublicationCallback {
  url: string;
  secret: string;
  workspaceId: string;
  pageId: string;
}

interface ImportedArticleForCallback {
  slug: string;
  locale: string;
  category: string;
  importSource: string | null;
  publicationCallback: unknown;
}

function slugifyCategory(category: string) {
  return category
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parsePublicationCallback(value: unknown): PublicationCallback | null {
  if (!value || typeof value !== 'object') return null;
  const input = value as Partial<PublicationCallback>;
  if (
    typeof input.url !== 'string' ||
    typeof input.secret !== 'string' ||
    typeof input.workspaceId !== 'string' ||
    typeof input.pageId !== 'string' ||
    !input.url.trim() ||
    !input.secret.trim() ||
    !input.workspaceId.trim() ||
    !input.pageId.trim()
  ) {
    return null;
  }

  return {
    url: input.url.trim(),
    secret: input.secret.trim(),
    workspaceId: input.workspaceId.trim(),
    pageId: input.pageId.trim(),
  };
}

export async function notifySeoNexusArticlePublished(
  article: ImportedArticleForCallback,
  siteOrigin: string,
) {
  if (article.importSource !== SEO_ARTICLE_IMPORT_SOURCE) return;
  const callback = parsePublicationCallback(article.publicationCallback);
  if (!callback) return;

  await assertSafeRemoteImageUrl(callback.url);
  const liveUrl = new URL(
    `/${article.locale}/blog/${slugifyCategory(article.category)}/${article.slug}`,
    siteOrigin,
  ).toString();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(callback.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        secret: callback.secret,
        workspaceId: callback.workspaceId,
        pageId: callback.pageId,
        slug: article.slug,
        liveUrl,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`SEO Nexus publish callback failed with status ${response.status}.`);
    }
  } finally {
    clearTimeout(timeout);
  }
}
