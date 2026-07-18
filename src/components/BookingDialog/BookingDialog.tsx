"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { addDays, parse, startOfToday } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, MapPin, CreditCard } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/trackEvent';
import { useBookingAbandonTracking } from '@/hooks/useBookingAbandonTracking';
import { track } from '@vercel/analytics/react';
import styles from './BookingDialog.module.css';
import { BookingFormDateField } from './BookingFormDateField';
import { BOOKING_TIME_SLOTS } from '@/lib/bookingLocations';
import { parseBookingSearchParams } from '@/lib/bookingSearchParams';

type BookingFormData = {
  fullName: string;
  email: string;
  phone: string;
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
  pickupLocation: string;
  returnLocation: string;
};

function buildBookingSchema(t: (key: string) => string) {
  return z
    .object({
      fullName: z.string().min(2, t('errFullName')),
      email: z.string().email(t('errEmail')),
      phone: z.string().min(10, t('errPhone')),
      pickupDate: z.string().min(1, t('errPickupDate')),
      returnDate: z.string().min(1, t('errReturnDate')),
      pickupTime: z.string().min(1, t('errPickupTime')),
      returnTime: z.string().min(1, t('errReturnTime')),
      pickupLocation: z.string().min(1, t('errPickupLoc')),
      returnLocation: z.string().min(1, t('errReturnLoc')),
    })
    .refine(
      (data) => {
        const pickup = new Date(`${data.pickupDate}T${data.pickupTime || '00:00'}`);
        const returnDate = new Date(`${data.returnDate}T${data.returnTime || '00:00'}`);
        return returnDate > pickup;
      },
      { message: t('errReturnAfterPickup'), path: ['returnDate'] }
    );
}

interface BookingDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  carName: string;
  carPrice: number;
  carSlug?: string;
  /** Optional tiered pricing: shortTerm (1–4 days), longTerm (5+ days). When set, total uses longTerm for 5+ days. */
  pricing?: {
    shortTerm: number;
    longTerm: number;
    hasDiscount: boolean;
  };
  /** When true, render the form inline on the page instead of in a modal */
  inline?: boolean;
  /** Optional content rendered below the submit button when inline (e.g. WhatsApp button) */
  extraActions?: React.ReactNode;
}

/**
 * Render a booking dialog or inline reservation form for a car and handle user input, validation, pricing calculation, and submission.
 *
 * The component validates form fields, computes rental days and total price (uses `pricing.longTerm` when `pricing?.hasDiscount` is true and rental is 5 or more days, otherwise uses `pricing.shortTerm` or `carPrice`), and POSTs the booking payload to `/api/booking`. On successful submission the form is reset and the component either auto-closes (modal mode) or clears its success state after a delay (inline mode). While submitting, the UI shows a loading state and prevents the dialog from closing.
 *
 * @param isOpen - If false, the modal dialog is not rendered; defaults to `true`.
 * @param onClose - Callback invoked when the dialog is closed.
 * @param carName - Display name of the car being booked.
 * @param carPrice - Base price per day used as a fallback when `pricing` is not provided.
 * @param pricing - Optional tiered pricing object. If `hasDiscount` is true and the rental duration is 5 or more days, `longTerm` is used as the per-day rate; otherwise `shortTerm` is used when available.
 * @param inline - When true, render a compact inline reservation card instead of a modal; defaults to `false`.
 * @param extraActions - Optional React node rendered below the submit controls in inline mode.
 * @returns The dialog or inline reservation form as a React element.
 */
