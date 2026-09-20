/**
 * Translate French blog articles that lack an English sibling.
 * Keeps the same image URLs + HTML structure; links via translationGroup.
 *
 * Usage:
 *   pnpm exec tsx scripts/translate-blog-fr-to-en.ts
 *   pnpm exec tsx scripts/translate-blog-fr-to-en.ts --limit=3
 *   pnpm exec tsx scripts/translate-blog-fr-to-en.ts --dry-run
 *   pnpm exec tsx scripts/translate-blog-fr-to-en.ts --slug=jet-ski
 */
import "dotenv/config";
import { Prisma } from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import {
  normalizedImageUrlKey,
  type SeoArticleImportImage,
} from "../src/lib/seoArticleImport";
import {
  translateSeoArticleDraft,
  type SeoArticleTranslationSource,
} from "../src/lib/seoArticleTranslation";
import { isArticleLocale, type ArticleLocale } from "../src/lib/validations/article";

const TARGET_LOCALE: ArticleLocale = "en";
const SOURCE_LOCALE: ArticleLocale = "fr";

function parseArgs(argv: string[]) {
  let limit = Number.POSITIVE_INFINITY;
  let dryRun = false;
  let onlySlug: string | null = null;
  for (const arg of argv) {
    if (arg === "--dry-run") dryRun = true;
    if (arg.startsWith("--limit=")) {
      const n = Number(arg.slice("--limit=".length));
      if (Number.isFinite(n) && n > 0) limit = n;
    }
    if (arg.startsWith("--slug=")) {
      onlySlug = arg.slice("--slug=".length).trim() || null;
    }
  }
  return { limit, dryRun, onlySlug };
}

function isFrenchLocale(locale: string | null | undefined) {
  if (!locale) return true;
  return !["en", "es", "de", "pl"].includes(locale);
}

