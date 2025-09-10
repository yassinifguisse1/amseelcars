import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getCarBySlug, getAllCarSlugs } from '@/data/cars'
import CarDetailClient from './CarDetailClient'

// Next.js dynamic route params are async in newer versions (await before use)
interface CarDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CarDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const car = getCarBySlug(slug)
  
  if (!car) {
    return {
      title: 'Car Not Found',
      description: 'The requested car could not be found.'
    }
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

// Generate static params for all cars
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

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: car.carName,
    description: car.description,
    brand: {
      '@type': 'Brand',
      name: car.brand,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: car.pricePerDay,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: car.pricePerDay,
        priceCurrency: 'USD',
        unitText: 'per day',
      },
    },
    image: car.images.map(img => img.src),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: car.rating,
      ratingCount: 100, // Mock review count
    },
  }

  return (
    <>
      {/* JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <CarDetailClient car={car} />
    </>
  )
} 
