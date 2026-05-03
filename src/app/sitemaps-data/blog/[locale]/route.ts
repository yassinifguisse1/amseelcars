import { NextResponse } from "next/server";
import { routing, type AppLocale } from "@/i18n/routing";
import { buildBlogSitemapXmlForLocale } from "@/lib/seo/sitemap-blog-locale";

export async function GET(
  _request: Request,
  context: { params: Promise<{ locale: string }> },
) {
  const { locale } = await context.params;
  if (!routing.locales.includes(locale as AppLocale)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const lastmodDay = new Date().toISOString().split("T")[0];
  const body = await buildBlogSitemapXmlForLocale(locale, lastmodDay);

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
