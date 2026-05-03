import { LoadingProvider } from "@/contexts/LoadingContext";
import Script from 'next/script';
import { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import HomeContent from "./HomeContent";
import { generateBreadcrumbSchema } from '@/lib/schemas';
import { getArticles } from "@/app/action/article";
import { categoryToSlug } from "@/data/blog";
import type { AppLocale } from '@/i18n/routing';
import { getPathname } from '@/i18n/navigation';
import {
  absoluteBlogUrl,
  blogArticlePath,
  blogIndexPath,
  frenchBlogAlternates,
} from "@/lib/seo/blog-paths";


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
    alternates: frenchBlogAlternates(blogIndexPath()),
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
  const isEn = l === "en";
  const homePath = getPathname({ locale: l, href: "/" });
  const blogPath = blogIndexPath();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: homePath },
    { name: "Blog", url: blogPath },
  ]);
  const articles = await getArticles(l);
  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `https://www.amseelcars.com${blogPath}#collection`,
    url: `https://www.amseelcars.com${blogPath}`,
    name: isEn ? "AmseelCars blog" : "Blog AmseelCars",
    description: isEn
      ? "Guides and updates about car rental in Agadir and Morocco."
      : "Guides et actualites sur la location de voiture a Agadir et au Maroc.",
    inLanguage: isEn ? "en-US" : "fr-MA",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: articles.slice(0, 20).map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteBlogUrl(
          blogArticlePath(categoryToSlug(article.category), article.slug),
        ),
        name: article.title,
      })),
    },
  };
  const quickAnswer = isEn
    ? "Use this blog to compare car classes, airport pickup options, and practical driving advice before booking in Agadir."
    : "Ce blog vous aide a comparer les categories de voitures, les options de retrait aeroport et les conseils pratiques avant reservation a Agadir.";


  return (
    <>
      {/* Breadcrumb Schema */}
      <Script
        id="ld-json-breadcrumb-blog"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="ld-json-collection-blog"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <LoadingProvider>
        <section className="mx-auto max-w-6xl px-4 pb-4 pt-6 hidden">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b11226]">
              {isEn ? "Quick answer" : "Reponse rapide"}
            </p>
            <p className="mt-2 text-sm text-neutral-700">{quickAnswer}</p>
          </div>
        </section>
        <HomeContent articles={articles} />
      </LoadingProvider>
    </>
  );
}
