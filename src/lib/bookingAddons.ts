import { EUR_TO_MAD_RATE, USD_TO_MAD_RATE, type DisplayCurrency } from '@/lib/currency'

export type BookingAddonId =
  | 'full-insurance'
  | 'extra-child-seat'
  | 'additional-driver'
  | 'surfboard-roof-racks'
  | 'child-seat'
  | 'rooftop-cargo'

export type BookingAddonMessageKey =
  | 'fullInsurance'
  | 'extraChildSeat'
  | 'additionalDriver'
  | 'surfboardRoofRacks'
  | 'childSeat'
  | 'rooftopCargo'

export const BOOKING_ADDON_MESSAGE_KEYS: Record<BookingAddonId, BookingAddonMessageKey> = {
  'full-insurance': 'fullInsurance',
  'extra-child-seat': 'extraChildSeat',
  'additional-driver': 'additionalDriver',
  'surfboard-roof-racks': 'surfboardRoofRacks',
  'child-seat': 'childSeat',
  'rooftop-cargo': 'rooftopCargo',
}

export type BookingAddonBilling = 'perDay' | 'flat'

export type BookingAddonDef = {
  id: BookingAddonId
  max: number
  /** Unit price in EUR (per day when billing is perDay). */
  priceEur: number
  billing: BookingAddonBilling
}

export const BOOKING_ADDONS: BookingAddonDef[] = [
  { id: 'full-insurance', max: 1, priceEur: 10, billing: 'perDay' },
  { id: 'child-seat', max: 1, priceEur: 2, billing: 'perDay' },
  { id: 'extra-child-seat', max: 1, priceEur: 2, billing: 'perDay' },
  { id: 'additional-driver', max: 1, priceEur: 0, billing: 'flat' },
  { id: 'surfboard-roof-racks', max: 1, priceEur: 2, billing: 'perDay' },
  { id: 'rooftop-cargo', max: 1, priceEur: 3, billing: 'perDay' },
]

/** Car fields used to pick the no-deposit / insurance daily rate. */
export type InsurancePriceCar = {
  carName?: string | null
  brand?: string | null
  category?: string | null
  slug?: string | null
  model?: string | null
}

/**
 * Full insurance / sans-caution daily price by vehicle class:
 * - €20: BMW, Golf 8
 * - €15: larger cars (T-Roc, SUV, Sportage, Aircross, Touareg, …)
 * - €10: small cars (Dacia, Clio, Picanto, C3, …)
 */
