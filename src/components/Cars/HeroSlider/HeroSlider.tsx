"use client"

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './HeroSlider.module.scss'

const HeroSlider = () => {
  const heroRef = useRef<HTMLDivElement>(null)
  const slidesRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)

  // Car images array
  const carImages = [
    '/images/1.jpeg',
    '/images/2.jpeg', 
    '/images/3.jpg',
    '/images/4.jpg',
    '/images/5.jpg',
    '/images/6.jpg',
    '/images/7.jpg',
    '/images/8.jpg'
  ]

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    if (!slidesRef.current || !titleRef.current || !heroRef.current) return

    const slides = slidesRef.current.children
    const totalSlides = slides.length

    // Set initial positions
    gsap.set(slides, { 
      xPercent: (i) => i * 100,
      opacity: (i) => i === 0 ? 1 : 0
    })

    // Infinite loop animation
    const tl = gsap.timeline({ repeat: -1 })
    
    for (let i = 0; i < totalSlides; i++) {
      const nextIndex = (i + 1) % totalSlides
      
      tl.to(slides[i], {
        xPercent: -100,
        opacity: 0,
        duration: 1,
        ease: "power2.inOut"
      })
      .to(slides[nextIndex], {
        xPercent: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.inOut"
      }, "-=1")
      .to({}, { duration: 2 }) // Hold for 2 seconds
    }

    // Title animation
    gsap.fromTo(titleRef.current, 
      { 
        y: 100, 
        opacity: 0 
      },
      {
        y: 0,
        opacity: 1,
        duration: 1.5,
        ease: "power3.out",
        delay: 0.5
      }
    )

    // ScrollTrigger to transition to next section
    ScrollTrigger.create({
      trigger: heroRef.current,
      start: "top top",
      end: "bottom top",
      pin: true,
      pinSpacing: false,
      onUpdate: (self) => {
        const progress = self.progress
        gsap.to(heroRef.current, {
          scale: 1 + progress * 0.1,
          filter: `blur(${progress * 5}px)`,
          duration: 0,
          ease: "none"
        })
      }
    })

    return () => {
      tl.kill()
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <section ref={heroRef} className={styles.heroSlider}>
      <div ref={slidesRef} className={styles.slidesContainer}>
        {carImages.map((image, index) => (
          <div key={index} className={styles.slide}>
            <img 
              src={image} 
              alt={`Luxury car ${index + 1}`}
              className={styles.slideImage}
            />
            <div className={styles.slideOverlay} />
          </div>
        ))}
      </div>
      
      <div ref={titleRef} className={styles.heroContent}>
        <h1 className={styles.heroTitle}>
          <span className={styles.titleLine}>Luxury</span>
          <span className={styles.titleLine}>Car Rental</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Experience the finest vehicles in Morocco
        </p>
        <div className={styles.scrollIndicator}>
          <span>Scroll to explore</span>
          <div className={styles.scrollLine}></div>
        </div>
      </div>
    </section>
  )
}

export default HeroSlider 