import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/images/wheel-*.webp',
          '/images/*wheel*.webp',
          '/images/left wheel*.webp',
          '/images/right wheel*.webp',
          '/images/*wheel left*.webp',
          '/images/*wheel right*.webp',
        ],
      },
    ],
    sitemap: 'https://amseelcars.com/sitemap.xml',
  }
}

