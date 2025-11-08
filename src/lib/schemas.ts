/**
 * JSON-LD Schema utilities for structured data
 * Following Schema.org best practices
 */

const siteUrl = 'https://amseelcars.com';
const siteName = 'AmseelCars';

/**
 * Organization schema - used sitewide
 */
export function generateOrganizationSchema() {
  return {
    '@type': 'Organization',
    '@id': `${siteUrl}#org`,
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/og/amseel-car-logo.png`,
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
 * LocalBusiness (CarRental) schema - used on homepage and contact page
 */
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CarRental',
    '@id': `${siteUrl}#business`,
    name: siteName,
    url: siteUrl,
    telephone: '+212662500181',
    email: 'info@amseelcars.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Agadir',
      addressLocality: 'Agadir',
      addressRegion: 'Souss-Massa',
      addressCountry: 'MA',
    },
    openingHours: 'Mo-Su 08:00-22:00',
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
        '@type': 'Country',
        name: 'Maroc',
      },
    ],
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
  const articleUrl = `${siteUrl}/blog/${article.slug}`;
  const imageUrl = article.image.startsWith('http') 
    ? article.image 
    : article.image.startsWith('/') 
      ? `${siteUrl}${article.image}`
      : `${siteUrl}/${article.image}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
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
        url: `${siteUrl}/og/amseel-car-logo.png`,
      },
    },
    datePublished: article.publishedAt,
    dateModified: article.publishedAt, // Update if you track modifications
    articleSection: article.category,
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
 * Product (Car) schema - used on car detail pages
 */
export function generateCarProductSchema(car: {
  carName: string;
  brand: string;
  model: string;
  description: string;
  pricePerDay: number;
  images: Array<{ src: string }>;
  rating: number;
  slug: string;
  category: string;
  year: number;
  fuelType: string;
  transmission: string;
  seats: number;
}) {
  const carUrl = `${siteUrl}/cars/${car.slug}`;
  const images = car.images.map((img) =>
    img.src.startsWith('http') ? img.src : `${siteUrl}${img.src}`
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${carUrl}#product`,
    name: car.carName,
    description: car.description,
    image: images,
    brand: {
      '@type': 'Brand',
      name: car.brand,
    },
    category: car.category,
    additionalType: 'https://schema.org/Car',
    vehicleIdentificationNumber: car.slug, // Using slug as identifier
    vehicleModelDate: car.year.toString(),
    numberOfDoors: '5', // Default, update if you track this
    numberOfAirbags: '6', // Default, update if you track this
    fuelType: car.fuelType,
    transmission: car.transmission,
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
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: car.rating.toString(),
      ratingCount: '100', // Update with real review count if available
      bestRating: '5',
      worstRating: '1',
    },
  };
}

