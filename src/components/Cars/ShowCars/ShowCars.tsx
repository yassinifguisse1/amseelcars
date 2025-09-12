"use client"
import React, { useEffect, useRef, useCallback, useState } from 'react'
import ReactLenis from 'lenis/react'
import Image from 'next/image'
import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger)

const ShowCars = () => {
  const mainRef = useRef<HTMLElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [imageLoadCount, setImageLoadCount] = useState(0)
  const totalImages = 6 // 3 rows × 2 images per row

  // Image preloading and lazy loading
  const handleImageLoad = useCallback(() => {
    setImageLoadCount(prev => {
      const newCount = prev + 1
      if (newCount === totalImages) {
        setIsLoaded(true)
      }
      return newCount
    })
  }, [totalImages])

  useEffect(() => {
    if (!isLoaded) return

    const scrollTriggerSettings = {
      trigger: mainRef.current,
      start: "top 25%",
      toggleActions: "play reverse play reverse",
    }

    // Optimized animation values
    const leftXValues = [-800, -900, -400]
    const rightXValues = [800, 900, 400]
    const leftRotationValues = [-30, -20, -35]
    const rightRotationValues = [30, -20, -35]
    const yValues = [100, -150, -400]

    // Create ScrollTrigger instances with better performance
    const scrollTriggers: ScrollTrigger[] = []

    gsap.utils.toArray(".row").forEach((row, index) => {
      const cartLeft = (row as Element).querySelector(".card-left") as HTMLElement
      const cartRight = (row as Element).querySelector(".card-right") as HTMLElement

      if (cartLeft && cartRight) {
        // Use GSAP's built-in transform properties for better performance
        const leftAnimation = gsap.to(cartLeft, {
          x: leftXValues[index],
          y: yValues[index],
          rotation: leftRotationValues[index],
          ease: "none",
          scrollTrigger: {
            trigger: mainRef.current,
            start: "top top",
            end: "100% bottom",
            scrub: 1, // Smoother scrub
            onUpdate: () => {
              // Use will-change for better performance
              cartLeft.style.willChange = "transform"
              cartRight.style.willChange = "transform"
            }
          }
        })

        const rightAnimation = gsap.to(cartRight, {
          x: rightXValues[index],
          y: yValues[index],
          rotation: rightRotationValues[index],
          ease: "none",
          scrollTrigger: {
            trigger: mainRef.current,
            start: "top top",
            end: "100% bottom",
            scrub: 1,
          }
        })

        scrollTriggers.push(leftAnimation.scrollTrigger!, rightAnimation.scrollTrigger!)
      }
    })

    // Content animations
    const logoAnimation = gsap.to(".logo", {
      scale: 1,
      duration: 0.5,
      ease: "power1.inOut",
      scrollTrigger: scrollTriggerSettings,
    })

    const lineAnimation = gsap.to(".line p", {
      y: 0,
      stagger: 0.1, // Fixed typo: was "stragger"
      duration: 0.5,
      ease: "power1.inOut",
      scrollTrigger: scrollTriggerSettings,
    })

    const buttonAnimation = gsap.to("button", {
      y: 0,
      opacity: 1,
      delay: 0.25,
      duration: 0.5,
      ease: "power1.inOut",
      scrollTrigger: scrollTriggerSettings,
    })

    scrollTriggers.push(
      logoAnimation.scrollTrigger!,
      lineAnimation.scrollTrigger!,
      buttonAnimation.scrollTrigger!
    )

    return () => {
      // Clean up all ScrollTrigger instances
      scrollTriggers.forEach(trigger => trigger.kill())
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [isLoaded])

  const generateRows = () => {
    const rows = []
    for(let i = 1; i <= 3; i++){
      rows.push(
        <div className="row" key={i}>
            
          <div className="card card-left">
          <Link href={`/cars`}>
            <Image 
              src={`/images/img-${2 * i - 1}.webp`} 
              alt={`Car image ${2 * i - 1}`}
              width={600}
              height={600}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="w-full h-full object-cover"
              loading="lazy"
              onLoad={handleImageLoad}
            //   priority={i === 1} // Only first image gets priority
            />
             </Link>
          </div>
         
          
          <div className="card card-right ">
          <Link href={`/cars`}>
            <Image 
              src={`/images/img-${2 * i}.webp`} 
              alt={`Car image ${2 * i}`}
              width={600}
              height={600}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="w-full h-full object-cover "
              loading="lazy"
              onLoad={handleImageLoad}
            />
             </Link>
          </div>
          
        </div>
      )
    }
    return rows
  }

  return (
    <>
      <ReactLenis root>
        <section className="main" ref={mainRef}>
          <div className="main-content">
            {/* Loading indicator */}
            {!isLoaded && (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Loading car images...</p>
                <p className="text-sm text-gray-500">
                  {imageLoadCount}/{totalImages} images loaded
                </p>
              </div>
            )}
          </div>
          {generateRows()}
        </section>
      </ReactLenis>
    </>
  )
}

export default ShowCars