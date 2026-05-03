import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ locale: string }> },
) {
  const { locale } = await context.params;
  const url = request.nextUrl.clone();
  url.pathname = `/sitemap-blog-${locale}.xml`;
  url.search = "";
  return NextResponse.redirect(url, 308);
}
