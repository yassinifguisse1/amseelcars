/** Shared booking location values used by home search + BookingDialog + API. */
export const BOOKING_LOCATION_VALUES = [
  'agadir-centre',
  'aeroport-al-massira',
  'taghazout',
  'agence',
] as const;

export type BookingLocationValue = (typeof BOOKING_LOCATION_VALUES)[number];

export function isBookingLocation(value: string): value is BookingLocationValue {
  return (BOOKING_LOCATION_VALUES as readonly string[]).includes(value);
}

export const BOOKING_LOCATION_LABELS_FR: Record<BookingLocationValue, string> = {
  'agadir-centre': 'Agadir Centre',
  'aeroport-al-massira': 'Aéroport Al Massira',
  taghazout: 'Taghazout',
  agence: 'Agence',
};

/** Half-hour slots for pickup / return times. */
export const BOOKING_TIME_SLOTS: string[] = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});
