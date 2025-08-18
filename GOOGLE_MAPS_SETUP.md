# Google Maps Setup for Car Dashboard

## Dependencies Installed

The component now uses the `@react-google-maps/api` library for better React integration:

```bash
npm install @react-google-maps/api
npm install --save-dev @types/google.maps
```

## Getting Your Google Maps API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create or Select a Project**
   - Create a new project or select an existing one

3. **Enable Required APIs**
   - Go to "APIs & Services" > "Library"
   - Enable these APIs:
     - Maps JavaScript API
     - Directions API
     - Places API
     - Geometry API

4. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

5. **Secure Your API Key (Recommended)**
   - Click on your API key to edit it
   - Under "Application restrictions", select "HTTP referrers"
   - Add your domain (e.g., `localhost:3000/*` for development)
   - Under "API restrictions", select "Restrict key" and choose the APIs you enabled

6. **Add to Environment File**
   - Open `.env.local` in your project root
   - Replace `your_google_maps_api_key_here` with your actual API key

## Customizing the Business Location

In `src/components/CarDashboardMap/CarDashboardMap.tsx`, update the `businessLocation` object:

```typescript
const businessLocation: BusinessLocation = {
  lat: 40.7589, // Your business latitude
  lng: -73.9851, // Your business longitude
  name: "Your Business Name",
  address: "Your Business Address"
};
```

## Features Included

- ✅ **@react-google-maps/api Integration**: Modern React hooks and components
- ✅ **TypeScript Support**: Full type safety with Google Maps types
- ✅ **Custom Dark Theme**: Matching car dashboard aesthetic
- ✅ **GSAP Scroll Animation**: Route progressively draws on scroll
- ✅ **Business Location Marker**: Custom styled markers
- ✅ **Destination Marker**: Clear destination indication
- ✅ **Real-time Navigation Info**: Dynamic distance and ETA updates
- ✅ **Interactive Zoom Controls**: Functional +/- buttons
- ✅ **Responsive Design**: Optimized for car dashboard screen
- ✅ **Next.js Image Optimization**: Using Next.js Image component
- ✅ **Loading States**: Proper loading indicators

## Key Improvements with @react-google-maps/api

1. **Better Performance**: Optimized React components
2. **Cleaner Code**: React hooks instead of imperative API calls
3. **Type Safety**: Full TypeScript support
4. **Memory Management**: Automatic cleanup of map instances
5. **React Lifecycle**: Proper integration with React component lifecycle

## Troubleshooting

- **Map not loading**: Check your API key and ensure the required APIs are enabled
- **"For development purposes only" watermark**: Add billing to your Google Cloud project
- **CORS errors**: Make sure your domain is added to the API key restrictions
- **TypeScript errors**: Ensure `@types/google.maps` is installed
- **Component not rendering**: Check that `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set correctly