import type { Metadata } from "next";
import Script from "next/script";
import { getLocale, getTranslations } from "next-intl/server";
import { LegalDocument } from "@/components/Legal/LegalDocument";
import { getPathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { localeToOpenGraphLocale, toAppLocale } from "@/i18n/locale-utils";
import { localizedAlternates } from "@/lib/seo/localized-alternates";
import { buildPageMetadata } from "@/lib/seo/site-meta";
import { generateBreadcrumbSchema } from "@/lib/schemas";

type LegalHref = "/rental-terms" | "/privacy" | "/legal";
type LegalNamespace = "rentalTerms" | "privacy" | "legalNotice";
type SeoKey = "rentalTerms" | "privacy" | "legal";
type FooterKey = "rentalTerms" | "privacy" | "legal";

type LegalPageConfig = {
  href: LegalHref;
  documentNamespace: LegalNamespace;
  seoKey: SeoKey;
  footerKey: FooterKey;
  scriptId: string;
};

export function createLegalPage(config: LegalPageConfig) {
  async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    const l: AppLocale = toAppLocale(locale);
    const path = getPathname({ locale: l, href: config.href });
    const t = await getTranslations({ locale: l, namespace: "seo" });
    const title = t(`${config.seoKey}.title`);
    const description = t(`${config.seoKey}.description`);

    return buildPageMetadata({
      title,
      description,
      path,
      localeOg: localeToOpenGraphLocale(l),
      alternates: localizedAlternates(l, config.href),
      imageAlt: title,
    });
  }

  async function Page() {
    const locale = await getLocale();
    const l: AppLocale = toAppLocale(locale);
    const tNav = await getTranslations({ locale: l, namespace: "nav" });
    const tFooter = await getTranslations({ locale: l, namespace: "footer" });
    const homePath = getPathname({ locale: l, href: "/" });
    const pagePath = getPathname({ locale: l, href: config.href });
    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: tNav("home"), url: homePath },
      { name: tFooter(config.footerKey), url: pagePath },
    ]);

    return (
      <>
        <Script
          id={config.scriptId}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <LegalDocument namespace={config.documentNamespace} />
      </>
    );
  }

  return { generateMetadata, Page };
}
