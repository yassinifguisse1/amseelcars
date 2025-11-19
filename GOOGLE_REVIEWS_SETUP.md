# Google Reviews API Setup Guide

This guide explains how the Google Reviews integration works and how to configure it.

## Overview

The application fetches reviews from Google Places API and displays them on the homepage. It uses a hybrid approach:
- **Display**: Fetches latest reviews from Google Places API
- **SEO Structured Data**: Uses manual reviews (always available, better for SEO)

## Setup Instructions

### 1. Get Your Place ID

Your Place ID is already configured: `ChIJ6UYIlG63sw0Rkl2swhA3p08`

To verify or get a new one:
1. Go to [Google Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)
2. Search for your business
3. Copy the Place ID

### 2. Set Up Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or use existing)
3. Enable **Places API (New)**
   - Go to "APIs & Services" → "Library"
   - Search for "Places API (New)"
   - Click "Enable"
4. Create an API Key
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key

### 3. Configure API Key Restrictions (Important!)

**Restrict your API key for security:**

1. Click on your API key to edit it
2. Under "API restrictions":
   - Select "Restrict key"
   - Choose "Places API (New)" only
3. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add your domains:
     - `localhost:3000/*` (for development)
     - `www.amseelcars.com/*` (for production)
     - `amseelcars.com/*` (for production)

### 4. Add Environment Variable

Add to your `.env.local` file:

```bash
# Server-side only (for API routes) - DO NOT expose to frontend
GOOGLE_MAPS_API_KEY=your_api_key_here

# Frontend maps (if needed for other components)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Important**: 
- `GOOGLE_MAPS_API_KEY` is server-side only (used in `/api/reviews`)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is for frontend components (if needed)

### 5. Restart Development Server

After adding the environment variable:

```bash
npm run dev
```

## How It Works

### API Route (`/api/reviews`)

- Located at: `src/app/api/reviews/route.ts`
- Fetches reviews from Google Places API
- Transforms Google review format to your Review interface
- Caches responses for 1 hour (reduces API calls)
- Returns empty array if API fails (graceful fallback)

### Hook (`useGoogleReviews`)

- Located at: `src/hooks/useGoogleReviews.ts`
- Fetches reviews from `/api/reviews` endpoint
- Handles loading and error states
- Returns reviews, aggregateRating, and totalReviews

### Reviews Component

- Located at: `src/components/Reviews/Reviews.tsx`
- Supports both API and manual reviews
- Props:
  - `reviews?`: Manual reviews (fallback)
  - `useApi?`: Toggle API fetching (default: `true`)
- Automatically falls back to manual reviews if API fails

### SEO Structured Data

- Located at: `src/app/page.tsx`
- Uses manual reviews for structured data (always available)
- Ensures Google always has review data for SEO
- Individual Review schemas + AggregateRating

## Usage Examples

### Use API Reviews (Default)

```tsx
<Reviews useApi={true} />
```

### Use Manual Reviews Only

```tsx
<Reviews reviews={manualReviews} useApi={false} />
```

### Use API with Manual Fallback

```tsx
<Reviews reviews={manualReviews} useApi={true} />
```

## Testing

1. **Test API Route**: 
   - Visit: `http://localhost:3000/api/reviews`
   - Should return JSON with reviews array

2. **Test Component**:
   - Check browser console for any errors
   - Verify reviews appear on homepage
   - Check Network tab for `/api/reviews` request

3. **Test Fallback**:
   - Remove `GOOGLE_MAPS_API_KEY` from `.env.local`
   - Restart server
   - Component should fallback to manual reviews

## API Quotas & Limits

- **Free Tier**: 1,000 requests/day
- **Caching**: Responses cached for 1 hour
- **Stale-While-Revalidate**: 24 hours

The caching strategy reduces API calls significantly.

## Troubleshooting

### No Reviews Showing

1. Check API key is set in `.env.local`
2. Verify API key restrictions allow your domain
3. Check browser console for errors
4. Test `/api/reviews` endpoint directly

### API Errors

1. Verify Places API is enabled in Google Cloud Console
2. Check API key restrictions
3. Verify Place ID is correct
4. Check Google Cloud Console for quota/errors

### Reviews Not Updating

- Reviews are cached for 1 hour
- Wait 1 hour or clear cache
- Check Google Maps for new reviews

## Security Notes

- ✅ API key is server-side only (`GOOGLE_MAPS_API_KEY`)
- ✅ API key is restricted to specific domains
- ✅ API key is restricted to Places API only
- ✅ No API key exposed in frontend code

## Cost Considerations

- Free tier: 1,000 requests/day
- Caching reduces actual API calls
- Each page load = 1 API call (cached for 1 hour)
- Estimated: ~24 requests/day (1 per hour)

## Support

For issues:
1. Check Google Cloud Console for API errors
2. Verify Place ID is correct
3. Check API key restrictions
4. Review browser console for errors

