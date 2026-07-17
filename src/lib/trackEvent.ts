import type { TrackEventType } from './trackEventTypes';

export type { TrackEventType };

export interface TrackEventPayload {
  event: TrackEventType;
  path: string;
  source: string;
  carSlug?: string;
  carName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  message?: string;
  pickupDate?: string;
  returnDate?: string;
  pickupLocation?: string;
  returnLocation?: string;
  rentalDays?: number;
  totalPrice?: number;
  ctaLabel?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

const TRACK_API = '/api/track/event';

function getVisitorContext() {
  if (typeof window === 'undefined') return {};
  let referrer = '';
  if (document.referrer) {
    try {
      const refUrl = new URL(document.referrer);
      referrer = refUrl.origin + refUrl.pathname;
    } catch {
      referrer = '';
    }
  }
  return {
    fullUrl: window.location.href,
    userAgent: window.navigator.userAgent,
    language: window.navigator.language,
    referrer,
    screen: `${window.screen?.width ?? ''}x${window.screen?.height ?? ''}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

export function buildTrackBody(params: TrackEventPayload) {
  const path =
    params.path ||
    (typeof window !== 'undefined' ? window.location.pathname : '/');
  return {
    ...params,
    path,
    ...getVisitorContext(),
  };
}

/** Fire-and-forget site event tracking (uses sendBeacon when available). */
export function trackEvent(params: TrackEventPayload) {
  if (typeof window === 'undefined') return;
  const body = buildTrackBody(params);
  const bodyStr = JSON.stringify(body);
  if (navigator.sendBeacon) {
    const blob = new Blob([bodyStr], { type: 'application/json' });
    navigator.sendBeacon(TRACK_API, blob);
    return;
  }
  fetch(TRACK_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bodyStr,
    keepalive: true,
  }).catch(() => {});
}

/** @deprecated Use buildTrackBody / trackEvent */
export function getWhatsAppTrackBody(params: {
  path: string;
  source: string;
  carSlug?: string;
  carName?: string;
  event?: TrackEventType;
}) {
  return buildTrackBody({
    event: params.event ?? 'whatsapp',
    path: params.path,
    source: params.source,
    carSlug: params.carSlug,
    carName: params.carName,
  });
}
