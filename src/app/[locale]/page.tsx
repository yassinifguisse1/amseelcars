import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getImageProps } from "next/image";
import { preload } from "react-dom";
import { HomeContentLandingPage } from "./HomeContentLandingPage";
import {
  generateLocalBusinessSchema,
  generateBreadcrumbSchema,
  generateReviewSchema,
  generateAggregateRatingSchema,
  generateFleetOfferItemListSchema,
} from "@/lib/schemas";
import { JsonLd } from "@/components/seo/JsonLd";
import { reviews } from "@/data/reviews";
import { getAllCars } from "@/data/cars";
import { getGooglePlaceRatingSummary } from "@/lib/googlePlaceRating";
import { localizedAlternates } from "@/lib/seo/localized-alternates";
import { buildPageMetadata } from "@/lib/seo/site-meta";
import { routing, type AppLocale } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";
import { localeToOpenGraphLocale } from "@/i18n/locale-utils";
import { brandToSlug } from "@/lib/brandSlug";
import { carSlugForLocale } from "@/lib/carSlugLocale";
import { SITE_URL } from "@/lib/business";

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
  const tCars = await getTranslations({ locale: l, namespace: "carsPage" });
  const localBusinessSchema = generateLocalBusinessSchema();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: tHome("breadcrumb"), url: homePath },
  ]);
  const googleRating = await getGooglePlaceRatingSummary();

  const localBusinessWithRating = {
    ...localBusinessSchema,
    aggregateRating: generateAggregateRatingSchema(reviews, {
      rating: googleRating.rating,
      reviewCount: googleRating.reviewCount,
    }),
  };

  const allCars = getAllCars();
  const fleetOfferListSchema = generateFleetOfferItemListSchema(
    allCars.slice(0, 24).map((car) => ({
      brand: car.brand,
      carName: car.carName,
      model: car.model,
      description: car.description,
      pricePerDay: car.pricePerDay,
      carImage: car.carImage,
      slug: car.slug,
      year: car.year,
      fuelType: car.fuelType,
      transmission: car.transmission,
      seats: car.seats,
      productPageUrl: `${SITE_URL}${getPathname({
        locale: l,
        href: {
          pathname: "/cars/brand/[brandSlug]/[carSlug]",
          params: {
            brandSlug: brandToSlug(car.brand),
            carSlug: carSlugForLocale(car.slug, l),
          },
        },
      })}`,
    })),
    {
      name: tCars("schema.itemListName"),
      listUrl: `${SITE_URL}${homePath}`,
      listId: `${SITE_URL}${homePath}#fleet-offers`,
    },
  );

  const firstCarImage = allCars[0]?.carImage;
  if (firstCarImage) {
    const { props } = getImageProps({
      src: firstCarImage,
      alt: "",
      width: 760,
      height: 570,
      sizes: "(max-width: 480px) 260px, (max-width: 768px) 300px, 380px",
    });
    // React preload API — avoids a raw <link> that can surface as unused preconnect to "/".
    if (props.srcSet) {
      preload(props.src || firstCarImage, {
        as: "image",
        imageSrcSet: props.srcSet,
        imageSizes: props.sizes,
        fetchPriority: "high",
      });
    } else if (props.src) {
      preload(props.src, { as: "image", fetchPriority: "high" });
    }
  }

  return (
    <>
      <JsonLd id="ld-json-local-business" data={localBusinessWithRating} />
      <JsonLd id="ld-json-breadcrumb-home" data={breadcrumbSchema} />
      <JsonLd id="ld-json-home-fleet-offers" data={fleetOfferListSchema} />
      {reviews.map((review) => (
        <JsonLd
          key={review.id}
          id={`ld-json-review-${review.id}`}
          data={generateReviewSchema(review)}
        />
      ))}

      <HomeContentLandingPage />
    </>
  );
}
