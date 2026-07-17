'use client';

import { useCallback, useEffect, useState } from 'react';
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
  BarChart3,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  Eye,
  Loader2,
  MessageCircle,
  MousePointerClick,
  RefreshCw,
  Search,
  Send,
  Users,
} from 'lucide-react';
import { EVENT_LABELS, SOURCE_LABELS } from '@/lib/trackEventTypes';

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

type TrackStats = {
  total: number;
  today: number;
  last7Days: number;
  pageViewsToday: number;
  conversionsLast7Days: number;
  abandonedLast7Days: number;
  byEvent: Record<string, { count: number; label: string }>;
  periodDays: number;
};

const EVENT_OPTIONS = [
  { value: 'all', label: 'Tous les événements' },
  ...Object.entries(EVENT_LABELS).map(([value, label]) => ({ value, label })),
];

const PERIOD_OPTIONS = [
  { value: '7', label: '7 derniers jours' },
  { value: '30', label: '30 derniers jours' },
  { value: '90', label: '90 derniers jours' },
  { value: '365', label: '12 derniers mois' },
];

const EVENT_ICONS: Record<string, typeof MessageCircle> = {
  'page-view': Eye,
  whatsapp: MessageCircle,
  reserver: MousePointerClick,
  'booking-dialog-open': Users,
  'booking-submit': Send,
  'booking-confirmed': CalendarCheck,
  'booking-abandoned': AlertTriangle,
  'booking-form-progress': Users,
  'contact-submit': Send,
  'blog-cta': BarChart3,
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

function EventDetail({ event }: { event: TrackEventRow }) {
  const rows: Array<[string, string | number | null | undefined]> = [
    ['Page', event.path],
    ['Source', sourceLabel(event.source)],
    ['Voiture', event.carName || event.carSlug || '–'],
    ['URL', event.fullUrl],
    ['IP', event.clientIp],
    ['Langue', event.language],
    ['Référent', event.referrer],
    ['Écran', event.screen],
    ['Fuseau', event.timezone],
    ['Navigateur', event.userAgent?.slice(0, 120)],
  ];

  if (event.fullName || event.email || event.phone) {
    rows.push(
      ['Nom', event.fullName],
      ['Email', event.email],
      ['Téléphone', event.phone],
    );
  }

  if (event.pickupDate || event.returnDate) {
    rows.push(
      ['Récupération', event.pickupDate],
      ['Retour', event.returnDate],
      ['Lieu départ', formatLocation(event.pickupLocation)],
      ['Lieu retour', formatLocation(event.returnLocation)],
      ['Jours', event.rentalDays],
      ['Prix total', event.totalPrice != null ? `${event.totalPrice} MAD` : null],
    );
  }

  if (event.message) {
    rows.push(['Message', event.message]);
  }

  if (event.metadata && typeof event.metadata === 'object') {
    for (const [key, value] of Object.entries(event.metadata)) {
      rows.push([key, String(value)]);
    }
  }

  if (event.ctaLabel) {
    rows.push(['CTA', event.ctaLabel]);
  }

  return (
    <div className="mt-3 grid gap-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
      {rows
        .filter(([, value]) => value != null && value !== '' && value !== '–')
        .map(([label, value]) => (
          <div key={label} className="grid gap-1 sm:grid-cols-[140px_1fr]">
            <span className="font-medium text-slate-500">{label}</span>
            <span className="break-all text-slate-900">{String(value)}</span>
          </div>
        ))}
    </div>
  );
}

export default function TrackingDashboard() {
  const [events, setEvents] = useState<TrackEventRow[]>([]);
  const [stats, setStats] = useState<TrackStats | null>(null);
  const [eventLabels, setEventLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventFilter, setEventFilter] = useState('all');
  const [days, setDays] = useState('30');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [excludePageViews, setExcludePageViews] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '50',
        days,
      });
      if (eventFilter !== 'all') params.set('event', eventFilter);
      if (search) params.set('search', search);
      if (excludePageViews) params.set('excludePageViews', 'true');

      const res = await fetch(`/api/admin/track-events?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load tracking data');

      setEvents(data.events ?? []);
      setStats(data.stats ?? null);
      setEventLabels(data.eventLabels ?? {});
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tracking data');
    } finally {
      setLoading(false);
    }
  }, [days, eventFilter, excludePageViews, page, search]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Aujourd&apos;hui</CardDescription>
            <CardTitle className="text-3xl">{stats?.today ?? '–'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">clics et actions</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>7 derniers jours</CardDescription>
            <CardTitle className="text-3xl">{stats?.last7Days ?? '–'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">toutes sources confondues</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Période ({days}j)</CardDescription>
            <CardTitle className="text-3xl">{stats?.total ?? '–'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">événements filtrés</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Pages vues aujourd&apos;hui</CardDescription>
            <CardTitle className="text-3xl">{stats?.pageViewsToday ?? '–'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">trafic réel sur le site</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Abandons (7j)</CardDescription>
            <CardTitle className="text-3xl text-amber-800">
              {stats?.abandonedLast7Days ?? '–'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-900/70">formulaires commencés non envoyés</p>
          </CardContent>
        </Card>
      </div>

      {stats?.byEvent && Object.keys(stats.byEvent).length > 0 && (
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-[#b11226]" />
              Répartition par type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.byEvent).map(([key, value]) => {
                const Icon = EVENT_ICONS[key] ?? MousePointerClick;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setEventFilter(key);
                      setPage(1);
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm transition hover:border-slate-300 hover:bg-white"
                  >
                    <Icon className="h-3.5 w-3.5 text-slate-500" />
                    <span>{value.label}</span>
                    <span className="rounded-full bg-slate-950 px-2 py-0.5 text-xs font-semibold text-white">
                      {value.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MousePointerClick className="h-5 w-5 text-[#b11226]" />
                Journal des clics
              </CardTitle>
              <CardDescription className="mt-1">
                Pages vues, clics, formulaires, WhatsApp, réservations — tout le site.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={days} onValueChange={(v) => { setDays(v); setPage(1); }}>
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={eventFilter} onValueChange={(v) => { setEventFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[220px] bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant={excludePageViews ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setExcludePageViews((v) => !v); setPage(1); }}
                className={excludePageViews ? 'bg-slate-950 text-white hover:bg-slate-800' : 'bg-white'}
              >
                {excludePageViews ? 'Actions seulement' : 'Tout afficher'}
              </Button>
              <Button variant="outline" size="sm" onClick={fetchEvents} disabled={loading} className="bg-white">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Actualiser
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Rechercher voiture, email, téléphone, page..."
                className="bg-white pl-9"
              />
            </div>
            <Button type="submit" variant="outline" className="bg-white">Rechercher</Button>
          </form>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center">
              <p className="text-slate-600">Aucun événement pour cette période.</p>
              <p className="mt-1 text-sm text-slate-500">
                Les nouveaux clics apparaîtront ici dès qu&apos;un visiteur interagit sur le site.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((event) => {
                const Icon = EVENT_ICONS[event.event] ?? MousePointerClick;
                const isExpanded = expandedId === event.id;
                const label = eventLabels[event.event] ?? event.event;
                const subtitle = event.carName || event.carSlug || event.fullName || event.path;

                const isAbandoned = event.event === 'booking-abandoned';
                const isProgress = event.event === 'booking-form-progress';

                return (
                  <div
                    key={event.id}
                    className={`rounded-xl border p-4 shadow-sm ${
                      isAbandoned
                        ? 'border-amber-300 bg-amber-50/80'
                        : isProgress
                          ? 'border-blue-200 bg-blue-50/50'
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
                          <span className="font-semibold text-slate-900">{label}</span>
                          {isAbandoned && (
                            <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-900">
                              À relancer
                            </span>
                          )}
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                            {sourceLabel(event.source)}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-sm text-slate-600">{subtitle}</p>
                        <p className="mt-1 text-xs text-slate-400">{formatDate(event.createdAt)}</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
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
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="bg-white"
              >
                Précédent
              </Button>
              <span className="text-sm text-slate-500">
                Page {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="bg-white"
              >
                Suivant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
