'use client';

import { useCallback, useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/trackEvent';

export type BookingFormSnapshot = {
  fullName?: string;
  email?: string;
  phone?: string;
  pickupDate?: string;
  returnDate?: string;
  pickupLocation?: string;
  returnLocation?: string;
};

function countFilledFields(data: BookingFormSnapshot): number {
  return [
    data.fullName,
    data.email,
    data.phone,
    data.pickupDate,
    data.returnDate,
    data.pickupLocation,
    data.returnLocation,
  ].filter((v) => typeof v === 'string' && v.trim().length > 0).length;
}

export function hasBookingPartialData(data: BookingFormSnapshot): boolean {
  return countFilledFields(data) > 0;
}

function snapshotKey(data: BookingFormSnapshot): string {
  return JSON.stringify({
    fullName: data.fullName?.trim() ?? '',
    email: data.email?.trim() ?? '',
    phone: data.phone?.trim() ?? '',
    pickupDate: data.pickupDate ?? '',
    returnDate: data.returnDate ?? '',
    pickupLocation: data.pickupLocation ?? '',
    returnLocation: data.returnLocation ?? '',
  });
}

type UseBookingAbandonTrackingOptions = {
  carName: string;
  carSlug?: string;
  isActive: boolean;
  rentalDays: number;
  totalPrice: number;
  getValues: () => BookingFormSnapshot;
  watchValues: BookingFormSnapshot;
  isSubmitting: boolean;
  submitSucceeded: boolean;
};

export function useBookingAbandonTracking({
  carName,
  carSlug,
  isActive,
  rentalDays,
  totalPrice,
  getValues,
  watchValues,
  isSubmitting,
  submitSucceeded,
}: UseBookingAbandonTrackingOptions) {
  const submittedRef = useRef(false);
  const abandonedSentRef = useRef(false);
  const lastProgressKeyRef = useRef('');
  const progressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionIdRef = useRef(
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sess-${Date.now()}`,
  );
  const wasActiveRef = useRef(isActive);

  useEffect(() => {
    if (isActive && !wasActiveRef.current) {
      sessionIdRef.current =
        typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sess-${Date.now()}`;
      abandonedSentRef.current = false;
      lastProgressKeyRef.current = '';
      submittedRef.current = false;
    }
    wasActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    if (submitSucceeded) submittedRef.current = true;
  }, [submitSucceeded]);

  const buildPayload = useCallback(
    (data: BookingFormSnapshot, event: 'booking-form-progress' | 'booking-abandoned', reason?: string) => {
      const path = typeof window !== 'undefined' ? window.location.pathname : '/';
      const filled = countFilledFields(data);
      return {
        event,
        path,
        source: 'booking-form' as const,
        carName,
        carSlug,
        fullName: data.fullName?.trim() || undefined,
        email: data.email?.trim() || undefined,
        phone: data.phone?.trim() || undefined,
        pickupDate: data.pickupDate || undefined,
        returnDate: data.returnDate || undefined,
        pickupLocation: data.pickupLocation || undefined,
        returnLocation: data.returnLocation || undefined,
        rentalDays: rentalDays > 0 ? rentalDays : undefined,
        totalPrice: totalPrice > 0 ? totalPrice : undefined,
        metadata: {
          sessionId: sessionIdRef.current,
          fieldsFilled: filled,
          ...(reason ? { reason } : {}),
        },
      };
    },
    [carName, carSlug, rentalDays, totalPrice],
  );

  const sendAbandoned = useCallback(
    (reason: string) => {
      if (submittedRef.current || abandonedSentRef.current || isSubmitting || submitSucceeded) return;
      const data = getValues();
      if (!hasBookingPartialData(data)) return;
      abandonedSentRef.current = true;
      trackEvent(buildPayload(data, 'booking-abandoned', reason));
    },
    [buildPayload, getValues, isSubmitting, submitSucceeded],
  );

  const markSubmitted = useCallback(() => {
    submittedRef.current = true;
    if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
  }, []);

  // Debounced progress while user types
  useEffect(() => {
    if (!isActive || submittedRef.current || isSubmitting || submitSucceeded) return;
    if (!hasBookingPartialData(watchValues)) return;

    if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
    progressTimerRef.current = setTimeout(() => {
      if (submittedRef.current || abandonedSentRef.current) return;
      const key = snapshotKey(watchValues);
      if (key === lastProgressKeyRef.current) return;
      lastProgressKeyRef.current = key;
      trackEvent(buildPayload(watchValues, 'booking-form-progress'));
    }, 4000);

    return () => {
      if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
    };
  }, [watchValues, isActive, isSubmitting, submitSucceeded, buildPayload]);

  // Page leave / unmount
  useEffect(() => {
    if (!isActive) return;
    const onPageHide = () => sendAbandoned('page-leave');
    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.removeEventListener('pagehide', onPageHide);
      sendAbandoned('unmount');
    };
  }, [isActive, sendAbandoned]);

  return { sendAbandoned, markSubmitted };
}
