import { NextResponse } from 'next/server'
import { getAllCarSlugs } from '@/data/cars'

export async function GET() {
  const baseUrl = 'https://www.amseelcars.com'
  const now = new Date().toISOString().split('T')[0]

  // Static pages
  const staticPages = [
    { url: '', lastmod: now },
    { url: '/about', lastmod: now },
    { url: '/cars', lastmod: now },
    { url: '/contact', lastmod: now },
    { url: '/blog', lastmod: now },
  ]

  // Dynamic car pages
  const carSlugs = getAllCarSlugs()
  const carPages = carSlugs.map((slug) => ({
    url: `/cars/${slug}`,
    lastmod: now,
  }))

  // Combine all pages
  const allPages = [...staticPages, ...carPages]

  // Generate XML
  const urls = allPages
    .map(
      (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
  </url>`
    )
    .join('\n')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}

