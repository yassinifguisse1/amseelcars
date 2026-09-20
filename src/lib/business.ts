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

/**
 * Google Business Profile pin (Agadir — Immeuble Sinwan).
 * Keep in sync with the live Maps listing.
 */
export const BUSINESS_GEO = {
  latitude: 30.4008596,
  longitude: -9.5775854,
} as const;

/** Places API / Maps place_id for Amseel Cars GBP */
export const BUSINESS_GOOGLE_PLACE_ID = "ChIJ6UYIlG63sw0Rkl2swhA3p08";

/** Google Maps feature cid (from 0x4fa73710c2ac5d92) */
export const BUSINESS_GOOGLE_MAPS_CID = "5739616795232066962";

/**
 * Canonical Google Maps place URL for schema `hasMap` + `sameAs`.
 * Prefer place_id (stable) over ephemeral share tracking params.
 */
export const BUSINESS_GOOGLE_MAPS_URL =
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${BUSINESS_GEO.latitude},${BUSINESS_GEO.longitude}`,
  )}&query_place_id=${BUSINESS_GOOGLE_PLACE_ID}` as const;

/** Human-readable Maps place page (GBP title slug) */
export const BUSINESS_GOOGLE_MAPS_PLACE_URL =
  "https://www.google.com/maps/place/Amseel+Cars+-+Location+voiture+agadir+a%C3%A9roport,+Car+rental+agadir+without+deposit,+location+voitures+pas+cher/@30.4008596,-9.5775854,17z/data=!3m1!4b1!4m6!3m5!1s0xdb3b76e940846e9:0x4fa73710c2ac5d92!8m2!3d30.4008596!4d-9.5775854!16s%2Fg%2F11w7lk46s0";

/** Footer / Maps-aligned social profiles */
export const BUSINESS_SOCIAL = {
  facebook: "https://www.facebook.com/people/Amseel-Cars/61582652224473/",
  instagram: "https://www.instagram.com/amseelcarsofficial/",
  tiktok: "https://www.tiktok.com/@amseelcars",
  pinterest: "https://www.pinterest.com/amseelcars/",
  whatsapp: BUSINESS_WHATSAPP_URL,
  googleMaps: BUSINESS_GOOGLE_MAPS_URL,
} as const;

export const BUSINESS_SAME_AS = [
  BUSINESS_SOCIAL.facebook,
  BUSINESS_SOCIAL.instagram,
  BUSINESS_SOCIAL.tiktok,
  BUSINESS_SOCIAL.pinterest,
  BUSINESS_SOCIAL.whatsapp,
  BUSINESS_SOCIAL.googleMaps,
] as const;
