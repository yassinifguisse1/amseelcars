'use client';

import { getOrCreateVisitorId as getVisitorId } from '@/lib/visitorContext';

/**
 * Stable anonymous visitor id for Statsig (session stitching across pages).
 * Shared with MongoDB track events via `visitorContext`.
 */
export function getOrCreateVisitorId(): string {
  return getVisitorId();
}
