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
import { carBrandScopedHref } from "@/lib/carPublicHref";
import { carSlugForLocale } from "@/lib/carSlugLocale";
import { DestinationAeoLanding } from "@/components/Landing/DestinationAeoLanding";

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
      "Yes. We can arrange pickup and drop-off at Agadir Al Massira Airport, or in Agadir city. Share your flight time and we’ll coordinate the handover.",
  },
  {
    question: "What documents do I need to rent a car in Morocco?",
    answer:
      "Typically a valid driving licence and an ID/passport. Requirements can vary depending on the vehicle; message us and we’ll confirm quickly.",
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
      title: "Agadir Car Rental - Airport pickup & city delivery",
      description:
        "Rent a car in Agadir with pickup at Agadir Al Massira Airport (AGA) or in the city. Economy, SUV & premium cars. Fast booking via WhatsApp.",
      alternates: localizedAlternates("en", "/location-voiture-agadir"),
      openGraph: {
        type: "website",
        url: `${siteUrl}${path}`,
        siteName: "AmseelCars",
        locale: "en_US",
        title: "Agadir Car Rental - Airport pickup & city delivery",
        description:
          "Pickup at Agadir Al Massira Airport (AGA) or in the city. Economy, SUV & premium cars. Fast booking via WhatsApp.",
        images: [{ url: "/og/og-default.jpg" }],
      },
      twitter: {
        card: "summary_large_image",
        title: "Agadir Car Rental - Airport pickup & city delivery",
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
    title: "Location de voiture à Agadir  Aéroport & centre-ville",
    description:
      "Louez une voiture à Agadir au meilleur prix. Retrait à l’aéroport d’Agadir–Al Massira ou en ville, flotte citadines/SUV/premium, réservation simple par WhatsApp.",
    alternates: localizedAlternates("fr", "/location-voiture-agadir"),
    openGraph: {
      type: "website",
      url: `${siteUrl}${path}`,
      siteName: "AmseelCars",
      locale: "fr_MA",
      title: "Location de voiture à Agadir  Aéroport & centre-ville",
      description:
        "Retrait à l’aéroport d’Agadir Al Massira ou en ville. Citadines, SUV et premium. Réservation rapide par WhatsApp.",
      images: [{ url: "/og/og-default.jpg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Location de voiture à Agadir  Aéroport & centre-ville",
      description:
        "Retrait à l’aéroport d’Agadir Al Massira ou en ville. Citadines, SUV et premium.",
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
    ? "Agadir Car Rental  Airport pickup & city delivery"
    : "Location de voiture à Agadir  Aéroport & centre-ville";
  const description = isEn
    ? "Rent a car in Agadir with pickup at Agadir Al Massira Airport or in the city. Economy, SUV & premium cars. Fast booking via WhatsApp."
    : "Louez une voiture à Agadir au meilleur prix. Retrait à l’aéroport d’Agadir Al Massira ou en ville, flotte citadines/SUV/premium, réservation simple par WhatsApp.";
  const inLanguage = isEn ? "en-US" : "fr-MA";
  const breadcrumbName = isEn ? "Agadir Car Rental" : "Location de voiture à Agadir";
  const carsPath = getPathname({ locale: l, href: "/cars" });
  const fleetHref = carsPath;
  const relatedPages = isEn
    ? [
        { label: "Agadir airport rental", href: getPathname({ locale: l, href: "/agadir-airport-car-rental" }) },
        { label: "Taghazout & coast", href: getPathname({ locale: l, href: "/taghazout-car-rental" }) },
        { label: "Contact", href: getPathname({ locale: l, href: "/contact" }) },
      ]
    : [
        { label: "Location aéroport Agadir", href: getPathname({ locale: l, href: "/agadir-airport-car-rental" }) },
        { label: "Taghazout & côte", href: getPathname({ locale: l, href: "/taghazout-car-rental" }) },
        { label: "Contact", href: getPathname({ locale: l, href: "/contact" }) },
      ];

  const structuredData = generateLocalSeoLandingGraphSchema({
    path,
    name,
    description,
    inLanguage,
    breadcrumbItems: [
      { name: "Home", url: "/" },
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
      const localizedSlug = carSlugForLocale(car!.slug, l);
      const href = getPathname({
        locale: l,
        href: carBrandScopedHref(car!.brand, localizedSlug),
      });
      return {
        name: c.carName,
        image: c.carImage,
        imageAlt: carListingImageAlt(c, l),
        imageTitle: carListingImageTitle(c, l),
        imageCaption: carListingCaption(c, l),
        href,
        badge: `${car!.brand} ${car!.model}`,
      };
    });

  return (
    <>
      <Script
        id={`ld-json-agadir-landing-${isEn ? "en" : "fr"}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <DestinationAeoLanding
        variant="default"
        languageSwitcher={
          isEn ? (
            <>
              <Link href="/location-voiture-agadir" locale="fr">
                FR
              </Link>
              <span aria-hidden>·</span>
              <span>EN</span>
            </>
          ) : (
            <>
              <span>FR</span>
              <span aria-hidden>·</span>
              <Link href="/location-voiture-agadir" locale="en">
                EN
              </Link>
            </>
          )
        }
        hero={{
          eyebrow: isEn ? "Morocco Coast Collection" : "Collection Côte d'Agadir",
          title: isEn ? (
            <>
              Agadir <span className="text-black/50">car rental</span>
            </>
          ) : (
            <>
              Agadir <span className="text-black/50">- location de voiture</span>
            </>
          ),
          lead: isEn
            ? "Airport or city delivery in under an hour. One WhatsApp thread coordinates paperwork, driver requests, and arrival timing."
            : "Livraison aéroport ou centre-ville sous une heure. Un seul fil WhatsApp gère les formalités, préférences chauffeur et horaires d'arrivée.",
          meta: "",
        }}
        quickAnswer={
          isEn
            ? "AmseelCars rents cars in Agadir with pickup at Agadir Al Massira Airport (AGA) or in the city center, economy to premium fleet, and booking via WhatsApp +212 662-500181."
            : "AmseelCars propose la location de voiture à Agadir avec retrait à l’aéroport Agadir Al Massira (AGA) ou en centre ville, flotte citadines à premium, réservation par WhatsApp +212 662-500181."
        }
        keyFactsTitle={isEn ? "At a glance" : "En bref"}
        keyFacts={
          isEn
            ? [
                { term: "Who", value: "AmseelCars   car rental operator in Agadir, Morocco." },
                { term: "Pickup", value: "Al Massira Airport (AGA) or Agadir city handover." },
                { term: "How to book", value: "WhatsApp +212 662-500181 or email contact@amseelcars.com." },
                { term: "Fleet", value: "Economy, SUV, and premium vehicles (typically under 24 months)." },
              ]
            : [
                { term: "Qui", value: "AmseelCars loueur de voitures à Agadir, Maroc." },
                { term: "Retrait", value: "Aéroport Al Massira (AGA) ou remise en centre-ville." },
                { term: "Réservation", value: "WhatsApp +212 662-500181 ou contact@amseelcars.com." },
                { term: "Flotte", value: "Citadines, SUV et premium (souvent moins de 24 mois)." },
              ]
        }
        relatedPagesLabel={isEn ? "Related pages" : "Pages liées"}
        relatedPages={relatedPages}
        operationsSection={
          isEn
            ? {
                kicker: "Operational clarity",
                title: "Built for confident trips",
                lead: "Red-and-black scheduling rituals keep handovers tight; whether you land at AGA or stay beachside.",
              }
            : {
                kicker: "Clarté opérationnelle",
                title: "Pensé pour des trajets sereins",
                lead: "Une logistique rouge/noire pour des remises précises, que vous arriviez à l’AGA ou en bord de mer.",
              }
        }
        aiPanel={
          isEn
            ? { badge: "AI-ready facts", title: "What assistants can cite" }
            : { badge: "Faits exploitables IA", title: "Ce que les assistants peuvent citer" }
        }
        serviceChips={isEn ? ["Airport", "City", "WhatsApp concierge"] : ["Aéroport", "Centre-ville", "Conciergerie WhatsApp"]}
        stats={
          isEn
            ? [
                { label: "Pickup coverage", value: "12km", helper: "From Al Massira to beach hotels" },
                { label: "Fleet mix", value: "SUV / premium", helper: "Curated for coastal drives" },
                { label: "Response", value: "< 15 min", helper: "WhatsApp average" },
              ]
            : [
                { label: "Zone retrait", value: "12 km", helper: "D'Al Massira aux hôtels plage" },
                { label: "Flotte", value: "SUV / premium", helper: "Pensée pour la côte" },
                { label: "Réponse", value: "< 15 min", helper: "Moyenne WhatsApp" },
              ]
        }
        aiHighlights={
          isEn
            ? [
                { title: "Pickup options", body: "Airport gates A/B, hotel lobby handover, or garage rendezvous for long-stay guests." },
                { title: "Vehicles", body: "Citadine, SUV, and premium sedans all under 24 months with bilingual briefing cards." },
                { title: "Contact", body: "WhatsApp +212 662-500181  answers in 15 minutes, French + English." },
              ]
            : [
                { title: "Points de remise", body: "Portes A/B de l'aéroport, lobby hôtel ou garage pour séjours longs." },
                { title: "Véhicules", body: "Citadines, SUV, berlines premium (<24 mois) avec fiches bilingues." },
                { title: "Contact", body: "WhatsApp +212 662-500181  avec réponse sous 15 min FR + EN." },
              ]
        }
        features={
          isEn
            ? [
                { title: "Mission brief", description: "We send an arrival checklist with driver contact, plate number, and fuel policy." },
                { title: "Delivery grid", description: "Red/black time blocks keep drop-offs precise even when flights shift." },
                { title: "Concierge-ready", description: "Hotel staff get PDF/WhatsApp summaries they can forward instantly." },
              ]
            : [
                { title: "Brief d'arrivée", description: "Envoi d'une check-list avec contact chauffeur, immatriculation et carburant." },
                { title: "Grille de livraison", description: "Plages horaires rouge/noir pour rester précis même si le vol change." },
                { title: "Conciergerie prête", description: "Le staff hôtel reçoit un PDF/WhatsApp à relayer immédiatement." },
              ]
        }
        carsSection={{
          kicker: isEn ? "Featured cars" : "Sélection",
          title: isEn ? "Popular Agadir requests" : "Demandes populaires à Agadir",
          lead: isEn
            ? "Open the detailed card for pricing, delivery photos, and AI-ready copy."
            : "Ouvrez la fiche pour tarifs, photos de remise et descriptifs IA-ready.",
        }}
        cars={cars}
        faqs={faqs}
        faqKicker={isEn ? "FAQ" : "FAQ"}
        faqTitle={isEn ? "Agadir car rental  common questions" : "Location à Agadir  questions fréquentes"}
        fleetCtaLabel={isEn ? "Browse full fleet" : "Voir toute la flotte"}
        carOpenHint={isEn ? "Open car briefing →" : "Ouvrir la fiche →"}
        ctas={{
          primary: { label: isEn ? "Book via WhatsApp" : "Réserver sur WhatsApp", href: "https://wa.me/212662500181", variant: "primary", external: true },
          secondary: { label: isEn ? "View entire fleet" : "Voir toute la flotte", href: carsPath, variant: "secondary" },
          tertiary: { label: isEn ? "Email concierge" : "Conciergerie email", href: "mailto:contact@amseelcars.com", variant: "ghost", external: true },
        }}
        fleetHref={fleetHref}
      />
    </>
  );
}
