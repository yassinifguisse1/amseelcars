"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getAllCars } from "@/data/cars";
import { brandToSlug } from "@/lib/brandSlug";

type BrowseHref =
  | "/location-voiture-agadir"
  | "/agadir-airport-car-rental"
  | "/taghazout-car-rental"
  | "/cars"
  | "/contact";

type LocationLink = { label: string; href: BrowseHref };
type VehicleTypeLink = { label: string; category: string };
type StatItem = { value: string; label: string };

/**
 * Internal links hub — same black/white/red template as VehicleTypes / Destinations.
 * Crawlable links to landings, categories, and brand hubs.
 */
export function HomeBrowseServicesSection() {
  const t = useTranslations("home.browseServices");

  const locations = (t.raw("locations") as LocationLink[]) ?? [];
  const vehicleTypes = (t.raw("vehicleTypes") as VehicleTypeLink[]) ?? [];
  const stats = (t.raw("stats") as StatItem[] | undefined) ?? [];

  const brandLinks = useMemo(() => {
    const cars = getAllCars();
    const names = Array.from(new Set(cars.map((c) => c.brand))).sort((a, b) =>
      a.localeCompare(b, "fr", { sensitivity: "base" }),
    );
    return names.map((name) => ({
      name,
      slug: brandToSlug(name),
    }));
  }, []);

  const spotlightBrands = brandLinks.slice(0, 4);
  const primarySpotlight = spotlightBrands[0];

  return (
    <motion.section
      className="relative overflow-hidden bg-black py-20 text-white md:py-28 lg:py-32"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
      aria-labelledby="browse-services-heading"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        {/* Header — matches VehicleTypes / Destinations */}
        <div className="mx-auto max-w-[48rem] text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#FF6B81]">
            {t("kicker")}
          </p>
          <h2
            id="browse-services-heading"
            className="mt-4 font-heading text-balance text-[clamp(1.75rem,4.2vw,3.25rem)] font-semibold leading-[1.15] text-white"
          >
            {t("title")}
          </h2>
          <p className="mx-auto mt-5 max-w-[42rem] text-pretty text-base leading-[1.7] text-white/70 md:mt-6 md:text-lg md:leading-[1.75]">
            {t("subtitle")}
          </p>
        </div>

        {stats.length ? (
          <ul className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-4 border-y border-white/10 py-6 md:mt-14">
            {stats.map((stat) => (
              <li key={stat.label} className="flex items-baseline gap-2.5 text-center">
                <span className="text-2xl font-semibold text-white md:text-3xl">
                  {stat.value}
                </span>
                <span className="text-left text-xs uppercase tracking-wide text-white/70 md:text-sm">
                  {stat.label}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:mt-10">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full bg-[#CB1939] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a0142e]"
          >
            {t("primaryCta")}
          </Link>
          <Link
            href="/cars"
            className="inline-flex items-center justify-center rounded-full border-2 border-white/80 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            {t("secondaryCta")}
          </Link>
        </div>

        {/* Link grids — same card language as vehicle types */}
        <div className="mt-14 grid gap-6 md:mt-16 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          <nav
            aria-labelledby="browse-locations-heading"
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-white/20 lg:p-7"
          >
            <h3
              id="browse-locations-heading"
              className="text-lg font-semibold text-white lg:text-xl"
            >
              {t("panels.locationsHeading")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              {t("panels.locationsCopy")}
            </p>
            <ul className="mt-6 space-y-1">
              {locations.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="group flex items-center justify-between gap-3 border-b border-white/10 py-3 text-sm text-white/85 transition last:border-0 hover:text-[#FF6B81]"
                  >
                    <span>{item.label}</span>
                    <span
                      className="text-[#FF6B81] opacity-0 transition group-hover:opacity-100"
                      aria-hidden
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav
            aria-labelledby="browse-categories-heading"
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-white/20 lg:p-7"
          >
            <h3
              id="browse-categories-heading"
              className="text-lg font-semibold text-white lg:text-xl"
            >
              {t("panels.vehicleTypesHeading")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              {t("panels.vehicleTypesCopy")}
            </p>
            <ul className="mt-6 space-y-1">
              {vehicleTypes.map((item) => (
                <li key={item.label}>
                  <Link
                    href={{ pathname: "/cars", query: { category: item.category } }}
                    className="group flex items-center justify-between gap-3 border-b border-white/10 py-3 text-sm text-white/85 transition last:border-0 hover:text-[#FF6B81]"
                  >
                    <span>{item.label}</span>
                    <span
                      className="text-[#FF6B81] opacity-0 transition group-hover:opacity-100"
                      aria-hidden
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav
            aria-labelledby="browse-brands-heading"
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-white/20 md:col-span-2 lg:col-span-1 lg:p-7"
          >
            <h3
              id="browse-brands-heading"
              className="text-lg font-semibold text-white lg:text-xl"
            >
              {t("panels.brandsHeading")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              {t("panels.brandsCopy")}
            </p>
            <ul className="mt-6 grid gap-x-4 sm:grid-cols-2 lg:grid-cols-1">
              {brandLinks.map(({ name, slug }) => (
                <li key={name}>
                  <Link
                    href={{
                      pathname: "/cars/brand/[brandSlug]",
                      params: { brandSlug: slug },
                    }}
                    className="group flex items-center justify-between gap-3 border-b border-white/10 py-3 text-sm text-white/85 transition last:border-0 hover:text-[#FF6B81]"
                  >
                    <span>{t("brandLinkLabel", { brand: name })}</span>
                    <span
                      className="text-[#FF6B81] opacity-0 transition group-hover:opacity-100"
                      aria-hidden
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Spotlight — quiet close, same palette */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-8 text-center md:mt-10 md:px-10 md:py-10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/70">
            {t("brandSpotlightLabel")}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {spotlightBrands.map(({ name, slug }) => (
              <Link
                key={name}
                href={{
                  pathname: "/cars/brand/[brandSlug]",
                  params: { brandSlug: slug },
                }}
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90 transition hover:border-[#CB1939] hover:text-[#FF6B81]"
              >
                {name}
              </Link>
            ))}
          </div>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/60">
            {t("brandSpotlightCopy")}
          </p>
          <Link
            href={
              primarySpotlight
                ? {
                    pathname: "/cars/brand/[brandSlug]",
                    params: { brandSlug: primarySpotlight.slug },
                  }
                : "/cars"
            }
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#FF6B81] transition hover:underline"
          >
            {t("brandSpotlightCta")}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
