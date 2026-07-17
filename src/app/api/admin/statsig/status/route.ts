import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import {
  getStatsigClientKey,
  getStatsigEdgeConfigConnection,
  getStatsigEdgeConfigItemKey,
  getStatsigProjectId,
  getStatsigServerApiKey,
  isStatsigConfigured,
} from '@/lib/statsig/config';
import { getAdminStatsigBootstrap } from '@/lib/statsig/bootstrap';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const configured = isStatsigConfigured();
  let bootstrapped = false;
  if (configured) {
    const datafile = await getAdminStatsigBootstrap();
    bootstrapped = datafile != null;
  }

  return NextResponse.json({
    configured,
    bootstrapped,
    projectId: getStatsigProjectId(),
    clientKeyPresent: Boolean(getStatsigClientKey()),
    serverKeyPresent: Boolean(getStatsigServerApiKey()),
    edgeConfigPresent: Boolean(
      getStatsigEdgeConfigConnection() && getStatsigEdgeConfigItemKey(),
    ),
  });
}
