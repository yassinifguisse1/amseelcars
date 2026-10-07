import type { Metadata } from "next";
import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import Script from "next/script";
import { getLocale, getTranslations } from "next-intl/server";
import { generateLocalSeoLandingGraphSchema } from "@/lib/schemas";
import { localizedAlternates } from "@/lib/seo/localized-alternates";
import { buildPageMetadata } from "@/lib/seo/site-meta";
import { routing } from "@/i18n/routing";
import {
  LOCALE_SHORT_LABELS,
  localeToLanguageTag,
  localeToOpenGraphLocale,
  toAppLocale,
} from "@/i18n/locale-utils";
import { getPathname } from "@/i18n/navigation";
import { getAllCars } from "@/data/cars";
import { carForLocale } from "@/lib/carLocale";
import { carBrandScopedHref } from "@/lib/carPublicHref";
import { carSlugForLocale } from "@/lib/carSlugLocale";
import { DestinationAeoLanding } from "@/components/Landing/DestinationAeoLanding";
import { HomeBookingSearchBar } from "@/components/home/HomeBookingSearchBar";
import { reviews } from "@/data/reviews";

const TAGHAZOUT_HERO_IMAGE = "/images/taghazout-hero.webp";

type FaqContent = { question: string; answer: string };
type KeyFactContent = { term: string; value: string };
type StatContent = { label: string; value: string; helper: string };
type HighlightContent = { title: string; body: string };
type FeatureContent = { title: string; description: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l = toAppLocale(locale);
  const t = await getTranslations({ locale: l, namespace: "landingTaghazoutPage" });
  const path = getPathname({ locale: l, href: "/taghazout-car-rental" });
  const title = t("meta.title");
  const imageAlt = t("hero.imageAlt");

  return buildPageMetadata({
    title,
    description: t("meta.description"),
    path,
    localeOg: localeToOpenGraphLocale(l),
    alternates: localizedAlternates(l, "/taghazout-car-rental"),
    ogTitle: t("meta.ogTitle"),
    ogDescription: t("meta.ogDescription"),
    imageAlt,
    ogImage: TAGHAZOUT_HERO_IMAGE,
  });
}

