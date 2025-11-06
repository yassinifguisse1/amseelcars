import type { MetadataRoute } from 'next'
import { getAllArticles } from '@/data/blog'
 
export default function sitemap(): MetadataRoute.Sitemap {
  // Get all blog articles
  const articles = getAllArticles()
  
  // Generate sitemap entries for blog articles
  const blogArticleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `https://amseelcars.com/blog/${article.slug}`,
    lastModified: new Date(article.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: 'https://amseelcars.com',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: 'https://amseelcars.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://amseelcars.com/cars',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: 'https://amseelcars.com/contact',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: 'https://amseelcars.com/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    ...blogArticleEntries,
  ]
}