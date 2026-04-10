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
    question: 'Where do you meet at Agadir Al Massira Airport?',
    answer:
      'We coordinate the handover based on your arrival time. Message us your flight details and we’ll confirm the exact meeting point and timing.',
  },
  {
    question: 'Is airport pickup available late at night?',
    answer:
      'In many cases, yes—depending on availability. Share your flight time and we’ll confirm the best option for pickup and drop-off.',
  },
  {
    question: 'How do I book an airport pickup car?',
    answer:
      'Send your dates, flight time, and the car you prefer on WhatsApp. We’ll confirm availability and finalize the reservation quickly.',
  },
  {
    question: 'Can I return the car at the airport?',
    answer:
      'Yes. Airport drop-off can be arranged. Tell us your departure time so we can plan a smooth return.',
  },
] as const

const FEATURED_SLUGS = [
  'location-voiture-agadir-bmw-x3-pack-m',
  'location-voiture-agadir-t-roc',
  'location-voiture-agadir-sandero-stepway',
] as const

export const metadata: Metadata = {
  title: 'Agadir Airport Car Rental (Al Massira) — Pickup & drop-off',
  description:
    'Car rental at Agadir–Al Massira Airport with pickup and drop-off options. Fast booking via WhatsApp, economy/SUV/premium cars.',
  alternates: {
    canonical: '/agadir-airport-car-rental',
    languages: {
      en: '/agadir-airport-car-rental',
      'fr-MA': '/location-voiture-agadir',
    },
  },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/agadir-airport-car-rental`,
    siteName: 'AmseelCars',
    locale: 'en_US',
    title: 'Agadir Airport Car Rental (Al Massira) — Pickup & drop-off',
    description:
      'Pickup and drop-off at Agadir–Al Massira Airport. Fast booking via WhatsApp and a curated fleet.',
    images: [{ url: '/og/og-default.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agadir Airport Car Rental (Al Massira)',
    description: 'Airport pickup & drop-off. Fast booking via WhatsApp.',
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

export default function AgadirAirportCarRentalPage() {
  const structuredData = generateLocalSeoLandingGraphSchema({
    path: '/agadir-airport-car-rental',
    name: 'Agadir Airport Car Rental (Al Massira) — Pickup & drop-off',
    description:
      'Car rental at Agadir–Al Massira Airport with pickup and drop-off options. Fast booking via WhatsApp, economy/SUV/premium cars.',
    inLanguage: 'en-US',
    breadcrumbItems: [
      { name: 'Home', url: '/' },
      { name: 'Cars', url: '/cars' },
      { name: 'Agadir Airport Car Rental', url: '/agadir-airport-car-rental' },
    ],
    faqs: [...faqs],
    primaryImagePath: '/og/og-default.jpg',
    service: {
      name: 'Agadir Al Massira Airport car rental',
      description:
        'Car rental with pickup and drop-off at Agadir–Al Massira Airport (AGA), coordinated by WhatsApp.',
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
        id="ld-json-agadir-landing-airport"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <AgadirLandingShell
        variant="airport"
        langSlot={
          <>
            <Link href="/location-voiture-agadir">FR (Agadir)</Link>
            <span aria-hidden>·</span>
            <span>EN · Airport</span>
          </>
        }
        heroTitle={
          <>
            <span className={styles.heroHeadlineRest}>Agadir </span>
            <span className={styles.heroTitleAccent}>Airport</span>
            <span className={styles.heroHeadlineRest}> car rental</span>
          </>
        }
        heroLead="Landing at Al Massira? Pre-book your car for a smooth handover pickup and return at the airport when it fits your flight times, with WhatsApp coordination."
        ctas={[
          { href: '/cars', label: 'Choose a car', variant: 'primary' },
          { href: '/contact', label: 'Get a quote', variant: 'secondary' },
          { href: 'https://wa.me/212662500181', label: 'WhatsApp (flight details)', variant: 'whatsapp' },
        ]}
        stats={[
          { value: 'AGA', label: 'Al Massira Airport' },
          { value: 'Meet & greet', label: 'Coordinated handover' },
          { value: 'Return', label: 'Airport drop-off option' },
        ]}
        featuresKicker="Airport-first service"
        featuresTitle="From baggage claim to the open road"
        featuresLead="Share your arrival window—we align the handover, the vehicle, and return options around your itinerary."
        features={[
          {
            icon: 'pin',
            title: 'Flight-synced pickup',
            description:
              'Send your flight number and ETA—we suggest a meeting point and timing that match real-world delays.',
          },
          {
            icon: 'fleet',
            title: 'Cars suited to coastal driving',
            description:
              'Compact for easy parking, SUVs for luggage and comfort—pick what matches your group and route.',
          },
          {
            icon: 'bolt',
            title: 'WhatsApp as your concierge',
            description:
              'Fast answers on availability, documents, and pickup details without waiting on long email threads.',
          },
        ]}
        carsKicker="Good airport picks"
        carsTitle="Cars travellers often book after AGA"
        carsLead="Start with a few reliable choices—then explore the full lineup if you want something specific."
        cars={cars}
        fleetLinkLabel="Browse all vehicles"
        carDetailHint="View details"
        faqTitle="FAQ about Agadir airport pickup"
        faqs={faqs}
      />
    </>
  )
}
