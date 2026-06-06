import { prisma } from '../../lib/prisma';
import { BlogArticle, publicArticlesWhere } from '@/data/blog';
import { isArticleLocale } from '@/lib/validations/article';

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
    indexable: article.indexable ?? true,
    tags: article.tags,
    author: article.author as BlogArticle['author'],
    seo: article.seo as BlogArticle['seo'],
  };
}

export async function getArticles(locale: BlogArticle["locale"] = "fr"): Promise<BlogArticle[]> {
  const articles = await prisma.blogArticle.findMany({
    where: publicArticlesWhere(locale),
    orderBy: { publishedAt: 'desc' },
  });
  return articles.map(transformArticle);
}
