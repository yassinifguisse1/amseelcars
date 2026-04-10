import type { BlogArticle } from '@/data/blog'
import { blogArticleImageAlt, blogArticleImageTitle } from '@/lib/blogImageAlt'

function escapeHtmlAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeImgSrc(src: string): string {
  const t = src.trim()
  try {
    const u = new URL(t)
    return u.origin + u.pathname + u.search
  } catch {
    return t
  }
}

function srcsEquivalent(a: string, b: string): boolean {
  return normalizeImgSrc(a) === normalizeImgSrc(b)
}

function stripInnerTags(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

function getAttr(attrs: string, name: string): string | undefined {
  const re = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i')
  const m = attrs.match(re)
  if (!m) return undefined
  const v = m[1] ?? m[2]
  return v !== undefined ? v.trim() : undefined
}

/** Apply or replace `alt` / `title` on an img attribute string (leading space in result). */
function applyImgAttributes(
  attrsRaw: string,
  patch: { alt?: string; title?: string }
): string {
  let prefix = attrsRaw.trim() ? ` ${attrsRaw.trim()}` : ''

  if (patch.alt !== undefined) {
    const escaped = escapeHtmlAttr(patch.alt)
    const altRe = /\balt\s*=\s*(?:"[^"]*"|'[^']*')/i
    if (altRe.test(prefix)) {
      prefix = prefix.replace(altRe, `alt="${escaped}"`)
    } else {
      prefix = `${prefix} alt="${escaped}"`
    }
  }

  if (patch.title !== undefined) {
    const escaped = escapeHtmlAttr(patch.title)
    const titleRe = /\btitle\s*=\s*(?:"[^"]*"|'[^']*')/i
    if (titleRe.test(prefix)) {
      prefix = prefix.replace(titleRe, `title="${escaped}"`)
    } else {
      prefix = `${prefix} title="${escaped}"`
    }
  }

  return prefix
}

function rebuildImgTag(
  attrsRaw: string,
  originalFull: string,
  patch: { alt?: string; title?: string }
): string {
  const selfClose = originalFull.trimEnd().endsWith('/>')
  const inner = applyImgAttributes(attrsRaw, patch)
  return `<img${inner}${selfClose ? ' /' : ''}>`
}

/**
 * Improves `<img>` alt + title inside article HTML so CRM values are reflected on the site:
 * - `<figure>…<figcaption>…` fills empty `img` alt/title (caption used for both).
 * - `data-alt` / `data-alt-text` → `alt`; `data-title` / `data-caption` → `title` when missing.
 * - Same `src` as cover + empty alt → DB alt + title from caption/altText.
 * - Any image with `alt` but no `title` gets `title` from `alt` (tooltip / your HTML convention).
 */
export function enhanceArticleBodyImages(
  html: string,
  article: Pick<BlogArticle, 'image' | 'altText' | 'caption' | 'description' | 'category'>
): string {
  let out = html
  const featured = article.image?.trim()

  const imgRe = /<img\b\s*([^>]*?)\s*\/?>/gi

  // 1) Figure + figcaption → first image in the figure only
  out = out.replace(/(<figure\b[^>]*>)([\s\S]*?)(<\/figure>)/gi, (full: string, open: string, inner: string, close: string) => {
    const capMatch = inner.match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i)
    const captionText = capMatch ? stripInnerTags(capMatch[1]) : ''
    if (!captionText) return full

    let filledFirst = false
    const newInner = inner.replace(imgRe, (imgFull: string, attrs: string) => {
      if (filledFirst) return imgFull
      const existing = getAttr(attrs, 'alt')
      if (existing) return imgFull
      filledFirst = true
      return rebuildImgTag(attrs, imgFull, { alt: captionText, title: captionText })
    })
    return open + newInner + close
  })

  // 2) data-alt when alt is empty; optional data-title / data-caption for title
  out = out.replace(imgRe, (imgFull: string, attrs: string) => {
    const existing = getAttr(attrs, 'alt')
    if (existing) return imgFull
    const dataAlt = getAttr(attrs, 'data-alt') || getAttr(attrs, 'data-alt-text')
    if (!dataAlt) return imgFull
    const dataTitle =
      getAttr(attrs, 'data-title') || getAttr(attrs, 'data-caption') || undefined
    return rebuildImgTag(attrs, imgFull, {
      alt: dataAlt,
      ...(dataTitle ? { title: dataTitle } : { title: dataAlt }),
    })
  })

  // 3) Featured image URL in body with empty alt → cover alt + title from CRM
  if (featured) {
    const coverAlt = blogArticleImageAlt(article)
    const coverTitle = blogArticleImageTitle(article) ?? coverAlt
    out = out.replace(imgRe, (imgFull: string, attrs: string) => {
      const existing = getAttr(attrs, 'alt')
      if (existing) return imgFull
      const src = getAttr(attrs, 'src')
      if (!src || !srcsEquivalent(src, featured)) return imgFull
      return rebuildImgTag(attrs, imgFull, { alt: coverAlt, title: coverTitle })
    })
  }

  // 4) Fill empty title from alt (matches `<img alt="…" title="…">` when CRM only set alt)
  out = out.replace(imgRe, (imgFull: string, attrs: string) => {
    const existingTitle = getAttr(attrs, 'title')
    if (existingTitle) return imgFull
    const alt = getAttr(attrs, 'alt')
    if (!alt) return imgFull
    const t = alt.length > 200 ? `${alt.slice(0, 197)}…` : alt
    return rebuildImgTag(attrs, imgFull, { title: t })
  })

  return out
}
