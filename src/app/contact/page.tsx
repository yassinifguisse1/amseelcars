import type { Metadata } from "next";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { ContactContent } from "./ContactContent";
import Script from "next/script";
import { generateLocalBusinessSchema, generateBreadcrumbSchema } from "@/lib/schemas";

const siteUrl = "https://www.amseelcars.com";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez AmseelCars à Agadir pour réserver une voiture. WhatsApp/téléphone, retrait à l’aéroport Al Massira ou en ville, réponse rapide.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/contact`,
    title: "Contact | AmseelCars",
    description:
      "Contactez AmseelCars à Agadir pour réserver une voiture. WhatsApp/téléphone, retrait à l’aéroport Al Massira ou en ville, réponse rapide.",
  },
};

export default function Contact() {
  const localBusinessSchema = generateLocalBusinessSchema();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Contact", url: "/contact" },
  ]);

  return (
    <>
      {/* LocalBusiness Schema for Contact Page */}
      <Script
        id="ld-json-local-business-contact"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      {/* Breadcrumb Schema */}
      <Script
        id="ld-json-breadcrumb-contact"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    <LoadingProvider>
      <ContactContent />
    </LoadingProvider>
    </>
  );
}