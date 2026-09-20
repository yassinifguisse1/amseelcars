"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { trackEvent } from "@/lib/trackEvent";

/**
 * Homepage hero: cropped Agadir Al Massira photo band
 * with brand / H1 / glass intro above the overlapping booking bar.
 */
export function HomeHeroCopyBand() {
  const t = useTranslations("home.hero");

  return (
    <section className="relative z-0 w-full bg-black" aria-label={t("ariaLabel")}>
      <div className="relative h-[min(42vh,22rem)] w-full overflow-hidden sm:h-[min(46vh,26rem)] md:h-[min(48vh,28rem)] lg:h-[min(50vh,30rem)]">
        <Image
          src="/images/aeroport-agadir-al-massira-aga.webp"
          alt={t("airportImageAlt")}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_12%] sm:object-[center_14%] md:object-[center_16%]"
        />

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/55"
          aria-hidden
        />

        <div className="relative z-10 flex h-full flex-col items-center justify-start px-4 pb-24 pt-8 text-center sm:px-6 sm:pb-28 sm:pt-10 md:pb-32 md:pt-12">
          <div className="mx-auto w-full max-w-4xl">
            <h1 className="mx-auto max-w-4xl font-[family-name:var(--font-heading)] text-2xl font-semibold leading-[1.15] tracking-tight text-white sm:text-3xl md:text-4xl lg:text-[2.65rem]">
              {t.rich("title", {
                brand: (chunks) => (
                  <span className="mt-2 block text-[0.9em] font-bold tracking-[0.12em] text-white drop-shadow">
                    {chunks}
                  </span>
                ),
              })}
            </h1>
            <p className="mx-auto mt-3 max-w-3xl rounded-[2rem] border border-white/35 bg-white/20 px-5 py-3.5 text-pretty text-xs leading-relaxed text-white shadow-[0_8px_32px_rgba(0,0,0,0.18)] backdrop-blur-md sm:mt-4 sm:px-7 sm:py-4 sm:text-sm md:bg-white/25 md:px-8 md:text-[0.9375rem] md:leading-relaxed md:backdrop-blur-lg">
              {t("intro")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Fleet CTA — rendered below the booking search bar on the homepage. */
export function HomeFleetCtaButton() {
  const t = useTranslations("home.hero");

  return (
    <div className="flex justify-center bg-black px-4 pb-8 pt-2 sm:pb-10 sm:pt-3">
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
        className="group relative inline-flex rounded-full border-2 border-white bg-white px-5 py-2.5 text-sm font-bold text-black shadow-2xl no-underline transition-colors duration-300 ease-out hover:border-[#CB1939] hover:bg-[#CB1939] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:px-6 sm:py-3 sm:text-base md:px-7 md:text-lg"
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
