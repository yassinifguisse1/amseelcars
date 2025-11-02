"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { BlogArticle } from '@/data/blog';
import styles from "./ArticleCard.module.scss";

interface ArticleCardProps {
  article: BlogArticle;
  variant: "featured" | "regular";
}

export default function ArticleCard({ article, variant }: ArticleCardProps) {
  const cardVariants = {
    hover: {
      y: -10,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1] as const
      }
    }
  };

  const imageVariants = {
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1] as const
      }
    }
  };

  return (
    <motion.article 
      className={`${styles.card} ${styles[variant]}`}
      variants={cardVariants}
      whileHover="hover"
      layout
    >
      <Link href={`/blog/${article.slug}`} className={styles.link}>
        <div className={styles.imageContainer}>
          <motion.div 
            className={styles.imageWrapper}
            variants={imageVariants}
          >
            <Image
              src={article.image}
              alt={article.title}
              fill
              className={styles.image}
              sizes={variant === "featured" ? "100vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
            />
            <div className={styles.overlay} />
          </motion.div>
          
          <div className={styles.category}>
            {article.category}
          </div>
          
          <div className={styles.meta}>
            <span className={styles.readTime}>{article.readTime}</span>
            <span className={styles.date}>{article.date}</span>
          </div>
        </div>

        <div className={styles.content}>
          <h3 className={styles.title}>
            {article.title}
          </h3>
          
          
          
          <div className={styles.footer}>
            <span className={styles.readMore}>
              Lire la suite
              <motion.span 
                className={styles.arrow}
                initial={{ x: 0 }}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                →
              </motion.span>
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
