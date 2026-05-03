import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { getLocale } from 'next-intl/server';
import {
  getArticleByCategoryAndSlug,
  getAllArticles,
  categoryToSlug,
} from '@/data/blog';
import type { AppLocale } from '@/i18n/routing';
import { getPathname } from '@/i18n/navigation';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { ArticleContent } from '../../[slug]/ArticleContent';
import { extractFAQs, generateFAQSchema } from '@/lib/faqSchema';
import { generateBlogPostingSchema, generateBreadcrumbSchema } from '@/lib/schemas';
import {
  absoluteBlogUrl,
  blogArticlePath,
  blogCategoryPath,
  blogIndexPath,
  frenchBlogAlternates,
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
  const l: AppLocale = locale === "en" ? "en" : "fr";
  const article = await getArticleByCategoryAndSlug(categorySlug, slug, l);
  
  if (!article) {
    return {
      title: 'Article non trouvé - AmseelCars Blog',
      description: 'L\'article demandé n\'a pas été trouvé.',
    };
  }

  const path = blogArticlePath(categoryToSlug(article.category), article.slug);
  const alternates = frenchBlogAlternates(path);

  return {
    title: article.seo.metaTitle,
    description: article.seo.metaDescription,
    keywords: article.seo.keywords,
    authors: [{ name: article.author.name }],
    creator: article.author.name,
    publisher: 'AmseelCars',
    alternates,
    openGraph: {
      type: 'article',
      title: article.title,
      url: absoluteBlogUrl(path),
      siteName: 'AmseelCars',
      locale: 'fr_MA',
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
  const l: AppLocale = locale === "en" ? "en" : "fr";
  const homePath = getPathname({ locale: l, href: "/" });
  const blogPath = blogIndexPath();
  const categoryPath = blogCategoryPath(categorySlug);
  
  // Debug logging (remove in production)
  console.log('Route params:', { categorySlug, slug });
  
  const article = await getArticleByCategoryAndSlug(categorySlug, slug, l);
  
  if (!article) {
    console.log('Article not found for:', { categorySlug, slug });
    notFound();
  }

  const articlePath = blogArticlePath(categoryToSlug(article.category), article.slug);

  // Extract FAQs and generate schema
  const faqs = extractFAQs(article.content);
  const faqSchema = generateFAQSchema(faqs);

  // Generate BlogPosting schema
  const blogPostingSchema = generateBlogPostingSchema({
    title: article.title,
    description: article.seo.metaDescription,
    image: article.image,
    author: article.author,
    publishedAt: article.publishedAt,
    slug: `${categoryToSlug(article.category)}/${article.slug}`,
    category: article.category,
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
      
      <LoadingProvider>
        <ArticleContent article={article} />
      </LoadingProvider>
    </>
  );
}
