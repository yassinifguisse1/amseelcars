"use client"
import React, { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'

/**
 * Hero video: defer loading until the section is near the viewport to improve LCP/INP on /cars.
 */
const HeroVideo = () => {
  const t = useTranslations('carsPage.hero')
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

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

  useEffect(() => {
    setIsVideoReady(false)
  }, [isMobile, shouldLoadVideo])

    if (!isClient) {
      return (
        <section ref={sectionRef} className="hero w-full">
          <div
            className="hero-video w-full h-[80svh] bg-black bg-cover bg-center"
            style={{ backgroundImage: 'linear-gradient(135deg, #090909, #1a1a1a)' }}
            aria-hidden
          />
        </section>
      )
  }

  return (
    <section ref={sectionRef} className="hero relative">
      {shouldLoadVideo ? (
        <>
          <video
            ref={videoRef}
            className="hero-video w-full h-[80svh] object-cover"
            muted
            loop
            playsInline
            preload="auto"
            fetchPriority="low"
            key={isMobile ? 'mobile' : 'desktop'}
            onLoadedData={() => {
              setIsVideoReady(true)
              window.setTimeout(() => {
                void videoRef.current?.play()
              }, 140)
            }}
          >
            <source
              src={isMobile ? '/video/Mobile-video.mp4' : '/video/HeroVideo.mp4'}
              type="video/mp4"
            />
            {t('videoNotSupported')}
          </video>
          {!isVideoReady ? (
            <div
              className="pointer-events-none absolute inset-0 hero-video w-full h-[80svh] bg-black"
              aria-hidden
            />
          ) : null}
        </>
      ) : (
        <div
          className="hero-video w-full h-[80svh] bg-black bg-cover bg-center"
          style={{ backgroundImage: 'linear-gradient(135deg, #090909, #1a1a1a)' }}
          role="img"
          aria-label={t('posterAria')}
        />
      )}
    </section>
  )
}

export default HeroVideo
