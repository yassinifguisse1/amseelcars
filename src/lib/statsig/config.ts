/** True when Vercel Statsig integration env vars are present. */
export function isStatsigConfigured(): boolean {
  return Boolean(
    process.env.STATSIG_SERVER_API_KEY?.trim() &&
      getStatsigClientKey()?.trim(),
  );
}

/** Client SDK key from Vercel Statsig marketplace integration. */
export function getStatsigClientKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY?.trim() ||
    process.env.NEXT_PUBLIC_STATSIG_CLIENT_API_KEY?.trim() ||
    process.env.STATSIG_CLIENT_KEY?.trim()
  );
}

export function getStatsigProjectId(): string | undefined {
  return process.env.STATSIG_PROJECT_ID?.trim();
}

export function getStatsigProjectLabel(): string {
  return process.env.STATSIG_PROJECT_ID?.trim() || 'Statsig';
}
