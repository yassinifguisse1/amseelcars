"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { GA_MEASUREMENT_ID, gaPageView, isGaConfigured } from "@/lib/ga";

/**
 * GA4 (gtag) — no Tag Manager, no consent gate.
 * Loads on public locale pages; tracks App Router navigations.
 */
export function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const lastKey = useRef("");

  useEffect(() => {
    if (!ready || !isGaConfigured() || !pathname) return;
    const qs = searchParams?.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    if (lastKey.current === url) return;
    lastKey.current = url;
    gaPageView(url);
  }, [ready, pathname, searchParams]);

  if (!isGaConfigured()) return null;

  return (
    <>
      <Script id="ga4-init" strategy="afterInteractive" onReady={() => setReady(true)}>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
        `}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
    </>
  );
}
