import { LoadingProvider } from "@/contexts/LoadingContext";
import Script from 'next/script';
import { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import HomeContent from "./HomeContent";
import { generateBreadcrumbSchema } from '@/lib/schemas';
import { getArticles } from "@/app/action/article";
import { localizedAlternates } from '@/lib/seo/localized-alternates';
import type { AppLocale } from '@/i18n/routing';
import { getPathname } from '@/i18n/navigation';


// Force dynamic rendering - prevent Next.js from caching this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const l: AppLocale = locale === "en" ? "en" : "fr";
  const title =
    l === "en"
      ? "AmseelCars blog — car rental tips & Agadir guides"
      : "Blog AmseelCars - Conseils & Actualités Location Voiture Agadir";
  const description =
    l === "en"
      ? "Practical guides and updates on car rental in Agadir, Morocco—fleet tips, airport pickup, and travel on the coast."
      : "Découvrez nos conseils pour la location de voiture à Agadir, actualités du secteur automobile et guides pratiques pour vos déplacements au Maroc.";

  return {
    title,
    description,
    alternates: localizedAlternates(l, "/blog"),
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
    openGraph: {
      images: ["/og/location-voiture-agadir-logo-opengraph-amseel-cars-bmw-golf8-turoc-touareg.webp"],
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og/location-voiture-agadir-logo-opengraph-amseel-cars-bmw-golf8-turoc-touareg.webp"],
    },
  };
}

export default async function BlogPage() {
  const locale = await getLocale();
  const l: AppLocale = locale === "en" ? "en" : "fr";
  const homePath = getPathname({ locale: l, href: "/" });
  const blogPath = getPathname({ locale: l, href: "/blog" });
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: homePath },
    { name: "Blog", url: blogPath },
  ]);
  const articles = await getArticles(l);


  return (
    <>
      {/* Breadcrumb Schema */}
      <Script
        id="ld-json-breadcrumb-blog"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <LoadingProvider>
        <HomeContent articles={articles} />
      </LoadingProvider>
    </>
  );
}
