/**
 * JSON-LD Schema utilities for structured data
 * Following Schema.org best practices
 */

const siteUrl = 'https://www.amseelcars.com';
const siteName = 'AmseelCars';

/** E.164; national (Morocco): 0662500181 */
const businessTelephone = '+212662500181';

const businessPostalAddress = {
  streetAddress: 'Immeuble Sinwan, RDC',
  addressLocality: 'Agadir',
  addressRegion: 'Souss-Massa',
  postalCode: '80000',
  addressCountry: 'MA',
} as const;

/**
 * Organization schema - used sitewide
 */
export function generateOrganizationSchema() {
  return {
    '@type': 'Organization',
    '@id': `${siteUrl}#org`,
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/og/location-voiture-agadir-logo-opengraph-amseel-cars-bmw-golf8-turoc-touareg.webp`,
    sameAs: [
      'https://www.facebook.com/amseelcars/',
      'https://www.instagram.com/amseelcars/',
      'https://wa.me/212662500181',
    ],
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
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * LocalBusiness (AutoRental) schema - used on homepage and contact page
 */
export function generateLocalBusinessSchema() {
  const businessMapsUrl =
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent(
      `${businessPostalAddress.streetAddress}, ${businessPostalAddress.postalCode} ${businessPostalAddress.addressLocality}, Morocco`
    );

  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRental',
    '@id': `${siteUrl}#business`,
    name: siteName,
    url: siteUrl,
    image: `${siteUrl}/og/location-voiture-agadir-logo-opengraph-amseel-cars-bmw-golf8-turoc-touareg.webp`,
    logo: `${siteUrl}/og/location-voiture-agadir-logo-opengraph-amseel-cars-bmw-golf8-turoc-touareg.webp`,
    telephone: businessTelephone,
    email: 'info@amseelcars.com',
    address: {
      '@type': 'PostalAddress',
      ...businessPostalAddress,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 30.40085,
      longitude: -9.57758,
    },
    hasMap: businessMapsUrl,
    priceRange: '$$',
    currenciesAccepted: 'MAD',
    paymentAccepted: 'Cash, Credit Card',
    // Some validators are picky with arrays here; keep one ContactPoint and
    // expose WhatsApp via `sameAs` (and the URL on this contact point).
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: businessTelephone,
      email: 'info@amseelcars.com',
      url: 'https://wa.me/212662500181',
      availableLanguage: ['fr', 'en',],
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
        '@type': 'Airport',
        name: 'Aéroport Agadir–Al Massira',
      },
      {
        '@type': 'City',
        name: 'Taghazout',
      },
      {
        '@type': 'Country',
        name: 'Morocco',
      },
    ],
    sameAs: [
      'https://www.facebook.com/amseelcars/',
      'https://www.instagram.com/amseelcars/',
      'https://wa.me/212662500181',
    ],
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
  author: { name: string };
  publishedAt: string;
  slug: string; // Full path like "guide-pratique/location-de-voiture-a-agadir"
  category: string;
}) {
  const articleUrl = `${siteUrl}/fr/blog/${article.slug}`;
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
    image: [imageUrl],
    author: {
      '@type': 'Person',
      name: article.author.name,
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
    dateModified: article.publishedAt, // Update if you track modifications
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

  const rawImage = input.primaryImagePath ?? '/og/og-default.jpg';
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
      { '@type': 'Airport', name: 'Agadir–Al Massira Airport' },
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
      priceCurrency: 'MAD',
      price: car.pricePerDay.toString(),
      availability: 'https://schema.org/InStock',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: car.pricePerDay.toString(),
        priceCurrency: 'MAD',
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
