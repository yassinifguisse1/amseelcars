import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { getLocale } from 'next-intl/server';
import { getCategoryFromSlug, getArticlesByCategory, getAllCategories, categoryToSlug } from '@/data/blog';
import { localizedAlternates } from '@/lib/seo/localized-alternates';
import type { AppLocale } from '@/i18n/routing';
import { getPathname } from '@/i18n/navigation';
import { generateBreadcrumbSchema } from '@/lib/schemas';
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
      locale: l === 'en' ? 'en_US' : 'fr_MA',
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

  const locale = await getLocale();
  const l: AppLocale = locale === "en" ? "en" : "fr";
  const isEn = l === "en";
  const articles = await getArticlesByCategory(category, l);
  const homePath = getPathname({ locale: l, href: "/" });
  const blogPath = getPathname({ locale: l, href: "/blog" });
  const categoryPath = getPathname({
    locale: l,
    href: { pathname: "/blog/[category]", params: { category: categorySlug } },
  });
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: isEn ? "Home" : "Accueil", url: homePath },
    { name: "Blog", url: blogPath },
    { name: category, url: categoryPath },
  ]);
  const categoryCollectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `https://www.amseelcars.com${categoryPath}#collection`,
    url: `https://www.amseelcars.com${categoryPath}`,
    name: `${category} - ${isEn ? "AmseelCars blog" : "Blog AmseelCars"}`,
    description: isEn
      ? `Articles about ${category.toLowerCase()} for car rental planning in Agadir.`
      : `Articles sur ${category.toLowerCase()} pour preparer votre location de voiture a Agadir.`,
    inLanguage: isEn ? "en-US" : "fr-MA",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: articles.slice(0, 20).map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://www.amseelcars.com/${article.locale}/blog/${categoryToSlug(article.category)}/${article.slug}`,
        name: article.title,
      })),
    },
  };
  const quickAnswer = isEn
    ? `Best ${category.toLowerCase()} guidance: compare options, read practical constraints, then book the right car class for your trip.`
    : `Meilleure reponse sur ${category.toLowerCase()} : comparez les options, verifiez les contraintes pratiques, puis choisissez la bonne categorie de voiture.`;

  return (
    <>
      <Script
        id="ld-json-breadcrumb-blog-category"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="ld-json-collection-blog-category"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryCollectionSchema) }}
      />
      <LoadingProvider>
        <section className="mx-auto max-w-6xl px-4 pb-4 pt-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b11226]">
              {isEn ? "Quick answer" : "Reponse rapide"}
            </p>
            <p className="mt-2 text-sm text-neutral-700">{quickAnswer}</p>
          </div>
        </section>
        <div className="page-content blog">
          <BlogHero title={category} subtitle={`Découvrez tous nos articles sur ${category.toLowerCase()}`} articles={articles} />
          <BlogArticles articles={articles} showFilter={false} />
          <Footer />
        </div>
      </LoadingProvider>
    </>
  );
}

