// app/layout.tsx
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { LenisScrollProvider } from "./providers/lenis-scroll-trigger";
import { playfair, anticDidone } from "@/lib/fonts";
import { clsx } from "clsx";
import { Analytics } from "@vercel/analytics/next";
import Header from "@/components/Header";

const siteUrl = "https://amseelcars.com";
const siteName = "AmseelCars";
const siteTitle = "AmseelCars — Location de voitures à Agadir";
const siteDescription =
  "Location de voitures à Agadir au meilleur prix. Large flotte (citadines, SUV, premium), retrait à l’aéroport ou en ville, réservation facile par WhatsApp. Assurance & kilométrage clairs.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // Title template across the site
  title: {
    default: siteTitle,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  generator: "Next.js",
  keywords: [
    "location voiture Agadir",
    "location de voiture Agadir",
    "location de voiture à Agadir",
    "location voiture Agadir aéroport",
    "location voiture Agadir pas cher",
    "location voiture sans caution Agadir",
    "car rental Agadir",
    "louer voiture aéroport Agadir",
    "AmseelCars",
    "SUV location Agadir",
    "location voiture pas cher Maroc",
    "car rental Agadir",
    "Agadir airport car hire",
    "SUV rental Agadir",
    "unlimited mileage car rental Agadir",
    "location voiture Agadir aéroport",
    "location voiture Agadir pas cher",
    "location voiture sans caution Agadir",
    "car rental Agadir",
    "louer voiture aéroport Agadir",
    "AmseelCars",
    "SUV location Agadir",
    "location voiture pas cher Maroc",
    "car rental Agadir",
    "Agadir airport car hire",
    "SUV rental Agadir",
    "unlimited mileage car rental Agadir",
    "location voiture Agadir aéroport",
    "location voiture Agadir pas cher",
    "location voiture sans caution Agadir",
    "car rental Agadir",
    "louer voiture aéroport Agadir",
    "AmseelCars",
    "SUV location Agadir",
    
  ],
  authors: [{ name: "AmseelCars" }],
  creator: "AmseelCars",
  publisher: "AmseelCars",

  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: siteTitle,
    description: siteDescription,
    locale: "fr_MA",
    images: [
      {
        url: "/og/amseelcars-logo-apropos.jpg", // put a 1200x630 image in /public/og/og-default.jpg
        width: 1200,
        height: 630,
        alt: "AmseelCars – Location de voitures à Agadir",
      },
    ],
  },

 

  alternates: {
    canonical: "/",
    languages: {
      "fr-MA": "/",
      // add more if you ever localize:
      // "en": "/en",
    },
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
  twitter: {
    card: "summary_large_image",
    title: "AmseelCars — Location de voitures à Agadir",
    description:
      "Location de voitures à Agadir au meilleur prix. Large flotte (citadines, SUV, premium).",
    images: ["/og/amseelcars-logo-apropos.jpg"], // ← same image
  },

  icons: {
    shortcut: ["/favicon.ico"],
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/favicon.ico", sizes: "180x180" }],
  },

  category: "vehicles",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // better on iOS
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const fontVariables = clsx(playfair.variable, anticDidone.variable);

  // JSON-LD (Organization + Local Business / CarRental)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CarRental",
    "@id": `${siteUrl}#business`,
    name: siteName,
    url: siteUrl,
    image: `${siteUrl}/og/og-default.jpg`,
    telephone: "+212662500181",
    email: "info@amseelcars.com",
    sameAs: [
      "https://www.facebook.com/amseelcars/",
      "https://www.instagram.com/amseelcars/",
      "https://wa.me/212662500181",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Agadir",
      addressRegion: "Souss-Massa",
      addressCountry: "MA",
    },
    areaServed: ["Agadir", "Aéroport Agadir–Al Massira", "Maroc"],
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], opens: "08:00", closes: "22:00" },
    ],
    priceRange: "DH",
    makesOffer: {
      "@type": "OfferCatalog",
      name: "Flotte de véhicules",
    },
  };

  return (
    <html lang="fr" suppressHydrationWarning data-scroll-behavior="smooth">

        {/* Block wheel images from search engines */}
        <meta name="robots" content="noimageindex" />
        <meta name="googlebot" content="noimageindex" />
     
      <body className={clsx(fontVariables, "antialiased")} suppressHydrationWarning>
        <LenisScrollProvider />
        <Header />
        {children}
        <Analytics />

        {/* Structured Data */}
        <Script
          id="ld-json-business"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
