import type { AppLocale } from '@/i18n/routing'
import type { Car, CarRichContent } from '@/data/cars'
import { carSlugForLocale } from '@/lib/carSlugLocale'
import carProductsFr from '../../messages/car-products.fr.json'
import carProductsEn from '../../messages/car-products.en.json'
import carProductsEs from '../../messages/car-products.es.json'
import carProductsDe from '../../messages/car-products.de.json'
import carProductsPl from '../../messages/car-products.pl.json'

type ProductPack = { description: string; richContent?: CarRichContent }

const PACKS: Record<AppLocale, Record<string, ProductPack>> = {
  fr: carProductsFr as Record<string, ProductPack>,
  en: carProductsEn as Record<string, ProductPack>,
  es: carProductsEs as Record<string, ProductPack>,
  de: carProductsDe as Record<string, ProductPack>,
  pl: carProductsPl as Record<string, ProductPack>,
}

function packForSlug(frSlug: string, locale: AppLocale): ProductPack | undefined {
  return (
    PACKS[locale][frSlug] ??
    PACKS.fr[frSlug] ??
    PACKS.en[frSlug]
  )
}

/**
 * Fleet marketing copy (short `description` + optional `richContent`) by locale.
 * Source: `messages/car-products.{fr,en,es,de,pl}.json` (FR from `cars.ts`, EN from overrides;
 * ES/DE/PL merged on `pnpm run generate:car-products` so localized slugs are kept; fill mirrors via
 * `pnpm run bootstrap:car-products-locales` or edit JSON). Regenerate base FR/EN: `pnpm run generate:car-products`
 *
 * Also exposed under `messages.carProducts` for `useTranslations('carProducts')` / `getTranslations`.
 */
export function carForLocale(car: Car, locale: AppLocale): Car {
  const frSlug = car.slug
  const pack = packForSlug(frSlug, locale)
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
