"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useGoogleReviews } from "@/hooks/useGoogleReviews";
import { useLocale, useTranslations } from "next-intl";
import styles from "./Reviews.module.scss";

export interface Review {
  id: string;
  author: {
    name: string;
    image?: string;
  };
  rating: number;
  reviewBody: string;
  datePublished: string;
  publisher?: {
    name: string;
    url?: string;
  };
}

interface ReviewsProps {
  reviews?: Review[]; // Optional - if not provided, fetch from API
  useApi?: boolean; // Toggle between API and manual (default: true)
  /** SEO: short crawlable intro above review cards */
  introParagraph?: string;
}

/** Deterministic UTC date label — avoids SSR/client toLocaleDateString mismatches (React #418). */
function formatReviewDate(isoDate: string, locale: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
  if (!match) return isoDate;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const date = new Date(Date.UTC(y, m - 1, d));
  const tag =
    locale === "en"
      ? "en-GB"
      : locale === "es"
        ? "es-ES"
        : locale === "de"
          ? "de-DE"
          : locale === "pl"
            ? "pl-PL"
            : "fr-FR";
  try {
    return new Intl.DateTimeFormat(tag, {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(date);
  } catch {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
}

export default function Reviews({
  reviews: manualReviews,
  useApi = false,
  introParagraph,
}: ReviewsProps) {
  const t = useTranslations("reviews");
  const locale = useLocale();
  // Fetch reviews from API if enabled
  const { reviews: apiReviews, loading: apiLoading } = useGoogleReviews();
  
  const fallbackReviews = manualReviews || [];

  // Use API reviews if enabled, but fall back to manual reviews when API is empty.
  // This prevents the whole section from disappearing if `/api/reviews` fails or returns [].
  const reviews = useApi ? (apiReviews.length > 0 ? apiReviews : fallbackReviews) : fallbackReviews;
  
  // Show loading state when using API and we don't have any reviews yet.
  const isLoading =
    useApi &&
    apiLoading &&
    apiReviews.length === 0 &&
    fallbackReviews.length === 0;
  
  // Calculate average rating and count (only if reviews exist)
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  // Duplicate reviews for seamless loop
  const duplicateReviews = (reviewList: Review[]) => [...reviewList, ...reviewList];

  const renderReviewCard = (review: typeof reviews[0], key: string) => (
    <div key={key} className={styles.reviewCard}>
      <div className={styles.reviewHeader}>
        <div className={styles.authorInfo}>
          {review.author.image && (
            <img
              src={review.author.image}
              alt={review.author.name}
              className={styles.authorImage}
              loading="lazy"
            />
          )}
          <div>
            <p className={styles.authorName}>{review.author.name}</p>
            <time
              className={styles.reviewDate}
              dateTime={review.datePublished}
              suppressHydrationWarning
            >
              {formatReviewDate(review.datePublished, locale)}
            </time>
          </div>
        </div>
        <div className={styles.reviewRating}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`${styles.star} ${i < review.rating ? styles.filled : ''}`}
              fill={i < review.rating ? 'currentColor' : 'none'}
              size={16}
            />
          ))}
        </div>
      </div>
      {review.publisher && (
        <div className={styles.publisher}>
          {t("publishedOn", { publisher: review.publisher.name })}
        </div>
      )}
      <div className={styles.reviewBody}>
        <Quote className={styles.quoteIcon} />
        <p>{review.reviewBody}</p>
      </div>
    </div>
  );

  // Show loading state
  if (isLoading) {
    return (
      <section className={styles.reviewsSection}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>{t("title")}</h2>
            {introParagraph && (
              <p className={styles.introLead}>{introParagraph}</p>
            )}
            <p>{t("loading")}</p>
          </div>
        </div>
      </section>
    );
  }

  // Show empty state if no reviews
  if (reviews.length === 0) {
    return null; // Don't show section if no reviews
  }

  return (
    <section className={styles.reviewsSection}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={styles.title}>{t("title")}</h2>
          {introParagraph && (
            <p className={styles.introLead}>{introParagraph}</p>
          )}
          <div className={styles.ratingSummary}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`${styles.star} ${i < Math.round(averageRating) ? styles.filled : ''}`}
                  fill={i < Math.round(averageRating) ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className={styles.ratingValue} suppressHydrationWarning>
              {averageRating.toFixed(1)}
            </span>
          </div>
        </motion.div>

        <div className={styles.reviewsGrid}>
          <motion.div
            className={styles.scrollingRow}
            animate={{
              x: [0, -(reviews.length * 366)],
            }}
            transition={{
              duration: reviews.length * 4,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
              repeatDelay: 0,
            }}
            style={{
              animationPlayState: "running",
            }}
          >
            {duplicateReviews(reviews).map((review, idx) => 
              renderReviewCard(review, `${review.id}-${idx}`)
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
