import { defineRouting } from "next-intl/routing";

/**
 * i18n routing: explicit locale prefixes in URLs.
 *
 * Canonical roots:
 * - French: `/fr`
 * - English: `/en`
 * - Spanish: `/es`
 * - German: `/de`
 * - Polish: `/pl`
 */
export const routing = defineRouting({
  locales: ["fr", "en", "es", "de", "pl"],
  defaultLocale: "fr",
  localeDetection: true,
  alternateLinks: false,
  localePrefix: "always",
  pathnames: {
    "/": {
      fr: "/",
      en: "/",
      es: "/",
      de: "/",
      pl: "/",
    },
    "/about": {
      fr: "/a-propos",
      en: "/about",
      es: "/sobre-nosotros",
      de: "/ueber-uns",
      pl: "/o-nas",
    },
    "/contact": "/contact",
    "/blog": "/blog",
    "/blog/[category]": "/blog/[category]",
    "/blog/[category]/[slug]": "/blog/[category]/[slug]",
    "/cars": {
      fr: "/voitures",
      en: "/cars",
      es: "/coches",
      de: "/autos",
      pl: "/samochody",
    },
    "/cars/[slug]": {
      fr: "/voitures/[slug]",
      en: "/cars/[slug]",
      es: "/coches/[slug]",
      de: "/autos/[slug]",
      pl: "/samochody/[slug]",
    },
    "/cars/brand/[brandSlug]": {
      fr: "/voitures/marque/[brandSlug]",
      en: "/cars/brand/[brandSlug]",
      es: "/coches/marca/[brandSlug]",
      de: "/autos/marke/[brandSlug]",
      pl: "/samochody/marka/[brandSlug]",
    },
    "/cars/brand/[brandSlug]/[carSlug]": {
      fr: "/voitures/marque/[brandSlug]/[carSlug]",
      en: "/cars/brand/[brandSlug]/[carSlug]",
      es: "/coches/marca/[brandSlug]/[carSlug]",
      de: "/autos/marke/[brandSlug]/[carSlug]",
      pl: "/samochody/marka/[brandSlug]/[carSlug]",
    },
    "/location-voiture-agadir": {
      fr: "/location-voiture-agadir",
      en: "/agadir-car-rental",
      es: "/alquiler-coches-agadir",
      de: "/mietwagen-agadir",
      pl: "/wynajem-samochodow-agadir",
    },
    "/agadir-airport-car-rental": {
      fr: "/location-voiture-aeroport-agadir",
      en: "/agadir-airport-car-rental",
      es: "/alquiler-coches-aeropuerto-agadir",
      de: "/mietwagen-flughafen-agadir",
      pl: "/wynajem-samochodow-lotnisko-agadir",
    },
    "/taghazout-car-rental": {
      fr: "/location-voiture-taghazout",
      en: "/taghazout-car-rental",
      es: "/alquiler-coches-taghazout",
      de: "/mietwagen-taghazout",
      pl: "/wynajem-samochodow-taghazout",
    },
  },
});

export type AppLocale = (typeof routing.locales)[number];
