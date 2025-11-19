import { LoadingProvider } from "@/contexts/LoadingContext";
import { HomeContent } from "./HomeContent";
import Script from "next/script";
import { generateLocalBusinessSchema, generateBreadcrumbSchema } from "@/lib/schemas";

export default function Home() {
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
      <HomeContent />
    </LoadingProvider>
    </>
  );
}