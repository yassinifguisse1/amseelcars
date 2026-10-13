import { NextRequest, NextResponse } from 'next/server';
import { categoryToSlug } from '@/data/blog';
import { prisma } from '@/lib/prisma';
import { isArticleLocale } from '@/lib/validations/article';

/** SEO Nexus / Payload-compatible categories list for blog sync. */
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

type CategoryDoc = {
  id: string;
  title: string;
  slug: string;
};

function createNoCacheResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
      'X-Content-Type-Options': 'nosniff',
      'CDN-Cache-Control': 'no-store',
      'Vercel-CDN-Cache-Control': 'no-store',
    },
  });
}

function parsePositiveInt(value: string | null, fallback: number, max: number) {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

function sortDocs(docs: CategoryDoc[], sortParam: string) {
  const descending = sortParam.startsWith('-');
  const field = (descending ? sortParam.slice(1) : sortParam) || 'title';
  const key: keyof CategoryDoc =
    field === 'slug' || field === 'id' ? field : 'title';

  return [...docs].sort((a, b) => {
    const cmp = a[key].localeCompare(b[key], undefined, { sensitivity: 'base' });
    return descending ? -cmp : cmp;
  });
}

/**
 * GET /api/categories?limit=100&page=1&sort=title
 * Optional: locale=fr|en|es|de|pl
 *
 * Payload-style JSON for SEO Nexus category sync.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parsePositiveInt(searchParams.get('limit'), 100, 500);
    const page = parsePositiveInt(searchParams.get('page'), 1, 10_000);
    const sort = searchParams.get('sort')?.trim() || 'title';
    const localeParam = searchParams.get('locale') ?? undefined;
    const locale = isArticleLocale(localeParam) ? localeParam : undefined;

    const rows = await prisma.blogArticle.findMany({
      select: { category: true },
      where: locale ? { locale } : undefined,
      distinct: ['category'],
    });

    const seen = new Set<string>();
    const docs: CategoryDoc[] = [];

    for (const row of rows) {
      const title = row.category?.trim();
      if (!title) continue;
      const slug = categoryToSlug(title);
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      docs.push({ id: slug, title, slug });
    }

    const sorted = sortDocs(docs, sort);
    const totalDocs = sorted.length;
    const totalPages = Math.max(Math.ceil(totalDocs / limit), 1);
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    const pageDocs = sorted.slice(start, start + limit);
    const hasNextPage = safePage < totalPages;
    const hasPrevPage = safePage > 1;

    return createNoCacheResponse({
      docs: pageDocs,
      totalDocs,
      limit,
      totalPages,
      page: safePage,
      pagingCounter: totalDocs === 0 ? 0 : start + 1,
      hasPrevPage,
      hasNextPage,
      prevPage: hasPrevPage ? safePage - 1 : null,
      nextPage: hasNextPage ? safePage + 1 : null,
    });
  } catch (error: unknown) {
    console.error('Error fetching /api/categories:', error);
    return createNoCacheResponse(
      {
        error: 'Failed to fetch categories',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  }
}
