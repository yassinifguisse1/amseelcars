"use client";
import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { BlogArticle } from '@/data/blog';
import { useRelatedArticles } from '@/hooks/useArticles';
import Footer from "@/components/Footer/Footer";

import ArticleHero from "@/components/Blog/ArticleHero";
import ArticleBody from "@/components/Blog/ArticleBody";
import RelatedArticles from "@/components/Blog/RelatedArticles";
import { ArticleSkeleton } from "@/components/Blog/ArticleSkeleton";

interface ArticleContentProps {
  article: BlogArticle;
}

export function ArticleContent({ article }: ArticleContentProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure client-side hydration
    setIsClient(true);
    
    // Clean up any lingering scroll conflicts from other pages
    if (typeof window !== 'undefined') {
      // Reset scroll behavior to default
      document.documentElement.style.scrollBehavior = 'auto';
      document.body.style.overflow = 'visible';
      document.body.style.height = 'auto';
      
      // Reset any transform styles that might block scroll
      document.body.style.transform = 'none';
      document.documentElement.style.transform = 'none';
      
      // Ensure scroll is at top
      window.scrollTo(0, 0);
    }
  }, []);

  // Cleanup when component unmounts (navigating away)
  useEffect(() => {
    return () => {
      // Reset any scroll-related styles when leaving article page
      if (typeof window !== 'undefined') {
        document.body.style.overflow = '';
        document.body.style.height = '';
        document.body.style.transform = '';
        document.documentElement.style.transform = '';
        document.documentElement.style.scrollBehavior = '';
      }
    };
  }, []);

  if (!isClient) {
    return <ArticleSkeleton />;
  }

  return (
    <div className="page-content article">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ 
          duration: 0.8, 
          ease: [0.25, 0.1, 0.25, 1]
        }}
      >
        <ArticleHero article={article} />
        <ArticleBody article={article} />
        <Suspense fallback={<div className="py-12 text-center">Chargement des articles similaires...</div>}>
          <RelatedArticlesWrapper articleSlug={article.slug} />
        </Suspense>
        <Footer />
      </motion.div>
    </div>
  );
}

// Wrapper component for related articles with Suspense
function RelatedArticlesWrapper({ articleSlug }: { articleSlug: string }) {
  const { articles: relatedArticles, isLoading } = useRelatedArticles(articleSlug, 3);
  
  if (isLoading) {
    return <div className="py-12 text-center">Chargement des articles similaires...</div>;
  }
  
  if (relatedArticles.length === 0) {
    return null;
  }
  
  return <RelatedArticles articles={relatedArticles} />;
}
