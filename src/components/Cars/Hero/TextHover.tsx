"use client";

import React, { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import styles from './TextHover.module.scss'

gsap.registerPlugin(ScrollTrigger);

const TextHover = () => {
  const t = useTranslations('aboutPage')

  useEffect(() => {
    const textElements = gsap.utils.toArray(`.${styles.text}`) as Element[];
    const scrollTriggers: ScrollTrigger[] = [];

    textElements.forEach((text) => {
      const animation = gsap.to(text as Element, {
        backgroundSize: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: text as Element,
          start: 'center 80%',
          end: 'center 20%',
          scrub: true,
        },
      });

      if (animation.scrollTrigger) {
        scrollTriggers.push(animation.scrollTrigger);
      }
    });

    return () => {
      scrollTriggers.forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="flex flex-col justify-center items-start ">
      <h1 className={styles.text}>{t('textHoverLine1')}<span>{t('textHoverLine1Span')}</span></h1>
      <h1 className={styles.text}>{t('textHoverLine2')}<span>{t('textHoverLine2Span')}</span></h1>
      <h1 className={styles.text}>{t('textHoverLine3')}<span>{t('textHoverLine3Span')}</span></h1>
    </div>
  )
}

export default TextHover
