import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Script from 'next/script'
import { getCarBySlug, getAllCarSlugs } from '@/data/cars'
import CarDetailClient from './CarDetailClient'
import { generateCarProductSchema, generateBreadcrumbSchema } from '@/lib/schemas'
import { generateFAQSchema } from '@/lib/faqSchema'

// SEO metadata

const metadata: Metadata = {
  title: 'Car Not Found',
  description: 'The requested car could not be found.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    title: 'Car Not Found',
    description: 'The requested car could not be found.',
  },
  twitter: {
    title: 'Car Not Found',
    description: 'The requested car could not be found.',
  },
  alternates: {
    canonical: '/cars/[slug]',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

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
  const car = getCarBySlug(slug)
  
  if (!car) {
    return metadata
  }

  // Use richContent SEO fields if available, otherwise use defaults
  const pageTitle = car.richContent?.seoTitle || car.richContent?.h1Title || `${car.carName} - Luxury Car Rental | Amseel Cars`
  const metaDescription = car.richContent?.seoMetaDescription || car.description
  
  return {
    title: pageTitle,
    description: metaDescription,
    keywords: [car.brand, car.model, car.category, 'luxury car rental', 'Morocco', 'location voiture', 'Agadir'],
    openGraph: {
      title: pageTitle,
      description: metaDescription,
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
export async function generateStaticParams() {
  const slugs = getAllCarSlugs()
  return slugs.map((slug) => ({ slug }))
}

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const { slug } = await params
  const car = getCarBySlug(slug)

  if (!car) {
    notFound()
  }

  // Generate improved Car Product schema
  const carProductSchema = generateCarProductSchema({
    carName: car.carName,
    brand: car.brand,
    model: car.model,
    description: car.description,
    pricePerDay: car.pricePerDay,
    images: car.images,
    rating: car.rating,
    slug: car.slug,
    category: car.category,
    year: car.year,
    fuelType: car.fuelType,
    transmission: car.transmission,
    seats: car.seats,
  });

  // Generate Breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Cars', url: '/cars' },
    { name: car.carName, url: `/cars/${car.slug}` },
  ]);

  // Generate FAQ schema if FAQs exist in richContent
  const faqSchema = car.richContent?.faqs 
    ? generateFAQSchema(car.richContent.faqs)
    : null;

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
