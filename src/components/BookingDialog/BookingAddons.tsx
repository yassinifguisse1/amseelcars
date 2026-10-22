"use client";

import { useState, type ComponentType } from "react";
import {
  Baby,
  CircleHelp,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  Users,
  Waves,
  X,
  type LucideProps,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  BOOKING_ADDON_MESSAGE_KEYS,
  BOOKING_ADDONS,
  type BookingAddonId,
  type BookingAddonSelection,
  addonUnitPrice,
} from "@/lib/bookingAddons";
import { formatCarPriceLabel, type DisplayCurrency } from "@/lib/currency";

const ADDON_ICONS: Record<BookingAddonId, ComponentType<LucideProps>> = {
  "full-insurance": ShieldCheck,
  "extra-child-seat": Baby,
  "additional-driver": Users,
  "surfboard-roof-racks": Waves,
  "child-seat": Baby,
  "rooftop-cargo": Package,
};

type BookingAddonsProps = {
  selection: BookingAddonSelection;
  onChange: (next: BookingAddonSelection) => void;
  currency: DisplayCurrency;
  /** Wheel-of-chance prize: shown as free and excluded from totals. */
  freeAddonId?: BookingAddonId | null;
};

export function BookingAddons({
  selection,
  onChange,
  currency,
  freeAddonId = null,
}: BookingAddonsProps) {
  const t = useTranslations("booking.addons");
  const [expanded, setExpanded] = useState<BookingAddonId | null>(null);

  const setQty = (id: BookingAddonId, qty: number, max: number) => {
    const nextQty = Math.max(0, Math.min(max, qty));
    onChange({ ...selection, [id]: nextQty });
  };

  const expandedKey = expanded ? BOOKING_ADDON_MESSAGE_KEYS[expanded] : null;
  const ExpandedIcon = expanded ? ADDON_ICONS[expanded] : null;

  return (
    <div className="space-y-2.5 pt-2">
      <h4 className="text-sm font-semibold text-gray-900 sm:text-base">{t("title")}</h4>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {BOOKING_ADDONS.map((addon) => {
          const msgKey = BOOKING_ADDON_MESSAGE_KEYS[addon.id];
          const qty = selection[addon.id] ?? 0;
          const unitPrice = addonUnitPrice(addon.priceEur, currency);
          const priceLabel = formatCarPriceLabel(unitPrice, currency);
          const isOpen = expanded === addon.id;
          const selected = qty > 0;
          const isWheelGift = freeAddonId === addon.id;
          const priceText =
            addon.priceEur === 0
              ? t("priceFree")
              : addon.billing === "perDay"
                ? t("pricePerDay", { price: priceLabel })
                : t("pricePerItem", { price: priceLabel });
          const title = t(`items.${msgKey}.title`);
          const Icon = ADDON_ICONS[addon.id];

          return (
            <li
              key={addon.id}
              className={`flex flex-col rounded-xl border bg-white p-2.5 transition-colors ${
                selected
                  ? isWheelGift
                    ? "border-[#c9a227]/70 ring-1 ring-[#c9a227]/35"
                    : "border-[#EC1C25]/55 ring-1 ring-[#EC1C25]/20"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between gap-1.5">
                <div className="flex min-w-0 items-start gap-2">
                  <span
                    className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      selected
                        ? "bg-[#EC1C25]/10 text-[#EC1C25]"
                        : "bg-gray-100 text-gray-700"
                    }`}
                    aria-hidden
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <p className="min-w-0 pt-0.5 text-[0.8rem] font-semibold leading-snug text-gray-900 sm:text-sm">
                    {title}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : addon.id)}
                  className={`-mr-0.5 -mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    isOpen ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                  aria-label={t("moreInfoAria", { name: title })}
                  aria-expanded={isOpen}
                >
                  <CircleHelp className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>

              <p className="mt-1 text-[0.65rem] leading-tight text-gray-600 sm:text-xs">
                {priceText}
                <span className="ml-1 hidden text-emerald-700 min-[380px]:inline sm:inline">
                  {t("max", { max: addon.max })}
                </span>
              </p>
              {isWheelGift && addon.priceEur > 0 ? (
                <p className="mt-0.5 text-[0.65rem] font-semibold leading-tight text-[#8a6a14] sm:text-xs">
                  {t("priceWheelGift")}
                </p>
              ) : null}

              <div className="mt-2 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50">
                <button
                  type="button"
                  aria-label={t("decreaseAria", { name: title })}
                  disabled={qty <= 0}
                  onClick={() => setQty(addon.id, qty - 1, addon.max)}
                  className="flex h-9 w-9 items-center justify-center text-gray-700 disabled:opacity-35"
                >
                  <Minus className="h-4 w-4" aria-hidden />
                </button>
                <span className="min-w-[1.25rem] text-center text-sm font-semibold tabular-nums text-gray-900">
                  {qty}
                </span>
                <button
                  type="button"
                  aria-label={t("increaseAria", { name: title })}
                  disabled={qty >= addon.max}
                  onClick={() => setQty(addon.id, qty + 1, addon.max)}
                  className="flex h-9 w-9 items-center justify-center text-gray-700 disabled:opacity-35"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {expanded && expandedKey && ExpandedIcon ? (
        <div className="rounded-xl border border-gray-200 bg-stone-50 px-3 py-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-gray-700" aria-hidden>
                <ExpandedIcon className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
              <p className="text-xs font-semibold text-gray-900 sm:text-sm">
                {t(`items.${expandedKey}.title`)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(null)}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-white"
              aria-label={t("closeInfoAria")}
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:text-sm">
            {t(`items.${expandedKey}.description`)}
          </p>
        </div>
      ) : null}
    </div>
  );
}
