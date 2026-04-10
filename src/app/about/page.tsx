import type { Metadata } from "next";
import Script from "next/script";
import { generateBreadcrumbSchema } from "@/lib/schemas";
import { AboutPageClient } from "./AboutPageClient";

const siteUrl = "https://www.amseelcars.com";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Découvrez AmseelCars, votre agence de location de voitures à Agadir. Service fiable, retrait aéroport/ville, assistance et réservation simple.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/about`,
    title: "À propos | AmseelCars",
    description:
      "Découvrez AmseelCars, votre agence de location de voitures à Agadir. Service fiable, retrait aéroport/ville, assistance et réservation simple.",
  },
};


export default function Home() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "About", url: "/about" },
  ]);

  return (
    <>
      {/* Breadcrumb Schema */}
      <Script
        id="ld-json-breadcrumb-about"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <AboutPageClient />
    </>
  );
}
