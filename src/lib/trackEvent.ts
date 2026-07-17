import type { TrackEventType } from './trackEventTypes';
import { getVisitorContext } from './visitorContext';

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

export function buildTrackBody(params: TrackEventPayload) {
  const path =
    params.path ||
    (typeof window !== 'undefined' ? window.location.pathname : '/');
  const ctx = getVisitorContext();
  return {
    ...params,
    path,
    visitorId: ctx.visitorId,
    sessionId: ctx.sessionId,
    isReturning: ctx.isReturning,
    deviceType: ctx.deviceType,
    browser: ctx.browser,
    os: ctx.os,
    trafficSource: ctx.trafficSource,
    utmSource: ctx.utmSource || undefined,
    utmMedium: ctx.utmMedium || undefined,
    utmCampaign: ctx.utmCampaign || undefined,
    utmContent: ctx.utmContent || undefined,
    utmTerm: ctx.utmTerm || undefined,
    fullUrl: ctx.fullUrl,
    userAgent: ctx.userAgent,
    language: ctx.language,
    referrer: ctx.referrer,
    screen: ctx.screen,
    timezone: ctx.timezone,
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
