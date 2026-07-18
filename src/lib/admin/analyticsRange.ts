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

/** Exact bounds from the client (preserves 24h hourly windows). */
export function rangeFromBounds(
  preset: AnalyticsPreset,
  from: Date,
  to: Date,
  label?: string,
): AnalyticsRange {
  const spanHours = Math.max(0, (to.getTime() - from.getTime()) / (1000 * 60 * 60));
  const granularity: AnalyticsGranularity =
    preset === '24h' || spanHours <= 36 ? 'hour' : 'day';
  const presetLabel =
    preset === 'custom'
      ? formatCustomLabel(from, to)
      : ANALYTICS_PRESETS.find((p) => p.value === preset)?.label ?? label ?? 'Custom';

  return {
    from,
    to,
    preset,
    label: label || presetLabel,
    granularity,
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

type ZoneParts = { year: string; month: string; day: string; hour: string };

function zonedParts(date: Date, timeZone: string): ZoneParts {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  });
  const map: Record<string, string> = {};
  for (const part of fmt.formatToParts(date)) {
    if (part.type !== 'literal') map[part.type] = part.value;
  }
  return {
    year: map.year,
    month: map.month,
    day: map.day,
    hour: map.hour.padStart(2, '0'),
  };
}

export function hourKeyInZone(d: Date, timeZone: string): string {
  const p = zonedParts(d, timeZone);
  return `${p.year}-${p.month}-${p.day}T${p.hour}`;
}

export function dayKeyInZone(d: Date, timeZone: string): string {
  const p = zonedParts(d, timeZone);
  return `${p.year}-${p.month}-${p.day}`;
}

/** @deprecated Prefer hourKeyInZone — kept for callers that already pass local Dates */
export function hourKey(d: Date): string {
  return hourKeyInZone(d, Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
}

export function dayKey(d: Date): string {
  return dayKeyInZone(d, Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
}

export function buildTimeBuckets(
  from: Date,
  to: Date,
  granularity: AnalyticsGranularity,
  timeZone = 'UTC',
): string[] {
  if (granularity === 'hour') {
    const keys: string[] = [];
    let t = new Date(Math.floor(from.getTime() / 3_600_000) * 3_600_000);
    const end = to.getTime();
    const seen = new Set<string>();
    while (t.getTime() <= end) {
      const key = hourKeyInZone(t, timeZone);
      if (!seen.has(key)) {
        seen.add(key);
        keys.push(key);
      }
      t = new Date(t.getTime() + 3_600_000);
    }
    return keys;
  }

  // Daily: walk hour-by-hour so each local calendar day is collected once
  const keys: string[] = [];
  const seen = new Set<string>();
  let t = new Date(Math.floor(from.getTime() / 3_600_000) * 3_600_000);
  const end = to.getTime();
  while (t.getTime() <= end) {
    const key = dayKeyInZone(t, timeZone);
    if (!seen.has(key)) {
      seen.add(key);
      keys.push(key);
    }
    t = new Date(t.getTime() + 3_600_000);
    if (keys.length > 400) break;
  }
  return keys;
}

export function formatSeriesTick(key: string, granularity: AnalyticsGranularity): string {
  if (granularity === 'hour') {
    const [datePart, hourPart = '0'] = key.split('T');
    const hour = Number.parseInt(hourPart, 10) || 0;
    const [, month, day] = datePart.split('-').map(Number);
    if (hour === 0) {
      const monthName = new Date(2000, (month || 1) - 1, 1).toLocaleString('en-US', {
        month: 'short',
      });
      return `${monthName} ${day}`;
    }
    const suffix = hour >= 12 ? 'pm' : 'am';
    const h12 = hour % 12 || 12;
    return `${h12}${suffix}`;
  }

  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
