import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { inferLocaleFromPathname } from "./i18n/infer-locale-from-pathname";
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

/**
 * next-intl resolves locale before matching localized pathnames. With
 * `localePrefix: "never"` and only the default locale, `/about` was treated as
 * French and redirected to `/a-propos`. We set `NEXT_LOCALE` from the pathname
 * when it uniquely identifies a locale, and strip `Accept-Language` so the
 * browser does not override French on `/` or ambiguous paths.
 */
function intlRequestWithHints(req: NextRequest, pathname: string): NextRequest {
  const inferred = inferLocaleFromPathname(pathname);
  const headers = new Headers(req.headers);
  headers.delete("accept-language");

  if (inferred) {
    const raw = req.headers.get("cookie") ?? "";
    const withoutNextLocale = raw
      .split(";")
      .map((c) => c.trim())
      .filter((c) => c.length > 0 && !c.startsWith("NEXT_LOCALE="))
      .join("; ");
    const nextCookie = withoutNextLocale
      ? `${withoutNextLocale}; NEXT_LOCALE=${inferred}`
      : `NEXT_LOCALE=${inferred}`;
    headers.set("cookie", nextCookie);
  }

  return new NextRequest(req.url, { headers });
}

function shouldSkipI18n(pathname: string) {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/trpc") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/unauthorized") ||
    pathname === "/robots.txt" ||
    pathname.startsWith("/sitemap")
  );
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

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

  return handleI18nRouting(intlRequestWithHints(req, pathname));
});

export const config = {
  matcher: [
    // Exclude common static assets so i18n middleware does not rewrite them (e.g. .mp4 was missing → /video/*.mp4 404).
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4|webm|mov|m4v|ogv|ogg)).*)",
    "/images/:path*",
    "/video/:path*",
    "/(api|trpc)(.*)",
  ],
};
