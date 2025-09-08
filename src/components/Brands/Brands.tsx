'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function Brands() {
  const firstRowRef = useRef<HTMLDivElement>(null);
  const secondRowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  const brands = [
    {
      name: "DACIA",
      logo: "/images/Dacia.webp"
    },
    {
      name: "VOLKSWAGEN", 
      logo: "/images/VOLKSWAGEN.webp"
    },
    {
      name: "HYUNDAI",
      logo: "/images/HYUNDAI.webp"
    },
    {
      name: "KIA",
      logo: "/images/KIA.webp" // Using existing KIA logo
    },
    {
      name: "BMW",
      logo: "/images/BMW.webp" // Need to add this file
    },
    {
      name: "FORD",
      logo: "/images/FORD.webp" // Need to add this file
    },
    {
      name: "RENAULT",
      logo: "/images/RENAULT.webp" // Need to add this file
    }
  ];

  useEffect(() => {
    if (!firstRowRef.current || !secondRowRef.current) return;

    // Title section animations with ScrollTrigger
    if (titleRef.current && headingRef.current && descriptionRef.current) {
      // Set initial states
      gsap.set([headingRef.current, descriptionRef.current], {
        y: 60,
        opacity: 0
      });

      // Create timeline for title animations
      const titleTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      });

      titleTimeline
        .to(headingRef.current, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out"
        })
        .to(descriptionRef.current, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out"
        }, "-=0.5");
    }

    // Create multiple copies for seamless infinite scroll
    const brandWidth = 200; // Fixed width per brand item
    const totalBrands = brands.length;
    const totalWidth = brandWidth * totalBrands;

    // First row animation (left to right)
    gsap.set(firstRowRef.current, { x: 0 });
    gsap.to(firstRowRef.current, {
      x: -totalWidth,
      duration: 20,
      ease: "none",
      repeat: -1
    });

    // Second row animation (right to left)  
    gsap.set(secondRowRef.current, { x: -totalWidth });
    gsap.to(secondRowRef.current, {
      x: 0,
      duration: 25,
      ease: "none", 
      repeat: -1
    });

    return () => {
      gsap.killTweensOf([firstRowRef.current, secondRowRef.current]);
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === titleRef.current) {
          trigger.kill();
        }
      });
    };
  }, [brands.length]);

  // Create enough copies for seamless loop
  const extendedBrands = [...brands, ...brands, ...brands, ...brands];

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Title */}
        <div ref={titleRef} className="text-center mb-16 ">
          <h2 ref={headingRef} className="text-6xl md:text-7xl font-bold text-white mb-4">
            Our Brands
          </h2>
          <p ref={descriptionRef} className="text-xl text-gray-400 max-w-2xl mx-auto">
            Premium automotive brands that define excellence and innovation
          </p>
        </div>

        {/* Scrolling Brands Container */}
        <div className="relative">
          {/* First Row - Left to Right */}
          <div className="relative overflow-hidden mb-8">
            <div 
              ref={firstRowRef}
              className="flex"
              style={{ width: 'max-content' }}
            >
              {extendedBrands.map((brand, index) => (
                <div
                  key={`row1-${index}`}
                  className="flex-shrink-0 group cursor-pointer"
                  style={{ width: '200px' }}
                >
                  <div className="relative mx-4">
                    {/* Brand Logo Container */}
                    <div className="w-32 h-32 md:w-36 md:h-36 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl flex items-center justify-center p-6 transition-all duration-500 group-hover:bg-white/10 group-hover:border-white/20 group-hover:scale-105">
                      <Image
                        src={brand.logo}
                        alt={`${brand.name} logo`}
                        className="w-full h-full object-contain filter brightness-0 invert transition-all duration-500 group-hover:brightness-100 group-hover:invert-0"
                        width={100}
                        height={100}
                        priority={index < 4} // Prioritize first 4 visible brands
                        quality={95} // High quality for brand logos
                        placeholder="blur"
                        blurDataURL="data:image/webp;base64,UklGRnoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKhAACAAFANgAAJ0BLUASFBDgCAAA"
                      />
                    </div>
                    
                    {/* Brand Name */}
                    <div className="mt-4 text-center">
                      <h3 className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors duration-300">
                        {brand.name}
                      </h3>
                    </div>

                    {/* Glow Effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Second Row - Right to Left */}
          <div className="relative overflow-hidden">
            <div 
              ref={secondRowRef}
              className="flex"
              style={{ width: 'max-content' }}
            >
              {extendedBrands.map((brand, index) => (
                <div
                  key={`row2-${index}`}
                  className="flex-shrink-0 group cursor-pointer"
                  style={{ width: '200px' }}
                >
                  <div className="relative mx-4">
                    {/* Brand Logo Container */}
                    <div className="w-32 h-32 md:w-36 md:h-36 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl flex items-center justify-center p-6 transition-all duration-500 group-hover:bg-white/10 group-hover:border-white/20 group-hover:scale-105">
                      <Image
                        src={brand.logo}
                        alt={`${brand.name} logo`}
                        className="w-full h-full object-contain filter brightness-0 invert transition-all duration-500 group-hover:brightness-100 group-hover:invert-0"
                        width={100}
                        height={100}
                        priority={index < 4} // Prioritize first 4 visible brands
                        quality={95} // High quality for brand logos
                        placeholder="blur"
                        blurDataURL="data:image/webp;base64,UklGRnoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKhAACAAFANgAAJ0BLUASFBDgCAAA"
                      />
                    </div>
                    
                    {/* Brand Name */}
                    <div className="mt-4 text-center">
                      <h3 className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors duration-300">
                        {brand.name}
                      </h3>
                    </div>

                    {/* Glow Effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fade Gradients - Left and Right */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent pointer-events-none z-10"></div>
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent pointer-events-none z-10"></div>
        </div>

        {/* Bottom Gradient */}
        <div className="mt-16 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </div>
    </section>
  );
}