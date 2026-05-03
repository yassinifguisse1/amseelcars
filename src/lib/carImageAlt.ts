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

const CATEGORY_ES: Record<Car['category'], string> = {
  luxury: 'premium',
  sports: 'deportivo',
  suv: 'SUV',
  electric: 'eléctrico',
  premium: 'premium',
  economy: 'compacto',
  crossover: 'SUV compacto',
}

const CATEGORY_DE: Record<Car['category'], string> = {
  luxury: 'Premium',
  sports: 'Sport',
  suv: 'SUV',
  electric: 'Elektro',
  premium: 'Premium',
  economy: 'Kompakt',
  crossover: 'Kompakt-SUV',
}

const CATEGORY_PL: Record<Car['category'], string> = {
  luxury: 'premium',
  sports: 'sportowy',
  suv: 'SUV',
  electric: 'elektryczny',
  premium: 'premium',
  economy: 'kompakt',
  crossover: 'kompaktowy SUV',
}

const CATEGORY_BY_LOCALE: Record<AppLocale, Record<Car['category'], string>> = {
  fr: CATEGORY_FR,
  en: CATEGORY_EN,
  es: CATEGORY_ES,
  de: CATEGORY_DE,
  pl: CATEGORY_PL,
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

const DETAIL_FALLBACK_SCENES_ES = [
  'vista frontal',
  'vista lateral',
  'vista trasera',
  'interior',
  'salpicadero',
  'otro ángulo',
] as const

const DETAIL_FALLBACK_SCENES_DE = [
  'Frontansicht',
  'Seitenansicht',
  'Heckansicht',
  'Innenraum',
  'Armaturenbrett',
  'weitere Perspektive',
] as const

const DETAIL_FALLBACK_SCENES_PL = [
  'widok z przodu',
  'widok z boku',
  'widok z tyłu',
  'wnętrze',
  'kokpit',
  'inny kąt',
] as const

const DETAIL_SCENES: Record<AppLocale, readonly string[]> = {
  fr: DETAIL_FALLBACK_SCENES_FR,
  en: DETAIL_FALLBACK_SCENES_EN,
  es: DETAIL_FALLBACK_SCENES_ES,
  de: DETAIL_FALLBACK_SCENES_DE,
  pl: DETAIL_FALLBACK_SCENES_PL,
}

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
  return CATEGORY_BY_LOCALE[locale][category] ?? CATEGORY_FR[category] ?? category
}

function detailFallbackScene(index: number, locale: AppLocale): string {
  const i = detailFallbackSceneIndex(index)
  const scenes = DETAIL_SCENES[locale] ?? DETAIL_SCENES.fr
  return scenes[i] ?? scenes[0]!
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
    switch (locale) {
      case 'en':
        return `${core} (${cat}) — main view, car rental`
      case 'es':
        return `${core} (${cat}) — vista principal, alquiler de coches`
      case 'de':
        return `${core} (${cat}) — Hauptansicht, Mietwagen`
      case 'pl':
        return `${core} (${cat}) — widok główny, wynajem samochodów`
      default:
        return `${core} (${cat}) — vue principale, location voiture`
    }
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
    switch (locale) {
      case 'en':
        out = `${out} · Agadir, Morocco`
        break
      case 'es':
        out = `${out} · Agadir, Marruecos`
        break
      case 'de':
        out = `${out} · Agadir, Marokko`
        break
      case 'pl':
        out = `${out} · Agadir, Maroko`
        break
      default:
        out = `${out} · Agadir, Maroc`
    }
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
  let line: string
  if (excerpt) {
    switch (locale) {
      case 'en':
        line = `${car.carName} for rent in Agadir (${cat}) — ${excerpt}`
        break
      case 'es':
        line = `${car.carName} en alquiler en Agadir (${cat}) — ${excerpt}`
        break
      case 'de':
        line = `${car.carName} mieten in Agadir (${cat}) — ${excerpt}`
        break
      case 'pl':
        line = `${car.carName} do wynajęcia w Agadirze (${cat}) — ${excerpt}`
        break
      default:
        line = `${car.carName} à louer à Agadir (${cat}) — ${excerpt}`
    }
  } else {
    switch (locale) {
      case 'en':
        line = `${core} — car rental Agadir, Morocco — ${cat} — AmseelCars`
        break
      case 'es':
        line = `${core} — alquiler coches Agadir, Marruecos — ${cat} — AmseelCars`
        break
      case 'de':
        line = `${core} — Mietwagen Agadir, Marokko — ${cat} — AmseelCars`
        break
      case 'pl':
        line = `${core} — wynajem Agadir, Maroko — ${cat} — AmseelCars`
        break
      default:
        line = `${core} — location voiture Agadir, Maroc — ${cat} — AmseelCars`
    }
  }
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

  let rental: string
  switch (locale) {
    case 'en':
      rental = `${scene}, car rental`
      break
    case 'es':
      rental = `${scene}, alquiler de coches`
      break
    case 'de':
      rental = `${scene}, Mietwagen`
      break
    case 'pl':
      rental = `${scene}, wynajem samochodów`
      break
    default:
      rental = `${scene}, location voiture`
  }
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
  let mid: string
  switch (locale) {
    case 'en':
      mid = `Rent in Agadir | AmseelCars`
      break
    case 'es':
      mid = `Alquiler en Agadir | AmseelCars`
      break
    case 'de':
      mid = `Mieten in Agadir | AmseelCars`
      break
    case 'pl':
      mid = `Wynajem w Agadirze | AmseelCars`
      break
    default:
      mid = `Louer à Agadir | AmseelCars`
  }
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
