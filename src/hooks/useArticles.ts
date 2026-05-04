import useSWR from 'swr';
import { BlogArticle } from '@/data/blog';
import type { ArticleLocale } from '@/lib/validations/article';

// Fetcher with cache-busting headers for production
const fetcher = (url: string) => fetch(url, {
  cache: 'no-store',
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  },
}).then((res) => {
  if (!res.ok) {
    throw new Error('Failed to fetch');
  }
  return res.json();
});

// Hook to fetch all articles
export function useArticles(category?: string, locale: ArticleLocale = "fr") {
  const params = new URLSearchParams({ locale });
  if (category) {
    params.set('category', category);
  }
  const url = `/api/articles?${params.toString()}`;
  
  const { data, error, isLoading, mutate } = useSWR<BlogArticle[]>(url, fetcher, {
    revalidateOnFocus: true, // Revalidate when window gets focus
    revalidateOnReconnect: true,
    dedupingInterval: 0, // No caching - always fetch fresh data
    refreshInterval: 0, // No auto-refresh
    keepPreviousData: false, // Don't keep old data while fetching
  });

  return {
    articles: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

// Hook to fetch featured articles
export function useFeaturedArticles(locale: ArticleLocale = "fr") {
  const params = new URLSearchParams({ featured: "true", locale });
  const { data, error, isLoading, mutate } = useSWR<BlogArticle[]>(
    `/api/articles?${params.toString()}`,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 0, // No caching
      refreshInterval: 0,
      keepPreviousData: false,
    }
  );

  return {
    articles: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

// Hook to fetch single article by slug
export function useArticle(slug: string | null, locale: ArticleLocale = "fr") {
  const params = slug
    ? new URLSearchParams({ slug, locale })
    : null;
  const { data, error, isLoading, mutate } = useSWR<BlogArticle>(
    params ? `/api/articles?${params.toString()}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 0, // No caching
      refreshInterval: 0,
      keepPreviousData: false,
    }
  );

  return {
    article: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// Hook to fetch related articles
export function useRelatedArticles(
  slug: string | null,
  limit: number = 3,
  locale: BlogArticle["locale"] = "fr",
) {
  const { data, error, isLoading, mutate } = useSWR<BlogArticle[]>(
    slug
      ? `/api/articles/related?slug=${encodeURIComponent(slug)}&limit=${limit}&locale=${encodeURIComponent(locale)}`
      : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 0, // No caching
      refreshInterval: 0,
      keepPreviousData: false,
    }
  );

  return {
    articles: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

// Hook to fetch all categories
export function useCategories(locale: ArticleLocale = "fr") {
  const params = new URLSearchParams({ locale });
  const { data, error, isLoading, mutate } = useSWR<string[]>(
    `/api/articles/categories?${params.toString()}`,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 0, // No caching
      refreshInterval: 0,
      keepPreviousData: false,
    }
  );

  return {
    categories: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
