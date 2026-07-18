'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  Eye,
  Loader2,
  Mail,
  MessageCircle,
  MousePointerClick,
  Phone,
  RefreshCw,
  Search,
  Send,
  Users,
  X,
} from 'lucide-react';
import { EVENT_LABELS, SOURCE_LABELS } from '@/lib/trackEventTypes';
import { AnalyticsDateRangePicker } from '@/components/admin/AnalyticsDateRangePicker';
import {
  formatSeriesTick,
  resolveAnalyticsRange,
  type AnalyticsRange,
} from '@/lib/admin/analyticsRange';
import {
  JOURNEY_STAGE_LABELS,
  type BookingJourney,
  type JourneyStage,
} from '@/lib/admin/bookingJourneys';
import {
  clearFilter,
  filterChips,
  filtersToQuery,
  hasActiveFilters,
  loadFiltersFromStorage,
  saveFiltersToStorage,
  toggleFilter,
  type AnalyticsDimensionFilters,
  type AnalyticsFilterKey,
} from '@/lib/admin/analyticsFilters';

type TrackEventRow = {
  id: string;
  event: string;
  path: string;
  source: string | null;
  carSlug: string | null;
  carName: string | null;
  fullUrl: string | null;
  userAgent: string | null;
  language: string | null;
  referrer: string | null;
  screen: string | null;
  timezone: string | null;
  clientIp: string | null;
  visitorId: string | null;
  sessionId: string | null;
  isReturning: boolean | null;
  country: string | null;
  city: string | null;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  trafficSource: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  pickupDate: string | null;
  returnDate: string | null;
  pickupLocation: string | null;
  returnLocation: string | null;
  rentalDays: number | null;
  totalPrice: number | null;
  ctaLabel: string | null;
  message: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

type SeriesPoint = {
  key: string;
  visitors: number;
  pageViews: number;
  whatsapp: number;
  reservations: number;
  abandons: number;
  clicks: number;
};

type CountryRow = {
  code: string;
  name: string;
  visitors: number;
  pageViews: number;
  share: number;
};

type VisitorCountRow = { name: string; visitors: number };

type TrackStats = {
  pageViewsPeriod: number;
  whatsappPeriod: number;
  confirmedPeriod: number;
  abandonedPeriod: number;
  reserverPeriod: number;
  phonePeriod: number;
  contactPeriod: number;
  leadsWithContact: number;
  uniqueVisitors?: number;
  newVisitors?: number;
  returningVisitors?: number;
  byEvent: Record<string, { count: number; label: string }>;
};

type CarStatRow = {
  name: string;
  slug: string | null;
  clicks: number;
  opens: number;
  confirms: number;
  abandons: number;
  interest: number;
};

type Insights = {
  series: SeriesPoint[];
  countries: CountryRow[];
  referrers: VisitorCountRow[];
  carStats?: CarStatRow[];
  topCars?: Array<{ name: string; count: number }>;
  utm: {
    sources: VisitorCountRow[];
    mediums: VisitorCountRow[];
    campaigns: VisitorCountRow[];
  };
  funnel: {
    pageViews: number;
    carInterest: number;
    whatsapp: number;
    formOpen: number;
    formProgress: number;
    abandoned: number;
    confirmed: number;
  };
};

type DashboardPage = 'analytics' | 'reservations';
type JournalMode = 'clicks' | 'all';

const EVENT_ICONS: Record<string, typeof MessageCircle> = {
  'page-view': Eye,
  whatsapp: MessageCircle,
  reserver: MousePointerClick,
  'booking-dialog-open': Users,
  'booking-submit': Send,
  'booking-confirmed': CalendarCheck,
  'booking-abandoned': AlertTriangle,
  'booking-form-progress': Users,
  'contact-submit': Mail,
  'phone-click': Phone,
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function sourceLabel(source: string | null) {
  if (!source) return '–';
  return SOURCE_LABELS[source] ?? source;
}

function countryLabel(code: string | null | undefined) {
  if (!code) return 'Unknown';
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

function formatLocation(key: string | null) {
  if (!key) return '–';
  const map: Record<string, string> = {
    'agadir-centre': 'Agadir Centre',
    'aeroport-al-massira': 'Aéroport Al Massira',
    taghazout: 'Taghazout',
    agence: 'Agence',
  };
  return map[key] ?? key;
}

function VisitorsChart({
  series,
  granularity,
  uniqueVisitors,
  pageViews,
}: {
  series: SeriesPoint[];
  granularity: 'hour' | 'day';
  uniqueVisitors: number;
  pageViews: number;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(640);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setWidth(Math.max(280, Math.floor(el.clientWidth)));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const height = width < 480 ? 160 : 200;
  const padL = 28;
  const padR = 8;
  const padY = 16;
  const innerW = width - padL - padR;
  const innerH = height - padY * 2;
  const max = Math.max(1, ...series.map((s) => s.visitors));

  const points = series.map((s, i) => {
    const x = padL + (series.length <= 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);
    const y = padY + innerH - (s.visitors / max) * innerH;
    return { x, y, ...s };
  });

  const path =
    points.length === 0
      ? ''
      : points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  const area =
    points.length === 0
      ? ''
      : `${path} L ${points[points.length - 1].x.toFixed(1)} ${(padY + innerH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padY + innerH).toFixed(1)} Z`;

  const labelEvery = Math.max(1, Math.ceil(series.length / (width < 500 ? 5 : 8)));

  return (
    <div ref={wrapRef} className="w-full space-y-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        className="block w-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Visitors over time"
      >
        <defs>
          <linearGradient id="visitorsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
          </linearGradient>
        </defs>
        <text x={4} y={padY + 4} className="fill-zinc-500" style={{ fontSize: 10 }}>
          {max}
        </text>
        <text x={4} y={padY + innerH} className="fill-zinc-500" style={{ fontSize: 10 }}>
          0
        </text>
        <line
          x1={padL}
          y1={padY + innerH}
          x2={width - padR}
          y2={padY + innerH}
          stroke="#3f3f46"
          strokeWidth="1"
        />
        {area ? <path d={area} fill="url(#visitorsFill)" /> : null}
        {path ? <path d={path} fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" /> : null}
        {points.map((p) => (
          <circle key={p.key} cx={p.x} cy={p.y} r={width < 400 ? 2 : 3} fill="#93c5fd">
            <title>
              {formatSeriesTick(p.key, granularity)}: {p.visitors} visitors · {p.pageViews} views
            </title>
          </circle>
        ))}
      </svg>
      <div className="flex justify-between gap-1 pl-7 text-[10px] text-zinc-500 sm:text-[11px]">
        {series.map((s, i) =>
          i % labelEvery === 0 || i === series.length - 1 ? (
            <span key={s.key} className="shrink-0">
              {formatSeriesTick(s.key, granularity)}
            </span>
          ) : (
            <span key={s.key} className="min-w-0 flex-1" />
          ),
        )}
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-zinc-400">
        <span>
          Visitors: <strong className="text-zinc-200">{uniqueVisitors}</strong>
        </span>
        <span>
          Page views: <strong className="text-zinc-200">{pageViews}</strong>
        </span>
      </div>
    </div>
  );
}

function Flag({ code }: { code: string }) {
  if (!code || code.length !== 2) {
    return <span className="inline-block h-3.5 w-5 rounded-sm bg-zinc-700" />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/20x15/${code.toLowerCase()}.png`}
      alt=""
      width={20}
      height={15}
      className="h-3.5 w-5 rounded-[2px] object-cover"
      loading="lazy"
    />
  );
}

function Favicon({ host }: { host: string }) {
  if (host === 'Direct') {
    return <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-zinc-700 text-[9px] text-zinc-300">D</span>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=32`}
      alt=""
      width={16}
      height={16}
      className="h-4 w-4 rounded-sm"
      loading="lazy"
    />
  );
}

function EventDetail({ event }: { event: TrackEventRow }) {
  const rows: Array<[string, string | number | null | undefined]> = [
    ['Page', event.path],
    ['Source CTA', sourceLabel(event.source)],
    ['Trafic', event.trafficSource],
    ['UTM source', event.utmSource],
    ['Pays', event.country ? countryLabel(event.country) : null],
    ['Ville', event.city],
    ['Appareil', event.deviceType],
    ['Visiteur', event.isReturning == null ? null : event.isReturning ? 'Récurrent' : 'Nouveau'],
    ['IP', event.clientIp],
    ['Référent', event.referrer],
  ];
  if (event.fullName || event.email || event.phone) {
    rows.push(['Nom', event.fullName], ['Email', event.email], ['Téléphone', event.phone]);
  }
  if (event.pickupDate || event.returnDate) {
    rows.push(
      ['Récupération', event.pickupDate],
      ['Retour', event.returnDate],
      ['Lieu départ', formatLocation(event.pickupLocation)],
      ['Lieu retour', formatLocation(event.returnLocation)],
      ['Jours', event.rentalDays],
      ['Prix', event.totalPrice != null ? `${event.totalPrice} MAD` : null],
    );
  }
  if (event.message) rows.push(['Message', event.message]);

  return (
    <div className="mt-3 grid gap-1 rounded-xl border border-slate-200 bg-white/80 p-3 text-sm">
      {rows
        .filter(([, value]) => value != null && value !== '' && value !== '–')
        .map(([label, value]) => (
          <div key={label} className="grid gap-1 sm:grid-cols-[130px_1fr]">
            <span className="font-medium text-slate-500">{label}</span>
            <span className="break-all text-slate-900">{String(value)}</span>
          </div>
        ))}
      {(event.phone || event.email) && (
        <div className="mt-2 flex flex-wrap gap-2 border-t border-slate-100 pt-2">
          {event.phone ? (
            <a href={`tel:${event.phone}`} className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
              <Phone className="h-3 w-3" /> Appeler
            </a>
          ) : null}
          {event.phone ? (
            <a
              href={`https://wa.me/${event.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white"
            >
              <MessageCircle className="h-3 w-3" /> WhatsApp
            </a>
          ) : null}
        </div>
      )}
    </div>
  );
}

const JOURNEY_STYLES: Record<JourneyStage, { card: string; badge: string; label: string }> = {
  confirmed: {
    card: 'border-green-200 bg-green-50',
    badge: 'bg-green-200 text-green-900',
    label: JOURNEY_STAGE_LABELS.confirmed,
  },
  abandoned: {
    card: 'border-amber-300 bg-amber-50',
    badge: 'bg-amber-200 text-amber-900',
    label: JOURNEY_STAGE_LABELS.abandoned,
  },
  'form-started': {
    card: 'border-orange-200 bg-orange-50/80',
    badge: 'bg-orange-200 text-orange-950',
    label: JOURNEY_STAGE_LABELS['form-started'],
  },
  'opened-no-details': {
    card: 'border-sky-200 bg-sky-50/80',
    badge: 'bg-sky-200 text-sky-950',
    label: JOURNEY_STAGE_LABELS['opened-no-details'],
  },
  'car-interest': {
    card: 'border-slate-200 bg-slate-50',
    badge: 'bg-slate-200 text-slate-800',
    label: JOURNEY_STAGE_LABELS['car-interest'],
  },
};

function JourneyCard({ journey }: { journey: BookingJourney }) {
  const style = JOURNEY_STYLES[journey.stage];
  const title =
    journey.fullName ||
    journey.email ||
    journey.phone ||
    (journey.stage === 'car-interest' || journey.stage === 'opened-no-details'
      ? 'Visiteur anonyme'
      : 'Visiteur');

  return (
    <div className={`rounded-xl border p-4 ${style.card}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-slate-900">{title}</p>
          <p className="text-sm text-slate-600">{journey.summary}</p>
          <p className="mt-1 text-xs text-slate-400">
            Dernière activité · {formatDate(journey.lastActivityAt)}
            {journey.eventCount > 1 ? ` · ${journey.eventCount} événements` : ''}
          </p>
          {(journey.country || journey.deviceType) && (
            <p className="mt-1 text-xs text-slate-500">
              {[journey.country ? countryLabel(journey.country) : null, journey.city, journey.deviceType]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
          {(journey.pickupDate || journey.returnDate) && (
            <p className="mt-1 text-xs text-slate-500">
              {[journey.pickupDate, journey.returnDate].filter(Boolean).join(' → ')}
            </p>
          )}
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${style.badge}`}>
          {style.label}
        </span>
      </div>
      {journey.hasContact ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {journey.phone ? (
            <a
              href={`tel:${journey.phone}`}
              className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
            >
              <Phone className="h-3 w-3" /> Appeler
            </a>
          ) : null}
          {journey.phone ? (
            <a
              href={`https://wa.me/${journey.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-green-600 px-3 py-1.5 text-xs font-medium text-white"
            >
              <MessageCircle className="h-3 w-3" /> WhatsApp
            </a>
          ) : null}
          {journey.email ? (
            <a
              href={`mailto:${journey.email}`}
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-800 ring-1 ring-slate-200"
            >
              <Mail className="h-3 w-3" /> Email
            </a>
          ) : null}
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-500">
          Pas de téléphone / email — suivi possible seulement via le parcours site.
        </p>
      )}
    </div>
  );
}

type JourneyFilter = 'all' | JourneyStage;


function FilterBar({
  filters,
  onClearKey,
  onClearAll,
  dark,
}: {
  filters: AnalyticsDimensionFilters;
  onClearKey: (key: AnalyticsFilterKey) => void;
  onClearAll: () => void;
  dark?: boolean;
}) {
  const chips = filterChips(filters, countryLabel);
  if (chips.length === 0) return null;
  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${
        dark ? 'border-b border-zinc-800 px-4 py-3 sm:px-6' : 'mb-4'
      }`}
    >
      <span className={`text-xs font-semibold uppercase tracking-wide ${dark ? 'text-zinc-500' : 'text-slate-500'}`}>
        Filtered by
      </span>
      {chips.map((chip) => (
        <button
          key={`${chip.key}:${chip.value}`}
          type="button"
          onClick={() => onClearKey(chip.key)}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            dark
              ? 'bg-zinc-800 text-zinc-100 ring-1 ring-zinc-600 hover:bg-zinc-700'
              : 'bg-slate-100 text-slate-800 ring-1 ring-slate-200 hover:bg-slate-200'
          }`}
        >
          {chip.label}
          <X className="h-3 w-3 opacity-70" />
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className={`text-xs font-medium underline-offset-2 hover:underline ${
          dark ? 'text-zinc-400' : 'text-slate-500'
        }`}
      >
        Clear all
      </button>
    </div>
  );
}

export default function TrackingDashboard({ page = 'analytics' }: { page?: DashboardPage }) {
  const [range, setRange] = useState<AnalyticsRange>(() => resolveAnalyticsRange('24h'));
  const [filters, setFilters] = useState<AnalyticsDimensionFilters>({});
  const [filtersReady, setFiltersReady] = useState(false);
  const [events, setEvents] = useState<TrackEventRow[]>([]);
  const [journeys, setJourneys] = useState<BookingJourney[]>([]);
  const [journeyFilter, setJourneyFilter] = useState<JourneyFilter>('all');
  const [journalMode, setJournalMode] = useState<JournalMode>('clicks');
  const [stats, setStats] = useState<TrackStats | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [granularity, setGranularity] = useState<'hour' | 'day'>('hour');
  const [eventLabels, setEventLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventFilter, setEventFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [sourceTab, setSourceTab] = useState<'referrers' | 'utm'>('referrers');
  const [utmTab, setUtmTab] = useState<'sources' | 'mediums' | 'campaigns'>('sources');
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const timezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      return 'UTC';
    }
  }, []);

  useEffect(() => {
    setFilters(loadFiltersFromStorage());
    setFiltersReady(true);
  }, []);

  useEffect(() => {
    if (!filtersReady) return;
    saveFiltersToStorage(filters);
  }, [filters, filtersReady]);

  const setDimFilter = useCallback((key: AnalyticsFilterKey, value: string) => {
    setFilters((prev) => toggleFilter(prev, key, value));
    setPageNum(1);
  }, []);

  const removeDimFilter = useCallback((key: AnalyticsFilterKey) => {
    setFilters((prev) => clearFilter(prev, key));
    setPageNum(1);
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({});
    setPageNum(1);
  }, []);

  const fetchEvents = useCallback(async () => {
    if (!filtersReady) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: '40',
        preset: range.preset,
        from: range.from.toISOString(),
        to: range.to.toISOString(),
        label: range.label,
        tz: timezone,
        view: page === 'reservations' ? (journalMode === 'clicks' ? 'clicks' : 'reservations') : 'all',
        excludePageViews: 'true',
      });
      if (page === 'reservations' && eventFilter !== 'all') params.set('event', eventFilter);
      if (search) params.set('search', search);
      for (const [k, v] of Object.entries(filtersToQuery(filters))) {
        params.set(k, v);
      }

      const res = await fetch(`/api/admin/track-events?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load tracking data');

      setEvents(data.events ?? []);
      setJourneys(data.journeys ?? []);
      setStats(data.stats ?? null);
      setInsights(data.insights ?? null);
      setGranularity(data.range?.granularity === 'hour' ? 'hour' : 'day');
      setEventLabels(data.eventLabels ?? {});
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tracking data');
    } finally {
      setLoading(false);
    }
  }, [eventFilter, filters, filtersReady, journalMode, page, pageNum, range, search, timezone]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPageNum(1);
    setSearch(searchInput.trim());
  };

  const onRangeChange = (next: AnalyticsRange) => {
    setRange(next);
    setPageNum(1);
  };

  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    const list = insights?.countries ?? [];
    if (!q) return list;
    return list.filter((c) => {
      const name = countryLabel(c.code || c.name).toLowerCase();
      return name.includes(q) || c.code.toLowerCase().includes(q);
    });
  }, [countrySearch, insights?.countries]);

  const filteredJourneys = useMemo(() => {
    if (journeyFilter === 'all') return journeys;
    return journeys.filter((j) => j.stage === journeyFilter);
  }, [journeyFilter, journeys]);

  const journeyCounts = useMemo(() => {
    const counts: Record<JourneyFilter, number> = {
      all: journeys.length,
      confirmed: 0,
      abandoned: 0,
      'form-started': 0,
      'opened-no-details': 0,
      'car-interest': 0,
    };
    for (const j of journeys) counts[j.stage] += 1;
    return counts;
  }, [journeys]);

  const utmRows =
    utmTab === 'sources'
      ? insights?.utm?.sources ?? []
      : utmTab === 'mediums'
        ? insights?.utm?.mediums ?? []
        : insights?.utm?.campaigns ?? [];

  const funnel = insights?.funnel;
  const carStats = insights?.carStats ?? [];
  const activeFilters = hasActiveFilters(filters);

  const filterBar = (
    <FilterBar
      filters={filters}
      onClearKey={removeDimFilter}
      onClearAll={clearAllFilters}
      dark
    />
  );

  if (page === 'reservations') {
    return (
      <div className="space-y-6">
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-xl">
          <div className="flex flex-col gap-4 border-b border-zinc-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Reservations</h2>
              <p className="mt-0.5 text-sm text-zinc-500">
                Funnel, car clicks & booking journeys · Local ({timezone})
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <AnalyticsDateRangePicker value={range} onChange={onRangeChange} />
              <Button
                variant="outline"
                size="sm"
                onClick={fetchEvents}
                disabled={loading}
                className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-white"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Refresh
              </Button>
            </div>
          </div>

          {error && (
            <div className="mx-4 mt-4 rounded-lg border border-red-900/60 bg-red-950/50 p-3 text-sm text-red-200 sm:mx-6">
              {error}
            </div>
          )}

          {filterBar}

          <div className="grid gap-3 border-b border-zinc-800 px-4 py-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 xl:grid-cols-7">
            {[
              { label: 'Page views', value: funnel?.pageViews ?? stats?.pageViewsPeriod ?? '–' },
              { label: 'Car interest', value: funnel?.carInterest ?? '–' },
              { label: 'WhatsApp', value: funnel?.whatsapp ?? stats?.whatsappPeriod ?? '–' },
              { label: 'Form open', value: funnel?.formOpen ?? '–' },
              { label: 'In progress', value: funnel?.formProgress ?? '–' },
              { label: 'Abandoned', value: funnel?.abandoned ?? stats?.abandonedPeriod ?? '–' },
              { label: 'Confirmed', value: funnel?.confirmed ?? stats?.confirmedPeriod ?? '–' },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{kpi.label}</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">{kpi.value}</p>
              </div>
            ))}
          </div>

          <div className="p-4 sm:p-6">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">Cars performance</h3>
                <p className="text-xs text-zinc-500">Click a car to filter journeys and events</p>
              </div>
              <div className="hidden gap-4 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 sm:flex">
                <span className="w-14 text-right">Clicks</span>
                <span className="w-14 text-right">Opens</span>
                <span className="w-14 text-right">Confirm</span>
                <span className="w-14 text-right">Abandon</span>
              </div>
            </div>
            {loading && carStats.length === 0 ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
              </div>
            ) : carStats.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">No car activity in this range.</p>
            ) : (
              <ul className="max-h-96 space-y-1 overflow-y-auto">
                {carStats.map((car) => {
                  const value = car.slug || car.name;
                  const active = filters.car === value || filters.car === car.name;
                  return (
                    <li key={value}>
                      <button
                        type="button"
                        onClick={() => setDimFilter('car', value)}
                        className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-zinc-900/80 ${
                          active ? 'bg-zinc-800 ring-1 ring-sky-500/50' : ''
                        }`}
                      >
                        <span className="min-w-0 flex-1 truncate font-medium">{car.name}</span>
                        <span className="w-14 shrink-0 text-right tabular-nums text-zinc-300">{car.clicks}</span>
                        <span className="w-14 shrink-0 text-right tabular-nums text-zinc-300">{car.opens}</span>
                        <span className="w-14 shrink-0 text-right tabular-nums text-emerald-300">{car.confirms}</span>
                        <span className="w-14 shrink-0 text-right tabular-nums text-amber-300">{car.abandons}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-[#b11226]" />
              Booking journeys
            </CardTitle>
            <CardDescription>
              One card per visitor for {range.label}
              {activeFilters ? ' (scoped to active filters)' : ''}.
            </CardDescription>
            <div className="flex flex-wrap gap-2 pt-2">
              {(
                [
                  ['all', 'All'],
                  ['abandoned', 'À relancer'],
                  ['form-started', 'Sans coordonnées'],
                  ['opened-no-details', 'Ouvert, pas de détails'],
                  ['car-interest', 'Intérêt voiture'],
                  ['confirmed', 'Confirmées'],
                ] as Array<[JourneyFilter, string]>
              ).map(([key, label]) => (
                <Button
                  key={key}
                  size="sm"
                  variant={journeyFilter === key ? 'default' : 'outline'}
                  className={
                    journeyFilter === key
                      ? 'bg-slate-950 text-white hover:bg-slate-800'
                      : 'bg-white'
                  }
                  onClick={() => setJourneyFilter(key)}
                >
                  {label}
                  <span className="ml-1.5 tabular-nums opacity-70">{journeyCounts[key]}</span>
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {loading && journeys.length === 0 ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : filteredJourneys.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No journeys in this filter for the selected period.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {filteredJourneys.map((journey) => (
                  <JourneyCard key={`${journey.id}-${journey.stage}`} journey={journey} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MousePointerClick className="h-5 w-5 text-[#b11226]" />
                  {journalMode === 'clicks' ? 'Important clicks' : 'Booking events'}
                </CardTitle>
                <CardDescription className="mt-1">Same date range and dimension filters.</CardDescription>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={journalMode === 'clicks' ? 'default' : 'outline'}
                    className={journalMode === 'clicks' ? 'bg-slate-950 text-white' : 'bg-white'}
                    onClick={() => {
                      setJournalMode('clicks');
                      setPageNum(1);
                    }}
                  >
                    Important clicks
                  </Button>
                  <Button
                    size="sm"
                    variant={journalMode === 'all' ? 'default' : 'outline'}
                    className={journalMode === 'all' ? 'bg-slate-950 text-white' : 'bg-white'}
                    onClick={() => {
                      setJournalMode('all');
                      setPageNum(1);
                    }}
                  >
                    Booking funnel events
                  </Button>
                </div>
              </div>
              <Select
                value={eventFilter}
                onValueChange={(v) => {
                  setEventFilter(v);
                  setPageNum(1);
                }}
              >
                <SelectTrigger className="w-[220px] bg-white">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {Object.entries(EVENT_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Car, email, phone, page…"
                  className="bg-white pl-9"
                />
              </div>
              <Button type="submit" variant="outline" className="bg-white">
                Search
              </Button>
            </form>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : events.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">No events for this filter.</p>
            ) : (
              <div className="space-y-2">
                {events.map((event) => {
                  const Icon = EVENT_ICONS[event.event] ?? MousePointerClick;
                  const isExpanded = expandedId === event.id;
                  const isAbandoned = event.event === 'booking-abandoned';
                  const isConfirmed = event.event === 'booking-confirmed';
                  return (
                    <div
                      key={event.id}
                      className={`rounded-xl border p-4 ${
                        isAbandoned
                          ? 'border-amber-300 bg-amber-50/80'
                          : isConfirmed
                            ? 'border-green-200 bg-green-50/50'
                            : 'border-slate-200 bg-white'
                      }`}
                    >
                      <button
                        type="button"
                        className="flex w-full items-start gap-3 text-left"
                        onClick={() => setExpandedId(isExpanded ? null : event.id)}
                      >
                        <div className="mt-0.5 rounded-lg bg-slate-100 p-2">
                          <Icon className="h-4 w-4 text-slate-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-slate-900">
                              {eventLabels[event.event] ?? event.event}
                            </span>
                            {isAbandoned && (
                              <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-900">
                                À relancer
                              </span>
                            )}
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                              {sourceLabel(event.source)}
                            </span>
                            {event.country ? (
                              <button
                                type="button"
                                className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDimFilter('country', event.country!.toUpperCase());
                                }}
                              >
                                {event.country}
                              </button>
                            ) : null}
                          </div>
                          <p className="mt-1 truncate text-sm text-slate-600">
                            {event.fullName || event.carName || event.carSlug || event.path}
                            {event.phone ? ` · ${event.phone}` : ''}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">{formatDate(event.createdAt)}</p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        )}
                      </button>
                      {isExpanded && <EventDetail event={event} />}
                    </div>
                  );
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pageNum <= 1 || loading}
                  onClick={() => setPageNum((p) => p - 1)}
                  className="bg-white"
                >
                  Previous
                </Button>
                <span className="text-sm text-slate-500">
                  Page {pageNum} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pageNum >= totalPages || loading}
                  onClick={() => setPageNum((p) => p + 1)}
                  className="bg-white"
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Analytics page
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-xl">
        <div className="flex flex-col gap-4 border-b border-zinc-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Analytics</h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              Visitors, countries & sources · Local ({timezone})
              {activeFilters ? ' · filtered' : ''}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AnalyticsDateRangePicker value={range} onChange={onRangeChange} />
            <Button
              variant="outline"
              size="sm"
              onClick={fetchEvents}
              disabled={loading}
              className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-white"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-4 rounded-lg border border-red-900/60 bg-red-950/50 p-3 text-sm text-red-200 sm:mx-6">
            {error}
          </div>
        )}

        {filterBar}

        <div className="grid gap-3 border-b border-zinc-800 px-4 py-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {[
            {
              label: 'Visitors',
              value: stats?.uniqueVisitors ?? '–',
              hint: `${stats?.newVisitors ?? 0} new · ${stats?.returningVisitors ?? 0} returning`,
            },
            { label: 'Page views', value: stats?.pageViewsPeriod ?? '–', hint: range.label },
            { label: 'WhatsApp', value: stats?.whatsappPeriod ?? '–', hint: 'clicks in range' },
            { label: 'Bookings', value: stats?.confirmedPeriod ?? '–', hint: 'confirmed in range' },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{kpi.label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{kpi.value}</p>
              <p className="mt-1 text-xs text-zinc-500">{kpi.hint}</p>
            </div>
          ))}
        </div>

        <div className="border-b border-zinc-800 px-4 py-5 sm:px-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200">Visitors</h3>
            <span className="text-xs text-zinc-500">{range.label}</span>
          </div>
          {loading && !insights ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
            </div>
          ) : (insights?.series?.length ?? 0) === 0 ? (
            <p className="py-12 text-center text-sm text-zinc-500">No visitor data for this range yet.</p>
          ) : (
            <VisitorsChart
              series={insights!.series}
              granularity={granularity}
              uniqueVisitors={stats?.uniqueVisitors ?? 0}
              pageViews={stats?.pageViewsPeriod ?? 0}
            />
          )}
        </div>

        <div className="grid gap-0 lg:grid-cols-2">
          <div className="border-b border-zinc-800 p-4 sm:p-6 lg:border-b-0 lg:border-r">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">Countries</h3>
                <p className="text-xs text-zinc-500">Click to filter all KPIs</p>
              </div>
              <div className="flex gap-4 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                <span className="w-16 text-right">Visitors</span>
                <span className="w-16 text-right">Page views</span>
              </div>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
              <Input
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                placeholder="Search"
                className="h-9 border-zinc-700 bg-zinc-900 pl-9 text-sm text-zinc-100 placeholder:text-zinc-500"
              />
            </div>
            <ul className="max-h-80 space-y-1 overflow-y-auto">
              {filteredCountries.length === 0 ? (
                <li className="py-8 text-center text-sm text-zinc-500">No countries yet.</li>
              ) : (
                filteredCountries.map((c) => {
                  const code = c.code || 'ZZ';
                  const name = countryLabel(c.code || c.name);
                  const bar = Math.max(2, Math.min(100, c.share));
                  const active = filters.country === code;
                  return (
                    <li key={c.code || c.name}>
                      <button
                        type="button"
                        onClick={() => setDimFilter('country', code)}
                        className={`relative w-full rounded-md px-2 py-2 text-left hover:bg-zinc-900/80 ${
                          active ? 'bg-zinc-800 ring-1 ring-sky-500/50' : ''
                        }`}
                      >
                        <div
                          className="pointer-events-none absolute inset-y-1 left-0 rounded-md bg-zinc-800/80"
                          style={{ width: `${bar}%` }}
                        />
                        <div className="relative flex items-center gap-2 text-sm">
                          <Flag code={c.code} />
                          <span className="min-w-0 flex-1 truncate font-medium">{name}</span>
                          <span className="w-10 shrink-0 text-right text-xs text-zinc-500">
                            {c.share < 0.5 ? '<0.5%' : `${c.share}%`}
                          </span>
                          <span className="w-16 shrink-0 text-right tabular-nums">{c.visitors}</span>
                          <span className="w-16 shrink-0 text-right tabular-nums text-zinc-300">{c.pageViews}</span>
                        </div>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>

          <div className="p-4 sm:p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex gap-4 text-sm">
                <button
                  type="button"
                  onClick={() => setSourceTab('referrers')}
                  className={
                    sourceTab === 'referrers'
                      ? 'border-b-2 border-white pb-1 font-semibold text-white'
                      : 'pb-1 text-zinc-500 hover:text-zinc-300'
                  }
                >
                  Referrers
                </button>
                <button
                  type="button"
                  onClick={() => setSourceTab('utm')}
                  className={
                    sourceTab === 'utm'
                      ? 'border-b-2 border-white pb-1 font-semibold text-white'
                      : 'pb-1 text-zinc-500 hover:text-zinc-300'
                  }
                >
                  UTM Parameters
                </button>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                Visitors
              </span>
            </div>

            {sourceTab === 'utm' ? (
              <div className="mb-3 flex gap-2">
                {(['sources', 'mediums', 'campaigns'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setUtmTab(tab)}
                    className={`rounded-full px-2.5 py-1 text-xs capitalize ${
                      utmTab === tab ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            ) : null}

            <ul className="max-h-80 space-y-1 overflow-y-auto">
              {sourceTab === 'referrers' ? (
                (insights?.referrers?.length ?? 0) === 0 ? (
                  <li className="py-8 text-center text-sm text-zinc-500">No referrers yet.</li>
                ) : (
                  insights!.referrers.map((r) => {
                    const active = filters.referrer === r.name;
                    return (
                      <li key={r.name}>
                        <button
                          type="button"
                          onClick={() => setDimFilter('referrer', r.name)}
                          className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-zinc-900/80 ${
                            active ? 'bg-zinc-800 ring-1 ring-sky-500/50' : ''
                          }`}
                        >
                          <Favicon host={r.name} />
                          <span className="min-w-0 flex-1 truncate">{r.name}</span>
                          <span className="tabular-nums text-zinc-200">{r.visitors}</span>
                        </button>
                      </li>
                    );
                  })
                )
              ) : utmRows.length === 0 ? (
                <li className="py-8 text-center text-sm text-zinc-500">No UTM data yet.</li>
              ) : (
                utmRows.map((r) => {
                  const key: AnalyticsFilterKey =
                    utmTab === 'sources' ? 'utmSource' : utmTab === 'mediums' ? 'utmMedium' : 'utmCampaign';
                  const active = filters[key] === r.name;
                  return (
                    <li key={r.name}>
                      <button
                        type="button"
                        onClick={() => setDimFilter(key, r.name)}
                        className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-zinc-900/80 ${
                          active ? 'bg-zinc-800 ring-1 ring-sky-500/50' : ''
                        }`}
                      >
                        <span className="min-w-0 flex-1 truncate font-mono text-xs">{r.name}</span>
                        <span className="tabular-nums text-zinc-200">{r.visitors}</span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
