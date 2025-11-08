import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryFromSlug, getArticlesByCategory, getAllCategories, categoryToSlug } from '@/data/blog';
import { LoadingProvider } from '@/contexts/LoadingContext';
import BlogArticles from '@/components/Blog/BlogArticles';
import BlogHero from '@/components/Blog/BlogHero';
import Footer from '@/components/Footer/Footer';

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

// Generate static params for all categories
export async function generateStaticParams() {
  const categories = getAllCategories();
  
  return categories.map((category) => ({
    category: categoryToSlug(category),
  }));
}

// Generate metadata for category page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = getCategoryFromSlug(categorySlug);
  
  if (!category) {
    return {
      title: 'Catégorie non trouvée - AmseelCars Blog',
      description: 'La catégorie demandée n\'a pas été trouvée.',
    };
  }

  const articles = getArticlesByCategory(category);

  return {
    title: `${category} - AmseelCars Blog`,
    description: `Découvrez tous nos articles sur ${category.toLowerCase()}. Conseils, guides et actualités pour la location de voiture à Agadir.`,
    alternates: {
      canonical: `/blog/${categorySlug}`,
    },
    openGraph: {
      type: 'website',
      title: `${category} - AmseelCars Blog`,
      description: `Découvrez tous nos articles sur ${category.toLowerCase()}.`,
      url: `https://www.amseelcars.com/blog/${categorySlug}`,
      siteName: 'AmseelCars',
      locale: 'fr_MA',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category} - AmseelCars Blog`,
      description: `Découvrez tous nos articles sur ${category.toLowerCase()}.`,
    },
    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
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
  const category = getCategoryFromSlug(categorySlug);
  
  if (!category) {
    notFound();
  }

  const articles = getArticlesByCategory(category);

  return (
    <LoadingProvider>
      <div className="page-content blog">
        <BlogHero title={category} subtitle={`Découvrez tous nos articles sur ${category.toLowerCase()}`} />
        <BlogArticles articles={articles} showFilter={false} />
        <Footer />
      </div>
    </LoadingProvider>
  );
}

