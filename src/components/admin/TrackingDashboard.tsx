'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
  Car,
  ChevronDown,
  ChevronUp,
  Eye,
  FlaskConical,
  Loader2,
  Mail,
  MessageCircle,
  MousePointerClick,
  Phone,
  RefreshCw,
  Search,
  Send,
  TrendingUp,
  Users,
} from 'lucide-react';
import { EVENT_LABELS, SOURCE_LABELS } from '@/lib/trackEventTypes';
import StatsigFeaturePanel from '@/components/admin/StatsigFeaturePanel';

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
  pageViewsPeriod: number;
  whatsappPeriod: number;
  whatsappToday: number;
  confirmedPeriod: number;
  confirmedToday: number;
  abandonedPeriod: number;
  abandonedToday: number;
  reserverPeriod: number;
  phonePeriod: number;
  contactPeriod: number;
  leadsWithContact: number;
  byEvent: Record<string, { count: number; label: string }>;
  periodDays: number;
};

type Insights = {
  topCars: Array<{ name: string; count: number }>;
  topPages: Array<{ path: string; count: number }>;
  daily: Array<{
    date: string;
    views: number;
    whatsapp: number;
    reservations: number;
    abandons: number;
    clicks: number;
  }>;
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

type ViewMode = 'overview' | 'leads' | 'clicks' | 'reservations' | 'all';

const PERIOD_OPTIONS = [
  { value: '7', label: '7 jours' },
  { value: '30', label: '30 jours' },
  { value: '90', label: '90 jours' },
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

function formatDay(isoDate: string) {
  return new Date(isoDate + 'T12:00:00').toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
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

function KpiCard({
  label,
  value,
  hint,
  accent,
  onClick,
}: {
  label: string;
  value: number | string;
  hint: string;
  accent?: 'green' | 'red' | 'amber' | 'slate';
  onClick?: () => void;
}) {
  const accents = {
    green: 'border-green-200 bg-green-50/70 text-green-900',
    red: 'border-[#b11226]/30 bg-[#b11226]/5 text-[#7a0c1a]',
    amber: 'border-amber-200 bg-amber-50/70 text-amber-950',
    slate: 'border-slate-200 bg-white text-slate-950',
  };
  const cls = accents[accent ?? 'slate'];
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left shadow-sm transition ${cls} ${onClick ? 'hover:shadow-md cursor-pointer' : ''}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs opacity-70">{hint}</p>
    </Comp>
  );
}

function FunnelBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-900">{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-[#b11226]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function DailyChart({ daily }: { daily: Insights['daily'] }) {
  const max = useMemo(
    () =>
      Math.max(
        1,
        ...daily.map((d) => d.views + d.whatsapp + d.reservations + d.abandons + d.clicks),
      ),
    [daily],
  );

  if (daily.length === 0) return null;

  const showEvery = daily.length > 14 ? Math.ceil(daily.length / 10) : 1;

  return (
    <div className="space-y-3">
      <div className="flex h-36 items-end gap-0.5 sm:gap-1">
        {daily.map((d) => {
          const total = d.views + d.whatsapp + d.reservations + d.abandons + d.clicks;
          const h = Math.max(total > 0 ? 8 : 2, Math.round((total / max) * 100));
          return (
            <div key={d.date} className="group relative flex flex-1 flex-col items-center justify-end">
              <div
                className="w-full max-w-[18px] rounded-t bg-slate-800 transition group-hover:bg-[#b11226]"
                style={{ height: `${h}%` }}
                title={`${formatDay(d.date)} · ${total} événements`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-slate-400">
        {daily.map((d, i) =>
          i % showEvery === 0 || i === daily.length - 1 ? (
            <span key={d.date}>{formatDay(d.date)}</span>
          ) : (
            <span key={d.date} />
          ),
        )}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        <span>WhatsApp période: {daily.reduce((s, d) => s + d.whatsapp, 0)}</span>
        <span>Réservations: {daily.reduce((s, d) => s + d.reservations, 0)}</span>
        <span>Abandons: {daily.reduce((s, d) => s + d.abandons, 0)}</span>
      </div>
    </div>
  );
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
  if (event.ctaLabel) rows.push(['CTA', event.ctaLabel]);

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
            <a
              href={`tel:${event.phone}`}
              className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white"
            >
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
          {event.email ? (
            <a
              href={`mailto:${event.email}`}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-800"
            >
              <Mail className="h-3 w-3" /> Email
            </a>
          ) : null}
        </div>
      )}
    </div>
  );
}

function LeadCard({ lead }: { lead: TrackEventRow }) {
  const isAbandoned = lead.event === 'booking-abandoned';
  const isConfirmed = lead.event === 'booking-confirmed';
  return (
    <div
      className={`rounded-xl border p-4 ${
        isAbandoned
          ? 'border-amber-300 bg-amber-50'
          : isConfirmed
            ? 'border-green-200 bg-green-50'
            : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-900">
            {lead.fullName || lead.email || lead.phone || 'Visiteur'}
          </p>
          <p className="text-sm text-slate-600">
            {lead.carName || lead.carSlug || '—'} · {EVENT_LABELS[lead.event] ?? lead.event}
          </p>
          <p className="mt-1 text-xs text-slate-400">{formatDate(lead.createdAt)}</p>
        </div>
        {isAbandoned ? (
          <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-900">
            À relancer
          </span>
        ) : isConfirmed ? (
          <span className="rounded-full bg-green-200 px-2 py-0.5 text-xs font-semibold text-green-900">
            Confirmée
          </span>
        ) : null}
      </div>
      <div className="mt-2 space-y-0.5 text-sm text-slate-700">
        {lead.phone ? <p>Tél: {lead.phone}</p> : null}
        {lead.email ? <p>Email: {lead.email}</p> : null}
        {(lead.pickupDate || lead.returnDate) && (
          <p>
            {lead.pickupDate || '?'} → {lead.returnDate || '?'}
            {lead.rentalDays ? ` (${lead.rentalDays}j)` : ''}
            {lead.totalPrice != null ? ` · ${lead.totalPrice} MAD` : ''}
          </p>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {lead.phone ? (
          <a
            href={`tel:${lead.phone}`}
            className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
          >
            <Phone className="h-3 w-3" /> Appeler
          </a>
        ) : null}
        {lead.phone ? (
          <a
            href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-green-600 px-3 py-1.5 text-xs font-medium text-white"
          >
            <MessageCircle className="h-3 w-3" /> WhatsApp
          </a>
        ) : null}
      </div>
    </div>
  );
}

export default function TrackingDashboard() {
  const [events, setEvents] = useState<TrackEventRow[]>([]);
  const [leads, setLeads] = useState<TrackEventRow[]>([]);
  const [stats, setStats] = useState<TrackStats | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [eventLabels, setEventLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>('overview');
  const [eventFilter, setEventFilter] = useState('all');
  const [days, setDays] = useState('30');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showStatsig, setShowStatsig] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '40',
        days,
        view: view === 'overview' ? 'all' : view,
        excludePageViews: 'true',
      });
      if (eventFilter !== 'all') params.set('event', eventFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/track-events?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load tracking data');

      setEvents(data.events ?? []);
      setLeads(data.leads ?? []);
      setStats(data.stats ?? null);
      setInsights(data.insights ?? null);
      setEventLabels(data.eventLabels ?? {});
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tracking data');
    } finally {
      setLoading(false);
    }
  }, [days, eventFilter, page, search, view]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const setQuickView = (next: ViewMode) => {
    setView(next);
    setEventFilter('all');
    setPage(1);
  };

  const funnelMax = Math.max(
    1,
    insights?.funnel.pageViews ?? 0,
    insights?.funnel.whatsapp ?? 0,
    insights?.funnel.confirmed ?? 0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Analytics site</h2>
          <p className="mt-1 text-sm text-slate-500">
            Trafic, WhatsApp, réservations et leads — tout dans l&apos;admin, sans Statsig.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={days} onValueChange={(v) => { setDays(v); setPage(1); }}>
            <SelectTrigger className="w-[120px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchEvents} disabled={loading} className="bg-white">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Actualiser
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Pages vues"
          value={stats?.pageViewsPeriod ?? '–'}
          hint={`Aujourd'hui: ${stats?.pageViewsToday ?? 0}`}
          onClick={() => setQuickView('all')}
        />
        <KpiCard
          label="WhatsApp"
          value={stats?.whatsappPeriod ?? '–'}
          hint={`Aujourd'hui: ${stats?.whatsappToday ?? 0}`}
          accent="green"
          onClick={() => { setQuickView('clicks'); setEventFilter('whatsapp'); }}
        />
        <KpiCard
          label="Réservations"
          value={stats?.confirmedPeriod ?? '–'}
          hint={`Aujourd'hui: ${stats?.confirmedToday ?? 0}`}
          accent="red"
          onClick={() => setQuickView('reservations')}
        />
        <KpiCard
          label="Abandons / leads"
          value={stats?.abandonedPeriod ?? '–'}
          hint={`${stats?.leadsWithContact ?? 0} contacts à relancer`}
          accent="amber"
          onClick={() => setQuickView('leads')}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Clic Réserver" value={stats?.reserverPeriod ?? '–'} hint="intention de booking" onClick={() => { setQuickView('clicks'); setEventFilter('reserver'); }} />
        <KpiCard label="Clic téléphone" value={stats?.phonePeriod ?? '–'} hint="appels depuis le site" onClick={() => { setQuickView('clicks'); setEventFilter('phone-click'); }} />
        <KpiCard label="Messages contact" value={stats?.contactPeriod ?? '–'} hint="formulaire contact" onClick={() => { setQuickView('leads'); setEventFilter('contact-submit'); }} />
      </div>

      {/* View tabs */}
      <div className="flex flex-wrap gap-2">
        {([
          ['overview', 'Vue d’ensemble'],
          ['leads', 'Leads & réservations'],
          ['clicks', 'Clics importants'],
          ['reservations', 'Tunnel booking'],
          ['all', 'Journal complet'],
        ] as Array<[ViewMode, string]>).map(([key, label]) => (
          <Button
            key={key}
            size="sm"
            variant={view === key ? 'default' : 'outline'}
            className={view === key ? 'bg-slate-950 text-white hover:bg-slate-800' : 'bg-white'}
            onClick={() => setQuickView(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Overview */}
      {(view === 'overview' || view === 'reservations') && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-[#b11226]" />
                Activité quotidienne
              </CardTitle>
              <CardDescription>Volume d&apos;événements sur {days} jours</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && !insights ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
              ) : (
                <DailyChart daily={insights?.daily ?? []} />
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MousePointerClick className="h-5 w-5 text-[#b11226]" />
                Tunnel de conversion
              </CardTitle>
              <CardDescription>Du trafic à la réservation confirmée</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <FunnelBar label="Pages vues" value={insights?.funnel.pageViews ?? 0} max={funnelMax} />
              <FunnelBar label="Intérêt voiture / Réserver" value={insights?.funnel.carInterest ?? 0} max={funnelMax} />
              <FunnelBar label="WhatsApp" value={insights?.funnel.whatsapp ?? 0} max={funnelMax} />
              <FunnelBar label="Formulaire ouvert" value={insights?.funnel.formOpen ?? 0} max={funnelMax} />
              <FunnelBar label="Formulaire rempli (partiel)" value={insights?.funnel.formProgress ?? 0} max={funnelMax} />
              <FunnelBar label="Abandons" value={insights?.funnel.abandoned ?? 0} max={funnelMax} />
              <FunnelBar label="Réservations confirmées" value={insights?.funnel.confirmed ?? 0} max={funnelMax} />
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Car className="h-5 w-5 text-[#b11226]" />
                Voitures les plus vues / cliquées
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(insights?.topCars.length ?? 0) === 0 ? (
                <p className="text-sm text-slate-500">Pas encore de données voiture.</p>
              ) : (
                <ul className="space-y-2">
                  {insights!.topCars.map((car) => (
                    <li key={car.name} className="flex items-center justify-between text-sm">
                      <span className="truncate font-medium text-slate-800">{car.name}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold">{car.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="h-5 w-5 text-[#b11226]" />
                Pages les plus actives
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(insights?.topPages.length ?? 0) === 0 ? (
                <p className="text-sm text-slate-500">Pas encore de pages trackées.</p>
              ) : (
                <ul className="space-y-2">
                  {insights!.topPages.map((p) => (
                    <li key={p.path} className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate font-mono text-xs text-slate-700">{p.path}</span>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold">{p.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leads */}
      {(view === 'overview' || view === 'leads' || view === 'reservations') && (
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-[#b11226]" />
              Leads à traiter
            </CardTitle>
            <CardDescription>
              Réservations, abandons et contacts avec nom / email / téléphone — appelez directement depuis ici.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && leads.length === 0 ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
            ) : leads.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Aucun lead avec coordonnées pour cette période. Dès qu&apos;un visiteur remplit le formulaire, il apparaîtra ici.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {leads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Event journal */}
      {(view === 'clicks' || view === 'all' || view === 'reservations') && (
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MousePointerClick className="h-5 w-5 text-[#b11226]" />
                  {view === 'clicks' ? 'Clics importants' : 'Journal des événements'}
                </CardTitle>
                <CardDescription className="mt-1">
                  WhatsApp, téléphone, réserver, formulaires — détail de chaque interaction.
                </CardDescription>
              </div>
              <Select value={eventFilter} onValueChange={(v) => { setEventFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[220px] bg-white">
                  <SelectValue placeholder="Filtrer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {Object.entries(EVENT_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
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
                  placeholder="Voiture, email, téléphone, page…"
                  className="bg-white pl-9"
                />
              </div>
              <Button type="submit" variant="outline" className="bg-white">Rechercher</Button>
            </form>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
            ) : events.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">Aucun événement pour ce filtre.</p>
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
                          </div>
                          <p className="mt-1 truncate text-sm text-slate-600">
                            {event.fullName || event.carName || event.carSlug || event.path}
                            {event.phone ? ` · ${event.phone}` : ''}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">{formatDate(event.createdAt)}</p>
                        </div>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                      </button>
                      {isExpanded && <EventDetail event={event} />}
                    </div>
                  );
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)} className="bg-white">
                  Précédent
                </Button>
                <span className="text-sm text-slate-500">Page {page} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)} className="bg-white">
                  Suivant
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Optional Statsig — collapsed */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-700"
          onClick={() => setShowStatsig((v) => !v)}
        >
          <span className="inline-flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-violet-600" />
            Options Statsig (optionnel — pas nécessaire pour le tracking)
          </span>
          {showStatsig ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showStatsig ? (
          <div className="border-t border-slate-100 p-4">
            <StatsigFeaturePanel />
          </div>
        ) : null}
      </div>
    </div>
  );
}
