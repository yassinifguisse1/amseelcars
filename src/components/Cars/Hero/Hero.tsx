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

const Hero = () => {
  const revealerRef = useRef<HTMLDivElement>(null)
  const revealer1Ref = useRef<HTMLDivElement>(null)
  const revealer2Ref = useRef<HTMLDivElement>(null)
  const pinnedRef = useRef<HTMLElement>(null)
  const headerInfoRef = useRef<HTMLElement>(null)
  const whitespaceRef = useRef<HTMLElement>(null)
  

  useEffect(() => {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger)

    // Initialize Lenis smooth scroll
    const lenis = new Lenis()

    lenis.on("scroll", ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)

    // Pin the "pinned" section
    ScrollTrigger.create({
      trigger: pinnedRef.current,
      start: "top top",
      endTrigger: whitespaceRef.current,
      end: "bottom top",
      pin: true,
      pinSpacing: false,
    })

    // Pin the "header-info" section
    ScrollTrigger.create({
      trigger: headerInfoRef.current,
      start: "top top",
      endTrigger: whitespaceRef.current,
      end: "bottom top",
      pin: true,
      pinSpacing: false,
    })

    // Rotate revealer based on scroll progress
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

    // Animate clip-path of revealer elements
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

    // Move revealer left position
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

       // Scale revealer
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
            //    ease: "none",
            //    duration: 0,
         
       })
     }
   })

    // Cleanup function
    return () => {
      lenis.destroy()
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000)
      })
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
                Your browser does not support the video tag.
            </video>
            {/* <h2 className='uppercase font-bold text-white'>
                Symphonia
            </h2> */}
        </section>
        <section className="info">
            <div className='header-rows w-full'>
                <div className='header-row flex justify-start items-center'>
                    <h2 className='flex justify-start items-center'>
                        Amsseel
                    </h2>
                </div>
                <div className="header-row flex justify-end items-center">
                    <h2>
                        Cars
                    </h2>
                </div>
            </div>
        </section>
        <section className="header-info" ref={headerInfoRef}>
            <p >
            Amceel Car : réservation rapide, retrait aéroport/centre-ville, prix transparents et assistance 24/7 pour voyager partout au Maroc.
            </p>
            {/* <div className="header-images">
                <div className="img">
                    <img src="/images/clio 5 blanche manuel diesel 2024.webp" alt="img1"/>
                </div>
                <div className="img">
                    <img src="/images/2.jpeg" alt="img2"/>
                </div>
                <div className="img">
                    <img src="/images/3.jpg" alt="img3"/>
                </div>
                <div className="img">
                    <img src="/images/4.jpg" alt="img4"/>
                </div>
            </div> */}
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
            <OurBrandsGrid brands={sampleBrands} />
            <SplitingText />
            
           
            <SplitContentSection
                image={{
                    src: "/images/amseelcars-logo-apropos.jpg",
                    alt: "Luxury car interior detail"
                }}
                content={{
                    title: "About Amseel Cars",
                    paragraphs: [
                        "At Amseel Cars, we don't just provide transportation - we craft experiences. Driven by passion for automotive excellence, we work at the edge of luxury - pushing the boundaries of premium car rental services.",
                        "We're not here to offer ordinary rides. We're here to create journeys that captivate you from start to finish. That's why we've curated an exceptional fleet, served thousands of satisfied customers, and established partnerships with premium brands across Morocco.",
                        "Amseel Cars is where luxury meets reliability. We're talking premium vehicles, professional service, and unforgettable experiences. We don't just meet expectations, we exceed them - every. single. time.",
                        "We're bringing automotive excellence to Agadir and beyond. Every vehicle, every service, meticulously maintained, because ordinary won't cut it. We're here to make your journey exceptional. At Amseel Cars, we don't just move people - we're crafting memories. That's what we do."
                    ]
                }}
                backgroundColor="#000000"
                textColor="#ffffff"
            />
            
            <SplitContentSection
                image={{
                    src: "/images/banner-5.jpg",
                    alt: "Premium sports car"
                }}
                content={{
                    title: "Premium Fleet Experience",
                    paragraphs: [
                        "Experience luxury redefined with our carefully curated fleet of premium vehicles. Each car in our collection represents the pinnacle of automotive excellence, combining cutting-edge technology with timeless design.",
                        "From airport transfers to special occasions, our vehicles are meticulously maintained to ensure your journey is as memorable as your destination. We believe in providing not just transportation, but an experience that elevates every moment.",
                        "Our commitment to excellence extends beyond our vehicles to every aspect of our service. Professional drivers, seamless booking experience, and 24/7 customer support ensure your peace of mind throughout your rental period."
                    ]
                }}
                backgroundColor="#000000"
                textColor="#ffffff"
            />
        
        </section>
    </div>
  )
}

export default Hero