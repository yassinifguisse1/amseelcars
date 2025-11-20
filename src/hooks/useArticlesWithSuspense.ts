import { BlogArticle } from '@/data/blog';

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
export function useArticlesWithSuspense(category?: string): BlogArticle[] {
  const url = category 
    ? `/api/articles?category=${encodeURIComponent(category)}`
    : '/api/articles';
  return useSuspenseSWR<BlogArticle[]>(url, fetcher);
}

export function useFeaturedArticlesWithSuspense(): BlogArticle[] {
  return useSuspenseSWR<BlogArticle[]>('/api/articles?featured=true', fetcher);
}

export function useCategoriesWithSuspense(): string[] {
  return useSuspenseSWR<string[]>('/api/articles/categories', fetcher);
}

export function useRelatedArticlesWithSuspense(slug: string, limit: number = 3): BlogArticle[] {
  const url = `/api/articles/related?slug=${encodeURIComponent(slug)}&limit=${limit}`;
  return useSuspenseSWR<BlogArticle[]>(url, fetcher);
}

