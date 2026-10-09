'use client';

import { useEffect, useMemo, useState } from 'react';
import { addDays, parse, startOfToday } from 'date-fns';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Plane, Search } from 'lucide-react';
import { BookingFormDateField } from '@/components/BookingDialog/BookingFormDateField';
import { Button } from '@/components/ui/button';
import { BOOKING_TIME_SLOTS } from '@/lib/bookingLocations';
import {
  bookingSearchToQuery,
  defaultBookingSearchDates,
  parseBookingSearchParams,
  type BookingSearchValues,
} from '@/lib/bookingSearchParams';
import { MIN_RENTAL_DAYS, meetsMinRentalDays, rentalDayCount } from '@/lib/rentalPolicy';
import { trackEvent } from '@/lib/trackEvent';
import { cn } from '@/lib/utils';

export function HomeBookingSearchBar({ className }: { className?: string }) {
  const t = useTranslations('homeBookingSearch');
  const tBooking = useTranslations('booking');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const locationOptions = useMemo(
    () => [
      { value: 'aeroport-al-massira', label: tBooking('locAirport') },
      { value: 'agadir-centre', label: tBooking('locAgadirCentre') },
      { value: 'taghazout', label: tBooking('locTaghazout') },
      { value: 'agence', label: tBooking('locAgency') },
    ],
    [tBooking],
  );

  const [values, setValues] = useState<BookingSearchValues>(() => {
    const parsed = parseBookingSearchParams(searchParams);
    if (!searchParams.get('pickupDate')) {
      return { ...parsed, ...defaultBookingSearchDates() };
    }
    return parsed;
  });
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    if (!hasBookingQuery(searchParams)) return;
    setValues(parseBookingSearchParams(searchParams));
  }, [searchParams]);

  const setField = <K extends keyof BookingSearchValues>(key: K, value: BookingSearchValues[K]) => {
    setDateError('');
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'pickupLocation' && prev.sameReturn) {
        next.returnLocation = value as BookingSearchValues['returnLocation'];
      }
      if (key === 'sameReturn' && value === true) {
        next.returnLocation = prev.pickupLocation;
      }
      return next;
    });
  };

  const returnDisabled = values.pickupDate
    ? {
        before: addDays(parse(values.pickupDate, 'yyyy-MM-dd', new Date()), MIN_RENTAL_DAYS),
      }
    : { before: addDays(startOfToday(), MIN_RENTAL_DAYS) };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.pickupDate || !values.returnDate || !values.pickupLocation) return;

    const days = rentalDayCount(values.pickupDate, values.returnDate);
    if (!meetsMinRentalDays(days)) {
      setDateError(tBooking('errMinRentalDays'));
      return;
    }

    const query = bookingSearchToQuery({
      ...values,
      returnLocation: values.sameReturn ? values.pickupLocation : values.returnLocation,
    });

    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(query)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    if (values.sameReturn) params.delete('return');

    trackEvent({
      event: 'scroll-reservation',
      path: pathname,
      source: 'home-booking-search',
      pickupDate: values.pickupDate,
      returnDate: values.returnDate,
      pickupLocation: values.pickupLocation,
      returnLocation: values.sameReturn ? values.pickupLocation : values.returnLocation,
      metadata: {
        pickupTime: values.pickupTime,
        returnTime: values.returnTime,
      },
    });

    router.push(`${pathname}?${params.toString()}#cars`, { scroll: false });
    requestAnimationFrame(() => {
      document.getElementById('cars')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const fieldClass =
    'h-9 w-full rounded-md border-0 bg-white px-2.5 text-xs font-medium text-stone-900 shadow-sm ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-white sm:h-11 sm:px-3 sm:text-sm';

  return (
    <section
      id="home-booking"
      className={cn(
        'relative z-10 w-full scroll-mt-20 bg-white px-4 py-6 sm:px-6 sm:py-8',
        className,
      )}
      aria-label={t('ariaLabel')}
    >
      <form
        onSubmit={onSearch}
        className="mx-auto max-w-6xl overflow-hidden rounded-xl bg-[#b11226] text-white shadow-[0_16px_48px_rgba(177,18,38,0.35)] sm:rounded-2xl"
      >
        <div className="flex items-start gap-1.5 border-b border-white/20 bg-[#941020] px-2.5 py-1.5 text-[11px] leading-snug text-white sm:items-center sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm">
          <Plane className="mt-0.5 h-3 w-3 shrink-0 text-white sm:mt-0 sm:h-4 sm:w-4" aria-hidden />
          <button
            type="button"
            className="min-w-0 text-left font-medium text-white underline-offset-2 hover:underline"
            onClick={() => {
              setField('pickupLocation', 'aeroport-al-massira');
              if (values.sameReturn) setField('returnLocation', 'aeroport-al-massira');
            }}
          >
            {t('airportHint')}
          </button>
        </div>

        <div className="grid gap-1.5 p-2.5 sm:grid-cols-2 sm:gap-3 sm:p-4 lg:grid-cols-[1.2fr_1.1fr_1.1fr_auto] lg:items-end lg:p-5">
          <div className="space-y-0.5 sm:space-y-1">
            <label className="text-[9px] font-semibold uppercase tracking-wide text-white/90 sm:text-[11px]">
              {t('pickupLocation')}
            </label>
            <select
              className={fieldClass}
              value={values.pickupLocation}
              onChange={(e) => setField('pickupLocation', e.target.value as BookingSearchValues['pickupLocation'])}
              required
            >
              {locationOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {!values.sameReturn ? (
            <div className="space-y-0.5 sm:col-span-2 sm:space-y-1 lg:col-span-1">
              <label className="text-[9px] font-semibold uppercase tracking-wide text-white/90 sm:text-[11px]">
                {t('returnLocation')}
              </label>
              <select
                className={fieldClass}
                value={values.returnLocation}
                onChange={(e) =>
                  setField('returnLocation', e.target.value as BookingSearchValues['returnLocation'])
                }
                required
              >
                {locationOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="space-y-0.5 sm:space-y-1">
            <span className="text-[9px] font-semibold uppercase tracking-wide text-white/90 sm:text-[11px]">
              {t('pickupDate')}
            </span>
            <div className="grid grid-cols-[minmax(0,1fr)_4.25rem] gap-1 sm:flex sm:gap-2 sm:[&_button]:h-11 [&_button]:h-9 [&_button]:w-full [&_button]:border-0 [&_button]:bg-white [&_button]:text-stone-900 [&_button]:shadow-sm [&_button]:ring-1 [&_button]:ring-black/5 [&_button]:text-xs sm:[&_button]:text-sm">
              <div className="min-w-0">
                <BookingFormDateField
                  id="home-pickup-date"
                  value={values.pickupDate}
                  onChange={(iso) => setField('pickupDate', iso)}
                  onBlur={() => {}}
                  placeholder={tBooking('datePlaceholder')}
                  openCalendarAria={tBooking('calendarOpenAria')}
                  locale={locale}
                  compactMobile
                />
              </div>
              <select
                className={cn(fieldClass, 'w-full shrink-0 px-1.5 sm:w-[5.5rem] sm:px-3')}
                value={values.pickupTime}
                onChange={(e) => setField('pickupTime', e.target.value)}
                aria-label={t('pickupTime')}
              >
                {BOOKING_TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-0.5 sm:space-y-1">
            <span className="text-[9px] font-semibold uppercase tracking-wide text-white/90 sm:text-[11px]">
              {t('returnDate')}
            </span>
            <div className="grid grid-cols-[minmax(0,1fr)_4.25rem] gap-1 sm:flex sm:gap-2 sm:[&_button]:h-11 [&_button]:h-9 [&_button]:w-full [&_button]:border-0 [&_button]:bg-white [&_button]:text-stone-900 [&_button]:shadow-sm [&_button]:ring-1 [&_button]:ring-black/5 [&_button]:text-xs sm:[&_button]:text-sm">
              <div className="min-w-0">
                <BookingFormDateField
                  id="home-return-date"
                  value={values.returnDate}
                  onChange={(iso) => setField('returnDate', iso)}
                  onBlur={() => {}}
                  placeholder={tBooking('datePlaceholder')}
                  openCalendarAria={tBooking('calendarOpenAria')}
                  locale={locale}
                  disabled={returnDisabled}
                  compactMobile
                />
              </div>
              <select
                className={cn(fieldClass, 'w-full shrink-0 px-1.5 sm:w-[5.5rem] sm:px-3')}
                value={values.returnTime}
                onChange={(e) => setField('returnTime', e.target.value)}
                aria-label={t('returnTime')}
              >
                {BOOKING_TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            type="submit"
            className="mt-0.5 h-10 w-full bg-white px-4 text-sm font-semibold text-[#b11226] hover:bg-stone-100 sm:mt-0 sm:h-11 sm:px-5 sm:text-sm lg:w-auto"
          >
            <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {t('search')}
          </Button>
        </div>

        {dateError ? (
          <p className="border-t border-white/20 bg-[#941020] px-3 py-2 text-sm text-amber-100 sm:px-5">
            {dateError}
          </p>
        ) : null}

        <div className="flex flex-col gap-1 border-t border-white/20 px-2.5 py-2 text-[11px] text-white/95 sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:px-5 sm:py-3 sm:text-sm">
          <label className="inline-flex cursor-pointer items-start gap-2 sm:items-center">
            <input
              type="checkbox"
              className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-white/40 bg-white text-[#b11226] focus:ring-white sm:mt-0 sm:h-4 sm:w-4"
              checked={values.sameReturn}
              onChange={(e) => setField('sameReturn', e.target.checked)}
            />
            <span className="leading-snug">{t('sameReturn')}</span>
          </label>
          <p className="text-[10px] leading-snug text-white/80 sm:text-xs">{t('driverNote')}</p>
        </div>
      </form>
    </section>
  );
}

function hasBookingQuery(searchParams: URLSearchParams) {
  return Boolean(
    searchParams.get('pickupDate') ||
      searchParams.get('pickup') ||
      searchParams.get('returnDate'),
  );
}
