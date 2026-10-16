"use client";

import { useTranslations } from "next-intl";
import { GoogleReviewBadge } from "@/components/shared/GoogleReviewBadge";
import { useGoogleReviews } from "@/hooks/useGoogleReviews";

export function LandingGoogleReviewBadge() {
  const t = useTranslations("home.hero");
  const { aggregateRating, totalReviews } = useGoogleReviews();
  const ratingLabel = aggregateRating.toFixed(1);
  const reviewCountLabel = totalReviews.toLocaleString("en-US");

  return (
    <GoogleReviewBadge
      source="landing"
      rating={aggregateRating}
      ariaLabel={t("reviewProof", {
        rating: ratingLabel,
        count: totalReviews,
      })}
      countLabel={t("reviewCount", { count: reviewCountLabel })}
    />
  );
}
