"use client";

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'
import './style.css'
import TextHover from './TextHover'
import OurBrandsGrid from '@/components/about/Hero/OurBrandsGrid'
import { sampleBrands } from '@/data/brands'
import SplitingText from '@/components/about/SplitingText/SplitingText'
import SplitContentSection from '@/components/about/SplitContentSection/SplitContentSection'
import { useTranslations } from 'next-intl'

const Hero = () => {
  const t = useTranslations('aboutPage')
  const revealerRef = useRef<HTMLDivElement>(null)
  const revealer1Ref = useRef<HTMLDivElement>(null)
  const revealer2Ref = useRef<HTMLDivElement>(null)
  const pinnedRef = useRef<HTMLElement>(null)
  const headerInfoRef = useRef<HTMLElement>(null)
  const whitespaceRef = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const lenis = new Lenis()

    const lenisRAF = (time: number) => {
      lenis.raf(time * 1000)
    }

    lenis.on("scroll", ScrollTrigger.update)
    gsap.ticker.add(lenisRAF)
    gsap.ticker.lagSmoothing(0)

    ScrollTrigger.create({
      trigger: pinnedRef.current,
      start: "top top",
      endTrigger: whitespaceRef.current,
      end: "bottom top",
      pin: true,
      pinSpacing: false,
    })

    ScrollTrigger.create({
      trigger: headerInfoRef.current,
      start: "top top",
      endTrigger: whitespaceRef.current,
      end: "bottom top",
      pin: true,
      pinSpacing: false,
    })

    ScrollTrigger.create({
      trigger: pinnedRef.current,
      start: "top top",
      endTrigger: headerInfoRef.current,
      end: "bottom bottom",
      onUpdate: (self) => {
        const rotation = self.progress * 360
        gsap.to(revealerRef.current, { rotation })
      }
    })

    ScrollTrigger.create({
      trigger: pinnedRef.current,
      start: "top top",
      endTrigger: headerInfoRef.current,
      end: "bottom bottom",
      onUpdate: (self) => {
        const progress = self.progress
        const clipPath = `polygon(
          ${30 - 30 * progress}% ${0 + 0 * progress}%, 
          ${70 + 30 * progress}% ${0 + 0 * progress}%,
          ${70 + 30 * progress}% ${100 - 0 * progress}%,
          ${30 - 30 * progress}% ${100 - 0 * progress}%
        )`

        gsap.to([revealer1Ref.current, revealer2Ref.current], {
          clipPath: clipPath,
          ease: "none",
          duration: 0,
        })
      }
    })

    ScrollTrigger.create({
      trigger: headerInfoRef.current,
      start: "top top",
      end: "bottom 50%",
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress
        const left = 35 + 15 * progress
        gsap.to(revealerRef.current, {
          left: `${left}%`,
          ease: "none",
          duration: 0,
        })
      }
    })

    ScrollTrigger.create({
      trigger: whitespaceRef.current,
      start: "top 60%",
      end: "+=400",
      scrub: 0.2,
      onUpdate: (self) => {
        const scaleX = 1 + 19 * Math.pow(self.progress, 0.75);
        const scaleY = 1 + 15 * Math.pow(self.progress, 0.75);
        gsap.set(revealerRef.current, {
          transformOrigin: "50% 50%",
          scaleX,
          scaleY,
        })
      }
    })

    return () => {
      lenis.off("scroll", ScrollTrigger.update)
      gsap.ticker.remove(lenisRAF)
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      lenis.destroy()
      gsap.ticker.lagSmoothing(500, 33)
      ScrollTrigger.refresh()
    }
  }, [])

  return (
    <div>
        <section className="hero">
            <video
                className="hero-video"
                autoPlay
                muted
                loop
                playsInline
            >
                <source src="/video/cardri.mp4" type="video/mp4" />
                {t('videoNoSupport')}
            </video>
        </section>
        <SplitContentSection
                image={{
                    src: "/images/amseelcars-logo-apropos.jpg",
                    alt: t('introImageAlt')
                }}
                content={{
                    title: t('introTitle'),
                    paragraphs: [
                        t('introP1'),
                        t('introP2'),
                        t('introP3'),
                        t('introP4'),
                    ]
                }}
                backgroundColor="#000000"
                textColor="#ffffff"
            />

            <SplitContentSection
                image={{
                    src: "/images/banner-5.jpg",
                    alt: t('fleetImageAlt')
                }}
                content={{
                    title: t('fleetTitle'),
                    paragraphs: [
                        t('fleetP1'),
                        t('fleetP2'),
                        t('fleetP3'),
                    ]
                }}
                backgroundColor="#000000"
                textColor="#ffffff"
            />

        <section className="info">
            <div className='header-rows w-full'>
                <div className='header-row flex justify-start items-center'>
                    <h2 className='flex justify-start items-center'>
                        {t('brandWordAmseel')}
                    </h2>
                </div>
                <div className="header-row flex justify-end items-center">
                    <h2>
                        {t('brandWordCars')}
                    </h2>
                </div>
            </div>
        </section>
        <section className="header-info" ref={headerInfoRef}>
            <p>
            {t('headerInfo')}
            </p>

        </section>
        <section className="whitespace " ref={whitespaceRef}></section>
        <section className="pinned" ref={pinnedRef}>
            <div className="revealer " ref={revealerRef}>
                <div className="revealer-1" ref={revealer1Ref}></div>
                <div className="revealer-2" ref={revealer2Ref}></div>
            </div>
        </section>
        <section className="website-content">
            <TextHover />
            <OurBrandsGrid
              brands={sampleBrands}
              heading={t('brandsHeading')}
              heading2={t('brandsHeading2')}
            />
            <SplitingText />
        </section>
    </div>
  )
}

export default Hero
