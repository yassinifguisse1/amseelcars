"use client";
import { motion } from "framer-motion";
import Footer from "@/components/Footer/Footer";
import BlogHero from "@/components/Blog/BlogHero";
import BlogArticles from "@/components/Blog/BlogArticles";

export function HomeContent() {
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
        <BlogHero />
        <BlogArticles />
        <Footer />
      </motion.div>
    </div>
  );
}
