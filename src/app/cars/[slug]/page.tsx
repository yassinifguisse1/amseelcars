import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Script from 'next/script'
import { getCarBySlug, getAllCarSlugs } from '@/data/cars'
import CarDetailClient from './CarDetailClient'
import { generateCarProductSchema, generateBreadcrumbSchema } from '@/lib/schemas'

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

  return {
    title: `${car.carName} - Luxury Car Rental | Amseel Cars`,
    description: car.description,
    keywords: [car.brand, car.model, car.category, 'luxury car rental', 'Morocco'],
    openGraph: {
      title: `${car.carName} - Luxury Car Rental`,
      description: car.description,
      images: [
        {
          url: car.carImage,
          width: 1200,
          height: 630,
          alt: car.carName,
        },
      ],
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

      <CarDetailClient car={car} />
    </>
  )
} 
