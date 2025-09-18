'use client'
import Image from 'next/image';
import styles from './style.module.scss';
import { useTransform, motion, useScroll, MotionValue } from 'framer-motion';
import { useRef } from 'react';

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
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'start start']
  })

  const imageScale = useTransform(scrollYProgress, [0, 1], [2, 1])
  const scale = useTransform(progress, range, [1, targetScale]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
 
  return (
    <div ref={container} className={styles.cardContainer}>
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
                  src={`/images/${src}`}
                  alt="image" 
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