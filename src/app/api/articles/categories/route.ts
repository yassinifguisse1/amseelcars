import { NextResponse } from 'next/server';
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

// GET /api/articles/categories - Get all categories
export async function GET() {
  try {
    const articles = await prisma.blogArticle.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    
    const categories = articles.map(a => a.category);
    return createNoCacheResponse(categories);
  } catch (error: unknown) {
    console.error('Error fetching categories:', error);
    return createNoCacheResponse(
      { error: 'Failed to fetch categories', message: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
}

