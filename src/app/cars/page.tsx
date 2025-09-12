"use client"

import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRevealed } from '@/hooks/useRevealed'
import HorizontalCarSection from '@/components/Cars/HorizontalCarSection/HorizontalCarSection'
// import PerformanceShowcase from '@/components/Cars/PerformanceShowcase'
// import WeekndParallax from '@/components/about/Hero/WeekndParallax'
import ParallexCards from '@/components/Cars/ParallexCards/ParallexCards'
import Heroo from '@/components/Cars/Heroo/Heroo'
import Footer from '@/components/Footer/Footer'

export default function CarsPage() {
  useRevealed()

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // Refresh ScrollTrigger after component mount
    ScrollTrigger.refresh()

    // Handle hash navigation (for #cars anchor)
    const handleHashNavigation = () => {
      const hash = window.location.hash
      if (hash === '#cars') {
        // Wait for components to mount and animations to initialize
        const scrollToSection = () => {
          const carsSection = document.getElementById('cars')
          if (carsSection) {
            setTimeout(() => {
              carsSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
              })
            }, 500) // Delay to ensure GSAP animations are set up
          }
        }
        
        // Try multiple times with increasing delays
        setTimeout(scrollToSection, 100)
        setTimeout(scrollToSection, 500)
        setTimeout(scrollToSection, 1000)
      }
    }

    // Handle hash on initial load
    handleHashNavigation()

    // Handle hash changes (back/forward navigation)
    window.addEventListener('hashchange', handleHashNavigation)

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      window.removeEventListener('hashchange', handleHashNavigation)
    }
  }, [])

  return (
    <div className=''>
      <div className='revealed'></div>
      
      {/* Hero Section with Image Slider */}
      {/* <HeroSlider /> */}
      <Heroo />
      {/* Horizontal Scrolling Cars Section */}
      <HorizontalCarSection />
      <ParallexCards />
      <Footer/>
      
      {/* Performance Showcase Section */}
      {/* <PerformanceShowcase /> */}
      
      {/* Additional sections can be added here */}
      {/* <section className="h-screen bg-blackc flex items-center justify-center"> */}
      {/* <WeekndParallax/> */}


      {/* </section> */}
      </div>

  )
}