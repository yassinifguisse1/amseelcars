import type { MetadataRoute } from 'next'
import { getAllArticles, getAllCategories, categoryToSlug } from '@/data/blog'
 
export default function sitemap(): MetadataRoute.Sitemap {
  // Get all blog articles and categories
  const articles = getAllArticles()
  const categories = getAllCategories()
  
  // Generate sitemap entries for category pages
  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `https://amseelcars.com/blog/${categoryToSlug(category)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))
  
  // Generate sitemap entries for blog articles with categories
  const blogArticleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `https://amseelcars.com/blog/${categoryToSlug(article.category)}/${article.slug}`,
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
    ...categoryEntries,
    ...blogArticleEntries,
  ]
}