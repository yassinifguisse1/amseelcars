"use client";

import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Baby,
  Check,
  Copy,
  Package,
  ShieldCheck,
  Sparkles,
  Users,
  Waves,
  X,
  type LucideProps,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  BOOKING_ADDON_MESSAGE_KEYS,
  type BookingAddonId,
} from "@/lib/bookingAddons";
import { trackEvent } from "@/lib/trackEvent";
import {
  createWheelClaimCode,
  persistWheelPrize,
  pickWheelPrizeIndex,
  shouldShowWheelOfChance,
  wheelRotationForIndex,
  writeWheelStorage,
  readWheelStorage,
  WHEEL_SEGMENT_COLORS,
  WHEEL_SEGMENTS,
  type WheelPrizeId,
} from "@/lib/wheelOfChance";
import { cn } from "@/lib/utils";
import { WheelConfetti } from "./WheelConfetti";

const ADDON_ICONS: Record<BookingAddonId, ComponentType<LucideProps>> = {
  "full-insurance": ShieldCheck,
  "extra-child-seat": Baby,
  "additional-driver": Users,
  "surfboard-roof-racks": Waves,
  "child-seat": Baby,
  "rooftop-cargo": Package,
};

const SHOW_DELAY_MS = 4000;

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(cx: number, cy: number, r: number, start: number, end: number) {
  const a = polar(cx, cy, r, start);
  const b = polar(cx, cy, r, end);
  const large = end - start <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y} Z`;
}

function isLightSlice(fill: string) {
  return fill === "#F7EBD4" || fill === "#FFF8EE" || fill === "#e8d5a3";
}

export function WheelOfChance() {
  const t = useTranslations("wheelOfChance");
  const tAddons = useTranslations("booking.addons");
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prizeId, setPrizeId] = useState<WheelPrizeId | null>(null);
  const [claimCode, setClaimCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [phase, setPhase] = useState<"idle" | "spinning" | "won">("idle");
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (!shouldShowWheelOfChance()) return;
    const timer = window.setTimeout(() => {
      setOpen(true);
      trackEvent({
        event: "hero-cta",
        path: typeof window !== "undefined" ? window.location.pathname : "/",
        source: "wheel-of-chance",
        ctaLabel: "wheel-shown",
      });
    }, SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const segmentAngle = 360 / WHEEL_SEGMENTS.length;

  const segmentLabels = useMemo(
    () =>
      WHEEL_SEGMENTS.map((id) =>
        tAddons(`items.${BOOKING_ADDON_MESSAGE_KEYS[id]}.shortTitle`),
      ),
    [tAddons],
  );

  const dismiss = useCallback(() => {
    writeWheelStorage({
      ...readWheelStorage(),
      dismissedAt: new Date().toISOString(),
    });
    setOpen(false);
    setCelebrate(false);
    trackEvent({
      event: "link-click",
      path: typeof window !== "undefined" ? window.location.pathname : "/",
      source: "wheel-of-chance",
      ctaLabel: "wheel-dismiss",
    });
  }, []);

  const spin = useCallback(() => {
    if (spinning || phase === "won") return;
    const index = pickWheelPrizeIndex();
    const nextPrize = WHEEL_SEGMENTS[index];
    const nextCode = createWheelClaimCode(nextPrize);
    const nextRotation = rotation + wheelRotationForIndex(index, 6 + Math.floor(Math.random() * 2));

    setSpinning(true);
    setPhase("spinning");
    setCelebrate(false);
    setRotation(nextRotation);
    trackEvent({
      event: "hero-cta",
      path: typeof window !== "undefined" ? window.location.pathname : "/",
      source: "wheel-of-chance",
      ctaLabel: "wheel-spin",
      metadata: { prize: nextPrize },
    });

    window.setTimeout(() => {
      setPrizeId(nextPrize);
      setClaimCode(nextCode);
      persistWheelPrize(nextPrize, nextCode);
      setSpinning(false);
      setPhase("won");
      setCelebrate(true);
      trackEvent({
        event: "hero-cta",
        path: typeof window !== "undefined" ? window.location.pathname : "/",
        source: "wheel-of-chance",
        ctaLabel: "wheel-win",
        metadata: { prize: nextPrize, claimCode: nextCode },
      });
      window.setTimeout(() => setCelebrate(false), 4500);
    }, 5200);
  }, [phase, rotation, spinning]);

  const copyClaimCode = useCallback(async () => {
    if (!claimCode) return;
    try {
      await navigator.clipboard.writeText(claimCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }, [claimCode]);

  const prizeTitle = prizeId
    ? tAddons(`items.${BOOKING_ADDON_MESSAGE_KEYS[prizeId]}.title`)
    : "";
  const PrizeIcon = prizeId ? ADDON_ICONS[prizeId] : Sparkles;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[1200] flex items-end justify-center p-3 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="wheel-of-chance-title"
        >
          <button
            type="button"
            className="absolute inset-0 z-0 bg-black/55 backdrop-blur-[4px]"
            aria-label={t("closeAria")}
            onClick={dismiss}
          />

          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="relative z-10 w-full max-w-[24.5rem] overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-[0_24px_64px_rgba(0,0,0,0.28)]"
          >
            <div className="relative bg-[#EC1C25] px-5 pb-4 pt-4 text-white sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2
                    id="wheel-of-chance-title"
                    className="font-[family-name:var(--font-heading)] text-[1.4rem] font-semibold leading-tight sm:text-[1.55rem]"
                  >
                    {phase === "won" ? t("wonTitle") : t("title")}
                  </h2>
                  <p className="mt-1.5 max-w-[36ch] text-sm leading-snug text-white/90">
                    {phase === "won"
                      ? t("wonBody", { prize: prizeTitle })
                      : t("subtitle")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={dismiss}
                  className="rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25"
                  aria-label={t("closeAria")}
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="relative px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
              <div className="relative mx-auto flex w-full max-w-[18.5rem] flex-col items-center">
                {/* Pointer peg */}
                <div
                  className="absolute -top-0.5 z-20 flex flex-col items-center"
                  aria-hidden
                >
                  <span className="h-3 w-3 rounded-full border-2 border-white bg-[#EC1C25] shadow-md" />
                  <span className="-mt-0.5 h-0 w-0 border-l-[9px] border-r-[9px] border-t-[14px] border-l-transparent border-r-transparent border-t-[#EC1C25]" />
                </div>

                <div className="relative mt-3 aspect-square w-full">
                  <div
                    className="absolute -inset-2 rounded-full bg-stone-100"
                    aria-hidden
                  />
                  <motion.div
                    className="relative h-full w-full overflow-visible rounded-full border-[6px] border-stone-800 shadow-[inset_0_0_0_3px_#c9a227,0_10px_28px_rgba(0,0,0,0.18)]"
                    animate={{ rotate: rotation }}
                    transition={
                      spinning
                        ? { duration: 5.1, ease: [0.12, 0.75, 0.12, 1] }
                        : { duration: 0 }
                    }
                    style={{ willChange: "transform" }}
                  >
                    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
                      {WHEEL_SEGMENTS.map((id, i) => {
                        const start = i * segmentAngle;
                        const end = start + segmentAngle;
                        const fill = WHEEL_SEGMENT_COLORS[i % WHEEL_SEGMENT_COLORS.length];
                        return (
                          <path
                            key={id}
                            d={slicePath(100, 100, 96, start, end)}
                            fill={fill}
                            stroke="#1a1210"
                            strokeWidth="1.2"
                          />
                        );
                      })}
                      <circle cx="100" cy="100" r="20" fill="#1a1210" stroke="#c9a227" strokeWidth="3" />
                      <circle cx="100" cy="100" r="8" fill="#EC1C25" />
                    </svg>

                    <div className="pointer-events-none absolute inset-0">
                      {WHEEL_SEGMENTS.map((id, i) => {
                        const mid = i * segmentAngle + segmentAngle / 2;
                        const rad = ((mid - 90) * Math.PI) / 180;
                        const radiusPct = 31;
                        const left = 50 + radiusPct * Math.cos(rad);
                        const top = 50 + radiusPct * Math.sin(rad);
                        const Icon = ADDON_ICONS[id];
                        const fill = WHEEL_SEGMENT_COLORS[i % WHEEL_SEGMENT_COLORS.length]!;
                        const light = isLightSlice(fill);
                        return (
                          <div
                            key={id}
                            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5"
                            style={{ left: `${left}%`, top: `${top}%` }}
                          >
                            <span
                              className={cn(
                                "flex size-8 items-center justify-center rounded-full shadow-sm sm:size-9",
                                light ? "bg-[#1a1210] text-white" : "bg-white text-[#1a1210]",
                              )}
                            >
                              <Icon className="size-4 sm:size-[1.05rem]" strokeWidth={2.4} aria-hidden />
                            </span>
                            <span
                              className={cn(
                                "max-w-[4rem] text-center text-[0.58rem] font-bold leading-tight sm:text-[0.62rem]",
                                light ? "text-[#1a1210]" : "text-white",
                              )}
                            >
                              {segmentLabels[i]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                </div>

                <p className="mt-3 text-center text-[0.78rem] font-medium leading-snug text-stone-600">
                  {t("giftRuleNote")}
                </p>
              </div>

              <div className="mt-4 space-y-2.5">
                {phase === "won" && prizeId ? (
                  <>
                    <motion.div
                      initial={{ scale: 0.92, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-3 rounded-2xl border border-[#c9a227]/50 bg-[#fff8e8] px-3.5 py-3"
                    >
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-[#1a1210] shadow ring-2 ring-[#c9a227]/60">
                        <PrizeIcon key={prizeId} className="size-6" strokeWidth={2.35} aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#8a6a14]">
                          {t("prizeLabel")}
                        </p>
                        <p className="truncate font-[family-name:var(--font-heading)] text-lg font-semibold text-stone-900">
                          {prizeTitle}
                        </p>
                        <p className="text-xs text-stone-600">{t("giftRuleNote")}</p>
                      </div>
                    </motion.div>
                    {claimCode ? (
                      <div className="rounded-2xl border border-stone-200 bg-stone-50 px-3.5 py-3">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-stone-500">
                          {t("claimCodeLabel")}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <code className="min-w-0 flex-1 truncate font-mono text-lg font-bold tracking-wider text-stone-900">
                            {claimCode}
                          </code>
                          <button
                            type="button"
                            onClick={copyClaimCode}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 transition hover:bg-stone-100"
                          >
                            {copied ? (
                              <Check className="size-3.5 text-[#25D366]" aria-hidden />
                            ) : (
                              <Copy className="size-3.5" aria-hidden />
                            )}
                            {copied ? t("copied") : t("copyCode")}
                          </button>
                        </div>
                        <p className="mt-1.5 text-xs leading-snug text-stone-500">
                          {t("claimCodeHint")}
                        </p>
                      </div>
                    ) : null}
                    <Link
                      href="/cars"
                      onClick={() => {
                        trackEvent({
                          event: "link-click",
                          path:
                            typeof window !== "undefined"
                              ? window.location.pathname
                              : "/",
                          source: "wheel-of-chance",
                          ctaLabel: "wheel-browse-fleet",
                          metadata: {
                            ...(prizeId ? { prize: prizeId } : {}),
                            ...(claimCode ? { claimCode } : {}),
                          },
                        });
                        setOpen(false);
                      }}
                      className="flex h-12 w-full items-center justify-center rounded-full bg-[#EC1C25] text-sm font-bold text-white transition hover:bg-[#d41820]"
                    >
                      {t("browseCars")}
                    </Link>
                    <p className="text-center text-[0.7rem] leading-snug text-stone-400">
                      {t("legalHint")}
                    </p>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={spin}
                      disabled={spinning}
                      className={cn(
                        "flex h-12 w-full items-center justify-center rounded-full text-sm font-bold uppercase tracking-[0.12em] text-white transition",
                        spinning
                          ? "cursor-wait bg-stone-400"
                          : "bg-[#EC1C25] shadow-[0_8px_24px_rgba(236,28,37,0.35)] hover:bg-[#d41820]",
                      )}
                    >
                      {spinning ? t("spinning") : t("spin")}
                    </button>
                    <p className="text-center text-[0.7rem] leading-snug text-stone-400">
                      {t("legalHint")}
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Above the form on all viewports (esp. mobile full-bleed card) */}
          <WheelConfetti active={celebrate} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
