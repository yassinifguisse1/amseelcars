import { LoadingProvider } from "@/contexts/LoadingContext";
import { HomeContentLandingPage } from "./HomeContentLandingPage";
import Script from "next/script";
import { generateLocalBusinessSchema, generateBreadcrumbSchema, generateReviewSchema, generateAggregateRatingSchema } from "@/lib/schemas";
import { reviews } from "@/data/reviews";

export default function Home() {
  const localBusinessSchema = generateLocalBusinessSchema();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
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
