import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticleByCategoryAndSlug, getAllArticles, categoryToSlug } from '@/data/blog';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { ArticleContent } from '../../[slug]/ArticleContent';
import { extractFAQs, generateFAQSchema } from '@/lib/faqSchema';

interface PageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

// Generate static params for all articles with their categories
export async function generateStaticParams() {
  const articles = getAllArticles();
  
  return articles.map((article) => ({
    category: categoryToSlug(article.category),
    slug: article.slug,
  }));
}

// Generate metadata for each article (SEO optimized)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categorySlug, slug } = await params;
  const article = getArticleByCategoryAndSlug(categorySlug, slug);
  
  if (!article) {
    return {
      title: 'Article non trouvé - AmseelCars Blog',
      description: 'L\'article demandé n\'a pas été trouvé.',
    };
  }

  return {
    title: article.seo.metaTitle,
    description: article.seo.metaDescription,
    keywords: article.seo.keywords,
    authors: [{ name: article.author.name }],
    creator: article.author.name,
    publisher: 'AmseelCars',
    alternates: {
      canonical: `/blog/${categorySlug}/${slug}`,
    },
    openGraph: {
      type: 'article',
      title: article.title,
      url: `https://amseelcars.com/blog/${categorySlug}/${slug}`,
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
      index: true,
      follow: true,
      googleBot: {
        index: true,
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
  
  // Debug logging (remove in production)
  console.log('Route params:', { categorySlug, slug });
  
  const article = getArticleByCategoryAndSlug(categorySlug, slug);
  
  if (!article) {
    console.log('Article not found for:', { categorySlug, slug });
    notFound();
  }

  // Extract FAQs and generate schema
  const faqs = extractFAQs(article.content);
  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      {/* FAQ Schema for SEO */}
      {faqSchema && (
        <script
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

