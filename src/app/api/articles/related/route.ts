import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
}) {
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
    author: article.author,
    seo: article.seo,
  };
}

// GET /api/articles/related?slug=xxx&limit=3 - Get related articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const limit = parseInt(searchParams.get('limit') || '3');

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    // Get current article
    const currentArticle = await prisma.blogArticle.findUnique({
      where: { slug },
    });

    if (!currentArticle) {
      return NextResponse.json([]);
    }

    // Get related articles
    const articles = await prisma.blogArticle.findMany({
      where: {
        slug: { not: slug },
        OR: [
          { category: currentArticle.category },
          { tags: { hasSome: currentArticle.tags as string[] } },
        ],
      },
      take: limit,
      orderBy: { publishedAt: 'desc' },
    });

    return NextResponse.json(articles.map(transformArticle));
  } catch (error: unknown) {
    console.error('Error fetching related articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related articles', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

