import useSWR from 'swr';
import { BlogArticle } from '@/data/blog';

const fetcher = (url: string) => fetch(url).then((res) => {
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
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000, // Cache for 1 minute
    suspense: false, // We'll handle loading states manually for now
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
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,
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
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,
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
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,
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
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,
    }
  );

  return {
    categories: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

