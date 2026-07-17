import { createStatsigAdapter } from '@flags-sdk/statsig';
import {
  getStatsigEdgeConfigConnection,
  getStatsigEdgeConfigItemKey,
  getStatsigProjectId,
  getStatsigServerApiKey,
} from './config';

type StatsigAdapter = ReturnType<typeof createStatsigAdapter>;

let cached: StatsigAdapter | null = null;

/**
 * Statsig adapter for AmseelCars.
 * Prefers Amseel_* env vars from the Vercel marketplace integration
 * (statsig-byzantine-prism) so it does not collide with another Statsig project.
 */
export function getAmseelStatsigAdapter(): StatsigAdapter {
  if (cached) return cached;

  const serverKey = getStatsigServerApiKey();
  if (!serverKey) {
    throw new Error(
      'Missing Amseel_STATSIG_SERVER_API_KEY (or STATSIG_SERVER_API_KEY)',
    );
  }

  const connectionString = getStatsigEdgeConfigConnection();
  const itemKey = getStatsigEdgeConfigItemKey();

  cached = createStatsigAdapter({
    statsigServerApiKey: serverKey,
    statsigProjectId: getStatsigProjectId(),
    ...(connectionString && itemKey
      ? { edgeConfig: { connectionString, itemKey } }
      : {}),
  });

  return cached;
}

/** Lazy proxy so flags can import without requiring env at module load. */
export const amseelStatsigAdapter = new Proxy({} as StatsigAdapter, {
  get(_target, prop: keyof StatsigAdapter) {
    const adapter = getAmseelStatsigAdapter();
    const value = adapter[prop];
    return typeof value === 'function' ? value.bind(adapter) : value;
  },
}) as StatsigAdapter;
