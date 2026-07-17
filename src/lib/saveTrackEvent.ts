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
