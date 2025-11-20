import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/articles/categories - Get all categories
export async function GET() {
  try {
    const articles = await prisma.blogArticle.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    
    const categories = articles.map(a => a.category);
    return NextResponse.json(categories);
  } catch (error: unknown) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

