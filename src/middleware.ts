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
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};