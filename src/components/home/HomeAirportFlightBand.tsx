"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

/**
 * Wide cinematic airport/flight band between main intro and airport SEO blocks.
 * Plane reads right → left to suggest arrival into Agadir.
 */
export function HomeAirportFlightBand() {
  const t = useTranslations("home.airport");

  return (
    <section
      className="relative w-full overflow-hidden bg-[#e8eef5]"
      aria-label={t("flightBandAlt")}
    >
      <div className="relative h-[min(28vh,11rem)] w-full sm:h-[min(32vh,14rem)] md:h-[min(36vh,16rem)] lg:h-[min(38vh,18rem)]">
        <Image
          src="/images/airport-flight-band-agadir.webp"
          alt={t("flightBandAlt")}
          fill
          sizes="100vw"
          className="object-cover object-[center_42%]"
          priority={false}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-black/10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-gray-200/80 to-transparent sm:h-12"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#f7f5f2]/90 to-transparent sm:h-12"
          aria-hidden
        />
      </div>
    </section>
  );
}
