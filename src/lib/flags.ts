import { statsigAdapter, type StatsigUser } from '@flags-sdk/statsig';
import { flag, dedupe } from 'flags/next';
import type { Identify } from 'flags';
import { identifyAdminUser } from '@/lib/statsig/admin-identify';

export const identify = dedupe((async () => {
  return identifyAdminUser();
}) satisfies Identify<StatsigUser>);

export function createFeatureFlag(key: string) {
  return flag<boolean, StatsigUser>({
    key,
    adapter: statsigAdapter.featureGate((gate) => gate.value, {
      exposureLogging: true,
    }),
    identify,
  });
}

/** Admin panel: show Tracking tab and analytics dashboard */
export const adminTrackingDashboard = createFeatureFlag('admin_tracking_dashboard');

/** Admin panel: email alerts for abandoned bookings */
export const adminAbandonedBookingAlerts = createFeatureFlag('admin_abandoned_booking_alerts');

/** Admin panel: export tracking CSV (future) */
export const adminTrackingExport = createFeatureFlag('admin_tracking_export');

/** Admin: session replay recording (Statsig console) */
export const adminSessionReplay = createFeatureFlag('admin_session_replay');
