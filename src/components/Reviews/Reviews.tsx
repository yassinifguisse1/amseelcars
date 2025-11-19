"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useGoogleReviews } from "@/hooks/useGoogleReviews";
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
}

export default function Reviews({ reviews: manualReviews, useApi = false }: ReviewsProps) {
  // Fetch reviews from API if enabled
  const { reviews: apiReviews, loading: apiLoading } = useGoogleReviews();
  
  // Use API reviews if enabled, otherwise use manual reviews
  // When useApi=true, only show API reviews (no fallback to manual)
  const reviews = useApi 
    ? apiReviews 
    : (manualReviews || []);
  
  // Show loading state when using API
  const isLoading = useApi && apiLoading;
  
  // Calculate average rating and count (only if reviews exist)
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;
  const ratingCount = reviews.length;

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
            <h3 className={styles.authorName}>{review.author.name}</h3>
            <time className={styles.reviewDate} dateTime={review.datePublished}>
              {new Date(review.datePublished).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
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
          Publié sur {review.publisher.name}
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
            <h2 className={styles.title}>Ce que nos clients disent</h2>
            <p>Chargement des avis...</p>
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
          <h2 className={styles.title}>Ce que nos clients disent</h2>
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
            <span className={styles.ratingValue}>{averageRating.toFixed(1)}</span>
            <span className={styles.ratingCount}>({ratingCount} avis)</span>
          </div>
        </motion.div>

        {/* Single row with horizontal scrolling for both desktop and mobile */}
        <div className={styles.reviewsGrid}>
          <motion.div
            className={styles.scrollingRow}
            animate={{
              // Calculate scroll distance: approximately half the content width for seamless loop
              // Each card is ~350px + 16px gap = ~366px, so for duplicated content, scroll by half
              x: [0, -(reviews.length * 366)],
            }}
            transition={{
              duration: reviews.length * 4, // Slower animation - increased from 2 to 4
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

