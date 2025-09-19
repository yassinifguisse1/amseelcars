'use client';
// import styles from './page.module.scss'
import { projects, type Project } from '@/data/projects';
import { useScroll } from 'framer-motion';
import { useEffect, useRef } from 'react';
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

  // Show the fixed BG only while this section is in view

  
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end']
  })

  // GSAP effect for background color changes
  useEffect(() => {
    if (!container.current || !backgroundRef.current) return

    const triggers: ScrollTrigger[] = []

    const rafId = requestAnimationFrame(() => {
      const cardElements = Array.from(
        container.current!.querySelectorAll<HTMLElement>('[data-card-index]')
      )

      cardElements.forEach((cardElement, index) => {
        const project = projects[index]
        if (!project) return

        const animateBackground = () => {
          const darkColor = darkenColor(project.color, 0.3)
          gsap.to(backgroundRef.current, {
            backgroundColor: darkColor,
            duration: 1.2,
            ease: 'power2.out'
          })
        }

        const trigger = ScrollTrigger.create({
          trigger: cardElement,
          start: 'top center',
          end: 'bottom center',
          onEnter: animateBackground,
          onEnterBack: animateBackground
        })

        triggers.push(trigger)
      })

      ScrollTrigger.refresh()
    })

    return () => {
      cancelAnimationFrame(rafId)
      triggers.forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <main ref={container} className="relative">
      {/* Animated background */}
      <div 
        ref={backgroundRef}
        className="fixed inset-0 h-full w-full -z-10 transition-colors duration-300 "
        style={{ 
        
          backgroundColor: darkenColor(projects[0]?.color || '#BBACAF', 0.3) }}
      />
      
      {
        projects.map( (project: Project, i: number) => {
          const targetScale = 1 - ( (projects.length - i) * 0.05);
          return (
            <Card 
              key={`p_${i}`} 
              i={i} 
              title={project.title}
              url={project.link}
              description={project.description}
              src={project.src}
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
