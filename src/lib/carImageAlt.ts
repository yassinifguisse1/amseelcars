import type { AppLocale } from '@/i18n/routing'
import type { Car, CarImage } from '@/data/cars'

const CATEGORY_FR: Record<Car['category'], string> = {
  luxury: 'premium',
  sports: 'sportive',
  suv: 'SUV',
  electric: 'électrique',
  premium: 'premium',
  economy: 'citadine',
  crossover: 'SUV compact',
}

const CATEGORY_EN: Record<Car['category'], string> = {
  luxury: 'premium',
  sports: 'sports',
  suv: 'SUV',
  electric: 'electric',
  premium: 'premium',
  economy: 'compact',
  crossover: 'compact SUV',
}

/** Alt: stay concise for screen readers & SERP (≈125–160 chars). */
const MAX_ALT = 158
/** Title tooltips: similar cap so UI stays predictable. */
const MAX_TITLE = 158

const DETAIL_FALLBACK_SCENES_FR = [
  'vue avant',
  'vue latérale',
  'vue arrière',
  'intérieur',
  'tableau de bord',
  'autre angle',
] as const

const DETAIL_FALLBACK_SCENES_EN = [
  'front view',
  'side view',
  'rear view',
  'interior',
  'dashboard',
  'other angle',
] as const

function detailFallbackSceneIndex(index: number): number {
  return Math.max(0, Math.min(index, DETAIL_FALLBACK_SCENES_FR.length - 1))
}

function truncateMeta(s: string, max: number): string {
  const t = s.replace(/\s+/g, ' ').trim()
  if (!t) return ''
  return t.length <= max ? t : `${t.slice(0, Math.max(0, max - 1))}…`
}

function vehicleCore(car: Pick<Car, 'brand' | 'model' | 'year'>): string {
  return `${car.brand} ${car.model} ${car.year}`.replace(/\s+/g, ' ').trim()
}

function hasLocalContext(s: string): boolean {
  return /\bagadir\b|maroc|morocco/i.test(s)
}

function hasBusinessName(s: string): boolean {
  return /amseel/i.test(s)
}

function categoryWord(category: Car['category'], locale: AppLocale): string {
  if (locale === 'en') {
    return CATEGORY_EN[category] ?? category
  }
  return CATEGORY_FR[category] ?? category
}

function detailFallbackScene(index: number, locale: AppLocale): string {
  const i = detailFallbackSceneIndex(index)
  return locale === 'en'
    ? DETAIL_FALLBACK_SCENES_EN[i]!
    : DETAIL_FALLBACK_SCENES_FR[i]!
}

/**
 * Text after the last em/en dash — usually the "scene" (vue avant, intérieur, etc.).
 * Empty if the alt is a single phrase (we then use the full alt).
 */
function extractSceneDescription(raw: string): string {
  const m = raw.match(/\s[-–—]\s(.+)$/)
  return m ? m[1]!.trim() : ''
}

function imageAt(car: Pick<Car, 'images'>, index: number): CarImage | undefined {
  return car.images[index]
}

function buildListingAltBody(
  car: Pick<Car, 'brand' | 'model' | 'year' | 'category'>,
  rawPrimaryAlt: string,
  locale: AppLocale
): string {
  const cat = categoryWord(car.category, locale)
  const core = vehicleCore(car)

  if (!rawPrimaryAlt) {
    return locale === 'en'
      ? `${core} (${cat}) — main view, car rental`
      : `${core} (${cat}) — vue principale, location voiture`
  }

  const scene = extractSceneDescription(rawPrimaryAlt)
  const line =
    scene.length >= 4 ? `${core} (${cat}) — ${scene}` : `${core} (${cat}) — ${rawPrimaryAlt}`

  return line
}

function appendLocalAndBrand(
  body: string,
  opts: { includeBrand: boolean },
  locale: AppLocale
): string {
  let out = body
  if (!hasLocalContext(out)) {
    out = locale === 'en' ? `${out} · Agadir, Morocco` : `${out} · Agadir, Maroc`
  }
  if (opts.includeBrand && !hasBusinessName(out)) {
    out = `${out} · AmseelCars`
  }
  return out
}

/**
 * Listing / grid: primary photo — vehicle + angle + local rental context (SEO / AEO-friendly).
 */
