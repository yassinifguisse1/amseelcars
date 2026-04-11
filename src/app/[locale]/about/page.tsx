import type { Metadata } from "next";
import Script from "next/script";
import { getLocale, getTranslations } from "next-intl/server";
import { generateBreadcrumbSchema } from "@/lib/schemas";
import { AboutPageClient } from "./AboutPageClient";
import { localizedAlternates } from "@/lib/seo/localized-alternates";
import type { AppLocale } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";

const siteUrl = "https://www.amseelcars.com";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const l: AppLocale = locale === "en" ? "en" : "fr";
  const path = getPathname({ locale: l, href: "/about" });
  const t = await getTranslations({ locale: l, namespace: "seo" });
  const title = t("about.title");
  const description = t("about.description");

  return {
    title,
    description,
    alternates: localizedAlternates(l, "/about"),
    openGraph: {
      type: "website",
      url: `${siteUrl}${path}`,
      title: `${title} | AmseelCars`,
      description,
    },
  };
}

export default async function AboutPage() {
  const locale = await getLocale();
  const l: AppLocale = locale === "en" ? "en" : "fr";
  const tNav = await getTranslations({ locale: l, namespace: "nav" });
  const homePath = getPathname({ locale: l, href: "/" });
  const aboutPath = getPathname({ locale: l, href: "/about" });
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: tNav("home"), url: homePath },
    { name: tNav("about"), url: aboutPath },
  ]);

  return (
    <>
      {/* Breadcrumb Schema */}
      <Script
        id="ld-json-breadcrumb-about"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <AboutPageClient />
    </>
  );
}
