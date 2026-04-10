import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Home animation assets (block image indexing for these files)
          '/images/touareg-body.png',
          '/images/bmw-body.webp',
          '/images/kia-body.webp',
          '/images/t-roc-body.webp',
          '/images/golf8-body.webp',
          '/images/wheel-*.webp',
          '/images/*wheel*.webp',
          '/images/left wheel*.webp',
          '/images/right wheel*.webp',
          '/images/*wheel left*.webp',
          '/images/*wheel right*.webp',
        ],
      },
    ],
    sitemap: 'https://www.amseelcars.com/sitemap.xml',
  }
}

