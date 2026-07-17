'use client';

import { useEffect } from 'react';
import { StatsigClient } from '@statsig/js-client';
import { StatsigAutoCapturePlugin } from '@statsig/web-analytics';
import { StatsigSessionReplayPlugin } from '@statsig/session-replay';
import { getOrCreateVisitorId } from '@/lib/statsig/visitor-id';

/**
 * Public-site Statsig: autocapture + session replay for visitors.
 *
 * Boots as a sibling (returns null) so delayed init never remounts the page tree.
 * Passing children through a late StatsigProvider caused a visible double-load.
 */
export function PublicStatsigProvider({
  children,
  clientKey,
  delayMs = 2500,
}: {
  children: React.ReactNode;
  clientKey: string | null | undefined;
  /** Delay before loading Statsig SDK (ms). Default 2.5s. */
  delayMs?: number;
}) {
  return (
    <>
      {clientKey ? (
        <PublicStatsigBoot clientKey={clientKey} delayMs={delayMs} />
      ) : null}
      {children}
    </>
  );
}

function PublicStatsigBoot({
  clientKey,
  delayMs,
}: {
  clientKey: string;
  delayMs: number;
}) {
  useEffect(() => {
    let cancelled = false;
    let client: StatsigClient | null = null;
    let idleId: number | undefined;

    const start = async () => {
      if (cancelled) return;
      try {
        client = new StatsigClient(
          clientKey,
          {
            userID: getOrCreateVisitorId(),
            custom: { surface: 'public' },
          },
          {
            plugins: [
              new StatsigAutoCapturePlugin(),
              new StatsigSessionReplayPlugin(),
            ],
          },
        );
        await client.initializeAsync();
      } catch (err) {
        console.error('[statsig] public init failed', err);
      }
    };

    const timer = window.setTimeout(() => {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(() => {
          void start();
        }, { timeout: 2000 });
      } else {
        void start();
      }
    }, delayMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (idleId != null && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
      void client?.shutdown();
    };
  }, [clientKey, delayMs]);

  return null;
}