export function carListingImageAlt(
  car: Pick<Car, 'images' | 'carName' | 'brand' | 'model' | 'year' | 'category'>,
  locale: AppLocale = 'fr'
): string {
  const primary = car.images.find((i) => i.isPrimary) ?? car.images[0]
  const raw = primary?.alt?.trim() ?? ''
  const body = buildListingAltBody(car, raw, locale)
  return truncateMeta(appendLocalAndBrand(body, { includeBrand: true }, locale), MAX_ALT)
}

/**
 * Listing image title: distinct from alt — booking intent + segment (AEO / long-tail).
 */
export function carListingImageTitle(
  car: Pick<Car, 'carName' | 'description' | 'brand' | 'model' | 'year' | 'category'>,
  locale: AppLocale = 'fr'
): string {
  const cat = categoryWord(car.category, locale)
  const core = vehicleCore(car)
  const excerpt = truncateMeta(car.description, 82)
  const line =
    excerpt && locale === 'en'
      ? `${car.carName} for rent in Agadir (${cat}) — ${excerpt}`
      : excerpt
        ? `${car.carName} à louer à Agadir (${cat}) — ${excerpt}`
        : locale === 'en'
          ? `${core} — car rental Agadir, Morocco — ${cat} — AmseelCars`
          : `${core} — location voiture Agadir, Maroc — ${cat} — AmseelCars`
  return truncateMeta(line, MAX_TITLE)
}

/**
 * Short caption under card image (visible) — unchanged semantics.
 */
export function carListingCaption(
  car: Pick<Car, 'description'>,
  _locale: AppLocale = 'fr'
): string | undefined {
  const t = truncateMeta(car.description, 130)
  return t || undefined
}

/**
 * Detail gallery / thumb: same logic as data alts but consistent year + category + locale.
 * Brand name only on primary (index 0) to limit repetition across thumbnails.
 */
export function carDetailImageAlt(
  car: Pick<Car, 'images' | 'brand' | 'model' | 'year' | 'category'>,
  index: number,
  locale: AppLocale = 'fr'
): string {
  const img = imageAt(car, index)
  const raw = img?.alt?.trim() ?? ''
  const cat = categoryWord(car.category, locale)
  const core = vehicleCore(car)

  let scene: string
  if (!raw) {
    scene = detailFallbackScene(index, locale)
  } else {
    const extracted = extractSceneDescription(raw)
    scene = extracted.length >= 4 ? extracted : raw
  }

  const rental =
    locale === 'en' ? `${scene}, car rental` : `${scene}, location voiture`
  let body = `${core} (${cat}) — ${rental}`
  body = appendLocalAndBrand(body, { includeBrand: index === 0 }, locale)
  return truncateMeta(body, MAX_ALT)
}

/**
 * Tooltip title: not a copy-paste of alt — pipe-separated facts for crawlers & hover UX.
 */
export function carDetailImageTitle(
  car: Pick<Car, 'images' | 'brand' | 'model' | 'year' | 'category'>,
  index: number,
  locale: AppLocale = 'fr'
): string {
  const img = imageAt(car, index)
  const custom = img?.title?.trim()
  if (custom) {
    return truncateMeta(custom, MAX_TITLE)
  }

  const cat = categoryWord(car.category, locale)
  const core = vehicleCore(car)
  const raw = img?.alt?.trim() ?? ''
  const scene = raw
    ? extractSceneDescription(raw) || raw
    : detailFallbackScene(index, locale)

  const shortScene = scene.length > 72 ? `${scene.slice(0, 69)}…` : scene
  const mid =
    locale === 'en'
      ? `Rent in Agadir | AmseelCars`
      : `Louer à Agadir | AmseelCars`
  const line = `${core} · ${shortScene} · ${mid} · ${cat}`
  return truncateMeta(line, MAX_TITLE)
}

/**
 * Optional visible caption under main gallery image (when used).
 */
export function carDetailImageCaption(
  car: Pick<Car, 'images' | 'description'>,
  index: number,
  _locale: AppLocale = 'fr'
): string | undefined {
  const img = imageAt(car, index)
  const c = img?.caption?.trim()
  if (c) return truncateMeta(c, 220)
  if (index === 0 && car.description?.trim()) {
    return truncateMeta(car.description, 220)
  }
  return undefined
}
