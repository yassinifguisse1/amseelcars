import { defineRouting } from "next-intl/routing";

/**
 * i18n routing: French (default) + English, no locale prefix in URLs.
 *
 * **Default language: French (`defaultLocale: "fr"`).** Locale follows the
 * visible pathname for locale-specific URLs (`/about` vs `/a-propos`, …) plus
 * `NEXT_LOCALE` when paths are shared (`/contact`). `localeDetection` must be
 * `true` so the cookie is read; `Accept-Language` is stripped in middleware so
 * the browser language does not override `/` or ambiguous routes.
 *
 * English homepage: `/home` (not `/en`). French keeps `/` for SEO equity.
 * If you switch EN home to `/en`, update `pathnames['/']` and add a redirect
 * from `/home` for any indexed URLs.
 *
 * Internal pathname keys match the target `app/[locale]/…` segments once pages
 * are moved under `[locale]` (middleware rewrites localized URLs to these).
 */
export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  /**
   * Required so `NEXT_LOCALE` is honored. Pathname-specific locales (`/about` =
   * en) are injected in middleware; `Accept-Language` is removed there so
   * `/` and shared paths still default to French unless the user switched
   * language (cookie).
   */
  localeDetection: true,
  localePrefix: "never",
  pathnames: {
    "/": {
      fr: "/",
      en: "/home",
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
