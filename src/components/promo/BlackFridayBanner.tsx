"use client";

import { useState } from "react";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  BLACK_FRIDAY_PROMO,
  formatBlackFridayPriceLabel,
  isBlackFridayPromoLive,
} from "@/lib/blackFridayPromo";
import {
  BUSINESS_WHATSAPP_URL,
  SITE_NAME,
} from "@/lib/business";
import { convertCarPrice, formatCarPriceLabel } from "@/lib/currency";
import { getCarBySlug } from "@/data/cars";
import { GoogleReviewBadge } from "@/components/shared/GoogleReviewBadge";
import { useGoogleReviews } from "@/hooks/useGoogleReviews";
import { trackEvent } from "@/lib/trackEvent";
import { carBrandScopedHrefFromCanonical } from "@/lib/carPublicHref";
import { toAppLocale } from "@/i18n/locale-utils";
import { usePromoCountdown } from "./usePromoCountdown";
import styles from "./black-friday.module.css";

const BF_CAR_IMAGE = "/images/black-friday-bmw-x3-pack-m.jpg";
const BF_BMW_SLUG = "location-voiture-agadir-bmw-x3-pack-m";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function BlackFridayBanner({ asHero = false }: { asHero?: boolean }) {
  const t = useTranslations("blackFriday");
  const tHero = useTranslations("home.hero");
  const locale = toAppLocale(useLocale());
  const { live, countdown } = usePromoCountdown();
  const { aggregateRating, totalReviews } = useGoogleReviews();
  const [copied, setCopied] = useState(false);
  const bmwHref = carBrandScopedHrefFromCanonical("BMW", BF_BMW_SLUG, locale);

  const ratingLabel = aggregateRating.toFixed(1);
  const reviewCountLabel = totalReviews.toLocaleString("en-US");
  const waHref = `${BUSINESS_WHATSAPP_URL}/?text=${encodeURIComponent(
    t("whatsappPrefill", {
      code: BLACK_FRIDAY_PROMO.code,
      price: BLACK_FRIDAY_PROMO.fromPrice,
    }),
  )}`;

  if (!live || countdown.expired || !isBlackFridayPromoLive()) return null;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(BLACK_FRIDAY_PROMO.code);
      setCopied(true);
      trackEvent({
        event: "link-click",
        path: typeof window !== "undefined" ? window.location.pathname : "/",
        source: "black-friday-banner",
        ctaLabel: "copy-code",
      });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const perks = t.raw("perks") as string[];
  const bmwPrice =
    formatBlackFridayPriceLabel(BF_BMW_SLUG, "EUR") ?? "€117";
  const bmwCar = getCarBySlug(BF_BMW_SLUG);
  const bmwOldMad = bmwCar?.pricing?.shortTerm ?? bmwCar?.pricePerDay ?? 0;
  const bmwOldPrice =
    bmwOldMad > 0
      ? formatCarPriceLabel(convertCarPrice(bmwOldMad, "EUR"), "EUR")
      : "€130";

  return (
    <section
      className={`${styles.banner}${asHero ? ` ${styles.bannerAsHero}` : ""}`}
      aria-labelledby="home-h1"
    >
      <div className={styles.bannerInner}>
        <div className={styles.copyCol}>
          <p className={`${styles.kicker} ${styles.mobileHide}`}>
            {t("bannerKicker")}
          </p>
          <p className={`${styles.brandLine} ${styles.mobileHide}`}>{SITE_NAME}</p>
          <div className={styles.titleRow}>
            <p className={styles.title}>{t("bannerTitle")}</p>
            <p className={styles.fromPrice}>
              {t("fromPriceLabel", { price: BLACK_FRIDAY_PROMO.fromPrice })}
            </p>
          </div>

          <h1 id="home-h1" className={styles.agencyTitle}>
            {tHero("title")}
          </h1>
          <p className={styles.agencyIntro}>
            {t("agencyIntro", { price: BLACK_FRIDAY_PROMO.fromPrice })}
          </p>

          <div className={styles.badgeRow}>
            <GoogleReviewBadge
              source="black-friday-banner"
              rating={aggregateRating}
              ariaLabel={tHero("reviewProof", {
                rating: ratingLabel,
                count: totalReviews,
              })}
              countLabel={tHero("reviewCount", { count: reviewCountLabel })}
            />
          </div>

          <p className={`${styles.subtitle} ${styles.mobileHide}`}>
            {t.rich("bannerSubtitle", {
              strong: (chunks) => <strong>{chunks}</strong>,
              code: BLACK_FRIDAY_PROMO.code,
              price: BLACK_FRIDAY_PROMO.fromPrice,
            })}
          </p>
        </div>

        <aside className={styles.panel} aria-label={t("panelAria")}>
          <div className={styles.panelMedia}>
            <Image
              src={BF_CAR_IMAGE}
              alt={t("panelImageAlt")}
              fill
              className={styles.panelImage}
              sizes="(min-width: 900px) 28vw, 90vw"
              priority={false}
            />
            <span className={styles.panelMediaBadge}>{t("liveLabel")}</span>
            <div className={styles.panelBmwRow}>
              <span className={styles.panelBmwPrice}>
                {t("panelBmwPrice", { price: bmwPrice })}
                <span className={`${styles.oldPriceStruck} ${styles.panelBmwOld}`}>
                  {bmwOldPrice}
                </span>
              </span>
              <Link
                href={bmwHref}
                className={styles.panelBmwBook}
                onClick={() => {
                  trackEvent({
                    event: "link-click",
                    path:
                      typeof window !== "undefined"
                        ? window.location.pathname
                        : "/",
                    source: "black-friday-banner",
                    ctaLabel: "bmw-book-now",
                    carSlug: BF_BMW_SLUG,
                  });
                }}
              >
                <span className={styles.panelBmwBookText}>{t("panelBmwBook")}</span>
              </Link>
            </div>
          </div>
          <div className={`${styles.panelBody} ${styles.mobileHide}`}>
            <p className={styles.panelTitle}>{t("panelTitle")}</p>
            <ul className={styles.panelList}>
              {perks.map((perk) => (
                <li key={perk}>{perk}</li>
              ))}
            </ul>
            <div className={styles.countdown} style={{ marginTop: "1.1rem" }}>
              <div className={styles.countdownUnit}>
                <span>{pad(countdown.days)}</span>
                <span>{t("unitDay")}</span>
              </div>
              <span className={styles.countdownSep} aria-hidden>
                :
              </span>
              <div className={styles.countdownUnit}>
                <span>{pad(countdown.hours)}</span>
                <span>{t("unitHour")}</span>
              </div>
              <span className={styles.countdownSep} aria-hidden>
                :
              </span>
              <div className={styles.countdownUnit}>
                <span>{pad(countdown.minutes)}</span>
                <span>{t("unitMin")}</span>
              </div>
              <span className={styles.countdownSep} aria-hidden>
                :
              </span>
              <div className={styles.countdownUnit}>
                <span>{pad(countdown.seconds)}</span>
                <span>{t("unitSec")}</span>
              </div>
            </div>
          </div>
        </aside>

        <div className={styles.actions}>
          <Link
            href="/cars"
            className={styles.primaryCta}
            onClick={() => {
              trackEvent({
                event: "hero-cta",
                path:
                  typeof window !== "undefined" ? window.location.pathname : "/",
                source: "black-friday-banner",
                ctaLabel: "fleet-cta",
              });
            }}
          >
            {tHero("fleetCta")}
          </Link>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappCta}
            onClick={() => {
              trackEvent({
                event: "whatsapp",
                path:
                  typeof window !== "undefined" ? window.location.pathname : "/",
                source: "black-friday-banner",
                ctaLabel: "bf-whatsapp",
              });
            }}
          >
            <MessageCircle className={styles.waIcon} aria-hidden />
            {tHero("whatsappCta")}
          </a>
          <button
            type="button"
            className={`${styles.secondaryCta} ${styles.mobileHide}`}
            data-copied={copied}
            onClick={copyCode}
          >
            {copied
              ? t("copied")
              : t("bannerCodeCta", { code: BLACK_FRIDAY_PROMO.code })}
          </button>
        </div>

        <p className={`${styles.pickupLinks} ${styles.mobileHide}`}>
          <Link href="/location-voiture-agadir">{tHero("cityLink")}</Link>
          <span aria-hidden>·</span>
          <Link href="/agadir-airport-car-rental">{tHero("airportLink")}</Link>
        </p>
      </div>
    </section>
  );
}
