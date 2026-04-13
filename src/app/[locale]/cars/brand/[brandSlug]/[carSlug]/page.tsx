import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Script from "next/script";
import { getLocale, getTranslations } from "next-intl/server";
import { getAllCars, getCarBySlug } from "@/data/cars";
import { carForLocale } from "@/lib/carLocale";
import CarDetailClient from "../../../[slug]/CarDetailClient";
import { generateCarProductSchema, generateBreadcrumbSchema } from "@/lib/schemas";
import { generateFAQSchema } from "@/lib/faqSchema";
import {
  localizedAlternates,
  localizedCarBrandScopedAlternates,
} from "@/lib/seo/localized-alternates";
import { frenchCarSlugToEnglishSlug, carSlugForLocale } from "@/lib/carSlugLocale";
import { brandToSlug } from "@/lib/brandSlug";
import type { AppLocale } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";

type Props = {
  params: Promise<{ brandSlug: string; carSlug: string }>;
};

/**
 * Next sometimes invokes this before parent segments are filled; `brandSlug` can be missing.
 * Return no static entries in that case (page still renders dynamically).
 */
export function generateStaticParams({
  params,
}: {
  params: { locale?: string; brandSlug?: string };
}): { carSlug: string }[] {
  const brandSlug = params?.brandSlug;
  if (brandSlug == null || brandSlug === "") {
    return [];
  }
  const l: AppLocale = params?.locale === "en" ? "en" : "fr";
  const b = brandSlug.toLowerCase();
  return getAllCars()
    .filter((car) => brandToSlug(car.brand) === b)
    .map((car) => ({ carSlug: carSlugForLocale(car.slug, l) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandSlug, carSlug } = await params;
  const locale = await getLocale();
  const l: AppLocale = locale === "en" ? "en" : "fr";
  const carRaw = getCarBySlug(carSlug);

  if (!carRaw || brandToSlug(carRaw.brand) !== brandSlug.toLowerCase()) {
    const t = await getTranslations({ locale: l, namespace: "seo" });
    return {
      title: t("carNotFound.title"),
      description: t("carNotFound.description"),
      robots: { index: false, follow: false },
      openGraph: {
        title: t("carNotFound.title"),
        description: t("carNotFound.description"),
      },
      twitter: {
        title: t("carNotFound.title"),
        description: t("carNotFound.description"),
      },
      icons: { icon: "/favicon.ico" },
      alternates: localizedAlternates(l, "/cars"),
    };
  }

  const localized = carForLocale(carRaw, l);
  const frSlug = carRaw.slug;
  const enSlug = frenchCarSlugToEnglishSlug(frSlug);

  const pageTitle =
    localized.richContent?.seoTitle ||
    localized.richContent?.h1Title ||
    `${carRaw.carName} - Luxury Car Rental | Amseel Cars`;
  const metaDescription =
    localized.richContent?.seoMetaDescription || localized.description;

  const canonicalPath = getPathname({
    locale: l,
    href: {
      pathname: "/cars/brand/[brandSlug]/[carSlug]",
      params: {
        brandSlug: brandToSlug(carRaw.brand),
        carSlug: localized.slug,
      },
    },
  });

  return {
    title: pageTitle,
    description: metaDescription,
    keywords: [
      carRaw.brand,
      carRaw.model,
      carRaw.category,
      "luxury car rental",
      "Morocco",
      "location voiture",
      "Agadir",
    ],
    alternates: localizedCarBrandScopedAlternates(l, carRaw.brand, frSlug, enSlug),
    openGraph: {
      title: pageTitle,
      description: metaDescription,
      url: canonicalPath,
      images: [
        {
          url: carRaw.carImage,
          width: 1200,
          height: 630,
          alt: carRaw.carName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: metaDescription,
      images: [carRaw.carImage],
    },
  };
}

export default async function CarBrandScopedDetailPage({ params }: Props) {
  const { brandSlug, carSlug } = await params;
  const carRaw = getCarBySlug(carSlug);

  if (!carRaw || brandToSlug(carRaw.brand) !== brandSlug.toLowerCase()) {
    notFound();
  }

  const locale = await getLocale();
  const l: AppLocale = locale === "en" ? "en" : "fr";
  const car = carForLocale(carRaw, l);
  const tNav = await getTranslations({ locale: l, namespace: "nav" });
  const homePath = getPathname({ locale: l, href: "/" });
  const carsPath = getPathname({ locale: l, href: "/cars" });
  const brandPath = getPathname({
    locale: l,
    href: {
      pathname: "/cars/brand/[brandSlug]",
      params: { brandSlug: brandToSlug(carRaw.brand) },
    },
  });
  const carPath = getPathname({
    locale: l,
    href: {
      pathname: "/cars/brand/[brandSlug]/[carSlug]",
      params: {
        brandSlug: brandToSlug(carRaw.brand),
        carSlug: car.slug,
      },
    },
  });

  const productPageUrl = `https://www.amseelcars.com${carPath}`;

  const carProductSchema = generateCarProductSchema(
    {
      carName: car.carName,
      brand: car.brand,
      model: car.model,
      description: car.description,
      pricePerDay: car.pricePerDay,
      images: car.images,
      slug: car.slug,
      category: car.category,
      year: car.year,
      fuelType: car.fuelType,
      transmission: car.transmission,
      seats: car.seats,
    },
    { productPageUrl, stableId: carRaw.slug },
  );

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: tNav("home"), url: homePath },
    { name: tNav("cars"), url: carsPath },
    { name: car.brand, url: brandPath },
    { name: car.carName, url: carPath },
  ]);

  const faqSchema = car.richContent?.faqs
    ? generateFAQSchema(car.richContent.faqs)
    : null;

  return (
    <>
      <Script
        id="ld-json-car-product"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(carProductSchema) }}
      />
      <Script
        id="ld-json-breadcrumb-car"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema ? (
        <Script
          id="ld-json-faq-car"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}

      <CarDetailClient
        car={car}
        brandHub={{ label: car.brand, brandSlug: brandToSlug(carRaw.brand) }}
      />
    </>
  );
}
