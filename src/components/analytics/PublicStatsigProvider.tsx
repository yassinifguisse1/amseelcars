'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  StatsigProvider,
  useClientAsyncInit,
} from '@statsig/react-bindings';
import { StatsigAutoCapturePlugin } from '@statsig/web-analytics';
import { StatsigSessionReplayPlugin } from '@statsig/session-replay';
import { getOrCreateVisitorId } from '@/lib/statsig/visitor-id';

/**
 * Public-site Statsig: autocapture + session replay for visitors.
 * Starts after a short delay to reduce impact on LCP / PageSpeed.
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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!clientKey) return;
    let idleId: number | undefined;
    const timer = window.setTimeout(() => {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(() => setReady(true), { timeout: 2000 });
      } else {
        setReady(true);
      }
    }, delayMs);
    return () => {
      window.clearTimeout(timer);
      if (idleId != null && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, [clientKey, delayMs]);

  if (!clientKey || !ready) {
    return <>{children}</>;
  }

  return <PublicStatsigInner clientKey={clientKey}>{children}</PublicStatsigInner>;
}

function PublicStatsigInner({
  children,
  clientKey,
}: {
  children: React.ReactNode;
  clientKey: string;
}) {
  const user = useMemo(
    () => ({
      userID: getOrCreateVisitorId(),
      custom: { surface: 'public' },
    }),
    [],
  );

  const plugins = useMemo(
    () => [new StatsigAutoCapturePlugin(), new StatsigSessionReplayPlugin()],
    [],
  );

  const { client } = useClientAsyncInit(clientKey, user, { plugins });

  if (!client) {
    return <>{children}</>;
  }

  return (
    <StatsigProvider client={client} user={user}>
      {children}
    </StatsigProvider>
  );
}
