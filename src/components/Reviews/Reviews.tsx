"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
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
  reviews: Review[];
}

export default function Reviews({ reviews }: ReviewsProps) {
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const ratingCount = reviews.length;

  // Distribute reviews into 3 columns
  const column1: typeof reviews = [];
  const column2: typeof reviews = [];
  const column3: typeof reviews = [];

  reviews.forEach((review, index) => {
    if (index % 3 === 0) {
      column1.push(review);
    } else if (index % 3 === 1) {
      column2.push(review);
    } else {
      column3.push(review);
    }
  });

  const columns = [column1, column2, column3];

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

        {/* Desktop: 3 columns with vertical scrolling */}
        <div className={styles.reviewsGrid}>
          {columns.map((column, columnIndex) => {
            const duplicatedColumn = duplicateReviews(column);
            const isReverse = columnIndex === 1; // Column 2 scrolls top to bottom
            
            // Calculate scroll distance: approximately half the content height for seamless loop
            // Each card is roughly 300px + gap, so for duplicated content, scroll by half
            const scrollDistance = column.length * 320; // Approximate: card height + gap
            
            return (
              <div key={columnIndex} className={styles.reviewColumn}>
                <motion.div
                  className={styles.scrollingColumn}
                  animate={{
                    y: isReverse ? [0, -scrollDistance] : [0, scrollDistance],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "linear",
                    repeatDelay: 0,
                  }}
                  style={{
                    animationPlayState: "running",
                  }}
                >
                  {duplicatedColumn.map((review, idx) => 
                    renderReviewCard(review, `${review.id}-${idx}`)
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Mobile: Single row with horizontal scrolling */}
        <div className={styles.reviewsGridMobile}>
          <motion.div
            className={styles.scrollingRow}
            animate={{
              x: [0, -50],
            }}
            transition={{
              duration: 20,
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
              renderReviewCard(review, `mobile-${review.id}-${idx}`)
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

