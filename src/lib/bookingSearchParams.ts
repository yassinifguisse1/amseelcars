import { addDays, format, isValid, parse, startOfToday } from 'date-fns';
import { isBookingLocation, type BookingLocationValue } from '@/lib/bookingLocations';

export type BookingSearchValues = {
  pickupLocation: BookingLocationValue | '';
  returnLocation: BookingLocationValue | '';
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
  sameReturn: boolean;
};

export const BOOKING_SEARCH_DEFAULTS: BookingSearchValues = {
  pickupLocation: 'aeroport-al-massira',
  returnLocation: 'aeroport-al-massira',
  pickupDate: '',
  returnDate: '',
  pickupTime: '10:00',
  returnTime: '10:00',
  sameReturn: true,
};

export function defaultBookingSearchDates(): Pick<BookingSearchValues, 'pickupDate' | 'returnDate'> {
  const pickup = addDays(startOfToday(), 1);
  const ret = addDays(pickup, 7);
  return {
    pickupDate: format(pickup, 'yyyy-MM-dd'),
    returnDate: format(ret, 'yyyy-MM-dd'),
  };
}

function sanitizeDate(raw: string | null | undefined): string {
  if (!raw?.trim()) return '';
  const d = parse(raw.trim(), 'yyyy-MM-dd', new Date());
  return isValid(d) ? format(d, 'yyyy-MM-dd') : '';
}

function sanitizeTime(raw: string | null | undefined): string {
  if (!raw?.trim()) return '';
  return /^\d{2}:\d{2}$/.test(raw.trim()) ? raw.trim() : '';
}

/** Read booking search from URLSearchParams (home → cars → booking). */
export function parseBookingSearchParams(
  searchParams: URLSearchParams | { get: (key: string) => string | null },
): BookingSearchValues {
  const dates = defaultBookingSearchDates();
  const pickupRaw = searchParams.get('pickup')?.trim() || '';
  const returnRaw = searchParams.get('return')?.trim() || '';
  const sameRaw = searchParams.get('sameReturn');
  const sameReturn = sameRaw === null ? returnRaw === '' || returnRaw === pickupRaw : sameRaw !== '0';

  const pickupLocation = isBookingLocation(pickupRaw) ? pickupRaw : BOOKING_SEARCH_DEFAULTS.pickupLocation;
  const returnLocation = sameReturn
    ? pickupLocation
    : isBookingLocation(returnRaw)
      ? returnRaw
      : pickupLocation;

  return {
    pickupLocation,
    returnLocation,
    pickupDate: sanitizeDate(searchParams.get('pickupDate')) || dates.pickupDate,
    returnDate: sanitizeDate(searchParams.get('returnDate')) || dates.returnDate,
    pickupTime: sanitizeTime(searchParams.get('pickupTime')) || BOOKING_SEARCH_DEFAULTS.pickupTime,
    returnTime: sanitizeTime(searchParams.get('returnTime')) || BOOKING_SEARCH_DEFAULTS.returnTime,
    sameReturn,
  };
}

export function bookingSearchToQuery(values: BookingSearchValues): Record<string, string> {
  const query: Record<string, string> = {
    pickup: values.pickupLocation || '',
    pickupDate: values.pickupDate,
    returnDate: values.returnDate,
    pickupTime: values.pickupTime,
    returnTime: values.returnTime,
    sameReturn: values.sameReturn ? '1' : '0',
  };
  if (!values.sameReturn && values.returnLocation) {
    query.return = values.returnLocation;
  }
  return query;
}

export function hasActiveBookingSearch(searchParams: URLSearchParams): boolean {
  return Boolean(
    searchParams.get('pickupDate') ||
      searchParams.get('returnDate') ||
      searchParams.get('pickup') ||
      searchParams.get('pickupTime'),
  );
}
