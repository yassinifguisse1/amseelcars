import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

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
