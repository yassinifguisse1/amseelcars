'use client';

import { useMemo } from 'react';
import type { Statsig } from '@flags-sdk/statsig';
import {
  StatsigProvider,
  useClientBootstrapInit,
} from '@statsig/react-bindings';
import { StatsigAutoCapturePlugin } from '@statsig/web-analytics';
import { StatsigSessionReplayPlugin } from '@statsig/session-replay';
import { getStatsigClientKey } from '@/lib/statsig/config';

type StatsigDatafile = NonNullable<
  Awaited<ReturnType<typeof Statsig.getClientInitializeResponse>>
>;

export function AdminStatsigProvider({
  children,
  datafile,
}: {
  children: React.ReactNode;
  datafile: StatsigDatafile | null;
}) {
  if (!datafile) {
    return <>{children}</>;
  }

  const clientKey = getStatsigClientKey();
  if (!clientKey) {
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

  return (
    <StatsigProvider client={client} user={datafile.user}>
      {children}
    </StatsigProvider>
  );
}
