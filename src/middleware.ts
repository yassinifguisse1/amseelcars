import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
]);

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Allow indexing for blog/product/author images, but prevent indexing of
  // homepage animation assets (wheel/body cutouts) under /public/images/*.
  if (pathname.startsWith('/images/')) {
    const rawSegment = pathname.slice('/images/'.length);
    let filename: string;
    try {
      filename = decodeURIComponent(rawSegment).toLowerCase();
    } catch (e) {
      if (e instanceof URIError) {
        console.warn('[middleware] Malformed percent-encoding in image path:', pathname);
        filename = rawSegment.toLowerCase();
      } else {
        throw e;
      }
    }

    const isWheelAsset = filename.includes('wheel');
    const isLogoAsset = filename.includes('logo');
    const isShadowAsset = filename.includes('shadow');
    const isHomeBodyAsset =
      filename === 'touareg-body.png' ||
      filename === 'bmw-body.webp' ||
      filename === 'kia-body.webp' ||
      filename === 't-roc-body.webp' ||
      filename === 'golf8-body.webp';

    if (isWheelAsset || isHomeBodyAsset || isLogoAsset || isShadowAsset) {
      const res = NextResponse.next();
      res.headers.set('X-Robots-Tag', 'noindex');
      return res;
    }

    return NextResponse.next();
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Check admin role for admin routes
  if (isAdminRoute(req)) {
    const authObj = await auth();
    const { userId } = authObj;
    
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    // Get user's public metadata to check for admin role
    // In Clerk, we need to use currentUser() to get metadata
    // For middleware, we'll check in the API routes and page components
    // Middleware will just ensure authentication
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for local image assets (so we can send X-Robots-Tag for specific files)
    '/images/:path*',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};