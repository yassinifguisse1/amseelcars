'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Eye,
  Gift,
  Loader2,
  MousePointerClick,
  RefreshCw,
  Send,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsDateRangePicker } from '@/components/admin/AnalyticsDateRangePicker';
import {
  resolveAnalyticsRange,
  type AnalyticsRange,
} from '@/lib/admin/analyticsRange';

type WheelStatsResponse = {
  range: { from: string; to: string; preset: string; label: string };
  funnel: {
    shown: number;
    spins: number;
    wins: number;
    dismiss: number;
    browseFleet: number;
    bookingSubmitWithCode: number;
    bookingConfirmedWithCode: number;
    whatsappWithCode: number;
  };
  rates: {
    spinRate: number;
    winRate: number;
    browseRate: number;
    bookSubmitRate: number;
    bookConfirmRate: number;
  };
  unique: {
    spinners: number;
    winners: number;
    bookersWithCode: number;
  };
  prizes: Array<{ id: string; count: number }>;
  recentWins: Array<{
    id: string;
    at: string;
    prize: string | null;
    claimCode: string | null;
    visitorId: string | null;
    path: string;
  }>;
  bookingsWithCode: Array<{
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
  }>;
};

const PRIZE_LABELS: Record<string, string> = {
  'full-insurance': 'Assurance',
  'child-seat': 'Siège enfant',
  'extra-child-seat': 'Siège enfant +',
  'additional-driver': '2e conducteur',
  'surfboard-roof-racks': 'Barres toit',
  'rooftop-cargo': 'Coffre toit',
};

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  hint?: string;
  icon: typeof Gift;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <Icon className="h-4 w-4 text-slate-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums text-slate-950">{value}</div>
        {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function WheelStatsDashboard() {
  const [range, setRange] = useState<AnalyticsRange>(() => resolveAnalyticsRange('30d'));
  const [data, setData] = useState<WheelStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        preset: range.preset,
        from: range.from.toISOString(),
        to: range.to.toISOString(),
        label: range.label,
      });
      const res = await fetch(`/api/admin/wheel-stats?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = (await res.json()) as WheelStatsResponse;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    void load();
  }, [load]);

  const funnel = data?.funnel;
  const rates = data?.rates;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Wheel gift stats</h2>
          <p className="text-sm text-slate-500">
            Spins, fleet clicks, and bookings that used a wheel claim code.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AnalyticsDateRangePicker value={range} onChange={setRange} />
          <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading && !data ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading wheel stats…
        </div>
      ) : null}

      {funnel && rates ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Wheel shown"
              value={funnel.shown}
              hint="Popup displayed"
              icon={Eye}
            />
            <StatCard
              title="Spins"
              value={funnel.spins}
              hint={`${rates.spinRate}% of shown · ${data?.unique.spinners ?? 0} visitors`}
              icon={Sparkles}
            />
            <StatCard
              title="Wins"
              value={funnel.wins}
              hint={`${rates.winRate}% of spins · ${data?.unique.winners ?? 0} visitors`}
              icon={Trophy}
            />
            <StatCard
              title="See the fleet"
              value={funnel.browseFleet}
              hint={`${rates.browseRate}% of wins`}
              icon={MousePointerClick}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Dismissed"
              value={funnel.dismiss}
              hint="Closed without spinning"
              icon={Users}
            />
            <StatCard
              title="Booking with code"
              value={funnel.bookingSubmitWithCode}
              hint={`${rates.bookSubmitRate}% of wins (submit click)`}
              icon={Send}
            />
            <StatCard
              title="Booking confirmed + code"
              value={funnel.bookingConfirmedWithCode}
              hint={`${rates.bookConfirmRate}% of wins · ${data?.unique.bookersWithCode ?? 0} visitors`}
              icon={Gift}
            />
            <StatCard
              title="WhatsApp + code"
              value={funnel.whatsappWithCode}
              hint="Booking WhatsApp with claim code"
              icon={Send}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-base">Prizes won</CardTitle>
                <CardDescription>What people landed on after a spin</CardDescription>
              </CardHeader>
              <CardContent>
                {(data?.prizes.length ?? 0) === 0 ? (
                  <p className="text-sm text-slate-500">No wins in this range yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {data!.prizes.map((p) => {
                      const max = data!.prizes[0]?.count ?? 1;
                      const width = Math.max(8, Math.round((p.count / max) * 100));
                      return (
                        <li key={p.id} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-800">
                              {PRIZE_LABELS[p.id] ?? p.id}
                            </span>
                            <span className="tabular-nums text-slate-600">{p.count}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-[#EC1C25]"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-base">Funnel snapshot</CardTitle>
                <CardDescription>{data?.range.label}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                <p>
                  Shown → Spin: <strong className="tabular-nums">{rates.spinRate}%</strong>
                </p>
                <p>
                  Spin → Win: <strong className="tabular-nums">{rates.winRate}%</strong>
                </p>
                <p>
                  Win → See fleet: <strong className="tabular-nums">{rates.browseRate}%</strong>
                </p>
                <p>
                  Win → Booking submit (code):{' '}
                  <strong className="tabular-nums">{rates.bookSubmitRate}%</strong>
                </p>
                <p>
                  Win → Booking confirmed (code):{' '}
                  <strong className="tabular-nums">{rates.bookConfirmRate}%</strong>
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-base">Recent wins</CardTitle>
              <CardDescription>Claim codes from the wheel</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {(data?.recentWins.length ?? 0) === 0 ? (
                <p className="text-sm text-slate-500">No wins yet.</p>
              ) : (
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="py-2 pr-3 font-medium">When</th>
                      <th className="py-2 pr-3 font-medium">Prize</th>
                      <th className="py-2 pr-3 font-medium">Code</th>
                      <th className="py-2 font-medium">Path</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data!.recentWins.map((row) => (
                      <tr key={row.id} className="border-b border-slate-100">
                        <td className="py-2.5 pr-3 tabular-nums text-slate-600">
                          {formatWhen(row.at)}
                        </td>
                        <td className="py-2.5 pr-3 font-medium text-slate-900">
                          {row.prize ? PRIZE_LABELS[row.prize] ?? row.prize : '—'}
                        </td>
                        <td className="py-2.5 pr-3 font-mono text-xs font-semibold text-slate-800">
                          {row.claimCode ?? '—'}
                        </td>
                        <td className="py-2.5 text-slate-500">{row.path}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-base">Bookings / WhatsApp with wheel code</CardTitle>
              <CardDescription>
                Visitors who submitted a booking or WhatsApp message including their claim code
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {(data?.bookingsWithCode.length ?? 0) === 0 ? (
                <p className="text-sm text-slate-500">No coded bookings in this range yet.</p>
              ) : (
                <table className="w-full min-w-[780px] text-left text-sm">
                  <thead className="border-b text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="py-2 pr-3 font-medium">When</th>
                      <th className="py-2 pr-3 font-medium">Event</th>
                      <th className="py-2 pr-3 font-medium">Code</th>
                      <th className="py-2 pr-3 font-medium">Prize</th>
                      <th className="py-2 pr-3 font-medium">Contact</th>
                      <th className="py-2 font-medium">Car</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data!.bookingsWithCode.map((row) => (
                      <tr key={row.id} className="border-b border-slate-100">
                        <td className="py-2.5 pr-3 tabular-nums text-slate-600">
                          {formatWhen(row.at)}
                        </td>
                        <td className="py-2.5 pr-3 text-slate-800">{row.event}</td>
                        <td className="py-2.5 pr-3 font-mono text-xs font-semibold">
                          {row.claimCode}
                        </td>
                        <td className="py-2.5 pr-3">
                          {row.prize ? PRIZE_LABELS[row.prize] ?? row.prize : '—'}
                        </td>
                        <td className="py-2.5 pr-3 text-slate-700">
                          <div>{row.fullName || '—'}</div>
                          <div className="text-xs text-slate-500">{row.email || row.phone || ''}</div>
                        </td>
                        <td className="py-2.5 text-slate-700">{row.carName || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
