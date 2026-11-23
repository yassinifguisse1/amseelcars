"use client";

import {
  BUSINESS_GOOGLE_MAPS_PLACE_URL,
  BUSINESS_GOOGLE_RATING,
} from "@/lib/business";
import { trackEvent } from "@/lib/trackEvent";

type GoogleReviewBadgeProps = {
  /** Accessible label, e.g. "5.0 · 271 Google reviews" */
  ariaLabel: string;
  /** Visible count label, e.g. "271 reviews" */
  countLabel: string;
  /** Star rating value (defaults to BUSINESS_GOOGLE_RATING) */
  rating?: number;
  source?: string;
  className?: string;
};

const STAR_YELLOW = "#FBBC04";

/** Solid Google-yellow star. Inline fill beats global `svg { fill: white }` in globals.css. */
function GoogleStar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={{ fill: STAR_YELLOW, color: STAR_YELLOW }}
      aria-hidden
    >
      <path d="M12 2.5l2.89 6.12 6.71.74-5.02 4.6 1.4 6.54L12 17.77l-5.98 3.73 1.4-6.54-5.02-4.6 6.71-.74L12 2.5z" />
    </svg>
  );
}

function GoogleWordmark() {
  return (
    <span
      className="select-none text-[0.95rem] font-semibold leading-none tracking-[-0.02em] sm:text-[1.05rem]"
      aria-hidden
    >
      <span className="text-[#4285F4]">G</span>
      <span className="text-[#EA4335]">o</span>
      <span className="text-[#FBBC05]">o</span>
      <span className="text-[#4285F4]">g</span>
      <span className="text-[#34A853]">l</span>
      <span className="text-[#EA4335]">e</span>
    </span>
  );
}

export function GoogleReviewBadge({
  ariaLabel,
  countLabel,
  rating = BUSINESS_GOOGLE_RATING,
  source = "landing",
  className,
}: GoogleReviewBadgeProps) {
  const ratingLabel = Number.isFinite(rating) ? rating.toFixed(1) : BUSINESS_GOOGLE_RATING.toFixed(1);

  return (
    <a
      href={BUSINESS_GOOGLE_MAPS_PLACE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-neutral-900 no-underline shadow-[0_4px_18px_rgba(0,0,0,0.18)] ring-1 ring-black/5 transition hover:shadow-[0_6px_22px_rgba(0,0,0,0.22)] sm:gap-2.5 sm:px-4 sm:py-2.5"
      }
      onClick={() => {
        trackEvent({
          event: "maps-click",
          path: typeof window !== "undefined" ? window.location.pathname : "/",
          source,
          ctaLabel: "review-badge",
        });
      }}
    >
      <GoogleWordmark />
      <span className="text-sm font-bold tabular-nums sm:text-[0.95rem]">
        {ratingLabel}
      </span>
      <span className="inline-flex items-center gap-px sm:gap-0.5" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <GoogleStar key={i} className="h-4 w-4 sm:h-[1.15rem] sm:w-[1.15rem]" />
        ))}
      </span>
      <span className="text-sm font-bold tabular-nums sm:text-[0.95rem]">
        {countLabel}
      </span>
    </a>
  );
}
