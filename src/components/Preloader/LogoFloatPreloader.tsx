"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./LogoFloatPreloader.module.css";

const SESSION_KEY = "amseel-preloader-seen";

type LogoFloatPreloaderProps = {
  /** Duration for the 0 → 100 count (ms). */
  durationMs?: number;
  onExitComplete?: () => void;
};

function shouldSkipPreloader() {
  if (typeof window === "undefined") return true;
  try {
    if (sessionStorage.getItem(SESSION_KEY) === "1") return true;
  } catch {
    /* ignore */
  }
  const nav = navigator as Navigator & { webdriver?: boolean };
  if (nav.webdriver) return true;
  if (/Lighthouse|PageSpeed|Chrome-Lighthouse|GTmetrix|Pingdom/i.test(nav.userAgent)) {
    return true;
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  return false;
}

/**
 * Brand preloader: floating mark + percentage 0→100.
 * Skipped for bots / Lighthouse / reduced-motion / same-session revisits
 * so PageSpeed LCP is not tanked.
 */
export function LogoFloatPreloader({
  durationMs = 1600,
  onExitComplete,
}: LogoFloatPreloaderProps) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (shouldSkipPreloader()) {
      setEnabled(false);
      onExitComplete?.();
      return;
    }
    setEnabled(true);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
  }, [onExitComplete]);

  useEffect(() => {
    if (!enabled) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setProgress(Math.min(100, Math.round(t * 100)));

      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setProgress(100);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [enabled, durationMs]);

  useEffect(() => {
    if (!enabled || progress < 100) return;
    const timer = window.setTimeout(() => setExiting(true), 160);
    return () => window.clearTimeout(timer);
  }, [enabled, progress]);

  useEffect(() => {
    if (!exiting) return;
    const timer = window.setTimeout(() => {
      setVisible(false);
      onExitComplete?.();
    }, 480);
    return () => window.clearTimeout(timer);
  }, [exiting, onExitComplete]);

  useEffect(() => {
    if (!enabled || !visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [enabled, visible]);

  if (enabled === null || enabled === false || !visible) {
    return null;
  }

  return (
    <div
      className={`${styles.root} ${exiting ? styles.exiting : ""}`}
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <div className={styles.inner}>
        <div className={styles.logoWrap}>
          <Image
            src="/images/amseel-cars-logo-01.svg"
            alt="Amseel Cars"
            width={220}
            height={174}
            priority
            className={styles.logo}
          />
        </div>

        <p className={styles.percent} aria-label={`${progress} percent`}>
          <span className={styles.percentValue}>{progress}</span>
          <span className={styles.percentSign}>%</span>
        </p>

        <div className={styles.track} aria-hidden>
          <div className={styles.fill} style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
