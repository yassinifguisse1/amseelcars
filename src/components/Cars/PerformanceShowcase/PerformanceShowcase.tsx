"use client"
import React, { useEffect, useRef, useState, useMemo } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

interface PerformanceMetric {
  id: string
  title: string
  value: string
  unit: string
  description: string
  icon: string
  color: string
  animatedValue?: number
}

const PerformanceShowcase: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])
  const progressRef = useRef<HTMLDivElement>(null)
  const backgroundRef = useRef<HTMLDivElement>(null)
  
  // Performance metrics data - replace with actual car data from your cars.ts
  const performanceMetrics: PerformanceMetric[] = useMemo(() => [
    {
      id: 'acceleration',
      title: 'Lightning Fast',
      value: '2.8',
      unit: 'seconds',
      description: '0-60 mph acceleration that pushes the boundaries of physics',
      icon: '⚡',
      color: '#FF6B35',
      animatedValue: 0
    },
    {
      id: 'topspeed',
      title: 'Maximum Velocity',
      value: '205',
      unit: 'mph',
      description: 'Top speed that redefines what\'s possible on four wheels',
      icon: '🏁',
      color: '#4ECDC4',
      animatedValue: 0
    },
    {
      id: 'horsepower',
      title: 'Raw Power',
      value: '710',
      unit: 'HP',
      description: 'Horsepower that delivers uncompromising performance',
      icon: '💪',
      color: '#45B7D1',
      animatedValue: 0
    },
    {
      id: 'torque',
      title: 'Instant Response',
      value: '568',
      unit: 'lb-ft',
      description: 'Torque that provides immediate acceleration response',
      icon: '🔥',
      color: '#F39C12',
      animatedValue: 0
    },
    {
      id: 'efficiency',
      title: 'Smart Engineering',
      value: '22',
      unit: 'mpg',
      description: 'Efficiency that doesn\'t compromise on performance',
      icon: '🌱',
      color: '#27AE60',
      animatedValue: 0
    }
  ], [])

  const [currentCard, setCurrentCard] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    const container = containerRef.current
    const cards = cardsRef.current
    const progress = progressRef.current
    const background = backgroundRef.current

    if (!section || !container || !progress || !background) return

    // Set initial states - all cards visible but stacked
    gsap.set(cards, { opacity: 0, scale: 0.8 })
    gsap.set(progress, { scaleX: 0 })

    // Show first card initially
    if (cards[0]) {
      gsap.set(cards[0], { opacity: 1, scale: 1 })
    }

    // Create scroll-triggered card transitions
    const scrollDistance = cards.length * 100
    
    // Main ScrollTrigger for the section
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: `+=${scrollDistance * 20}`,
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        // Update progress bar
        gsap.set(progress, { scaleX: self.progress })
        
        // Calculate which card should be active
        const scrollProgress = self.progress
        const cardIndex = Math.floor(scrollProgress * cards.length)
        const clampedIndex = Math.min(cardIndex, cards.length - 1)
        
        // Update current card if changed
        if (clampedIndex !== currentCard) {
          setCurrentCard(clampedIndex)
        }
        
        // Show/hide cards based on progress - only show active card
        cards.forEach((card, index) => {
          if (!card) return
          
          const cardProgress = scrollProgress * cards.length - index
          const isActive = cardProgress >= 0 && cardProgress < 1
          
          if (isActive) {
            gsap.to(card, {
              opacity: 1,
              scale: 1,
              duration: 0.3,
              ease: 'power2.out'
            })
            
            // Trigger counter animation if not already animated
            if (card.getAttribute('data-counter-animated') !== 'true') {
              card.setAttribute('data-counter-animated', 'true')
              // @ts-expect-error - animateCounter is dynamically added
              if (card.animateCounter) card.animateCounter()
            }
          } else {
            // Hide all non-active cards completely
            gsap.to(card, {
              opacity: 0,
              scale: 0.8,
              duration: 0.3,
              ease: 'power2.out'
            })
            
            // Reset counter animation flag when card becomes inactive
            card.setAttribute('data-counter-animated', 'false')
          }
        })
      }
    })

    // Background parallax effect
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: `+=${scrollDistance * 20}`,
      scrub: true,
      onUpdate: (self) => {
        gsap.to(background, {
          xPercent: -50 * self.progress,
          duration: 0.1,
          ease: 'none'
        })
      }
    })

    // Individual card counter animations
    cards.forEach((card, index) => {
      if (!card) return

      // Set up counter animation for when card becomes active
      const animateCounter = () => {
        const metric = performanceMetrics[index]
        const numericValue = parseFloat(metric.value)
        
        if (!isNaN(numericValue)) {
          gsap.fromTo(metric, 
            { animatedValue: 0 },
            {
              animatedValue: numericValue,
              duration: 2,
              ease: 'power2.out',
              onUpdate: function() {
                const valueElement = card.querySelector('.metric-value')
                if (valueElement) {
                  valueElement.textContent = Math.round(this.targets()[0].animatedValue).toString()
                }
              }
            }
          )
        }
      }

      // Store animation function for later use
      card.setAttribute('data-animate-counter', 'true')
      // @ts-expect-error - dynamically adding method to HTMLDivElement
      card.animateCounter = animateCounter
    })

    // Animate the first card's counter on initial load
    const firstCard = cards[0]
    if (firstCard) {
      setTimeout(() => {
        firstCard.setAttribute('data-counter-animated', 'true')
        // @ts-expect-error - animateCounter is dynamically added
        if (firstCard.animateCounter) firstCard.animateCounter()
      }, 500)
    }

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [currentCard, performanceMetrics])

  // Add card ref to array
  const addCardRef = (el: HTMLDivElement | null, index: number) => {
    if (el) {
      cardsRef.current[index] = el
    }
  }

  return (
    <section 
      ref={sectionRef}
      className="relative h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800"
    >
      {/* Background with parallax effect */}
      <div 
        ref={backgroundRef}
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(78, 205, 196, 0.1))',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite'
        }}
      />

      {/* Progress indicator */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-800 z-20">
        <div 
          ref={progressRef}
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 origin-left"
        />
      </div>

      {/* Section header */}
      <div className="absolute top-10 left-10 z-10 text-white">
        <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Performance
        </h2>
        <p className="text-lg md:text-xl text-gray-300 max-w-md">
          Engineering excellence that pushes the limits of automotive performance
        </p>
      </div>

      {/* Card indicator dots */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {performanceMetrics.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentCard 
                ? 'bg-white scale-125' 
                : 'bg-gray-500 hover:bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Main container for horizontal scroll */}
      <div 
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Performance cards */}
        {performanceMetrics.map((metric, index) => (
          <div
            key={metric.id}
            ref={(el) => addCardRef(el, index)}
            className="absolute inset-0 flex items-center justify-center p-8"
          >
            <div 
              className="relative max-w-2xl mx-auto text-center p-12 rounded-3xl backdrop-blur-lg border border-white/10"
              style={{
                background: `linear-gradient(135deg, ${metric.color}15, ${metric.color}05)`,
                boxShadow: `0 25px 50px -12px ${metric.color}25`
              }}
            >
              {/* Metric icon */}
              <div className="metric-icon text-8xl mb-6 filter drop-shadow-lg">
                {metric.icon}
              </div>

              {/* Metric title */}
              <h3 className="metric-title text-3xl md:text-5xl font-bold text-white mb-4">
                {metric.title}
              </h3>

              {/* Metric value and unit */}
              <div className="flex items-baseline justify-center space-x-2 mb-6">
                <span 
                  className="metric-value text-6xl md:text-8xl font-black"
                  style={{ color: metric.color }}
                >
                  {metric.value}
                </span>
                <span className="metric-unit text-2xl md:text-3xl text-gray-300 font-medium">
                  {metric.unit}
                </span>
              </div>

              {/* Metric description */}
              <p className="metric-description text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg mx-auto">
                {metric.description}
              </p>

              {/* Decorative elements */}
              <div 
                className="absolute -top-2 -right-2 w-20 h-20 rounded-full opacity-20 blur-xl"
                style={{ backgroundColor: metric.color }}
              />
              <div 
                className="absolute -bottom-2 -left-2 w-16 h-16 rounded-full opacity-15 blur-lg"
                style={{ backgroundColor: metric.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation hint */}
      <div className="absolute bottom-10 right-10 text-white/60 text-sm z-10">
        <div className="flex items-center space-x-2">
          <span>Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-white/30 rounded-full relative">
            <div className="w-1 h-2 bg-white/60 rounded-full absolute top-2 left-1/2 transform -translate-x-1/2 animate-bounce" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </section>
  )
}

export default PerformanceShowcase