function uniqueImages(images: SeoArticleImportImage[]) {
  const seen = new Set<string>();
  return images.filter((image) => {
    const key = normalizedImageUrlKey(image.sourceUrl);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function imagesFromArticle(article: {
  image: string;
  imageMetaTitle: string | null;
  altText: string;
  caption: string;
  imageDescription: string | null;
  content: string;
}): SeoArticleImportImage[] {
  const cover: SeoArticleImportImage = {
    sourceUrl: article.image,
    metaTitle: article.imageMetaTitle?.trim() || article.altText || "Article image",
    altText: article.altText?.trim() || article.imageMetaTitle?.trim() || "Article image",
    caption: article.caption?.trim() || article.altText?.trim() || "Article image",
    description:
      article.imageDescription?.trim() ||
      article.caption?.trim() ||
      article.altText?.trim() ||
      "Article image",
  };

  const body: SeoArticleImportImage[] = [
    ...article.content.matchAll(/<img\b[^>]*\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*>/gi),
  ].map((match) => {
    const sourceUrl = (match[1] || match[2] || "").trim();
    const altMatch = match[0].match(/\balt\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
    const titleMatch = match[0].match(/\btitle\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
    const alt = (altMatch?.[1] || altMatch?.[2] || cover.altText).trim();
    const title = (titleMatch?.[1] || titleMatch?.[2] || cover.metaTitle).trim();
    return {
      sourceUrl,
      metaTitle: title || alt,
      altText: alt,
      caption: alt,
      description: alt,
    };
  });

  return uniqueImages([cover, ...body.filter((image) => Boolean(image.sourceUrl))]);
}

function readAuthor(value: Prisma.JsonValue): SeoArticleTranslationSource["author"] {
  const raw = (value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {}) as Record<string, unknown>;
  return {
    name: typeof raw.name === "string" && raw.name.trim() ? raw.name : "AmseelCars",
    avatar:
      typeof raw.avatar === "string" && raw.avatar.trim()
        ? raw.avatar
        : "/images/amseel-car-logo.png",
    bio: typeof raw.bio === "string" ? raw.bio : "",
  };
}

function readSeo(value: Prisma.JsonValue): SeoArticleTranslationSource["seo"] {
  const raw = (value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {}) as Record<string, unknown>;
  const keywords = Array.isArray(raw.keywords)
    ? raw.keywords.filter((item): item is string => typeof item === "string")
    : [];
  return {
    metaTitle:
      typeof raw.metaTitle === "string" && raw.metaTitle.trim()
        ? raw.metaTitle
        : "AmseelCars",
    metaDescription:
      typeof raw.metaDescription === "string" && raw.metaDescription.trim()
        ? raw.metaDescription
        : "AmseelCars blog",
    keywords: keywords.length ? keywords : ["Agadir", "car rental"],
  };
}

async function main() {
  const { limit, dryRun, onlySlug } = parseArgs(process.argv.slice(2));
  if (!process.env.OPENAI_API_KEY?.trim()) {
    throw new Error("OPENAI_API_KEY is missing in .env");
  }
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("DATABASE_URL is missing in .env");
  }

  const articles = await prisma.blogArticle.findMany({
    orderBy: { publishedAt: "desc" },
  });

  const byGroup = new Map<string, typeof articles>();
  for (const article of articles) {
    const key = article.translationGroup?.trim() || `solo:${article.id}`;
    const list = byGroup.get(key) ?? [];
    list.push(article);
    byGroup.set(key, list);
  }

  const pending: typeof articles = [];
  for (const [key, groupArticles] of byGroup) {
    const source =
      groupArticles.find((article) => article.locale === "fr") ||
      groupArticles.find((article) => isFrenchLocale(article.locale));
    if (!source) continue;
    if (onlySlug && source.slug !== onlySlug) continue;
    const hasEn = groupArticles.some((article) => article.locale === "en");
    if (!hasEn) pending.push(source);
    void key;
  }

  const queue = pending.slice(0, limit);
  console.log(
    JSON.stringify(
      {
        dryRun,
        pendingTotal: pending.length,
        queueSize: queue.length,
        slugs: queue.map((article) => article.slug),
      },
      null,
      2,
    ),
  );

  if (dryRun) {
    await prisma.$disconnect();
    return;
  }

  let created = 0;
  let failed = 0;

  for (const [index, sourceArticle] of queue.entries()) {
    const translationGroup =
      sourceArticle.translationGroup?.trim() || sourceArticle.slug;
    console.log(
      `\n[${index + 1}/${queue.length}] Translating ${sourceArticle.slug} → en (group=${translationGroup})`,
    );

    try {
      if (!sourceArticle.translationGroup?.trim()) {
        await prisma.blogArticle.update({
          where: { id: sourceArticle.id },
          data: {
            locale: isArticleLocale(sourceArticle.locale)
              ? sourceArticle.locale
              : SOURCE_LOCALE,
            translationGroup,
          },
        });
      }

      const sourceImages = imagesFromArticle(sourceArticle);
      const source: SeoArticleTranslationSource = {
        locale: SOURCE_LOCALE,
        slug: sourceArticle.slug,
        title: sourceArticle.title,
        content: sourceArticle.content,
        category: sourceArticle.category,
        description: sourceArticle.description,
        tags: sourceArticle.tags,
        publishedAt: sourceArticle.publishedAt,
        author: readAuthor(sourceArticle.author),
        seo: readSeo(sourceArticle.seo),
        images: sourceImages,
      };

      const maxAttempts = 3;
      let translated: Awaited<ReturnType<typeof translateSeoArticleDraft>> | null = null;
      let lastError: unknown;
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          translated = await translateSeoArticleDraft(source, TARGET_LOCALE);
          break;
        } catch (error: unknown) {
          lastError = error;
          const message = error instanceof Error ? error.message : String(error);
          console.warn(`  attempt ${attempt}/${maxAttempts} failed: ${message}`);
          if (attempt === maxAttempts) throw error;
        }
      }
      if (!translated) throw lastError instanceof Error ? lastError : new Error("Translation failed");

      const coverKey = normalizedImageUrlKey(sourceArticle.image);
      const translatedCover =
        translated.images.find(
          (image) => normalizedImageUrlKey(image.sourceUrl) === coverKey,
        ) ?? translated.images[0];

      if (!translatedCover) {
        throw new Error("Missing translated cover image metadata");
      }

      const slugConflict = await prisma.blogArticle.findFirst({
        where: { slug: translated.slug, locale: TARGET_LOCALE },
        select: { id: true },
      });
      if (slugConflict) {
        throw new Error(`EN slug already exists: ${translated.slug}`);
      }

      const createdArticle = await prisma.blogArticle.create({
        data: {
          slug: translated.slug,
          locale: TARGET_LOCALE,
          translationGroup,
          translationSourceLocale: SOURCE_LOCALE,
          externalId: sourceArticle.externalId,
          importSource: sourceArticle.importSource,
          importedAt: sourceArticle.importedAt,
          publicationCallback: null,
          title: translated.title,
          content: translated.content,
          category: translated.category,
          readTime: translated.readTime,
          date: translated.date,
          publishedAt: sourceArticle.publishedAt,
          // Same visual assets as FR
          image: sourceArticle.image,
          imageMetaTitle: translatedCover.metaTitle,
          altText: translatedCover.altText,
          caption: translatedCover.caption,
          imageDescription: translatedCover.description,
          description: translated.description,
          featured: sourceArticle.featured,
          published: true,
          indexable: sourceArticle.indexable ?? true,
          tags: translated.tags,
          author: translated.author,
          seo: translated.seo,
          createdBy: "script:translate-blog-fr-to-en",
        },
      });

      created += 1;
      console.log(
        `✓ created EN ${createdArticle.slug} (${createdArticle.id}) group=${translationGroup}`,
      );
    } catch (error: unknown) {
      failed += 1;
      console.error(
        `✗ failed ${sourceArticle.slug}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  console.log(
    JSON.stringify(
      {
        created,
        failed,
        remainingWithoutEn: Math.max(0, pending.length - created),
      },
      null,
      2,
    ),
  );

  await prisma.$disconnect();
  if (failed > 0) process.exitCode = 1;
}

main().catch(async (error) => {
  console.error("translate-blog-fr-to-en failed:", error);
  await prisma.$disconnect().catch(() => undefined);
  process.exit(1);
});
