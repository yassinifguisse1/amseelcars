"use client";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useScroll, useTransform } from "framer-motion";
import { BlogArticle } from '@/data/blog';
import styles from "./ArticleBody.module.scss";

interface ArticleBodyProps {
  article: BlogArticle;
}

export default function ArticleBody({ article }: ArticleBodyProps) {
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
        <motion.article 
          className={styles.article}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div 
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </motion.article>

        <motion.div 
          className={styles.cta}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className={styles.ctaContent}>
            <h3 className={styles.ctaTitle}>Besoin d'aide pour votre location ?</h3>
            <p className={styles.ctaText}>
              Notre équipe d'experts est là pour vous accompagner dans le choix de votre véhicule
            </p>
            <div className={styles.ctaButtons}>
              <motion.a 
                href="https://wa.me/212662500181/?text=Bonjour, je souhaite louer une voiture."
                className={styles.primaryButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contactez-nous sur WhatsApp
              </motion.a>
              <motion.a 
                href="mailto:info@amseelcars.com"
                className={styles.secondaryButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Envoyer un Email
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}



