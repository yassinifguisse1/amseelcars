"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * Lightweight home H1 + CTA (no framer-motion / video).
 * Keeps LCP / FCP free of the scroll-video client chunk.
 */
export function HomeHeroCopyBand() {
  const t = useTranslations("home.hero");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <section
      className="relative z-10 bg-black px-4 pb-10 pt-6 md:px-6 md:pb-14 md:pt-8 lg:pb-16 lg:pt-10"
      aria-label={t("ariaLabel")}
    >
      <div className="mx-auto w-full max-w-4xl text-center">
        <h1 className="mx-auto max-w-4xl text-center font-[family-name:var(--font-heading)] text-3xl font-semibold leading-[1.15] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[3.15rem]">
          {t.rich("title", {
            brand: (chunks) => (
              <span className="mt-2 block text-[0.92em] font-bold tracking-[0.12em] text-white">
                {chunks}
              </span>
            ),
          })}
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-pretty text-sm leading-relaxed text-white/92 drop-shadow md:text-base md:leading-relaxed">
          {t("intro")}
        </p>
        <div className="mt-8 flex justify-center md:mt-10">
          <Link
            href="/cars"
            className={`group relative inline-flex rounded-full border-2 border-white bg-white font-bold text-black shadow-2xl no-underline transition-colors duration-300 ease-out hover:border-[#CB1939] hover:bg-[#CB1939] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${
              isMobile ? "px-6 py-3 text-base" : "px-8 py-4 text-lg"
            }`}
          >
            <span className="relative z-10 flex items-center gap-2 text-[13px] sm:text-[18px] md:text-base lg:text-lg">
              {t("fleetCta")}
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
                →
              </span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
