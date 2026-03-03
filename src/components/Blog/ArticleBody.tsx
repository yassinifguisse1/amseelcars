"use client";
import { motion } from "framer-motion";
import { useRef, useEffect } from "react";
import { useScroll, useTransform } from "framer-motion";
import { BlogArticle } from '@/data/blog';
import styles from "./ArticleBody.module.scss";
import TableOfContents, { processContentWithIds } from "./TableOfContents";

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

  // Delegate clicks on any link or button in the blog section (article body + CTA) and track to API + Make
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a, button');
      if (!target || !el.contains(target)) return;
      const ctaLabel = (target.textContent?.trim() || (target as HTMLAnchorElement).href || '').slice(0, 200);
      const payload = {
        path: typeof window !== 'undefined' ? window.location.pathname : '',
        source: 'blog',
        event: 'blog-cta',
        ctaLabel,
        fullUrl: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        language: typeof navigator !== 'undefined' ? navigator.language : '',
        referrer: typeof document !== 'undefined' ? document.referrer || '' : '',
        screen: typeof window !== 'undefined' && window.screen ? `${window.screen.width}x${window.screen.height}` : '',
        timezone: typeof Intl !== 'undefined' && Intl.DateTimeFormat ? Intl.DateTimeFormat().resolvedOptions().timeZone : '',
      };
      const url = '/api/track/whatsapp';
      const bodyStr = JSON.stringify(payload);
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([bodyStr], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      } else {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyStr,
          keepalive: true,
        }).catch(() => {});
      }
    };
    el.addEventListener('click', handleClick);
    return () => el.removeEventListener('click', handleClick);
  }, []);

  // Process content to add IDs to H2 headings first
  let processedContent = processContentWithIds(article.content);
  
  // Then process content to wrap FAQ section in a styled container
  // Use regex to find FAQ section - flexible matching for variations
  // Match: <h2>Foire aux questions</h2> (case-insensitive, with possible whitespace)
  const faqStartRegex = /<h2[^>]*>\s*Foire\s+aux\s+questions\s*<\/h2>/i;
  
  const faqStartMatch = processedContent.match(faqStartRegex);
  
  if (faqStartMatch) {
    const faqStartIndex = faqStartMatch.index!;
    let faqEndIndex: number = processedContent.length; // Default to end of content
    
    // Try to find common ending headings after FAQ section
    const possibleEndMarkers = [
      /<h2[^>]*>\s*Conclusion\s*<\/h2>/i,
      /<h2[^>]*>\s*En\s+résumé\s*<\/h2>/i,
      /<h2[^>]*>\s*Résumé\s*<\/h2>/i,
      /<h2[^>]*>\s*Final\s*<\/h2>/i,
    ];
    
    // Find the first matching end marker after FAQ start
    for (const endRegex of possibleEndMarkers) {
      const endMatch = processedContent.match(endRegex);
      if (endMatch && endMatch.index! > faqStartIndex) {
        faqEndIndex = endMatch.index!;
        break; // Use the first found end marker
      }
    }
    
    // Extract the FAQ section
    const faqSection = processedContent.substring(faqStartIndex, faqEndIndex);
    
    // Wrap the FAQ section with the styled container
    const wrappedFaqSection = `<div class="${styles.faqContainer}">${faqSection}</div>`;
    
    // Replace the original FAQ section with the wrapped one
    processedContent = processedContent.substring(0, faqStartIndex) + 
                       wrappedFaqSection + 
                       processedContent.substring(faqEndIndex);
  }

  return (
    <motion.section 
      ref={containerRef}
      className={styles.section}
      style={{ y }}
    >
      <div className={styles.container}>
        <div className={styles.articleWrapper}>
          {/* Table of Contents - Sticky position, next to article */}
          <TableOfContents content={article.content} />
          
          <motion.article 
            className={styles.article}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className={styles.content}>
              {/* Render article content with direct HTML image tags */}
              <div 
                dangerouslySetInnerHTML={{ __html: processedContent }}
              />
            </div>
          </motion.article>
        </div>

        <motion.div 
          className={styles.cta}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className={styles.ctaContent}>
            <h3 className={styles.ctaTitle}>Besoin d&apos;aide pour votre location ?</h3>
            <p className={styles.ctaText}>
              Notre équipe d&apos;experts est là pour vous accompagner dans le choix de votre véhicule
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



