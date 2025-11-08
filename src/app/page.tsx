import { LoadingProvider } from "@/contexts/LoadingContext";
import { HomeContentLandingPage } from "./HomeContentLandingPage";
import Script from "next/script";
import { generateLocalBusinessSchema } from "@/lib/schemas";

export default function Home() {
  const localBusinessSchema = generateLocalBusinessSchema();

  return (
    <>
      {/* LocalBusiness Schema for Homepage */}
      <Script
        id="ld-json-local-business"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <LoadingProvider>
        <HomeContentLandingPage />
      </LoadingProvider>
    </>
  );
}
