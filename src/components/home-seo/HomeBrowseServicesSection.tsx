"use client";

import { useMemo, type ReactNode } from "react";
import { Car, ChevronRight, MapPin, Sparkles, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getAllCars } from "@/data/cars";
import { brandToSlug } from "@/lib/brandSlug";
import { cn } from "@/lib/utils";

type BrowseHref =
  | "/location-voiture-agadir"
  | "/agadir-airport-car-rental"
  | "/taghazout-car-rental"
  | "/cars"
  | "/contact";

type LocationLink = { label: string; href: BrowseHref };
type VehicleTypeLink = { label: string; category: string };
type StatItem = { value: string; label: string };

type PanelProps = {
  icon: typeof MapPin;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

const linkChipClass =
  "group inline-flex min-h-[2.75rem] items-center justify-between gap-2 rounded-full border border-white/40 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-900 shadow-[0_18px_45px_-25px_rgba(0,0,0,0.65)] transition duration-300 hover:-translate-y-0.5 hover:border-[#b11226]/50 hover:bg-white/90 hover:text-[#b11226] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b11226] md:text-xs";

function Panel({ icon: Icon, title, description, children, className }: PanelProps) {
  return (
    <div className={cn("rounded-[1.75rem] border border-neutral-200/70 bg-white/80 p-5", className)}>
      <div className="flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#b11226]/10 text-[#b11226]"
          aria-hidden
        >
          <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2.2} />
        </span>
        <div>
          <h3 className="font-heading text-lg font-semibold tracking-tight text-neutral-950">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-sm text-neutral-600">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

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
      className="relative overflow-hidden bg-[#f9f9f9] py-16 text-neutral-900 md:py-24"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      aria-labelledby="browse-services-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(177,18,38,0.18),_transparent_60%)]" />
      <div className="mx-auto max-w-[min(100%,1160px)] px-4 md:px-6">
        <div className="relative rounded-[2.4rem] border border-neutral-200/70 bg-white/90 p-6 shadow-[0_35px_120px_-60px_rgba(0,0,0,0.9)] md:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#b11226]">
                <Car className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden />
                {t("kicker")}
              </p>
              <h2
                id="browse-services-heading"
                className="mt-4 font-heading text-balance text-[1.85rem] font-semibold tracking-tight text-neutral-950 sm:text-[2.25rem]"
              >
                {t("title")}
              </h2>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-neutral-600 md:text-base">
                {t("subtitle")}
              </p>

              {stats.length ? (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-neutral-200/80 bg-neutral-50/70 px-4 py-5"
                    >
                      <p className="text-2xl font-semibold text-neutral-950">{stat.value}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex flex-1 items-center justify-center rounded-[1.5rem] bg-[#b11226] px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-[#7a0f18]"
                >
                  {t("primaryCta")}
                </Link>
                <Link
                  href="/cars"
                  className="inline-flex flex-1 items-center justify-center rounded-[1.5rem] border border-neutral-200 bg-white px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.35em] text-neutral-900 hover:border-neutral-300"
                >
                  {t("secondaryCta")}
                </Link>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Panel
                icon={MapPin}
                title={t("panels.locationsHeading")}
                description={t("panels.locationsCopy")}
              >
                <ul className="flex flex-wrap gap-2.5">
                  {locations.map((item) => (
                    <li key={item.label}>
                      <Link href={item.href} className={linkChipClass}>
                        <span>{item.label}</span>
                        <ChevronRight className="h-3.5 w-3.5 opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-80" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Panel>

              <Panel
                icon={Sparkles}
                title={t("panels.vehicleTypesHeading")}
                description={t("panels.vehicleTypesCopy")}
              >
                <ul className="flex flex-wrap gap-2.5">
                  {vehicleTypes.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={{ pathname: "/cars", query: { category: item.category } }}
                        className={linkChipClass}
                      >
                        <span>{item.label}</span>
                        <ChevronRight className="h-3.5 w-3.5 opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-80" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Panel>

              <Panel
                icon={Tag}
                title={t("panels.brandsHeading")}
                description={t("panels.brandsCopy")}
                className="md:col-span-2"
              >
                <ul className="flex flex-wrap gap-2.5">
                  {brandLinks.map(({ name, slug }) => (
                    <li key={name}>
                      <Link
                        href={{ pathname: "/cars/brand/[brandSlug]", params: { brandSlug: slug } }}
                        className={linkChipClass}
                      >
                        <span>{t("brandLinkLabel", { brand: name })}</span>
                        <ChevronRight className="h-3.5 w-3.5 opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-80" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Panel>

              <div className="md:col-span-2 rounded-[1.75rem] border border-white/15 bg-gradient-to-br from-[#050505] via-[#101010] to-[#1e1e1e] p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
                  {t("brandSpotlightLabel")}
                </p>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {spotlightBrands.map(({ name, slug }) => (
                    <Link
                      key={name}
                      href={{ pathname: "/cars/brand/[brandSlug]", params: { brandSlug: slug } }}
                      className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-white transition hover:border-[#b11226]/60 hover:text-[#b11226]"
                    >
                      {name}
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  ))}
                </div>
                <p className="mt-4 text-sm text-white/80">{t("brandSpotlightCopy")}</p>
                <Link
                  href={
                    primarySpotlight
                      ? {
                          pathname: "/cars/brand/[brandSlug]",
                          params: { brandSlug: primarySpotlight.slug },
                        }
                      : "/cars"
                  }
                  className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/80 hover:text-white"
                >
                  {t("brandSpotlightCta")}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/55">
                  {t("brandSpotlightHelper")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
