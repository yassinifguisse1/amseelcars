/** Shared dimension filters for admin Analytics + Reservations. */

export type AnalyticsDimensionFilters = {
  country?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  car?: string;
  deviceType?: string;
  trafficSource?: string;
};

export type AnalyticsFilterKey = keyof AnalyticsDimensionFilters;

const STORAGE_KEY = 'amseel-admin-analytics-filters';
const RANGE_STORAGE_KEY = 'amseel-admin-analytics-range';

export function parseDimensionFilters(
  searchParams: URLSearchParams | { get(name: string): string | null },
): AnalyticsDimensionFilters {
  const pick = (key: string) => {
    const v = searchParams.get(key)?.trim();
    return v || undefined;
  };
  return {
    country: pick('country')?.toUpperCase(),
    referrer: pick('referrer'),
    utmSource: pick('utmSource'),
    utmMedium: pick('utmMedium'),
    utmCampaign: pick('utmCampaign'),
    car: pick('car'),
    deviceType: pick('deviceType'),
    trafficSource: pick('trafficSource'),
  };
}

export function hasActiveFilters(filters: AnalyticsDimensionFilters): boolean {
  return Object.values(filters).some((v) => typeof v === 'string' && v.length > 0);
}

export function filtersToQuery(filters: AnalyticsDimensionFilters): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(filters) as Array<[AnalyticsFilterKey, string | undefined]>) {
    if (value) out[key] = value;
  }
  return out;
}

/** Prisma-compatible where clauses for Mongo TrackEvent. */
export function dimensionWhereClauses(
  filters: AnalyticsDimensionFilters,
): Array<Record<string, unknown>> {
  const clauses: Array<Record<string, unknown>> = [];

  if (filters.country) {
    if (filters.country === 'ZZ' || filters.country === 'UNKNOWN') {
      clauses.push({
        OR: [{ country: null }, { country: '' }],
      });
    } else {
      clauses.push({ country: filters.country.toUpperCase() });
    }
  }

  if (filters.referrer) {
    if (filters.referrer === 'Direct') {
      clauses.push({
        OR: [{ referrer: null }, { referrer: '' }],
      });
    } else {
      clauses.push({ referrer: { contains: filters.referrer } });
    }
  }

  if (filters.utmSource) {
    clauses.push({ utmSource: filters.utmSource });
  }
  if (filters.utmMedium) {
    clauses.push({ utmMedium: filters.utmMedium });
  }
  if (filters.utmCampaign) {
    clauses.push({ utmCampaign: filters.utmCampaign });
  }

  if (filters.car) {
    clauses.push({
      OR: [
        { carName: { contains: filters.car } },
        { carSlug: { contains: filters.car } },
        { carName: filters.car },
        { carSlug: filters.car },
      ],
    });
  }

  if (filters.deviceType) {
    clauses.push({ deviceType: filters.deviceType });
  }
  if (filters.trafficSource) {
    clauses.push({ trafficSource: filters.trafficSource });
  }

  return clauses;
}

export function mergeWhereWithDimensions(
  base: Record<string, unknown>,
  filters: AnalyticsDimensionFilters,
): Record<string, unknown> {
  const dims = dimensionWhereClauses(filters);
  if (dims.length === 0) return base;
  const existingAnd = Array.isArray(base.AND) ? (base.AND as unknown[]) : [];
  return {
    ...base,
    AND: [...existingAnd, ...dims],
  };
}

export type FilterChip = {
  key: AnalyticsFilterKey;
  value: string;
  label: string;
};

export function filterChips(
  filters: AnalyticsDimensionFilters,
  countryLabelFn: (code: string) => string,
): FilterChip[] {
  const chips: FilterChip[] = [];
  if (filters.country) {
    const code = filters.country;
    chips.push({
      key: 'country',
      value: code,
      label: `Country: ${code === 'ZZ' ? 'Unknown' : countryLabelFn(code)}`,
    });
  }
  if (filters.referrer) {
    chips.push({ key: 'referrer', value: filters.referrer, label: `Referrer: ${filters.referrer}` });
  }
  if (filters.utmSource) {
    chips.push({ key: 'utmSource', value: filters.utmSource, label: `UTM source: ${filters.utmSource}` });
  }
  if (filters.utmMedium) {
    chips.push({ key: 'utmMedium', value: filters.utmMedium, label: `UTM medium: ${filters.utmMedium}` });
  }
  if (filters.utmCampaign) {
    chips.push({
      key: 'utmCampaign',
      value: filters.utmCampaign,
      label: `UTM campaign: ${filters.utmCampaign}`,
    });
  }
  if (filters.car) {
    chips.push({ key: 'car', value: filters.car, label: `Car: ${filters.car}` });
  }
  if (filters.deviceType) {
    chips.push({ key: 'deviceType', value: filters.deviceType, label: `Device: ${filters.deviceType}` });
  }
  if (filters.trafficSource) {
    chips.push({
      key: 'trafficSource',
      value: filters.trafficSource,
      label: `Traffic: ${filters.trafficSource}`,
    });
  }
  return chips;
}

export function loadFiltersFromStorage(): AnalyticsDimensionFilters {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as AnalyticsDimensionFilters;
    return parseDimensionFilters({
      get: (name: string) => {
        const v = parsed[name as AnalyticsFilterKey];
        return typeof v === 'string' ? v : null;
      },
    });
  } catch {
    return {};
  }
}

export function saveFiltersToStorage(filters: AnalyticsDimensionFilters): void {
  if (typeof window === 'undefined') return;
  try {
    if (!hasActiveFilters(filters)) sessionStorage.removeItem(STORAGE_KEY);
    else sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filtersToQuery(filters)));
  } catch {
    /* ignore quota */
  }
}

export function loadRangePresetFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(RANGE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveRangePresetToStorage(preset: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(RANGE_STORAGE_KEY, preset);
  } catch {
    /* ignore */
  }
}

/** Toggle a single dimension: same value clears, different value replaces. */
export function toggleFilter(
  current: AnalyticsDimensionFilters,
  key: AnalyticsFilterKey,
  value: string,
): AnalyticsDimensionFilters {
  const next = { ...current };
  if (next[key] === value) delete next[key];
  else next[key] = value;
  return next;
}

export function clearFilter(
  current: AnalyticsDimensionFilters,
  key: AnalyticsFilterKey,
): AnalyticsDimensionFilters {
  const next = { ...current };
  delete next[key];
  return next;
}
