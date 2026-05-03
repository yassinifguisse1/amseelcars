import { routing, type AppLocale } from "./routing";

/** Short labels for FR/EN/… language switchers on marketing pages */
export const LOCALE_SHORT_LABELS: Record<AppLocale, string> = {
  fr: "FR",
  en: "EN",
  es: "ES",
  de: "DE",
  pl: "PL",
};

export function toAppLocale(locale: string | undefined): AppLocale {
  return routing.locales.includes(locale as AppLocale)
    ? (locale as AppLocale)
    : routing.defaultLocale;
}

export function localeToLanguageTag(locale: AppLocale) {
  switch (locale) {
    case "en":
      return "en-US";
    case "es":
      return "es-ES";
    case "de":
      return "de-DE";
    case "pl":
      return "pl-PL";
    case "fr":
    default:
      return "fr-MA";
  }
}

/** Open Graph `locale` uses underscore (e.g. `fr_MA`, `en_US`). */
export function localeToOpenGraphLocale(locale: AppLocale) {
  return localeToLanguageTag(locale).replace("-", "_");
}

