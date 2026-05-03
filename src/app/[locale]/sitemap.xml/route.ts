import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/** Crawlers sometimes request `/en/sitemap.xml`; canonical sitemap lives at `/sitemap.xml`. */
export function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/sitemap.xml";
  url.search = "";
  return NextResponse.redirect(url, 308);
}
