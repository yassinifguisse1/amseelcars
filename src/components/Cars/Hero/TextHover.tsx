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
    <div className="flex flex-col justify-center items-start ">
      <h1 className={styles.text}>LOUEZ & PARTEZ<span>AMSEEL CAR</span></h1>
      <h1 className={styles.text}>RETRAIT RAPIDE<span>AÉROPORT & VILLE</span></h1>
      <h1 className={styles.text}>RÉSERVATION<span>EN 2 MINUTES</span></h1>


     
    </div>
  )
}

export default TextHover
