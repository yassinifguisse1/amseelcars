import { LoadingProvider } from "@/contexts/LoadingContext";
import { HomeContentLandingPage } from "./HomeContentLandingPage";
import Script from "next/script";
import { generateLocalBusinessSchema, generateBreadcrumbSchema } from "@/lib/schemas";

export default function Home() {
  const localBusinessSchema = generateLocalBusinessSchema();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
  ]);

  return (
    <>
      {/* LocalBusiness (CarRental) Schema for Homepage */}
      <Script
        id="ld-json-local-business"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      
      {/* Breadcrumb Schema for Homepage */}
      <Script
        id="ld-json-breadcrumb-home"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      <LoadingProvider>
        <HomeContentLandingPage />
      </LoadingProvider>
    </>
  );
}
