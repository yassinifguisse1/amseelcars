import {
  EUR_TO_MAD_RATE,
  convertCarPrice,
  formatCarPriceLabel,
  type DisplayCurrency,
} from "@/lib/currency";
import { CAR_CANONICAL_SLUGS } from "@/data/carCanonicalSlugs.generated";
import { resolveCanonicalFrenchCarSlug } from "@/lib/carSlugLocale";
import { getCarBySlug } from "@/data/cars";

/**
 * Black Friday / Cyber week promo switch.
 * `enabled` controls campaign design, banners and promo-code messaging.
 * `topBarEnabled` independently controls the announcement bar.
 * Keep the current fleet rates independently with `keepPricesAfterPromo`.
 */
export const BLACK_FRIDAY_PROMO = {
  enabled: false,
  topBarEnabled: true,
  /** Retain these daily rates even when the design is off or the campaign ends. */
  keepPricesAfterPromo: true,
  /** Inclusive end — Morocco local (UTC+1 in Nov). */
  endsAt: "2026-12-01T23:59:59+01:00",
  code: "BLACKFRIDAY",
  /** Display “from” rate during the promo window (already applied). */
  fromPrice: "19,90 €",
  storageDismissKey: "amseel-bf-topbar-dismissed-2026-regular-design",
  /** Default fleet discount when no fixed EUR override (1 = full price). */
  defaultDiscountFactor: 0.9,
  /**
   * Fixed Black Friday daily rates in EUR (already reduced).
   * Logan / Picanto / Sandero stay at 19,90 € — everyone else gets −10%.
   */
  priceEurBySlug: {
    "location-voiture-agadir-dacia-logan": 19.9,
    "location-voiture-agadir-dacia-logan-2026": 19.9,
    "location-voiture-agadir-kia-picanto": 19.9,
    "location-voiture-agadir-kia-picanto-2025": 19.9,
    "location-voiture-agadir-kia-picanto-bleu": 19.9,
    "location-voiture-agadir-kia-picanto-gris": 19.9,
    "location-voiture-agadir-stepway": 19.9,
    "location-voiture-agadir-sandero-stepway": 19.9,
    "location-voiture-agadir-dacia-sandero-gris-manuel": 19.9,
    "location-voiture-agadir-dacia-sandero-blanche-automatique": 22,
  } as Record<string, number>,
} as const;

export function isBlackFridayPromoLive(now = new Date()): boolean {
  if (!BLACK_FRIDAY_PROMO.enabled) return false;
  const end = new Date(BLACK_FRIDAY_PROMO.endsAt);
  if (Number.isNaN(end.getTime())) return false;
  return now.getTime() <= end.getTime();
}

export function isBlackFridayTopBarLive(now = new Date()): boolean {
  if (!BLACK_FRIDAY_PROMO.topBarEnabled) return false;
  const end = new Date(BLACK_FRIDAY_PROMO.endsAt).getTime();
  return Number.isFinite(end) && now.getTime() <= end;
}

/** Current campaign-derived daily rate; retained after the campaign when configured. */
export function getBlackFridayDailyPrice(
  slug: string | undefined | null,
  currency: DisplayCurrency = "EUR",
  now = new Date(),
): number | null {
  if (!slug) return null;
  if (!BLACK_FRIDAY_PROMO.keepPricesAfterPromo && !isBlackFridayPromoLive(now)) {
    return null;
  }
  // Cards pass locale slugs (e.g. EN `agadir-car-rental-…`); prices are keyed by FR.
  const canonical =
    resolveCanonicalFrenchCarSlug(slug, CAR_CANONICAL_SLUGS) ?? slug;

  const fixedEur = BLACK_FRIDAY_PROMO.priceEurBySlug[canonical];
  if (typeof fixedEur === "number" && Number.isFinite(fixedEur)) {
    if (currency === "EUR") return fixedEur;
    return convertCarPrice(fixedEur * EUR_TO_MAD_RATE, currency);
  }

  const car = getCarBySlug(canonical);
  if (!car) return null;
  const mad = car.pricing?.shortTerm ?? car.pricePerDay;
  if (!(mad > 0)) return null;
  return convertCarPrice(mad * BLACK_FRIDAY_PROMO.defaultDiscountFactor, currency);
}

export function formatBlackFridayPriceLabel(
  slug: string | undefined | null,
  currency: DisplayCurrency = "EUR",
): string | null {
  const amount = getBlackFridayDailyPrice(slug, currency);
  if (amount == null) return null;
  // Keep cents for promo rates like 19,90 € (fleet MAD→EUR display usually rounds).
  if (currency === "EUR") {
    const rounded = Math.round(amount * 100) / 100;
    const text =
      Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(".", ",");
    return `€${text}`;
  }
  return formatCarPriceLabel(amount, currency);
}

export type PromoCountdown = {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

export function getPromoCountdown(now = new Date()): PromoCountdown {
  const end = new Date(BLACK_FRIDAY_PROMO.endsAt).getTime();
  const totalMs = Math.max(0, end - now.getTime());
  const expired = totalMs <= 0;
  const days = Math.floor(totalMs / 86_400_000);
  const hours = Math.floor((totalMs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
  const seconds = Math.floor((totalMs % 60_000) / 1_000);
  return { totalMs, days, hours, minutes, seconds, expired };
}
