"use client";

import { useTranslations } from "next-intl";
import {
  BUSINESS_GOOGLE_RATING,
  BUSINESS_GOOGLE_REVIEW_COUNT,
} from "@/lib/business";
import { GoogleReviewBadge } from "@/components/shared/GoogleReviewBadge";

export function LandingGoogleReviewBadge() {
  const t = useTranslations("home.hero");
  const ratingLabel = BUSINESS_GOOGLE_RATING.toFixed(1);
  const reviewCountLabel = BUSINESS_GOOGLE_REVIEW_COUNT.toLocaleString("en-US");

  return (
    <GoogleReviewBadge
      source="landing"
      ariaLabel={t("reviewProof", {
        rating: ratingLabel,
        count: BUSINESS_GOOGLE_REVIEW_COUNT,
      })}
      countLabel={t("reviewCount", { count: reviewCountLabel })}
    />
  );
}
