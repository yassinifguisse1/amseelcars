"use client";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import styles from "./TableOfContents.module.scss";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

// Function to create a slug from text
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

// Function to extract H2 headings from HTML content
function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gi;
  let match;

  while ((match = h2Regex.exec(content)) !== null) {
    const text = match[1]
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
      .trim();
    
    if (text) {
      headings.push({
        id: createSlug(text),
        text: text,
        level: 2,
      });
    }
  }

  return headings;
}

// Function to add IDs to H2 headings in HTML content
function addIdsToHeadings(content: string, headings: Heading[]): string {
  let processedContent = content;
  
  headings.forEach((heading) => {
    // Create a regex that matches h2 tags containing the heading text
    const escapedText = heading.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Match: <h2>content with heading text</h2> or <h2 attributes>content</h2>
    const h2Regex = new RegExp(
      `(<h2)([^>]*>)([^<]*${escapedText}[^<]*)(<\/h2>)`,
      "gi"
    );
    
    processedContent = processedContent.replace(
      h2Regex,
      (match, tagStart, attributesAndClose, tagContent, closeTag) => {
        // Check if ID already exists
        if (attributesAndClose.includes(`id="`) || attributesAndClose.includes(`id='`)) {
          return match;
        }
        // Add ID to the h2 tag - replace the > with id="..." >
        const attributes = attributesAndClose.slice(0, -1); // Remove the closing >
        return `${tagStart}${attributes} id="${heading.id}">${tagContent}${closeTag}`;
      }
    );
  });

  return processedContent;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const tocRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const extractedHeadings = extractHeadings(content);
    setHeadings(extractedHeadings);
  }, [content]);

  // Handle smooth scroll to section
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Offset for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Update URL hash without triggering scroll
      window.history.pushState(null, "", `#${id}`);
      setActiveId(id);
    }
  };

  // Track active section on scroll
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Adjusted offset for better tracking

      // Find the current active heading
      let currentActiveId = "";
      
      for (let i = 0; i < headings.length; i++) {
        const heading = headings[i];
        const element = document.getElementById(heading.id);
        if (element) {
          const elementTop = element.offsetTop;
          const elementBottom = elementTop + element.offsetHeight;
          
          // Check if the element is currently in the viewport area
          if (scrollPosition >= elementTop - 100 && scrollPosition < elementBottom + 100) {
            currentActiveId = heading.id;
          }
          // If we're past this element but before the next one, this is active
          else if (scrollPosition >= elementTop && (i === headings.length - 1 || scrollPosition < (document.getElementById(headings[i + 1].id)?.offsetTop || Infinity))) {
            currentActiveId = heading.id;
          }
        }
      }
      
      if (currentActiveId && currentActiveId !== activeId) {
        setActiveId(currentActiveId);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check on mount

    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings, activeId]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <motion.div
      ref={tocRef}
      className={styles.tableOfContents}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className={styles.title}>Table des matières</h3>
      <nav className={styles.nav}>
        <ul className={styles.list}>
          {headings.map((heading) => (
            <li key={heading.id} className={styles.item}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                className={`${styles.link} ${
                  activeId === heading.id ? styles.active : ""
                }`}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </motion.div>
  );
}

// Export function to add IDs to content
export function processContentWithIds(content: string): string {
  const headings = extractHeadings(content);
  return addIdsToHeadings(content, headings);
}

