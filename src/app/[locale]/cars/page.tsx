import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import CarGridSection from '@/components/Cars/CarGridSection'
import CarsGridLoadingFallback from '@/components/Cars/CarsGridLoadingFallback'
import Footer from '@/components/Footer/Footer'
import HeroVideo from '@/components/Cars/HeroVedio/HeroVideo'
import { getAllCars } from '@/data/cars'
import { carSlugForLocale } from '@/lib/carSlugLocale'
import { brandToSlug } from '@/lib/brandSlug'

const ParallexCards = dynamic(
  () => import('@/components/Cars/ParallexCards/ParallexCards'),
  {
    loading: () => (
      <div className="min-h-[min(80vh,40rem)] w-full bg-neutral-950" aria-hidden />
    ),
  }
)
import Script from 'next/script'
import { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { generateBreadcrumbSchema, generateLocalSeoLandingGraphSchema } from '@/lib/schemas';
import { localizedAlternates } from '@/lib/seo/localized-alternates';
import type { AppLocale } from '@/i18n/routing';
import { getPathname } from '@/i18n/navigation';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const l: AppLocale = locale === "en" ? "en" : "fr";
  const path = getPathname({ locale: l, href: "/cars" });
  const t = await getTranslations({ locale: l, namespace: "seo" });
  const title = t("cars.title");
  const description = t("cars.description");

  return {
    title,
    description,
    alternates: localizedAlternates(l, "/cars"),
    openGraph: {
      images: ["/og/og-default.jpg"],
      url: `https://www.amseelcars.com${path}`,
      title,
      description,
    },
  };
}


export default async function CarsPage() {
  const locale = await getLocale();
  const l: AppLocale = locale === "en" ? "en" : "fr";
  const tNav = await getTranslations({ locale: l, namespace: "nav" });
  const homePath = getPathname({ locale: l, href: "/" });
  const carsPath = getPathname({ locale: l, href: "/cars" });
  const isEn = l === "en";
  const allCars = getAllCars();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: tNav("home"), url: homePath },
    { name: tNav("cars"), url: carsPath },
  ]);
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: isEn ? "Car rental fleet in Agadir" : "Flotte location voiture Agadir",
    itemListElement: allCars.slice(0, 24).map((car, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: car.carName,
      url: `https://www.amseelcars.com${getPathname({
        locale: l,
        href: {
          pathname: "/cars/brand/[brandSlug]/[carSlug]",
          params: { brandSlug: brandToSlug(car.brand), carSlug: carSlugForLocale(car.slug, l) },
        },
      })}`,
    })),
  };
  const moneyPageGraphSchema = generateLocalSeoLandingGraphSchema({
    path: carsPath,
    name: isEn ? "Agadir car rental fleet" : "Flotte location voiture Agadir",
    description: isEn
      ? "Browse economy, SUV, and premium rental cars in Agadir with airport and city pickup options."
      : "Parcourez nos voitures de location a Agadir : citadines, SUV et premium, avec retrait aeroport ou centre-ville.",
    inLanguage: isEn ? "en-US" : "fr-MA",
    breadcrumbItems: [
      { name: tNav("home"), url: homePath },
      { name: tNav("cars"), url: carsPath },
    ],
    faqs: isEn
      ? [
          {
            question: "How much does car rental in Agadir cost?",
            answer:
              "Pricing depends on category, dates, and duration. Economy models usually start lower while SUVs and premium cars cost more.",
          },
          {
            question: "Can I pick up at Agadir airport?",
            answer:
              "Yes, pickup and drop-off can be arranged at Agadir Al Massira Airport or in Agadir city depending on availability.",
          },
        ]
      : [
          {
            question: "Quel est le prix d'une location de voiture à Agadir ?",
            answer:
              "Le tarif dépend de la catégorie, des dates et de la durée. Les citadines démarrent plus bas que les SUV et véhicules premium.",
          },
          {
            question: "Puis-je retirer la voiture à l'aéroport d'Agadir ?",
            answer:
              "Oui, le retrait et le retour peuvent être organisés à l'aéroport Al Massira ou en ville selon la disponibilité.",
          },
        ],
    service: isEn
      ? {
          name: "Agadir car rental fleet",
          description:
            "Car rental service in Agadir with economy, SUV, and premium categories and airport pickup options.",
        }
      : {
          name: "Flotte location voiture Agadir",
          description:
            "Service de location de voiture à Agadir avec citadines, SUV et premium, avec option retrait aéroport.",
        },
    primaryImagePath: "/og/og-default.jpg",
  });
  const quickAnswer = isEn
    ? "AmseelCars offers car rental in Agadir across economy, SUV, and premium categories, with airport (AGA) or city pickup and booking via WhatsApp."
    : "AmseelCars propose la location de voiture a Agadir en citadine, SUV et premium, avec retrait aeroport (AGA) ou centre-ville et reservation via WhatsApp.";
  const keyFacts = isEn
    ? [
        { label: "Fleet size", value: `${allCars.length}+ models` },
        { label: "Pickup points", value: "Agadir city + AGA airport" },
        { label: "Categories", value: "Economy, SUV, premium" },
      ]
    : [
        { label: "Taille de flotte", value: `${allCars.length}+ modeles` },
        { label: "Points de retrait", value: "Agadir ville + aeroport AGA" },
        { label: "Categories", value: "Citadine, SUV, premium" },
      ];

  return (
    <>
      {/* Breadcrumb Schema */}
      <Script
        id="ld-json-breadcrumb-cars"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="ld-json-cars-itemlist"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Script
        id={`ld-json-cars-money-graph-${isEn ? "en" : "fr"}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(moneyPageGraphSchema) }}
      />
    <div>
      <HeroVideo/>
      <section className="mx-auto max-w-6xl px-4 py-8 md:py-10 hidden">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b11226]">
            {isEn ? "Quick answer" : "Reponse rapide"}
          </h2>
          <p className="mt-3 text-sm text-neutral-700 md:text-base">{quickAnswer}</p>
          <dl className="mt-5 grid gap-3 md:grid-cols-3">
            {keyFacts.map((fact) => (
              <div key={fact.label} className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                <dt className="text-xs uppercase tracking-[0.15em] text-neutral-500">{fact.label}</dt>
                <dd className="mt-1 text-sm font-semibold text-neutral-900">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <Suspense fallback={<CarsGridLoadingFallback />}>
        <CarGridSection />
      </Suspense>
      <ParallexCards />
      <Footer />
    </div>
    </>
  )
}