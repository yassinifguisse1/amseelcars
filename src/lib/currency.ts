/**
 * Single source of truth for car rental currency conversion.
 * Fleet prices are stored in MAD; display currencies are EUR and USD only.
 */
export const EUR_TO_MAD_RATE = 10.7
export const USD_TO_MAD_RATE = 10

/** Currencies shown in the UI (MAD is storage only). */
export type DisplayCurrency = 'EUR' | 'USD'

/** @deprecated Prefer DisplayCurrency — MAD is not offered in the UI. */
export type CarCurrency = DisplayCurrency | 'MAD'

export function isDisplayCurrency(v: string | null | undefined): v is DisplayCurrency {
  return v === 'EUR' || v === 'USD'
}

/** Map legacy MAD preference (or anything invalid) to a display currency. */
export function resolveDisplayCurrency(
  v: string | null | undefined,
  fallback: DisplayCurrency = 'EUR',
): DisplayCurrency {
  if (isDisplayCurrency(v)) return v
  return fallback
}

export function convertCarPrice(priceInMAD: number, targetCurrency: CarCurrency): number {
  if (targetCurrency === 'EUR') {
    return Math.round(priceInMAD / EUR_TO_MAD_RATE)
  }
  if (targetCurrency === 'USD') {
    return Math.round((priceInMAD / USD_TO_MAD_RATE) * 100) / 100
  }
  return priceInMAD
}

export function formatCarPrice(price: number, currency: CarCurrency): string {
  if (currency === 'MAD') return price.toFixed(0)
  if (currency === 'EUR') return String(Math.round(price))
  return price.toFixed(2)
}

/** Display label: `€70`, `$25` (MAD only if ever passed) */
export function formatCarPriceLabel(price: number, currency: CarCurrency): string {
  const amount = formatCarPrice(price, currency)
  if (currency === 'EUR') return `€${amount}`
  if (currency === 'USD') return `$${amount}`
  return `${amount} MAD`
}

export function currencyCodeLabel(currency: CarCurrency): string {
  if (currency === 'EUR') return '€'
  if (currency === 'USD') return '$'
  return 'MAD'
}
