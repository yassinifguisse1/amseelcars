import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import Script from 'next/script'
import { getLocale } from 'next-intl/server'
import { generateLocalSeoLandingGraphSchema } from '@/lib/schemas'
import { localizedAlternates } from '@/lib/seo/localized-alternates'
import type { AppLocale } from '@/i18n/routing'
import { getPathname } from '@/i18n/navigation'
import { getCarBySlug } from '@/data/cars'
import { carForLocale } from '@/lib/carLocale'
import { carListingCaption, carListingImageAlt, carListingImageTitle } from '@/lib/carImageAlt'
import { AgadirLandingShell } from '@/components/Landing/AgadirLandingShell'
import styles from '@/components/Landing/agadir-landing.module.css'

const siteUrl = 'https://www.amseelcars.com'

const faqs = [
  {
    question: 'Can I rent a car for Taghazout with pickup in Agadir or at the airport?',
    answer:
      'Yes. Many guests pick up in Agadir city or at Agadir–Al Massira Airport and drive to Taghazout. Tell us your plan and we will suggest the smoothest handover.',
  },
  {
    question: 'How long is the drive from Agadir to Taghazout?',
    answer:
      'Roughly 20–30 minutes depending on traffic and your start point. A compact or SUV is comfortable for the coastal road.',
  },
  {
    question: 'Do you deliver to Taghazout?',
    answer:
      'Delivery options depend on dates and fleet movement. Message us on WhatsApp with your hotel or area in Taghazout and we will confirm what is possible.',
  },
  {
    question: 'What car is best for Taghazout and surf trips?',
    answer:
      'SUVs and compact crossovers are popular for boards and luggage; economy cars work well for light packing. We can help you match the vehicle to your group.',
  },
] as const

