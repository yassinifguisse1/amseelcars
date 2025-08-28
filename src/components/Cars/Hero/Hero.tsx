import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'
import './style.css'
import TextHover from './TextHover'

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
     start: "top 50%",
     end: "bottom bottom",
     scrub: 1,
     onUpdate: (self) => {
        const scaleX = 1 + 16 * Math.pow(self.progress, 1.2);
        const scaleY = 1 + 10 * Math.pow(self.progress, 1.2);
       gsap.to(revealerRef.current, {
           scaleX,
           scaleY,
           ease: "none",
           duration: 0,
         
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
            <h2 className='uppercase text-[200px] font-bold text-white'>
                Symphonia
            </h2>
        </section>
        <section className="info">
            <div className='header-rows w-full h-[250px]'>
                <div className='header-row flex justify-start items-center'>
                    <h2 className=' flex justify-start items-center'>
                        Amssil
                    </h2>
                </div>
                <div className="header-row flex justify-end items-center">
                    <h2 className=''>
                        Car
                    </h2>
                </div>
            </div>
        </section>
        <section className="header-info" ref={headerInfoRef}>
            <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
            </p>
            <div className="header-images">
                <div className="img">
                    <img src="/images/1.jpeg" alt="img1"/>
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
            </div>
        </section>
        <section className="whitespace " ref={whitespaceRef}></section>
        <section className="pinned" ref={pinnedRef}>
            <div className="revealer " ref={revealerRef}>
                <div className="revealer-1" ref={revealer1Ref}></div>
                <div className="revealer-2" ref={revealer2Ref}></div>
            </div>
        </section>
        <section className="website-content">
            {/* <h2>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga quae, saepe doloremque dolore ducimus eveniet!
            </h2> */}
            <TextHover />
        </section>
    </div>
  )
}

export default Hero