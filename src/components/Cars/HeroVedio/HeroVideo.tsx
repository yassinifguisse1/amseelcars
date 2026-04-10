"use client"
import React, { useState, useEffect, useRef } from 'react'

/**
 * Hero video: defer loading until the section is near the viewport to improve LCP/INP on /cars.
 */
const HeroVideo = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setIsClient(true)

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 868)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!isClient) return
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoadVideo(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px 0px', threshold: 0.01 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [isClient])

  if (!isClient) {
    return (
      <section ref={sectionRef} className="hero w-full">
        <div
          className="hero-video w-full h-[80svh] bg-black bg-cover bg-center"
          style={{ backgroundImage: 'url(/og/amseel-car-logo.png)' }}
          aria-hidden
        />
      </section>
    )
  }

  return (
    <section ref={sectionRef} className="hero">
      {shouldLoadVideo ? (
        <video
          className="hero-video w-full h-[80svh] object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/og/amseel-car-logo.png"
          fetchPriority="low"
          key={isMobile ? 'mobile' : 'desktop'}
        >
          <source
            src={isMobile ? '/video/Mobile-video.mp4' : '/video/HeroVideo.mp4'}
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div
          className="hero-video w-full h-[80svh] bg-black bg-cover bg-center"
          style={{ backgroundImage: 'url(/og/amseel-car-logo.png)' }}
          role="img"
          aria-label="AmseelCars fleet preview"
        />
      )}
    </section>
  )
}

export default HeroVideo
