/**
 * Single source of truth for car rental currency conversion.
 * Used by CarGridSection (listing) and CarDetailClient (detail page) so prices match.
 */
export const EUR_TO_MAD_RATE = 10.7
export const USD_TO_MAD_RATE = 10

export type CarCurrency = 'MAD' | 'EUR' | 'USD'

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
  return price.toFixed(currency === 'MAD' ? 0 : 2)
}
