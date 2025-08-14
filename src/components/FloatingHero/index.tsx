'use client'
import Image from 'next/image'
import styles from './styles.module.scss'
import { motion, type Variants, cubicBezier, useScroll, useTransform } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

const float: Variants = {
  initial: { y: 0 },
  animate: {
    y: [0, -8, 0],
    transition: { duration: 4, repeat: Infinity, repeatType: 'mirror', ease: cubicBezier(0.42, 0, 0.58, 1) }
  }
}

export default function FloatingHero() {
  const containerRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] })
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 4])

  // Move the first tile toward exact center by the end of the sticky scroll
  const [vw, setVw] = useState(0)
  const [vh, setVh] = useState(0)
  useEffect(() => {
    const onResize = () => { setVw(window.innerWidth); setVh(window.innerHeight) }
    onResize();
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const initialLeftPx = vw * 0.08
  const initialTopPx  = vh * 0.22
  const baseW = 300
  const baseH = 220
  const endScale = 4
  const targetX = useTransform(scrollYProgress, [0, 1], [0, (vw / 2) - (initialLeftPx + (baseW * endScale) / 2)])
  const targetY = useTransform(scrollYProgress, [0, 1], [0, (vh / 2) - (initialTopPx + (baseH * endScale) / 2)])

  return (
    <section className={styles.hero} ref={containerRef}>
      <div className={styles.sticky}>
        {/* Floating tiles */}
        <motion.div variants={float} initial="initial" animate="animate" style={{ scale: heroScale, x: targetX, y: targetY }} className={`${styles.tile} ${styles.t1}`}>
          <Image src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop" alt="tile" fill priority sizes="(max-width: 768px) 40vw, 20vw" />
        </motion.div>
        <motion.div variants={float} initial="initial" animate="animate" className={`${styles.tile} ${styles.t2}`}>
          <Image src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=800&auto=format&fit=crop" alt="tile" fill sizes="(max-width: 768px) 40vw, 20vw" />
        </motion.div>
        <motion.div variants={float} initial="initial" animate="animate" className={`${styles.tile} ${styles.t3}`}>
          <Image src="https://images.unsplash.com/photo-1538688423619-a81d3f23454b?q=80&w=800&auto=format&fit=crop" alt="tile" fill sizes="(max-width: 768px) 40vw, 20vw" />
        </motion.div>
        <motion.div variants={float} initial="initial" animate="animate" className={`${styles.tile} ${styles.t4}`}>
          <Image src="https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=800&auto=format&fit=crop" alt="tile" fill sizes="(max-width: 768px) 40vw, 20vw" />
        </motion.div>
        <motion.div variants={float} initial="initial" animate="animate" className={`${styles.tile} ${styles.t5}`}>
          <Image src="https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=800&auto=format&fit=crop" alt="tile" fill sizes="(max-width: 768px) 40vw, 20vw" />
        </motion.div>
        <motion.div variants={float} initial="initial" animate="animate" className={`${styles.tile} ${styles.t6}`}>
          <Image src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop" alt="tile" fill sizes="(max-width: 768px) 40vw, 20vw" />
        </motion.div>

        {/* Center copy */}
        <div className={styles.copy}>
          <h2>Money can’t buy you class,<br/>but it can buy you a vacation.</h2>
          <p>Check in to the iconic hotels and resorts featured on The Real Housewives.</p>
        </div>

        {/* Giant word overlapping bottom */}
        <div className={styles.giant}>The Real Hotels</div>
      </div>
    </section>
  )
} 