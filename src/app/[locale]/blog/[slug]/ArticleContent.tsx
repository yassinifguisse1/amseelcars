"use client";
import { useEffect, useLayoutEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { BlogArticle } from '@/data/blog';
import { useRelatedArticles } from '@/hooks/useArticles';
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { isArticleLocale, type ArticleLocale } from "@/lib/validations/article";
import Footer from "@/components/Footer/Footer";

import ArticleHero from "@/components/Blog/ArticleHero";
import ArticleBody from "@/components/Blog/ArticleBody";
import RelatedArticles from "@/components/Blog/RelatedArticles";

interface ArticleContentProps {
  article: BlogArticle;
}

export function ArticleContent({ article }: ArticleContentProps) {
  const locale = useLocale() as AppLocale;
  const articleLocale: ArticleLocale = isArticleLocale(locale) ? locale : "fr";

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.overflow = "visible";
    document.body.style.height = "auto";
    document.body.style.transform = "none";
    document.documentElement.style.transform = "none";
    window.scrollTo(0, 0);
  }, [article.id, article.locale]);

  useEffect(() => {
    return () => {
      if (typeof window === "undefined") return;
      document.body.style.overflow = "";
      document.body.style.height = "";
      document.body.style.transform = "";
      document.documentElement.style.transform = "";
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return (
    <div className="page-content article">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.5,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        <ArticleHero article={article} />
        <ArticleBody article={article} />
        <Suspense fallback={<div className="py-12 text-center">Chargement des articles similaires...</div>}>
          <RelatedArticlesWrapper articleSlug={article.slug} locale={articleLocale} />
        </Suspense>
        <Footer />
      </motion.div>
    </div>
  );
}

function RelatedArticlesWrapper({ articleSlug, locale }: { articleSlug: string; locale: ArticleLocale }) {
  const { articles: relatedArticles, isLoading } = useRelatedArticles(articleSlug, 3, locale);

  if (isLoading) {
    return <div className="py-12 text-center">Chargement des articles similaires...</div>;
  }

  if (relatedArticles.length === 0) {
    return null;
  }

  return <RelatedArticles articles={relatedArticles} />;
}
