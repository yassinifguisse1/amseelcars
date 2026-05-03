import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { brandToSlug } from "@/lib/brandSlug";

type PathnameArg = Parameters<typeof getPathname>[0]["href"];
type Languages = NonNullable<NonNullable<Metadata["alternates"]>["languages"]>;

function localizedPathMap(href: PathnameArg): Record<AppLocale, string> {
  return Object.fromEntries(
    routing.locales.map((locale) => [
      locale,
      getPathname({ locale, href }),
    ]),
  ) as Record<AppLocale, string>;
}

/**
 * Self-referencing canonical for the active locale plus hreflang cluster.
 * Paths are pathname-only; `metadataBase` in the root layout resolves absolute URLs.
 */
export function localizedAlternates(
  locale: AppLocale,
  href: PathnameArg,
): NonNullable<Metadata["alternates"]> {
  const paths = localizedPathMap(href);
  const canonical = paths[locale];

  return {
    canonical,
    languages: {
      ...paths,
      "x-default": paths.fr,
    } satisfies Languages,
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
  const paths = Object.fromEntries(
    routing.locales.map((entry) => {
      const slug = entry === "fr" ? frSlug : enSlug;
      return [entry, getPathname({ locale: entry, href: carDetailHref(slug) })];
    }),
  ) as Record<AppLocale, string>;
  const canonical = paths[locale];

  return {
    canonical,
    languages: {
      ...paths,
      "x-default": paths.fr,
    } satisfies Languages,
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
  const paths = Object.fromEntries(
    routing.locales.map((entry) => {
      const carSlug = entry === "fr" ? frCarSlug : enCarSlug;
      return [
        entry,
        getPathname({
          locale: entry,
          href: carBrandScopedHref(brandSlug, carSlug),
        }),
      ];
    }),
  ) as Record<AppLocale, string>;
  const canonical = paths[locale];

  return {
    canonical,
    languages: {
      ...paths,
      "x-default": paths.fr,
    } satisfies Languages,
  };
}
