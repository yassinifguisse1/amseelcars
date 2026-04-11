import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { HomeContentLandingPage } from "./HomeContentLandingPage";
import Script from "next/script";
import { generateLocalBusinessSchema, generateBreadcrumbSchema, generateReviewSchema, generateAggregateRatingSchema } from "@/lib/schemas";
import { reviews } from "@/data/reviews";
import { localizedAlternates } from "@/lib/seo/localized-alternates";
import type { AppLocale } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";

/** Homepage only: avoid inheriting `/` as canonical on every route from root layout. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: AppLocale = locale === "en" ? "en" : "fr";
  const tMeta = await getTranslations({ locale: l, namespace: "home" });
  const title = tMeta("meta.title");
  const description = tMeta("meta.description");
  const ogLocale = l === "en" ? "en_US" : "fr_MA";

  return {
    title,
    description,
    alternates: localizedAlternates(l, "/"),
    openGraph: {
      title,
      description,
      locale: ogLocale,
    },
    twitter: {
      title,
      description,
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: AppLocale = locale === "en" ? "en" : "fr";
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

  return (
    <>
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
      
    <LoadingProvider>
      <HomeContentLandingPage />
    </LoadingProvider>
    
    </>
  );
}
