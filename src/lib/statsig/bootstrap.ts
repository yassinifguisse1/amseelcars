import { amseelStatsigAdapter } from './adapter';
import { identifyAdminUser } from './admin-identify';
import { isStatsigConfigured } from './config';

export async function getAdminStatsigBootstrap() {
  if (!isStatsigConfigured()) return null;

  try {
    const user = await identifyAdminUser();
    const Statsig = await amseelStatsigAdapter.initialize();
    const datafile = await Statsig.getClientInitializeResponse(user, {
      hash: 'djb2',
    });
    return datafile ?? null;
  } catch (error) {
    console.error('[statsig] Admin bootstrap failed:', error);
    return null;
  }
}
