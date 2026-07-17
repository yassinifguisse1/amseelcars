'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, MonitorPlay, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Session Replay videos are hosted by Statsig — there is no public embed/player API.
 * This card links to the Statsig console and explains what is recorded.
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
          Session Replay
        </CardTitle>
        <CardDescription>
          Les replays vidéo sont dans Statsig (pas d&apos;intégration player dans l&apos;admin).
          Délai de traitement ~1 heure après la session.
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
              <p className="text-xs text-slate-500">SDK admin</p>
              <p className="font-semibold">{bootstrapped ? 'Actif (enregistre /admin)' : 'Inactif'}</p>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">Ce qui est enregistré aujourd&apos;hui</p>
          <p className="mt-1 text-amber-900/90">
            Uniquement vos sessions sur <strong>/admin</strong> (gate <code className="text-xs">admin_session_replay</code>).
            Les visiteurs du site public ne sont <strong>pas</strong> enregistrés (PageSpeed).
            Pour les clients qui abandonnent une réservation, utilisez l&apos;onglet{' '}
            <strong>Leads &amp; réservations</strong> (champs, téléphone, email).
          </p>
        </div>

        <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-700">
          <li>Ouvrez Statsig avec le bouton ci-dessous.</li>
          <li>
            Menu gauche → <strong>Users</strong> → <strong>Session Replays</strong>
            {' '}(parfois sous Analytics).
          </li>
          <li>Choisissez une session et lancez la lecture.</li>
          <li>Si rien n&apos;apparaît : naviguez un peu dans l&apos;admin, attendez ~1h, puis rafraîchissez.</li>
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
