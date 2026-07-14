import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { getLocale, getTranslations } from 'next-intl/server';
import {
  getArticleByCategoryAndSlug,
  getAllArticles,
  getArticlesByTranslationGroup,
  categoryToSlug,
} from '@/data/blog';
import type { AppLocale } from '@/i18n/routing';
import { getPathname, redirect } from '@/i18n/navigation';
import { localeToOpenGraphLocale, toAppLocale } from '@/i18n/locale-utils';
import { ArticleLocalePathsSync } from '@/contexts/ArticleLocalePathsContext';
import { buildArticleLocalePaths } from '@/lib/blog/article-locale-paths';
import { ArticleContent } from '../../[slug]/ArticleContent';
import { extractFAQs, generateFAQSchema } from '@/lib/faqSchema';
import { generateBlogPostingSchema, generateBreadcrumbSchema } from '@/lib/schemas';
import { absoluteTitle, SITE_NAME } from '@/lib/seo/site-meta';
import {
  absoluteBlogUrl,
  blogArticlePath,
  blogCategoryPath,
  blogIndexPath,
  translatedBlogArticleAlternates,
} from '@/lib/seo/blog-paths';

// Force dynamic rendering - prevent Next.js from caching this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

interface PageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

// Generate static params for all articles with their categories
export async function generateStaticParams() {
  const articles = await getAllArticles();

  // Deduplicate (category, slug) pairs across locales.
  const seen = new Set<string>();
  const params: Array<{ category: string; slug: string }> = [];

  for (const article of articles) {
    const category = categoryToSlug(article.category);
    const key = `${category}|${article.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    params.push({ category, slug: article.slug });
  }

  return params;
}

// Generate metadata for each article (SEO optimized)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categorySlug, slug } = await params;
  const locale = await getLocale();
  const l: AppLocale = toAppLocale(locale);
  const tBlog = await getTranslations({ locale: l, namespace: "seo.blog" });
  const article = await getArticleByCategoryAndSlug(categorySlug, slug, l);
  
  if (!article) {
    return {
      title: absoluteTitle(tBlog("articleNotFoundTitle")),
      description: tBlog("articleNotFoundDescription"),
      robots: { index: false, follow: false },
    };
  }

  const path = blogArticlePath(categoryToSlug(article.category), article.slug, l);
  const translatedArticles = article.translationGroup
    ? await getArticlesByTranslationGroup(article.translationGroup)
    : [article];
  const alternates = translatedBlogArticleAlternates(
    translatedArticles.map((entry) => ({
      locale: entry.locale,
      category: categoryToSlug(entry.category),
      slug: entry.slug,
    })),
    path,
    l,
  );
  const pageTitle = article.seo.metaTitle;
  const pageDescription = article.seo.metaDescription;

  return {
    title: absoluteTitle(pageTitle),
    description: pageDescription,
    keywords: article.seo.keywords,
    authors: [{ name: article.author.name }],
    creator: article.author.name,
    publisher: SITE_NAME,
    alternates,
    openGraph: {
      type: 'article',
      title: article.title,
      description: pageDescription,
      url: absoluteBlogUrl(path),
      siteName: SITE_NAME,
      locale: localeToOpenGraphLocale(l),
      images: [
        {
          url: article.image,
          width: 1200,
          height: 630,
          alt: article.altText,
        },
      ],
      publishedTime: article.publishedAt,
      authors: [article.author.name],
      section: article.category,
      tags: article.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: pageDescription,
      images: [article.image],
      creator: '@amseelcars',
    },
    robots: {
      index: article.indexable !== false,
      follow: true,
      googleBot: {
        index: article.indexable !== false,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    },
    category: 'vehicles',
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { category: categorySlug, slug } = await params;
  const locale = await getLocale();
  const l: AppLocale = toAppLocale(locale);
  const homePath = getPathname({ locale: l, href: "/" });
  const blogPath = blogIndexPath(l);
  const categoryPath = blogCategoryPath(categorySlug, l);
  
  const article = await getArticleByCategoryAndSlug(categorySlug, slug, l);

  if (!article) {
    notFound();
  }

  const canonicalCategorySlug = categoryToSlug(article.category);
  if (categorySlug !== canonicalCategorySlug) {
    redirect({
      href: {
        pathname: "/blog/[category]/[slug]",
        params: { category: canonicalCategorySlug, slug: article.slug },
      },
      locale: l,
    });
  }

  const articlePath = blogArticlePath(categoryToSlug(article.category), article.slug, l);
  const articleLocalePaths = await buildArticleLocalePaths(article);

  // Extract FAQs and generate schema
  const faqs = extractFAQs(article.content);
  const faqSchema = generateFAQSchema(faqs);

  // Generate BlogPosting schema
  const blogPostingSchema = generateBlogPostingSchema({
    title: article.title,
    description: article.seo.metaDescription,
    image: article.image,
    imageMetaTitle: article.imageMetaTitle,
    imageAltText: article.altText,
    imageCaption: article.caption,
    imageDescription: article.imageDescription,
    author: article.author,
    publishedAt: article.publishedAt,
    slug: `${categoryToSlug(article.category)}/${article.slug}`,
    category: article.category,
    locale: l,
  });

  // Generate Breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: homePath },
    { name: "Blog", url: blogPath },
    { name: article.category, url: categoryPath },
    { name: article.title, url: articlePath },
  ]);

  return (
    <>
      {/* BlogPosting Schema */}
      <Script
        id="ld-json-blog-posting"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      
      {/* Breadcrumb Schema */}
      <Script
        id="ld-json-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* FAQ Schema for SEO */}
      {faqSchema && (
        <Script
          id="ld-json-faq"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      
      <ArticleLocalePathsSync paths={articleLocalePaths} />
        <ArticleContent article={article} />
    </>
  );
}
