import { createFlagsDiscoveryEndpoint, getProviderData } from 'flags/next';
import { getProviderData as getStatsigProviderData } from '@flags-sdk/statsig';
import { mergeProviderData } from 'flags';
import {
  adminTrackingDashboard,
  adminAbandonedBookingAlerts,
  adminTrackingExport,
  adminSessionReplay,
} from '@/lib/flags';

const adminFlags = {
  adminTrackingDashboard,
  adminAbandonedBookingAlerts,
  adminTrackingExport,
  adminSessionReplay,
};

export const GET = createFlagsDiscoveryEndpoint(async () => {
  const providers = [getProviderData(adminFlags)];

  const consoleKey = process.env.STATSIG_CONSOLE_API_KEY?.trim();
  const projectId = process.env.STATSIG_PROJECT_ID?.trim();
  if (consoleKey && projectId) {
    providers.push(
      await getStatsigProviderData({
        consoleApiKey: consoleKey,
        projectId,
      }),
    );
  }

  return mergeProviderData(providers);
});
