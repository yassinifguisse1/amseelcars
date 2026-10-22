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

export function addonLineTotal(
  addon: BookingAddonDef,
  quantity: number,
  rentalDays: number,
  currency: DisplayCurrency,
): number {
  if (quantity <= 0) return 0
  const unit = addonUnitPrice(addon.priceEur, currency)
  if (addon.billing === 'perDay') {
    const days = Math.max(1, rentalDays)
    return quantity * unit * days
  }
  return quantity * unit
}

/**
 * Price for one addon after applying a wheel gift.
 * - Most prizes: 1 unit fully free.
 * - Insurance: 2 days free when the trip is 7+ days (otherwise charged normally).
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

  if (addon.id === 'full-insurance') {
    const days = Math.max(1, rentalDays)
    if (days < 7) return full
    const freeDays = Math.min(2, days)
    const unit = addonUnitPrice(addon.priceEur, currency)
    return Math.max(0, quantity * unit * (days - freeDays))
  }

  // One free unit of the won add-on
  return addonLineTotal(addon, Math.max(0, quantity - 1), rentalDays, currency)
}

export function addonSelectionTotal(
  selection: BookingAddonSelection,
  currency: DisplayCurrency,
  rentalDays: number,
  freeAddonId?: BookingAddonId | null,
): number {
  return BOOKING_ADDONS.reduce(
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
): {
  id: BookingAddonId
  quantity: number
  priceEur: number
  billing: BookingAddonBilling
  wheelGift?: boolean
}[] {
  return BOOKING_ADDONS.filter((addon) => (selection[addon.id] ?? 0) > 0).map((addon) => {
    const isGift = freeAddonId === addon.id
    return {
      id: addon.id,
      quantity: selection[addon.id],
      // Gift unit is free for staff/email; insurance still lists base rate + wheel note
      priceEur: isGift && addon.id !== 'full-insurance' ? 0 : addon.priceEur,
      billing: addon.billing,
      ...(isGift ? { wheelGift: true } : {}),
    }
  })
}
