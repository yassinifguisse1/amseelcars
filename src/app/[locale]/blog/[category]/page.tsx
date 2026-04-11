import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { getCategoryFromSlug, getArticlesByCategory, getAllCategories, categoryToSlug } from '@/data/blog';
import { localizedAlternates } from '@/lib/seo/localized-alternates';
import type { AppLocale } from '@/i18n/routing';
import { getPathname } from '@/i18n/navigation';
import { LoadingProvider } from '@/contexts/LoadingContext';
import BlogArticles from '@/components/Blog/BlogArticles';
import BlogHero from '@/components/Blog/BlogHero';
import Footer from '@/components/Footer/Footer';

// Force dynamic rendering - prevent Next.js from caching this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

// Generate static params for all categories
export async function generateStaticParams() {
  const categories = await getAllCategories();
  
  return categories.map((category) => ({
    category: categoryToSlug(category),
  }));
}

// Generate metadata for category page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await getCategoryFromSlug(categorySlug);
  
  if (!category) {
    return {
      title: 'Catégorie non trouvée - AmseelCars Blog',
      description: 'La catégorie demandée n\'a pas été trouvée.',
    };
  }

  const locale = await getLocale();
  const l: AppLocale = locale === "en" ? "en" : "fr";
  const href = {
    pathname: "/blog/[category]" as const,
    params: { category: categorySlug },
  };
  const path = getPathname({ locale: l, href });

  return {
    title: `${category} - AmseelCars Blog`,
    description: `Découvrez tous nos articles sur ${category.toLowerCase()}. Conseils, guides et actualités pour la location de voiture à Agadir.`,
    alternates: localizedAlternates(l, href),
    openGraph: {
      type: 'website',
      title: `${category} - AmseelCars Blog`,
      description: `Découvrez tous nos articles sur ${category.toLowerCase()}.`,
      url: `https://www.amseelcars.com${path}`,
      siteName: 'AmseelCars',
      locale: 'fr_MA',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category} - AmseelCars Blog`,
      description: `Découvrez tous nos articles sur ${category.toLowerCase()}.`,
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
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: categorySlug } = await params;
  const category = await getCategoryFromSlug(categorySlug);
  
  if (!category) {
    notFound();
  }

  const articles = await getArticlesByCategory(category);

  return (
    <LoadingProvider>
      <div className="page-content blog">
        <BlogHero title={category} subtitle={`Découvrez tous nos articles sur ${category.toLowerCase()}`} articles={articles} />
        <BlogArticles articles={articles} showFilter={false} />
        <Footer />
      </div>
    </LoadingProvider>
  );
}

