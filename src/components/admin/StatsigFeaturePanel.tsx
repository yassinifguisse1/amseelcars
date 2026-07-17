'use client';

import { useEffect, useState } from 'react';
import { useFeatureGate, useStatsigClient } from '@statsig/react-bindings';
import { ExternalLink, FlaskConical, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ADMIN_GATES = [
  {
    key: 'admin_tracking_dashboard',
    label: 'Tracking dashboard',
    description: 'Show the site analytics / tracking tab in admin.',
  },
  {
    key: 'admin_abandoned_booking_alerts',
    label: 'Abandoned booking emails',
    description: 'Send email when a reservation form is abandoned with contact info.',
  },
  {
    key: 'admin_tracking_export',
    label: 'Tracking export',
    description: 'Allow CSV export of tracking events (when implemented).',
  },
  {
    key: 'admin_session_replay',
    label: 'Session replay',
    description: 'Record admin sessions in Statsig for debugging.',
  },
] as const;

function GateRow({
  gateKey,
  label,
  description,
}: {
  gateKey: string;
  label: string;
  description: string;
}) {
  const { value } = useFeatureGate(gateKey);

  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
      <div>
        <p className="font-medium text-slate-900">{label}</p>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        <p className="mt-1 font-mono text-xs text-slate-400">{gateKey}</p>
      </div>
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
          value ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600'
        }`}
      >
        {value ? 'ON' : 'OFF'}
      </span>
    </div>
  );
}

type StatsigStatus = {
  configured: boolean;
  bootstrapped: boolean;
  projectId?: string;
  clientKeyPresent: boolean;
  serverKeyPresent: boolean;
};

export default function StatsigFeaturePanel() {
  const client = useStatsigClient();
  const [status, setStatus] = useState<StatsigStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/statsig/status')
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch(() => setStatus(null))
      .finally(() => setStatusLoading(false));
  }, []);

  const consoleUrl =
    status?.projectId != null
      ? `https://console.statsig.com/${status.projectId}`
      : 'https://console.statsig.com';

  return (
    <Card className="border-violet-200 bg-gradient-to-br from-violet-50/80 to-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FlaskConical className="h-5 w-5 text-violet-600" />
          Statsig feature flags
        </CardTitle>
        <CardDescription>
          Admin-only Statsig (session replay + analytics). Public site stays without Statsig for PageSpeed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {statusLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking Statsig connection…
          </div>
        ) : status ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <p className="text-xs text-slate-500">Integration</p>
              <p className="font-semibold text-slate-900">
                {status.configured ? 'Connected' : 'Not configured'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <p className="text-xs text-slate-500">Bootstrap</p>
              <p className="font-semibold text-slate-900">
                {status.bootstrapped ? 'Active on admin' : 'Inactive'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <p className="text-xs text-slate-500">Project ID</p>
              <p className="truncate font-mono text-xs font-semibold text-slate-900">
                {status.projectId || '—'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <p className="text-xs text-slate-500">Client SDK</p>
              <p className="font-semibold text-slate-900">
                {client ? 'Ready' : 'Waiting'}
              </p>
            </div>
          </div>
        ) : null}

        {!statusLoading && status && !status.configured && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <p className="font-medium">Connect Statsig on Vercel</p>
            <p className="mt-1 text-amber-900/90">
              Connect <strong>statsig-byzantine-prism</strong> on Vercel, then redeploy.
              Expected env vars: <code className="text-xs">Amseel_STATSIG_SERVER_API_KEY</code>,{' '}
              <code className="text-xs">Amseel_STATSIG_CLIENT_KEY</code>,{' '}
              <code className="text-xs">Amseel_EXPERIMENTATION_CONFIG_ITEM_KEY</code>
              (plus Edge Config connection string if provided).
            </p>
          </div>
        )}

        {client ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Feature gates (create these in Statsig console)
            </p>
            {ADMIN_GATES.map((gate) => (
              <GateRow
                key={gate.key}
                gateKey={gate.key}
                label={gate.label}
                description={gate.description}
              />
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-1">
          <Button variant="outline" size="sm" className="bg-white" asChild>
            <a href={consoleUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Open Statsig console
            </a>
          </Button>
          {client ? (
            <Button
              variant="outline"
              size="sm"
              className="bg-white"
              onClick={() => client.logEvent('admin_panel_viewed', undefined, { surface: 'tracking' })}
            >
              Log test event
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
