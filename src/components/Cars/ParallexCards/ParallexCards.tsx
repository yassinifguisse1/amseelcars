'use client';
// import styles from './page.module.scss'
import { projects, type Project } from '@/data/projects';
import { useScroll } from 'framer-motion';
import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Card from './Cards/Cards';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

// Utility function to darken a hex color
const darkenColor = (hex: string, amount: number): string => {
  // Remove # if present
  hex = hex.replace('#', '')
  
  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  // Darken by reducing each component
  const newR = Math.max(0, Math.floor(r * (1 - amount)))
  const newG = Math.max(0, Math.floor(g * (1 - amount)))
  const newB = Math.max(0, Math.floor(b * (1 - amount)))
  
  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}

export default function ParallexCards() {
  const container = useRef<HTMLElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end']
  })

  useEffect(() => {
    const lenis = new Lenis()

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)
  }, [])

  // GSAP effect for background color changes
  useEffect(() => {
    if (!container.current || !backgroundRef.current) return

    // Wait for cards to be rendered
    const timer = setTimeout(() => {
      // Create ScrollTrigger for each card
      projects.forEach((project, index) => {
        // Find the corresponding card element
        const cardElement = container.current?.children[index + 1] as HTMLElement // +1 because first child is background
        
        if (cardElement) {
          ScrollTrigger.create({
            trigger: cardElement,
            start: "top center",
            end: "bottom center", 
            onEnter: () => {
              // Create a darker version of the project color for background
              const darkColor = darkenColor(project.color, 0.3)
              gsap.to(backgroundRef.current, {
                backgroundColor: darkColor,
                duration: 1.2,
                ease: "power2.out"
              })
            },
            onEnterBack: () => {
              // Create a darker version of the project color for background
              const darkColor = darkenColor(project.color, 0.3)
              gsap.to(backgroundRef.current, {
                backgroundColor: darkColor,
                duration: 1.2,
                ease: "power2.out"
              })
            }
          })
        }
      })
    }, 100)

    // Cleanup
    return () => {
      clearTimeout(timer)
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <main ref={container} className="relative">
      {/* Animated background */}
      <div 
        ref={backgroundRef}
        className="fixed inset-0 w-full h-full -z-10 transition-colors duration-300"
        style={{ backgroundColor: darkenColor(projects[0]?.color || '#BBACAF', 0.3) }}
      />
      
      {
        projects.map( (project: Project, i: number) => {
          const targetScale = 1 - ( (projects.length - i) * 0.05);
          return (
            <Card 
              key={`p_${i}`} 
              i={i} 
              title={project.title}
              description={project.description}
              src={project.src}
              url={project.link}
              color={project.color}
              progress={scrollYProgress} 
              range={[i * .25, 1]} 
              targetScale={targetScale}
            />
          )
        })
      }
    </main>
  )
}