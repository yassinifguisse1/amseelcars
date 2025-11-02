"use client";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useScroll, useTransform } from "framer-motion";
import { BlogArticle } from '@/data/blog';
import Image from 'next/image';
import styles from "./ArticleHero.module.scss";

interface ArticleHeroProps {
  article: BlogArticle;
}

export default function ArticleHero({ article }: ArticleHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <motion.section 
      ref={containerRef}
      className={styles.hero}
      style={{ y, opacity }}
    >
      <div className={styles.imageContainer}>
        <Image
          src={article.image}
          alt={article.title}
          fill
          className={styles.image}
          priority
          sizes="100vw"
        />
        <div className={styles.overlay} />
      </div>

      <div className={styles.content}>
        <motion.div 
          className={styles.container}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <motion.div 
            className={styles.breadcrumb}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className={styles.category}>{article.category}</span>
            <span className={styles.separator}>•</span>
            <span className={styles.readTime}>{article.readTime}</span>
          </motion.div>

          <motion.h1 
            className={styles.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {article.title}
          </motion.h1>
          
     
          <motion.div 
            className={styles.meta}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className={styles.author}>
              <div className={styles.avatar}>
                <Image
                  src={article.author.avatar}
                  alt={article.author.name}
                  width={40}
                  height={40}
                  className={styles.avatarImage}
                />
              </div>
              <div className={styles.authorInfo}>
                <span className={styles.authorName}>{article.author.name}</span>
                <span className={styles.publishDate}>{article.date}</span>
              </div>
            </div>

            <div className={styles.tags}>
              {article.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}



