import { getPathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { getAllCars } from "@/data/cars";
import { frenchCarSlugToEnglishSlug } from "@/lib/carSlugLocale";
import { brandToSlug, getFleetBrandSlugsSorted } from "@/lib/brandSlug";

const baseUrl = "https://www.amseelcars.com";

type StaticHref =
  | "/"
  | "/about"
  | "/contact"
  | "/cars"
  | "/location-voiture-agadir"
  | "/agadir-airport-car-rental"
  | "/taghazout-car-rental";

const STATIC_HREFS: StaticHref[] = [
  "/",
  "/about",
  "/contact",
  "/cars",
  "/location-voiture-agadir",
  "/agadir-airport-car-rental",
  "/taghazout-car-rental",
];

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function simpleUrl(path: string, lastmod: string): string {
  const loc = escapeXml(`${baseUrl}${path}`);
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
}

function assertLocale(locale: string): asserts locale is AppLocale {
  if (!routing.locales.includes(locale as AppLocale)) {
    throw new Error(`Invalid sitemap locale: ${locale}`);
  }
}

/**
 * Static pages, destination landings, brand index, and car detail URLs for one locale only
 * (no blog — see `sitemap-blog-locale.ts`).
 */
export function buildPagesSitemapXmlForLocale(locale: string, lastmod: string): string {
  assertLocale(locale);
  const l = locale as AppLocale;
  const blocks: string[] = [];

  for (const href of STATIC_HREFS) {
    blocks.push(simpleUrl(getPathname({ locale: l, href }), lastmod));
  }

  const brandSlugs = getFleetBrandSlugsSorted();
  for (const brandSlug of brandSlugs) {
    blocks.push(
      simpleUrl(
        getPathname({
          locale: l,
          href: { pathname: "/cars/brand/[brandSlug]", params: { brandSlug } },
        }),
        lastmod,
      ),
    );
  }

  for (const car of getAllCars()) {
    const brandSlug = brandToSlug(car.brand);
    const frSlug = car.slug;
    const enSlug = frenchCarSlugToEnglishSlug(frSlug);
    const carSlug = l === "fr" ? frSlug : enSlug;
    blocks.push(
      simpleUrl(
        getPathname({
          locale: l,
          href: {
            pathname: "/cars/brand/[brandSlug]/[carSlug]",
            params: { brandSlug, carSlug },
          },
        }),
        lastmod,
      ),
    );
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${blocks.join("\n")}
</urlset>`;
}

/** Root index: one pages + one blog child sitemap per locale. */
export function buildRootSitemapIndexXml(lastmodIso: string): string {
  const blocks: string[] = [];
  for (const loc of routing.locales) {
    blocks.push(`  <sitemap>
    <loc>${escapeXml(`${baseUrl}/sitemap-pages-${loc}.xml`)}</loc>
    <lastmod>${escapeXml(lastmodIso)}</lastmod>
  </sitemap>`);
    blocks.push(`  <sitemap>
    <loc>${escapeXml(`${baseUrl}/sitemap-blog-${loc}.xml`)}</loc>
    <lastmod>${escapeXml(lastmodIso)}</lastmod>
  </sitemap>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${blocks.join("\n")}
</sitemapindex>`;
}
