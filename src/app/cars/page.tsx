"use client"

import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRevealed } from '@/hooks/useRevealed'
import HeroSlider from '@/components/Cars/HeroSlider/HeroSlider'
import HorizontalCarSection from '@/components/Cars/HorizontalCarSection/HorizontalCarSection'
import PerformanceShowcase from '@/components/Cars/PerformanceShowcase'
import WeekndParallax from '@/components/about/Hero/WeekndParallax'

export default function CarsPage() {
  useRevealed()

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // Refresh ScrollTrigger after component mount
    ScrollTrigger.refresh()

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <div>
      <div className='revealed'></div>
      
      {/* Hero Section with Image Slider */}
      <HeroSlider />
      {/* Horizontal Scrolling Cars Section */}
      <HorizontalCarSection />
      
      {/* Performance Showcase Section */}
      <PerformanceShowcase />
      
      {/* Additional sections can be added here */}
      {/* <section className="h-screen bg-blackc flex items-center justify-center"> */}
      {/* <WeekndParallax/> */}


      {/* </section> */}
      </div>

  )
}