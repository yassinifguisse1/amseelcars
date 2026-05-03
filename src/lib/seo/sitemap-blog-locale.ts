import { getAllArticles, categoryToSlug } from "@/data/blog";
import { getPathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { escapeXml } from "@/lib/seo/sitemap-pages";

const baseUrl = "https://www.amseelcars.com";

function simpleUrl(path: string, lastmod: string): string {
  const loc = escapeXml(`${baseUrl}${path}`);
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
}

function isAppLocale(locale: string): locale is AppLocale {
  return routing.locales.includes(locale as AppLocale);
}

/**
 * Blog hub + posts for `locale`. DB posts are FR/EN only; ES/DE/PL list the blog index only.
 */
export async function buildBlogSitemapXmlForLocale(
  locale: string,
  lastmodDay: string,
): Promise<string> {
  if (!isAppLocale(locale)) {
    throw new Error(`Invalid sitemap locale: ${locale}`);
  }
  const l = locale;
  const blocks: string[] = [];

  blocks.push(simpleUrl(getPathname({ locale: l, href: "/blog" }), lastmodDay));

  if (l === "fr" || l === "en") {
    const articles = (await getAllArticles()).filter(
      (a) => a.indexable !== false && a.locale === l,
    );
    for (const article of articles) {
      const day = new Date(article.publishedAt).toISOString().split("T")[0];
      blocks.push(
        simpleUrl(
          getPathname({
            locale: l,
            href: {
              pathname: "/blog/[category]/[slug]",
              params: {
                category: categoryToSlug(article.category),
                slug: article.slug,
              },
            },
          }),
          day,
        ),
      );
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${blocks.join("\n")}
</urlset>`;
}
