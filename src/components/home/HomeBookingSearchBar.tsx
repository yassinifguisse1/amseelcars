'use client';

import { useEffect, useMemo, useState } from 'react';
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

  useEffect(() => {
    if (!hasBookingQuery(searchParams)) return;
    setValues(parseBookingSearchParams(searchParams));
  }, [searchParams]);

  const setField = <K extends keyof BookingSearchValues>(key: K, value: BookingSearchValues[K]) => {
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

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.pickupDate || !values.returnDate || !values.pickupLocation) return;

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
    'h-11 w-full rounded-md border-0 bg-white px-3 text-sm font-medium text-stone-900 shadow-sm ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-white';

  return (
    <section
      className={cn(
        'relative z-10 w-full bg-black px-4 py-6 sm:px-6 sm:py-8',
        className,
      )}
      aria-label={t('ariaLabel')}
    >
      <form
        onSubmit={onSearch}
        className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-[#b11226] text-white shadow-[0_16px_48px_rgba(177,18,38,0.35)]"
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-white/20 bg-[#941020] px-4 py-2.5 text-sm text-white">
          <Plane className="h-4 w-4 shrink-0 text-white" aria-hidden />
          <button
            type="button"
            className="text-left font-medium text-white underline-offset-2 hover:underline"
            onClick={() => {
              setField('pickupLocation', 'aeroport-al-massira');
              if (values.sameReturn) setField('returnLocation', 'aeroport-al-massira');
            }}
          >
            {t('airportHint')}
          </button>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.1fr_1.1fr_auto] lg:items-end lg:gap-3 lg:p-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-white/90">
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
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-white/90">
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

          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white/90">
              {t('pickupDate')}
            </span>
            <div className="flex gap-2 [&_button]:h-11 [&_button]:border-0 [&_button]:bg-white [&_button]:text-stone-900 [&_button]:shadow-sm [&_button]:ring-1 [&_button]:ring-black/5">
              <div className="min-w-0 flex-1">
                <BookingFormDateField
                  id="home-pickup-date"
                  value={values.pickupDate}
                  onChange={(iso) => setField('pickupDate', iso)}
                  onBlur={() => {}}
                  placeholder={tBooking('datePlaceholder')}
                  openCalendarAria={tBooking('calendarOpenAria')}
                  locale={locale}
                />
              </div>
              <select
                className={cn(fieldClass, 'w-[5.5rem] shrink-0')}
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

          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white/90">
              {t('returnDate')}
            </span>
            <div className="flex gap-2 [&_button]:h-11 [&_button]:border-0 [&_button]:bg-white [&_button]:text-stone-900 [&_button]:shadow-sm [&_button]:ring-1 [&_button]:ring-black/5">
              <div className="min-w-0 flex-1">
                <BookingFormDateField
                  id="home-return-date"
                  value={values.returnDate}
                  onChange={(iso) => setField('returnDate', iso)}
                  onBlur={() => {}}
                  placeholder={tBooking('datePlaceholder')}
                  openCalendarAria={tBooking('calendarOpenAria')}
                  locale={locale}
                />
              </div>
              <select
                className={cn(fieldClass, 'w-[5.5rem] shrink-0')}
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
            className="h-11 w-full bg-white px-5 font-semibold text-[#b11226] hover:bg-stone-100 lg:w-auto"
          >
            <Search className="h-4 w-4" />
            {t('search')}
          </Button>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/20 px-4 py-3 text-sm text-white/95 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-white/40 bg-white text-[#b11226] focus:ring-white"
              checked={values.sameReturn}
              onChange={(e) => setField('sameReturn', e.target.checked)}
            />
            <span>{t('sameReturn')}</span>
          </label>
          <p className="text-xs text-white/80">{t('driverNote')}</p>
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
