"use client";

import { Star } from "lucide-react";
import {
  BUSINESS_GOOGLE_MAPS_PLACE_URL,
  BUSINESS_GOOGLE_RATING,
  BUSINESS_GOOGLE_REVIEW_COUNT,
} from "@/lib/business";
import { trackEvent } from "@/lib/trackEvent";

type GoogleReviewBadgeProps = {
  /** Accessible label, e.g. "5.0 · 252 Google reviews" */
  ariaLabel: string;
  /** Visible count label, e.g. "252 reviews" */
  countLabel: string;
  source?: string;
  className?: string;
};

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
  source = "landing",
  className,
}: GoogleReviewBadgeProps) {
  const ratingLabel = BUSINESS_GOOGLE_RATING.toFixed(1);

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
          <Star
            key={i}
            className="h-3.5 w-3.5 fill-[#FBBC04] text-[#FBBC04] sm:h-4 sm:w-4"
          />
        ))}
      </span>
      <span className="text-sm font-bold tabular-nums sm:text-[0.95rem]">
        {countLabel}
      </span>
    </a>
  );
}
