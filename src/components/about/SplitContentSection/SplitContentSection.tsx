"use client"

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface SplitContentSectionProps {
  image: {
    src: string
    alt: string
  }
  content: {
    title?: string
    paragraphs: string[]
  }
  backgroundColor?: string
  textColor?: string
}

export default function SplitContentSection({
  image,
  content,
  backgroundColor = "#000000",
  textColor = "#ffffff"
}: SplitContentSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      // Animate image from left
      gsap.fromTo(imageRef.current, 
        {
          x: -100,
          opacity: 0
        },
        {
          x: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      )

      // Animate text from right with stagger
      gsap.fromTo(textRef.current?.children || [], 
        {
          x: 100,
          opacity: 0
        },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse"
          }
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section 
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center p-4 md:p-8"
      style={{ backgroundColor }}
    >
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        
        {/* Image Section */}
        <div ref={imageRef} className="relative">
          <div className="aspect-[4/3] lg:aspect-[3/4] w-full overflow-hidden rounded-lg">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover hover:scale-105 transition-transform duration-700 ease-out"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Text Content Section */}
        <div ref={textRef} className="space-y-6 lg:space-y-8">
          {content.title && (
            <h2 
              className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight"
              style={{ color: textColor }}
            >
              {content.title}
            </h2>
          )}
          
          <div className="space-y-4 lg:space-y-6">
            {content.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-sm md:text-base lg:text-lg leading-relaxed font-light"
                style={{ color: textColor }}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
} 