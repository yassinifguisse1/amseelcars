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
    question: 'Quel est le prix d’une location de voiture à Agadir ?',
    answer:
      'Le prix dépend du modèle, de la durée et de la saison. Chez AmseelCars, vous pouvez choisir des citadines, SUV ou premium, avec des tarifs clairs et une réservation rapide par WhatsApp.',
  },
  {
    question: 'Puis-je récupérer la voiture à l’aéroport d’Agadir (Al Massira) ?',
    answer:
      'Oui. Nous proposons la livraison/retrait à l’aéroport d’Agadir–Al Massira ainsi qu’en ville. Indiquez votre heure d’arrivée et nous organisons la remise des clés.',
  },
  {
    question: 'Quels documents faut-il pour louer une voiture au Maroc ?',
    answer:
      'Généralement, un permis de conduire valide et une pièce d’identité (ou passeport). Selon le véhicule, des conditions peuvent s’appliquer. Contactez-nous pour une confirmation rapide.',
  },
  {
    question: 'Est-ce que la réservation est possible via WhatsApp ?',
    answer:
      'Oui. Envoyez-nous vos dates, le lieu (aéroport/ville) et le modèle souhaité. Nous vous répondons rapidement avec la disponibilité et les étapes de réservation.',
  },
] as const

const FEATURED_SLUGS = [
  'location-voiture-agadir-bmw-x3-pack-m',
  'location-voiture-agadir-t-roc',
  'location-voiture-agadir-sandero-stepway',
] as const

export const metadata: Metadata = {
  title: 'Location de voiture à Agadir — Aéroport & centre-ville',
  description:
    'Louez une voiture à Agadir au meilleur prix. Retrait à l’aéroport d’Agadir–Al Massira ou en ville, flotte citadines/SUV/premium, réservation simple par WhatsApp.',
  alternates: {
    canonical: '/location-voiture-agadir',
    languages: {
      'fr-MA': '/location-voiture-agadir',
      en: '/agadir-car-rental',
    },
  },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/location-voiture-agadir`,
    siteName: 'AmseelCars',
    locale: 'fr_MA',
    title: 'Location de voiture à Agadir — Aéroport & centre-ville',
    description:
      'Retrait à l’aéroport d’Agadir–Al Massira ou en ville. Citadines, SUV et premium. Réservation rapide par WhatsApp.',
    images: [{ url: '/og/og-default.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Location de voiture à Agadir — Aéroport & centre-ville',
    description:
      'Retrait à l’aéroport d’Agadir–Al Massira ou en ville. Citadines, SUV et premium.',
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

export default function LocationVoitureAgadirPage() {
  const structuredData = generateLocalSeoLandingGraphSchema({
    path: '/location-voiture-agadir',
    name: 'Location de voiture à Agadir — Aéroport & centre-ville',
    description:
      'Louez une voiture à Agadir au meilleur prix. Retrait à l’aéroport d’Agadir–Al Massira ou en ville, flotte citadines/SUV/premium, réservation simple par WhatsApp.',
    inLanguage: 'fr-MA',
    breadcrumbItems: [
      { name: 'Home', url: '/' },
      { name: 'Cars', url: '/cars' },
      { name: 'Location de voiture à Agadir', url: '/location-voiture-agadir' },
    ],
    faqs: [...faqs],
    primaryImagePath: '/og/og-default.jpg',
    service: {
      name: 'Location de voiture à Agadir',
      description:
        'Location de véhicules à Agadir avec retrait à l’aéroport Al Massira ou en ville, réservation par WhatsApp, flotte citadines, SUV et premium.',
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
        id="ld-json-agadir-landing-fr"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <AgadirLandingShell
        variant="city"
        statsAsideLabel="En bref"
        langSlot={
          <>
            <span>FR</span>
            <span aria-hidden>·</span>
            <Link href="/agadir-car-rental">EN</Link>
          </>
        }
        heroTitle={
          <>
            <span className={styles.heroTitleAccent}>Agadir</span>
            <span className={styles.heroHeadlineRest}> — location de voiture</span>
          </>
        }
        heroLead="Réservez en quelques messages : retrait à l’aéroport Al Massira ou en centre-ville, flotte du quotidien au premium, accompagnement WhatsApp."
        ctas={[
          { href: '/cars', label: 'Voir la flotte', variant: 'primary' },
          { href: '/contact', label: 'Demander un devis', variant: 'secondary' },
          { href: 'https://wa.me/212662500181', label: 'WhatsApp', variant: 'whatsapp' },
        ]}
        stats={[
          { value: 'Al Massira', label: 'Retrait aéroport' },
          { value: 'Ville', label: 'Remise en centre-ville' },
          { value: 'Sur mesure', label: 'Durées flexibles' },
        ]}
        featuresKicker="Pourquoi AmseelCars"
        featuresTitle="Une location pensée pour Agadir"
        featuresLead="Du vol à la route : nous adaptons le retrait, le véhicule et le suivi à votre séjour sur la côte."
        features={[
          {
            icon: 'pin',
            title: 'Retrait où vous êtes',
            description:
              'Aéroport Agadir–Al Massira, hôtel ou quartier : on synchronise la remise des clés sur votre horaire.',
          },
          {
            icon: 'fleet',
            title: 'Flotte pour chaque trajet',
            description:
              'Citadine pour la ville, SUV pour la route, berlines premium pour voyager confortablement.',
          },
          {
            icon: 'bolt',
            title: 'Réponse rapide',
            description:
              'Dates, lieu, modèle : nous confirmons la disponibilité et les prochaines étapes sans friction.',
          },
        ]}
        carsKicker="Sélection"
        carsTitle="Modèles souvent réservés à Agadir"
        carsLead="Accédez directement à des véhicules populaires, ou parcourez toute la flotte."
        cars={cars}
        fleetLinkLabel="Voir toute la flotte"
        carDetailHint="Voir la fiche"
        faqTitle="Questions fréquentes — location à Agadir"
        faqs={faqs}
      />
    </>
  )
}
