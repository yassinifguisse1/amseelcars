import {
  categoryToSlug,
  getArticlesByTranslationGroup,
  type BlogArticle,
} from "@/data/blog";
import type { AppLocale } from "@/i18n/routing";
import { blogArticlePath } from "@/lib/seo/blog-paths";

export type ArticleLocalePaths = Partial<Record<AppLocale, string>>;

/** Paths for each locale version of an article (used by the header language switcher). */
export async function buildArticleLocalePaths(article: BlogArticle): Promise<ArticleLocalePaths> {
  const paths: ArticleLocalePaths = {
    [article.locale]: blogArticlePath(
      categoryToSlug(article.category),
      article.slug,
      article.locale,
    ),
  };

  if (!article.translationGroup) {
    return paths;
  }

  const siblings = await getArticlesByTranslationGroup(article.translationGroup);

  for (const entry of siblings) {
    if (!entry) continue;
    paths[entry.locale] = blogArticlePath(
      categoryToSlug(entry.category),
      entry.slug,
      entry.locale,
    );
  }

  return paths;
}
