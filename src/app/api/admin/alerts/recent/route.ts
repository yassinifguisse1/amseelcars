import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import { EMAIL_TRACK_EVENTS, EVENT_LABELS } from '@/lib/trackEventTypes';

export const dynamic = 'force-dynamic';

/**
 * Recent high-intent events for admin local notifications (polling — no VAPID).
 * Admin-only. Used by the /admin PWA while it is open.
 */
export async function GET(request: NextRequest) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const sinceRaw = searchParams.get('since')?.trim();
  const since = sinceRaw ? new Date(sinceRaw) : new Date(Date.now() - 60_000);
  if (Number.isNaN(since.getTime())) {
    return NextResponse.json({ error: 'Invalid since' }, { status: 400 });
  }

  // Cap lookback so a stale client does not dump hundreds of alerts
  const minSince = new Date(Date.now() - 6 * 60 * 60 * 1000);
  const from = since < minSince ? minSince : since;

  const events = await prisma.trackEvent.findMany({
    where: {
      createdAt: { gt: from },
      event: { in: [...EMAIL_TRACK_EVENTS] },
    },
    orderBy: { createdAt: 'asc' },
    take: 30,
    select: {
      id: true,
      event: true,
      path: true,
      carName: true,
      carSlug: true,
      fullName: true,
      phone: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    now: new Date().toISOString(),
    alerts: events.map((e) => ({
      id: e.id,
      event: e.event,
      title: `Amseel · ${EVENT_LABELS[e.event] ?? e.event}`,
      body: [e.fullName, e.carName || e.carSlug, e.phone, e.path]
        .filter(Boolean)
        .join(' · ')
        .slice(0, 160) || 'Nouvelle activité',
      url: '/admin',
      createdAt: e.createdAt.toISOString(),
    })),
  });
}
