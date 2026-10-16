import {
  BUSINESS_GOOGLE_PLACE_ID,
  BUSINESS_GOOGLE_RATING,
  BUSINESS_GOOGLE_REVIEW_COUNT,
} from '@/lib/business';

export type GooglePlaceRatingSummary = {
  rating: number;
  reviewCount: number;
  source: 'live' | 'fallback';
};

type PlaceDetailsResult = {
  status?: string;
  error_message?: string;
  result?: {
    rating?: number;
    user_ratings_total?: number;
    name?: string;
    reviews?: unknown[];
  };
};

const PLACE_FIELDS = 'reviews,rating,user_ratings_total,name';

function fallbackSummary(): GooglePlaceRatingSummary {
  return {
    rating: BUSINESS_GOOGLE_RATING,
    reviewCount: BUSINESS_GOOGLE_REVIEW_COUNT,
    source: 'fallback',
  };
}

/**
 * Live Google Maps / GBP rating panel via Places Details.
 * Cached for 1 hour. Falls back to BUSINESS_GOOGLE_* constants.
 */
export async function fetchGooglePlaceDetails(): Promise<PlaceDetailsResult | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (!apiKey) return null;

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.set('place_id', BUSINESS_GOOGLE_PLACE_ID);
  url.searchParams.set('fields', PLACE_FIELDS);
  url.searchParams.set('key', apiKey);

  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });
  if (!response.ok) {
    throw new Error(`Places HTTP ${response.status}`);
  }
  return (await response.json()) as PlaceDetailsResult;
}

export async function getGooglePlaceRatingSummary(): Promise<GooglePlaceRatingSummary> {
  try {
    const data = await fetchGooglePlaceDetails();
    if (!data || data.status !== 'OK') {
      if (data?.status) {
        console.warn('[googlePlaceRating]', data.status, data.error_message);
      }
      return fallbackSummary();
    }

    const rating = Number(data.result?.rating);
    const reviewCount = Number(data.result?.user_ratings_total);
    if (!Number.isFinite(rating) || rating <= 0 || !Number.isFinite(reviewCount) || reviewCount <= 0) {
      return fallbackSummary();
    }

    return {
      rating,
      reviewCount: Math.round(reviewCount),
      source: 'live',
    };
  } catch (error) {
    console.warn(
      '[googlePlaceRating] Falling back to BUSINESS_GOOGLE_* constants:',
      error instanceof Error ? error.message : error,
    );
    return fallbackSummary();
  }
}
