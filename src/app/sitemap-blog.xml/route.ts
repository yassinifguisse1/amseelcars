import { NextResponse } from 'next/server'
import { getAllArticles, categoryToSlug } from '@/data/blog'

export async function GET() {
  const baseUrl = 'https://amseelcars.com'
  const articles = getAllArticles()

  // Generate blog post URLs
  const urls = articles
    .map((article) => {
      const lastmod = new Date(article.publishedAt).toISOString().split('T')[0]
      const url = `${baseUrl}/blog/${categoryToSlug(article.category)}/${article.slug}`
      return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`
    })
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

