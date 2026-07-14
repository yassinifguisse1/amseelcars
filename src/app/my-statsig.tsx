"use client";

import React from "react";

/**
 * Public site: no Statsig session replay / autocapture.
 * Those plugins add heavy main-thread work and tank PageSpeed.
 * Re-enable behind a feature flag on admin only if needed.
 */
export default function MyStatsig({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
