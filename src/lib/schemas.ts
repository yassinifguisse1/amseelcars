/**
 * JSON-LD Schema utilities for structured data
 * Following Schema.org best practices
 */

import {
  BUSINESS_EMAIL,
  BUSINESS_GBP_CATEGORY,
  BUSINESS_GBP_NAME,
  BUSINESS_GEO,
  BUSINESS_GOOGLE_MAPS_CID,
  BUSINESS_GOOGLE_MAPS_CID_URL,
  BUSINESS_GOOGLE_MAPS_FEATURE_ID,
  BUSINESS_GOOGLE_MAPS_PLACE_URL,
  BUSINESS_GOOGLE_MAPS_URL,
  BUSINESS_GOOGLE_PLACE_ID,
  BUSINESS_PLUS_CODE,
  BUSINESS_POSTAL_ADDRESS,
  BUSINESS_SAME_AS,
  BUSINESS_TELEPHONE_E164,
  BUSINESS_WHATSAPP_URL,
  SITE_NAME,
  SITE_URL,
} from "./business";
import { convertCarPrice } from "./currency";

const siteUrl = SITE_URL;
const siteName = SITE_NAME;
const businessTelephone = BUSINESS_TELEPHONE_E164;
const businessPostalAddress = BUSINESS_POSTAL_ADDRESS;

/**
 * Organization schema - used sitewide
 */
export function generateOrganizationSchema() {
  return {
    '@type': 'Organization',
    '@id': `${siteUrl}#org`,
    name: siteName,
    alternateName: ['Amseel Cars', BUSINESS_GBP_NAME],
    url: siteUrl,
    logo: `${siteUrl}/og/location-voiture-agadir-logo-opengraph-amseel-cars-bmw-golf8-turoc-touareg.webp`,
    // Same entity as LocalBusiness / GBP — Maps URLs in sameAs help disambiguate.
    sameAs: [...BUSINESS_SAME_AS],
  };
}

/**
 * WebSite schema - used on homepage
 */
export function generateWebSiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${siteUrl}#website`,
    url: siteUrl,
    name: siteName,
    publisher: { '@id': `${siteUrl}#org` },
    inLanguage: ['fr', 'en', 'es', 'de', 'pl'],
  };
}

