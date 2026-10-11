"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  BUSINESS_GOOGLE_RATING,
  BUSINESS_GOOGLE_REVIEW_COUNT,
  BUSINESS_WHATSAPP_URL,
  SITE_NAME,
} from "@/lib/business";
import { GoogleReviewBadge } from "@/components/shared/GoogleReviewBadge";
import { trackEvent } from "@/lib/trackEvent";

/**
 * Homepage hero: brand hub only - city/airport money keywords live on
 * their dedicated landings (see KEYWORD_PAGE_OWNERSHIP).
 */
export function HomeHeroCopyBand({ children }: { children?: ReactNode }) {
  const t = useTranslations("home.hero");
  const ratingLabel = BUSINESS_GOOGLE_RATING.toFixed(1);
  const reviewCountLabel = BUSINESS_GOOGLE_REVIEW_COUNT.toLocaleString("en-US");

  return (
    <section className="relative z-0 w-full" aria-label={t("ariaLabel")}>
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/images/agadir-city-hero.webp"
          alt={t("imageAlt")}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_36%] sm:object-[center_40%] md:object-[center_42%]"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/20"
          aria-hidden
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-start px-3 pb-1 pt-[5.25rem] text-center sm:px-6 sm:pb-2 sm:pt-10 md:pt-12">
        <div className="mx-auto w-full max-w-3xl">
          <p className="text-[0.7rem] font-bold tracking-[0.22em] text-white sm:text-xs md:text-sm">
            {SITE_NAME}
          </p>
          <h1 className="mx-auto mt-2 max-w-[20ch] font-[family-name:var(--font-heading)] text-[1.35rem] font-semibold leading-[1.15] tracking-tight text-white sm:mt-3 sm:max-w-2xl sm:text-3xl sm:leading-[1.12] md:text-4xl lg:text-[2.55rem]">
            {t("title")}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-[0.8rem] leading-snug text-white/90 sm:mt-4 sm:text-base sm:leading-relaxed md:text-lg">
            {t("intro")}
          </p>
          <div className="mt-4 flex justify-center sm:mt-5">
            <GoogleReviewBadge
              source="home"
              ariaLabel={t("reviewProof", {
                rating: ratingLabel,
                count: BUSINESS_GOOGLE_REVIEW_COUNT,
              })}
              countLabel={t("reviewCount", { count: reviewCountLabel })}
            />
          </div>
        </div>
      </div>

      {children ? <div className="relative z-20">{children}</div> : null}
    </section>
  );
}

/** Fleet / WhatsApp CTAs below the booking search bar. */
export function HomeHeroCtaBand() {
  const t = useTranslations("home.hero");
  const waHref = `${BUSINESS_WHATSAPP_URL}/?text=${encodeURIComponent(t("whatsappPrefill"))}`;

  return (
    <div className="bg-white px-4 pb-5 pt-4 sm:pb-6 sm:pt-5">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4">
        <div className="flex w-full flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/cars"
            onClick={() => {
              trackEvent({
                event: "hero-cta",
                path: typeof window !== "undefined" ? window.location.pathname : "/",
                source: "home",
                ctaLabel: "fleet-cta",
              });
            }}
            className="inline-flex min-w-[10.5rem] items-center justify-center rounded-full border-2 border-[#CB1939] bg-[#CB1939] px-6 py-2.5 text-sm font-bold text-white no-underline transition hover:border-neutral-900 hover:bg-neutral-900 sm:min-w-[12rem] sm:px-7 sm:py-3 sm:text-base"
          >
            {t("fleetCta")}
          </Link>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackEvent({
                event: "whatsapp",
                path: typeof window !== "undefined" ? window.location.pathname : "/",
                source: "home",
                ctaLabel: "hero-whatsapp",
              });
            }}
            className="inline-flex min-w-[10.5rem] items-center justify-center gap-2 rounded-full border-2 border-neutral-900 bg-white px-6 py-2.5 text-sm font-bold text-neutral-900 no-underline transition hover:bg-neutral-900 hover:text-white sm:min-w-[12rem] sm:px-7 sm:py-3 sm:text-base"
          >
            <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
            {t("whatsappCta")}
          </a>
        </div>

        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-xs text-neutral-500 sm:text-sm">
          <Link
            href="/location-voiture-agadir"
            className="underline-offset-2 hover:text-[#CB1939] hover:underline"
          >
            {t("cityLink")}
          </Link>
          <span aria-hidden>·</span>
          <Link
            href="/agadir-airport-car-rental"
            className="underline-offset-2 hover:text-[#CB1939] hover:underline"
          >
            {t("airportLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}

/** @deprecated Use HomeHeroCtaBand */
export function HomeFleetCtaButton() {
  return <HomeHeroCtaBand />;
}
