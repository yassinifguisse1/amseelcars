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

const LEAD_EVENTS = [
  'booking-confirmed',
  'booking-submit',
  'booking-abandoned',
  'booking-form-progress',
  'contact-submit',
  'whatsapp',
] as const;

const IMPORTANT_CLICK_EVENTS = [
  'whatsapp',
  'reserver',
  'phone-click',
  'email-click',
  'car-card-click',
  'hero-cta',
  'blog-cta',
  'scroll-reservation',
  'maps-click',
  'social-click',
] as const;

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return createNoCacheResponse({ error: 'Forbidden: Admin access required' }, 403);
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '40', 10) || 40));
    const event = searchParams.get('event')?.trim() || undefined;
    const days = Math.min(365, Math.max(1, parseInt(searchParams.get('days') ?? '30', 10) || 30));
    const search = searchParams.get('search')?.trim() || undefined;
    const view = searchParams.get('view')?.trim() || 'all'; // all | leads | clicks | reservations
    const excludePageViews = searchParams.get('excludePageViews') !== 'false';

    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const where: {
      createdAt: { gte: Date };
      event?: string | { not: string } | { in: string[] };
      OR?: Array<Record<string, unknown>>;
    } = {
      createdAt: { gte: since },
    };

    if (event && event !== 'all') {
      where.event = event;
    } else if (view === 'leads') {
      where.event = { in: [...LEAD_EVENTS] };
    } else if (view === 'clicks') {
      where.event = { in: [...IMPORTANT_CLICK_EVENTS] };
    } else if (view === 'reservations') {
      where.event = {
        in: [
          'booking-confirmed',
          'booking-submit',
          'booking-abandoned',
          'booking-form-progress',
          'booking-dialog-open',
          'reserver',
          'scroll-reservation',
        ],
      };
    } else if (excludePageViews) {
      where.event = { not: 'page-view' };
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

    const periodFilter = { createdAt: { gte: since } };

    const [
      total,
      events,
      eventGroups,
      todayCount,
      weekCount,
      pageViewsToday,
      pageViewsPeriod,
      whatsappPeriod,
      whatsappToday,
      confirmedPeriod,
      confirmedToday,
      abandonedPeriod,
      abandonedToday,
      reserverPeriod,
      phonePeriod,
      contactPeriod,
      recentLeads,
      periodEventsForAgg,
    ] = await Promise.all([
      prisma.trackEvent.count({ where }),
      prisma.trackEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.trackEvent.groupBy({
        by: ['event'],
        where: periodFilter,
        _count: { event: true },
      }),
      prisma.trackEvent.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.trackEvent.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.trackEvent.count({
        where: { event: 'page-view', createdAt: { gte: todayStart } },
      }),
      prisma.trackEvent.count({
        where: { event: 'page-view', ...periodFilter },
      }),
      prisma.trackEvent.count({
        where: { event: 'whatsapp', ...periodFilter },
      }),
      prisma.trackEvent.count({
        where: { event: 'whatsapp', createdAt: { gte: todayStart } },
      }),
      prisma.trackEvent.count({
        where: { event: 'booking-confirmed', ...periodFilter },
      }),
      prisma.trackEvent.count({
        where: { event: 'booking-confirmed', createdAt: { gte: todayStart } },
      }),
      prisma.trackEvent.count({
        where: { event: 'booking-abandoned', ...periodFilter },
      }),
      prisma.trackEvent.count({
        where: { event: 'booking-abandoned', createdAt: { gte: todayStart } },
      }),
      prisma.trackEvent.count({
        where: { event: 'reserver', ...periodFilter },
      }),
      prisma.trackEvent.count({
        where: { event: 'phone-click', ...periodFilter },
      }),
      prisma.trackEvent.count({
        where: { event: 'contact-submit', ...periodFilter },
      }),
      prisma.trackEvent.findMany({
        where: {
          createdAt: { gte: since },
          event: {
            in: [
              'booking-confirmed',
              'booking-abandoned',
              'booking-form-progress',
              'contact-submit',
            ],
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 80,
      }),
      prisma.trackEvent.findMany({
        where: periodFilter,
        select: {
          event: true,
          path: true,
          carName: true,
          carSlug: true,
          createdAt: true,
          source: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5000,
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

    // Top cars / pages from period sample
    const carCounts = new Map<string, number>();
    const pathCounts = new Map<string, number>();
    const daily = new Map<string, { date: string; views: number; whatsapp: number; reservations: number; abandons: number; clicks: number }>();

    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = dayKey(d);
      daily.set(key, { date: key, views: 0, whatsapp: 0, reservations: 0, abandons: 0, clicks: 0 });
    }

    for (const row of periodEventsForAgg) {
      const car = (row.carName || row.carSlug || '').trim();
      if (car) carCounts.set(car, (carCounts.get(car) ?? 0) + 1);
      if (row.path) pathCounts.set(row.path, (pathCounts.get(row.path) ?? 0) + 1);

      const key = dayKey(new Date(row.createdAt));
      const bucket = daily.get(key);
      if (!bucket) continue;
      if (row.event === 'page-view') bucket.views += 1;
      else if (row.event === 'whatsapp') bucket.whatsapp += 1;
      else if (row.event === 'booking-confirmed') bucket.reservations += 1;
      else if (row.event === 'booking-abandoned') bucket.abandons += 1;
      else if ((IMPORTANT_CLICK_EVENTS as readonly string[]).includes(row.event)) bucket.clicks += 1;
    }

    const topCars = [...carCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    const topPages = [...pathCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([path, count]) => ({ path, count }));

    const funnel = {
      pageViews: pageViewsPeriod,
      carInterest: (statsByEvent['car-card-click']?.count ?? 0) + (statsByEvent['reserver']?.count ?? 0),
      whatsapp: whatsappPeriod,
      formOpen: (statsByEvent['booking-dialog-open']?.count ?? 0) + (statsByEvent['scroll-reservation']?.count ?? 0) + (statsByEvent['reserver']?.count ?? 0),
      formProgress: statsByEvent['booking-form-progress']?.count ?? 0,
      abandoned: abandonedPeriod,
      confirmed: confirmedPeriod,
    };

    const leadsWithContact = recentLeads.filter(
      (l) => (l.fullName && l.fullName.trim()) || (l.email && l.email.trim()) || (l.phone && l.phone.trim()),
    );

    return createNoCacheResponse({
      events,
      leads: leadsWithContact,
      insights: {
        topCars,
        topPages,
        daily: [...daily.values()],
        funnel,
      },
      stats: {
        total,
        today: todayCount,
        last7Days: weekCount,
        pageViewsToday,
        pageViewsPeriod,
        whatsappPeriod,
        whatsappToday,
        confirmedPeriod,
        confirmedToday,
        abandonedPeriod,
        abandonedToday,
        reserverPeriod,
        phonePeriod,
        contactPeriod,
        leadsWithContact: leadsWithContact.length,
        byEvent: statsByEvent,
        periodDays: days,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      eventLabels: EVENT_LABELS,
    });
  } catch (error) {
    console.error('[admin/track-events] Error:', error);
    return createNoCacheResponse({ error: 'Internal server error' }, 500);
  }
}
