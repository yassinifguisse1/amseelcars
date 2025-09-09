import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getCarBySlug, getAllCarSlugs } from '@/data/cars'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Star, MapPin, Calendar, Users, Fuel, Settings, Shield } from 'lucide-react'

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

      <div className="min-h-screen bg-background">
        {/* Breadcrumb Navigation */}
        <nav className="bg-muted/30 py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                Home
              </Link>
              <span className="text-muted-foreground">/</span>
              <Link href="/cars" className="text-muted-foreground hover:text-foreground">
                Cars
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground font-medium">{car.carName}</span>
            </div>
          </div>
        </nav>

        {/* Back Button */}
        <div className="container mx-auto px-4 py-6">
          <Link 
            href="/cars" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cars
          </Link>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Primary Image */}
              <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted">
                <Image
                  src={car.images[0]?.src || car.carImage}
                  alt={car.images[0]?.alt || car.carName}
                  width={600}
                  height={450}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
              
              {/* Thumbnail Gallery */}
              {car.images.length > 1 && (
                <div className="grid grid-cols-3 gap-4">
                  {car.images.slice(1, 4).map((image, index) => (
                    <div key={index} className="aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={200}
                        height={150}
                        className="h-full w-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Car Details */}
            <div className="space-y-8">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium uppercase">
                    {car.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{car.rating}</span>
                  </div>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {car.carName}
                </h1>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{car.location}</span>
                </div>
              </div>

              {/* Price */}
              <div className="bg-muted/30 rounded-lg p-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-foreground">DH {car.pricePerDay}</span>
                  <span className="text-muted-foreground">per day</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Best price guaranteed • Free cancellation
                </p>
              </div>

              {/* Key Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{car.seats} Seats</p>
                    <p className="text-sm text-muted-foreground">Capacity</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <Fuel className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{car.fuelType}</p>
                    <p className="text-sm text-muted-foreground">Fuel Type</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <Settings className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{car.transmission}</p>
                    <p className="text-sm text-muted-foreground">Transmission</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{car.year}</p>
                    <p className="text-sm text-muted-foreground">Model Year</p>
                  </div>
                </div>
              </div>

              {/* Book Now Button */}
              <Button 
                size="lg" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Book Now - DH {car.pricePerDay}/day
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="mt-12 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4 ">About This Car</h2>
              <p className="text-muted-foreground leading-relaxed">{car.description}</p>
            </div>

            {/* Features Grid */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Features & Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {car.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <span className="text-2xl">{feature.icon}</span>
                    <div>
                      <p className="font-medium text-foreground">{feature.name}</p>
                      <p className="text-sm text-muted-foreground">{feature.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Specifications */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Technical Specifications</h2>
              <div className="bg-muted/30 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">Engine</span>
                      <span className="font-medium">{car.specs.engine}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">Horsepower</span>
                      <span className="font-medium">{car.specs.horsepower}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">Acceleration</span>
                      <span className="font-medium">{car.specs.acceleration}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">Top Speed</span>
                      <span className="font-medium">{car.specs.topSpeed}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">Fuel Efficiency</span>
                      <span className="font-medium">{car.specs.fuelEfficiency}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">Drivetrain</span>
                      <span className="font-medium">{car.specs.drivetrain}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability Status */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Available for Rental</p>
                  <p className="text-sm text-green-700">
                    This vehicle is currently available and ready for your next adventure.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 
