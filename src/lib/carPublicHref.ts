import type { AppLocale } from "@/i18n/routing";
import { brandToSlug } from "@/lib/brandSlug";
import { carSlugForLocale } from "@/lib/carSlugLocale";

/** next-intl `Link` href for a car under its brand (SEO / IA). */
export type CarBrandScopedHref = {
  pathname: "/cars/brand/[brandSlug]/[carSlug]";
  params: { brandSlug: string; carSlug: string };
};

export function carBrandScopedHref(
  brand: string,
  carSlugForLocale: string,
): CarBrandScopedHref {
  return {
    pathname: "/cars/brand/[brandSlug]/[carSlug]",
    params: {
      brandSlug: brandToSlug(brand),
      carSlug: carSlugForLocale,
    },
  };
}

export function carBrandScopedHrefFromCanonical(
  brand: string,
  canonicalFrSlug: string,
  locale: AppLocale,
): CarBrandScopedHref {
  return carBrandScopedHref(brand, carSlugForLocale(canonicalFrSlug, locale));
}
