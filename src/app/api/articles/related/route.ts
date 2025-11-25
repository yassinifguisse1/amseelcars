import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering - prevent Next.js from caching this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Helper function to create response with no-cache headers
function createNoCacheResponse(data: unknown, status: number = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Content-Type-Options': 'nosniff',
      // Vercel-specific headers
      'CDN-Cache-Control': 'no-store',
      'Vercel-CDN-Cache-Control': 'no-store',
      'Surrogate-Control': 'no-store',
    },
  });
}

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
      return createNoCacheResponse(
        { error: 'Slug parameter is required' },
        400
      );
    }

    // Get current article
    const currentArticle = await prisma.blogArticle.findUnique({
      where: { slug },
    });

    if (!currentArticle) {
      return createNoCacheResponse([]);
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

    return createNoCacheResponse(articles.map(transformArticle));
  } catch (error: unknown) {
    console.error('Error fetching related articles:', error);
    return createNoCacheResponse(
      { error: 'Failed to fetch related articles', message: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
}

