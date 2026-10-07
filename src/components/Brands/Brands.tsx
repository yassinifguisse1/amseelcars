'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function Brands() {
  const t = useTranslations('home.brands');
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
    <section className="relative overflow-hidden bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Title */}
        <div ref={titleRef} className="mb-16 text-center">
          <h2 ref={headingRef} className="mb-4 text-6xl font-bold text-neutral-900 md:text-7xl">
            {t('title')}
          </h2>
          <p ref={descriptionRef} className="mx-auto max-w-2xl text-xl text-neutral-600">
            {t('description')}
          </p>
        </div>

        {/* Scrolling Brands Container */}
        <div className="relative">
          {/* First Row - Left to Right */}
          <div className="relative mb-8 overflow-hidden">
            <div
              ref={firstRowRef}
              className="flex"
              style={{ width: 'max-content' }}
            >
              {extendedBrands.map((brand, index) => (
                <div
                  key={`row1-${index}`}
                  className="group flex-shrink-0 cursor-pointer"
                  style={{ width: '200px' }}
                >
                  <div className="relative mx-4">
                    <div className="flex h-32 w-32 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 p-6 transition-all duration-500 group-hover:scale-105 group-hover:border-neutral-300 group-hover:bg-white md:h-36 md:w-36">
                      <Image
                        src={brand.logo}
                        alt={t('logoAlt', { name: brand.name })}
                        className="h-full w-full object-contain transition-all duration-500 group-hover:scale-105"
                        width={100}
                        height={100}
                        priority={index < 4}
                        quality={95}
                        placeholder="blur"
                        blurDataURL="data:image/webp;base64,UklGRnoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKhAACAAFANgAAJ0BLUASFBDgCAAA"
                      />
                    </div>

                    <div className="mt-4 text-center">
                      <h3 className="text-sm font-semibold text-neutral-700 transition-colors duration-300 group-hover:text-neutral-900">
                        {brand.name}
                      </h3>
                    </div>

                    <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-[#CB1939]/10 to-[#CB1939]/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"></div>
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
                  className="group flex-shrink-0 cursor-pointer"
                  style={{ width: '200px' }}
                >
                  <div className="relative mx-4">
                    <div className="flex h-32 w-32 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 p-6 transition-all duration-500 group-hover:scale-105 group-hover:border-neutral-300 group-hover:bg-white md:h-36 md:w-36">
                      <Image
                        src={brand.logo}
                        alt={t('logoAlt', { name: brand.name })}
                        className="h-full w-full object-contain transition-all duration-500 group-hover:scale-105"
                        width={100}
                        height={100}
                        priority={index < 4}
                        quality={95}
                        placeholder="blur"
                        blurDataURL="data:image/webp;base64,UklGRnoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKhAACAAFANgAAJ0BLUASFBDgCAAA"
                      />
                    </div>

                    <div className="mt-4 text-center">
                      <h3 className="text-sm font-semibold text-neutral-700 transition-colors duration-300 group-hover:text-neutral-900">
                        {brand.name}
                      </h3>
                    </div>

                    <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-[#CB1939]/10 to-[#CB1939]/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fade Gradients - Left and Right */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-white to-transparent"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-white to-transparent"></div>
        </div>

        <div className="mt-16 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent"></div>
      </div>
    </section>
  );
}