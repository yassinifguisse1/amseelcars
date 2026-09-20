/**
 * Canonical NAP + social profiles — keep in sync with Google Business Profile.
 * Source of truth for schema, footer, contact, and CTAs.
 */

export const SITE_URL = "https://www.amseelcars.com";
export const SITE_NAME = "AmseelCars";

/** E.164; national (Morocco): 0662500181 */
export const BUSINESS_TELEPHONE_E164 = "+212662500181";
export const BUSINESS_TELEPHONE_DISPLAY = "+212 662 500 181";
export const BUSINESS_WHATSAPP_URL = "https://wa.me/212662500181";

/** Canonical public email (Google Business / site contact) */
export const BUSINESS_EMAIL = "amseelcars5@gmail.com";
export const BUSINESS_MAILTO = `mailto:${BUSINESS_EMAIL}`;

/** Google Maps listing address: Immeuble Sinwan, RDC, Agadir 80000, Maroc */
export const BUSINESS_POSTAL_ADDRESS = {
  streetAddress: "Immeuble Sinwan, RDC",
  addressLocality: "Agadir",
  addressRegion: "Souss-Massa",
  postalCode: "80000",
  addressCountry: "MA",
} as const;

export const BUSINESS_ADDRESS_DISPLAY_FR =
  "Immeuble Sinwan, RDC, Agadir 80000, Maroc";

export const BUSINESS_GEO = {
  latitude: 30.40085,
  longitude: -9.57758,
} as const;

/** Footer / Maps-aligned social profiles */
export const BUSINESS_SOCIAL = {
  facebook: "https://www.facebook.com/people/Amseel-Cars/61582652224473/",
  instagram: "https://www.instagram.com/amseelcarsofficial/",
  tiktok: "https://www.tiktok.com/@amseelcars",
  pinterest: "https://www.pinterest.com/amseelcars/",
  whatsapp: BUSINESS_WHATSAPP_URL,
} as const;

export const BUSINESS_SAME_AS = [
  BUSINESS_SOCIAL.facebook,
  BUSINESS_SOCIAL.instagram,
  BUSINESS_SOCIAL.tiktok,
  BUSINESS_SOCIAL.pinterest,
  BUSINESS_SOCIAL.whatsapp,
] as const;
