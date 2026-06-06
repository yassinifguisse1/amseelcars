import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { articleLocales, isArticleLocale, type ArticleLocale } from '@/lib/validations/article';

/** Draft translations stay hidden on non-FR locales. */
export const PUBLIC_ARTICLE_FILTER = { published: { not: false } };

/** FR blog is canonical: all French originals are public (no translation/publish gate). */
const FRENCH_LOCALE: Prisma.BlogArticleWhereInput = { locale: 'fr' };

/** FR blog is canonical: show all French originals without requiring translations. */
export function publicArticlesWhere(locale: ArticleLocale = 'fr'): Prisma.BlogArticleWhereInput {
  if (locale === 'fr') {
    return FRENCH_LOCALE;
  }
  return {
    locale,
    ...PUBLIC_ARTICLE_FILTER,
  };
}

/** All locales visible on the public site (FR originals + published translations). */
export function allPublicArticlesWhere(): Prisma.BlogArticleWhereInput {
  return {
    OR: [
      FRENCH_LOCALE,
      ...articleLocales
        .filter((loc) => loc !== 'fr')
        .map((loc) => ({
          locale: loc,
          ...PUBLIC_ARTICLE_FILTER,
        })),
    ],
  };
}

export interface BlogArticle {
  id: string; // Changed from number to string (MongoDB ObjectId)
  slug: string;
  locale: ArticleLocale;
  translationGroup?: string;
  title: string;
  content: string;
  category: string;
  readTime: string;
  date: string;
  publishedAt: string;
  image: string;
  imageMetaTitle: string;
  altText: string;
  caption: string;
  imageDescription: string;
  description: string;
  featured: boolean;
  published?: boolean;
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
  imageMetaTitle: string | null;
  altText: string;
  caption: string;
  imageDescription: string | null;
  description: string;
  featured: boolean;
  published: boolean | null;
  indexable: boolean | null;
  tags: string[];
  author: unknown;
  seo: unknown;
}): BlogArticle {
  return {
    id: article.id,
    slug: article.slug,
    locale: isArticleLocale(article.locale) ? article.locale : "fr",
    translationGroup: article.translationGroup ?? undefined,
    title: article.title,
    content: article.content,
    category: article.category,
    readTime: article.readTime,
    date: article.date,
    publishedAt: article.publishedAt.toISOString(),
    image: article.image,
    imageMetaTitle: article.imageMetaTitle ?? '',
    altText: article.altText,
    caption: article.caption,
    imageDescription: article.imageDescription ?? '',
    description: article.description,
    featured: article.featured,
    published: article.published ?? true,
    indexable: article.indexable ?? true,
    tags: article.tags,
    author: article.author as BlogArticle['author'],
    seo: article.seo as BlogArticle['seo'],
  };
}

// Utility functions - now async and fetch from database
export async function getArticleBySlug(
  slug: string,
  locale: BlogArticle["locale"] = "fr",
): Promise<BlogArticle | undefined> {
  try {
    const article = await prisma.blogArticle.findFirst({
      where: { slug, ...publicArticlesWhere(locale) },
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
    const category = await getCategoryFromSlug(categorySlug, locale);
    if (category) {
      const article = await prisma.blogArticle.findFirst({
        where: {
          slug,
          category,
          ...publicArticlesWhere(locale),
        },
      });
      if (article) return transformArticle(article);
    }

    // Fallback: slug-only lookup (legacy URLs or category slug mismatch).
    const bySlug = await prisma.blogArticle.findFirst({
      where: { slug, ...publicArticlesWhere(locale) },
    });
    return bySlug ? transformArticle(bySlug) : undefined;
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
        ...publicArticlesWhere(locale),
      },
    });
    return article ? transformArticle(article) : undefined;
  } catch (error) {
    console.error("Error fetching article by translation group:", error);
    return undefined;
  }
}

export async function getArticlesByTranslationGroup(
  translationGroup: string,
): Promise<BlogArticle[]> {
  try {
    const articles = await prisma.blogArticle.findMany({
      where: {
        AND: [{ translationGroup }, allPublicArticlesWhere()],
      },
    });
    return articles.map(transformArticle);
  } catch (error) {
    console.error("Error fetching articles by translation group:", error);
    return [];
  }
}

export async function getAllArticles(locale?: BlogArticle["locale"]): Promise<BlogArticle[]> {
  try {
    const articles = await prisma.blogArticle.findMany({
      where: locale ? publicArticlesWhere(locale) : allPublicArticlesWhere(),
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
      where: {
        featured: true,
        ...(locale ? publicArticlesWhere(locale) : allPublicArticlesWhere()),
      },
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
      where: {
        category,
        ...(locale ? publicArticlesWhere(locale) : allPublicArticlesWhere()),
      },
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
      where: { slug: currentSlug, ...publicArticlesWhere(locale) },
    });
    if (!currentArticle) return [];

    const articles = await prisma.blogArticle.findMany({
      where: {
        slug: { not: currentSlug },
        ...publicArticlesWhere(locale),
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

export async function getCategoryFromSlug(
  categorySlug: string,
  locale?: BlogArticle["locale"],
): Promise<string | undefined> {
  try {
    const allCategories = await getAllCategories(locale);
    return allCategories.find(cat => categoryToSlug(cat) === categorySlug);
  } catch (error) {
    console.error('Error getting category from slug:', error);
    return undefined;
  }
}

export async function getAllCategories(locale?: BlogArticle["locale"]): Promise<string[]> {
  try {
    const articles = await prisma.blogArticle.findMany({
      select: { category: true },
      where: locale ? publicArticlesWhere(locale) : allPublicArticlesWhere(),
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
