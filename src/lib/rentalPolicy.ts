/** Minimum rental length in days (5+ only; short 1–4 day hires are not accepted). */
export const MIN_RENTAL_DAYS = 5;

export function rentalDayCount(pickupDate: string, returnDate: string): number {
  if (!pickupDate || !returnDate) return 0;
  const pickup = new Date(pickupDate);
  const ret = new Date(returnDate);
  if (Number.isNaN(pickup.getTime()) || Number.isNaN(ret.getTime())) return 0;
  const diffTime = Math.abs(ret.getTime() - pickup.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function meetsMinRentalDays(days: number): boolean {
  return days >= MIN_RENTAL_DAYS;
}
