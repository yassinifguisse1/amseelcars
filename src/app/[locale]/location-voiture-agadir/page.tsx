import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import Script from "next/script";
import { getLocale, getTranslations } from "next-intl/server";
import { localizedAlternates } from "@/lib/seo/localized-alternates";
import { routing } from "@/i18n/routing";
import {
  LOCALE_SHORT_LABELS,
  localeToLanguageTag,
  localeToOpenGraphLocale,
  toAppLocale,
} from "@/i18n/locale-utils";
import { getPathname } from "@/i18n/navigation";
import { generateLocalSeoLandingGraphSchema } from "@/lib/schemas";
import { getCarBySlug } from "@/data/cars";
import { carForLocale } from "@/lib/carLocale";
import { carBrandScopedHref } from "@/lib/carPublicHref";
import { carSlugForLocale } from "@/lib/carSlugLocale";
import { DestinationAeoLanding } from "@/components/Landing/DestinationAeoLanding";

const siteUrl = "https://www.amseelcars.com";

const FEATURED_SLUGS = [
  "location-voiture-agadir-bmw-x3-pack-m",
  "location-voiture-agadir-t-roc",
  "location-voiture-agadir-sandero-stepway",
] as const;

type FaqContent = {
  question: string;
  answer: string;
};

type KeyFactContent = {
  term: string;
  value: string;
};

type StatContent = {
  label: string;
  value: string;
  helper: string;
};

type HighlightContent = {
  title: string;
  body: string;
};

type FeatureContent = {
  title: string;
  description: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l = toAppLocale(locale);
  const t = await getTranslations({ locale: l, namespace: "locationAgadirPage" });
  const path = getPathname({ locale: l, href: "/location-voiture-agadir" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: localizedAlternates(l, "/location-voiture-agadir"),
    openGraph: {
      type: "website",
      url: `${siteUrl}${path}`,
      siteName: "AmseelCars",
      locale: localeToOpenGraphLocale(l),
      title: t("meta.ogTitle"),
      description: t("meta.ogDescription"),
      images: [{ url: "/og/og-default.jpg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("meta.twitterTitle"),
      description: t("meta.twitterDescription"),
      images: ["/og/og-default.jpg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
  };
}

export default async function LocationVoitureAgadirPage() {
  const locale = await getLocale();
  const l = toAppLocale(locale);
  const t = await getTranslations({ locale: l, namespace: "locationAgadirPage" });
  const tNav = await getTranslations({ locale: l, namespace: "nav" });

  const faqs = t.raw("faqs") as FaqContent[];
  const keyFacts = t.raw("keyFacts.items") as KeyFactContent[];
  const stats = t.raw("stats") as StatContent[];
  const aiHighlights = t.raw("aiHighlights") as HighlightContent[];
  const features = t.raw("features") as FeatureContent[];
  const serviceChips = t.raw("serviceChips") as string[];
  const path = getPathname({ locale: l, href: "/location-voiture-agadir" });
  const inLanguage = localeToLanguageTag(l);
  const homePath = getPathname({ locale: l, href: "/" });
  const carsPath = getPathname({ locale: l, href: "/cars" });
  const fleetHref = carsPath;
  const relatedPages = [
    { label: t("relatedPages.airport"), href: getPathname({ locale: l, href: "/agadir-airport-car-rental" }) },
    { label: t("relatedPages.taghazout"), href: getPathname({ locale: l, href: "/taghazout-car-rental" }) },
    { label: t("relatedPages.contact"), href: getPathname({ locale: l, href: "/contact" }) },
  ];

  const structuredData = generateLocalSeoLandingGraphSchema({
    path,
    name: t("schema.name"),
    description: t("schema.description"),
    inLanguage,
    breadcrumbItems: [
      { name: tNav("home"), url: homePath },
      { name: tNav("cars"), url: carsPath },
      { name: t("schema.breadcrumbName"), url: path },
    ],
    faqs: [...faqs],
    primaryImagePath: "/og/og-default.jpg",
    service: {
      name: t("schema.serviceName"),
      description: t("schema.serviceDescription"),
    },
  });

  const cars = FEATURED_SLUGS.map((slug) => getCarBySlug(slug))
    .filter(Boolean)
    .map((car) => {
      const c = carForLocale(car!, l);
      const localizedSlug = carSlugForLocale(car!.slug, l);
      const href = getPathname({
        locale: l,
        href: carBrandScopedHref(car!.brand, localizedSlug),
      });
      return {
        name: c.carName,
        image: c.carImage,
        imageAlt: t("carsSection.cardImageAlt", { name: c.carName }),
        imageTitle: t("carsSection.cardImageTitle", { name: c.carName }),
        imageCaption: t("carsSection.cardCaption"),
        href,
        badge: `${car!.brand} ${car!.model}`,
      };
    });

  return (
    <>
      <Script
        id={`ld-json-agadir-landing-${l}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <DestinationAeoLanding
        variant="default"
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
                    <Link href="/location-voiture-agadir" locale={targetLocale}>
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
            muted: (chunks) => <span className="text-black/50">{chunks}</span>,
          }),
          lead: t("hero.lead"),
          meta: t("hero.meta"),
        }}
        quickAnswer={t("quickAnswer")}
        keyFactsTitle={t("keyFacts.title")}
        keyFacts={keyFacts}
        relatedPagesLabel={t("relatedPages.label")}
        relatedPages={relatedPages}
        operationsSection={
          {
            kicker: t("operations.kicker"),
            title: t("operations.title"),
            lead: t("operations.lead"),
          }
        }
        aiPanel={
          {
            badge: t("aiPanel.badge"),
            title: t("aiPanel.title"),
          }
        }
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
          primary: { label: t("ctas.primary"), href: "https://wa.me/212662500181", variant: "primary", external: true },
          secondary: { label: t("ctas.secondary"), href: carsPath, variant: "secondary" },
          tertiary: { label: t("ctas.tertiary"), href: "mailto:contact@amseelcars.com", variant: "ghost", external: true },
        }}
        fleetHref={fleetHref}
      />
    </>
  );
}
