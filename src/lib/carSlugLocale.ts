import type { AppLocale } from '@/i18n/routing'
import { CAR_CANONICAL_SLUGS } from '@/data/carCanonicalSlugs.generated'

const FR_PREFIX = 'location-voiture-agadir-'
const EN_PREFIX = 'agadir-car-rental-'

/** Tail segment: French → English (URL slug) */
const TAIL_REPLACEMENTS: [RegExp, string][] = [
  [/-blanche(?=-|$)/, '-white'],
  [/-gris(?=-|$)/, '-grey'],
  [/-vert(?=-|$)/, '-green'],
  [/-noir(?=-|$)/, '-black'],
]

/**
 * English URL slug for a car, from the canonical French slug stored in `cars.ts`.
 * French URLs keep `location-voiture-agadir-*`; English uses `agadir-car-rental-*`.
 */
export function frenchCarSlugToEnglishSlug(frSlug: string): string {
  if (!frSlug.startsWith(FR_PREFIX)) {
    return frSlug
  }
  let tail = frSlug.slice(FR_PREFIX.length).toLowerCase()
  for (const [re, repl] of TAIL_REPLACEMENTS) {
    tail = tail.replace(re, repl)
  }
  return EN_PREFIX + tail
}

export function carSlugForLocale(canonicalFrSlug: string, locale: AppLocale): string {
  return locale === 'en' ? frenchCarSlugToEnglishSlug(canonicalFrSlug) : canonicalFrSlug
}

/**
 * Resolve request `[slug]` to the canonical French slug used in data / JSON keys.
 */
export function resolveCanonicalFrenchCarSlug(
  paramSlug: string,
  frenchSlugs: readonly string[],
): string | undefined {
  if (frenchSlugs.includes(paramSlug)) {
    return paramSlug
  }
  for (const fr of frenchSlugs) {
    if (frenchCarSlugToEnglishSlug(fr) === paramSlug) {
      return fr
    }
  }
  return undefined
}

/**
 * URL `[slug]` on car detail pages: map current segment to the correct slug for `targetLocale`
 * (French `location-voiture-agadir-*` vs English `agadir-car-rental-*`).
 */
export function resolveCarDetailSlugForLocale(
  urlSlug: string,
  targetLocale: AppLocale,
): string {
  const canonical = resolveCanonicalFrenchCarSlug(urlSlug, CAR_CANONICAL_SLUGS)
  if (!canonical) return urlSlug
  return carSlugForLocale(canonical, targetLocale)
}
