import type { Metadata } from "next";

export const SITE_URL = "https://www.amseelcars.com";
export const SITE_NAME = "AmseelCars";

/** Canonical social / OG image (exists under /public/og). */
export const DEFAULT_OG_IMAGE =
  "/og/location-voiture-agadir-logo-opengraph-amseel-cars-bmw-golf8-turoc-touareg.webp";

export const DEFAULT_OG_IMAGE_ALT =
  "AmseelCars location voiture Agadir, flotte BMW, Golf 8, T-Roc";

export function defaultOgImages(alt?: string): NonNullable<
  NonNullable<Metadata["openGraph"]>["images"]
> {
  return [
    {
      url: DEFAULT_OG_IMAGE,
      width: 1200,
      height: 630,
      alt: alt ?? DEFAULT_OG_IMAGE_ALT,
    },
  ];
}

/** Bypass root `%s | AmseelCars` template when the title is already fully branded. */
export function absoluteTitle(title: string): Metadata["title"] {
  return { absolute: title };
}

type BuildPageMetaInput = {
  title: string;
  description: string;
  path: string;
  localeOg: string;
  alternates: NonNullable<Metadata["alternates"]>;
  ogTitle?: string;
  ogDescription?: string;
  imageAlt?: string;
};

/** Shared ranking metadata block for public pages. */
export function buildPageMetadata({
  title,
  description,
  path,
  localeOg,
  alternates,
  ogTitle,
  ogDescription,
  imageAlt,
}: BuildPageMetaInput): Metadata {
  const images = defaultOgImages(imageAlt);
  const socialTitle = ogTitle ?? title;
  const socialDescription = ogDescription ?? description;

  return {
    title: absoluteTitle(title),
    description,
    alternates,
    openGraph: {
      type: "website",
      url: `${SITE_URL}${path}`,
      siteName: SITE_NAME,
      locale: localeOg,
      title: socialTitle,
      description: socialDescription,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: socialDescription,
      images: [DEFAULT_OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
  };
}
