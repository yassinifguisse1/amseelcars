import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export interface SaveTrackEventInput {
  event: string;
  path: string;
  source?: string | null;
  carSlug?: string | null;
  carName?: string | null;
  fullUrl?: string | null;
  userAgent?: string | null;
  language?: string | null;
  referrer?: string | null;
  screen?: string | null;
  timezone?: string | null;
  clientIp?: string | null;
  visitorId?: string | null;
  sessionId?: string | null;
  isReturning?: boolean | null;
  country?: string | null;
  city?: string | null;
  deviceType?: string | null;
  browser?: string | null;
  os?: string | null;
  trafficSource?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  pickupDate?: string | null;
  returnDate?: string | null;
  pickupLocation?: string | null;
  returnLocation?: string | null;
  rentalDays?: number | null;
  totalPrice?: number | null;
  ctaLabel?: string | null;
  metadata?: Prisma.InputJsonValue | null;
}

export async function saveTrackEvent(data: SaveTrackEventInput) {
  return prisma.trackEvent.create({
    data: {
      event: data.event,
      path: data.path,
      source: data.source ?? null,
      carSlug: data.carSlug ?? null,
      carName: data.carName ?? null,
      fullUrl: data.fullUrl ?? null,
      userAgent: data.userAgent ?? null,
      language: data.language ?? null,
      referrer: data.referrer ?? null,
      screen: data.screen ?? null,
      timezone: data.timezone ?? null,
      clientIp: data.clientIp ?? null,
      visitorId: data.visitorId ?? null,
      sessionId: data.sessionId ?? null,
      isReturning: data.isReturning ?? null,
      country: data.country ?? null,
      city: data.city ?? null,
      deviceType: data.deviceType ?? null,
      browser: data.browser ?? null,
      os: data.os ?? null,
      trafficSource: data.trafficSource ?? null,
      utmSource: data.utmSource ?? null,
      utmMedium: data.utmMedium ?? null,
      utmCampaign: data.utmCampaign ?? null,
      utmContent: data.utmContent ?? null,
      utmTerm: data.utmTerm ?? null,
      fullName: data.fullName ?? null,
      email: data.email ?? null,
      phone: data.phone ?? null,
      message: data.message ?? null,
      pickupDate: data.pickupDate ?? null,
      returnDate: data.returnDate ?? null,
      pickupLocation: data.pickupLocation ?? null,
      returnLocation: data.returnLocation ?? null,
      rentalDays: data.rentalDays ?? null,
      totalPrice: data.totalPrice ?? null,
      ctaLabel: data.ctaLabel ?? null,
      metadata: data.metadata ?? undefined,
    } satisfies Prisma.TrackEventCreateInput,
  });
}
