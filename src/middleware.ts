import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/admin(.*)",
]);

const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/admin(.*)",
]);

function isPublicBlogPathname(pathname: string) {
  return pathname === "/blog" || pathname.startsWith("/blog/");
}

function blogPathToFrenchCanonical(pathname: string) {
  if (isPublicBlogPathname(pathname)) {
    return `/fr${pathname}`;
  }

  for (const locale of routing.locales) {
    if (locale === "fr") continue;

    const localizedBlogRoot = `/${locale}/blog`;
    if (pathname === localizedBlogRoot) {
      return "/fr/blog";
    }
    if (pathname.startsWith(`${localizedBlogRoot}/`)) {
      return pathname.replace(localizedBlogRoot, "/fr/blog");
    }
  }

  return null;
}

function shouldSkipI18n(pathname: string) {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/trpc") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/unauthorized") ||
    pathname === "/llms.txt" ||
    pathname === "/llms-ctx.txt" ||
    pathname === "/robots.txt" ||
    pathname.startsWith("/sitemap")
  );
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Backward compatibility for legacy EN home URL.
  if (pathname === "/home") {
    return NextResponse.redirect(new URL("/en", req.url), 308);
  }

  const frenchBlogPath = blogPathToFrenchCanonical(pathname);
  if (frenchBlogPath) {
    const url = req.nextUrl.clone();
    url.pathname = frenchBlogPath;
    return NextResponse.redirect(url, 301);
  }

  // Static media under /public/video — must not run next-intl (rewrites break the path → 404).
  if (pathname.startsWith("/video/")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/images/")) {
    const rawSegment = pathname.slice("/images/".length);
    let filename: string;
    try {
      filename = decodeURIComponent(rawSegment).toLowerCase();
    } catch (e) {
      if (e instanceof URIError) {
        console.warn(
          "[middleware] Malformed percent-encoding in image path:",
          pathname,
        );
        filename = rawSegment.toLowerCase();
      } else {
        throw e;
      }
    }

    const isWheelAsset = filename.includes("wheel");
    const isLogoAsset = filename.includes("logo");
    const isShadowAsset = filename.includes("shadow");
    const isHomeBodyAsset =
      filename === "touareg-body.png" ||
      filename === "bmw-body.webp" ||
      filename === "kia-body.webp" ||
      filename === "t-roc-body.webp" ||
      filename === "golf8-body.webp";

    if (isWheelAsset || isHomeBodyAsset || isLogoAsset || isShadowAsset) {
      const res = NextResponse.next();
      res.headers.set("X-Robots-Tag", "noindex");
      return res;
    }

    return NextResponse.next();
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  if (isAdminRoute(req)) {
    const authObj = await auth();
    const { userId } = authObj;

    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  if (shouldSkipI18n(pathname)) {
    return NextResponse.next();
  }

  return handleI18nRouting(req);
});

export const config = {
  matcher: [
    // Exclude common static assets so i18n middleware does not rewrite them (e.g. .mp4 was missing → /video/*.mp4 404).
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|txt|docx?|xlsx?|zip|webmanifest|mp4|webm|mov|m4v|ogv|ogg)).*)",
    "/images/:path*",
    "/video/:path*",
    "/(api|trpc)(.*)",
  ],
};
