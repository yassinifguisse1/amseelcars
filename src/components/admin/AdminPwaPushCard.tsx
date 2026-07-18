'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, BellOff, Download, Loader2, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const ENABLED_KEY = 'amseel_admin_local_notif';
const SINCE_KEY = 'amseel_admin_notif_since';
const SEEN_KEY = 'amseel_admin_notif_seen';
const POLL_MS = 35_000;

type AlertRow = {
  id: string;
  title: string;
  body: string;
  url?: string;
};

async function showLocalNotification(alert: AlertRow) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  const reg = await navigator.serviceWorker.ready;
  await reg.showNotification(alert.title, {
    body: alert.body,
    icon: '/admin/icons/icon-192.png',
    badge: '/admin/icons/icon-192.png',
    tag: `alert-${alert.id}`,
    data: { url: alert.url || '/admin' },
  });
}

function loadSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr.slice(-200) : []);
  } catch {
    return new Set();
  }
}

function saveSeen(seen: Set<string>) {
  localStorage.setItem(SEEN_KEY, JSON.stringify([...seen].slice(-200)));
}

export default function AdminPwaPushCard() {
  const [swReady, setSwReady] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [lastPoll, setLastPoll] = useState<string | null>(null);
  const pollingRef = useRef(false);

  const pollAlerts = useCallback(async () => {
    if (pollingRef.current) return;
    if (localStorage.getItem(ENABLED_KEY) !== '1') return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

    pollingRef.current = true;
    try {
      const since =
        localStorage.getItem(SINCE_KEY) || new Date(Date.now() - 60_000).toISOString();
      const res = await fetch(`/api/admin/alerts/recent?since=${encodeURIComponent(since)}`);
      if (!res.ok) return;
      const data = await res.json();
      const alerts = (data.alerts ?? []) as AlertRow[];
      const seen = loadSeen();
      for (const alert of alerts) {
        if (seen.has(alert.id)) continue;
        seen.add(alert.id);
        await showLocalNotification(alert);
      }
      saveSeen(seen);
      if (data.now) {
        localStorage.setItem(SINCE_KEY, data.now);
        setLastPoll(data.now);
      }
    } catch (err) {
      console.error('[admin-notif] poll failed', err);
    } finally {
      pollingRef.current = false;
    }
  }, []);

  useEffect(() => {
    setStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
        Boolean((navigator as Navigator & { standalone?: boolean }).standalone),
    );
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission);
    }
    setEnabled(localStorage.getItem(ENABLED_KEY) === '1');

    const onBip = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBip);

    let cancelled = false;
    (async () => {
      if (!('serviceWorker' in navigator)) return;
      try {
        await navigator.serviceWorker.register('/admin/sw.js', { scope: '/admin/' });
        await navigator.serviceWorker.ready;
        if (!cancelled) setSwReady(true);
      } catch (err) {
        console.error('[admin-pwa] SW register failed', err);
      }
    })();

    return () => {
      cancelled = true;
      window.removeEventListener('beforeinstallprompt', onBip);
    };
  }, []);

  useEffect(() => {
    if (!enabled || !swReady) return;

    void pollAlerts();
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') void pollAlerts();
    }, POLL_MS);

    const onVisible = () => {
      if (document.visibilityState === 'visible') void pollAlerts();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [enabled, swReady, pollAlerts]);

  const enableNotifs = useCallback(async () => {
    setBusy(true);
    setMessage(null);
    try {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        setMessage('Notifications non supportées sur cet appareil.');
        return;
      }
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        setMessage('Permission refusée. Activez les notifications dans Réglages.');
        return;
      }
      localStorage.setItem(ENABLED_KEY, '1');
      localStorage.setItem(SINCE_KEY, new Date().toISOString());
      setEnabled(true);
      setMessage(
        'Notifications activées (admin uniquement). Elles arrivent tant que l’app admin est ouverte.',
      );
      await pollAlerts();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erreur activation');
    } finally {
      setBusy(false);
    }
  }, [pollAlerts]);

  const disableNotifs = useCallback(() => {
    localStorage.removeItem(ENABLED_KEY);
    setEnabled(false);
    setMessage('Notifications désactivées.');
  }, []);

  const sendTest = useCallback(async () => {
    setBusy(true);
    setMessage(null);
    try {
      await showLocalNotification({
        id: `test-${Date.now()}`,
        title: 'Amseel Admin',
        body: 'Test notification — ça marche (sans VAPID).',
        url: '/admin',
      });
      setMessage('Notification de test affichée.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erreur test');
    } finally {
      setBusy(false);
    }
  }, []);

  const installApp = useCallback(async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }, [installEvent]);

  return (
    <Card className="border-zinc-800 bg-zinc-950 text-zinc-100 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-zinc-50">
          <Smartphone className="h-5 w-5 text-zinc-300" />
          App admin & notifications
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Installez le panneau admin sur votre téléphone. Alertes locales sans VAPID —
          uniquement dans /admin (pas sur le site public).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 text-sm sm:grid-cols-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
            <p className="text-xs text-zinc-500">PWA</p>
            <p className="font-semibold">{standalone ? 'Installée' : 'Navigateur'}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
            <p className="text-xs text-zinc-500">Service worker</p>
            <p className="font-semibold">{swReady ? 'Actif (/admin)' : '…'}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
            <p className="text-xs text-zinc-500">Alertes</p>
            <p className="font-semibold">{enabled ? 'Activées' : permission}</p>
          </div>
        </div>

        <ol className="list-decimal space-y-1.5 pl-5 text-sm text-zinc-300">
          <li>
            Ouvrez <strong className="text-white">/admin</strong> dans Safari (iPhone) ou Chrome
            (Android).
          </li>
          <li>
            iPhone: Partager → <strong className="text-white">Sur l&apos;écran d&apos;accueil</strong>.
            Android: menu → <strong className="text-white">Installer l&apos;application</strong>.
          </li>
          <li>Dans l&apos;app admin, activez les notifications ci-dessous.</li>
        </ol>

        <p className="rounded-lg border border-amber-900/50 bg-amber-950/40 px-3 py-2 text-xs text-amber-100/90">
          Sans VAPID, les alertes fonctionnent quand l&apos;app admin est ouverte (ou au premier
          plan). WhatsApp, réservations, contacts, abandons… sont vérifiés ~toutes les 35s.
        </p>

        <div className="flex flex-wrap gap-2">
          {installEvent ? (
            <Button
              type="button"
              onClick={installApp}
              className="bg-white text-zinc-950 hover:bg-zinc-200"
              disabled={busy}
            >
              <Download className="h-4 w-4" />
              Installer l&apos;app
            </Button>
          ) : null}

          {!enabled ? (
            <Button
              type="button"
              onClick={enableNotifs}
              disabled={busy || !swReady}
              className="bg-[#b11226] text-white hover:bg-[#941020]"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
              Activer les notifications
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={sendTest}
                disabled={busy}
                className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
                Envoyer un test
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={disableNotifs}
                disabled={busy}
                className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
              >
                <BellOff className="h-4 w-4" />
                Désactiver
              </Button>
            </>
          )}
        </div>

        {lastPoll && enabled ? (
          <p className="text-xs text-zinc-500">
            Dernière vérif. : {new Date(lastPoll).toLocaleTimeString('fr-FR')}
          </p>
        ) : null}

        {message ? (
          <p className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300">
            {message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