export default async function TaghazoutCarRentalPage() {
  const locale = await getLocale();
  const l = toAppLocale(locale);
  const t = await getTranslations({ locale: l, namespace: "landingTaghazoutPage" });
  const tNav = await getTranslations({ locale: l, namespace: "nav" });
  const tFooter = await getTranslations({ locale: l, namespace: "footer" });

  const faqs = t.raw("faqs") as FaqContent[];
  const keyFacts = t.raw("keyFacts.items") as KeyFactContent[];
  const stats = t.raw("stats") as StatContent[];
  const aiHighlights = t.raw("aiHighlights") as HighlightContent[];
  const features = t.raw("features") as FeatureContent[];
  const serviceChips = t.raw("serviceChips") as string[];

  const homePath = getPathname({ locale: l, href: "/" });
  const carsPath = getPathname({ locale: l, href: "/cars" });
  const airportPath = getPathname({ locale: l, href: "/agadir-airport-car-rental" });
  const contactPath = getPathname({ locale: l, href: "/contact" });
  const selfPath = getPathname({ locale: l, href: "/taghazout-car-rental" });
  const inLanguage = localeToLanguageTag(l);
  const waPrefill = encodeURIComponent(tFooter("whatsappPrefill"));

  const relatedPages = [
    { label: t("relatedPages.city"), href: getPathname({ locale: l, href: "/location-voiture-agadir" }) },
    { label: t("relatedPages.airport"), href: airportPath },
    { label: t("relatedPages.contact"), href: contactPath },
  ];

  const featuredReviews = reviews.slice(0, 2).map((r) => ({
    author: r.author.name,
    body: r.reviewBody.length > 180 ? `${r.reviewBody.slice(0, 177).trim()}…` : r.reviewBody,
    rating: r.rating,
  }));

  const structuredData = generateLocalSeoLandingGraphSchema({
    path: selfPath,
    name: t("schema.name"),
    description: t("schema.description"),
    inLanguage,
    breadcrumbItems: [
      { name: tNav("home"), url: homePath },
      { name: tNav("cars"), url: carsPath },
      { name: t("schema.breadcrumbName"), url: selfPath },
    ],
    faqs: [...faqs],
    primaryImagePath: TAGHAZOUT_HERO_IMAGE,
    service: {
      name: t("schema.serviceName"),
      description: t("schema.serviceDescription"),
    },
    serviceAreaServed: [
      { "@type": "City", name: "Taghazout" },
      { "@type": "City", name: "Agadir" },
      { "@type": "Airport", name: "Agadir-Al Massira Airport" },
      { "@type": "Country", name: "Morocco" },
    ],
  });

  const cars = getAllCars().map((car) => {
    const c = carForLocale(car, l);
    const localizedSlug = carSlugForLocale(car.slug, l);
    const href = getPathname({ locale: l, href: carBrandScopedHref(car.brand, localizedSlug) });
    return {
      name: c.carName,
      image: c.carImage,
      imageAlt: t("carsSection.cardImageAlt", { name: c.carName }),
      imageTitle: t("carsSection.cardImageTitle", { name: c.carName }),
      imageCaption: t("carsSection.cardCaption"),
      href,
      badge: `${car.brand} ${car.model}`,
    };
  });

  return (
    <>
      <Script
        id={`ld-json-taghazout-landing-${l}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <DestinationAeoLanding
        variant="coast"
        languageSwitcher={
          <>
            {routing.locales.map((targetLocale, index) => {
              const label = LOCALE_SHORT_LABELS[targetLocale];
              return (
                <span key={targetLocale}>
                  {index > 0 ? <span aria-hidden>·</span> : null}
                  {targetLocale === l ? (
                    <span>{label}</span>
                  ) : (
                    <Link href="/taghazout-car-rental" locale={targetLocale}>
                      {label}
                    </Link>
                  )}
                </span>
              );
            })}
          </>
        }
        hero={{
          eyebrow: t("hero.eyebrow"),
          title: t.rich("hero.title", {
            muted: (chunks) => <span className="text-white/55">{chunks}</span>,
          }),
          lead: t("hero.lead"),
          meta: t("hero.meta"),
        }}
        heroVisual={{
          src: TAGHAZOUT_HERO_IMAGE,
          alt: t("hero.imageAlt"),
        }}
        quickAnswer={t("quickAnswer")}
        keyFactsTitle={t("keyFacts.title")}
        keyFacts={keyFacts}
        relatedPagesLabel={t("relatedPages.label")}
        relatedPages={relatedPages}
        trustSection={{
          title: t("trust.title"),
          body: t("trust.body"),
          company: t("trust.company"),
          address: t("trust.address"),
          phoneLabel: t("trust.phoneLabel"),
          phoneHref: "tel:+212662500181",
          whatsappLabel: t("trust.whatsappLabel"),
          whatsappHref: `https://wa.me/212662500181/?text=${waPrefill}`,
          emailLabel: t("trust.emailLabel"),
          emailHref: "mailto:amseelcars5@gmail.com",
          contactLabel: t("trust.contactLabel"),
          contactHref: contactPath,
          reviewsTitle: t("trust.reviewsTitle"),
          reviews: featuredReviews,
        }}
        operationsSection={{
          kicker: t("operations.kicker"),
          title: t("operations.title"),
          lead: t("operations.lead"),
        }}
        aiPanel={{
          badge: t("aiPanel.badge"),
          title: t("aiPanel.title"),
        }}
        serviceChips={serviceChips}
        stats={stats}
        aiHighlights={aiHighlights}
        features={features}
        carsSection={{
          kicker: t("carsSection.kicker"),
          title: t("carsSection.title"),
          lead: t("carsSection.lead"),
        }}
        cars={cars}
        faqs={faqs}
        faqKicker={t("faqKicker")}
        faqTitle={t("faqTitle")}
        fleetCtaLabel={t("fleetCtaLabel")}
        carOpenHint={t("carOpenHint")}
        ctas={{
          primary: {
            label: t("ctas.primary"),
            href: "https://wa.me/212662500181",
            variant: "primary",
            external: true,
          },
          secondary: { label: t("ctas.secondary"), href: carsPath, variant: "secondary" },
          tertiary: { label: t("ctas.tertiary"), href: airportPath, variant: "ghost" },
        }}
        fleetHref={carsPath}
        bookingSearch={
          <Suspense fallback={<div className="w-full px-4 py-8" aria-hidden />}>
            <HomeBookingSearchBar className="bg-transparent px-0 py-0 sm:px-0 sm:py-0" />
          </Suspense>
        }
      />
    </>
  );
}
