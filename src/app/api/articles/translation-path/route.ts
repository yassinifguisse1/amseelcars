import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { categoryToSlug, getArticleByCategoryAndSlug } from '@/data/blog';
import { isArticleLocale } from '@/lib/validations/article';
import { blogArticlePath } from '@/lib/seo/blog-paths';
import type { AppLocale } from '@/i18n/routing';

const PUBLIC_ARTICLE_FILTER = { published: { not: false } } as const;

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function createNoCacheResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
      Pragma: 'no-cache',
      Expires: '0',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug')?.trim();
    const categorySlug = searchParams.get('category')?.trim();
    const sourceLocaleParam = searchParams.get('sourceLocale') ?? undefined;
    const targetLocaleParam = searchParams.get('targetLocale') ?? undefined;

    if (
      !slug ||
      !categorySlug ||
      !isArticleLocale(sourceLocaleParam) ||
      !isArticleLocale(targetLocaleParam)
    ) {
      return createNoCacheResponse(
        { error: 'Valid category, slug, sourceLocale, and targetLocale are required.' },
        400,
      );
    }

    const sourceArticle = await getArticleByCategoryAndSlug(
      categorySlug,
      slug,
      sourceLocaleParam,
    );
    if (!sourceArticle?.translationGroup) {
      return createNoCacheResponse({ error: 'Source article translation group not found.' }, 404);
    }

    const translatedArticle = await prisma.blogArticle.findFirst({
      where: {
        translationGroup: sourceArticle.translationGroup,
        locale: targetLocaleParam,
        ...PUBLIC_ARTICLE_FILTER,
      },
      select: {
        slug: true,
        category: true,
      },
    });
    if (!translatedArticle) {
      return createNoCacheResponse({ error: 'Published translation not found.' }, 404);
    }

    return createNoCacheResponse({
      path: blogArticlePath(
        categoryToSlug(translatedArticle.category),
        translatedArticle.slug,
        targetLocaleParam as AppLocale,
      ),
    });
  } catch (error: unknown) {
    console.error('Error resolving translated article path:', error);
    return createNoCacheResponse(
      { error: 'Failed to resolve translated article path.' },
      500,
    );
  }
}
