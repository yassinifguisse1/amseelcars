import { defineRouting } from "next-intl/routing";

/**
 * i18n routing: French + English with explicit locale prefixes in URLs.
 *
 * Canonical roots:
 * - French: `/fr`
 * - English: `/en`
 */
export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localeDetection: true,
  localePrefix: "always",
  pathnames: {
    "/": {
      fr: "/",
      en: "/",
    },
    "/about": {
      fr: "/a-propos",
      en: "/about",
    },
    "/contact": "/contact",
    "/blog": "/blog",
    "/blog/[category]": "/blog/[category]",
    "/blog/[category]/[slug]": "/blog/[category]/[slug]",
    "/cars": {
      fr: "/voitures",
      en: "/cars",
    },
    "/cars/[slug]": {
      fr: "/voitures/[slug]",
      en: "/cars/[slug]",
    },
    "/cars/brand/[brandSlug]": {
      fr: "/voitures/marque/[brandSlug]",
      en: "/cars/brand/[brandSlug]",
    },
    "/cars/brand/[brandSlug]/[carSlug]": {
      fr: "/voitures/marque/[brandSlug]/[carSlug]",
      en: "/cars/brand/[brandSlug]/[carSlug]",
    },
    "/location-voiture-agadir": {
      fr: "/location-voiture-agadir",
      en: "/agadir-car-rental",
    },
    "/agadir-airport-car-rental": {
      fr: "/location-voiture-aeroport-agadir",
      en: "/agadir-airport-car-rental",
    },
    "/taghazout-car-rental": {
      fr: "/location-voiture-taghazout",
      en: "/taghazout-car-rental",
    },
  },
});

export type AppLocale = (typeof routing.locales)[number];
