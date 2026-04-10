"use client";
/*
 * SEO note: All copy below is real DOM text (<h2>, <p>, <li>, etc.). Googlebot executes
 * JavaScript and indexes this content like normal HTML. Opacity/scroll on a wrapper does
 * not remove text from the HTML source — avoid replacing body copy with images-only text.
 */

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, type MotionValue } from "framer-motion";
import { Phone, MessageCircle, Mail } from "lucide-react";
import { generateFAQSchema } from "@/lib/faqSchema";
import { cn } from "@/lib/utils";

/* =============================================================================
   SEO BLOCK: Trust bar (after hero, before BMW/Kia showcase)
   ============================================================================= */
export function HomeSeoTrustBar() {
  const items = [
    "Livraison aéroport / hôtel",
    "Assistance 24/7",
    "Tarifs clairs",
    "Véhicules récents",
  ];
  return (
    <section
      aria-label="Engagements AMSEEL CARS"
      className="w-full border-y border-white/10 bg-[#0a0a0a] py-4 md:py-5"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 text-center text-[12px] font-medium uppercase tracking-[0.16em] text-white/85 sm:text-[13px] md:text-sm">
        {items.map((label) => (
          <span key={label} className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#CB1939]" aria-hidden />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}

/* =============================================================================
   SEO BLOCK: Main intro — used inside BMW scroll (before “Votre Trajet Idéal”)
   ============================================================================= */
interface HomeSeoMainIntroOverlayProps {
  opacity: MotionValue<number>;
}

export function HomeSeoMainIntroOverlay({ opacity }: HomeSeoMainIntroOverlayProps) {
  const [seoInteractive, setSeoInteractive] = useState(false);
  useLayoutEffect(() => {
    setSeoInteractive(opacity.get() > 0.04);
  }, [opacity]);
  useMotionValueEvent(opacity, "change", (latest) => {
    setSeoInteractive(latest > 0.04);
  });

  const bullets = [
    "Citadines économiques",
    "Voitures automatiques",
    "SUV et familiales",
    "Modèles premium",
  ];
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[24] flex items-center justify-center px-3 sm:px-4"
      style={{ opacity }}
    >
      {/* Same cinematic language as “Votre Trajet Idéal”: no card — type on the section background.
          pointer-events-auto only while visible: when opacity ~0, let clicks reach car CTAs below. */}
      <div
        className={`mx-auto w-full max-w-[min(100%,58rem)] cursor-default select-text px-1 text-center sm:max-w-[64rem] md:max-w-[72rem] ${
          seoInteractive ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <h2
          className="font-bold leading-[1.12] text-gray-800 [text-wrap:balance]
                     text-[clamp(26px,6.5vw,54px)] md:text-[clamp(32px,5.8vw,64px)] lg:text-[clamp(36px,5.2vw,76px)]"
        >
          Location de{" "}
          <span className="text-red-600">voiture</span>
          {" "}à Agadir au{" "}
          <span className="text-red-600">meilleur prix</span>
        </h2>
        <p className="mx-auto mt-5 max-w-[48rem] text-pretty text-[1.05rem] leading-[1.9] text-gray-600 sm:mt-6 sm:text-lg sm:leading-[2] md:max-w-[54rem] md:mt-7 md:text-xl md:leading-[2.15]">
          Vous cherchez une location de voiture à Agadir simple, rapide et professionnelle ? AMSEEL CARS met à votre disposition une flotte de véhicules récents pour tous vos besoins : vacances, déplacements professionnels, séjours longue durée ou courts trajets en ville. Notre service de location voiture Agadir est pensé pour offrir une réservation fluide, une remise rapide du véhicule et des conditions claires.
        </p>
        <ul className="mt-9 flex flex-wrap justify-center gap-x-6 gap-y-3 text-base font-medium text-red-600 sm:mt-11 sm:gap-x-9 sm:text-lg md:text-[1.125rem]">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-2.5">
              <span className="select-none text-xl font-light leading-none text-red-600 sm:text-2xl" aria-hidden>
                —
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

/* =============================================================================
   SEO BLOCK: Airport delivery (after “Votre Trajet Idéal”, before black storytelling)
   ============================================================================= */
export function HomeSeoAirportBlock() {
  const bullets = [
    "Livraison à l’aéroport d’Agadir Al Massira",
    "Remise rapide du véhicule",
    "Réservation simple via WhatsApp ou en ligne",
    "Service adapté aux touristes et professionnels",
  ];
  return (
    <motion.section
      className="bg-[#f7f5f2] py-14 md:py-20"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="mx-auto max-w-[68rem] px-4 text-center md:px-8">
        <h2 className="text-balance text-[1.45rem] font-semibold tracking-tight text-neutral-900 sm:text-[1.9rem] md:text-[2.2rem] lg:text-[2.45rem]">
          Location voiture Agadir aéroport — remise rapide à l’arrivée
        </h2>
        <p className="mx-auto mt-5 max-w-[56rem] text-pretty text-[1.05rem] leading-[1.95] text-neutral-600 sm:mt-6 sm:text-[1.14rem] sm:leading-[2] md:text-[1.22rem] md:leading-[2.1]">
          Dès votre arrivée à l’aéroport d’Agadir Al Massira, notre équipe peut vous remettre votre voiture rapidement afin de commencer votre séjour sans attente inutile. Nous proposons un service flexible de location voiture Agadir aéroport avec assistance 24/7, livraison ponctuelle et reprise selon vos horaires. Pour une recherche en anglais, notre équipe peut aussi vous accompagner pour une{" "}
          <span className="whitespace-nowrap">car rental Agadir</span> claire et sans surprise.
        </p>
        <ul className="mx-auto mt-9 max-w-[56rem] space-y-4 text-left text-[1.05rem] text-neutral-700 sm:text-[1.14rem] md:text-[1.2rem]">
          {bullets.map((b) => (
            <li key={b} className="flex gap-3.5 border-b border-neutral-200/80 pb-4 last:border-0">
              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center text-xl font-semibold leading-none text-[#CB1939] sm:h-8 sm:w-8 sm:text-2xl" aria-hidden>
                ✓
              </span>
              <span className="pt-0.5 leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}

/* =============================================================================
   SEO BLOCK: Vehicle types (after Nos Marques, before reviews)
   ============================================================================= */
const vehicleCards = [
  {
    title: "Voitures économiques",
    text: "Idéales pour les petits budgets, les trajets urbains et les courts séjours.",
    href: "/cars",
  },
  {
    title: "Voitures automatiques",
    text: "Parfaites pour une conduite plus simple et plus confortable à Agadir — idéal pour une location voiture automatique Agadir sans stress.",
    href: "/cars",
  },
  {
    title: "SUV et familiales",
    text: "Adaptés aux familles, aux groupes et aux longs trajets dans la région, dont une location SUV Agadir confortable.",
    href: "/cars",
  },
  {
    title: "Voitures premium",
    text: "Pour les clients recherchant plus de confort, d’image et d’équipements.",
    href: "/cars",
  },
];

export function HomeSeoVehicleTypesBlock() {
  return (
    <motion.section
      className="relative overflow-hidden bg-black py-20 lg:py-28"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55 }}
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-8">
        <motion.div
          className="mb-12 text-center lg:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-heading text-balance text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.2] text-white">
            Quel type de voiture louer à Agadir ?
          </h2>
          <p className="mx-auto mt-5 max-w-[42rem] text-pretty text-[clamp(1rem,2.1vw,1.15rem)] font-normal leading-[1.65] text-white/70">
            Citadines, automatiques, SUV ou premium : choisissez la catégorie qui correspond à votre budget, à votre confort et à vos trajets dans la région d’Agadir.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
          {vehicleCards.map((c) => (
            <Link
              key={c.title}
              href={c.href}
              className="group flex min-h-[300px] flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-7 transition-colors hover:border-[#CB1939]/50 hover:bg-white/[0.07] lg:min-h-[320px] lg:p-8"
            >
              <h3 className="text-xl font-semibold text-white lg:text-[1.35rem]">{c.title}</h3>
              <p className="mt-4 flex-1 text-base leading-relaxed text-white/72 lg:text-[1.0625rem] lg:leading-[1.65]">
                {c.text}
              </p>
              <span className="mt-6 text-sm font-medium uppercase tracking-wider text-[#CB1939]">
                Voir la flotte →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

/* =============================================================================
   SEO BLOCK: Local discovery (after reviews, before map dashboard)
   ============================================================================= */
const destinations = [
  {
    name: "Taghazout",
    text: "Village de surf et plages, idéal pour une escapade depuis Agadir.",
    image:
      "https://utfs.io/f/2R5jJoZnKO1rytDex7eBHguTY1Uf3pGkcKrb4Lvx9XOIdAN2",
    href: "/blog/actualites/taghazout",
  },
  {
    name: "Dania Land Agadir",
    text: "Sorties en famille et loisirs à proximité du centre-ville.",
    image:
      "https://utfs.io/f/2R5jJoZnKO1rs7zY81iJbvremktOKRNPQE1MGfYju7U46Xig",
    href: "/blog/guide-pratique/danialand-agadir",
  },
  {
    name: "Corniche d’Agadir",
    text: "Promenades en bord de mer, cafés et vues sur l’océan.",
    image:
      "https://utfs.io/f/2R5jJoZnKO1r4oEQ72bp2hsXlNHW3wfi0jbM7ZBrAxCyT8ma",
    href: "/blog/guide-pratique/visiter-agadir",
  },
  {
    name: "Imi Ouaddar",
    text: "Baie paisible et paysages du littoral au sud d’Agadir.",
    image:
      "https://utfs.io/f/2R5jJoZnKO1rt7EOSi43vWVgQ52HhZM1CExTcG4RYDUp0kaL",
    href: "/blog/guide-pratique/imi-ouaddar",
  },
];

export function HomeSeoLocalDiscoveryBlock() {
  return (
    <motion.section
      className="bg-[#0c0c0c] py-20 md:py-28 lg:py-32"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55 }}
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <h2 className="font-heading text-balance text-center text-[clamp(1.75rem,4.2vw,3.25rem)] font-semibold leading-[1.15] text-white">
          Explorez Agadir et ses environs en toute liberté
        </h2>
        <p className="mx-auto mt-6 max-w-[48rem] text-center text-pretty text-base leading-[1.7] text-white/80 md:mt-7 md:text-lg md:leading-[1.75] lg:text-xl lg:leading-[1.7]">
          Louer une voiture à Agadir vous permet de découvrir facilement Taghazout, Imi Ouaddar, la corniche, le centre-ville et les paysages de la région sans dépendre des taxis ou des transports publics. Pensez aussi à la variante courante « location voiture aéroport Agadir » lorsque vous arrivez à Al Massira.
        </p>
        <div className="mt-14 grid gap-7 sm:grid-cols-2 sm:gap-8 lg:mt-16 lg:grid-cols-4 lg:gap-8">
          {destinations.map((d) => (
            <article
              key={d.name}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/40"
            >
              <Link
                href={d.href}
                className="relative block aspect-[4/3] w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#CB1939] focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
              >
                <Image
                  src={d.image}
                  alt={`${d.name} — guide pratique sur le blog AmseelCars Agadir`}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </Link>
              <div className="flex flex-1 flex-col p-6 md:p-7">
                <h3 className="text-xl font-semibold text-white md:text-[1.35rem]">{d.name}</h3>
                <p className="mt-3 flex-1 text-base leading-relaxed text-white/72 md:text-[1.05rem]">{d.text}</p>
                <Link
                  href={d.href}
                  className="mt-5 inline-flex text-base font-medium text-[#CB1939] hover:underline"
                >
                  En savoir plus
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

/* =============================================================================
   SEO BLOCK: Location + NAP (below map dashboard visual)
   ============================================================================= */
export function HomeSeoLocationNapBlock() {
  return (
    <section className="border-t border-neutral-200 bg-[#f2efe9] px-5 py-16 md:px-8 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[52rem] text-center md:text-left">
        <h2 className="font-heading text-balance text-[clamp(1.5rem,3.8vw,2.35rem)] font-semibold leading-snug text-neutral-900">
          Où trouver AMSEEL CARS à Agadir ?
        </h2>
        <p className="mt-5 max-w-[50rem] text-pretty text-lg leading-relaxed text-neutral-600 md:mt-6 md:text-xl md:leading-[1.65]">
          Notre agence est située à Haut Founty, dans l’Immeuble Sinwan, RDC, à Agadir. Nous proposons également la remise de véhicules à l’aéroport d’Agadir Al Massira, à l’hôtel ou en centre-ville selon vos besoins.
        </p>
        <address className="mt-10 not-italic md:mt-12">
          <p className="text-lg font-semibold text-neutral-900 md:text-xl">AMSEEL CARS</p>
          <p className="mt-3 text-lg text-neutral-700 md:text-xl">
            Immeuble Sinwan, RDC, Haut Founty, 80000 Agadir, Maroc
          </p>
          <ul className="mt-7 space-y-4 text-lg text-neutral-800 md:mt-8 md:text-xl">
            <li className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <Phone className="h-5 w-5 shrink-0 text-[#CB1939] md:h-6 md:w-6" aria-hidden />
              <a href="tel:+212662500181" className="hover:underline">
                +212 662 500 181
              </a>
            </li>
            <li className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <MessageCircle className="h-5 w-5 shrink-0 text-[#CB1939] md:h-6 md:w-6" aria-hidden />
              <a
                href="https://wa.me/212662500181/?text=Bonjour%2C%20je%20souhaite%20louer%20une%20voiture."
                className="hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </li>
            <li className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <Mail className="h-5 w-5 shrink-0 text-[#CB1939] md:h-6 md:w-6" aria-hidden />
              <a href="mailto:amseelcars5@gmail.com" className="hover:underline">
                amseelcars5@gmail.com
              </a>
            </li>
          </ul>
        </address>
      </div>
    </section>
  );
}

/* =============================================================================
   SEO BLOCK: Booking CTA (after map, before FAQ)
   ============================================================================= */
export function HomeSeoBookingCtaBlock() {
  return (
    <section className="border-t border-neutral-200 bg-white px-5 py-20 md:px-8 md:py-24 lg:py-28">
      <div className="mx-auto max-w-[52rem] text-center">
        <h2 className="font-heading text-balance text-[clamp(1.5rem,3.8vw,2.35rem)] font-semibold leading-snug text-neutral-900">
          Réservez votre location voiture Agadir dès maintenant
        </h2>
        <p className="mx-auto mt-5 max-w-[50rem] text-pretty text-lg leading-relaxed text-neutral-600 md:mt-6 md:text-xl md:leading-[1.65]">
          Contactez notre équipe pour réserver votre véhicule rapidement. Que vous ayez besoin d’une voiture économique, automatique, SUV ou premium, nous vous proposons une solution adaptée à vos dates et à votre budget. Selon le véhicule et les conditions de location, AMSEEL CARS peut proposer des solutions plus flexibles pour certains clients.
        </p>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-5 md:mt-14 md:gap-6">
          <Link
            href="/cars"
            className="inline-flex min-w-[200px] items-center justify-center rounded-full border-2 border-[#CB1939] bg-[#CB1939] px-9 py-3.5 text-base font-semibold text-white transition hover:bg-[#a91530] md:min-w-[220px] md:px-10 md:py-4"
          >
            Réserver maintenant
          </Link>
          <a
            href="https://wa.me/212662500181/?text=Bonjour%2C%20je%20souhaite%20r%C3%A9server%20une%20voiture."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-w-[200px] items-center justify-center rounded-full border-2 border-neutral-900 px-9 py-3.5 text-base font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white md:min-w-[220px] md:px-10 md:py-4"
          >
            WhatsApp
          </a>
          <a
            href="tel:+212662500181"
            className="inline-flex min-w-[200px] items-center justify-center rounded-full border-2 border-neutral-300 px-9 py-3.5 text-base font-semibold text-neutral-900 transition hover:border-neutral-900 md:min-w-[220px] md:px-10 md:py-4"
          >
            Appeler
          </a>
        </div>
      </div>
    </section>
  );
}

/* =============================================================================
   SEO BLOCK: FAQ (before footer contact)
   ============================================================================= */
const faqItems = [
  {
    q: "Quel loueur de voiture choisir à Agadir ?",
    a: "Le bon loueur de voiture à Agadir est celui qui propose des conditions claires, des véhicules récents, des avis clients rassurants, une assistance réactive et un service de livraison pratique. Il est conseillé de comparer la qualité du parc automobile, la transparence des tarifs, la facilité de réservation et les options de remise à l’aéroport ou à l’hôtel. Amseel Cars fait partie des options à considérer si vous recherchez une location de voiture à Agadir avec réservation simple, assistance 24/7 et véhicules bien entretenus.",
  },
  {
    q: "Quel est le prix d’une location de voiture à Agadir ?",
    a: "Le prix d’une location de voiture à Agadir dépend du modèle, de la saison, de la durée de location et du lieu de remise du véhicule. En général, les voitures économiques commencent à des tarifs accessibles, tandis que les SUV, les automatiques et les modèles premium sont plus chers. Il est préférable de vérifier ce qui est inclus dans le tarif, comme l’assistance, les options de livraison et les conditions de location, afin d’éviter les mauvaises surprises.",
  },
  {
    q: "Quel est le meilleur site pour louer une voiture au Maroc ?",
    a: "Le meilleur site pour louer une voiture au Maroc est surtout celui qui présente clairement ses véhicules, ses tarifs, ses conditions de location et ses coordonnées. Un bon site doit aussi permettre une réservation simple, montrer de vraies informations sur l’agence et rassurer sur la disponibilité du service. Pour une location de voiture à Agadir, un site clair, rapide et facile à utiliser reste souvent le meilleur choix pour comparer les véhicules et réserver en toute confiance.",
  },
  {
    q: "Quel est le prix moyen d’une location de voiture au Maroc ?",
    a: "Le prix moyen d’une location de voiture au Maroc varie selon la ville, la saison touristique, la catégorie du véhicule et la durée de réservation. Les citadines restent généralement les plus abordables, alors que les SUV, les véhicules automatiques et les modèles premium ont un tarif plus élevé. Pour obtenir une estimation réaliste, il faut toujours tenir compte des services inclus, du lieu de prise en charge et des conditions générales de location.",
  },
  {
    q: "Quel est le loueur de voiture le plus fiable ?",
    a: "Le loueur de voiture le plus fiable est généralement celui qui affiche des conditions transparentes, dispose de véhicules bien entretenus, répond rapidement aux demandes et bénéficie d’avis clients cohérents. La fiabilité ne dépend pas seulement du prix, mais aussi de la qualité du service, de la ponctualité, de l’état des voitures et de l’accompagnement avant et pendant la location. À Agadir, il est recommandé de choisir une agence sérieuse, joignable facilement et claire sur ses modalités.",
  },
  {
    q: "Quelles questions dois-je poser pour louer une voiture ?",
    a: "Avant de louer une voiture, il est utile de demander quel est le prix total, ce qui est inclus dans l’offre, les conditions de remise et de retour, les documents nécessaires, les modalités d’assistance et les éventuelles options disponibles. Il faut aussi vérifier le kilométrage, la politique de carburant, les horaires de livraison et la disponibilité du modèle choisi. Poser ces questions permet de réserver plus sereinement et d’éviter les incompréhensions au moment de la prise en charge.",
  },
  {
    q: "Quels sont les conseils pour louer une voiture au Maroc ?",
    a: "Pour louer une voiture au Maroc dans de bonnes conditions, il est conseillé de réserver à l’avance, de comparer les types de véhicules selon votre trajet et de bien lire les conditions de location. Il est aussi important de choisir une agence joignable facilement, de vérifier l’état du véhicule au départ et de confirmer les informations sur la livraison ou la récupération. Pour un séjour à Agadir, il est souvent pratique d’opter pour une voiture adaptée à la ville, à la route et à la durée du voyage.",
  },
  {
    q: "Quelles sont les conditions pour une location de voiture ?",
    a: "Les conditions pour une location de voiture peuvent varier selon l’agence et le véhicule choisi, mais elles incluent généralement un permis de conduire valide, une pièce d’identité ou un passeport et les informations nécessaires à la réservation. Certaines agences demandent aussi des éléments complémentaires selon la durée, le type de voiture ou le profil du conducteur. Le plus important est de vérifier les conditions exactes avant la réservation afin de préparer tous les documents nécessaires.",
  },
  {
    q: "Est-ce prudent de louer une voiture au Maroc ?",
    a: "Oui, louer une voiture au Maroc peut être une solution pratique et sûre à condition de choisir une agence sérieuse, de vérifier les conditions de location et de conduire avec prudence. Pour beaucoup de voyageurs, la voiture permet de découvrir plus librement Agadir et ses environs sans dépendre des transports publics. Il est recommandé de réserver auprès d’un loueur clair sur ses modalités, disposant de véhicules bien entretenus et d’une assistance facilement accessible en cas de besoin.",
  },
  {
    q: "Quelles sont les bonnes questions à poser lors d’une location ?",
    a: "Les bonnes questions à poser lors d’une location concernent le tarif final, les documents demandés, les modalités de récupération du véhicule, les conditions de retour, l’assistance disponible et les services inclus. Il est aussi utile de demander si la livraison est possible à l’aéroport ou à l’hôtel, quel type de voiture est le plus adapté à votre séjour et comment se déroule la réservation. Ces vérifications simples permettent de choisir une offre plus claire et mieux adaptée à vos besoins.",
  },
];

const homeFaqPageSchema = generateFAQSchema(
  faqItems.map((item) => ({ question: item.q, answer: item.a }))
);

/** Full answer stays in the DOM; line-clamp + toggle keeps the section scannable (AEO-friendly). */
function FaqAnswerText({ text, answerId }: { text: string; answerId: string }) {
  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const pRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = pRef.current;
    if (!el) return;

    const measure = () => {
      if (expanded) {
        setShowToggle(true);
        return;
      }
      setShowToggle(el.scrollHeight > el.clientHeight + 2);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, expanded]);

  return (
    <div>
      <p
        ref={pRef}
        id={answerId}
        className={cn(
          "text-pretty text-[0.9375rem] leading-[1.65] text-neutral-600 sm:text-base sm:leading-[1.7]",
          !expanded && "line-clamp-4 sm:line-clamp-5"
        )}
      >
        {text}
      </p>
      {showToggle ? (
        <button
          type="button"
          className="mt-2.5 inline-flex items-center gap-1 text-sm font-semibold text-[#CB1939] underline decoration-[#CB1939]/30 underline-offset-4 transition hover:decoration-[#CB1939] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CB1939]"
          aria-expanded={expanded}
          aria-controls={answerId}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Réduire" : "Lire la suite"}
        </button>
      ) : null}
    </div>
  );
}

function HomeFaqCard({
  item,
  index,
}: {
  item: (typeof faqItems)[number];
  index: number;
}) {
  const answerId = `home-faq-reponse-${index}`;
  return (
    <article className="relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-[box-shadow,border-color] hover:border-neutral-300/90 hover:shadow-md">
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#CB1939]"
        aria-hidden
      />
      <div className="pl-4 pr-4 py-4 sm:pl-5 sm:pr-5 sm:py-5">
        <h3 className="text-balance text-[0.9375rem] font-semibold leading-snug tracking-tight text-neutral-900 sm:text-base md:text-[1.0625rem] md:leading-snug">
          {item.q}
        </h3>
        <div className="mt-2.5 sm:mt-3">
          <FaqAnswerText text={item.a} answerId={answerId} />
        </div>
      </div>
    </article>
  );
}

function FaqColumn({
  items,
  startIndex,
}: {
  items: typeof faqItems;
  startIndex: number;
}) {
  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {items.map((item, i) => (
        <HomeFaqCard key={item.q} item={item} index={startIndex + i} />
      ))}
    </div>
  );
}

export function HomeSeoFaqBlock() {
  const faqCol1 = faqItems.slice(0, 4);
  const faqCol2 = faqItems.slice(4, 7);
  const faqCol3 = faqItems.slice(7, 10);

  return (
    <>
      {homeFaqPageSchema && (
        <Script
          id="ld-json-faq-home"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(homeFaqPageSchema),
          }}
        />
      )}
      <section
        className="border-t border-neutral-200 bg-gradient-to-b from-neutral-100/80 to-[#fafafa] px-4 py-14 sm:px-5 sm:py-16 md:py-20"
        aria-labelledby="home-faq-heading"
      >
        <div className="mx-auto max-w-7xl">
          <header className="mx-auto max-w-2xl text-center lg:max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#CB1939] sm:text-[0.8125rem]">
              FAQ
            </p>
            <h2
              id="home-faq-heading"
              className="mt-2 text-balance text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl md:text-3xl md:leading-tight"
            >
              Questions fréquentes sur la location de voiture à Agadir
            </h2>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-neutral-600 sm:text-base sm:leading-relaxed">
              Réponses détaillées pour préparer votre location. Les textes longs
              s’affichent en extrait&nbsp;: utilisez «&nbsp;Lire la suite&nbsp;» pour tout
              afficher.
            </p>
          </header>

          <div className="mt-9 grid grid-cols-1 gap-8 sm:mt-10 md:mt-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-0 xl:gap-x-8">
            <FaqColumn items={faqCol1} startIndex={0} />
            <FaqColumn items={faqCol2} startIndex={4} />
            <FaqColumn items={faqCol3} startIndex={7} />
          </div>
        </div>
      </section>
    </>
  );
}
