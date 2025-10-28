"use client";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useScroll, useTransform } from "framer-motion";
import { BlogArticle } from '@/data/blog';
import ArticleCard from "./ArticleCard";
import styles from "./RelatedArticles.module.scss";

interface RelatedArticlesProps {
  articles: BlogArticle[];
}

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <motion.section 
      ref={containerRef}
      className={styles.section}
      style={{ y }}
    >
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.title}>Articles Similaires</h2>
          <p className={styles.subtitle}>
            Découvrez d&apos;autres articles qui pourraient vous intéresser
          </p>
        </motion.div>

        <motion.div 
          className={styles.grid}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <ArticleCard 
                article={article} 
                variant="regular"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

