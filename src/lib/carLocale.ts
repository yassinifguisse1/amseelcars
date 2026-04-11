import type { AppLocale } from '@/i18n/routing'
import type { Car, CarRichContent } from '@/data/cars'
import { carSlugForLocale } from '@/lib/carSlugLocale'
import carProductsFr from '../../messages/car-products.fr.json'
import carProductsEn from '../../messages/car-products.en.json'

type ProductPack = { description: string; richContent?: CarRichContent }

const FR = carProductsFr as Record<string, ProductPack>
const EN = carProductsEn as Record<string, ProductPack>

/**
 * Fleet marketing copy (short `description` + optional `richContent`) by locale.
 * Source files: `messages/car-products.fr.json` (from `cars.ts`) and
 * `messages/car-products.en.json` (French + overrides from `carEnglishContent.ts`).
 * Regenerate: `npm run generate:car-products`
 *
 * Also exposed under `messages.carProducts` for `useTranslations('carProducts')` / `getTranslations`.
 */
export function carForLocale(car: Car, locale: AppLocale): Car {
  const frSlug = car.slug
  const pack = (locale === 'en' ? EN : FR)[frSlug]
  const localizedSlug = carSlugForLocale(frSlug, locale)

  if (!pack) {
    return { ...car, slug: localizedSlug }
  }

  return {
    ...car,
    description: pack.description,
    richContent: pack.richContent ?? car.richContent,
    slug: localizedSlug,
  }
}
