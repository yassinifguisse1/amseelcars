import { getPathname } from "@/i18n/navigation";
import { getAllCarSlugs } from "@/data/cars";
import { frenchCarSlugToEnglishSlug } from "@/lib/carSlugLocale";
import { getFleetBrandSlugsSorted } from "@/lib/brandSlug";

const baseUrl = "https://www.amseelcars.com";

type StaticHref =
  | "/"
  | "/about"
  | "/contact"
  | "/blog"
  | "/cars"
  | "/location-voiture-agadir"
  | "/agadir-airport-car-rental"
  | "/taghazout-car-rental";

const STATIC_HREFS: StaticHref[] = [
  "/",
  "/about",
  "/contact",
  "/blog",
  "/cars",
  "/location-voiture-agadir",
  "/agadir-airport-car-rental",
  "/taghazout-car-rental",
];

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function alternateLinksXml(frPath: string, enPath: string): string {
  const frU = escapeXml(`${baseUrl}${frPath}`);
  const enU = escapeXml(`${baseUrl}${enPath}`);
  return `
    <xhtml:link rel="alternate" hreflang="fr" href="${frU}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${enU}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${frU}"/>`;
}

/**
 * Sitemap entries for static + car detail URLs, with hreflang alternates (fr / en / x-default).
 */
export function buildPagesSitemapXml(lastmod: string): string {
  const urlBlocks: string[] = [];

  for (const href of STATIC_HREFS) {
    const frPath = getPathname({ locale: "fr", href });
    const enPath = getPathname({ locale: "en", href });
    for (const path of [frPath, enPath]) {
      const loc = escapeXml(`${baseUrl}${path}`);
      urlBlocks.push(`  <url>
    <loc>${loc}</loc>${alternateLinksXml(frPath, enPath)}
    <lastmod>${lastmod}</lastmod>
  </url>`);
    }
  }

  const brandSlugs = getFleetBrandSlugsSorted();
  for (const brandSlug of brandSlugs) {
    const frHref = {
      pathname: "/cars/brand/[brandSlug]" as const,
      params: { brandSlug },
    };
    const enHref = frHref;
    const frPath = getPathname({ locale: "fr", href: frHref });
    const enPath = getPathname({ locale: "en", href: enHref });
    for (const path of [frPath, enPath]) {
      const loc = escapeXml(`${baseUrl}${path}`);
      urlBlocks.push(`  <url>
    <loc>${loc}</loc>${alternateLinksXml(frPath, enPath)}
    <lastmod>${lastmod}</lastmod>
  </url>`);
    }
  }

  const slugs = getAllCarSlugs();
  for (const frSlug of slugs) {
    const enSlug = frenchCarSlugToEnglishSlug(frSlug);
    const frHref = { pathname: "/cars/[slug]" as const, params: { slug: frSlug } };
    const enHref = { pathname: "/cars/[slug]" as const, params: { slug: enSlug } };
    const frPath = getPathname({ locale: "fr", href: frHref });
    const enPath = getPathname({ locale: "en", href: enHref });
    for (const path of [frPath, enPath]) {
      const loc = escapeXml(`${baseUrl}${path}`);
      urlBlocks.push(`  <url>
    <loc>${loc}</loc>${alternateLinksXml(frPath, enPath)}
    <lastmod>${lastmod}</lastmod>
  </url>`);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlBlocks.join("\n")}
</urlset>`;
}
