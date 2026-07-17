function firstEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

/** Prefers Amseel_* vars from the second Vercel Statsig integration. */
export function getStatsigServerApiKey(): string | undefined {
  return firstEnv('Amseel_STATSIG_SERVER_API_KEY', 'STATSIG_SERVER_API_KEY');
}

/** Client SDK key (server-readable; pass to browser via props). */
export function getStatsigClientKey(): string | undefined {
  return firstEnv(
    'Amseel_STATSIG_CLIENT_KEY',
    'NEXT_PUBLIC_Amseel_STATSIG_CLIENT_KEY',
    'NEXT_PUBLIC_STATSIG_CLIENT_KEY',
    'NEXT_PUBLIC_STATSIG_CLIENT_API_KEY',
    'STATSIG_CLIENT_KEY',
  );
}

export function getStatsigProjectId(): string | undefined {
  return firstEnv('Amseel_STATSIG_PROJECT_ID', 'STATSIG_PROJECT_ID');
}

export function getStatsigEdgeConfigConnection(): string | undefined {
  return firstEnv('Amseel_EXPERIMENTATION_CONFIG', 'EXPERIMENTATION_CONFIG');
}

export function getStatsigEdgeConfigItemKey(): string | undefined {
  return firstEnv(
    'Amseel_EXPERIMENTATION_CONFIG_ITEM_KEY',
    'EXPERIMENTATION_CONFIG_ITEM_KEY',
  );
}

export function getStatsigConsoleApiKey(): string | undefined {
  return firstEnv('Amseel_STATSIG_CONSOLE_API_KEY', 'STATSIG_CONSOLE_API_KEY');
}

/** True when Amseel / default Statsig server + client keys are present. */
export function isStatsigConfigured(): boolean {
  return Boolean(getStatsigServerApiKey() && getStatsigClientKey());
}

export function getStatsigProjectLabel(): string {
  return getStatsigProjectId() || 'Amseel Statsig';
}
