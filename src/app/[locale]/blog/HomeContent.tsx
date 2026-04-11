"use client";
import { motion } from "framer-motion";
import Footer from "@/components/Footer/Footer";
import BlogHero from "@/components/Blog/BlogHero";
import BlogArticles from "@/components/Blog/BlogArticles";
import { BlogArticle } from "@/data/blog";
export default function HomeContent({ articles }: { articles: BlogArticle[] }) {
  
  return (
    <div className="page-content blog">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ 
          duration: 0.8, 
          ease: [0.25, 0.1, 0.25, 1]
        }}
      >
        <BlogHero articles={articles as BlogArticle[]} />
        <BlogArticles articles={articles} />
        <Footer />
      </motion.div>
    </div>
  );
}