export default function BookingDialog({ 
  isOpen = true, 
  onClose = () => {}, 
  carName, 
  carPrice,
  carSlug,
  pricing,
  inline = false,
  extraActions,
}: BookingDialogProps) {
  const locale = useLocale();
  const t = useTranslations('booking');
  const searchParams = useSearchParams();
  const bookingDefaults = useMemo(() => parseBookingSearchParams(searchParams), [searchParams]);
  const bookingSchema = useMemo(() => buildBookingSchema((k) => t(k as Parameters<typeof t>[0])), [t]);
  const locationOptions = useMemo(
    () => [
      { value: '', label: t('locSelect') },
      { value: 'agadir-centre', label: t('locAgadirCentre') },
      { value: 'aeroport-al-massira', label: t('locAirport') },
      { value: 'taghazout', label: t('locTaghazout') },
      { value: 'agence', label: t('locAgency') },
    ],
    [t]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const contentRef = useRef<HTMLDivElement>(null);

  const defaultValues = useMemo<BookingFormData>(
    () => ({
      fullName: '',
      email: '',
      phone: '',
      pickupDate: bookingDefaults.pickupDate,
      returnDate: bookingDefaults.returnDate,
      pickupTime: bookingDefaults.pickupTime,
      returnTime: bookingDefaults.returnTime,
      pickupLocation: bookingDefaults.pickupLocation || '',
      returnLocation: bookingDefaults.returnLocation || bookingDefaults.pickupLocation || '',
    }),
    [bookingDefaults],
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    getValues,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues,
  });

  useEffect(() => {
    reset({
      ...getValues(),
      pickupDate: defaultValues.pickupDate,
      returnDate: defaultValues.returnDate,
      pickupTime: defaultValues.pickupTime,
      returnTime: defaultValues.returnTime,
      pickupLocation: defaultValues.pickupLocation || getValues('pickupLocation'),
      returnLocation: defaultValues.returnLocation || getValues('returnLocation'),
    });
    // Prefill from home search URL when dialog opens / params change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues.pickupDate, defaultValues.returnDate, defaultValues.pickupLocation, defaultValues.returnLocation, defaultValues.pickupTime, defaultValues.returnTime, isOpen]);

  const formValues = watch();
  const watchedPickupDate = watch('pickupDate');
  const watchedReturnDate = watch('returnDate');

  const calculateRentalDetails = () => {
    if (!watchedPickupDate || !watchedReturnDate) return { days: 0, total: 0 };
    
    const pickup = new Date(watchedPickupDate);
    const returnDate = new Date(watchedReturnDate);
    const diffTime = Math.abs(returnDate.getTime() - pickup.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const pricePerDay =
      pricing?.hasDiscount && days >= 5
        ? pricing.longTerm
        : (pricing?.shortTerm ?? carPrice);
    const total = days * pricePerDay;
    
    return { days, total };
  };

  const { days, total } = calculateRentalDetails();

  const { sendAbandoned, markSubmitted } = useBookingAbandonTracking({
    carName,
    carSlug,
    isActive: inline || isOpen,
    rentalDays: days,
    totalPrice: total,
    getValues,
    watchValues: formValues,
    isSubmitting,
    submitSucceeded: submitStatus === 'success',
  });

  const pickupDisabled = { before: startOfToday() };
  const returnDisabled = watchedPickupDate
    ? {
        before: addDays(parse(watchedPickupDate, 'yyyy-MM-dd', new Date()), 1),
      }
    : { before: startOfToday() };

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    markSubmitted();
    trackEvent({
      event: 'booking-submit',
      path,
      source: 'booking-form',
      carName,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      pickupDate: data.pickupDate,
      returnDate: data.returnDate,
      pickupLocation: data.pickupLocation,
      returnLocation: data.returnLocation,
      rentalDays: days,
      totalPrice: total,
    });

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          carName,
          carPrice,
          rentalDays: days,
          totalPrice: total,
        }),
      });

      if (response.ok) {
        trackEvent({
          event: 'booking-confirmed',
          path,
          source: 'booking-form',
          carName,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          pickupDate: data.pickupDate,
          returnDate: data.returnDate,
          pickupLocation: data.pickupLocation,
          returnLocation: data.returnLocation,
          rentalDays: days,
          totalPrice: total,
        });
        track('Booking Confirmed', {
          car: carName,
          path,
          days,
          total,
        });
        setSubmitStatus('success');
        reset();
        // Auto close after 3 seconds only when in modal mode
        if (!inline) {
          setTimeout(() => {
            onClose?.();
            setSubmitStatus('idle');
          }, 3000);
        } else {
          setTimeout(() => setSubmitStatus('idle'), 5000);
        }
      } else {
        trackEvent({
          event: 'booking-error',
          path,
          source: 'booking-form',
          carName,
          metadata: { status: response.status },
        });
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      trackEvent({
        event: 'booking-error',
        path,
        source: 'booking-form',
        carName,
        metadata: { reason: 'network' },
      });
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      sendAbandoned('dialog-close');
      onClose?.();
      setSubmitStatus('idle');
      reset();
    }
  };

  // Non-passive wheel listener so preventDefault() works when at scroll bounds (React's onWheel is passive)
  useEffect(() => {
    if (!isOpen) return;
    const el = contentRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
      const { scrollTop, scrollHeight, clientHeight } = el;
      const isAtTop = scrollTop === 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight;
      if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
        e.preventDefault();
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [isOpen]);

  const formContent = (
    <>
                {submitStatus === 'success' ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('successTitle')}</h3>
                    <p className="text-gray-600">{t('successBody')}</p>
                  </motion.div>
                ) : (
                  <form key={locale} onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                    {/* Rental Dates - first */}
                    <p className="text-sm text-gray-600 -mt-1 mb-2">
                      {t('introBlurb')}
                    </p>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {t('sectionDates')}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="booking-pickup-date"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            {t('pickupDate')}
                          </label>
                          <div className="flex gap-2">
                            <div className="min-w-0 flex-1">
                              <Controller
                                name="pickupDate"
                                control={control}
                                render={({ field }) => (
                                  <BookingFormDateField
                                    id="booking-pickup-date"
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    disabled={pickupDisabled}
                                    placeholder={t('datePlaceholder')}
                                    openCalendarAria={t('calendarOpenAria')}
                                    locale={locale}
                                    error={errors.pickupDate?.message}
                                  />
                                )}
                              />
                            </div>
                            <select
                              {...register('pickupTime')}
                              aria-label={t('pickupTime')}
                              className="w-[5.75rem] shrink-0 rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                            >
                              {BOOKING_TIME_SLOTS.map((slot) => (
                                <option key={slot} value={slot}>
                                  {slot}
                                </option>
                              ))}
                            </select>
                          </div>
                          {errors.pickupTime && (
                            <p className="text-sm text-red-500">{errors.pickupTime.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="booking-return-date"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            {t('returnDate')}
                          </label>
                          <div className="flex gap-2">
                            <div className="min-w-0 flex-1">
                              <Controller
                                name="returnDate"
                                control={control}
                                render={({ field }) => (
                                  <BookingFormDateField
                                    id="booking-return-date"
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    disabled={returnDisabled}
                                    placeholder={t('datePlaceholder')}
                                    openCalendarAria={t('calendarOpenAria')}
                                    locale={locale}
                                    error={errors.returnDate?.message}
                                  />
                                )}
                              />
                            </div>
                            <select
                              {...register('returnTime')}
                              aria-label={t('returnTime')}
                              className="w-[5.75rem] shrink-0 rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                            >
                              {BOOKING_TIME_SLOTS.map((slot) => (
                                <option key={slot} value={slot}>
                                  {slot}
                                </option>
                              ))}
                            </select>
                          </div>
                          {errors.returnTime && (
                            <p className="text-sm text-red-500">{errors.returnTime.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Locations - second */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        {t('sectionLocations')}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('pickupLocation')}
                          </label>
                          <select
                            {...register('pickupLocation')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          >
                            {locationOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {errors.pickupLocation && (
                            <p className="text-red-500 text-sm mt-1">{errors.pickupLocation.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('returnLocation')}
                          </label>
                          <select
                            {...register('returnLocation')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          >
                            {locationOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {errors.returnLocation && (
                            <p className="text-red-500 text-sm mt-1">{errors.returnLocation.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Personal Information - third */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {t('sectionPersonal')}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nom complet *
                          </label>
                          <input
                            {...register('fullName')}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Entrez votre nom complet"
                          />
                          {errors.fullName && (
                            <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('email')}
                          </label>
                          <input
                            {...register('email')}
                            type="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={t('placeholderEmail')}
                          />
                          {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('phone')}
                          </label>
                          <input
                            {...register('phone')}
                            type="tel"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={t('placeholderPhone')}
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                          )}
                        </div>

                      </div>
                    </div>

                    {/* Rental Summary */}
                    {/* {days > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Résumé de la location</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Durée de la location:</span>
                            <span className="font-medium">{days} day{days > 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Prix par jour:</span>
                            <span className="font-medium">MAD {carPrice}</span>
                          </div>
                          <div className="flex justify-between text-lg font-semibold border-t pt-2">
                            <span>Prix total:</span>
                            <span className="text-blue-600">MAD {total}</span>
                          </div>
                        </div>
                      </div>
                    )} */}

                    {/* Error Message */}
                    {submitStatus === 'error' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600 text-sm">
                          {t('errorSubmit')}
                        </p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex gap-1 pt-4">
                      {!inline && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleClose}
                          disabled={isSubmitting}
                          className="flex-1"
                        >
                          {t('cancel')}
                        </Button>
                      )}
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className={inline ? "w-full bg-[#EC1C25] hover:bg-[#EC1C25]/90 text-white rounded-[25px] h-10 uppercase font-medium" : "flex-1 bg-blue-600 hover:bg-blue-700"}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {t('submitting')}
                          </div>
                        ) : (
                          t('submit')
                        )}
                      </Button>
                    </div>
                    {inline && extraActions && (
                      <div className="pt-0">
                        {extraActions}
                      </div>
                    )}
                  </form>
                )}
    </>
  );

  if (inline) {
    return (
      <motion.div
        id="reservation-form"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={styles.inlineFormWrapper}
      >
        <div className="relative rounded-2xl overflow-hidden border-2 border-primary/25 bg-card shadow-xl ring-2 ring-primary/10">
          {/* Accent corner badge */}
          <div className="absolute top-0 right-0 z-10 bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-bl-xl shadow-md">
            {t('inlineBadge')}
          </div>
          <div className="bg-[#EC1C25] p-5 md:p-7 text-white relative">
            <div className="pr-24">
              <h2 className="text-xl md:text-2xl font-bold drop-shadow-sm">{t('inlineTitle')}</h2>
              <p className="text-white/95 text-sm md:text-base mt-0.5">{carName}</p>
            </div>
          </div>
          <div className={`p-5 md:p-7 ${styles.inlineFormBody}`}>
            {formContent}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={`fixed  inset-0 z-50 flex items-center justify-center mt-10 md:mt-3  md:pt-0 p-4 md:p-8 ${styles.dialogContainer}`}
            onWheel={(e) => e.stopPropagation()}
            style={{
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)',
              paddingLeft: 'env(safe-area-inset-left)',
              paddingRight: 'env(safe-area-inset-right)',
            }}
          >
            {/* Mobile-optimized dialog container */}
            <div 
              className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden  ${styles.dialogWrapper}`}
              data-dialog="booking"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-[#CB1939] to-[#CB1939]/80 p-6 text-white">
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{t('modalTitle')}</h2>
                    <p className="text-blue-100">{carName}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div
                ref={contentRef}
                className={`p-6 overflow-y-auto ${styles.dialogContent}`}
              >
                {formContent}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
