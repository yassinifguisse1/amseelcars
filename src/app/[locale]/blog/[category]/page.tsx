import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { getLocale, getTranslations } from 'next-intl/server';
import { getCategoryFromSlug, getArticlesByCategory, getAllCategories, categoryToSlug, getArticleBySlug } from '@/data/blog';
import type { AppLocale } from '@/i18n/routing';
import { getPathname, redirect } from '@/i18n/navigation';
import { localeToLanguageTag, localeToOpenGraphLocale, toAppLocale } from '@/i18n/locale-utils';
import { generateBreadcrumbSchema } from '@/lib/schemas';
import { buildPageMetadata } from '@/lib/seo/site-meta';
import BlogArticles from '@/components/Blog/BlogArticles';
import BlogHero from '@/components/Blog/BlogHero';
import Footer from '@/components/Footer/Footer';
import {
  absoluteBlogUrl,
  blogArticlePath,
  blogCategoryPath,
  blogIndexPath,
  localizedBlogPathAlternates,
} from '@/lib/seo/blog-paths';

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
  const locale = await getLocale();
  const l: AppLocale = toAppLocale(locale);
  const t = await getTranslations({ locale: l, namespace: "seo.blog" });
  const category = await getCategoryFromSlug(categorySlug, l);
  
  if (!category) {
    return {
      title: { absolute: t("categoryNotFoundTitle") },
      description: t("categoryNotFoundDescription"),
      robots: { index: false, follow: false },
    };
  }
  const title = t("categoryTitle", { category });
  const description = t("categoryDescription", { category: category.toLowerCase() });
  const path = blogCategoryPath(categorySlug, l);

  return buildPageMetadata({
    title,
    description,
    path,
    localeOg: localeToOpenGraphLocale(l),
    alternates: localizedBlogPathAlternates(l, (loc) =>
      blogCategoryPath(categorySlug, loc),
    ),
    imageAlt: title,
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: categorySlug } = await params;
  const locale = await getLocale();
  const l: AppLocale = toAppLocale(locale);
  const category = await getCategoryFromSlug(categorySlug, l);
  
  if (!category) {
    const legacyArticle = await getArticleBySlug(categorySlug, l);
    if (legacyArticle) {
      redirect({
        href: {
          pathname: "/blog/[category]/[slug]",
          params: {
            category: categoryToSlug(legacyArticle.category),
            slug: legacyArticle.slug,
          },
        },
        locale: l,
      });
    }
    notFound();
  }

  const isEn = l === "en";
  const articles = await getArticlesByCategory(category, l);
  const homePath = getPathname({ locale: l, href: "/" });
  const blogPath = blogIndexPath(l);
  const categoryPath = blogCategoryPath(categorySlug, l);
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
    inLanguage: localeToLanguageTag(l),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: articles.slice(0, 20).map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteBlogUrl(
          blogArticlePath(categoryToSlug(article.category), article.slug, l),
        ),
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
    </>
  );
}
