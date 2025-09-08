'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Image preloading hook for brand logos
function useBrandImagePreloader(imageUrls: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const preloadImage = (src: string): Promise<void> => {
      return new Promise((resolve) => {
        const img = document.createElement('img');
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, src]));
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load brand logo: ${src}`);
          setFailedImages(prev => new Set([...prev, src]));
          resolve(); // Still resolve to continue loading other images
        };
        img.src = src;
      });
    };

    const preloadAllImages = async () => {
      let completedCount = 0;
      const total = imageUrls.length;
      
      setLoadingProgress(0);

      const loadPromises = imageUrls.map(async (url) => {
        await preloadImage(url);
        completedCount++;
        setLoadingProgress(Math.round((completedCount / total) * 100));
      });

      await Promise.all(loadPromises);
      setIsLoading(false);
    };

    preloadAllImages();
  }, [imageUrls]);

  const isImageLoaded = useCallback((src: string) => loadedImages.has(src), [loadedImages]);
  const isImageFailed = useCallback((src: string) => failedImages.has(src), [failedImages]);

  return { loadedImages, failedImages, isLoading, loadingProgress, isImageLoaded, isImageFailed };
}

export default function Brands() {
  const firstRowRef = useRef<HTMLDivElement>(null);
  const secondRowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const animationRef = useRef<gsap.core.Tween[]>([]);

  const brands = [
    {
      name: "DACIA",
      logo: "https://amseelcars.com/wp-content/uploads/2025/03/dacia-01.svg",
      fallback: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/dacia.svg"
    },
    {
      name: "VOLKSWAGEN", 
      logo: "https://amseelcars.com/wp-content/uploads/2025/03/Volkswagen-01.svg",
      fallback: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/volkswagen.svg"
    },
    {
      name: "HYUNDAI",
      logo: "https://amseelcars.com/wp-content/uploads/2025/03/Hyundai-01.svg",
      fallback: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/hyundai.svg"
    },
    {
      name: "KIA",
      logo: "https://amseelcars.com/wp-content/uploads/2025/03/kia-01.svg",
      fallback: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/kia.svg"
    },
    {
      name: "BMW",
      logo: "https://amseelcars.com/wp-content/uploads/2025/03/bmw-01.svg",
      fallback: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/bmw.svg"
    },
    {
      name: "FORD",
      logo: "https://amseelcars.com/wp-content/uploads/2025/03/ford-01.svg",
      fallback: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/ford.svg"
    },
    {
      name: "RENAULT",
      logo: "https://amseelcars.com/wp-content/uploads/2025/03/renault-01.svg",
      fallback: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/renault.svg"
    }
  ];

  // Extract all logo URLs for preloading
  const logoUrls = brands.flatMap(brand => [brand.logo, brand.fallback]);
  
  // Preload all brand images
  const { isLoading, loadingProgress, isImageLoaded, isImageFailed } = useBrandImagePreloader(logoUrls);

  useEffect(() => {
    if (!firstRowRef.current || !secondRowRef.current || isLoading) return;

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

    // Only start brand animations when images are loaded
    if (!isLoading) {
      // Create multiple copies for seamless infinite scroll
      const brandWidth = 200; // Fixed width per brand item
      const totalBrands = brands.length;
      const totalWidth = brandWidth * totalBrands;

      // Clear any existing animations
      animationRef.current.forEach(tween => tween.kill());
      animationRef.current = [];

      // First row animation (left to right) - optimized for performance
      gsap.set(firstRowRef.current, { x: 0 });
      const firstRowTween = gsap.to(firstRowRef.current, {
        x: -totalWidth,
        duration: 20,
        ease: "none",
        repeat: -1,
        force3D: true, // GPU acceleration
        willChange: "transform"
      });
      animationRef.current.push(firstRowTween);

      // Second row animation (right to left) - optimized for performance
      gsap.set(secondRowRef.current, { x: -totalWidth });
      const secondRowTween = gsap.to(secondRowRef.current, {
        x: 0,
        duration: 25,
        ease: "none", 
        repeat: -1,
        force3D: true, // GPU acceleration
        willChange: "transform"
      });
      animationRef.current.push(secondRowTween);

      console.log('Brand carousel animations started - all images loaded');
    }

    return () => {
      // Cleanup animations
      animationRef.current.forEach(tween => tween.kill());
      gsap.killTweensOf([firstRowRef.current, secondRowRef.current]);
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === titleRef.current) {
          trigger.kill();
        }
      });
    };
  }, [brands.length, isLoading]);

  // Create enough copies for seamless loop
  const extendedBrands = [...brands, ...brands, ...brands, ...brands];

  // Helper function to get the correct logo URL
  const getBrandLogo = useCallback((brand: typeof brands[0]) => {
    if (isImageLoaded(brand.logo)) {
      return brand.logo;
    } else if (isImageFailed(brand.logo) && isImageLoaded(brand.fallback)) {
      return brand.fallback;
    }
    return brand.logo; // Default fallback
  }, [isImageLoaded, isImageFailed]);

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-lg mb-2">Loading Brand Logos...</p>
              <div className="w-64 bg-gray-700 rounded-full h-2 mx-auto">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">{loadingProgress}% loaded</p>
            </div>
          </div>
        )}

        {/* Section Title */}
        <div ref={titleRef} className="text-center mb-16">
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
                      {/* Logo with fallback and loading optimization */}
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          opacity: isImageLoaded(getBrandLogo(brand)) ? 1 : 0.3,
                          transition: 'opacity 0.3s ease'
                        }}
                      >
                        <Image
                          src={getBrandLogo(brand)}
                          alt={`${brand.name} logo`}
                          className="w-full h-full object-contain filter brightness-0 invert transition-all duration-500 group-hover:brightness-100 group-hover:invert-0"
                          width={100}
                          height={100}
                          loading="eager" // Load brand logos immediately
                          quality={90}
                          onError={() => {
                            console.warn(`Failed to load logo for ${brand.name}`);
                          }}
                        />
                      </div>
                      
                      {/* Loading placeholder */}
                      {!isImageLoaded(getBrandLogo(brand)) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin"></div>
                        </div>
                      )}
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
                      {/* Logo with fallback and loading optimization */}
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          opacity: isImageLoaded(getBrandLogo(brand)) ? 1 : 0.3,
                          transition: 'opacity 0.3s ease'
                        }}
                      >
                        <Image
                          src={getBrandLogo(brand)}
                          alt={`${brand.name} logo`}
                          className="w-full h-full object-contain filter brightness-0 invert transition-all duration-500 group-hover:brightness-100 group-hover:invert-0"
                          width={100}
                          height={100}
                          loading="eager" // Load brand logos immediately
                          quality={90}
                          onError={() => {
                            console.warn(`Failed to load logo for ${brand.name}`);
                          }}
                        />
                      </div>
                      
                      {/* Loading placeholder */}
                      {!isImageLoaded(getBrandLogo(brand)) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin"></div>
                        </div>
                      )}
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