/**
 * LocalBusiness (AutoRental) schema - used on homepage and contact page.
 * NAP + geo + Maps identifiers intentionally mirror the live GBP listing.
 */
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRental',
    '@id': `${siteUrl}#business`,
    name: siteName,
    alternateName: [
      'Amseel Cars',
      'AmseelCars Agadir',
      'Amseel Cars - Location voiture agadir aéroport',
      BUSINESS_GBP_NAME,
    ],
    description:
      'Car rental agency in Agadir, Morocco: airport (AGA) and city pickup, WhatsApp booking, economy to premium fleet. Same business as the Google Maps listing Amseel Cars.',
    url: siteUrl,
    image: `${siteUrl}/og/location-voiture-agadir-logo-opengraph-amseel-cars-bmw-golf8-turoc-touareg.webp`,
    logo: `${siteUrl}/og/location-voiture-agadir-logo-opengraph-amseel-cars-bmw-golf8-turoc-touareg.webp`,
    telephone: businessTelephone,
    email: BUSINESS_EMAIL,
    address: {
      '@type': 'PostalAddress',
      ...businessPostalAddress,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: BUSINESS_GEO.latitude,
      longitude: BUSINESS_GEO.longitude,
    },
    // Links the site entity to the Google Business / Maps pin for local SEO.
    hasMap: [
      BUSINESS_GOOGLE_MAPS_PLACE_URL,
      BUSINESS_GOOGLE_MAPS_URL,
      BUSINESS_GOOGLE_MAPS_CID_URL,
    ],
    identifier: [
      {
        '@type': 'PropertyValue',
        name: 'Google Place ID',
        value: BUSINESS_GOOGLE_PLACE_ID,
      },
      {
        '@type': 'PropertyValue',
        name: 'Google Maps CID',
        value: BUSINESS_GOOGLE_MAPS_CID,
      },
      {
        '@type': 'PropertyValue',
        name: 'Google Maps Feature ID',
        value: BUSINESS_GOOGLE_MAPS_FEATURE_ID,
      },
      {
        '@type': 'PropertyValue',
        name: 'Plus Code',
        value: BUSINESS_PLUS_CODE,
      },
      {
        '@type': 'PropertyValue',
        name: 'Google Business Category',
        value: BUSINESS_GBP_CATEGORY,
      },
    ],
    priceRange: '$$',
    currenciesAccepted: 'EUR, USD',
    paymentAccepted: 'Cash, Credit Card',
    // Some validators are picky with arrays here; keep one ContactPoint and
    // expose WhatsApp via `sameAs` (and the URL on this contact point).
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: businessTelephone,
      email: BUSINESS_EMAIL,
      url: BUSINESS_WHATSAPP_URL,
      availableLanguage: ['fr', 'en', 'es', 'de', 'pl'],
      areaServed: 'MA',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'https://schema.org/Monday',
          'https://schema.org/Tuesday',
          'https://schema.org/Wednesday',
          'https://schema.org/Thursday',
          'https://schema.org/Friday',
          'https://schema.org/Saturday',
          'https://schema.org/Sunday',
        ],
        opens: '00:00',
        closes: '23:59',
      },
    ],
    areaServed: [
      {
        '@type': 'City',
        name: 'Agadir',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Souss-Massa',
      },
      {
        '@type': 'Airport',
        name: 'Agadir Al Massira Airport',
        iataCode: 'AGA',
      },
      {
        '@type': 'City',
        name: 'Taghazout',
      },
      {
        '@type': 'City',
        name: 'Tamraght',
      },
      {
        '@type': 'Country',
        name: 'Morocco',
      },
    ],
    sameAs: [...BUSINESS_SAME_AS],
    parentOrganization: { '@id': `${siteUrl}#org` },
  };
}

/**
 * BlogPosting schema - used on blog article pages
 */
export function generateBlogPostingSchema(article: {
  title: string;
  description: string;
  image: string;
  imageMetaTitle?: string;
  imageAltText?: string;
  imageCaption?: string;
  imageDescription?: string;
  author: { name: string; bio?: string };
  publishedAt: string;
  updatedAt?: string;
  slug: string; // Full path like "guide-pratique/location-de-voiture-a-agadir"
  category: string;
  locale?: string;
}) {
  const articleUrl = `${siteUrl}/${article.locale ?? "fr"}/blog/${article.slug}`;
  const imageUrl = article.image.startsWith('http') 
    ? article.image 
    : article.image.startsWith('/') 
      ? `${siteUrl}${article.image}`
      : `${siteUrl}/${article.image}`;
  
  return {
    '@context': 'https://schema.org',
    // Put Article first so generic schema testers detect "Article" explicitly.
    '@type': ['Article', 'BlogPosting'],
    url: articleUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    headline: article.title,
    description: article.description.substring(0, 160), // Max 160 chars
    image: [
      {
        '@type': 'ImageObject',
        url: imageUrl,
        ...(article.imageMetaTitle ? { name: article.imageMetaTitle } : {}),
        ...(article.imageCaption ? { caption: article.imageCaption } : {}),
        ...(article.imageDescription ? { description: article.imageDescription } : {}),
        ...(article.imageAltText ? { alternateName: article.imageAltText } : {}),
      },
    ],
    author: {
      '@type': 'Person',
      name: article.author.name,
      ...(article.author.bio ? { description: article.author.bio } : {}),
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/og/location-voiture-agadir-logo-opengraph-amseel-cars-bmw-golf8-turoc-touareg.webp`,
      },
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    articleSection: article.category,
  };
}

/**
 * AboutPage schema - used on /about
 */
export function generateAboutPageSchema(input: {
  path: string;
  title: string;
  description: string;
  inLanguage: string;
}) {
  const path = input.path.startsWith('/') ? input.path : `/${input.path}`;
  const pageUrl = `${siteUrl}${path}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${pageUrl}#about-page`,
    url: pageUrl,
    name: input.title,
    description: input.description,
    inLanguage: input.inLanguage,
    isPartOf: { '@id': `${siteUrl}#website` },
    about: { '@id': `${siteUrl}#business` },
    publisher: { '@id': `${siteUrl}#org` },
    mainEntity: { '@id': `${siteUrl}#business` },
  };
}

/**
 * ContactPage schema - used on /contact
 */
export function generateContactPageSchema(input: {
  path: string;
  title: string;
  description: string;
  inLanguage: string;
}) {
  const path = input.path.startsWith('/') ? input.path : `/${input.path}`;
  const pageUrl = `${siteUrl}${path}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${pageUrl}#contact-page`,
    url: pageUrl,
    name: input.title,
    description: input.description,
    inLanguage: input.inLanguage,
    isPartOf: { '@id': `${siteUrl}#website` },
    about: { '@id': `${siteUrl}#business` },
    publisher: { '@id': `${siteUrl}#org` },
    mainEntity: { '@id': `${siteUrl}#business` },
  };
}

