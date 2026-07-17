'use client';

import { useMemo } from 'react';
import type { Statsig } from '@flags-sdk/statsig';
import {
  StatsigProvider,
  useClientBootstrapInit,
} from '@statsig/react-bindings';
import { StatsigAutoCapturePlugin } from '@statsig/web-analytics';
import { StatsigSessionReplayPlugin } from '@statsig/session-replay';

type StatsigDatafile = NonNullable<
  Awaited<ReturnType<typeof Statsig.getClientInitializeResponse>>
>;

export function AdminStatsigProvider({
  children,
  datafile,
  clientKey,
}: {
  children: React.ReactNode;
  datafile: StatsigDatafile | null;
  /** Passed from server — Amseel_STATSIG_CLIENT_KEY is not NEXT_PUBLIC_ */
  clientKey?: string | null;
}) {
  if (!datafile || !clientKey) {
    return <>{children}</>;
  }

  return (
    <AdminStatsigInner clientKey={clientKey} datafile={datafile}>
      {children}
    </AdminStatsigInner>
  );
}

function AdminStatsigInner({
  children,
  clientKey,
  datafile,
}: {
  children: React.ReactNode;
  clientKey: string;
  datafile: StatsigDatafile;
}) {
  const datafileString = useMemo(() => JSON.stringify(datafile), [datafile]);

  const plugins = useMemo(
    () => [new StatsigAutoCapturePlugin(), new StatsigSessionReplayPlugin()],
    [],
  );

  const client = useClientBootstrapInit(
    clientKey,
    datafile.user,
    datafileString,
    { plugins },
  );

  // User is already bound via useClientBootstrapInit — client prop only.
  return <StatsigProvider client={client}>{children}</StatsigProvider>;
}
