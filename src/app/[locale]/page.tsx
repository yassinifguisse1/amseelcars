import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getImageProps } from "next/image";
import { HomeContentLandingPage } from "./HomeContentLandingPage";
import Script from "next/script";
import { generateLocalBusinessSchema, generateBreadcrumbSchema, generateReviewSchema, generateAggregateRatingSchema } from "@/lib/schemas";
import { reviews } from "@/data/reviews";
import { getAllCars } from "@/data/cars";
import { localizedAlternates } from "@/lib/seo/localized-alternates";
import { buildPageMetadata } from "@/lib/seo/site-meta";
import { routing, type AppLocale } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";
import { localeToOpenGraphLocale } from "@/i18n/locale-utils";

function resolveAppLocale(locale: string): AppLocale {
  return routing.locales.includes(locale as AppLocale)
    ? (locale as AppLocale)
    : routing.defaultLocale;
}

/** Homepage only: avoid inheriting `/` as canonical on every route from root layout. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l = resolveAppLocale(locale);
  const tMeta = await getTranslations({ locale: l, namespace: "home" });
  const title = tMeta("meta.title");
  const description = tMeta("meta.description");
  const path = getPathname({ locale: l, href: "/" });

  return buildPageMetadata({
    title,
    description,
    path,
    localeOg: localeToOpenGraphLocale(l),
    alternates: localizedAlternates(l, "/"),
    imageAlt: title,
  });
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = resolveAppLocale(locale);
  const homePath = getPathname({ locale: l, href: "/" });
  const tHome = await getTranslations({ locale: l, namespace: "home" });
  const localBusinessSchema = generateLocalBusinessSchema();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: tHome("breadcrumb"), url: homePath },
  ]);

  // Add aggregateRating to LocalBusiness schema
  const localBusinessWithRating = {
    ...localBusinessSchema,
    aggregateRating: generateAggregateRatingSchema(reviews),
  };

  const firstCarImage = getAllCars()[0]?.carImage;
  const lcpPreload = firstCarImage
    ? getImageProps({
        src: firstCarImage,
        alt: "",
        width: 760,
        height: 570,
        sizes: "(max-width: 480px) 260px, (max-width: 768px) 300px, 380px",
      }).props
    : null;

  return (
    <>
      {lcpPreload?.srcSet ? (
        <link
          rel="preload"
          as="image"
          imageSrcSet={lcpPreload.srcSet}
          imageSizes={lcpPreload.sizes}
          fetchPriority="high"
        />
      ) : null}

      {/* LocalBusiness (CarRental) Schema with AggregateRating for Homepage */}
      <Script
        id="ld-json-local-business"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessWithRating) }}
      />
      
      {/* Breadcrumb Schema for Homepage */}
      <Script
        id="ld-json-breadcrumb-home"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      {/* Individual Review Schemas */}
      {reviews.map((review) => (
        <Script
          key={review.id}
          id={`ld-json-review-${review.id}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateReviewSchema(review)) }}
        />
      ))}
      
    <HomeContentLandingPage />
    
    </>
  );
}
