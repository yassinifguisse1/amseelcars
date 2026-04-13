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
import { carBrandScopedHref } from '@/lib/carPublicHref'
import { carSlugForLocale } from '@/lib/carSlugLocale'
import { DestinationAeoLanding } from '@/components/Landing/DestinationAeoLanding'

const siteUrl = 'https://www.amseelcars.com'

const faqsEn = [
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

const faqsFr = [
  {
    question: 'Où se fait la remise à l’aéroport Al Massira d’Agadir ?',
    answer:
      'Nous calons la remise sur votre heure d’arrivée. Envoyez-nous votre vol sur WhatsApp : nous confirmons le point de rencontre exact et le créneau.',
  },
  {
    question: 'Le retrait aéroport est-il possible tard le soir ?',
    answer:
      'Souvent oui, selon disponibilité. Indiquez l’heure de votre vol et nous vous proposons la meilleure option pour retrait et retour.',
  },
  {
    question: 'Comment réserver une voiture avec retrait à l’aéroport ?',
    answer:
      'Envoyez vos dates, l’heure du vol et le modèle souhaité sur WhatsApp. Nous confirmons la disponibilité et finalisons rapidement.',
  },
  {
    question: 'Puis-je rendre la voiture à l’aéroport ?',
    answer:
      'Oui. Le retour à l’aéroport peut être organisé. Indiquez votre heure de départ pour un rendu fluide.',
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
  const { locale } = await params;
  const l: AppLocale = locale === 'en' ? 'en' : 'fr'
  const path = getPathname({ locale: l, href: '/agadir-airport-car-rental' })

  if (l === 'en') {
    return {
      title: 'Agadir Airport Car Rental (Al Massira) — Pickup & drop-off',
      description:
        'Car rental at Agadir–Al Massira Airport with pickup and drop-off options. Fast booking via WhatsApp, economy/SUV/premium cars.',
      alternates: localizedAlternates('en', '/agadir-airport-car-rental'),
      openGraph: {
        type: 'website',
        url: `${siteUrl}${path}`,
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
  }

  return {
    title: 'Location voiture aéroport Agadir (Al Massira) — Retrait & retour',
    description:
      'Location de voiture à l’aéroport d’Agadir–Al Massira : retrait et retour sur place. Réservation rapide par WhatsApp, flotte citadines/SUV/premium.',
    alternates: localizedAlternates('fr', '/agadir-airport-car-rental'),
    openGraph: {
      type: 'website',
      url: `${siteUrl}${path}`,
      siteName: 'AmseelCars',
      locale: 'fr_MA',
      title: 'Location voiture aéroport Agadir (Al Massira)',
      description:
        'Retrait et retour à l’aéroport Al Massira. Réservation rapide par WhatsApp.',
      images: [{ url: '/og/og-default.jpg' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Location voiture aéroport Agadir',
      description: 'Retrait à Al Massira. Réservation par WhatsApp.',
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

export default async function AgadirAirportCarRentalPage() {
  const locale = await getLocale()
  const l: AppLocale = locale === 'en' ? 'en' : 'fr'
  const isEn = l === 'en'
  const faqs = isEn ? faqsEn : faqsFr
  const homePath = getPathname({ locale: l, href: '/' })
  const carsPath = getPathname({ locale: l, href: '/cars' })
  const contactPath = getPathname({ locale: l, href: '/contact' })
  const selfPath = getPathname({ locale: l, href: '/agadir-airport-car-rental' })
  const relatedPages = isEn
    ? [
        { label: 'Agadir city rental', href: getPathname({ locale: l, href: '/location-voiture-agadir' }) },
        { label: 'Taghazout & coast', href: getPathname({ locale: l, href: '/taghazout-car-rental' }) },
        { label: 'Contact', href: contactPath },
      ]
    : [
        { label: 'Location Agadir centre', href: getPathname({ locale: l, href: '/location-voiture-agadir' }) },
        { label: 'Taghazout & côte', href: getPathname({ locale: l, href: '/taghazout-car-rental' }) },
        { label: 'Contact', href: contactPath },
      ]

  const structuredData = generateLocalSeoLandingGraphSchema({
    path: selfPath,
    name: isEn
      ? 'Agadir Airport Car Rental (Al Massira) — Pickup & drop-off'
      : 'Location voiture aéroport Agadir (Al Massira) — Retrait & retour',
    description: isEn
      ? 'Car rental at Agadir–Al Massira Airport with pickup and drop-off options. Fast booking via WhatsApp, economy/SUV/premium cars.'
      : 'Location de voiture à l’aéroport d’Agadir–Al Massira : retrait et retour sur place. Réservation rapide par WhatsApp, flotte citadines/SUV/premium.',
    inLanguage: isEn ? 'en-US' : 'fr-MA',
    breadcrumbItems: [
      { name: 'Home', url: homePath },
      { name: 'Cars', url: carsPath },
      {
        name: isEn ? 'Agadir Airport Car Rental' : 'Location aéroport Agadir',
        url: selfPath,
      },
    ],
    faqs: [...faqs] as { question: string; answer: string }[],
    primaryImagePath: '/og/og-default.jpg',
    service: isEn
      ? {
          name: 'Agadir Al Massira Airport car rental',
          description:
            'Car rental with pickup and drop-off at Agadir–Al Massira Airport (AGA), coordinated by WhatsApp.',
        }
      : {
          name: 'Location voiture aéroport Agadir Al Massira',
          description:
            'Location avec retrait et retour à l’aéroport Agadir–Al Massira (AGA), coordination par WhatsApp.',
        },
  })

  const cars = FEATURED_SLUGS.map((slug) => getCarBySlug(slug))
    .filter(Boolean)
    .map((car) => {
      const c = carForLocale(car!, l)
      const localizedSlug = carSlugForLocale(car!.slug, l)
      const href = getPathname({ locale: l, href: carBrandScopedHref(car!.brand, localizedSlug) })
      return {
        name: c.carName,
        image: c.carImage,
        imageAlt: carListingImageAlt(c, l),
        imageTitle: carListingImageTitle(c, l),
        imageCaption: carListingCaption(c, l),
        href,
        badge: `${car!.brand} ${car!.model}`,
      }
    })

  return (
    <>
      <Script
        id="ld-json-agadir-landing-airport"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <DestinationAeoLanding
        variant="airport"
        languageSwitcher={
          isEn ? (
            <>
              <Link href="/agadir-airport-car-rental" locale="fr">
                FR
              </Link>
              <span aria-hidden>·</span>
              <span>EN</span>
            </>
          ) : (
            <>
              <span>FR</span>
              <span aria-hidden>·</span>
              <Link href="/agadir-airport-car-rental" locale="en">
                EN
              </Link>
            </>
          )
        }
        hero={{
          eyebrow: isEn ? 'Al Massira drop zone' : 'Zone Al Massira',
          title: isEn ? (
            <>
              Agadir <span className="text-black/50">airport car rental</span>
            </>
          ) : (
            <>
              Agadir <span className="text-black/50">— location aéroport</span>
            </>
          ),
          lead: isEn
            ? 'Flight-tracked handovers, bilingual driver briefs, and WhatsApp updates designed for late-night landings.'
            : 'Remises synchronisées aux vols, briefs chauffeur bilingues et notifications WhatsApp pour les arrivées tardives.',
          meta: isEn
            ? 'Service optimized for AI answers, hotel concierges, and travellers who need precision for Al Massira (AGA).'
            : 'Service optimisé pour les réponses IA, conciergeries et voyageurs exigeant une précision à Al Massira (AGA).',
        }}
        quickAnswer={
          isEn
            ? 'AmseelCars offers car rental with pickup and drop-off at Agadir–Al Massira Airport (AGA, IATA AGA): send your flight details on WhatsApp +212 662-500181 to confirm the meeting point and vehicle.'
            : 'AmseelCars propose la location de voiture avec retrait et retour à l’aéroport Agadir–Al Massira (AGA, code AGA) : envoyez votre vol sur WhatsApp +212 662-500181 pour confirmer le point de rencontre et le véhicule.'
        }
        keyFactsTitle={isEn ? 'At a glance' : 'En bref'}
        keyFacts={
          isEn
            ? [
                { term: 'Airport', value: 'Agadir–Al Massira (AGA), Morocco.' },
                { term: 'Service', value: 'Meet-and-greet style handover coordinated by WhatsApp.' },
                { term: 'Booking', value: 'WhatsApp +212 662-500181 — share flight number and arrival time.' },
                { term: 'Returns', value: 'Airport drop-off available when arranged in advance.' },
              ]
            : [
                { term: 'Aéroport', value: 'Agadir–Al Massira (AGA), Maroc.' },
                { term: 'Service', value: 'Remise type meet & greet, coordonnée par WhatsApp.' },
                { term: 'Réservation', value: 'WhatsApp +212 662-500181 — numéro de vol et heure d’arrivée.' },
                { term: 'Retours', value: 'Retour aéroport possible sur organisation préalable.' },
              ]
        }
        relatedPagesLabel={isEn ? 'Related pages' : 'Pages liées'}
        relatedPages={relatedPages}
        operationsSection={
          isEn
            ? {
                kicker: 'Operational clarity',
                title: 'Airport choreography you can trust',
                lead: 'We align driver, plate, and parking slot with live arrival data—no vague “call when you land”.',
              }
            : {
                kicker: 'Clarté opérationnelle',
                title: 'Une logistique aéroport fiable',
                lead: 'Chauffeur, immatriculation et créneau calés sur l’arrivée réelle — pas de simple « appelez à l’atterrissage ».',
              }
        }
        aiPanel={
          isEn
            ? { badge: 'AI-ready facts', title: 'What assistants can cite' }
            : { badge: 'Faits exploitables IA', title: 'Ce que les assistants peuvent citer' }
        }
        serviceChips={isEn ? ['Arrivals', 'Returns', 'Flight sync'] : ['Arrivées', 'Retours', 'Synchro vol']}
        stats={
          isEn
            ? [
                { label: 'Gate coverage', value: 'A · B', helper: 'Meet-and-greet airside / parking' },
                { label: 'Response time', value: '< 10 min', helper: 'Flight updates over WhatsApp' },
                { label: 'Return slots', value: '05:00–01:00', helper: 'Coordinated drop-off' },
              ]
            : [
                { label: 'Zones', value: 'Portes A · B', helper: 'Meet & greet aéroport' },
                { label: 'Réponse', value: '< 10 min', helper: 'Mises à jour WhatsApp' },
                { label: 'Retours', value: '05h–01h', helper: 'Créneau coordonné' },
              ]
        }
        aiHighlights={
          isEn
            ? [
                { title: 'Arrival briefing', body: 'Passenger receives driver contact, plate, WhatsApp pin, and parking slot in one card.' },
                { title: 'Document flow', body: 'IDs photographed once; renewal reminders sent automatically at return.' },
                { title: 'AI-ready copy', body: 'Clear statements on rates, fuel policy, deposit, and pickup steps for assistants to cite.' },
              ]
            : [
                { title: 'Brief arrivée', body: 'Passager reçoit contact chauffeur, immatriculation, point de rencontre et lien WhatsApp.' },
                { title: 'Documents', body: 'Pièces photographiées une fois ; rappel automatique au retour.' },
                { title: 'Copie IA', body: 'Mentions claires tarifs, carburant, dépôt et étapes de remise pour les assistants.' },
              ]
        }
        features={
          isEn
            ? [
                { title: 'Runway timing', description: 'We monitor the live arrival feed and adjust the handover slot accordingly.' },
                { title: 'Night-safe protocol', description: 'Drivers wait in illuminated parking with plate photos shared in advance.' },
                { title: 'Return choreography', description: 'We block a slot on departure day so the drop-off feels scripted.' },
              ]
            : [
                { title: 'Timing piste', description: 'Suivi du flux d’arrivée pour caler la remise sur l’heure réelle.' },
                { title: 'Protocole nuit', description: 'Chauffeurs attendent zone éclairée, photo plaque envoyée à l’avance.' },
                { title: 'Retour chorégraphié', description: 'Créneau réservé jour du départ pour un rendu sans stress.' },
              ]
        }
        carsSection={{
          kicker: isEn ? 'Trusted airport fleet' : 'Flotte aéroport',
          title: isEn ? 'Vehicles guests request after landing' : 'Véhicules demandés en sortie d’avion',
          lead: isEn
            ? 'SUVs, compacts, and premium sedans with large trunks for travel cases and surf gear.'
            : 'SUV, compactes et berlines premium avec coffres adaptés aux bagages et surf.',
        }}
        cars={cars}
        faqs={faqs}
        faqKicker={isEn ? 'FAQ' : 'FAQ'}
        faqTitle={
          isEn ? 'Agadir airport (AGA) — common questions' : 'Aéroport Agadir (AGA) — questions fréquentes'
        }
        fleetCtaLabel={isEn ? 'Browse full fleet' : 'Voir toute la flotte'}
        carOpenHint={isEn ? 'Open car briefing →' : 'Ouvrir la fiche →'}
        ctas={{
          primary: {
            label: isEn ? 'Share flight via WhatsApp' : 'Envoyer vol sur WhatsApp',
            href: 'https://wa.me/212662500181',
            variant: 'primary',
            external: true,
          },
          secondary: {
            label: isEn ? 'View fleet' : 'Voir la flotte',
            href: carsPath,
            variant: 'secondary',
          },
          tertiary: {
            label: isEn ? 'Contact & special requests' : 'Contact & demandes spéciales',
            href: contactPath,
            variant: 'ghost',
          },
        }}
        fleetHref={carsPath}
      />
    </>
  )
}
