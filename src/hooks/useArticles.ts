import useSWR from 'swr';
import { BlogArticle } from '@/data/blog';

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
export function useArticles(category?: string) {
  const url = category 
    ? `/api/articles?category=${encodeURIComponent(category)}`
    : '/api/articles';
  
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
export function useFeaturedArticles() {
  const { data, error, isLoading, mutate } = useSWR<BlogArticle[]>(
    '/api/articles?featured=true',
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
export function useArticle(slug: string | null) {
  const { data, error, isLoading, mutate } = useSWR<BlogArticle>(
    slug ? `/api/articles?slug=${encodeURIComponent(slug)}` : null,
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
export function useRelatedArticles(slug: string | null, limit: number = 3) {
  const { data, error, isLoading, mutate } = useSWR<BlogArticle[]>(
    slug ? `/api/articles/related?slug=${encodeURIComponent(slug)}&limit=${limit}` : null,
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
export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR<string[]>(
    '/api/articles/categories',
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

