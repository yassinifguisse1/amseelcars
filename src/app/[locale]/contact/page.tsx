import type { Metadata } from "next";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { ContactContent } from "./ContactContent";
import Script from "next/script";
import { getLocale, getTranslations } from "next-intl/server";
import {
  generateContactPageSchema,
  generateLocalBusinessSchema,
  generateBreadcrumbSchema,
} from "@/lib/schemas";
import { localizedAlternates } from "@/lib/seo/localized-alternates";
import type { AppLocale } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";

const siteUrl = "https://www.amseelcars.com";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const l: AppLocale = locale === "en" ? "en" : "fr";
  const path = getPathname({ locale: l, href: "/contact" });
  const t = await getTranslations({ locale: l, namespace: "seo" });
  const title = t("contact.title");
  const description = t("contact.description");

  return {
    title,
    description,
    alternates: localizedAlternates(l, "/contact"),
    openGraph: {
      type: "website",
      url: `${siteUrl}${path}`,
      title: `${title} | AmseelCars`,
      description,
    },
  };
}

export default async function Contact() {
  const locale = await getLocale();
  const l: AppLocale = locale === "en" ? "en" : "fr";
  const tSeo = await getTranslations({ locale: l, namespace: "seo" });
  const tNav = await getTranslations({ locale: l, namespace: "nav" });
  const tFooter = await getTranslations({ locale: l, namespace: "footer" });
  const homePath = getPathname({ locale: l, href: "/" });
  const contactPath = getPathname({ locale: l, href: "/contact" });
  const localBusinessSchema = generateLocalBusinessSchema();
  const contactPageSchema = generateContactPageSchema({
    path: contactPath,
    title: tSeo("contact.title"),
    description: tSeo("contact.description"),
    inLanguage: l === "en" ? "en-US" : "fr-MA",
  });
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: tNav("home"), url: homePath },
    { name: tFooter("contact"), url: contactPath },
  ]);

  return (
    <>
      <Script
        id="ld-json-contact-page"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />
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
      <ContactContent />
    </LoadingProvider>
    </>
  );
}
