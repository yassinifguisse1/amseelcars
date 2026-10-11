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
import {
  BUSINESS_MAILTO,
  BUSINESS_TELEPHONE_E164,
  BUSINESS_WHATSAPP_URL,
} from "@/lib/business";
import { convertCarPrice, formatCarPriceLabel } from "@/lib/currency";
import { reviews } from "@/data/reviews";
import { blogIndexPath } from "@/lib/seo/blog-paths";

const AIRPORT_HERO_IMAGE = "/images/aeroport-agadir-al-massira-aga.webp";

type FaqContent = { question: string; answer: string };
type KeyFactContent = { term: string; value: string };
type StatContent = { label: string; value: string; helper: string };
type HighlightContent = { title: string; body: string };
type FeatureContent = { title: string; description: string };
type GuideBlockContent = {
  kicker: string;
  title: string;
  lead: string;
  items: FeatureContent[];
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l = toAppLocale(locale);
  const t = await getTranslations({ locale: l, namespace: "landingAgadirAirportPage" });
  const path = getPathname({ locale: l, href: "/agadir-airport-car-rental" });
  const title = t("meta.title");

  return buildPageMetadata({
    title,
    description: t("meta.description"),
    path,
    localeOg: localeToOpenGraphLocale(l),
    alternates: localizedAlternates(l, "/agadir-airport-car-rental"),
    ogTitle: t("meta.ogTitle"),
    ogDescription: t("meta.ogDescription"),
    imageAlt: t("hero.imageAlt"),
    ogImage: AIRPORT_HERO_IMAGE,
  });
}

export default async function AgadirAirportCarRentalPage() {
  const locale = await getLocale();
  const l = toAppLocale(locale);
  const t = await getTranslations({ locale: l, namespace: "landingAgadirAirportPage" });
  const tNav = await getTranslations({ locale: l, namespace: "nav" });
  const tFooter = await getTranslations({ locale: l, namespace: "footer" });

  const faqs = t.raw("faqs") as FaqContent[];
  const keyFacts = t.raw("keyFacts.items") as KeyFactContent[];
  const stats = t.raw("stats") as StatContent[];
  const aiHighlights = t.raw("aiHighlights") as HighlightContent[];
  const features = t.raw("features") as FeatureContent[];
  const serviceChips = t.raw("serviceChips") as string[];
  const pickupGuide = t.raw("pickupGuide") as GuideBlockContent;
  const pricingGuide = t.raw("pricingGuide") as GuideBlockContent;

  const homePath = getPathname({ locale: l, href: "/" });
  const carsPath = getPathname({ locale: l, href: "/cars" });
  const contactPath = getPathname({ locale: l, href: "/contact" });
  const selfPath = getPathname({ locale: l, href: "/agadir-airport-car-rental" });
  const inLanguage = localeToLanguageTag(l);
  const waPrefill = encodeURIComponent(tFooter("whatsappPrefill"));

  const relatedPages = [
    { label: t("relatedPages.city"), href: getPathname({ locale: l, href: "/location-voiture-agadir" }) },
    { label: t("relatedPages.taghazout"), href: getPathname({ locale: l, href: "/taghazout-car-rental" }) },
    { label: t("relatedPages.blog"), href: blogIndexPath(l) },
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
    primaryImagePath: AIRPORT_HERO_IMAGE,
    service: {
      name: t("schema.serviceName"),
      description: t("schema.serviceDescription"),
    },
  });

  const cars = getAllCars().map((car) => {
    const c = carForLocale(car, l);
    const localizedSlug = carSlugForLocale(car.slug, l);
    const href = getPathname({ locale: l, href: carBrandScopedHref(car.brand, localizedSlug) });
    const dailyEur = convertCarPrice(car.pricing?.shortTerm ?? car.pricePerDay, "EUR");
    return {
      name: c.carName,
      image: c.carImage,
      imageAlt: t("carsSection.cardImageAlt", { name: c.carName }),
      imageTitle: t("carsSection.cardImageTitle", { name: c.carName }),
      imageCaption: t("carsSection.cardCaption", {
        price: formatCarPriceLabel(dailyEur, "EUR"),
        seats: car.seats,
      }),
      href,
      badge: `${car.brand} ${car.model}`,
    };
  });

  return (
    <>
      <Script
        id={`ld-json-agadir-landing-airport-${l}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <DestinationAeoLanding
        variant="airport"
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
                    <Link href="/agadir-airport-car-rental" locale={targetLocale}>
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
            muted: (chunks) => <span className="text-white/50">{chunks}</span>,
          }),
          lead: t("hero.lead"),
          meta: t("hero.meta"),
        }}
        heroVisual={{
          src: AIRPORT_HERO_IMAGE,
          alt: t("hero.imageAlt"),
        }}
        visualBand={{
          src: "/images/airport-flight-band-agadir.webp",
          alt: t("hero.imageAlt"),
          caption: t("visualBandCaption"),
        }}
        introVisual={{
          src: "/images/Kia-sportage-gris-clair-face-card-amseel-agadir.webp",
          alt: t("introVisualAlt"),
        }}
        trustVisual={{
          src: AIRPORT_HERO_IMAGE,
          alt: t("trustVisualAlt"),
        }}
        quickAnswer={t("quickAnswer")}
        keyFactsTitle={t("keyFacts.title")}
        keyFacts={keyFacts}
        relatedPagesLabel={t("relatedPages.label")}
        relatedPages={relatedPages}
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
        guideSections={[pickupGuide, pricingGuide]}
        trustSection={{
          title: t("trust.title"),
          body: t("trust.body"),
          company: t("trust.company"),
          address: t("trust.address"),
          phoneLabel: t("trust.phoneLabel"),
          phoneHref: `tel:${BUSINESS_TELEPHONE_E164}`,
          whatsappLabel: t("trust.whatsappLabel"),
          whatsappHref: `${BUSINESS_WHATSAPP_URL}/?text=${waPrefill}`,
          emailLabel: t("trust.emailLabel"),
          emailHref: BUSINESS_MAILTO,
          contactLabel: t("trust.contactLabel"),
          contactHref: contactPath,
          reviewsTitle: t("trust.reviewsTitle"),
          reviews: featuredReviews,
        }}
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
            href: BUSINESS_WHATSAPP_URL,
            variant: "primary",
            external: true,
          },
          secondary: { label: t("ctas.secondary"), href: carsPath, variant: "secondary" },
          tertiary: { label: t("ctas.tertiary"), href: BUSINESS_MAILTO, variant: "ghost", external: true },
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