export function fullInsurancePriceEur(car?: InsurancePriceCar | null): number {
  const blob = [
    car?.carName,
    car?.brand,
    car?.slug,
    car?.model,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  const category = (car?.category ?? '').toLowerCase()

  if (
    /\bbmw\b/.test(blob) ||
    /golf[\s_-]*8/.test(blob) ||
    blob.includes('golf8')
  ) {
    return 20
  }

  const isSmall =
    category === 'economy' ||
    blob.includes('dacia') ||
    blob.includes('logan') ||
    blob.includes('stepway') ||
    blob.includes('picanto') ||
    blob.includes('i10') ||
    blob.includes('clio') ||
    blob.includes('c3-normal') ||
    blob.includes('c3 normal') ||
    (/(citro[eë]n|citroen)/.test(blob) &&
      blob.includes('c3') &&
      !blob.includes('aircross'))

  if (isSmall) return 10

  if (
    category === 'suv' ||
    category === 'premium' ||
    category === 'luxury' ||
    category === 'crossover' ||
    blob.includes('t-roc') ||
    blob.includes('troc') ||
    blob.includes('touareg') ||
    blob.includes('sportage') ||
    blob.includes('aircross') ||
    blob.includes('c4')
  ) {
    return 15
  }

  return 10
}

/** Addon catalog with insurance price set for this car. */
export function bookingAddonsForCar(
  car?: InsurancePriceCar | null,
): BookingAddonDef[] {
  const insurancePrice = fullInsurancePriceEur(car)
  return BOOKING_ADDONS.map((addon) =>
    addon.id === 'full-insurance'
      ? { ...addon, priceEur: insurancePrice }
      : addon,
  )
}

export type BookingAddonSelection = Record<BookingAddonId, number>

export function emptyAddonSelection(): BookingAddonSelection {
  return {
    'full-insurance': 0,
    'extra-child-seat': 0,
    'additional-driver': 0,
    'surfboard-roof-racks': 0,
    'child-seat': 0,
    'rooftop-cargo': 0,
  }
}

export function addonUnitPrice(priceEur: number, currency: DisplayCurrency): number {
  if (currency === 'USD') {
    return Math.round(((priceEur * EUR_TO_MAD_RATE) / USD_TO_MAD_RATE) * 100) / 100
  }
  return priceEur
}

/** Full insurance is always billed for at least 7 days. */
export const FULL_INSURANCE_MIN_DAYS = 7

export function addonBillableDays(
  addon: BookingAddonDef,
  rentalDays: number,
): number {
  const days = Math.max(1, rentalDays)
  if (addon.id === 'full-insurance') {
    return Math.max(days, FULL_INSURANCE_MIN_DAYS)
  }
  return days
}

export function addonLineTotal(
  addon: BookingAddonDef,
  quantity: number,
  rentalDays: number,
  currency: DisplayCurrency,
): number {
  if (quantity <= 0) return 0
  const unit = addonUnitPrice(addon.priceEur, currency)
  if (addon.billing === 'perDay') {
    return quantity * unit * addonBillableDays(addon, rentalDays)
  }
  return quantity * unit
}

/** Wheel gifts: 2 days free when the trip is 7+ days (same rule for every prize). */
export const WHEEL_GIFT_FREE_DAYS = 2
export const WHEEL_GIFT_MIN_RENTAL_DAYS = 7

/**
 * Price for one addon after applying a wheel gift.
 * All wheel prizes: 2 days free if rental is 7+ days; otherwise charged normally.
 * Flat / already-free add-ons stay €0.
 */
export function addonLineTotalWithWheelGift(
  addon: BookingAddonDef,
  quantity: number,
  rentalDays: number,
  currency: DisplayCurrency,
  freeAddonId?: BookingAddonId | null,
): number {
  const full = addonLineTotal(addon, quantity, rentalDays, currency)
  if (!freeAddonId || addon.id !== freeAddonId || quantity <= 0 || full <= 0) {
    return full
  }

  const rental = Math.max(1, rentalDays)
  if (rental < WHEEL_GIFT_MIN_RENTAL_DAYS) return full

  if (addon.billing === 'perDay') {
    const billable = addonBillableDays(addon, rentalDays)
    const freeDays = Math.min(WHEEL_GIFT_FREE_DAYS, billable)
    const unit = addonUnitPrice(addon.priceEur, currency)
    return Math.max(0, quantity * unit * (billable - freeDays))
  }

  // Flat-priced gift (e.g. already-free additional driver): no charge
  return 0
}

export function addonSelectionTotal(
  selection: BookingAddonSelection,
  currency: DisplayCurrency,
  rentalDays: number,
  freeAddonId?: BookingAddonId | null,
  car?: InsurancePriceCar | null,
): number {
  return bookingAddonsForCar(car).reduce(
    (sum, addon) =>
      sum +
      addonLineTotalWithWheelGift(
        addon,
        selection[addon.id] ?? 0,
        rentalDays,
        currency,
        freeAddonId,
      ),
    0,
  )
}

export function selectedAddonsList(
  selection: BookingAddonSelection,
  freeAddonId?: BookingAddonId | null,
  car?: InsurancePriceCar | null,
): {
  id: BookingAddonId
  quantity: number
  priceEur: number
  billing: BookingAddonBilling
  wheelGift?: boolean
}[] {
  return bookingAddonsForCar(car)
    .filter((addon) => (selection[addon.id] ?? 0) > 0)
    .map((addon) => {
      const isGift = freeAddonId === addon.id
      return {
        id: addon.id,
        quantity: selection[addon.id],
        // Keep list price; booking total applies 2 free days when trip is 7+
        priceEur: addon.priceEur,
        billing: addon.billing,
        ...(isGift ? { wheelGift: true } : {}),
      }
    })
}
