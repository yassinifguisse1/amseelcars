import { prisma } from '../../lib/prisma';
import { BlogArticle } from '@/data/blog';

// Transform Prisma article to BlogArticle format
function transformArticle(article: {
  id: string;
  slug: string;
  title: string;
  content: string;
  category: string;
  readTime: string;
  date: string;
  publishedAt: Date;
  image: string;
  altText: string;
  caption: string;
  description: string;
  featured: boolean;
  indexable: boolean | null;
  tags: string[];
  author: unknown;
  seo: unknown;
}): BlogArticle {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    content: article.content,
    category: article.category,
    readTime: article.readTime,
    date: article.date,
    publishedAt: article.publishedAt.toISOString(),
    image: article.image,
    altText: article.altText,
    caption: article.caption,
    description: article.description,
    featured: article.featured,
    indexable: article.indexable ?? true,
    tags: article.tags,
    author: article.author as BlogArticle['author'],
    seo: article.seo as BlogArticle['seo'],
  };
}

export async function getArticles(): Promise<BlogArticle[]> {
  const articles = await prisma.blogArticle.findMany({
    orderBy: { publishedAt: 'desc' },
  });
  return articles.map(transformArticle);
}