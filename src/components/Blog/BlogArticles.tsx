"use client";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useScroll, useTransform } from "framer-motion";
import { getAllArticles, getFeaturedArticles } from '@/data/blog';
import styles from "./BlogArticles.module.scss";
import ArticleCard from "./ArticleCard";

// Get articles from the data file
const blogArticles = getAllArticles();

export default function BlogArticles() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  const featuredArticle = getFeaturedArticles()[0]; // Get first featured article
  const regularArticles = blogArticles.filter(article => !article.featured);

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
          <h2 className={styles.title}>Articles Récents</h2>
          <p className={styles.subtitle}>
            Découvrez nos derniers conseils et actualités pour optimiser votre expérience de location
          </p>
        </motion.div>

        {featuredArticle && (
          <motion.div 
            className={styles.featured}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <ArticleCard 
              article={featuredArticle} 
              variant="featured"
            />
          </motion.div>
        )}

        <motion.div 
          className={styles.grid}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          {regularArticles.map((article, index) => (
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

        <motion.div 
          className={styles.cta}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className={styles.ctaTitle}>Besoin d&apos;aide pour votre location ?</h3>
          <p className={styles.ctaText}>
            Notre équipe est là pour vous accompagner dans le choix de votre véhicule
          </p>
          <motion.a 
            href="https://wa.me/212662500181/?text=Bonjour, je souhaite louer une voiture."
            className={styles.ctaButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Contactez-nous
          </motion.a>
        </motion.div>
      </div>
    </motion.section>
  );
}
