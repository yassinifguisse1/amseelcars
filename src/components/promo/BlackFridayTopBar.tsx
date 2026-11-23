"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  BLACK_FRIDAY_PROMO,
  isBlackFridayTopBarLive,
} from "@/lib/blackFridayPromo";
import { trackEvent } from "@/lib/trackEvent";
import { usePromoCountdown } from "./usePromoCountdown";
import styles from "./black-friday.module.css";

const TOPBAR_VAR = "--bf-topbar-h";

export function BlackFridayTopBar() {
  const t = useTranslations("blackFriday");
  const { live, countdown } = usePromoCountdown(isBlackFridayTopBarLive);
  const barRef = useRef<HTMLDivElement>(null);
  const [dismissed, setDismissed] = useState(true);
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let wasDismissed = false;
    try {
      wasDismissed = sessionStorage.getItem(BLACK_FRIDAY_PROMO.storageDismissKey) === "1";
    } catch {
      // Show the offer even when browser storage is unavailable.
    }
    setDismissed(wasDismissed);
    setReady(true);
  }, []);

  const visible = ready && live && !dismissed && !countdown.expired;

  useEffect(() => {
    const root = document.documentElement;
    const bar = barRef.current;
    let observer: ResizeObserver | undefined;
    if (visible && bar) {
      const updateHeight = () => {
        root.style.setProperty(TOPBAR_VAR, `${bar.getBoundingClientRect().height}px`);
      };
      updateHeight();
      observer = new ResizeObserver(updateHeight);
      observer.observe(bar);
      root.dataset.bfTopbar = "1";
    } else {
      root.style.setProperty(TOPBAR_VAR, "0px");
      delete root.dataset.bfTopbar;
    }
    return () => {
      observer?.disconnect();
      root.style.setProperty(TOPBAR_VAR, "0px");
      delete root.dataset.bfTopbar;
    };
  }, [visible]);

  if (!visible || !isBlackFridayTopBarLive()) return null;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(BLACK_FRIDAY_PROMO.code);
      setCopied(true);
      trackEvent({
        event: "link-click",
        path: typeof window !== "undefined" ? window.location.pathname : "/",
        source: "black-friday-topbar",
        ctaLabel: "copy-code",
      });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(BLACK_FRIDAY_PROMO.storageDismissKey, "1");
    } catch {
      // Dismissal still works for this page when storage is unavailable.
    }
  };

  return (
    <>
      <div ref={barRef} className={styles.topBar} role="region" aria-label={t("topBarAria")}>
        <div className={styles.topBarInner}>
          <span className={styles.eyebrow}>
            <span className={styles.pulse} aria-hidden />
            {t("liveLabel")}
          </span>
          <p className={styles.topMessage}>
            {t.rich("topMessage", {
              strong: (chunks) => <strong>{chunks}</strong>,
              price: BLACK_FRIDAY_PROMO.fromPrice,
              code: BLACK_FRIDAY_PROMO.code,
            })}
          </p>
          <p className={styles.topMessageShort}>
            {t.rich("topMessageShort", {
              strong: (chunks) => <strong>{chunks}</strong>,
              price: BLACK_FRIDAY_PROMO.fromPrice,
              code: BLACK_FRIDAY_PROMO.code,
            })}
          </p>
          <button
            type="button"
            className={styles.codeBtn}
            data-copied={copied}
            onClick={copyCode}
          >
            {copied ? t("copied") : t("codeLabel", { code: BLACK_FRIDAY_PROMO.code })}
          </button>
          <Link
            href="/cars"
            className={styles.cta}
            onClick={() => trackEvent({
              event: "link-click",
              path: window.location.pathname,
              source: "black-friday-topbar",
              ctaLabel: "choose-car",
            })}
          >
            {t("bookCta")}
          </Link>
        </div>
        <button
          type="button"
          className={styles.dismiss}
          onClick={dismiss}
          aria-label={t("dismissAria")}
        >
          ×
        </button>
      </div>
      <div aria-hidden style={{ height: "var(--bf-topbar-h, 0px)" }} />
    </>
  );
}
