import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Script from 'next/script'
import { getLocale, getTranslations } from 'next-intl/server'
import { getCarBySlug, getAllCarSlugs } from '@/data/cars'
import { carForLocale } from '@/lib/carLocale'
import CarDetailClient from './CarDetailClient'
import { generateCarProductSchema, generateBreadcrumbSchema } from '@/lib/schemas'
import { generateFAQSchema } from '@/lib/faqSchema'
import { localizedAlternates, localizedCarAlternates } from '@/lib/seo/localized-alternates'
import { frenchCarSlugToEnglishSlug, carSlugForLocale } from '@/lib/carSlugLocale'
import type { AppLocale } from '@/i18n/routing'
import { getPathname } from '@/i18n/navigation'

// Next.js dynamic route params are async in newer versions (await before use) (only one of these is needed)
// This is the preferred way to handle dynamic route params
interface CarDetailPageProps {
  params: Promise<{
    slug: string
  }>
}


// Generate metadata for SEO (only one of these is needed)
// This is the preferred way to handle metadata
export async function generateMetadata({ params }: CarDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const locale = await getLocale()
  const l: AppLocale = locale === "en" ? "en" : "fr"
  const car = getCarBySlug(slug)

  if (!car) {
    const t = await getTranslations({ locale: l, namespace: "seo" });
    return {
      title: t("carNotFound.title"),
      description: t("carNotFound.description"),
      robots: {
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
        },
      },
      openGraph: {
        title: t("carNotFound.title"),
        description: t("carNotFound.description"),
      },
      twitter: {
        title: t("carNotFound.title"),
        description: t("carNotFound.description"),
      },
      icons: {
        icon: "/favicon.ico",
      },
      alternates: localizedAlternates(l, "/cars"),
    };
  }

  const localized = carForLocale(car, l)
  const frSlug = car.slug
  const enSlug = frenchCarSlugToEnglishSlug(frSlug)

  // Use richContent SEO fields if available, otherwise use defaults
  const pageTitle =
    localized.richContent?.seoTitle ||
    localized.richContent?.h1Title ||
    `${car.carName} - Luxury Car Rental | Amseel Cars`
  const metaDescription =
    localized.richContent?.seoMetaDescription || localized.description

  const canonicalPath = getPathname({
    locale: l,
    href: { pathname: "/cars/[slug]" as const, params: { slug: localized.slug } },
  })

  return {
    title: pageTitle,
    description: metaDescription,
    keywords: [car.brand, car.model, car.category, 'luxury car rental', 'Morocco', 'location voiture', 'Agadir'],
    alternates: localizedCarAlternates(l, frSlug, enSlug),
    openGraph: {
      title: pageTitle,
      description: metaDescription,
      url: canonicalPath,
      images: [
        {
          url: car.carImage,
          width: 1200,
          height: 630,
          alt: car.carName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: metaDescription,
      images: [car.carImage],
    },
  }
}

// Generate static params for all cars (only one of these is needed)
export async function generateStaticParams({
  params,
}: {
  params: { locale: string }
}): Promise<{ slug: string }[]> {
  const l: AppLocale = params.locale === 'en' ? 'en' : 'fr'
  return getAllCarSlugs().map((fr) => ({ slug: carSlugForLocale(fr, l) }))
}

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const { slug } = await params
  const carRaw = getCarBySlug(slug)

  if (!carRaw) {
    notFound()
  }

  const locale = await getLocale()
  const l: AppLocale = locale === "en" ? "en" : "fr"
  const car = carForLocale(carRaw, l)
  const tNav = await getTranslations({ locale: l, namespace: "nav" })
  const homePath = getPathname({ locale: l, href: "/" })
  const carsPath = getPathname({ locale: l, href: "/cars" })
  const carPath = getPathname({
    locale: l,
    href: { pathname: "/cars/[slug]", params: { slug: car.slug } },
  })

  const productPageUrl = `https://www.amseelcars.com${carPath}`

  // Generate improved Car Product schema
  const carProductSchema = generateCarProductSchema(
    {
      carName: car.carName,
      brand: car.brand,
      model: car.model,
      description: car.description,
      pricePerDay: car.pricePerDay,
      images: car.images,
      slug: car.slug,
      category: car.category,
      year: car.year,
      fuelType: car.fuelType,
      transmission: car.transmission,
      seats: car.seats,
    },
    { productPageUrl, stableId: carRaw.slug },
  );

  // Generate Breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: tNav("home"), url: homePath },
    { name: tNav("cars"), url: carsPath },
    { name: car.carName, url: carPath },
  ]);

  // Generate FAQ schema if FAQs exist in richContent
  const faqSchema = car.richContent?.faqs
    ? generateFAQSchema(car.richContent.faqs)
    : null

  return (
    <>
      {/* Car Product Schema */}
      <Script
        id="ld-json-car-product"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(carProductSchema) }}
      />

      {/* Breadcrumb Schema */}
      <Script
        id="ld-json-breadcrumb-car"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* FAQ Schema for SEO */}
      {faqSchema && (
        <Script
          id="ld-json-faq-car"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <CarDetailClient car={car} />
    </>
  )
} 
