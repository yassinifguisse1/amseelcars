import type { BlogArticle } from '@/data/blog'

/**
 * Alt text for blog cover images (Google Images / accessibility).
 * Uses CMS `altText` first; never mirrors the article headline.
 */
export function blogArticleImageAlt(
  article: Pick<BlogArticle, 'altText' | 'caption' | 'description' | 'category'>
): string {
  const fromAlt = article.altText?.trim()
  if (fromAlt) return fromAlt

  const fromCaption = article.caption?.trim()
  if (fromCaption) return fromCaption

  const desc = article.description?.trim()
  if (desc) {
    return desc.length > 160 ? `${desc.slice(0, 159)}…` : desc
  }

  return `Illustration — ${article.category} — blog AmseelCars, location de voiture à Agadir`
}

/**
 * Tooltip / HTML `title` for blog cover images: prefer short caption, then alt text.
 */
export function blogArticleImageTitle(
  article: Pick<BlogArticle, 'caption' | 'altText'>
): string | undefined {
  const caption = article.caption?.trim()
  if (caption) return caption.length > 200 ? `${caption.slice(0, 199)}…` : caption
  const alt = article.altText?.trim()
  if (alt) return alt.length > 200 ? `${alt.slice(0, 199)}…` : alt
  return undefined
}
