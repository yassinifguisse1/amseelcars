import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import "./globals.css";
import { LenisScrollProvider } from "./providers/lenis-scroll-trigger";
import { playfair, anticDidone } from "@/lib/fonts";
import { clsx } from "clsx";
import { Analytics } from "@vercel/analytics/next";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/schemas";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo/site-meta";

const siteTitle = "Location voiture Agadir | AmseelCars";
const siteDescription =
  "Location de voiture à Agadir au meilleur prix. Citadines, SUV et premium, retrait aéroport Al Massira ou centre-ville, réservation WhatsApp. Assurance et kilométrage clairs.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: siteTitle,
    template: `%s | ${SITE_NAME}`,
  },
  description: siteDescription,
  applicationName: SITE_NAME,
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
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,

  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: siteTitle,
    description: siteDescription,
    locale: "fr_MA",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "AmseelCars location voiture Agadir",
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
    title: siteTitle,
    description:
      "Location voiture Agadir: citadines, SUV, premium. Retrait aéroport ou ville. Réservation WhatsApp.",
    images: [DEFAULT_OG_IMAGE],
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
  viewportFit: "cover",
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [generateOrganizationSchema(), generateWebSiteSchema()],
  };

  return (
    <html lang={htmlLang} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={clsx(fontVariables, "antialiased")} suppressHydrationWarning>
        <LenisScrollProvider />
        {children}
        <Analytics />
        <Script
          id="ld-json-business"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
