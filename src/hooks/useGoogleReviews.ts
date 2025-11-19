import { useEffect, useState } from 'react';
import { Review } from '@/components/Reviews/Reviews';

interface GoogleReviewsResponse {
  reviews: Review[];
  aggregateRating: number;
  totalReviews: number;
  error?: string;
}

export function useGoogleReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aggregateRating, setAggregateRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

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
        
        if (data.error) {
          console.warn('Reviews API returned error:', data.error);
          // Don't set error state, just use empty reviews for fallback
          setReviews([]);
          setAggregateRating(0);
          setTotalReviews(0);
        } else {
          setReviews(data.reviews || []);
          setAggregateRating(data.aggregateRating || 0);
          setTotalReviews(data.totalReviews || 0);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        // Don't set error state for graceful fallback
        setReviews([]);
        setAggregateRating(0);
        setTotalReviews(0);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  return { reviews, loading, error, aggregateRating, totalReviews };
}

