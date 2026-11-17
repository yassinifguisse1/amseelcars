/** GA4 measurement ID (public). Empty = analytics disabled. */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "";

export function isGaConfigured(): boolean {
  return /^G-[A-Z0-9]+$/i.test(GA_MEASUREMENT_ID);
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Send a GA4 event when gtag is available. */
export function gaEvent(
  name: string,
  params?: Record<string, string | number | boolean | undefined>,
) {
  if (typeof window === "undefined" || !isGaConfigured()) return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

/** SPA / App Router page view. */
export function gaPageView(url: string) {
  if (typeof window === "undefined" || !isGaConfigured()) return;
  if (typeof window.gtag !== "function") return;
  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
}
