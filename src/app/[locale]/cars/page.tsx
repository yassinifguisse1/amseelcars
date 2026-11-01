import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import CarGridSection from '@/components/Cars/CarGridSection'
import CarsGridLoadingFallback from '@/components/Cars/CarsGridLoadingFallback'
import { HomeBookingSearchBar } from '@/components/home/HomeBookingSearchBar'
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
import { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import {
  generateBreadcrumbSchema,
  generateFleetOfferItemListSchema,
  generateLocalSeoLandingGraphSchema,
} from '@/lib/schemas';
import { JsonLd } from '@/components/seo/JsonLd';
import { localizedAlternates } from '@/lib/seo/localized-alternates';
import { buildPageMetadata, DEFAULT_OG_IMAGE } from '@/lib/seo/site-meta';
import type { AppLocale } from '@/i18n/routing';
import { getPathname } from '@/i18n/navigation';
import { localeToLanguageTag, localeToOpenGraphLocale, toAppLocale } from '@/i18n/locale-utils';
import { SITE_URL } from '@/lib/business';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const l: AppLocale = toAppLocale(locale);
  const path = getPathname({ locale: l, href: "/cars" });
  const t = await getTranslations({ locale: l, namespace: "seo" });
  const title = t("cars.title");
  const description = t("cars.description");

  return buildPageMetadata({
    title,
    description,
    path,
    localeOg: localeToOpenGraphLocale(l),
    alternates: localizedAlternates(l, "/cars"),
    imageAlt: title,
  });
}


export default async function CarsPage() {
  const locale = await getLocale();
  const l: AppLocale = toAppLocale(locale);
  const tNav = await getTranslations({ locale: l, namespace: "nav" });
  const tCars = await getTranslations({ locale: l, namespace: "carsPage" });
  const homePath = getPathname({ locale: l, href: "/" });
  const carsPath = getPathname({ locale: l, href: "/cars" });
  const allCars = getAllCars();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: tNav("home"), url: homePath },
    { name: tNav("cars"), url: carsPath },
  ]);
  const itemListSchema = generateFleetOfferItemListSchema(
    allCars.map((car) => ({
      brand: car.brand,
      carName: car.carName,
      model: car.model,
      description: car.description,
      pricePerDay: car.pricePerDay,
      carImage: car.carImage,
      slug: car.slug,
      year: car.year,
      fuelType: car.fuelType,
      transmission: car.transmission,
      seats: car.seats,
      productPageUrl: `${SITE_URL}${getPathname({
        locale: l,
        href: {
          pathname: "/cars/brand/[brandSlug]/[carSlug]",
          params: {
            brandSlug: brandToSlug(car.brand),
            carSlug: carSlugForLocale(car.slug, l),
          },
        },
      })}`,
    })),
    {
      name: tCars("schema.itemListName"),
      listUrl: `${SITE_URL}${carsPath}`,
      listId: `${SITE_URL}${carsPath}#fleet-offers`,
    },
  );
  const moneyPageGraphSchema = generateLocalSeoLandingGraphSchema({
    path: carsPath,
    name: tCars("schema.moneyPageName"),
    description: tCars("schema.moneyPageDescription"),
    inLanguage: localeToLanguageTag(l),
    breadcrumbItems: [
      { name: tNav("home"), url: homePath },
      { name: tNav("cars"), url: carsPath },
    ],
    faqs: [
      {
        question: tCars("schema.faqPriceQuestion"),
        answer: tCars("schema.faqPriceAnswer"),
      },
      {
        question: tCars("schema.faqPickupQuestion"),
        answer: tCars("schema.faqPickupAnswer"),
      },
    ],
    service: {
      name: tCars("schema.serviceName"),
      description: tCars("schema.serviceDescription"),
    },
    primaryImagePath: DEFAULT_OG_IMAGE,
  });
  const quickAnswer = tCars("quickAnswer.body");
  const keyFacts = [
    { label: tCars("quickAnswer.fleetSizeLabel"), value: tCars("quickAnswer.fleetSizeValue", { count: allCars.length }) },
    { label: tCars("quickAnswer.pickupPointsLabel"), value: tCars("quickAnswer.pickupPointsValue") },
    { label: tCars("quickAnswer.categoriesLabel"), value: tCars("quickAnswer.categoriesValue") },
  ];

  return (
    <>
      <JsonLd id="ld-json-breadcrumb-cars" data={breadcrumbSchema} />
      <JsonLd id="ld-json-cars-itemlist" data={itemListSchema} />
      <JsonLd id={`ld-json-cars-money-graph-${l}`} data={moneyPageGraphSchema} />
    <div>
      <HeroVideo/>
      <section className="mx-auto max-w-6xl px-4 py-8 md:py-10 hidden">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b11226]">
            {tCars("quickAnswer.label")}
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
      <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-8" aria-hidden />}>
        <HomeBookingSearchBar />
      </Suspense>
      <Suspense fallback={<CarsGridLoadingFallback />}>
        <CarGridSection />
      </Suspense>
      <ParallexCards />
      <Footer />
    </div>
    </>
  )
}
