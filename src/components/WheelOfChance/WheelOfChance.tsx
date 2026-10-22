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

const ADDON_ICONS: Record<BookingAddonId, ComponentType<LucideProps>> = {
  "full-insurance": ShieldCheck,
  "extra-child-seat": Baby,
  "additional-driver": Users,
  "surfboard-roof-racks": Waves,
  "child-seat": Baby,
  "rooftop-cargo": Package,
};

const SHOW_DELAY_MS = 1400;

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
      trackEvent({
        event: "hero-cta",
        path: typeof window !== "undefined" ? window.location.pathname : "/",
        source: "wheel-of-chance",
        ctaLabel: "wheel-win",
        metadata: { prize: nextPrize, claimCode: nextCode },
      });
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
            className="absolute inset-0 bg-[#0c0908]/78 backdrop-blur-[6px]"
            aria-label={t("closeAria")}
            onClick={dismiss}
          />

          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="relative z-[1] w-full max-w-[26rem] overflow-hidden rounded-[28px] border border-[#c9a227]/35 bg-[linear-gradient(165deg,#1a1210_0%,#2a1814_42%,#140e0c_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)]"
          >
            <div
              className="pointer-events-none absolute -left-16 -top-20 h-48 w-48 rounded-full bg-[#EC1C25]/25 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-24 -right-10 h-52 w-52 rounded-full bg-[#c9a227]/20 blur-3xl"
              aria-hidden
            />

            <div className="relative px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[#e8d5a3]">
                    <Sparkles className="size-3.5 text-[#c9a227]" aria-hidden />
                    {t("eyebrow")}
                  </p>
                  <h2
                    id="wheel-of-chance-title"
                    className="mt-1.5 font-[family-name:var(--font-heading)] text-[1.35rem] font-semibold leading-tight text-white sm:text-2xl"
                  >
                    {phase === "won" ? t("wonTitle") : t("title")}
                  </h2>
                  <p className="mt-1.5 max-w-[34ch] text-sm leading-snug text-white/70">
                    {phase === "won"
                      ? t("wonBody", { prize: prizeTitle })
                      : t("subtitle")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={dismiss}
                  className="rounded-full border border-white/15 bg-white/5 p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                  aria-label={t("closeAria")}
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="relative mx-auto mt-2 flex w-full max-w-[19.5rem] flex-col items-center">
                <div
                  className="absolute -top-1 z-20 h-0 w-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-[#c9a227] drop-shadow-[0_4px_10px_rgba(201,162,39,0.55)]"
                  aria-hidden
                />

                <div className="relative aspect-square w-full overflow-visible">
                  <div
                    className="absolute inset-0 rounded-full opacity-80 blur-md"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(201,162,39,0.45) 0%, transparent 68%)",
                    }}
                    aria-hidden
                  />
                  <motion.div
                    className="relative h-full w-full overflow-visible rounded-full border-[3px] border-[#c9a227]/80 shadow-[0_0_0_6px_rgba(236,28,37,0.18),0_12px_40px_rgba(0,0,0,0.45)]"
                    animate={{ rotate: rotation }}
                    transition={
                      spinning
                        ? { duration: 5.1, ease: [0.12, 0.75, 0.12, 1] }
                        : { duration: 0 }
                    }
                    style={{ willChange: "transform" }}
                  >
                    <svg viewBox="0 0 200 200" className="h-full w-full overflow-visible" aria-hidden>
                      {WHEEL_SEGMENTS.map((id, i) => {
                        const start = i * segmentAngle;
                        const end = start + segmentAngle;
                        const fill = WHEEL_SEGMENT_COLORS[i % WHEEL_SEGMENT_COLORS.length];
                        return (
                          <path
                            key={id}
                            d={slicePath(100, 100, 98, start, end)}
                            fill={fill}
                            stroke="rgba(255,255,255,0.18)"
                            strokeWidth="0.8"
                          />
                        );
                      })}
                      <circle cx="100" cy="100" r="22" fill="#140e0c" stroke="#c9a227" strokeWidth="2.5" />
                      <circle cx="100" cy="100" r="8" fill="#EC1C25" />
                    </svg>

                    {/* HTML badges (same Lucide icons as booking add-ons) — clearer than SVG foreignObject */}
                    <div className="pointer-events-none absolute inset-0 overflow-visible">
                      {WHEEL_SEGMENTS.map((id, i) => {
                        const mid = i * segmentAngle + segmentAngle / 2;
                        const rad = ((mid - 90) * Math.PI) / 180;
                        const isInsurance = id === "full-insurance";
                        // Pull insurance inward — taller stack (label + 2j badge) would clip the icon at the rim
                        const radiusPct = isInsurance ? 28 : 32;
                        const left = 50 + radiusPct * Math.cos(rad);
                        const top = 50 + radiusPct * Math.sin(rad);
                        const Icon = ADDON_ICONS[id];
                        return (
                          <div
                            key={id}
                            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5"
                            style={{ left: `${left}%`, top: `${top}%` }}
                          >
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_4px_14px_rgba(0,0,0,0.35)] ring-2 ring-[#c9a227]/70 sm:size-10">
                              <Icon
                                className="size-[1.15rem] text-[#1a1210] sm:size-5"
                                strokeWidth={2.35}
                                aria-hidden
                              />
                            </span>
                            <span className="max-w-[4.2rem] rounded-full bg-[#140e0c]/75 px-1.5 py-0.5 text-center text-[0.58rem] font-bold leading-tight tracking-wide text-white shadow-sm backdrop-blur-[2px] sm:text-[0.62rem]">
                              {segmentLabels[i]}
                            </span>
                            {isInsurance ? (
                              <span className="w-max max-w-[4.5rem] rounded-full bg-[#EC1C25] px-1.5 py-0.5 text-center text-[0.5rem] font-extrabold leading-none tracking-wide text-white shadow-md sm:text-[0.55rem]">
                                {t("insuranceBadge")}
                              </span>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                </div>

                <p className="mt-3 rounded-xl border border-[#c9a227]/30 bg-[#c9a227]/10 px-3 py-2 text-center text-[0.72rem] font-medium leading-snug text-[#e8d5a3] sm:text-xs">
                  {t("insuranceNote")}
                </p>
              </div>

              <div className="mt-4 space-y-2.5">
                {phase === "won" && prizeId ? (
                  <>
                    <div className="flex items-center gap-3 rounded-2xl border border-[#c9a227]/35 bg-black/25 px-3.5 py-3">
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-[#1a1210] shadow-[0_8px_24px_rgba(236,28,37,0.35)] ring-2 ring-[#c9a227]/70">
                        <PrizeIcon key={prizeId} className="size-6" strokeWidth={2.35} aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#e8d5a3]">
                          {t("prizeLabel")}
                        </p>
                        <p className="truncate font-[family-name:var(--font-heading)] text-lg font-semibold text-white">
                          {prizeTitle}
                        </p>
                        <p className="text-xs text-white/65">
                          {prizeId === "full-insurance" ? t("insuranceNote") : t("prizeHint")}
                        </p>
                      </div>
                    </div>
                    {claimCode ? (
                      <div className="rounded-2xl border border-white/15 bg-black/30 px-3.5 py-3">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#e8d5a3]">
                          {t("claimCodeLabel")}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <code className="min-w-0 flex-1 truncate font-mono text-lg font-bold tracking-wider text-white">
                            {claimCode}
                          </code>
                          <button
                            type="button"
                            onClick={copyClaimCode}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15"
                          >
                            {copied ? (
                              <Check className="size-3.5 text-[#25D366]" aria-hidden />
                            ) : (
                              <Copy className="size-3.5" aria-hidden />
                            )}
                            {copied ? t("copied") : t("copyCode")}
                          </button>
                        </div>
                        <p className="mt-1.5 text-xs leading-snug text-white/55">
                          {t("claimCodeHint")}
                        </p>
                      </div>
                    ) : null}
                    <Link
                      href="/cars"
                      onClick={() => setOpen(false)}
                      className="flex h-12 w-full items-center justify-center rounded-full bg-[#EC1C25] text-sm font-bold uppercase tracking-wide text-white shadow-[0_10px_30px_rgba(236,28,37,0.45)] transition hover:bg-[#d41820]"
                    >
                      {t("browseCars")}
                    </Link>
                    <p className="text-center text-[0.7rem] leading-snug text-white/45">
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
                        "relative flex h-12 w-full items-center justify-center overflow-hidden rounded-full text-sm font-bold uppercase tracking-[0.14em] text-white transition",
                        spinning
                          ? "cursor-wait bg-[#7a1018]"
                          : "bg-[#EC1C25] shadow-[0_10px_30px_rgba(236,28,37,0.45)] hover:bg-[#d41820]",
                      )}
                    >
                      {!spinning && (
                        <span
                          className="pointer-events-none absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.22),transparent_55%)]"
                          aria-hidden
                        />
                      )}
                      <span className="relative z-[1]">
                        {spinning ? t("spinning") : t("spin")}
                      </span>
                    </button>
                    <p className="text-center text-[0.7rem] leading-snug text-white/45">
                      {t("legalHint")}
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
