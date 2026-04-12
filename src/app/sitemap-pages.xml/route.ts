import { NextResponse } from "next/server";
import { buildPagesSitemapXml } from "@/lib/seo/sitemap-pages";

export async function GET() {
  const lastmod = new Date().toISOString().split("T")[0];
  const sitemap = buildPagesSitemapXml(lastmod);

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}

