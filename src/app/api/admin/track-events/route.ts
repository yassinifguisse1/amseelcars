import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import { EVENT_LABELS } from '@/lib/trackEventTypes';
import {
  buildTimeBuckets,
  dayKeyInZone,
  hourKeyInZone,
  rangeFromBounds,
  referrerHost,
  resolveAnalyticsRange,
  type AnalyticsPreset,
} from '@/lib/admin/analyticsRange';

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

const PRESETS = new Set(['24h', '7d', '30d', '90d', '365d', 'custom']);

function parseRange(searchParams: URLSearchParams) {
  const presetRaw = searchParams.get('preset')?.trim() || '';
  const fromRaw = searchParams.get('from')?.trim() || '';
  const toRaw = searchParams.get('to')?.trim() || '';
  const labelRaw = searchParams.get('label')?.trim() || '';
  const daysFallback = Math.min(365, Math.max(1, parseInt(searchParams.get('days') ?? '30', 10) || 30));

  let preset: AnalyticsPreset = '24h';
  if (PRESETS.has(presetRaw)) {
    preset = presetRaw as AnalyticsPreset;
  } else if (searchParams.has('days')) {
    if (daysFallback <= 1) preset = '24h';
    else if (daysFallback <= 7) preset = '7d';
    else if (daysFallback <= 30) preset = '30d';
    else if (daysFallback <= 90) preset = '90d';
    else preset = '365d';
  }

  const fromDate = fromRaw ? new Date(fromRaw) : null;
  const toDate = toRaw ? new Date(toRaw) : null;
  const boundsOk =
    fromDate &&
    toDate &&
    !Number.isNaN(fromDate.getTime()) &&
    !Number.isNaN(toDate.getTime()) &&
    fromDate.getTime() <= toDate.getTime();

  // Custom calendar range only
  if (preset === 'custom' && boundsOk) {
    return resolveAnalyticsRange('custom', fromDate, toDate);
  }

  // Presets: keep exact client from/to so 24h stays hourly (do NOT snap to day bounds)
  if (boundsOk) {
    return rangeFromBounds(preset, fromDate, toDate, labelRaw || undefined);
  }

  return resolveAnalyticsRange(preset);
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
    const search = searchParams.get('search')?.trim() || undefined;
    const view = searchParams.get('view')?.trim() || 'all';
    const excludePageViews = searchParams.get('excludePageViews') !== 'false';

    const range = parseRange(searchParams);
    const { from: since, to: until, granularity, preset, label } = range;
    const timeZone =
      searchParams.get('tz')?.trim() ||
      searchParams.get('timezone')?.trim() ||
      'UTC';

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const where: {
      createdAt: { gte: Date; lte: Date };
      event?: string | { not: string } | { in: string[] };
      OR?: Array<Record<string, unknown>>;
    } = {
      createdAt: { gte: since, lte: until },
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
        { visitorId: { contains: search } },
        { country: { contains: search } },
        { city: { contains: search } },
        { trafficSource: { contains: search } },
        { deviceType: { contains: search } },
        { referrer: { contains: search } },
        { utmSource: { contains: search } },
      ];
    }

    const periodFilter = { createdAt: { gte: since, lte: until } };

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
          createdAt: { gte: since, lte: until },
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
          visitorId: true,
          isReturning: true,
          country: true,
          city: true,
          deviceType: true,
          browser: true,
          os: true,
          trafficSource: true,
          referrer: true,
          utmSource: true,
          utmMedium: true,
          utmCampaign: true,
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

    const carCounts = new Map<string, number>();
    const pathCounts = new Map<string, number>();
    const deviceCounts = new Map<string, number>();
    const trafficCounts = new Map<string, number>();
    const browserCounts = new Map<string, number>();
    const visitorSeen = new Map<string, boolean>();

    // country -> { visitors: Set, pageViews }
    const countryStats = new Map<string, { visitors: Set<string>; pageViews: number; anonViews: number }>();
    const referrerStats = new Map<string, Set<string>>();
    const utmSourceStats = new Map<string, Set<string>>();
    const utmMediumStats = new Map<string, Set<string>>();
    const utmCampaignStats = new Map<string, Set<string>>();

    const bucketKeys = buildTimeBuckets(since, until, granularity, timeZone);
    const timeseries = new Map<
      string,
      { key: string; visitors: Set<string>; pageViews: number; whatsapp: number; reservations: number; abandons: number; clicks: number }
    >();
    for (const key of bucketKeys) {
      timeseries.set(key, {
        key,
        visitors: new Set(),
        pageViews: 0,
        whatsapp: 0,
        reservations: 0,
        abandons: 0,
        clicks: 0,
      });
    }

    // Legacy daily shape for older UI bits
    const daily = new Map<
      string,
      { date: string; views: number; whatsapp: number; reservations: number; abandons: number; clicks: number }
    >();
    for (const key of buildTimeBuckets(since, until, 'day', timeZone)) {
      daily.set(key, { date: key, views: 0, whatsapp: 0, reservations: 0, abandons: 0, clicks: 0 });
    }

    const bump = (map: Map<string, number>, key: string | null | undefined) => {
      const k = (key || '').trim();
      if (!k) return;
      map.set(k, (map.get(k) ?? 0) + 1);
    };

    const bumpVisitorSet = (map: Map<string, Set<string>>, key: string, visitorId: string | null) => {
      const k = key.trim();
      if (!k) return;
      let set = map.get(k);
      if (!set) {
        set = new Set();
        map.set(k, set);
      }
      set.add(visitorId && visitorId.length >= 4 ? visitorId : `anon:${k}:${set.size}`);
    };

    for (const row of periodEventsForAgg) {
      const car = (row.carName || row.carSlug || '').trim();
      if (car) carCounts.set(car, (carCounts.get(car) ?? 0) + 1);
      if (row.path) pathCounts.set(row.path, (pathCounts.get(row.path) ?? 0) + 1);

      const created = new Date(row.createdAt);
      const seriesKey =
        granularity === 'hour' ? hourKeyInZone(created, timeZone) : dayKeyInZone(created, timeZone);
      const bucket = timeseries.get(seriesKey);
      const dayBucket = daily.get(dayKeyInZone(created, timeZone));

      if (row.event === 'page-view') {
        bump(deviceCounts, row.deviceType);
        bump(trafficCounts, row.trafficSource);
        bump(browserCounts, row.browser);

        if (row.visitorId) {
          const prev = visitorSeen.get(row.visitorId) ?? false;
          visitorSeen.set(row.visitorId, prev || Boolean(row.isReturning));
        }

        const country = (row.country || '').trim().toUpperCase() || 'ZZ';
        let cStat = countryStats.get(country);
        if (!cStat) {
          cStat = { visitors: new Set(), pageViews: 0, anonViews: 0 };
          countryStats.set(country, cStat);
        }
        cStat.pageViews += 1;
        if (row.visitorId) cStat.visitors.add(row.visitorId);
        else cStat.anonViews += 1;

        const host = referrerHost(row.referrer);
        bumpVisitorSet(referrerStats, host, row.visitorId);

        if (row.utmSource) bumpVisitorSet(utmSourceStats, row.utmSource, row.visitorId);
        if (row.utmMedium) bumpVisitorSet(utmMediumStats, row.utmMedium, row.visitorId);
        if (row.utmCampaign) bumpVisitorSet(utmCampaignStats, row.utmCampaign, row.visitorId);

        if (bucket) {
          bucket.pageViews += 1;
          if (row.visitorId) bucket.visitors.add(row.visitorId);
        }
        if (dayBucket) dayBucket.views += 1;
      } else if (row.visitorId && !visitorSeen.has(row.visitorId)) {
        bump(deviceCounts, row.deviceType);
        bump(trafficCounts, row.trafficSource);
        visitorSeen.set(row.visitorId, Boolean(row.isReturning));
      }

      if (bucket) {
        if (row.event === 'whatsapp') bucket.whatsapp += 1;
        else if (row.event === 'booking-confirmed') bucket.reservations += 1;
        else if (row.event === 'booking-abandoned') bucket.abandons += 1;
        else if ((IMPORTANT_CLICK_EVENTS as readonly string[]).includes(row.event)) bucket.clicks += 1;
      }
      if (dayBucket) {
        if (row.event === 'whatsapp') dayBucket.whatsapp += 1;
        else if (row.event === 'booking-confirmed') dayBucket.reservations += 1;
        else if (row.event === 'booking-abandoned') dayBucket.abandons += 1;
        else if ((IMPORTANT_CLICK_EVENTS as readonly string[]).includes(row.event)) dayBucket.clicks += 1;
      }
    }

    const topList = (map: Map<string, number>, n = 8) =>
      [...map.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(([name, count]) => ({ name, count }));

    const setList = (map: Map<string, Set<string>>, n = 20) =>
      [...map.entries()]
        .map(([name, set]) => ({ name, visitors: set.size }))
        .sort((a, b) => b.visitors - a.visitors)
        .slice(0, n);

    const countryRows = [...countryStats.entries()]
      .map(([code, stat]) => {
        const visitorCount =
          stat.visitors.size > 0
            ? stat.visitors.size
            : Math.min(stat.pageViews, Math.max(1, Math.round(stat.pageViews * 0.6)));
        return {
          code: code === 'ZZ' ? '' : code,
          name: code === 'ZZ' ? 'Unknown' : code,
          visitors: visitorCount,
          pageViews: stat.pageViews,
        };
      })
      .sort((a, b) => b.visitors - a.visitors || b.pageViews - a.pageViews);

    const totalCountryVisitors = countryRows.reduce((s, r) => s + r.visitors, 0) || 1;
    const countries = countryRows.slice(0, 25).map((r) => ({
      ...r,
      share: Math.round((r.visitors / totalCountryVisitors) * 1000) / 10,
    }));

    const series = [...timeseries.values()].map((b) => ({
      key: b.key,
      visitors: b.visitors.size,
      pageViews: b.pageViews,
      whatsapp: b.whatsapp,
      reservations: b.reservations,
      abandons: b.abandons,
      clicks: b.clicks,
    }));

    let returningVisitors = 0;
    for (const isRet of visitorSeen.values()) {
      if (isRet) returningVisitors += 1;
    }
    const uniqueVisitors = visitorSeen.size;
    const newVisitors = Math.max(0, uniqueVisitors - returningVisitors);

    const funnel = {
      pageViews: pageViewsPeriod,
      carInterest: (statsByEvent['car-card-click']?.count ?? 0) + (statsByEvent['reserver']?.count ?? 0),
      whatsapp: whatsappPeriod,
      formOpen:
        (statsByEvent['booking-dialog-open']?.count ?? 0) +
        (statsByEvent['scroll-reservation']?.count ?? 0) +
        (statsByEvent['reserver']?.count ?? 0),
      formProgress: statsByEvent['booking-form-progress']?.count ?? 0,
      abandoned: abandonedPeriod,
      confirmed: confirmedPeriod,
    };

    const leadsWithContact = recentLeads.filter(
      (l) => (l.fullName && l.fullName.trim()) || (l.email && l.email.trim()) || (l.phone && l.phone.trim()),
    );

    const periodDays = Math.max(
      1,
      Math.ceil((until.getTime() - since.getTime()) / (1000 * 60 * 60 * 24)),
    );

    return createNoCacheResponse({
      events,
      leads: leadsWithContact,
      range: {
        from: since.toISOString(),
        to: until.toISOString(),
        preset,
        label,
        granularity,
      },
      insights: {
        topCars: topList(carCounts),
        topPages: topList(pathCounts).map(({ name, count }) => ({ path: name, count })),
        daily: [...daily.values()],
        series,
        countries,
        referrers: setList(referrerStats, 20),
        utm: {
          sources: setList(utmSourceStats, 20),
          mediums: setList(utmMediumStats, 20),
          campaigns: setList(utmCampaignStats, 20),
        },
        funnel,
        audience: {
          uniqueVisitors,
          newVisitors,
          returningVisitors,
          topCountries: countries.slice(0, 8).map((c) => ({
            name: c.code || c.name,
            count: c.visitors,
          })),
          topDevices: topList(deviceCounts, 5),
          topTrafficSources: topList(trafficCounts, 6),
          topBrowsers: topList(browserCounts, 5),
          topUtmSources: setList(utmSourceStats, 8).map((u) => ({
            name: u.name,
            count: u.visitors,
          })),
        },
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
        uniqueVisitors,
        newVisitors,
        returningVisitors,
        byEvent: statsByEvent,
        periodDays,
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
