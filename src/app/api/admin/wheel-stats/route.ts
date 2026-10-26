import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import {
  resolveAnalyticsRange,
  type AnalyticsPreset,
} from '@/lib/admin/analyticsRange';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const PRESETS = new Set(['24h', '7d', '30d', '90d', '365d', 'custom']);

type Meta = Record<string, string | number | boolean> | null;

function asMeta(value: unknown): Meta {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, string | number | boolean>;
}

function metaString(meta: Meta, key: string): string | null {
  if (!meta) return null;
  const v = meta[key];
  if (typeof v === 'string' && v.trim()) return v.trim();
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return null;
}

function createNoCacheResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}

function parseRange(searchParams: URLSearchParams) {
  const presetRaw = searchParams.get('preset')?.trim() || '30d';
  const fromRaw = searchParams.get('from')?.trim() || '';
  const toRaw = searchParams.get('to')?.trim() || '';
  const preset: AnalyticsPreset = PRESETS.has(presetRaw)
    ? (presetRaw as AnalyticsPreset)
    : '30d';
  const fromDate = fromRaw ? new Date(fromRaw) : null;
  const toDate = toRaw ? new Date(toRaw) : null;
  const boundsOk =
    fromDate &&
    toDate &&
    !Number.isNaN(fromDate.getTime()) &&
    !Number.isNaN(toDate.getTime()) &&
    fromDate.getTime() <= toDate.getTime();

  return resolveAnalyticsRange(
    boundsOk && preset === 'custom' ? 'custom' : preset === 'custom' ? '30d' : preset,
    boundsOk ? fromDate : null,
    boundsOk ? toDate : null,
  );
}

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return createNoCacheResponse({ error: 'Unauthorized' }, 401);
    }

    const range = parseRange(request.nextUrl.searchParams);
    const whereRange = { createdAt: { gte: range.from, lte: range.to } };

    const [wheelRows, bookingRows] = await Promise.all([
      prisma.trackEvent.findMany({
        where: {
          ...whereRange,
          OR: [{ source: 'wheel-of-chance' }, { ctaLabel: { startsWith: 'wheel-' } }],
        },
        select: {
          id: true,
          event: true,
          ctaLabel: true,
          metadata: true,
          visitorId: true,
          createdAt: true,
          path: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 8000,
      }),
      prisma.trackEvent.findMany({
        where: {
          ...whereRange,
          event: { in: ['booking-submit', 'booking-confirmed', 'whatsapp'] },
        },
        select: {
          id: true,
          event: true,
          source: true,
          metadata: true,
          visitorId: true,
          createdAt: true,
          path: true,
          fullName: true,
          email: true,
          phone: true,
          carName: true,
          rentalDays: true,
          totalPrice: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 8000,
      }),
    ]);

    let shown = 0;
    let spins = 0;
    let wins = 0;
    let dismiss = 0;
    let browseFleet = 0;
    const prizeCounts: Record<string, number> = {};
    const uniqueSpinners = new Set<string>();
    const uniqueWinners = new Set<string>();
    const recentWins: Array<{
      id: string;
      at: string;
      prize: string | null;
      claimCode: string | null;
      visitorId: string | null;
      path: string;
    }> = [];

    for (const row of wheelRows) {
      const label = row.ctaLabel ?? '';
      const meta = asMeta(row.metadata);
      if (label === 'wheel-shown') shown += 1;
      else if (label === 'wheel-spin') {
        spins += 1;
        if (row.visitorId) uniqueSpinners.add(row.visitorId);
      } else if (label === 'wheel-win') {
        wins += 1;
        if (row.visitorId) uniqueWinners.add(row.visitorId);
        const prize = metaString(meta, 'prize');
        const claimCode = metaString(meta, 'claimCode');
        if (prize) prizeCounts[prize] = (prizeCounts[prize] ?? 0) + 1;
        if (recentWins.length < 40) {
          recentWins.push({
            id: row.id,
            at: row.createdAt.toISOString(),
            prize,
            claimCode,
            visitorId: row.visitorId,
            path: row.path,
          });
        }
      } else if (label === 'wheel-dismiss') dismiss += 1;
      else if (label === 'wheel-browse-fleet') browseFleet += 1;
    }

    const bookingWithCode: Array<{
      id: string;
      event: string;
      at: string;
      claimCode: string;
      prize: string | null;
      fullName: string | null;
      email: string | null;
      phone: string | null;
      carName: string | null;
      rentalDays: number | null;
      totalPrice: number | null;
      source: string | null;
    }> = [];

    let bookingSubmitWithCode = 0;
    let bookingConfirmedWithCode = 0;
    let whatsappWithCode = 0;
    const uniqueBookers = new Set<string>();

    for (const row of bookingRows) {
      const meta = asMeta(row.metadata);
      const claimCode = metaString(meta, 'wheelClaimCode');
      if (!claimCode) continue;
      const prize = metaString(meta, 'wheelPrize');
      if (row.event === 'booking-submit') {
        bookingSubmitWithCode += 1;
        if (row.visitorId) uniqueBookers.add(row.visitorId);
      } else if (row.event === 'booking-confirmed') {
        bookingConfirmedWithCode += 1;
        if (row.visitorId) uniqueBookers.add(row.visitorId);
      } else if (row.event === 'whatsapp') {
        whatsappWithCode += 1;
      }
      if (bookingWithCode.length < 50) {
        bookingWithCode.push({
          id: row.id,
          event: row.event,
          at: row.createdAt.toISOString(),
          claimCode,
          prize,
          fullName: row.fullName,
          email: row.email,
          phone: row.phone,
          carName: row.carName,
          rentalDays: row.rentalDays,
          totalPrice: row.totalPrice,
          source: row.source,
        });
      }
    }

    const pct = (num: number, den: number) =>
      den > 0 ? Math.round((num / den) * 1000) / 10 : 0;

    return createNoCacheResponse({
      range: {
        from: range.from.toISOString(),
        to: range.to.toISOString(),
        preset: range.preset,
        label: range.label,
      },
      funnel: {
        shown,
        spins,
        wins,
        dismiss,
        browseFleet,
        bookingSubmitWithCode,
        bookingConfirmedWithCode,
        whatsappWithCode,
      },
      rates: {
        spinRate: pct(spins, shown),
        winRate: pct(wins, spins),
        browseRate: pct(browseFleet, wins),
        bookSubmitRate: pct(bookingSubmitWithCode, wins),
        bookConfirmRate: pct(bookingConfirmedWithCode, wins),
      },
      unique: {
        spinners: uniqueSpinners.size,
        winners: uniqueWinners.size,
        bookersWithCode: uniqueBookers.size,
      },
      prizes: Object.entries(prizeCounts)
        .map(([id, count]) => ({ id, count }))
        .sort((a, b) => b.count - a.count),
      recentWins,
      bookingsWithCode: bookingWithCode,
    });
  } catch (error) {
    console.error('wheel-stats error', error);
    return createNoCacheResponse({ error: 'Failed to load wheel stats' }, 500);
  }
}
