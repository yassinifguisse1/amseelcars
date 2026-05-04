import { BlogArticle } from '@/data/blog';
import type { ArticleLocale } from '@/lib/validations/article';

// Helper to create a suspense-compatible hook
// This throws a promise when loading, which Suspense can catch
function useSuspenseSWR<T>(url: string | null, fetcher: (url: string) => Promise<T>): T {
  if (!url) {
    throw new Promise(() => {}); // Never resolves
  }

  // For now, we'll use a simple fetch with promise throwing
  // In a real implementation, you'd integrate with SWR's suspense mode
  const promise = fetcher(url);
  
  // This is a simplified version - in production, use SWR's suspense mode
  throw promise; // Suspense will catch this
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch');
  }
  return res.json();
};

// Suspense-compatible hooks
export function useArticlesWithSuspense(category?: string, locale: ArticleLocale = "fr"): BlogArticle[] {
  const params = new URLSearchParams({ locale });
  if (category) {
    params.set('category', category);
  }
  const url = `/api/articles?${params.toString()}`;
  return useSuspenseSWR<BlogArticle[]>(url, fetcher);
}

export function useFeaturedArticlesWithSuspense(locale: ArticleLocale = "fr"): BlogArticle[] {
  const params = new URLSearchParams({ featured: "true", locale });
  return useSuspenseSWR<BlogArticle[]>(`/api/articles?${params.toString()}`, fetcher);
}

export function useCategoriesWithSuspense(locale: ArticleLocale = "fr"): string[] {
  const params = new URLSearchParams({ locale });
  return useSuspenseSWR<string[]>(`/api/articles/categories?${params.toString()}`, fetcher);
}

export function useRelatedArticlesWithSuspense(
  slug: string,
  limit: number = 3,
  locale: ArticleLocale = "fr",
): BlogArticle[] {
  const params = new URLSearchParams({ slug, limit: String(limit), locale });
  const url = `/api/articles/related?${params.toString()}`;
  return useSuspenseSWR<BlogArticle[]>(url, fetcher);
}
