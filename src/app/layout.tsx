// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import "./globals.css";
import { LenisScrollProvider } from "./providers/lenis-scroll-trigger";
import { playfair, anticDidone } from "@/lib/fonts";
import { clsx } from "clsx";
import { Analytics } from "@vercel/analytics/next";
import { ClerkProvider } from "@clerk/nextjs";
import { ourFileRouter } from "./api/uploadthing/core";
import { extractRouterConfig } from "uploadthing/server";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import MyStatsig from "./my-statsig";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/schemas";


const siteUrl = "https://www.amseelcars.com";
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
    "location voiture Agadir aéroport",
    "location voiture Agadir pas cher",
    "car rental Agadir",
    "Agadir airport car hire",
    "SUV rental Agadir",
    "location voiture Maroc",
    "Taghazout car rental",
    "AmseelCars",
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
        url: "/og/location-voiture-agadir-logo-opengraph-amseel-cars-bmw-golf8-turoc-touareg.webp", // put a 1200x630 image in /public/og/og-default.jpg
        width: 1200,
        height: 630,
        alt: "AmseelCars – Location de voitures à Agadir",
      },
    ],
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
    images: ["/og/location-voiture-agadir-logo-opengraph-amseel-cars-bmw-golf8-turoc-touareg.webp"], // ← same image
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
  other: {
    "geo.region": "MA-SUS",
    "geo.placename": "Agadir",
    "geo.position": "30.40085;-9.57758",
    ICBM: "30.40085, -9.57758",
  },
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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const headerStore = await headers();
  const intlLocale = headerStore.get("x-next-intl-locale");
  const htmlLang = intlLocale === "en" ? "en" : "fr";

  const fontVariables = clsx(playfair.variable, anticDidone.variable);

  // JSON-LD (Organization + WebSite) - Sitewide
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      generateOrganizationSchema(),
      generateWebSiteSchema(),
    ],
  };

  return (
    <ClerkProvider>

    <html lang={htmlLang} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={clsx(fontVariables, "antialiased")} suppressHydrationWarning>
        <LenisScrollProvider />
        <NextSSRPlugin
          /**
           * The `extractRouterConfig` will extract **only** the route configs
           * from the router to prevent additional information from being
           * leaked to the client. The data passed to the client is the same
           * as if you were to fetch `/api/uploadthing` directly.
           */
          routerConfig={extractRouterConfig(ourFileRouter)}
        />
        <MyStatsig>
          {children}
        </MyStatsig>

        <Analytics />

        {/* Structured Data */}
        <Script
          id="ld-json-business"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
    </ClerkProvider>
  );
}