/**
 * BreadcrumbList schema - used on all crawlable pages
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`,
    })),
  };
}

/**
 * Single JSON-LD @graph for local SEO / AEO landing pages: WebPage + BreadcrumbList + FAQPage (+ optional Service).
 * Links to sitewide #website, #org, and #business @ids from layout/homepage for entity consistency.
 */
export function generateLocalSeoLandingGraphSchema(input: {
  path: string;
  name: string;
  description: string;
  inLanguage: string;
  breadcrumbItems: Array<{ name: string; url: string }>;
  faqs: Array<{ question: string; answer: string }>;
  service?: { name: string; description: string };
  /** Absolute or root-relative OG/social image for primaryImageOfPage */
  primaryImagePath?: string;
  /** Override default areaServed on Service (e.g. Taghazout-focused page) */
  serviceAreaServed?: Array<Record<string, unknown>>;
}) {
  const path = input.path.startsWith('/') ? input.path : `/${input.path}`;
  const pageUrl = `${siteUrl}${path}`;

  const rawImage = input.primaryImagePath ?? '/og/location-voiture-agadir-logo-opengraph-amseel-cars-bmw-golf8-turoc-touareg.webp';
  const imagePath = rawImage.startsWith('http')
    ? rawImage
    : `${siteUrl}${rawImage.startsWith('/') ? rawImage : `/${rawImage}`}`;

  const faqMainEntity = input.faqs.map((faq) => ({
    '@type': 'Question' as const,
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer' as const,
      text: `<p>${faq.answer}</p>`,
    },
  }));

  const about: Array<{ '@id': string }> = [{ '@id': `${siteUrl}#business` }];
  if (input.service) {
    about.push({ '@id': `${pageUrl}#service` });
  }

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: input.name,
      description: input.description,
      inLanguage: input.inLanguage,
      isPartOf: { '@id': `${siteUrl}#website` },
      about,
      publisher: { '@id': `${siteUrl}#org` },
      mainEntity: { '@id': `${pageUrl}#faq` },
      breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: imagePath,
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: input.breadcrumbItems.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`,
      })),
    },
  ];

  if (input.service) {
    const defaultAreaServed = [
      { '@type': 'City', name: 'Agadir' },
      { '@type': 'Airport', name: 'Agadir-Al Massira Airport' },
      { '@type': 'Country', name: 'Morocco' },
    ];
    graph.push({
      '@type': 'Service',
      '@id': `${pageUrl}#service`,
      name: input.service.name,
      description: input.service.description,
      url: pageUrl,
      inLanguage: input.inLanguage,
      serviceType: 'Car rental',
      provider: { '@id': `${siteUrl}#business` },
      areaServed: input.serviceAreaServed ?? defaultAreaServed,
      isPartOf: { '@id': `${siteUrl}#website` },
      mainEntityOfPage: { '@id': `${pageUrl}#webpage` },
    });
  }

  graph.push({
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    inLanguage: input.inLanguage,
    isPartOf: { '@id': `${siteUrl}#website` },
    about,
    publisher: { '@id': `${siteUrl}#org` },
    mainEntityOfPage: { '@id': `${pageUrl}#webpage` },
    mainEntity: faqMainEntity,
  });

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

