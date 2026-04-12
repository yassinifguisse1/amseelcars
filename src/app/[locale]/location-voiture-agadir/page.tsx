import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import Script from "next/script";
import { getLocale } from "next-intl/server";
import { localizedAlternates } from "@/lib/seo/localized-alternates";
import type { AppLocale } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";
import { generateLocalSeoLandingGraphSchema } from "@/lib/schemas";
import { getCarBySlug } from "@/data/cars";
import { carForLocale } from "@/lib/carLocale";
import {
  carListingCaption,
  carListingImageAlt,
  carListingImageTitle,
} from "@/lib/carImageAlt";
import { AgadirLandingShell } from "@/components/Landing/AgadirLandingShell";
import styles from "@/components/Landing/agadir-landing.module.css";

const siteUrl = "https://www.amseelcars.com";

const faqsFr = [
  {
    question: "Quel est le prix d’une location de voiture à Agadir ?",
    answer:
      "Le prix dépend du modèle, de la durée et de la saison. Chez AmseelCars, vous pouvez choisir des citadines, SUV ou premium, avec des tarifs clairs et une réservation rapide par WhatsApp.",
  },
  {
    question:
      "Puis-je récupérer la voiture à l’aéroport d’Agadir (Al Massira) ?",
    answer:
      "Oui. Nous proposons la livraison/retrait à l’aéroport d’Agadir–Al Massira ainsi qu’en ville. Indiquez votre heure d’arrivée et nous organisons la remise des clés.",
  },
  {
    question: "Quels documents faut-il pour louer une voiture au Maroc ?",
    answer:
      "Généralement, un permis de conduire valide et une pièce d’identité (ou passeport). Selon le véhicule, des conditions peuvent s’appliquer. Contactez-nous pour une confirmation rapide.",
  },
  {
    question: "Est-ce que la réservation est possible via WhatsApp ?",
    answer:
      "Oui. Envoyez-nous vos dates, le lieu (aéroport/ville) et le modèle souhaité. Nous vous répondons rapidement avec la disponibilité et les étapes de réservation.",
  },
] as const;

const faqsEn = [
  {
    question: "How much does a car rental in Agadir cost?",
    answer:
      "Pricing depends on the car category, rental length, and season. AmseelCars offers economy, SUV, and premium options with clear pricing and fast booking via WhatsApp.",
  },
  {
    question: "Can I pick up the car at Agadir Al Massira Airport?",
    answer:
      "Yes. We can arrange pickup and drop-off at Agadir–Al Massira Airport, or in Agadir city. Share your flight time and we’ll coordinate the handover.",
  },
  {
    question: "What documents do I need to rent a car in Morocco?",
    answer:
      "Typically a valid driving licence and an ID/passport. Requirements can vary depending on the vehicle—message us and we’ll confirm quickly.",
  },
  {
    question: "Can I book through WhatsApp?",
    answer:
      "Yes. Send your dates, pickup location (airport/city), and preferred car. We’ll reply with availability and the next steps.",
  },
] as const;

