import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getAllArticles } from '@/data/blog';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { ArticleContent } from './ArticleContent';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for all articles (SSG)
export async function generateStaticParams() {
  const articles = getAllArticles();
  
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

// Generate metadata for each article (SEO optimized)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  
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
      canonical: article.seo.canonical,
    },
    openGraph: {
      type: 'article',
      title: article.title,
      url: `https://amseelcars.com${article.seo.canonical}`,
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
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  
  if (!article) {
    notFound();
  }

  return (
    <LoadingProvider>
      <ArticleContent article={article} />
    </LoadingProvider>
  );
}
