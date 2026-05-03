import { NextResponse } from "next/server";
import { buildRootSitemapIndexXml } from "@/lib/seo/sitemap-pages";

export async function GET() {
  const lastmodIso = new Date().toISOString();
  const sitemapIndex = buildRootSitemapIndexXml(lastmodIso);

  return new NextResponse(sitemapIndex, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
