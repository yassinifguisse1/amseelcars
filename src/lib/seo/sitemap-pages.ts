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

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** hreflang + x-default (French) for one logical page across all app locales. */
function alternateClusterXml(paths: Record<AppLocale, string>): string {
  const lines = routing.locales.map(
    (loc) =>
      `    <xhtml:link rel="alternate" hreflang="${loc}" href="${escapeXml(`${baseUrl}${paths[loc]}`)}"/>`,
  );
  lines.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(`${baseUrl}${paths.fr}`)}"/>`,
  );
  return `\n${lines.join("\n")}`;
}

function emitUrlForEachLocale(paths: Record<AppLocale, string>, lastmod: string): string[] {
  return routing.locales.map((loc) => {
    const path = paths[loc];
    const locU = escapeXml(`${baseUrl}${path}`);
    return `  <url>
    <loc>${locU}</loc>${alternateClusterXml(paths)}
    <lastmod>${lastmod}</lastmod>
  </url>`;
  });
}

/**
 * Sitemap entries for static + car detail URLs, with hreflang alternates for every `AppLocale`.
 */
export function buildPagesSitemapXml(lastmod: string): string {
  const urlBlocks: string[] = [];

  const blogPaths = Object.fromEntries(
    routing.locales.map((locale) => [
      locale,
      getPathname({ locale, href: "/blog" }),
    ]),
  ) as Record<AppLocale, string>;
  urlBlocks.push(...emitUrlForEachLocale(blogPaths, lastmod));

  for (const href of STATIC_HREFS) {
    const paths = Object.fromEntries(
      routing.locales.map((locale) => [
        locale,
        getPathname({ locale, href }),
      ]),
    ) as Record<AppLocale, string>;
    urlBlocks.push(...emitUrlForEachLocale(paths, lastmod));
  }

  const brandSlugs = getFleetBrandSlugsSorted();
  for (const brandSlug of brandSlugs) {
    const href = {
      pathname: "/cars/brand/[brandSlug]" as const,
      params: { brandSlug },
    };
    const paths = Object.fromEntries(
      routing.locales.map((locale) => [
        locale,
        getPathname({ locale, href }),
      ]),
    ) as Record<AppLocale, string>;
    urlBlocks.push(...emitUrlForEachLocale(paths, lastmod));
  }

  for (const car of getAllCars()) {
    const brandSlug = brandToSlug(car.brand);
    const frSlug = car.slug;
    const enSlug = frenchCarSlugToEnglishSlug(frSlug);
    const paths = Object.fromEntries(
      routing.locales.map((locale) => {
        const carSlug = locale === "fr" ? frSlug : enSlug;
        return [
          locale,
          getPathname({
            locale,
            href: {
              pathname: "/cars/brand/[brandSlug]/[carSlug]" as const,
              params: { brandSlug, carSlug },
            },
          }),
        ];
      }),
    ) as Record<AppLocale, string>;
    urlBlocks.push(...emitUrlForEachLocale(paths, lastmod));
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlBlocks.join("\n")}
</urlset>`;
}