/**
 * Product (Car) schema - used on car detail pages
 */
export function generateCarProductSchema(
  car: {
    carName: string;
    brand: string;
    model: string;
    description: string;
    pricePerDay: number;
    images: Array<{ src: string }>;
    slug: string;
    category: string;
    year: number;
    fuelType: string;
    transmission: string;
    seats: number;
  },
  options?: { productPageUrl?: string; stableId?: string },
) {
  const carUrl =
    options?.productPageUrl ?? `${siteUrl}/cars/${car.slug}`;
  const stableId = options?.stableId ?? car.slug;
  const images = car.images.map((img) =>
    img.src.startsWith('http') ? img.src : `${siteUrl}${img.src}`
  );

  return {
    '@context': 'https://schema.org',
    // Product for commerce + Car for vehicle-specific properties (doors, fuel, transmission, etc.).
    '@type': ['Product', 'Car'],
    '@id': `${carUrl}#product`,
    name: car.carName,
    description: car.description,
    image: images,
    brand: {
      '@type': 'Brand',
      name: car.brand,
    },
    category: car.category,
    vehicleIdentificationNumber: stableId,
    vehicleModelDate: car.year.toString(),
    numberOfDoors: '5', // Default, update if you track this
    fuelType: car.fuelType,
    vehicleTransmission: car.transmission,
    seatingCapacity: car.seats,
    offers: {
      '@type': 'Offer',
      url: carUrl,
      priceCurrency: 'EUR',
      price: convertCarPrice(car.pricePerDay, 'EUR').toString(),
      availability: 'https://schema.org/InStock',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: convertCarPrice(car.pricePerDay, 'EUR').toString(),
        priceCurrency: 'EUR',
        unitText: 'per day',
      },
    },
  };
}

/**
 * Review schema - used for individual reviews on homepage
 * Following Google's Review snippet guidelines: https://developers.google.com/search/docs/appearance/structured-data/review-snippet
 */
export function generateReviewSchema(review: {
  id: string;
  author: { name: string; image?: string };
  rating: number;
  reviewBody: string;
  datePublished: string;
  publisher?: { name: string; url?: string };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    '@id': `${siteUrl}#review-${review.id}`,
    // Reference the stable LocalBusiness entity to avoid duplicating fields.
    itemReviewed: { '@id': `${siteUrl}#business` },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating.toString(),
      bestRating: '5',
      worstRating: '1',
    },
    author: {
      '@type': 'Person',
      name: review.author.name,
      ...(review.author.image && { image: review.author.image }),
    },
    reviewBody: review.reviewBody,
    datePublished: review.datePublished,
    ...(review.publisher && {
      publisher: {
        '@type': 'Organization',
        name: review.publisher.name,
        ...(review.publisher.url && { url: review.publisher.url }),
      },
    }),
  };
}

/**
 * AggregateRating schema for LocalBusiness - used on homepage
 * Combines all reviews into an aggregate rating
 */
export function generateAggregateRatingSchema(reviews: Array<{ rating: number }>) {
  const ratingCount = reviews.length;
  const ratingValue = reviews.reduce((sum, review) => sum + review.rating, 0) / ratingCount;

  return {
    '@type': 'AggregateRating',
    // Some validators expect this even when nested under LocalBusiness.
    itemReviewed: { '@id': `${siteUrl}#business` },
    ratingValue: Number(ratingValue.toFixed(1)),
    ratingCount,
    reviewCount: ratingCount,
    bestRating: 5,
    worstRating: 1,
  };
}
