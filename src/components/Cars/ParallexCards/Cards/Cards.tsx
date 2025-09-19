'use client'
import Image from 'next/image';
import styles from './style.module.scss';
import { useTransform, motion, useScroll, MotionValue } from 'framer-motion';
import { useRef, useState } from 'react';

// TypeScript interfaces for Card component props
interface CardProps {
  i: number;
  title: string;
  description: string;
  src: string;
  url: string;
  color: string;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}

const Card = ({i, title, description, src, url, color, progress, range, targetScale}: CardProps) => {
  const container = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'start start']
  })

  const imageScale = useTransform(scrollYProgress, [0, 1], [2, 1])
  const scale = useTransform(progress, range, [1, targetScale]);
  
  // Fallback image if the specified one doesn't exist
  const getImageSrc = (imageSrc: string) => {
    if (imageError) {
      // Use a guaranteed fallback
      return `/images/img-${(i % 5) + 1}.webp`;
    }
    return `/images/${imageSrc}`;
  };
 
  return (
    <div ref={container} className={`${styles.cardContainer} cardContainer`} data-card-index={i}>
      <div 
        style={{
          top:`calc(-5vh + ${i * 25}px)`,
          backgroundColor: color, // Use the card's own color
        }} 
        className={styles.card}
      >
        <motion.div
          style={{
            scale,
          }}
          className={styles.cardContent}
        >
          <h2>{title}</h2>
          <div className={styles.body}>
            <div className={styles.description}>
              <p>{description}</p>
            </div>

            <div className={styles.imageContainer}>
              <motion.div
                className={styles.inner}
                style={{scale: imageScale}}
              >
                <Image
                  fill
                  src={getImageSrc(src)}
                  alt={title}
                  priority={i < 2} // Prioritize first 2 images
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onLoad={() => setImageLoaded(true)}
                  onError={(e) => {
                    console.error(`Failed to load image: /images/${src}`);
                    setImageError(true);
                  }}
                  style={{
                    opacity: imageLoaded ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                  }}
                />
              </motion.div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Card