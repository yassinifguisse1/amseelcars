"use client"

import { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export interface Brand {
  name: string
  logo: string
  preview: string
  href?: string
}

export interface OurBrandsGridProps {
  brands: Brand[]
  heading?: string
  heading2?: string
  columns?: {
    base?: number
    md?: number
    lg?: number
  }
  onTileHover?: (brand: Brand) => void
  onTileClick?: (brand: Brand) => void
}

interface BrandTileProps {
  brand: Brand
  onHover?: (brand: Brand) => void
  onClick?: (brand: Brand) => void
}

function BrandTile({ brand, onHover, onClick }: BrandTileProps) {
  const [isPreviewVisible, setIsPreviewVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    onHover?.(brand)
  }, [brand, onHover])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  const handleClick = useCallback(() => {
    // On mobile/touch devices, toggle preview
    if ('ontouchstart' in window) {
      setIsPreviewVisible(prev => !prev)
    }
    onClick?.(brand)
  }, [brand, onClick])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsPreviewVisible(prev => !prev)
      onClick?.(brand)
    }
  }, [brand, onClick])

  const showPreview = isHovered || isPreviewVisible

  const tileContent = (
    <div
      className="group relative w-full h-full bg-white border-2 border-neutral-200/70 overflow-hidden aspect-[4/3] flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 ease-out"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${brand.name} preview`}
      aria-pressed={isPreviewVisible}
    >
      {/* Logo */}
      <div className={` w-32 h-32 md:w-36 md:h-36 absolute inset-0 flex items-center justify-center mx-auto my-auto transition-opacity duration-200  motion-reduce:transition-none ${showPreview ? 'opacity-0' : 'opacity-100'}`}>
        <Image
          src={brand.logo}
          alt={`${brand.name} logo`}
          width={200}
          height={200}
          className="w-full h-full object-contain "
          loading="lazy"
        //   sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw"
        />
      </div>

      {/* Car Preview */}
      <div className={`absolute inset-0 transition-all duration-300 ease-out motion-reduce:transition-none ${showPreview ? 'opacity-100 scale-100' : 'opacity-0 scale-105 motion-reduce:scale-100'}`}>
        <Image
          src={brand.preview}
          alt={`${brand.name} car`}
          fill
          className="object-cover transition-all duration-300 ease-out motion-reduce:transition-none"
          loading="lazy"
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw"
        />
      </div>

      {/* Overlay gradient for better text visibility on car image */}
      <div className={` absolute inset-0  to-transparent transition-opacity duration-300 motion-reduce:transition-none ${showPreview ? 'opacity-100' : 'opacity-0'}`} />
      
      {/* Brand name overlay when preview is shown */}
      <div className={`w-32 h-32 md:w-36 md:h-36 absolute inset-0 flex items-center justify-center mx-auto my-auto text-white font-medium text-sm transition-opacity duration-300 motion-reduce:transition-none ${showPreview ? 'opacity-100' : 'opacity-0'}`}>
      <Image
          src={brand.logo}
          alt={`${brand.name} logo`}
          width={200}
          height={200}
          className="w-full h-full object-contain "
          loading="lazy"
        //   sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw"
        />
      </div>
    </div>
  )

  // Wrap in Link if href is provided
  if (brand.href) {
    return (
      <Link href={brand.href} className="block">
        {tileContent}
      </Link>
    )
  }

  return tileContent
}

export default function OurBrandsGrid({
  brands,
  heading = "(Nos",
  heading2 = " Marques)",
  columns = { base: 2, md: 3, lg: 4 },
  onTileHover,
  onTileClick
}: OurBrandsGridProps) {
  const { base = 2, md = 3, lg = 4 } = columns

  const section2 = useRef<HTMLElement>(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        
        const ctx = gsap.context(() => {
          // Responsive distances
          const mm = gsap.matchMedia();
    
          mm.add("(min-width: 768px)", () => {
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: section2.current!,
                  start: "top 80%",
                  end: "top 20%",
                  scrub: 1,
                  // markers: true, // Enable for debugging
                },
              })
              .to(".split-right", { xPercent: 70, ease: "none" }, 0);
          });
    
          mm.add("(max-width: 767px)", () => {
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: section2.current!,
                  start: "top 80%",
                  end: "top 30%",
                  scrub: 1,
                  // markers: true, // Enable for debugging
                },
              })
              .to(".split-right", { xPercent: 45, ease: "none" }, 0);
          });
        }, section2);
    
        return () => ctx.revert();
      }, []);
  // Generate responsive grid classes - using explicit classes for Tailwind compilation
  const getGridClasses = () => {
    let baseClass = 'grid-cols-2'
    let mdClass = 'md:grid-cols-3' 
    let lgClass = 'lg:grid-cols-4'

    // Map numbers to Tailwind classes
    if (base === 1) baseClass = 'grid-cols-1'
    else if (base === 2) baseClass = 'grid-cols-2'
    else if (base === 3) baseClass = 'grid-cols-3'
    else if (base === 4) baseClass = 'grid-cols-4'
    else if (base === 5) baseClass = 'grid-cols-5'
    else if (base === 6) baseClass = 'grid-cols-6'

    if (md === 1) mdClass = 'md:grid-cols-1'
    else if (md === 2) mdClass = 'md:grid-cols-2'
    else if (md === 3) mdClass = 'md:grid-cols-3'
    else if (md === 4) mdClass = 'md:grid-cols-4'
    else if (md === 5) mdClass = 'md:grid-cols-5'
    else if (md === 6) mdClass = 'md:grid-cols-6'

    if (lg === 1) lgClass = 'lg:grid-cols-2'
    else if (lg === 2) lgClass = 'lg:grid-cols-2'
    else if (lg === 3) lgClass = 'lg:grid-cols-3'
    else if (lg === 4) lgClass = 'lg:grid-cols-4'
    else if (lg === 5) lgClass = 'lg:grid-cols-5'
    else if (lg === 6) lgClass = 'lg:grid-cols-6'

    return `grid gap-px  p-px ${baseClass} ${mdClass} ${lgClass}`
  }

  return (
    <section className="py-16 " ref={section2}>
      <div className="px-4">
        {/* Heading */}
        <div className="text-start mb-12 overflow-hidden">
          <h2 className="text-sm md:text-4xl lg:text-5xl font-bold text-black tracking-wide">
            <span className="split-lefts inline-block text-4xl  md:text-6xl lg:text-7xl font-bold text-black tracking-wide">
              {heading}
            </span>
            <span className="split-right inline-block text-4xl  md:text-6xl lg:text-7xl font-bold">
              &nbsp;{heading2}
            </span>
          </h2>
        </div>

        {/* Grid */}
        <div className={getGridClasses()}>
          {brands.map((brand, index) => (
            <BrandTile
              key={`${brand.name}-${index}`}
              brand={brand}
              onHover={onTileHover}
              onClick={onTileClick}
            />
          ))}
        </div>
      </div>
    </section>
  )
} 