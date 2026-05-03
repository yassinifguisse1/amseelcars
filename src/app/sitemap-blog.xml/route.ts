import { NextResponse } from "next/server";
import { getAllArticles, categoryToSlug } from "@/data/blog";
import { getPathname } from "@/i18n/navigation";

const baseUrl = "https://www.amseelcars.com";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const articles = (await getAllArticles()).filter(
    (article) => article.indexable !== false,
  );

  const urls = articles
    .map((article) => {
      const lastmod = new Date(article.publishedAt).toISOString().split("T")[0];
      const path = getPathname({
        locale: article.locale,
        href: {
          pathname: "/blog/[category]/[slug]",
          params: {
            category: categoryToSlug(article.category),
            slug: article.slug,
          },
        },
      });
      const loc = escapeXml(`${baseUrl}${path}`);
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
    })
    .join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
