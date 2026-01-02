// "use client";

// import type { Statsig } from "@flags-sdk/statsig";
// import {
//   StatsigProvider,
//   useClientBootstrapInit,
// } from "@statsig/react-bindings";
// import { StatsigAutoCapturePlugin } from '@statsig/web-analytics';
// import { StatsigSessionReplayPlugin } from '@statsig/session-replay';
 
// export function DynamicStatsigProvider({ children, datafile,}: {
//   children: React.ReactNode;
//   datafile: Awaited<ReturnType<typeof Statsig.getClientInitializeResponse>>;
// }) {
//   if (!datafile) throw new Error("Missing datafile");
 
//   const client = useClientBootstrapInit(
//     process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY as string,
//     datafile.user,
//     JSON.stringify(datafile),
//     { plugins: [ new StatsigAutoCapturePlugin(), new StatsigSessionReplayPlugin() ] } //Optional, will add autocaptured web analytics events to Statsig
//   );
 
//   return (
//     <StatsigProvider user={datafile.user} client={client} >
//       {children}
//     </StatsigProvider>
//   );
// }
"use client";

import React from "react";
import { StatsigProvider, useClientAsyncInit } from '@statsig/react-bindings';
import { StatsigAutoCapturePlugin } from '@statsig/web-analytics';
import { StatsigSessionReplayPlugin } from '@statsig/session-replay';

export default function MyStatsig({ children }: { children: React.ReactNode }) {
  const { client } = useClientAsyncInit(
    "client-pa2S2hObSQqmlzU0K4YI5eAFLhzGus46WpiEsL4Yy95",
    { userID: 'a-user' }, 
    { plugins: [ new StatsigAutoCapturePlugin(), new StatsigSessionReplayPlugin() ] },
  );

  return (
    <StatsigProvider client={client} loadingComponent={<div>Loading...</div>}>
      {children}
    </StatsigProvider>
  );
}