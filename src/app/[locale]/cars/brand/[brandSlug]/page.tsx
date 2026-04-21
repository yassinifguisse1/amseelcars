import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Script from "next/script";
import { getLocale, getTranslations } from "next-intl/server";
import { Link, getPathname } from "@/i18n/navigation";
import { getAllCars } from "@/data/cars";
import { carForLocale } from "@/lib/carLocale";
import { carSlugForLocale } from "@/lib/carSlugLocale";
import {
  brandToSlug,
  getFleetBrandNamesSorted,
  resolveBrandFromSlug,
} from "@/lib/brandSlug";
import { carBrandScopedHref } from "@/lib/carPublicHref";
import { generateBreadcrumbSchema } from "@/lib/schemas";
import { localizedAlternates } from "@/lib/seo/localized-alternates";
import type { AppLocale } from "@/i18n/routing";
import Footer from "@/components/Footer/Footer";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://amseelcars.com";

type Props = { params: Promise<{ brandSlug: string }> };

type InsightPoint = { title: string; body: string };
type FaqEntry = { question: string; answer: string };

type FaqContent = {
  heading?: string;
  note?: string;
  ctaLabel?: string;
  items?: FaqEntry[];
};

type InsightsContent = {
  heading?: string;
  eyebrow?: string;
  sidebarTitle?: string;
  sidebarBody?: string;
  sidebarCta?: string;
  items?: InsightPoint[];
};

const replaceBrandToken = (value: string | undefined, brand: string) =>
  value ? value.replaceAll("{brand}", brand) : "";

