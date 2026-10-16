import { useEffect, useState } from 'react';
import { Review } from '@/components/Reviews/Reviews';
import {
  BUSINESS_GOOGLE_RATING,
  BUSINESS_GOOGLE_REVIEW_COUNT,
} from '@/lib/business';

interface GoogleReviewsResponse {
  reviews: Review[];
  aggregateRating: number;
  totalReviews: number;
  source?: 'live' | 'fallback';
  error?: string;
}

export function useGoogleReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aggregateRating, setAggregateRating] = useState(BUSINESS_GOOGLE_RATING);
  const [totalReviews, setTotalReviews] = useState(BUSINESS_GOOGLE_REVIEW_COUNT);
  const [source, setSource] = useState<'live' | 'fallback'>('fallback');

  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/reviews');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: GoogleReviewsResponse = await response.json();
        const rating =
          Number(data.aggregateRating) > 0 ? Number(data.aggregateRating) : BUSINESS_GOOGLE_RATING;
        const count =
          Number(data.totalReviews) > 0
            ? Math.round(Number(data.totalReviews))
            : BUSINESS_GOOGLE_REVIEW_COUNT;

        setReviews(data.reviews || []);
        setAggregateRating(rating);
        setTotalReviews(count);
        setSource(data.source === 'live' && !data.error ? 'live' : 'fallback');
        if (data.error) {
          console.warn('Reviews API returned error:', data.error);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setReviews([]);
        setAggregateRating(BUSINESS_GOOGLE_RATING);
        setTotalReviews(BUSINESS_GOOGLE_REVIEW_COUNT);
        setSource('fallback');
        setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  return { reviews, loading, error, aggregateRating, totalReviews, source };
}
