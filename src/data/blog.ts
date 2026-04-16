import { prisma } from '@/lib/prisma';

export interface BlogArticle {
  id: string; // Changed from number to string (MongoDB ObjectId)
  slug: string;
  locale: "fr" | "en";
  translationGroup?: string;
  title: string;
  content: string;
  category: string;
  readTime: string;
  date: string;
  publishedAt: string;
  image: string;
  altText: string;
  caption: string;
  description: string;
  featured: boolean;
  indexable?: boolean;
  tags: string[];
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    canonical: string;
  };
}

// Transform Prisma article to BlogArticle format
function transformArticle(article: {
  id: string;
  slug: string;
  locale: string;
  translationGroup: string | null;
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
    // Prisma stores `locale` as a plain string, coerce to our app union.
    locale: article.locale === "en" ? "en" : "fr",
    translationGroup: article.translationGroup ?? undefined,
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

// Utility functions - now async and fetch from database
export async function getArticleBySlug(slug: string): Promise<BlogArticle | undefined> {
  try {
    const locale: BlogArticle["locale"] = "fr";
    const article = await prisma.blogArticle.findFirst({
      where: { slug, locale },
    });
    return article ? transformArticle(article) : undefined;
  } catch (error) {
    console.error('Error fetching article by slug:', error);
    return undefined;
  }
}

export async function getArticleByCategoryAndSlug(
  categorySlug: string,
  slug: string,
  locale: BlogArticle["locale"] = "fr"
): Promise<BlogArticle | undefined> {
  try {
    const category = await getCategoryFromSlug(categorySlug);
    if (!category) return undefined;
    
    const article = await prisma.blogArticle.findFirst({
      where: {
        slug,
        category,
        locale,
      },
    });
    return article ? transformArticle(article) : undefined;
  } catch (error) {
    console.error('Error fetching article by category and slug:', error);
    return undefined;
  }
}

export async function getArticleByTranslationGroup(
  translationGroup: string,
  locale: BlogArticle["locale"],
): Promise<BlogArticle | undefined> {
  try {
    const article = await prisma.blogArticle.findFirst({
      where: {
        translationGroup,
        locale,
      },
    });
    return article ? transformArticle(article) : undefined;
  } catch (error) {
    console.error("Error fetching article by translation group:", error);
    return undefined;
  }
}

export async function getAllArticles(locale?: BlogArticle["locale"]): Promise<BlogArticle[]> {
  try {
    const articles = await prisma.blogArticle.findMany({
      ...(locale ? { where: { locale } } : {}),
      orderBy: { publishedAt: 'desc' },
    });
    return articles.map(transformArticle);
  } catch (error) {
    console.error('Error fetching all articles:', error);
    return [];
  }
}

export async function getFeaturedArticles(locale?: BlogArticle["locale"]): Promise<BlogArticle[]> {
  try {
    const articles = await prisma.blogArticle.findMany({
      where: { featured: true, ...(locale ? { locale } : {}) },
      orderBy: { publishedAt: 'desc' },
    });
    return articles.map(transformArticle);
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    return [];
  }
}

export async function getArticlesByCategory(category: string, locale?: BlogArticle["locale"]): Promise<BlogArticle[]> {
  try {
    const articles = await prisma.blogArticle.findMany({
      where: { category, ...(locale ? { locale } : {}) },
      orderBy: { publishedAt: 'desc' },
    });
    return articles.map(transformArticle);
  } catch (error) {
    console.error('Error fetching articles by category:', error);
    return [];
  }
}

export async function getRelatedArticles(
  currentSlug: string,
  limit: number = 3,
  locale: BlogArticle["locale"] = "fr"
): Promise<BlogArticle[]> {
  try {
    const currentArticle = await prisma.blogArticle.findFirst({
      where: { slug: currentSlug, locale },
    });
    if (!currentArticle) return [];

    const articles = await prisma.blogArticle.findMany({
      where: {
        slug: { not: currentSlug },
        locale,
        OR: [
          { category: currentArticle.category },
          { tags: { hasSome: currentArticle.tags as string[] } },
        ],
      },
      take: limit,
      orderBy: { publishedAt: 'desc' },
    });
    
    return articles.map(transformArticle);
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return [];
  }
}

// Category slug conversion utilities (keep these synchronous)
export function categoryToSlug(category: string): string {
  return category
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

export async function getCategoryFromSlug(categorySlug: string): Promise<string | undefined> {
  try {
    const allCategories = await getAllCategories();
    return allCategories.find(cat => categoryToSlug(cat) === categorySlug);
  } catch (error) {
    console.error('Error getting category from slug:', error);
    return undefined;
  }
}

export async function getAllCategories(): Promise<string[]> {
  try {
    const articles = await prisma.blogArticle.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    return articles.map(a => a.category);
  } catch (error) {
    console.error('Error fetching all categories:', error);
    return [];
  }
}

// Keep the old blogArticles array for backward compatibility during migration
// This will be removed after migration is complete
export const blogArticles: BlogArticle[] = [];
