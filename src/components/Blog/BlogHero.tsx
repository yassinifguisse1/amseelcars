"use client";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import styles from "./BlogHero.module.scss";
import { BlogArticle } from "@/data/blog";

interface BlogHeroProps {
  title?: string;
  subtitle?: string;
  articles: BlogArticle[];
  }

export default function BlogHero({ title, subtitle, articles }: BlogHeroProps) {
  const t = useTranslations("blogPage");
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
      <div className={styles.container}>
        <motion.div 
          className={styles.content}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <motion.h1 
            className={styles.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {title ? (
              <>{title} <span className={styles.accent}>{t("statArticles")}</span></>
            ) : (
              <>{t("heroTitleLead")} <span className={styles.accent}>{t("heroTitleAccent")}</span></>
            )}
          </motion.h1>
          
          <motion.p 
            className={styles.subtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {subtitle || t("heroSubtitle")}
          </motion.p>

          <motion.div 
            className={styles.stats}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className={styles.stat}>
              <span className={styles.number}>{articles?.length}</span>
              <span className={styles.label}>{t("statArticles")}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.number}>10K+</span>
              <span className={styles.label}>{t("statReaders")}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.number}>5★</span>
              <span className={styles.label}>{t("statSatisfaction")}</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          className={styles.visual}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <div className={styles.gradient} />
        </motion.div>
      </div>
    </motion.section>
  );
}