const FEATURED_SLUGS = [
  'location-voiture-agadir-bmw-x3-pack-m',
  'location-voiture-agadir-t-roc',
  'location-voiture-agadir-sandero-stepway',
] as const

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params
  const l: AppLocale = locale === 'en' ? 'en' : 'fr'
  const path = getPathname({ locale: l, href: '/taghazout-car-rental' })

  if (l === 'en') {
    return {
      title: 'Taghazout car rental — From Agadir & airport',
      description:
        'Rent a car for Taghazout with pickup in Agadir or at Al Massira Airport. SUVs, compacts & premium. Quick booking on WhatsApp.',
      alternates: localizedAlternates('en', '/taghazout-car-rental'),
      openGraph: {
        type: 'website',
        url: `${siteUrl}${path}`,
        siteName: 'AmseelCars',
        locale: 'en_US',
        title: 'Taghazout car rental — From Agadir & airport',
        description:
          'Pickup in Agadir or at the airport, drive to Taghazout. Economy, SUV & premium cars.',
        images: [{ url: '/og/og-default.jpg' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Taghazout car rental',
        description: 'Pickup in Agadir or at Al Massira Airport.',
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
  }

  return {
    title: 'Location voiture Taghazout — depuis Agadir & aéroport',
    description:
      'Louez une voiture pour Taghazout : retrait à Agadir ou à l’aéroport Al Massira. SUV, citadines & premium. Réservation rapide par WhatsApp.',
    alternates: localizedAlternates('fr', '/taghazout-car-rental'),
    openGraph: {
      type: 'website',
      url: `${siteUrl}${path}`,
      siteName: 'AmseelCars',
      locale: 'fr_MA',
      title: 'Location voiture Taghazout',
      description:
        'Retrait à Agadir ou à l’aéroport, direction Taghazout. Citadines, SUV & premium.',
      images: [{ url: '/og/og-default.jpg' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Location voiture Taghazout',
      description: 'Retrait à Agadir ou à l’aéroport Al Massira.',
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
}

export default async function TaghazoutCarRentalPage() {
  const locale = await getLocale()
  const l: AppLocale = locale === 'en' ? 'en' : 'fr'
  const isEn = l === 'en'
  const homePath = getPathname({ locale: l, href: '/' })
  const carsPath = getPathname({ locale: l, href: '/cars' })
  const selfPath = getPathname({ locale: l, href: '/taghazout-car-rental' })
  const airportEnPath = getPathname({ locale: 'en', href: '/agadir-airport-car-rental' })

  const structuredData = generateLocalSeoLandingGraphSchema({
    path: selfPath,
    name: isEn
      ? 'Taghazout car rental — From Agadir & airport'
      : 'Location voiture Taghazout — depuis Agadir & aéroport',
    description: isEn
      ? 'Rent a car for Taghazout with pickup in Agadir or at Al Massira Airport. SUVs, compacts & premium. Quick booking on WhatsApp.'
      : 'Louez une voiture pour Taghazout : retrait à Agadir ou à l’aéroport Al Massira. SUV, citadines & premium. Réservation rapide par WhatsApp.',
    inLanguage: isEn ? 'en-US' : 'fr-MA',
    breadcrumbItems: [
      { name: 'Home', url: homePath },
      { name: 'Cars', url: carsPath },
      {
        name: isEn ? 'Taghazout car rental' : 'Location voiture Taghazout',
        url: selfPath,
      },
    ],
    faqs: [...faqs],
    primaryImagePath: '/og/og-default.jpg',
    service: isEn
      ? {
          name: 'Taghazout car rental',
          description:
            'Car rental serving Taghazout with handover in Agadir or at Agadir–Al Massira Airport, coordinated via WhatsApp.',
        }
      : {
          name: 'Location voiture Taghazout',
          description:
            'Location desservant Taghazout avec remise à Agadir ou à l’aéroport Agadir–Al Massira, coordination par WhatsApp.',
        },
    serviceAreaServed: [
      { '@type': 'City', name: 'Taghazout' },
      { '@type': 'City', name: 'Agadir' },
      { '@type': 'Airport', name: 'Agadir–Al Massira Airport' },
      { '@type': 'Country', name: 'Morocco' },
    ],
  })

  const cars = FEATURED_SLUGS.map((slug) => getCarBySlug(slug))
    .filter(Boolean)
    .map((car) => {
      const c = carForLocale(car!, l)
      return {
        slug: c.slug,
        name: c.carName,
        image: c.carImage,
        imageAlt: carListingImageAlt(c, l),
        imageTitle: carListingImageTitle(c, l),
        imageCaption: carListingCaption(c, l),
      }
    })

  return (
    <>
      <Script
        id="ld-json-taghazout-landing"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <AgadirLandingShell
        variant="city"
        langSlot={
          isEn ? (
            <>
              <Link href="/taghazout-car-rental" locale="fr">
                FR
              </Link>
              <span aria-hidden>·</span>
              <span>EN</span>
            </>
          ) : (
            <>
              <span>FR</span>
              <span aria-hidden>·</span>
              <Link href="/taghazout-car-rental" locale="en">
                EN
              </Link>
            </>
          )
        }
        heroTitle={
          <>
            <span className={styles.heroTitleAccent}>Taghazout</span>
            <span className={styles.heroHeadlineRest}> car rental</span>
          </>
        }
        heroLead="Surf trips and coastal stays: pick up in Agadir or at Al Massira Airport, then head north with a car that fits your boards, bags, and crew—with fast answers on WhatsApp."
        ctas={[
          {
            href: carsPath,
            label: isEn ? 'Browse fleet' : 'Voir la flotte',
            variant: 'primary',
          },
          {
            href: isEn ? airportEnPath : getPathname({ locale: 'fr', href: '/agadir-airport-car-rental' }),
            label: isEn ? 'Airport pickup' : 'Retrait aéroport',
            variant: 'secondary',
          },
          { href: 'https://wa.me/212662500181', label: 'WhatsApp', variant: 'whatsapp' },
        ]}
        stats={[
          { value: 'Taghazout', label: 'Coastal village' },
          { value: '~30 min', label: 'From Agadir area' },
          { value: 'Flexible', label: 'Pickup options' },
        ]}
        featuresKicker="Coast-ready rentals"
        featuresTitle="Built for Taghazout runs"
        featuresLead="Whether you are staying in Taghazout or splitting time with Agadir, we align pickup and vehicle type with how you actually travel."
        features={[
          {
            icon: 'pin',
            title: 'Airport or city start',
            description:
              'Start from Al Massira or Agadir centre—whichever matches your flight and hotel timing.',
          },
          {
            icon: 'fleet',
            title: 'Room for gear',
            description:
              'Choose an SUV or crossover when you need space; go compact when you want easy parking.',
          },
          {
            icon: 'bolt',
            title: 'Straightforward booking',
            description:
              'Share dates, pickup spot, and group size—we confirm availability and next steps quickly.',
          },
        ]}
        carsKicker="Popular picks"
        carsTitle="Cars guests often choose for the coast"
        carsLead="Reliable options for the road to Taghazout—see the full fleet for more models."
        cars={cars}
        fleetLinkLabel="See all cars"
        carDetailHint="View details"
        faqTitle="FAQ — Taghazout & Agadir area"
        faqs={faqs}
      />
    </>
  )
}
