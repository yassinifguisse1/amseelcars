import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import { generateLocalSeoLandingGraphSchema } from '@/lib/schemas'
import { getCarBySlug } from '@/data/cars'
import { carListingCaption, carListingImageAlt, carListingImageTitle } from '@/lib/carImageAlt'
import { AgadirLandingShell } from '@/components/Landing/AgadirLandingShell'
import styles from '@/components/Landing/agadir-landing.module.css'

const siteUrl = 'https://www.amseelcars.com'

const faqs = [
  {
    question: 'How much does a car rental in Agadir cost?',
    answer:
      'Pricing depends on the car category, rental length, and season. AmseelCars offers economy, SUV, and premium options with clear pricing and fast booking via WhatsApp.',
  },
  {
    question: 'Can I pick up the car at Agadir Al Massira Airport?',
    answer:
      'Yes. We can arrange pickup and drop-off at Agadir–Al Massira Airport, or in Agadir city. Share your flight time and we’ll coordinate the handover.',
  },
  {
    question: 'What documents do I need to rent a car in Morocco?',
    answer:
      'Typically a valid driving licence and an ID/passport. Requirements can vary depending on the vehicle—message us and we’ll confirm quickly.',
  },
  {
    question: 'Can I book through WhatsApp?',
    answer:
      'Yes. Send your dates, pickup location (airport/city), and preferred car. We’ll reply with availability and the next steps.',
  },
] as const

const FEATURED_SLUGS = [
  'location-voiture-agadir-bmw-x3-pack-m',
  'location-voiture-agadir-t-roc',
  'location-voiture-agadir-sandero-stepway',
] as const

export const metadata: Metadata = {
  title: 'Agadir Car Rental — Airport pickup & city delivery',
  description:
    'Rent a car in Agadir with pickup at Agadir–Al Massira Airport or in the city. Economy, SUV & premium cars. Fast booking via WhatsApp.',
  alternates: {
    canonical: '/agadir-car-rental',
    languages: {
      'fr-MA': '/location-voiture-agadir',
      en: '/agadir-car-rental',
    },
  },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/agadir-car-rental`,
    siteName: 'AmseelCars',
    locale: 'en_US',
    title: 'Agadir Car Rental — Airport pickup & city delivery',
    description:
      'Pickup at Agadir–Al Massira Airport or in the city. Economy, SUV & premium cars. Fast booking via WhatsApp.',
    images: [{ url: '/og/og-default.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agadir Car Rental — Airport pickup & city delivery',
    description: 'Pickup at the airport or in Agadir city. Economy, SUV & premium cars.',
    images: ['/og/og-default.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
}

export default function AgadirCarRentalPage() {
  const structuredData = generateLocalSeoLandingGraphSchema({
    path: '/agadir-car-rental',
    name: 'Agadir Car Rental — Airport pickup & city delivery',
    description:
      'Rent a car in Agadir with pickup at Agadir–Al Massira Airport or in the city. Economy, SUV & premium cars. Fast booking via WhatsApp.',
    inLanguage: 'en-US',
    breadcrumbItems: [
      { name: 'Home', url: '/' },
      { name: 'Cars', url: '/cars' },
      { name: 'Agadir Car Rental', url: '/agadir-car-rental' },
    ],
    faqs: [...faqs],
    primaryImagePath: '/og/og-default.jpg',
    service: {
      name: 'Agadir car rental',
      description:
        'Car rental in Agadir with airport or city pickup, WhatsApp booking, and economy to premium vehicles.',
    },
  })

  const cars = FEATURED_SLUGS.map((slug) => getCarBySlug(slug))
    .filter(Boolean)
    .map((car) => ({
      slug: car!.slug,
      name: car!.carName,
      image: car!.carImage,
      imageAlt: carListingImageAlt(car!),
      imageTitle: carListingImageTitle(car!),
      imageCaption: carListingCaption(car!),
    }))

  return (
    <>
      <Script
        id="ld-json-agadir-landing-en"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <AgadirLandingShell
        variant="city"
        langSlot={
          <>
            <Link href="/location-voiture-agadir">FR</Link>
            <span aria-hidden>·</span>
            <span>EN</span>
          </>
        }
        heroTitle={
          <>
            <span className={styles.heroTitleAccent}>Agadir</span>
            <span className={styles.heroHeadlineRest}> car rental</span>
          </>
        }
        heroLead="Book in minutes: pickup at Agadir–Al Massira Airport or in the city, from daily drivers to premium SUVs—with quick answers on WhatsApp."
        ctas={[
          { href: '/cars', label: 'Browse fleet', variant: 'primary' },
          { href: '/contact', label: 'Get a quote', variant: 'secondary' },
          { href: 'https://wa.me/212662500181', label: 'WhatsApp', variant: 'whatsapp' },
        ]}
        stats={[
          { value: 'Airport', label: 'Al Massira pickup' },
          { value: 'City', label: 'Downtown handover' },
          { value: 'Flexible', label: 'Rental lengths' },
        ]}
        featuresKicker="Why AmseelCars"
        featuresTitle="Built around how you travel"
        featuresLead="From landing to checkout, we align pickup location, vehicle type, and messaging so you can focus on the coast—not paperwork."
        features={[
          {
            icon: 'pin',
            title: 'Pickup that fits your plan',
            description:
              'Airport, hotel, or neighbourhood handover—timed around your arrival and schedule.',
          },
          {
            icon: 'fleet',
            title: 'The right car for the road',
            description:
              'Economy for city hops, SUVs for comfort, premium options when you want extra space and refinement.',
          },
          {
            icon: 'bolt',
            title: 'Fast, human replies',
            description:
              'Share dates, location, and preferred model—we confirm availability and next steps without back-and-forth friction.',
          },
        ]}
        carsKicker="Featured"
        carsTitle="Popular picks in Agadir"
        carsLead="Jump straight into a few frequently booked models—or explore the full fleet."
        cars={cars}
        fleetLinkLabel="See all cars"
        carDetailHint="View details"
        faqTitle="FAQ — renting a car in Agadir"
        faqs={faqs}
      />
    </>
  )
}
