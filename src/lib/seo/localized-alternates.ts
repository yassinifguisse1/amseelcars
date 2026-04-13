import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { brandToSlug } from "@/lib/brandSlug";

type PathnameArg = Parameters<typeof getPathname>[0]["href"];

/**
 * Self-referencing canonical for the active locale plus hreflang cluster (fr / en / x-default).
 * Paths are pathname-only; `metadataBase` in the root layout resolves absolute URLs.
 */
export function localizedAlternates(
  locale: AppLocale,
  href: PathnameArg,
): NonNullable<Metadata["alternates"]> {
  const frPath = getPathname({ locale: "fr", href });
  const enPath = getPathname({ locale: "en", href });
  const canonical = locale === "fr" ? frPath : enPath;

  return {
    canonical,
    languages: {
      fr: frPath,
      en: enPath,
      "x-default": frPath,
    },
  };
}

const carDetailHref = (slug: string) =>
  ({ pathname: "/cars/[slug]" as const, params: { slug } });

/**
 * Car detail URLs use a French slug on `/voitures/...` and an English slug on `/cars/...`.
 */
export function localizedCarAlternates(
  locale: AppLocale,
  frSlug: string,
  enSlug: string,
): NonNullable<Metadata["alternates"]> {
  const frPath = getPathname({ locale: "fr", href: carDetailHref(frSlug) });
  const enPath = getPathname({ locale: "en", href: carDetailHref(enSlug) });
  const canonical = locale === "fr" ? frPath : enPath;

  return {
    canonical,
    languages: {
      fr: frPath,
      en: enPath,
      "x-default": frPath,
    },
  };
}

const carBrandScopedHref = (brandSlug: string, carSlug: string) =>
  ({
    pathname: "/cars/brand/[brandSlug]/[carSlug]" as const,
    params: { brandSlug, carSlug },
  }) as const;

/**
 * hreflang + canonical for car pages under `/cars/brand/{brand}/{car}` (and FR `/voitures/marque/...`).
 */
export function localizedCarBrandScopedAlternates(
  locale: AppLocale,
  brand: string,
  frCarSlug: string,
  enCarSlug: string,
): NonNullable<Metadata["alternates"]> {
  const brandSlug = brandToSlug(brand);
  const frPath = getPathname({
    locale: "fr",
    href: carBrandScopedHref(brandSlug, frCarSlug),
  });
  const enPath = getPathname({
    locale: "en",
    href: carBrandScopedHref(brandSlug, enCarSlug),
  });
  const canonical = locale === "fr" ? frPath : enPath;

  return {
    canonical,
    languages: {
      fr: frPath,
      en: enPath,
      "x-default": frPath,
    },
  };
}
