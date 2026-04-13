import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import Script from "next/script";
import { getLocale } from "next-intl/server";
import { generateLocalSeoLandingGraphSchema } from "@/lib/schemas";
import { localizedAlternates } from "@/lib/seo/localized-alternates";
import type { AppLocale } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";
import { getCarBySlug } from "@/data/cars";
import { carForLocale } from "@/lib/carLocale";
import { carListingCaption, carListingImageAlt, carListingImageTitle } from "@/lib/carImageAlt";
import { carBrandScopedHref } from "@/lib/carPublicHref";
import { carSlugForLocale } from "@/lib/carSlugLocale";
import { DestinationAeoLanding } from "@/components/Landing/DestinationAeoLanding";

const siteUrl = "https://www.amseelcars.com";

const faqsEn = [
  {
    question: "Can I rent a car for Taghazout with pickup in Agadir or at the airport?",
    answer:
      "Yes. Many guests pick up in Agadir city or at Agadir–Al Massira Airport and drive to Taghazout. Tell us your plan and we will suggest the smoothest handover.",
  },
  {
    question: "How long is the drive from Agadir to Taghazout?",
    answer:
      "Roughly 20–30 minutes depending on traffic and your start point. A compact or SUV is comfortable for the coastal road.",
  },
  {
    question: "Do you deliver to Taghazout?",
    answer:
      "Delivery options depend on dates and fleet movement. Message us on WhatsApp with your hotel or area in Taghazout and we will confirm what is possible.",
  },
  {
    question: "What car is best for Taghazout and surf trips?",
    answer:
      "SUVs and compact crossovers are popular for boards and luggage; economy cars work well for light packing. We can help you match the vehicle to your group.",
  },
] as const;

