import { NextResponse } from 'next/server';
import {
  BUSINESS_GOOGLE_MAPS_PLACE_URL,
  BUSINESS_GOOGLE_RATING,
  BUSINESS_GOOGLE_REVIEW_COUNT,
} from '@/lib/business';
import { fetchGooglePlaceDetails, getGooglePlaceRatingSummary } from '@/lib/googlePlaceRating';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const summary = await getGooglePlaceRatingSummary();
    const data = await fetchGooglePlaceDetails();

    if (!data || data.status !== 'OK') {
      return NextResponse.json(
        {
          reviews: [],
          aggregateRating: summary.rating,
          totalReviews: summary.reviewCount,
          source: summary.source,
          error: data?.status
            ? `Google API error: ${data.status}`
            : 'API key not configured',
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        },
      );
    }

    interface GoogleReview {
      time?: number;
      author_name?: string;
      profile_photo_url?: string;
      rating?: number;
      text?: string;
    }

    const reviews = (data.result?.reviews || []).map((review: GoogleReview) => ({
      id: review.time?.toString() || `review-${Date.now()}-${Math.random()}`,
      author: {
        name: review.author_name || 'Anonymous',
        image: review.profile_photo_url || undefined,
      },
      rating: review.rating || 5,
      reviewBody: review.text || '',
      datePublished: review.time
        ? new Date(review.time * 1000).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      publisher: {
        name: 'Google Reviews',
        url: BUSINESS_GOOGLE_MAPS_PLACE_URL,
      },
    }));

    const aggregateRating =
      Number(data.result?.rating) > 0 ? Number(data.result?.rating) : BUSINESS_GOOGLE_RATING;
    const totalReviews =
      Number(data.result?.user_ratings_total) > 0
        ? Math.round(Number(data.result?.user_ratings_total))
        : BUSINESS_GOOGLE_REVIEW_COUNT;

    return NextResponse.json(
      {
        reviews,
        aggregateRating,
        totalReviews,
        source: 'live' as const,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      },
    );
  } catch (error) {
    console.error('Reviews API error:', error);
    return NextResponse.json(
      {
        reviews: [],
        aggregateRating: BUSINESS_GOOGLE_RATING,
        totalReviews: BUSINESS_GOOGLE_REVIEW_COUNT,
        source: 'fallback' as const,
        error: 'Failed to fetch reviews',
      },
      { status: 200 },
    );
  }
}
