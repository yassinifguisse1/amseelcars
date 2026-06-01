import type { Metadata } from "next";
import type { AppLocale } from "@/i18n/routing";

const SITE_URL = "https://www.amseelcars.com";

type Alternates = NonNullable<Metadata["alternates"]>;

export function blogIndexPath(locale: AppLocale = "fr") {
  return `/${locale}/blog`;
}

export function blogCategoryPath(category: string, locale: AppLocale = "fr") {
  return `/${locale}/blog/${category}`;
}

export function blogArticlePath(category: string, slug: string, locale: AppLocale = "fr") {
  return `/${locale}/blog/${category}/${slug}`;
}

export function absoluteBlogUrl(path: string) {
  return `${SITE_URL}${path}`;
}

export function frenchBlogAlternates(path: string, locale: AppLocale = "fr"): Alternates {
  return {
    canonical: path,
    languages: {
      [locale]: path,
      "x-default": path,
    },
  };
}

export function translatedBlogArticleAlternates(
  articles: Array<{ locale: AppLocale; category: string; slug: string }>,
  canonicalPath: string,
  canonicalLocale: AppLocale,
): Alternates {
  const languages = Object.fromEntries(
    articles.map((article) => [
      article.locale,
      blogArticlePath(article.category, article.slug, article.locale),
    ]),
  );
  const fallback = languages.fr || languages[canonicalLocale] || canonicalPath;

  return {
    canonical: canonicalPath,
    languages: {
      ...languages,
      "x-default": fallback,
    },
  };
}
