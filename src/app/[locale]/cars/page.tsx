import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import CarGridSection from '@/components/Cars/CarGridSection'
import CarsGridLoadingFallback from '@/components/Cars/CarsGridLoadingFallback'
import Footer from '@/components/Footer/Footer'
import HeroVideo from '@/components/Cars/HeroVedio/HeroVideo'

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
import { generateBreadcrumbSchema } from '@/lib/schemas';
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
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: tNav("home"), url: homePath },
    { name: tNav("cars"), url: carsPath },
  ]);

  return (
    <>
      {/* Breadcrumb Schema */}
      <Script
        id="ld-json-breadcrumb-cars"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    <div>
      <HeroVideo/>
      <Suspense fallback={<CarsGridLoadingFallback />}>
        <CarGridSection />
      </Suspense>
      <ParallexCards />
      <Footer />
    </div>
    </>
  )
}