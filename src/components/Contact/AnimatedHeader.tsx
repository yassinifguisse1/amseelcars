"use client"
import React, { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Car, Sparkles } from 'lucide-react'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

const AnimatedHeader: React.FC = () => {
  // Refs for GSAP animations
  const headerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const decorRef = useRef<HTMLDivElement>(null)
  const sparklesRef = useRef<HTMLDivElement[]>([])

  // Add sparkle ref to array
  const addSparkleRef = (el: HTMLDivElement | null) => {
    if (el && !sparklesRef.current.includes(el)) {
      sparklesRef.current.push(el)
    }
  }

  // GSAP animations setup
  useEffect(() => {
    const header = headerRef.current
    const title = titleRef.current
    const subtitle = subtitleRef.current
    const decor = decorRef.current
    const sparkles = sparklesRef.current

    if (!header || !title || !subtitle) return

    // Initial setup - hide elements
    gsap.set([title, subtitle], { opacity: 0, y: 50, scale: 0.9 })
    if (decor) gsap.set(decor, { opacity: 0, scale: 0, rotation: -45 })
    gsap.set(sparkles, { opacity: 0, scale: 0, rotation: 0 })

    // Create entrance timeline
    const tl = gsap.timeline({ delay: 0.2 })

    // Animate title with split text effect
    tl.to(title, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1,
      ease: 'power3.out'
    })
    .to(subtitle, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.5')

    // Animate decorative elements
    if (decor) {
      tl.to(decor, {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 0.8,
        ease: 'back.out(1.7)'
      }, '-=0.6')
    }

    // Animate sparkles with stagger
    if (sparkles.length) {
      tl.to(sparkles, {
        opacity: 1,
        scale: 1,
        rotation: 360,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.7)'
      }, '-=0.4')

      // Continuous sparkle animation
      sparkles.forEach((sparkle, index) => {
        gsap.to(sparkle, {
          rotation: 360,
          duration: 3 + index * 0.5,
          repeat: -1,
          ease: 'none'
        })

        // Floating animation
        gsap.to(sparkle, {
          y: -10,
          duration: 2 + index * 0.3,
          yoyo: true,
          repeat: -1,
          ease: 'power2.inOut'
        })
      })
    }

    // Parallax effect on scroll
    ScrollTrigger.create({
      trigger: header,
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress
        gsap.to(title, {
          y: progress * -50,
          opacity: 1 - progress * 0.5,
          duration: 0.3
        })
        gsap.to(subtitle, {
          y: progress * -30,
          opacity: 1 - progress * 0.7,
          duration: 0.3
        })
      }
    })

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <div 
      ref={headerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800"
    >
      {/* Background Pattern */}
      {/* <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)`
        }} />
      </div> */}

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating sparkles */}
        <div ref={addSparkleRef} className="absolute top-1/4 left-1/4 text-blue-400/30">
          <Sparkles className="w-6 h-6" />
        </div>
        <div ref={addSparkleRef} className="absolute top-1/3 right-1/4 text-purple-400/30">
          <Sparkles className="w-4 h-4" />
        </div>
        <div ref={addSparkleRef} className="absolute bottom-1/3 left-1/3 text-blue-400/20">
          <Sparkles className="w-8 h-8" />
        </div>
        <div ref={addSparkleRef} className="absolute bottom-1/4 right-1/3 text-purple-400/20">
          <Sparkles className="w-5 h-5" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Decorative Car Icon */}
        <div ref={decorRef} className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full mb-8 backdrop-blur-sm border border-white/10">
          <Car className="w-10 h-10 text-blue-400" />
        </div>

        {/* Main Title */}
        <h1 
          ref={titleRef}
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
        >
          Contact
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent ml-4">
            Us
          </span>
        </h1>

        {/* Subtitle */}
        <p 
          ref={subtitleRef}
          className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
        >
          Ready to experience the ultimate in luxury car rental? 
          <br className="hidden md:block" />
          Get in touch with our expert team and let&apos;s make your journey unforgettable.
        </p>

        {/* Scroll Indicator */}
        {/* <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full relative">
            <div className="w-1 h-2 bg-white/60 rounded-full absolute top-2 left-1/2 transform -translate-x-1/2 animate-pulse" />
          </div>
          <p className="text-white/60 text-sm mt-2">Scroll to explore</p>
        </div> */}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
    </div>
  )
}

export default AnimatedHeader