export function generateStaticParams() {
  return getFleetBrandNamesSorted().map((name) => ({
    brandSlug: brandToSlug(name),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandSlug } = await params;
  const locale = await getLocale();
  const l: AppLocale = locale === "en" ? "en" : "fr";
  const brands = getFleetBrandNamesSorted();
  const brand = resolveBrandFromSlug(brandSlug, brands);
  const t = await getTranslations({ locale: l, namespace: "seo.brandHub" });

  if (!brand) {
    return {
      title: t("notFoundTitle"),
      description: t("notFoundDescription"),
      robots: { index: false, follow: false },
    };
  }

  const href = {
    pathname: "/cars/brand/[brandSlug]" as const,
    params: { brandSlug: brandToSlug(brand) },
  };

  return {
    title: t("title", { brand }),
    description: t("description", { brand }),
    alternates: localizedAlternates(l, href),
    openGraph: {
      title: t("title", { brand }),
      description: t("description", { brand }),
    },
  };
}

export default async function CarBrandHubPage({ params }: Props) {
  const { brandSlug } = await params;
  const locale = await getLocale();
  const l: AppLocale = locale === "en" ? "en" : "fr";
  const brands = getFleetBrandNamesSorted();
  const brand = resolveBrandFromSlug(brandSlug, brands);

  if (!brand) {
    notFound();
  }

  const t = await getTranslations({ locale: l, namespace: "brandHubPage" });
  const tNav = await getTranslations({ locale: l, namespace: "nav" });
  const cars = getAllCars()
    .filter((c) => c.brand === brand)
    .sort((a, b) => a.carName.localeCompare(b.carName, l, { sensitivity: "base" }));

  const homePath = getPathname({ locale: l, href: "/" });
  const fleetPath = getPathname({ locale: l, href: "/cars" });
  const brandPath = getPathname({
    locale: l,
    href: {
      pathname: "/cars/brand/[brandSlug]",
      params: { brandSlug: brandToSlug(brand) },
    },
  });
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: tNav("home"), url: homePath },
    { name: tNav("cars"), url: fleetPath },
    { name: brand, url: brandPath },
  ]);

  const currencyFormatter = new Intl.NumberFormat(l === "fr" ? "fr-FR" : "en-US", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  });

  const averageRating = cars.length
    ? cars.reduce((acc, car) => acc + (car.rating ?? 0), 0) / cars.length
    : 0;
  const lowestDailyRate = cars.length
    ? Math.min(...cars.map((car) => car.pricing?.shortTerm ?? car.pricePerDay))
    : 0;
  const newestModelYear = cars.length ? Math.max(...cars.map((car) => car.year)) : 0;
  const fuelMix = Array.from(new Set(cars.map((car) => car.fuelType.toLowerCase())));
  const segments = Array.from(new Set(cars.map((car) => car.category)));

  const metrics = [
    {
      label: t("metrics.models.label"),
      helper: replaceBrandToken(t("metrics.models.helper", { brand }), brand),
      value: t("metrics.models.value", { count: cars.length }),
    },
    {
      label: t("metrics.rating.label"),
      helper: t("metrics.rating.helper", { year: newestModelYear }),
      value: t("metrics.rating.value", { rating: averageRating.toFixed(1) }),
    },
    {
      label: t("metrics.segments.label"),
      helper: t("metrics.segments.helper", { count: segments.length }),
      value: t("metrics.segments.value", { count: segments.length }),
    },
    {
      label: t("metrics.rate.label"),
      helper: t("metrics.rate.helper"),
      value: t("metrics.rate.value", { price: currencyFormatter.format(lowestDailyRate) }),
    },
  ];

  const categoryLabels = (t.raw("categoryLabels") as Record<string, string>) ?? {};
  const chipCategories = segments.map((segment) => ({
    id: segment,
    label: categoryLabels[segment] ?? segment,
  }));

  const insightsRaw = (t.raw("insights") as InsightsContent | undefined) ?? {};
  const insightHeading = replaceBrandToken(insightsRaw.heading, brand) ||
    t("insightsFallbackHeading", { brand });
  const insightEyebrow = replaceBrandToken(insightsRaw.eyebrow, brand);
  const insightItems = (insightsRaw.items ?? []).map((item) => ({
    title: replaceBrandToken(item.title, brand),
    body: replaceBrandToken(item.body, brand),
  }));

  const faqRaw = (t.raw("faq") as FaqContent | undefined) ?? {};
  const faqItems = (faqRaw.items ?? []).map((item) => ({
    question: replaceBrandToken(item.question, brand),
    answer: replaceBrandToken(item.answer, brand),
  }));

  const faqSchema = faqItems.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((entry) => ({
          "@type": "Question",
          name: entry.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: entry.answer,
          },
        })),
      }
    : null;

  const itemListSchema = cars.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: t("itemListName", { brand }),
        itemListElement: cars.map((car, index) => {
          const slug = carSlugForLocale(car.slug, l);
          const carPath = getPathname({
            locale: l,
            href: carBrandScopedHref(car.brand, slug),
          });
          return {
            "@type": "ListItem",
            position: index + 1,
            name: car.carName,
            url: new URL(carPath, BASE_URL).toString(),
          };
        }),
      }
    : null;
  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t("h1", { brand }),
    description: t("intro", { brand }),
    url: new URL(brandPath, BASE_URL).toString(),
    isPartOf: { "@id": "https://www.amseelcars.com#website" },
    mainEntity: itemListSchema
      ? { "@id": `https://www.amseelcars.com${brandPath}#itemlist` }
      : undefined,
  };
  const brandServiceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `https://www.amseelcars.com${brandPath}#service`,
    name: l === "en" ? `${brand} car rental in Agadir` : `Location ${brand} a Agadir`,
    description:
      l === "en"
        ? `Rent ${brand} models in Agadir with airport or city pickup and WhatsApp booking support.`
        : `Louez des modeles ${brand} a Agadir avec retrait aeroport ou centre-ville et reservation WhatsApp.`,
    provider: { "@id": "https://www.amseelcars.com#business" },
    areaServed: [
      { "@type": "City", name: "Agadir" },
      { "@type": "Airport", name: "Agadir-Al Massira Airport" },
      { "@type": "Country", name: "Morocco" },
    ],
    url: new URL(brandPath, BASE_URL).toString(),
    inLanguage: l === "en" ? "en-US" : "fr-MA",
  };
  const quickAnswer = l === "en"
    ? `${brand} rentals in Agadir are available across multiple models with clear daily pricing, airport/city pickup, and fast WhatsApp booking.`
    : `La location ${brand} a Agadir est disponible sur plusieurs modeles avec prix journalier clair, retrait aeroport/ville et reservation rapide par WhatsApp.`;
  const keyFacts = [
    {
      label: l === "en" ? "Models available" : "Modeles disponibles",
      value: `${cars.length}`,
    },
    {
      label: l === "en" ? "Lowest daily rate" : "Tarif journalier mini",
      value: currencyFormatter.format(lowestDailyRate),
    },
    {
      label: l === "en" ? "Fuel mix" : "Mix carburant",
      value: fuelMix.length ? fuelMix.join(", ") : (l === "en" ? "Mixed" : "Mixte"),
    },
  ];

  return (
    <>
      <Script
        id={`ld-json-breadcrumb-brand-${brandToSlug(brand)}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema ? (
        <Script
          id={`ld-json-faq-brand-${brandToSlug(brand)}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}
      {itemListSchema ? (
        <Script
          id={`ld-json-itemlist-brand-${brandToSlug(brand)}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              ...itemListSchema,
              "@id": `https://www.amseelcars.com${brandPath}#itemlist`,
            }),
          }}
        />
      ) : null}
      <Script
        id={`ld-json-collection-brand-${brandToSlug(brand)}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <Script
        id={`ld-json-service-brand-${brandToSlug(brand)}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandServiceSchema) }}
      />

      <section
        className="relative isolate overflow-hidden bg-[#f9f9f9] pb-16 pt-10 text-neutral-900 md:pb-24 md:pt-16"
        aria-labelledby="brand-hero"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(177,18,38,0.14),_transparent_58%)]" />
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <nav aria-label={t("breadcrumbAria")} className="text-sm text-neutral-600">
            <ol className="flex flex-wrap gap-x-1.5 gap-y-1">
              <li>
                <Link href="/" className="hover:text-neutral-900 hover:underline">
                  {tNav("home")}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/cars" className="hover:text-neutral-900 hover:underline">
                  {tNav("cars")}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="font-medium text-neutral-900">{brand}</li>
            </ol>
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <header>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#b11226]">
                {t("heroKicker")}
              </p>
              <h1
                id="brand-hero"
                className="mt-4 text-balance text-4xl font-semibold tracking-tight text-neutral-950 md:text-[2.75rem]"
              >
                {t("h1", { brand })}
              </h1>
              <p className="mt-5 text-pretty text-base leading-relaxed text-neutral-700 md:text-lg">
                {t("intro", { brand })}
              </p>
              <p className="mt-4 text-sm text-neutral-600 md:text-base">
                {t("heroSupporting", { brand })}
              </p>
              <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b11226]">
                  {l === "en" ? "Quick answer" : "Reponse rapide"}
                </p>
                <p className="mt-2 text-sm text-neutral-700">{quickAnswer}</p>
                <dl className="mt-4 grid gap-2 sm:grid-cols-3">
                  {keyFacts.map((fact) => (
                    <div key={fact.label} className="rounded-lg border border-neutral-100 bg-neutral-50 p-2.5">
                      <dt className="text-[11px] uppercase tracking-[0.15em] text-neutral-500">{fact.label}</dt>
                      <dd className="mt-0.5 text-sm font-semibold text-neutral-900">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              {chipCategories.length ? (
                <div className="mt-8 flex flex-wrap gap-2" aria-label={t("segmentsEyebrow", { brand })}>
                  {chipCategories.map((chip) => (
                    <span
                      key={chip.id}
                      className="rounded-full border border-neutral-200/70 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-neutral-700 shadow-sm"
                    >
                      {chip.label}
                    </span>
                  ))}
                </div>
              ) : null}
            </header>

            <div className="rounded-3xl border border-neutral-200/60 bg-white/80 p-6 shadow-[0_20px_70px_-45px_rgba(0,0,0,0.5)]">
              <dl className="grid gap-5 sm:grid-cols-2">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-neutral-100/80 bg-neutral-50/80 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                      {metric.label}
                    </dt>
                    <dd className="mt-2 text-2xl font-semibold text-neutral-950">{metric.value}</dd>
                    <p className="mt-1 text-sm text-neutral-600">{metric.helper}</p>
                  </div>
                ))}
              </dl>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex flex-1 items-center justify-center rounded-2xl bg-[#b11226] px-5 py-3 text-center text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#7a0f18]"
                >
                  {t("primaryCta", { brand })}
                </Link>
                <Link
                  href="/cars"
                  className="inline-flex flex-1 items-center justify-center rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-center text-sm font-semibold uppercase tracking-[0.2em] text-neutral-900 hover:border-neutral-400"
                >
                  {t("secondaryCta")}
                </Link>
              </div>
              <p className="mt-3 text-center text-xs text-neutral-500">
                {t("ctaHelper", { brand })}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20" aria-labelledby="brand-fleet-heading">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b11226]">
                {t("fleetEyebrow")}
              </p>
              <h2 id="brand-fleet-heading" className="mt-2 text-3xl font-semibold text-neutral-950">
                {t("fleetHeading", { brand })}
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-neutral-600 md:text-base">
                {t("collectionIntro", { brand })}
              </p>
            </div>
            <div className="text-sm text-neutral-600">
              {t("fleetHelper", { count: cars.length })}
            </div>
          </div>

          <ul className="mt-10 grid gap-6 md:grid-cols-2">
            {cars.map((car) => {
              const display = carForLocale(car, l);
              const slug = carSlugForLocale(car.slug, l);
              const price = car.pricing?.shortTerm ?? car.pricePerDay;
              const formattedPrice = currencyFormatter.format(price);
              return (
                <li key={car.slug}>
                  <Link
                    href={carBrandScopedHref(car.brand, slug)}
                    className="group flex h-full flex-col rounded-[1.75rem] border border-neutral-200 bg-white/80 p-4 shadow-[0_20px_45px_-35px_rgba(0,0,0,0.7)] transition hover:-translate-y-1 hover:border-neutral-300"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.25rem] bg-neutral-100">
                      <Image
                        src={car.carImage}
                        alt={display.carName}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={false}
                      />
                      <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-full bg-white/80 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-800">
                        <span>
                          {car.year} · {brand}
                        </span>
                        <span>{t("viewCar")}</span>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-1 flex-col">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
                        {brand} · {car.model}
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-neutral-950">{display.carName}</p>
                      <p className="mt-3 text-sm text-neutral-600">
                        {display.description}
                      </p>
                      <dl className="mt-4 grid grid-cols-3 gap-3 text-xs font-medium text-neutral-600">
                        <div className="rounded-2xl border border-neutral-200 px-3 py-2 text-center">
                          <dt className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
                            {t("card.seats")}
                          </dt>
                          <dd className="mt-1 text-base font-semibold text-neutral-900">{car.seats}</dd>
                        </div>
                        <div className="rounded-2xl border border-neutral-200 px-3 py-2 text-center">
                          <dt className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
                            {t("card.transmission")}
                          </dt>
                          <dd className="mt-1 text-base font-semibold text-neutral-900">{car.transmission}</dd>
                        </div>
                        <div className="rounded-2xl border border-neutral-200 px-3 py-2 text-center">
                          <dt className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
                            {t("card.fuel")}
                          </dt>
                          <dd className="mt-1 text-base font-semibold text-neutral-900">{car.fuelType}</dd>
                        </div>
                      </dl>
                      <div className="mt-5 flex items-center justify-between border-t border-dashed border-neutral-200 pt-4 text-sm text-neutral-700">
                        <span>
                          {t("card.fromPrice", { price: formattedPrice })}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b11226]">
                          {t("card.deliveryLabel")}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="bg-[#f4f4f4] py-16 md:py-20" aria-labelledby="brand-insights-heading">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-neutral-200 bg-white/70 p-6">
              {insightEyebrow ? (
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b11226]">
                  {insightEyebrow}
                </p>
              ) : null}
              <h2 id="brand-insights-heading" className="mt-2 text-3xl font-semibold text-neutral-950">
                {insightHeading}
              </h2>
              <ul className="mt-6 space-y-4">
                {insightItems.map((item) => (
                  <li key={item.title} className="rounded-2xl border border-neutral-100 bg-neutral-50/70 p-4">
                    <p className="text-base font-semibold text-neutral-900">{item.title}</p>
                    <p className="mt-2 text-sm text-neutral-600">{item.body}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-5">
              <div className="rounded-[2rem] border border-[#b11226]/40 bg-gradient-to-br from-[#b11226] via-[#810c19] to-[#190205] p-6 text-white shadow-[0_35px_90px_-50px_rgba(177,18,38,0.85)]">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                  {replaceBrandToken(insightsRaw.sidebarTitle, brand)}
                </p>
                <p className="mt-3 text-lg leading-relaxed text-white/90">
                  {replaceBrandToken(insightsRaw.sidebarBody, brand)}
                </p>
                <Link
                  href="/contact"
                  className="mt-6 inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-white/10"
                >
                  {replaceBrandToken(insightsRaw.sidebarCta, brand) || t("primaryCta", { brand })}
                </Link>
              </div>
              <div className="rounded-[2rem] border border-neutral-200 bg-white/80 p-6">
                <p className="text-sm text-neutral-600">
                  {t("fuelMixLabel", { fuels: fuelMix.join(", ") })}
                </p>
                <p className="mt-4 text-2xl font-semibold text-neutral-950">
                  {t("newestModelLabel", { year: newestModelYear })}
                </p>
                <p className="mt-2 text-sm text-neutral-600">
                  {t("supportingDelivery")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {faqItems.length ? (
        <section className="bg-white py-16 md:py-20" aria-labelledby="brand-faq-heading">
          <div className="mx-auto max-w-4xl px-4 md:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b11226]">
              {t("faqEyebrow")}
            </p>
            <h2 id="brand-faq-heading" className="mt-2 text-3xl font-semibold text-neutral-950">
              {replaceBrandToken(faqRaw.heading, brand)}
            </h2>
            {faqRaw.note ? (
              <p className="mt-3 text-sm text-neutral-600">
                {replaceBrandToken(faqRaw.note, brand)}
              </p>
            ) : null}
            <div className="mt-8 space-y-4">
              {faqItems.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-2xl border border-neutral-200 bg-neutral-50/70 p-5"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-semibold text-neutral-900">
                    {item.question}
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b11226]">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
            {faqRaw.ctaLabel ? (
              <p className="mt-6 text-sm text-neutral-600">
                <Link href="/contact" className="font-semibold text-[#b11226] underline">
                  {faqRaw.ctaLabel}
                </Link>
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      <Footer />
    </>
  );
}
