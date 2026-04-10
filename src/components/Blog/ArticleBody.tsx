"use client";
import { motion } from "framer-motion";
import { useRef, useEffect } from "react";
import { useScroll, useTransform } from "framer-motion";
import { BlogArticle } from '@/data/blog';
import styles from "./ArticleBody.module.scss";
import TableOfContents, { processContentWithIds } from "./TableOfContents";
import { enhanceArticleBodyImages } from "@/lib/articleContentImages";

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
    const containerElement = containerRef.current;
    if (!containerElement) return;
    const handleClick = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return;
      const target = e.target.closest('a, button');
      if (!target || !containerElement.contains(target)) return;
      const hrefPart = target instanceof HTMLAnchorElement ? target.href : '';
      const ctaLabel = (target.textContent?.trim() || hrefPart || '').slice(0, 200);
      const currentUrl = new URL(window.location.href);
      const fullUrl = currentUrl.origin + currentUrl.pathname;
      let referrer = '';
      if (document.referrer) {
        try {
          const refUrl = new URL(document.referrer);
          referrer = refUrl.origin + refUrl.pathname;
        } catch {
          referrer = '';
        }
      }
      const payload = {
        path: window.location.pathname,
        source: 'blog',
        event: 'blog-cta',
        ctaLabel,
        fullUrl,
        userAgent: navigator.userAgent,
        language: navigator.language,
        referrer,
        screen: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      const url = '/api/track/whatsapp';
      const bodyStr = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        const blob = new Blob([bodyStr], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      } else {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyStr,
          keepalive: true,
        }).catch((err) => console.error('[ArticleBody] CTA tracking request failed', err));
      }
    };
    containerElement.addEventListener('click', handleClick);
    return () => containerElement.removeEventListener('click', handleClick);
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

  // Sync CRM cover alt / figcaption / data-alt into <img alt> for Google Image + a11y
  processedContent = enhanceArticleBodyImages(processedContent, article);

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



