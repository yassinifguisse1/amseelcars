"use client"

import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CarGridSection from '@/components/Cars/CarGridSection'
import Footer from '@/components/Footer/Footer'
import ParallexCards from '@/components/Cars/ParallexCards/ParallexCards'
import HeroVideo from '@/components/Cars/HeroVedio/HeroVideo'

export default function CarsPage() {


  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    ScrollTrigger.refresh()

    // Handle hash navigation
    const handleHashNavigation = () => {
      const hash = window.location.hash
      if (hash) {
        const element = document.querySelector(hash)
        if (element) {
          // Small delay to ensure page is loaded
          setTimeout(() => {
            element.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            })
          }, 100)
        }
      }
    }

    // Handle initial hash on page load
    handleHashNavigation()
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashNavigation)
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      window.removeEventListener('hashchange', handleHashNavigation)
    }
  }, [])

  return (
    <div className=''>
      {/* <Heroo /> */}
      <HeroVideo/>
      <CarGridSection />
      <ParallexCards />
      <Footer />
    </div>
  )
}