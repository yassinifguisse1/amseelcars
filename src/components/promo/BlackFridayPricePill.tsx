"use client";

import {
  formatBlackFridayPriceLabel,
} from "@/lib/blackFridayPromo";
import type { DisplayCurrency } from "@/lib/currency";
import styles from "./black-friday.module.css";

type Props = {
  slug?: string | null;
  currency?: DisplayCurrency;
  className?: string;
};

/** Small promo price pill shown left of the regular car price during BF. */
export function BlackFridayPricePill({
  slug,
  currency = "EUR",
  className,
}: Props) {
  const label = formatBlackFridayPriceLabel(slug, currency);
  if (!label) return null;

  return (
    <span
      className={[styles.pricePill, className].filter(Boolean).join(" ")}
      title={`Black Friday ${label}/day`}
    >
      {label}
    </span>
  );
}
