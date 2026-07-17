import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import { EVENT_LABELS } from '@/lib/trackEventTypes';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function createNoCacheResponse(data: unknown, status: number = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

const CONVERSION_EVENTS = [
  'whatsapp',
  'reserver',
  'booking-dialog-open',
  'booking-submit',
  'booking-confirmed',
  'booking-abandoned',
  'booking-form-progress',
  'contact-submit',
];

export async function GET(request: NextRequest) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return createNoCacheResponse({ error: 'Forbidden: Admin access required' }, 403);
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10) || 50));
    const event = searchParams.get('event')?.trim() || undefined;
    const days = parseInt(searchParams.get('days') ?? '30', 10) || 30;
    const search = searchParams.get('search')?.trim() || undefined;
    const excludePageViews = searchParams.get('excludePageViews') === 'true';

    const since = new Date();
    since.setDate(since.getDate() - days);

    const where: {
      createdAt: { gte: Date };
      event?: string | { not: string };
      OR?: Array<Record<string, unknown>>;
    } = {
      createdAt: { gte: since },
    };

    if (excludePageViews && (!event || event === 'all')) {
      where.event = { not: 'page-view' };
    } else if (event && event !== 'all') {
      where.event = event;
    }

    if (search) {
      where.OR = [
        { carName: { contains: search } },
        { carSlug: { contains: search } },
        { fullName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { path: { contains: search } },
        { source: { contains: search } },
        { ctaLabel: { contains: search } },
        { message: { contains: search } },
      ];
    }

    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [total, events, eventGroups, todayCount, weekCount, pageViewsToday, conversionsWeek, abandonedWeek] =
      await Promise.all([
        prisma.trackEvent.count({ where }),
        prisma.trackEvent.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.trackEvent.groupBy({
          by: ['event'],
          where: { createdAt: { gte: since } },
          _count: { event: true },
        }),
        prisma.trackEvent.count({ where: { createdAt: { gte: todayStart } } }),
        prisma.trackEvent.count({ where: { createdAt: { gte: weekAgo } } }),
        prisma.trackEvent.count({
          where: { event: 'page-view', createdAt: { gte: todayStart } },
        }),
        prisma.trackEvent.count({
          where: {
            event: { in: CONVERSION_EVENTS },
            createdAt: { gte: weekAgo },
          },
        }),
        prisma.trackEvent.count({
          where: {
            event: 'booking-abandoned',
            createdAt: { gte: weekAgo },
          },
        }),
      ]);

    const statsByEvent = Object.fromEntries(
      eventGroups.map((group: { event: string; _count: { event: number } }) => [
        group.event,
        {
          count: group._count.event,
          label: EVENT_LABELS[group.event] ?? group.event,
        },
      ]),
    );

    return createNoCacheResponse({
      events,
      stats: {
        total,
        today: todayCount,
        last7Days: weekCount,
        pageViewsToday,
        conversionsLast7Days: conversionsWeek,
        abandonedLast7Days: abandonedWeek,
        byEvent: statsByEvent,
        periodDays: days,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      eventLabels: EVENT_LABELS,
      conversionEvents: CONVERSION_EVENTS,
    });
  } catch (error) {
    console.error('[admin/track-events] Error:', error);
    return createNoCacheResponse({ error: 'Internal server error' }, 500);
  }
}
