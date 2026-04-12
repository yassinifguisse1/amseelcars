import { getAllCars } from '@/data/cars'

/**
 * URL-safe slug from fleet `brand` string (e.g. "Citroën" → "citroen").
 */
export function brandToSlug(brand: string): string {
  return brand
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function resolveBrandFromSlug(
  slug: string,
  brands: readonly string[],
): string | undefined {
  const normalized = slug.toLowerCase()
  return brands.find((b) => brandToSlug(b) === normalized)
}

export function getFleetBrandNamesSorted(): string[] {
  const cars = getAllCars()
  return Array.from(new Set(cars.map((c) => c.brand))).sort((a, b) =>
    a.localeCompare(b, 'fr', { sensitivity: 'base' }),
  )
}

export function getFleetBrandSlugsSorted(): string[] {
  return getFleetBrandNamesSorted().map(brandToSlug)
}
