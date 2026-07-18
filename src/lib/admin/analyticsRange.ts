export type AnalyticsPreset = '24h' | '7d' | '30d' | '90d' | '365d' | 'custom';

export type AnalyticsGranularity = 'hour' | 'day';

export type AnalyticsRange = {
  from: Date;
  to: Date;
  preset: AnalyticsPreset;
  label: string;
  granularity: AnalyticsGranularity;
};

export const ANALYTICS_PRESETS: Array<{
  value: Exclude<AnalyticsPreset, 'custom'>;
  label: string;
}> = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 3 Months' },
  { value: '365d', label: 'Last 12 Months' },
];

function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function resolveAnalyticsRange(
  preset: AnalyticsPreset,
  customFrom?: Date | null,
  customTo?: Date | null,
): AnalyticsRange {
  const to = new Date();

  if (preset === 'custom' && customFrom && customTo) {
    const from = startOfLocalDay(customFrom);
    const end = endOfLocalDay(customTo);
    const spanMs = Math.max(0, end.getTime() - from.getTime());
    const spanHours = spanMs / (1000 * 60 * 60);
    return {
      from,
      to: end,
      preset: 'custom',
      label: formatCustomLabel(from, end),
      granularity: spanHours <= 36 ? 'hour' : 'day',
    };
  }

  const normalized: Exclude<AnalyticsPreset, 'custom'> =
    preset === 'custom' ? '30d' : preset;

  if (normalized === '24h') {
    const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
    return {
      from,
      to,
      preset: '24h',
      label: 'Last 24 Hours',
      granularity: 'hour',
    };
  }

  const days =
    normalized === '7d' ? 7 : normalized === '30d' ? 30 : normalized === '90d' ? 90 : 365;
  const from = startOfLocalDay(new Date(to.getTime() - (days - 1) * 24 * 60 * 60 * 1000));
  const label =
    ANALYTICS_PRESETS.find((p) => p.value === normalized)?.label ?? `Last ${days} Days`;

  return {
    from,
    to,
    preset: normalized,
    label,
    granularity: 'day',
  };
}

function formatCustomLabel(from: Date, to: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  return `${fmt(from)} – ${fmt(to)}`;
}

export function hourKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  return `${y}-${m}-${day}T${h}`;
}

export function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function buildTimeBuckets(
  from: Date,
  to: Date,
  granularity: AnalyticsGranularity,
): string[] {
  const keys: string[] = [];
  if (granularity === 'hour') {
    const cursor = new Date(from);
    cursor.setMinutes(0, 0, 0);
    while (cursor <= to) {
      keys.push(hourKey(cursor));
      cursor.setHours(cursor.getHours() + 1);
    }
    return keys;
  }

  const cursor = startOfLocalDay(from);
  const end = startOfLocalDay(to);
  while (cursor <= end) {
    keys.push(dayKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

export function referrerHost(referrer: string | null | undefined): string {
  if (!referrer?.trim()) return 'Direct';
  try {
    const url = new URL(referrer);
    return url.hostname.replace(/^www\./, '') || 'Direct';
  } catch {
    return 'Direct';
  }
}
