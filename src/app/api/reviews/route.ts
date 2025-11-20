import { NextResponse } from 'next/server';

// Your Google Business Place ID
const PLACE_ID = 'ChIJ6UYIlG63sw0Rkl2swhA3p08';

export async function GET() {
  try {
    // Use server-side API key (not NEXT_PUBLIC_)
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('GOOGLE_MAPS_API_KEY not configured, returning empty reviews');
      return NextResponse.json(
        { 
          reviews: [],
          aggregateRating: 0,
          totalReviews: 0,
          error: 'API key not configured'
        },
        { status: 200 } // Return 200 with empty data instead of error
      );
    }

    // Call Google Places API Details endpoint
    // Using fields parameter to only get what we need (saves quota)
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews,rating,user_ratings_total,name&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Google Places API error:', data.status, data.error_message);
      return NextResponse.json(
        { 
          reviews: [],
          aggregateRating: 0,
          totalReviews: 0,
          error: `Google API error: ${data.status}`
        },
        { status: 200 } // Return 200 with empty data for graceful fallback
      );
    }

    // Transform Google reviews to your Review format
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
        ? new Date(review.time * 1000).toISOString().split('T')[0] // Convert timestamp to YYYY-MM-DD
        : new Date().toISOString().split('T')[0],
      publisher: {
        name: 'Google Reviews',
        url: 'https://www.google.com/maps/place/Amseel+cars',
      },
    }));


    // Return with cache headers (cache for 1 hour, stale-while-revalidate for 24h)
    return NextResponse.json(
      { 
        reviews,
        aggregateRating: data.result?.rating || 0,
        totalReviews: data.result?.user_ratings_total || reviews.length,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );

  } catch (error) {
    console.error('Reviews API error:', error);
    return NextResponse.json(
      { 
        reviews: [],
        aggregateRating: 0,
        totalReviews: 0,
        error: 'Failed to fetch reviews'
      },
      { status: 200 } // Return 200 for graceful fallback
    );
  }
}