const FEATURED_SLUGS = [
  "location-voiture-agadir-bmw-x3-pack-m",
  "location-voiture-agadir-t-roc",
  "location-voiture-agadir-sandero-stepway",
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: AppLocale = locale === "en" ? "en" : "fr";
  const path = getPathname({ locale: l, href: "/location-voiture-agadir" });

  if (locale === "en") {
    return {
      title: "Agadir Car Rental — Airport pickup & city delivery",
      description:
        "Rent a car in Agadir with pickup at Agadir–Al Massira Airport or in the city. Economy, SUV & premium cars. Fast booking via WhatsApp.",
      alternates: localizedAlternates("en", "/location-voiture-agadir"),
      openGraph: {
        type: "website",
        url: `${siteUrl}${path}`,
        siteName: "AmseelCars",
        locale: "en_US",
        title: "Agadir Car Rental — Airport pickup & city delivery",
        description:
          "Pickup at Agadir–Al Massira Airport or in the city. Economy, SUV & premium cars. Fast booking via WhatsApp.",
        images: [{ url: "/og/og-default.jpg" }],
      },
      twitter: {
        card: "summary_large_image",
        title: "Agadir Car Rental — Airport pickup & city delivery",
        description:
          "Pickup at the airport or in Agadir city. Economy, SUV & premium cars.",
        images: ["/og/og-default.jpg"],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-snippet": -1,
          "max-image-preview": "large",
          "max-video-preview": -1,
        },
      },
    };
  }

  return {
    title: "Location de voiture à Agadir — Aéroport & centre-ville",
    description:
      "Louez une voiture à Agadir au meilleur prix. Retrait à l’aéroport d’Agadir–Al Massira ou en ville, flotte citadines/SUV/premium, réservation simple par WhatsApp.",
    alternates: localizedAlternates("fr", "/location-voiture-agadir"),
    openGraph: {
      type: "website",
      url: `${siteUrl}${path}`,
      siteName: "AmseelCars",
      locale: "fr_MA",
      title: "Location de voiture à Agadir — Aéroport & centre-ville",
      description:
        "Retrait à l’aéroport d’Agadir–Al Massira ou en ville. Citadines, SUV et premium. Réservation rapide par WhatsApp.",
      images: [{ url: "/og/og-default.jpg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Location de voiture à Agadir — Aéroport & centre-ville",
      description:
        "Retrait à l’aéroport d’Agadir–Al Massira ou en ville. Citadines, SUV et premium.",
      images: ["/og/og-default.jpg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
  };
}

export default async function LocationVoitureAgadirPage() {
  const locale = await getLocale();
  const isEn = locale === "en";
  const l = isEn ? "en" : "fr";

  const faqs = isEn ? faqsEn : faqsFr;
  const path = isEn ? "/agadir-car-rental" : "/location-voiture-agadir";
  const name = isEn
    ? "Agadir Car Rental — Airport pickup & city delivery"
    : "Location de voiture à Agadir — Aéroport & centre-ville";
  const description = isEn
    ? "Rent a car in Agadir with pickup at Agadir–Al Massira Airport or in the city. Economy, SUV & premium cars. Fast booking via WhatsApp."
    : "Louez une voiture à Agadir au meilleur prix. Retrait à l’aéroport d’Agadir–Al Massira ou en ville, flotte citadines/SUV/premium, réservation simple par WhatsApp.";
  const inLanguage = isEn ? "en-US" : "fr-MA";
  const breadcrumbName = isEn ? "Agadir Car Rental" : "Location de voiture à Agadir";
  const carsPath = isEn ? "/cars" : "/voitures";
  const contactPath = "/contact";

  const structuredData = generateLocalSeoLandingGraphSchema({
    path,
    name,
    description,
    inLanguage,
    breadcrumbItems: [
      { name: "Home", url: isEn ? "/home" : "/" },
      { name: "Cars", url: carsPath },
      { name: breadcrumbName, url: path },
    ],
    faqs: [...faqs],
    primaryImagePath: "/og/og-default.jpg",
    service: isEn
      ? {
          name: "Agadir car rental",
          description:
            "Car rental in Agadir with airport or city pickup, WhatsApp booking, and economy to premium vehicles.",
        }
      : {
          name: "Location de voiture à Agadir",
          description:
            "Location de véhicules à Agadir avec retrait à l’aéroport Al Massira ou en ville, réservation par WhatsApp, flotte citadines, SUV et premium.",
        },
  });

  const cars = FEATURED_SLUGS.map((slug) => getCarBySlug(slug))
    .filter(Boolean)
    .map((car) => {
      const c = carForLocale(car!, l);
      return {
        slug: c.slug,
        name: c.carName,
        image: c.carImage,
        imageAlt: carListingImageAlt(c, l),
        imageTitle: carListingImageTitle(c, l),
        imageCaption: carListingCaption(c, l),
      };
    });

  if (isEn) {
    return (
      <>
        <Script
          id="ld-json-agadir-landing-en"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        <AgadirLandingShell
          variant="city"
          fleetHref={carsPath}
          langSlot={
            <>
              <Link href="/location-voiture-agadir" locale="fr">
                FR
              </Link>
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
            { href: carsPath, label: "Browse fleet", variant: "primary" },
            { href: contactPath, label: "Get a quote", variant: "secondary" },
            {
              href: "https://wa.me/212662500181",
              label: "WhatsApp",
              variant: "whatsapp",
            },
          ]}
          stats={[
            { value: "Airport", label: "Al Massira pickup" },
            { value: "City", label: "Downtown handover" },
            { value: "Flexible", label: "Rental lengths" },
          ]}
          featuresKicker="Why AmseelCars"
          featuresTitle="Built around how you travel"
          featuresLead="From landing to checkout, we align pickup location, vehicle type, and messaging so you can focus on the coast—not paperwork."
          features={[
            {
              icon: "pin",
              title: "Pickup that fits your plan",
              description:
                "Airport, hotel, or neighbourhood handover—timed around your arrival and schedule.",
            },
            {
              icon: "fleet",
              title: "The right car for the road",
              description:
                "Economy for city hops, SUVs for comfort, premium options when you want extra space and refinement.",
            },
            {
              icon: "bolt",
              title: "Fast, human replies",
              description:
                "Share dates, location, and preferred model—we confirm availability and next steps without back-and-forth friction.",
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
    );
  }

  return (
    <>
      <Script
        id="ld-json-agadir-landing-fr"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <AgadirLandingShell
        variant="city"
        fleetHref={carsPath}
        statsAsideLabel="En bref"
        langSlot={
          <>
            <span>FR</span>
            <span aria-hidden>·</span>
            <Link href="/location-voiture-agadir" locale="en">
              EN
            </Link>
          </>
        }
        heroTitle={
          <>
            <span className={styles.heroTitleAccent}>Agadir</span>
            <span className={styles.heroHeadlineRest}>
              {" "}
              — location de voiture
            </span>
          </>
        }
        heroLead="Réservez en quelques messages : retrait à l’aéroport Al Massira ou en centre-ville, flotte du quotidien au premium, accompagnement WhatsApp."
        ctas={[
          { href: carsPath, label: "Voir la flotte", variant: "primary" },
          {
            href: contactPath,
            label: "Demander un devis",
            variant: "secondary",
          },
          {
            href: "https://wa.me/212662500181",
            label: "WhatsApp",
            variant: "whatsapp",
          },
        ]}
        stats={[
          { value: "Al Massira", label: "Retrait aéroport" },
          { value: "Ville", label: "Remise en centre-ville" },
          { value: "Sur mesure", label: "Durées flexibles" },
        ]}
        featuresKicker="Pourquoi AmseelCars"
        featuresTitle="Une location pensée pour Agadir"
        featuresLead="Du vol à la route : nous adaptons le retrait, le véhicule et le suivi à votre séjour sur la côte."
        features={[
          {
            icon: "pin",
            title: "Retrait où vous êtes",
            description:
              "Aéroport Agadir–Al Massira, hôtel ou quartier : on synchronise la remise des clés sur votre horaire.",
          },
          {
            icon: "fleet",
            title: "Flotte pour chaque trajet",
            description:
              "Citadine pour la ville, SUV pour la route, berlines premium pour voyager confortablement.",
          },
          {
            icon: "bolt",
            title: "Réponse rapide",
            description:
              "Dates, lieu, modèle : nous confirmons la disponibilité et les prochaines étapes sans friction.",
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
  );
}
