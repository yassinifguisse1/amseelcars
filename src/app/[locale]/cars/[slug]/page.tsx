import { notFound, permanentRedirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { getAllCarSlugs, getCarBySlug } from "@/data/cars";
import { carSlugForLocale } from "@/lib/carSlugLocale";
import { brandToSlug } from "@/lib/brandSlug";
import type { AppLocale } from "@/i18n/routing";

/**
 * Legacy `/cars/[slug]` and `/voitures/[slug]` URLs: permanent redirect to
 * brand-scoped canonical URLs for clearer IA and SEO.
 */
interface LegacyCarSlugPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams({
  params,
}: {
  params: { locale?: string };
}): { slug: string }[] {
  const l: AppLocale = params.locale === "en" ? "en" : "fr";
  return getAllCarSlugs().map((fr) => ({ slug: carSlugForLocale(fr, l) }));
}

export default async function LegacyCarSlugRedirect({ params }: LegacyCarSlugPageProps) {
  const { slug } = await params;
  const car = getCarBySlug(slug);
  if (!car) {
    notFound();
  }
  const locale = await getLocale();
  const l: AppLocale = locale === "en" ? "en" : "fr";
  const path = getPathname({
    locale: l,
    href: {
      pathname: "/cars/brand/[brandSlug]/[carSlug]",
      params: {
        brandSlug: brandToSlug(car.brand),
        carSlug: carSlugForLocale(car.slug, l),
      },
    },
  });
  permanentRedirect(path);
}