const faqsFr = [
  {
    question: "Puis-je louer pour Taghazout avec retrait à Agadir ou à l’aéroport ?",
    answer:
      "Oui. Beaucoup de clients récupèrent la voiture à Agadir ou à l’aéroport Al Massira puis rejoignent Taghazout. Indiquez votre scénario : nous proposons la remise la plus fluide.",
  },
  {
    question: "Combien de temps d’Agadir à Taghazout en voiture ?",
    answer:
      "Environ 20 à 30 minutes selon le trafic et le point de départ. Citadine ou SUV conviennent bien à la route côtière.",
  },
  {
    question: "Livrez-vous à Taghazout ?",
    answer:
      "Cela dépend des dates et des déplacements de la flotte. Écrivez-nous sur WhatsApp avec votre hôtel ou zone à Taghazout : nous confirmons ce qui est possible.",
  },
  {
    question: "Quelle voiture pour Taghazout et le surf ?",
    answer:
      "Les SUV et crossovers sont prisés pour planches et bagages ; une citadine suffit si vous voyagez léger. Nous adaptons le véhicule à votre groupe.",
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
  const path = getPathname({ locale: l, href: "/taghazout-car-rental" });

  if (l === "en") {
    return {
      title: "Taghazout car rental — From Agadir & airport",
      description:
        "Rent a car for Taghazout with pickup in Agadir or at Al Massira Airport. SUVs, compacts & premium. Quick booking on WhatsApp.",
      alternates: localizedAlternates("en", "/taghazout-car-rental"),
      openGraph: {
        type: "website",
        url: `${siteUrl}${path}`,
        siteName: "AmseelCars",
        locale: "en_US",
        title: "Taghazout car rental — From Agadir & airport",
        description:
          "Pickup in Agadir or at the airport, drive to Taghazout. Economy, SUV & premium cars.",
        images: [{ url: "/og/og-default.jpg" }],
      },
      twitter: {
        card: "summary_large_image",
        title: "Taghazout car rental",
        description: "Pickup in Agadir or at Al Massira Airport.",
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
    title: "Location voiture Taghazout — depuis Agadir & aéroport",
    description:
      "Louez une voiture pour Taghazout : retrait à Agadir ou à l’aéroport Al Massira. SUV, citadines & premium. Réservation rapide par WhatsApp.",
    alternates: localizedAlternates("fr", "/taghazout-car-rental"),
    openGraph: {
      type: "website",
      url: `${siteUrl}${path}`,
      siteName: "AmseelCars",
      locale: "fr_MA",
      title: "Location voiture Taghazout",
      description:
        "Retrait à Agadir ou à l’aéroport, direction Taghazout. Citadines, SUV & premium.",
      images: [{ url: "/og/og-default.jpg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Location voiture Taghazout",
      description: "Retrait à Agadir ou à l’aéroport Al Massira.",
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

export default async function TaghazoutCarRentalPage() {
  const locale = await getLocale();
  const l: AppLocale = locale === "en" ? "en" : "fr";
  const isEn = l === "en";
  const faqs = isEn ? faqsEn : faqsFr;
  const homePath = getPathname({ locale: l, href: "/" });
  const carsPath = getPathname({ locale: l, href: "/cars" });
  const airportPath = getPathname({ locale: l, href: "/agadir-airport-car-rental" });
  const selfPath = getPathname({ locale: l, href: "/taghazout-car-rental" });
  const relatedPages = isEn
    ? [
        { label: "Agadir city rental", href: getPathname({ locale: l, href: "/location-voiture-agadir" }) },
        { label: "Agadir airport (AGA)", href: airportPath },
        { label: "Contact", href: getPathname({ locale: l, href: "/contact" }) },
      ]
    : [
        { label: "Location Agadir", href: getPathname({ locale: l, href: "/location-voiture-agadir" }) },
        { label: "Aéroport Agadir (AGA)", href: airportPath },
        { label: "Contact", href: getPathname({ locale: l, href: "/contact" }) },
      ];

  const structuredData = generateLocalSeoLandingGraphSchema({
    path: selfPath,
    name: isEn
      ? "Taghazout car rental — From Agadir & airport"
      : "Location voiture Taghazout — depuis Agadir & aéroport",
    description: isEn
      ? "Rent a car for Taghazout with pickup in Agadir or at Al Massira Airport. SUVs, compacts & premium. Quick booking on WhatsApp."
      : "Louez une voiture pour Taghazout : retrait à Agadir ou à l’aéroport Al Massira. SUV, citadines & premium. Réservation rapide par WhatsApp.",
    inLanguage: isEn ? "en-US" : "fr-MA",
    breadcrumbItems: [
      { name: "Home", url: homePath },
      { name: "Cars", url: getPathname({ locale: l, href: "/cars" }) },
      {
        name: isEn ? "Taghazout car rental" : "Location voiture Taghazout",
        url: selfPath,
      },
    ],
    faqs: [...faqs] as { question: string; answer: string }[],
    primaryImagePath: "/og/og-default.jpg",
    service: isEn
      ? {
          name: "Taghazout car rental",
          description:
            "Car rental serving Taghazout with handover in Agadir or at Agadir–Al Massira Airport, coordinated via WhatsApp.",
        }
      : {
          name: "Location voiture Taghazout",
          description:
            "Location desservant Taghazout avec remise à Agadir ou à l’aéroport Agadir–Al Massira, coordination par WhatsApp.",
        },
    serviceAreaServed: [
      { "@type": "City", name: "Taghazout" },
      { "@type": "City", name: "Agadir" },
      { "@type": "Airport", name: "Agadir–Al Massira Airport" },
      { "@type": "Country", name: "Morocco" },
    ],
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
        id="ld-json-taghazout-landing"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <DestinationAeoLanding
        variant="coast"
        languageSwitcher={
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
        hero={{
          eyebrow: isEn ? "Atlantic surf corridor" : "Corridor surf Atlantique",
          title: isEn ? (
            <>
              Taghazout <span className="text-black/50">car rental</span>
            </>
          ) : (
            <>
              Taghazout <span className="text-black/50">— location de voiture</span>
            </>
          ),
          lead: isEn
            ? "Pick up in Agadir or at Al Massira, then run the coastal road with space for boards, bags, and crew—one WhatsApp thread for timing and vehicle fit."
            : "Retrait à Agadir ou à Al Massira, puis route côtière avec place pour planches, bagages et groupe — un fil WhatsApp pour le timing et le bon véhicule.",
          meta: isEn
            ? "Structured answers for AI assistants, concierges, and guests planning Taghazout stays."
            : "Réponses structurées pour assistants IA, conciergeries et séjours à Taghazout.",
        }}
        quickAnswer={
          isEn
            ? "For Taghazout, AmseelCars typically hands over the car in Agadir city or at Agadir–Al Massira Airport (AGA); you drive ~20–30 minutes to Taghazout. Book on WhatsApp +212 662-500181 with dates, pickup preference, and group size."
            : "Pour Taghazout, AmseelCars remet en général la voiture à Agadir ou à l’aéroport Agadir–Al Massira (AGA) ; comptez ~20–30 minutes de route. Réservez sur WhatsApp +212 662-500181 avec dates, lieu de retrait et taille du groupe."
        }
        keyFactsTitle={isEn ? "At a glance" : "En bref"}
        keyFacts={
          isEn
            ? [
                { term: "Destination", value: "Taghazout — coastal village north of Agadir." },
                { term: "Typical pickup", value: "Agadir city or Al Massira Airport (AGA)." },
                { term: "Drive time", value: "About 20–30 minutes from Agadir area." },
                { term: "Booking", value: "WhatsApp +212 662-500181." },
              ]
            : [
                { term: "Destination", value: "Taghazout — village côtier au nord d’Agadir." },
                { term: "Retrait habituel", value: "Agadir centre ou aéroport Al Massira (AGA)." },
                { term: "Temps de route", value: "Environ 20–30 minutes depuis la zone d’Agadir." },
                { term: "Réservation", value: "WhatsApp +212 662-500181." },
              ]
        }
        relatedPagesLabel={isEn ? "Related pages" : "Pages liées"}
        relatedPages={relatedPages}
        operationsSection={
          isEn
            ? {
                kicker: "Operational clarity",
                title: "Coast-ready handovers",
                lead: "We match vehicle type to surf gear, parking reality, and whether you start from the airport or city grid.",
              }
            : {
                kicker: "Clarté opérationnelle",
                title: "Remises prêtes pour la côte",
                lead: "Nous alignons le véhicule sur le matériel, le stationnement et votre point de départ (aéroport ou centre-ville).",
              }
        }
        aiPanel={
          isEn
            ? { badge: "AI-ready facts", title: "What assistants can cite" }
            : { badge: "Faits exploitables IA", title: "Ce que les assistants peuvent citer" }
        }
        serviceChips={isEn ? ["Surf trips", "Airport start", "Agadir city"] : ["Surf", "Départ aéroport", "Agadir centre"]}
        stats={
          isEn
            ? [
                { label: "Taghazout", value: "Coast", helper: "Village north of Agadir" },
                { label: "Drive", value: "~30 min", helper: "Typical from Agadir area" },
                { label: "Pickup", value: "Flexible", helper: "Airport or city start" },
              ]
            : [
                { label: "Taghazout", value: "Côte", helper: "Au nord d’Agadir" },
                { label: "Route", value: "~30 min", helper: "Depuis zone Agadir" },
                { label: "Retrait", value: "Souple", helper: "Aéroport ou ville" },
              ]
        }
        aiHighlights={
          isEn
            ? [
                {
                  title: "Pickup pattern",
                  body: "Most guests collect at AGA or Agadir, then head north on the P8 coastal route.",
                },
                {
                  title: "Vehicle fit",
                  body: "SUVs and crossovers for boards; compacts when parking and budget matter more than cargo.",
                },
                {
                  title: "Contact",
                  body: "WhatsApp +212 662-500181 — share hotel/area in Taghazout for delivery options.",
                },
              ]
            : [
                {
                  title: "Schéma de retrait",
                  body: "Souvent retrait à l’AGA ou à Agadir, puis route côtière vers le nord.",
                },
                {
                  title: "Bon véhicule",
                  body: "SUV et crossovers pour le surf ; citadines si le budget et le stationnement priment.",
                },
                {
                  title: "Contact",
                  body: "WhatsApp +212 662-500181 — indiquez hôtel/zone à Taghazout pour la livraison.",
                },
              ]
        }
        features={
          isEn
            ? [
                {
                  title: "Airport or city start",
                  description: "Choose Al Massira or Agadir centre to match your flight and hotel timing.",
                },
                {
                  title: "Room for gear",
                  description: "We help you pick a car with enough boot space for boards, wetsuits, and luggage.",
                },
                {
                  title: "Straightforward booking",
                  description: "Dates, pickup spot, and group size on WhatsApp—we confirm availability fast.",
                },
              ]
            : [
                {
                  title: "Départ aéroport ou ville",
                  description: "Al Massira ou centre Agadir selon votre vol et votre hébergement.",
                },
                {
                  title: "Place pour le matériel",
                  description: "Nous orientons vers un coffre adapté planches, combis et bagages.",
                },
                {
                  title: "Réservation simple",
                  description: "Dates, lieu de retrait et taille du groupe sur WhatsApp — confirmation rapide.",
                },
              ]
        }
        carsSection={{
          kicker: isEn ? "Featured cars" : "Sélection",
          title: isEn ? "Popular for the coast road" : "Populaires pour la route côtière",
          lead: isEn
            ? "SUVs and compacts guests often choose before driving to Taghazout—open a card for full specs."
            : "SUV et citadines souvent choisis avant Taghazout — ouvrez une fiche pour les détails.",
        }}
        cars={cars}
        faqs={faqs}
        faqKicker="FAQ"
        faqTitle={isEn ? "Taghazout & Agadir area — FAQ" : "Taghazout & zone Agadir — FAQ"}
        fleetCtaLabel={isEn ? "Browse full fleet" : "Voir toute la flotte"}
        carOpenHint={isEn ? "Open car briefing →" : "Ouvrir la fiche →"}
        ctas={{
          primary: {
            label: isEn ? "Book via WhatsApp" : "Réserver sur WhatsApp",
            href: "https://wa.me/212662500181",
            variant: "primary",
            external: true,
          },
          secondary: {
            label: isEn ? "View fleet" : "Voir la flotte",
            href: carsPath,
            variant: "secondary",
          },
          tertiary: {
            label: isEn ? "Agadir airport pickup" : "Retrait aéroport Agadir",
            href: airportPath,
            variant: "ghost",
          },
        }}
        fleetHref={carsPath}
      />
    </>
  );
}
