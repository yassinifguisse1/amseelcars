'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, MonitorPlay, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Session Replay videos are hosted by Statsig — open console to watch.
 * Public visitors are recorded again via PublicStatsigProvider.
 */
export default function SessionReplayCard() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [configured, setConfigured] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/statsig/status')
      .then((r) => r.json())
      .then((data) => {
        setConfigured(Boolean(data.configured));
        setBootstrapped(Boolean(data.bootstrapped));
        setProjectId(typeof data.projectId === 'string' ? data.projectId : null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const consoleUrl = projectId
    ? `https://console.statsig.com/${projectId}`
    : 'https://console.statsig.com';

  return (
    <Card className="border-violet-200 bg-gradient-to-br from-violet-50/90 to-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MonitorPlay className="h-5 w-5 text-violet-700" />
          Session Replay (visiteurs)
        </CardTitle>
        <CardDescription>
          Statsig enregistre à nouveau les visiteurs du site public (+ admin).
          Les vidéos se regardent dans la console Statsig (~1h de délai).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <p className="text-xs text-slate-500">Statsig</p>
              <p className="font-semibold">{configured ? 'Connecté' : 'Non configuré'}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <p className="text-xs text-slate-500">Admin SDK</p>
              <p className="font-semibold">{bootstrapped ? 'Actif' : 'Inactif'}</p>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-950">
          <p className="font-medium">Enregistrement visiteurs : réactivé</p>
          <p className="mt-1 text-green-900/90">
            Le SDK Statsig (session replay + autocapture) charge ~2,5s après l&apos;ouverture
            d&apos;une page publique pour limiter l&apos;impact PageSpeed.
          </p>
        </div>

        <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-700">
          <li>Ouvrez Statsig.</li>
          <li>
            Menu → <strong>Users</strong> → <strong>Session Replays</strong>.
          </li>
          <li>Filtrez par date pour voir les sessions visiteurs.</li>
        </ol>

        <Button asChild className="bg-violet-700 text-white hover:bg-violet-800">
          <a href={consoleUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            Ouvrir Session Replays dans Statsig
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
