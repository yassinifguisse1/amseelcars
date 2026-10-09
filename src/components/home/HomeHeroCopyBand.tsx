"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { trackEvent } from "@/lib/trackEvent";

/**
 * Homepage hero: Agadir city photo continues behind the booking bar
 * so the page body black never shows through the overlap.
 */
export function HomeHeroCopyBand({ children }: { children?: ReactNode }) {
  const t = useTranslations("home.hero");

  return (
    <section className="relative z-0 w-full" aria-label={t("ariaLabel")}>
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/images/agadir-city-hero.webp"
          alt={t("airportImageAlt")}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_36%] sm:object-[center_40%] md:object-[center_42%]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/15" aria-hidden />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-start px-3 pb-2 pt-[5.25rem] text-center sm:px-6 sm:pb-8 sm:pt-10 md:pt-12">
        <div className="mx-auto w-full max-w-4xl">
          <h1 className="mx-auto max-w-[22ch] font-[family-name:var(--font-heading)] text-[1.15rem] font-semibold leading-[1.2] tracking-tight text-white sm:max-w-4xl sm:text-3xl sm:leading-[1.18] md:text-4xl lg:text-[2.65rem]">
            {t.rich("title", {
              brand: (chunks) => (
                <span className="mt-1 block text-[0.9em] font-bold tracking-[0.12em] text-white drop-shadow sm:mt-2">
                  {chunks}
                </span>
              ),
            })}
          </h1>
          <p className="mx-auto mt-2 max-w-3xl rounded-xl border border-white/35 bg-white/20 px-3 py-2 text-pretty text-[0.72rem] leading-snug text-white shadow-[0_8px_32px_rgba(0,0,0,0.18)] backdrop-blur-md sm:mt-4 sm:rounded-[2rem] sm:px-7 sm:py-4 sm:text-sm sm:leading-relaxed md:bg-white/25 md:px-8 md:text-[0.9375rem] md:leading-relaxed md:backdrop-blur-lg">
            {t("intro")}
          </p>
        </div>
      </div>

      {children ? <div className="relative z-20">{children}</div> : null}
    </section>
  );
}

/** Fleet CTA — rendered below the booking search bar on the homepage. */
export function HomeFleetCtaButton() {
  const t = useTranslations("home.hero");

  return (
    <div className="flex justify-center bg-white px-4 pb-2 pt-4 sm:pb-3 sm:pt-5">
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
        className="group relative inline-flex rounded-full border-2 border-[#CB1939] bg-[#CB1939] px-5 py-2.5 text-sm font-bold text-white shadow-lg no-underline transition-colors duration-300 ease-out hover:border-black hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#CB1939] sm:px-6 sm:py-3 sm:text-base md:px-7 md:text-lg"
      >
        <span className="relative z-10 flex items-center gap-2">
          {t("fleetCta")}
          <span
            className="inline-block transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden
          >
            →
          </span>
        </span>
      </Link>
    </div>
  );
}
