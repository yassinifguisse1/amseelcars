import Link from 'next/link'
import React, { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './TextHover.module.scss'

gsap.registerPlugin(ScrollTrigger);

const TextHover = () => {
  useEffect(() => {
    const textElements = gsap.utils.toArray(`.${styles.text}`) as Element[];

    textElements.forEach((text) => {
      gsap.to(text as Element, {
        backgroundSize: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: text as Element,
          start: 'center 80%',
          end: 'center 20%',
          scrub: true,
        },
      });
    });
  }, []);

  return (
    <div className="flex flex-col justify-center items-start h-screen">
      <h1 className={styles.text}>TEXT EFFECT<span>WOAH</span></h1>
      <h1 className={styles.text}>GSAP<span>AND CLIPPING</span></h1>
      <h1 className={styles.text}>CRAZYYY<span>CRAZYYY</span></h1>
      <h1 className={styles.text}>HOVER ON ME
        <span><Link href="https://stacksorted.com/text-effects/minh-pham" target="_blank">SOURCE</Link></span>
      </h1>
      <h1 className={styles.text}>LIKE THIS?
        <span><Link href="https://twitter.com/juxtopposed" target="_blank">LET&apos;S CONNECT</Link></span>
      </h1>
    </div>
  )
}

export default TextHover
