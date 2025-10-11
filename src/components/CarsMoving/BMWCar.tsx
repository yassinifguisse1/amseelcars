"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import Rounded from '../../common/RoundedButton';


declare global {
  interface Window {
    __bmwNavDebug?: (enabled: boolean) => void;
  }
}

// Image preloading hook for better performance
// function useImagePreloader(imageUrls: string[]) {
//   const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
//   const [isLoading, setIsLoading] = useState(true);



//   // useEffect(() => {
//     // const preloadImage = (src: string): Promise<void> => {
//     //   return new Promise((resolve, reject) => {
//     //     const img = document.createElement('img');
//     //     img.onload = () => {
//     //       setLoadedImages(prev => new Set([...prev, src]));
//     //       resolve();
//     //     };
//     //     img.onerror = reject;
//     //     img.src = src;
//     //   });
//     // };

//     // const preloadAllImages = async () => {
//     //   try {
//     //     await Promise.allSettled(imageUrls.map(preloadImage));
//     //     setIsLoading(false);
//     //     console.log('All car images preloaded successfully');
//     //   } catch (error) {
//     //     console.error('Error preloading images:', error);
//     //     setIsLoading(false);
//     //   }
//     // };

//     // preloadAllImages();
//   // }, [imageUrls]);

//   return { loadedImages, isLoading };
// }

// Tiny helper to return a numeric value based on Tailwind-style breakpoints
function useBreakpointValue(values: {
  base: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  xxl?: number;
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Tailwind breakpoints
  if (width < 640) return values.base; // sm
  if (width < 768) return values.sm ?? values.base; // md
  if (width < 1024) return values.md ?? values.sm ?? values.base; // lg
  if (width < 1280) return values.lg ?? values.md ?? values.base; // xl
  if (width < 1536) return values.xl ?? values.lg ?? values.md ?? values.base; // 2xl
  return values.xxl ?? values.xl ?? values.lg ?? values.md ?? values.base;
}

// Custom hook to detect 1080×500 resolution (wide but short screens)
function useShortLandscape() {
  const [isShortLandscape, setIsShortLandscape] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      // Detect wide but short screens (like 900×800)
      const isWideButShort = width >= 900 && height <= 800;
      setIsShortLandscape(isWideButShort);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return isShortLandscape;
}

// Custom hook to detect 1080×500 resolution (wide but short screens)



export default function BMWCarScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNavigating, setIsNavigating] = useState(false);



  // const [ctaInteractivity, setCtaInteractivity] = useState({
  //   bmw: true,
  //   kia: false,
  //   touareg: false,
  //   golf: false,
  //   final: false
  // });
  // const [navDebugEnabled, setNavDebugEnabled] = useState(false);

  // useEffect(() => {
  //   if (typeof window === "undefined") return;

  //   const toggleDebug = (enabled: boolean) => {
  //     if (enabled) {
  //       window.localStorage.setItem("bmw-nav-debug", "true");
  //       setNavDebugEnabled(true);
  //     } else {
  //       window.localStorage.removeItem("bmw-nav-debug");
  //       setNavDebugEnabled(false);
  //     }
  //   };

  //   window.__bmwNavDebug = toggleDebug;

  //   return () => {
  //     if (window.__bmwNavDebug === toggleDebug) {
  //       delete window.__bmwNavDebug;
  //     }
  //   };
  // }, []);

  // useEffect(() => {
  //   if (typeof window === "undefined") return;

  //   const url = new URL(window.location.href);
  //   const hasParam = url.searchParams.has("debug-nav");
  //   const paramValue = url.searchParams.get("debug-nav");
  //   const hash = window.location.hash.toLowerCase();
  //   const forcedOff =
  //     (paramValue && ["0", "false", "off"].includes(paramValue.toLowerCase())) ||
  //     hash.includes("debug-nav=off");

  //   if (forcedOff) {
  //     if (navDebugEnabled) {
  //       console.info("[BMWCarScroll] Navigation debug disabled for this session.");
  //     }
  //     window.localStorage.removeItem("bmw-nav-debug");
  //     setNavDebugEnabled(false);
  //     return;
  //   }

  //   const stored = window.localStorage.getItem("bmw-nav-debug") === "true";
  //   const enabled = stored || hash.includes("debug-nav") || hasParam;

  //   if (enabled) {
  //     window.localStorage.setItem("bmw-nav-debug", "true");
  //     if (!navDebugEnabled) {
  //       console.info(
  //         "[BMWCarScroll] Navigation debug enabled. Remove the 'debug-nav' flag or call localStorage.removeItem('bmw-nav-debug') to disable."
  //       );
  //     }
  //     setNavDebugEnabled(true);
  //   }
  // }, [navDebugEnabled]);

  // useEffect(() => {
  //   if (!navDebugEnabled || typeof window === "undefined") return;

  //   const describeElement = (element: Element) => {
  //     const idPart = element.id ? `#${element.id}` : "";
  //     let classPart = "";
  //     const className = (element as HTMLElement).className;
  //     if (typeof className === "string" && className.trim().length) {
  //       classPart = `.${className.trim().split(/\s+/).join('.')}`;
  //     } else if (typeof className === "object" && "baseVal" in className && className.baseVal.trim().length) {
  //       classPart = `.${className.baseVal.trim().split(/\s+/).join('.')}`;
  //     }
  //     return `${element.tagName.toLowerCase()}${idPart}${classPart}`;
  //   };

  //   const buildPointerSnapshot = (event: PointerEvent) => {
  //     const path = event.composedPath();
  //     const elements = path.filter((node): node is Element => node instanceof Element);
  //     return elements.map(element => {
  //       const computed = window.getComputedStyle(element);
  //       const parsedOpacity = Number.parseFloat(computed.opacity);
  //       const opacity = Number.isNaN(parsedOpacity) ? 1 : parsedOpacity;
  //       const insideBMWCar = containerRef.current?.contains(element) ?? false;
  //       return {
  //         descriptor: describeElement(element),
  //         pointerEvents: computed.pointerEvents,
  //         visibility: computed.visibility,
  //         display: computed.display,
  //         opacity,
  //         zIndex: computed.zIndex,
  //         insideBMWCar,
  //       };
  //     });
  //   };

  //   const findInteractive = (snapshot: ReturnType<typeof buildPointerSnapshot>) =>
  //     snapshot.find(item => item.pointerEvents !== "none" && item.visibility !== "hidden" && item.display !== "none" && item.opacity > 0.01);

  //   const logPointerEvent = (phase: "down" | "up") => (event: PointerEvent) => {
  //     const snapshot = buildPointerSnapshot(event);
  //     const firstInteractive = findInteractive(snapshot);
  //     const firstBMWBlocker = snapshot.find(
  //       item => item.insideBMWCar && item.pointerEvents !== "none" && item.visibility !== "hidden" && item.display !== "none" && item.opacity > 0.01
  //     );
  //     const targetDescription = event.target instanceof Element ? describeElement(event.target) : event.target;

  //     console.debug(`[BMWCarScroll][pointer${phase}]`, {
  //       time: new Date().toISOString(),
  //       pointerType: event.pointerType,
  //       target: targetDescription,
  //       firstInteractive,
  //       firstBMWBlocker,
  //       snapshot,
  //     });
  //   };

  //   const onPointerDown = logPointerEvent("down");
  //   const onPointerUp = logPointerEvent("up");

  //   document.addEventListener("pointerdown", onPointerDown, true);
  //   document.addEventListener("pointerup", onPointerUp, true);

  //   return () => {
  //     document.removeEventListener("pointerdown", onPointerDown, true);
  //     document.removeEventListener("pointerup", onPointerUp, true);
  //   };
  // }, [navDebugEnabled]);

  // useEffect(() => {
  //   if (navDebugEnabled) {
  //     console.debug("[BMWCarScroll] CTA interactivity state", ctaInteractivity);
  //   }
  // }, [ctaInteractivity, navDebugEnabled]);

  // useEffect(() => {
  //   if (navDebugEnabled) {
  //     console.debug("[BMWCarScroll] isNavigating", isNavigating);
  //   }
  // }, [isNavigating, navDebugEnabled]);
  
  // Use the custom hook to detect short landscape screens
  const isShortLandscape = useShortLandscape();
  // Define all images that need to be preloaded for instant loading
  // const criticalImages = [
  //   '/images/bmw-body.webp',
  //   '/images/wheel-rear.webp',
  //   '/images/wheel-front.webp',
  //   '/images/kia body.webp',
  //   '/images/left wheel kia.webp',
  //   '/images/right wheel kia.webp',
  //   '/images/t-roc body.webp',
  //   '/images/t-roc wheel left.webp',
  //   '/images/t-roc wheel right.webp',
  //   '/images/golf8-body.webp',
  //   '/images/golf8-wheel-left.webp',
  //   '/images/golf8-wheel-right.webp',
  //   '/images/x3-bm.webp',
  //   '/images/Kia-sportage-logo.webp',
  //   '/images/t roc logo-0014.webp',
  //   '/images/GOLF 8 LOGO PNG.webp'
  // ];

  // Preload all critical images
  // const { loadedImages, isLoading: imagesLoading } = useImagePreloader(criticalImages);

  // Track scroll progress within the section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  // useEffect(() => {
  //   const updateCtaInteractivity = (latest: number) => {
  //     const next = {
  //       bmw: latest <= 0.55,
  //       kia: latest >= 0.18 && latest < 0.68,
  //       touareg: latest >= 0.45 && latest < 0.88,
  //       golf: latest >= 0.7 && latest < 1.05,
  //       final: latest >= 0.78
  //     } as const;

  //     setCtaInteractivity(prev =>
  //       prev.bmw === next.bmw &&
  //       prev.kia === next.kia &&
  //       prev.touareg === next.touareg &&
  //       prev.golf === next.golf &&
  //       prev.final === next.final
  //         ? prev
  //         : next
  //     );
  //   };

  //   updateCtaInteractivity(scrollYProgress.get());
  //   const unsubscribe = scrollYProgress.on("change", updateCtaInteractivity);

  //   return () => {
  //     unsubscribe();
  //   };
  // }, [scrollYProgress]);

  // Helper function to check if image is loaded
  // const isImageLoaded = useCallback((src: string) => loadedImages.has(src), [loadedImages]);

  // Custom navigation handler to prevent multiple rapid clicks
  const handleNavigation = useCallback((href: string) => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    
    // Use window.location for faster navigation
    window.location.href = href;
    
    // Reset after a delay
    setTimeout(() => {
      
      setIsNavigating(false);
    }, 2000);
  }, [isNavigating ]);

  // Responsive start offsets to keep consistent spacing across devices
  const bmwStartVW = useBreakpointValue({ base: 12, md: 16, lg: 20 });
  const kiaStartVW = useBreakpointValue({ base: 125, md: 130, lg: 150, xl: 105 });
  const bmwTextStartVW = useBreakpointValue({ base: 44, md: 45, lg: 50 });
  const kiaTextStartVW = useBreakpointValue({ base: 120, md: 135, lg: 120, xl: 110 });
  const touaregStartVW = useBreakpointValue({ base: 230, md: 230, lg: 260, xl: 185 });
  const touaregTextStartVW = useBreakpointValue({ base: 230, md: 215, lg: 200, xl: 190 });
  const golf8StartVW = useBreakpointValue({ base: 340, md: 355, lg: 350, xl: 280 });
  const golf8TextStartVW = useBreakpointValue({ base: 340, md: 325, lg: 310, xl: 300 });


  // BMW Car Animations (first part: 0 to 0.3)
  const bmwCarX = useTransform(scrollYProgress, [0, 0.3], [`${bmwStartVW}vw`, "-100vw"]);
  const bmwWheelRotate = useTransform(scrollYProgress, [0, 0.3], [0, -7 * 180]);
  const bmwCarY = useTransform(scrollYProgress, [0.25, 0.3, 0.5, 0.55], [0, -2, -2, 0]);
  // const bmwShadowOpacity = useTransform(scrollYProgress, [0, 0.1, 0.2, 0.3], [0, 0.3, 0.3, 0]);
  const bmwTextX = useTransform(scrollYProgress, [0, 0.3], [`${bmwTextStartVW}vw`, "-50vw"]);
  // const bmwTextOpacity = useTransform(scrollYProgress, [0, 0.1, 0.2, 0.3], [0.1, 0.8, 0.8, 0.1]);
  const bmwTextScale = useTransform(scrollYProgress, [0, 0.15, 0.3], [0.9, 1, 1.1]);
  const bmwOpacity = useTransform(scrollYProgress, [0, 0.2, 0.25, 0.35], [1, 1, 1, 0]);

  // KIA Car Animations (second part: 0.25 to 0.55)
  const kiaCarX = useTransform(scrollYProgress, [0, 0.5], [`${kiaStartVW}vw`, "-100vw"]);
  const kiaWheelRotate = useTransform(scrollYProgress, [0, 0.5], [0, -11 * 180]);
  const kiaCarY = useTransform(scrollYProgress, [0.5, 0.55, 0.75, 0.8], [0, -2, -2, 0]);
  // const kiaShadowOpacity = useTransform(scrollYProgress, [0.25, 0.3, 0.5, 0.55], [0, 0.6, 0.6, 0]);
  const kiaTextX = useTransform(scrollYProgress, [0, 0.7], [`${kiaTextStartVW}vw`, "-100vw"]);
  const kiaTextOpacity = useTransform(scrollYProgress, [0.1, 0.2, 0.3, 0.4], [0.1, 0.8, 0.8, 0.1]);
  const kiaTextScale = useTransform(scrollYProgress, [0.25, 0.4, 0.55], [0.9, 1, 1.1]);
  // const kiaOpacity = useTransform(scrollYProgress, [0.2, 0.3, 0.5, 0.6], [0, 1, 1, 0]);





  // Touareg Car Animations (third part: 0.5 to 0.8)
  const touaregCarX = useTransform(scrollYProgress, [0, 0.7], [`${touaregStartVW}vw`, "-100vw"]);
  const touaregWheelRotate = useTransform(scrollYProgress, [0, 0.7], [0, -7 * 180]);
  const touaregCarY = useTransform(scrollYProgress, [0.5, 0.55, 0.75, 0.8], [-20, -20, -20, 0]);
  // const touaregShadowOpacity = useTransform(scrollYProgress, [0.5, 0.55, 0.75, 0.8], [0, 0.4, 0.4, 0]);
  const touaregTextX = useTransform(scrollYProgress, [0, 0.7], [`${touaregTextStartVW}vw`, "-50vw"]); // Same timing as car
  const touaregTextOpacity = useTransform(scrollYProgress, [0.2, 0.3, 0.5, 0.55], [0.1, 0.8, 0.8, 0.1]); // Same timing as car
  const touaregTextScale = useTransform(scrollYProgress, [0.5, 0.65, 0.8], [0.9, 1, 1.1]);
  // const touaregOpacity = useTransform(scrollYProgress, [0.45, 0.55, 0.75, 0.85], [0, 1, 1, 0]);



  // Golf 8 Car Animations (fourth part: 0.75 to 1.0)
  const golf8CarX = useTransform(scrollYProgress, [0, 0.9], [`${golf8StartVW}vw`, "-100vw"]);
  const golf8WheelRotate = useTransform(scrollYProgress, [0, 0.95], [0, -10 * 180]);
  const golf8CarY = useTransform(scrollYProgress, [0.75, 0.8, 0.95, 1], [0, -2, -2, 0]);
  // const golf8ShadowOpacity = useTransform(scrollYProgress, [0.75, 0.8, 0.95, 1], [0, 0.3, 0.3, 0]);
  const golf8TextX = useTransform(scrollYProgress, [0, 1], [`${golf8TextStartVW}vw`, "-100vw"]);
  const golf8TextOpacity = useTransform(scrollYProgress, [0.45, 0.6, 0.6, 0.85], [0.1, 0.9, 0.9, 0.1]);
  const golf8TextScale = useTransform(scrollYProgress, [0.5, 0.65, 0.8], [0.9, 1, 1.1]);
  // const golf8Opacity = useTransform(scrollYProgress, [0.7, 0.8, 0.95, 1], [0, 1, 1, 1]);

  // Background color transitions
  const backgroundOpacity = useTransform(scrollYProgress, [0.2, 0.35], [0, 1]); // BMW to KIA (gray to red)
  const backgroundOpacity2 = useTransform(scrollYProgress, [0.45, 0.6], [0, 1]); // KIA to Touareg (red to blue)
  const backgroundOpacity3 = useTransform(scrollYProgress, [0.7, 0.85], [0, 1]); // Touareg to Golf 8 (blue to red)



      return (
    <section ref={containerRef} style={{ height: "500vh" }}>
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden ">
        
        {/* Loading indicator */}
        {/* {imagesLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-lg">Loading car models...</p>
              <p className="text-sm text-gray-300 mt-2">
                {loadedImages.size}/{criticalImages.length} images loaded
              </p>
            </div>
          </div>
        )} */}
        
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-gray-200 pointer-events-none" />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-b  from-gray-100 to-gray-200 pointer-events-none"
          style={{ opacity: backgroundOpacity }}
        />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-b  from-gray-100 to-gray-200 pointer-events-none"
          style={{ opacity: backgroundOpacity2 }}
        />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-b  from-gray-100 to-gray-200 pointer-events-none"
          style={{ opacity: backgroundOpacity3 }}
        />

        {/* BMW Section */}
        <motion.div
       style={{ opacity: bmwOpacity }}
      className="absolute inset-0 flex items-center justify-center px-3 sm:px-6 pointer-events-none">
      {/* BMW X3 M Logo — responsive position/size */}
      <motion.div
        className="
          absolute z-0 pointer-events-none select-none
          top-[35%] sm:top-[29%] lg:top-1/4
          left-[14%] sm:left-[10%] lg:left-[7%]
          -translate-x-1/2 -translate-y-1/2
        "
        style={{ 
          x: bmwTextX, 
          top: isShortLandscape ? '20%' : '',
          // opacity: isImageLoaded('/images/x3-bm.webp') ? bmwTextOpacity : 0, 
          scale: bmwTextScale, 
          willChange: 'transform' 
        }}
      >
    <div className="relative h-auto w-[clamp(180px,50vw,640px)] sm:w-[clamp(220px,45vw,700px)] md:w-[clamp(260px,40vw,760px)]">
      <Image
        src="/images/x3-bm.webp"
        alt="BMW X3 M Logo"
        width={1400}
        height={350}
        sizes="(max-width: 640px) 60vw, (max-width: 1024px) 45vw, 35vw"
        className="w-full h-auto opacity-100 drop-shadow-2xl"
        draggable={false}
        priority={true} // High priority for first car
        
      />
    </div>
      </motion.div>

  {/* BMW Car wrapper — fluid width via clamp() */}
  <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none">

  <motion.div
    className="relative z-10 pointer-events-none"
    style={{
      x: bmwCarX,
      y: bmwCarY,
      top: isShortLandscape ? '-1vh' : '',
      width: isShortLandscape 
        ? 'min(1120px, 85vw, calc(70vh * 1.8))' 
        : 'clamp(280px, 85vw, 1120px)',
      // opacity: isImageLoaded('/images/bmw-body.webp') && 
      //          isImageLoaded('/images/wheel-rear.webp') && 
      //          isImageLoaded('/images/wheel-front.webp') ? 1 : 0,
      willChange: 'transform',
    }}
  >
    {/* BMW Car body (keeps aspect, no CLS) */}
    <Image
      src="/images/bmw-body.webp"
      alt="BMW X3 body"
      width={1440}
      height={800}
      sizes="(max-width: 640px) 85vw, (max-width: 1024px) 70vw, 60vw"
      className="block w-full h-auto pointer-events-none select-none"
      draggable={false}
      priority={true} // High priority for first car
    />

    {/* Rear wheel */}
    <motion.div
      className="absolute bottom-[16.3%] left-[9.6%] w-[16%] aspect-square"
      style={{ rotate: bmwWheelRotate, willChange: 'transform' }}
      data-noindex="true"
    >
      <Image
        src="/images/wheel-rear.webp"
        alt=""
        fill
        sizes="(max-width: 640px) 22vw, (max-width: 1024px) 18vw, 16vw"
        className="object-contain pointer-events-none select-none"
        draggable={false}
        priority={true}
        data-noindex="true"
      />
    </motion.div>

    {/* Front wheel */}
    <motion.div
      className="absolute bottom-[16.3%] left-[70.4%] w-[16%] aspect-square"
      style={{ rotate: bmwWheelRotate, willChange: 'transform' }}
      data-noindex="true"
    >
      <Image
        src="/images/wheel-front.webp"
        alt=""
        fill
        sizes="(max-width: 640px) 22vw, (max-width: 1024px) 18vw, 16vw"
        className="object-contain pointer-events-none select-none"
        draggable={false}
        priority={true}
        data-noindex="true"
      />
    </motion.div>

   {/* BMW Book Now Button (follows car) */}
   <motion.div
    className="  absolute left-1/2 -translate-x-1/2 z-60 w-full max-w-[90vw]  "
    style={{
      // x: bmwCarX,
      // pointerEvents: ctaInteractivity.bmw ? "auto" : "none",
      top: isShortLandscape ? '65vh' : '',
      left: '50%',
      transform: 'translateX(-50%)',
      opacity: useTransform(scrollYProgress, [0.25, 0.3, 0.5, 0.55], [1, 1, 1, 0]),
      y: useTransform(scrollYProgress, [0.25, 0.3, 0.5, 0.55], [0, 0, 0, 50]),
      willChange: 'transform, opacity',
      
    }}
  >
      <div className="text-center px-3 sm:px-4 md:px-0 space-y-2 sm:space-y-3 md:space-y-4 max-w-[90vw] md:max-w-none"
      style={{
        gap: isShortLandscape ? '0.25rem' : 'clamp(0.25rem, 2vw, 0.75rem)'
      }}
      >
                <div className="p-2"
                style={{
                  padding: isShortLandscape ? '0.25rem' : 'clamp(0.25rem, 1vw, 0.5rem)'
                }}
                >
                  <h3 className="text-base sm:text-lg md:text-2xl font-bold"
                  style={{
                    fontSize: isShortLandscape ? '1.125rem' : 'clamp(0.875rem, 4vw, 1.5rem)'
                  }}
                  >BMW X3 M</h3>
                  <p className="text-xs sm:text-sm md:text-lg"
                  style={{
                    fontSize: isShortLandscape ? '0.875rem' : 'clamp(0.75rem, 3vw, 1.125rem)'
                  }}
                  >SUV premium conçu pour la performance.</p>
                </div>
                <div className="flex items-center justify-center pointer-events-auto"
                style={{
                  gap: isShortLandscape ? '0.25rem' : 'clamp(0.25rem, 2vw, 0.75rem)'
                }}
                >
                  <Rounded 
                    backgroundColor="#D32F2F" 
                    onClick={() => handleNavigation("/cars/bmw-x3-2025")}
                    style={{ 
                      pointerEvents: isNavigating ? 'none' : 'auto',
                      opacity: isNavigating ? 0.7 : 1,
                      cursor: isNavigating ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <p>{isNavigating ? 'Loading...' : 'Réservez maintenant'}</p>
                  </Rounded>
                </div>
      </div>
    
    
    </motion.div>
  </motion.div>

  


  </motion.div>


</motion.div>






















        {/* --------------------------------------------KIA Section -------------------------------------------- */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center mt-[clamp(24px,8vh,120px)] bottom-[3%] md:bottom-[0%] pointer-events-none"
          // style={{ opacity: kiaOpacity }}
        >
          {/* KIA Logo - Background parallax layer */}
          <motion.div
          className=" absolute  z-0 pointer-events-none select-none top-[30%] sm:top-[24%] md:top-[23%] lg:top-[19%] left-1/10 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
            style={{
              x: kiaTextX,
              top: isShortLandscape ? '15%' : '',
              left: isShortLandscape ? '10%' : '',
              opacity: kiaTextOpacity,
              scale: kiaTextScale,
              willChange: 'transform'
            }}
          >
            <div className="relative w-[clamp(350px,50vw,840px)] sm:w-[clamp(420px,45vw,700px)] md:w-[clamp(560px,40vw,900px)]">
                <Image
                  src="/images/Kia-sportage-logo.webp"
                  alt="KIA Logo"
                  width={900}
                  height={300}
                  className="opacity-100 pointer-events-none select-none"
                  draggable={false}
                  priority
                />
            </div>
           
          
              
          </motion.div>

      {/* KIA section container (unchanged) */}
<motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none">
  <motion.div
    className="relative z-10 pointer-events-none"
    style={{
      x: kiaCarX,
      y: kiaCarY,
      // Dynamic width based on screen size
      width: isShortLandscape 
        ? 'min(1120px, 85vw, calc(70vh * 1.8))' 
        : 'clamp(280px, 85vw, 1120px)',
      // Add visual indicator for testing
      // backgroundColor: isShortLandscape ? '#ef4444' : 'transparent',
      // opacity:
      //   isImageLoaded('/images/kia body.webp') &&
      //   isImageLoaded('/images/left wheel kia.webp') &&
      //   isImageLoaded('/images/right wheel kia.webp')
      //     ? 1 : 0,
      willChange: 'transform',
    }}
  >
  

    {/* Car body */}
    <Image
      src="/images/kia body.webp"
      alt="KIA body"
      width={1440}
      height={800}
      sizes="(max-width: 640px) 85vw, (max-width: 1024px) 70vw, 60vw"
      className="block w-full h-auto pointer-events-none select-none"
      draggable={false}
      priority
    />

    {/* Wheels */}
    <motion.div
      className="absolute bottom-[16.9%] left-[12.77%] w-[15.1%] aspect-square"
      style={{ rotate: kiaWheelRotate, willChange: 'transform' }}
      data-noindex="true"
    >
      <Image 
      src="/images/left wheel kia.webp" 
      alt="" 
      fill 
      className="object-contain" 
      draggable={false} 
      sizes="(max-width: 640px) 22vw, (max-width: 1024px) 18vw, 16vw"
      priority
      data-noindex="true"/>
    </motion.div>

    <motion.div
      className="absolute bottom-[16.7%] left-[68.55%] w-[15.1%] aspect-square"
      style={{ rotate: kiaWheelRotate, willChange: 'transform' }}
      data-noindex="true"
    >
      <Image src="/images/right wheel kia.webp" alt="" fill className="object-contain" draggable={false} priority data-noindex="true"/>
    </motion.div>

    {/* ✅ CTA — positioned responsively for different screen sizes */}
    <motion.div
      className="absolute left-1/2 -translate-x-1/2 z-10 w-full max-w-[90vw] pointer-events-none"
      style={{
        // Conditional positioning based on screen size
        top: isShortLandscape ? '55vh' : 'calc(100% + clamp(18px, 2vh, 32px))',

        opacity: useTransform(scrollYProgress, [0.25, 0.3, 0.5, 0.55], [1, 1, 1, 0]),
        y:       useTransform(scrollYProgress, [0.25, 0.3, 0.5, 0.55], [0, 0, 0, 50]),
        willChange: 'transform,opacity',
      }}
    >
      <div 
        className="text-center px-3 sm:px-4 mb-10"
        style={{
          // Conditional spacing based on screen size
          gap: isShortLandscape ? '0.25rem' : 'clamp(0.25rem, 2vw, 0.75rem)'
        }}
      >
        <div style={{ padding: isShortLandscape ? '0.25rem' : 'clamp(0.25rem, 1vw, 0.5rem)' }}>
          <h3 
            className="font-bold"
            style={{
              fontSize: isShortLandscape ? '1.125rem' : 'clamp(0.875rem, 4vw, 1.5rem)'
            }}
          >
            KIA Sportage
          </h3>
          <p 
            style={{
              fontSize: isShortLandscape ? '0.875rem' : 'clamp(0.75rem, 3vw, 1.125rem)'
            }}
          >
            Le design dynamique rencontre une technologie avancée.
          </p>
        </div>
        <div className="flex justify-center pointer-events-auto">
          <Rounded
            backgroundColor="#D32F2F"
            onClick={() => handleNavigation('/cars/kia-sportage-2025-diesel-auto-verte')}
            style={{ 
              pointerEvents: isNavigating ? 'none' : 'auto',
              opacity: isNavigating ? 0.7 : 1,
              cursor: isNavigating ? 'not-allowed' : 'pointer'
            }}
          >
            <p>Réservez maintenant</p>
          </Rounded>
        </div>
      </div>
    </motion.div>




    
  </motion.div>


  {/* ✅ KIA Car wrapper — height-aware + spacing variables */}





  
</motion.div>

       </motion.div>



































        {/* --------------------------------------------Touareg Section -------------------------------------------- */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center mt-[110px] bottom-[3%] md:bottom-[0%] pointer-events-none"
          // style={{ opacity: touaregOpacity }}
        >
          {/* Touareg Logo - Background parallax layer */}
         
           {/* Touareg Logo - Background parallax layer */}
           <motion.div
            className="absolute z-0 pointer-events-none select-none top-[28%] sm:top-[22%] md:top-[21%] lg:top-[17%] left-1/10 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              x: touaregTextX,
              top: isShortLandscape ? '10%' : '',
              left: isShortLandscape ? '20%' : '',
              opacity: touaregTextOpacity,
              scale: touaregTextScale,
              willChange: 'transform'
            }}
          >
            <div className="relative w-[clamp(350px,50vw,840px)] sm:w-[clamp(420px,45vw,700px)] md:w-[clamp(560px,40vw,900px)] "
            style={{
              width: isShortLandscape ? 'clamp(350px,50vw,840px)' : ''
            }}
            >
              
            <Image
              src="/images/t roc logo-0014.webp"
              alt="Touareg Logo"
              width={800}
              height={200}
              className="opacity-100 drop-shadow-2xl"
              draggable={false}
              priority
            />
            </div>
            
          </motion.div>

          {/* Touareg Car wrapper */}
          <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none">

          <motion.div
            className="relative z-10 pointer-events-none"
            style={{ 
              x: touaregCarX, 
              y: touaregCarY,
              top: isShortLandscape ? '-3.6vh' : '',

                width: isShortLandscape 
          ? 'min(1120px, 85vw, calc(70vh * 1.8))' 
          : 'clamp(280px, 85vw, 1120px)',
                // opacity: isImageLoaded('/images/t-roc body.webp') && 
                //          isImageLoaded('/images/t-roc wheel left.webp') && 
                //        isImageLoaded('/images/t-roc wheel right.webp') ? 1 : 0,
              willChange: 'transform',
            }}
          >
            {/* Touareg Car body */}
            <Image
              src="/images/t-roc body.webp"
              alt="Touareg body"
              width={1440}
              height={800}
              sizes="(max-width: 640px) 85vw, (max-width: 1024px) 70vw, 60vw"
              className="block w-full h-auto pointer-events-none select-none"
              draggable={false}
              priority={true}
            />

            {/* Touareg Rear wheel (left) */}
            <motion.div
              className="absolute bottom-[9%] left-[11.9%] w-[16%] aspect-square"
              style={{
                rotate: touaregWheelRotate,
                willChange: 'transform'
              }}
              data-noindex="true"
            >
              <Image
                src="/images/t-roc wheel left.webp"
                alt=""
                fill
                sizes="(max-width: 640px) 22vw, (max-width: 1024px) 18vw, 16vw"
                className="object-contain pointer-events-none select-none"
                draggable={false}
                priority={true}
                data-noindex="true"
              />
            </motion.div>

            {/* Touareg Front wheel (right) */}
            <motion.div
              className="absolute bottom-[9.2%] left-[73.5%] w-[16%] aspect-square"
              style={{ 
                rotate: touaregWheelRotate,
                willChange: 'transform'
              }}
              data-noindex="true"
            >
              <Image
                src="/images/t-roc wheel right.webp"
                alt=""
                fill
                sizes="(max-width: 640px) 22vw, (max-width: 1024px) 18vw, 16vw"
                className="object-contain pointer-events-none select-none"
                draggable={false}
                priority={true}
                data-noindex="true"
              />
            </motion.div>

            {/* Touareg Book Now Button */}
          <motion.div
              className="
               absolute left-1/2 -translate-x-1/2 z-0 w-full max-w-[90vw] "
              
              style={{
                // x: touaregCarX,
                // pointerEvents: ctaInteractivity.touareg ? "auto" : "none",
                top: isShortLandscape ? '51vh' : 'calc(100% + clamp(18px, 2vh, 32px))',
                opacity: useTransform(scrollYProgress, [0.5, 0.55, 0.75, 0.8], [1, 1, 1, 0]),
                 y: useTransform(scrollYProgress, [0.5, 0.55, 0.75, 0.8], [0, 0, 0, 50]),
                willChange: 'transform, opacity',
              }}
            >
              <div className="text-center px-3 sm:px-4 md:px-0 space-y-2 sm:space-y-3 md:space-y-4 max-w-[90vw] md:max-w-none "
              style={{
                gap: isShortLandscape ? '0.25rem' : 'clamp(0.25rem, 2vw, 0.75rem)'
              }}
              >
                <div className="p-2">
                <h3 
            className="font-bold"
            style={{
              fontSize: isShortLandscape ? '1.125rem' : 'clamp(0.875rem, 4vw, 1.5rem)'
            }}
          >T-Roc</h3>
                  <p 
            style={{
              fontSize: isShortLandscape ? '0.875rem' : 'clamp(0.75rem, 3vw, 1.125rem)'
            }}
          >Compact SUV conçu pour la performance.</p>
                </div>
                <div className="flex items-center justify-center pointer-events-auto">
                  <Rounded 
                    backgroundColor="#D32F2F" 
                    onClick={() => handleNavigation("/cars/T-Roc-2024")}
                    style={{ 
                      pointerEvents: isNavigating ? 'none' : 'auto',
                      opacity: isNavigating ? 0.7 : 1,
                      cursor: isNavigating ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <p>{isNavigating ? 'Loading...' : 'Réservez maintenant'}</p>
                  </Rounded>
                </div>
              </div>
            </motion.div>

          </motion.div>


          </motion.div>

         



        </motion.div>
        
        {/* Golf 8 Section */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center mt-[110px] bottom-[3%] md:bottom-[0%] pointer-events-none"
          // style={{ opacity: golf8Opacity }}
        >
          {/* Golf 8 Logo - Background parallax layer */}
       
          <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none">

          <motion.div
            className="absolute z-0 pointer-events-none select-none top-[30%] sm:top-[24%] md:top-[23%] lg:top-[19%] left-1/10 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              x: golf8TextX,
              top: isShortLandscape ? '10%' : '',
              left: isShortLandscape ? '20%' : '',
              opacity: golf8TextOpacity,
              scale: golf8TextScale,
              willChange: 'transform'
            }}
          >
            <div className="relative w-[clamp(350px,50vw,840px)] sm:w-[clamp(420px,45vw,700px)] md:w-[clamp(560px,40vw,900px)] "
            style={{
              width: isShortLandscape ? 'clamp(350px,50vw,840px)' : ''
            }}
            >
            <Image
              src="/images/GOLF 8 LOGO PNG.webp"
              alt="Golf 8 Logo"
              width={800}
              height={200}
              className="opacity-100 drop-shadow-2xl"
              draggable={false}
              priority={true}
              
            />
            </div>
          </motion.div>


          {/* Golf 8 Car wrapper */}
          <motion.div
            className="relative z-10 pointer-events-none"
            style={{ 
              x: golf8CarX, 
              y: golf8CarY,
              top: isShortLandscape ? '-3.7vh' : '',
              width: isShortLandscape 
              ? 'min(1120px, 85vw, calc(70vh * 1.8))' 
              : 'clamp(280px, 85vw, 1120px)',
              // opacity: isImageLoaded('/images/golf8-body.webp') && 
              //          isImageLoaded('/images/golf8-wheel-left.webp') && 
              //          isImageLoaded('/images/golf8-wheel-right.webp') ? 1 : 0,
              willChange: 'transform',
            }}
          >
            {/* Golf 8 Car body */}
            <Image
              src="/images/golf8-body.webp"
              alt="Golf 8 body"
              width={1440}
              height={800}
              sizes="(max-width: 640px) 85vw, (max-width: 1024px) 70vw, 60vw"
              className="block w-full h-auto pointer-events-none select-none"
              draggable={false}
               // Lazy load for later cars
              priority={true}
            />

            {/* Golf 8 Rear wheel (left) */}
            <motion.div
              className="absolute bottom-[16.5%] left-[11.77%] w-[15.5%] aspect-square"
              style={{ 
                rotate: golf8WheelRotate,
                willChange: 'transform'
              }}
              data-noindex="true"
            >
              <Image
                src="/images/golf8-wheel-left.webp"
                alt=""
                fill
                sizes="(max-width: 640px) 22vw, (max-width: 1024px) 18vw, 16vw"
                className="object-contain pointer-events-none select-none"
                draggable={false}
                priority={true}
                data-noindex="true"
              />
            </motion.div>

            {/* Golf 8 Front wheel (right) */}
            <motion.div
              className="absolute bottom-[16.1%] left-[74.2%] w-[15.5%] aspect-square"
              style={{ 
                rotate: golf8WheelRotate,
                willChange: 'transform'
              }}
              data-noindex="true"
            >
              <Image
                src="/images/golf8-wheel-right.webp"
                alt=""
                fill
                sizes="(max-width: 640px) 22vw, (max-width: 1024px) 18vw, 16vw"
                className="object-contain pointer-events-none select-none"
                draggable={false}
                priority={true}
                data-noindex="true"
              />
            </motion.div>

          {/* Golf 8 Book Now Button */}
          <motion.div
            className=" absolute left-1/2 -translate-x-1/2 z-10 w-full max-w-[90vw"
            style={{
              // x: golf8CarX,
              // pointerEvents: ctaInteractivity.golf ? "auto" : "none",
              top: isShortLandscape ? '51vh' : '',
              left: '50%',
              transform: 'translateX(-50%)',
              opacity: useTransform(scrollYProgress, [0.75, 0.8, 0.95, 1], [1, 1, 1, 0]),
              y: useTransform(scrollYProgress, [0.75, 0.8, 0.95, 1], [0, 0, 0, 50]),
              willChange: 'transform, opacity'
            }}
          >
            <div className="text-center px-3 sm:px-4 md:px-0 space-y-2 sm:space-y-3 md:space-y-4 max-w-[90vw] md:max-w-none"
            style={{
              gap: isShortLandscape ? '0.25rem' : 'clamp(0.25rem, 2vw, 0.75rem)'
            }}
            >
              <div className=" p-2"
              style={{
                padding: isShortLandscape ? '0.25rem' : 'clamp(0.25rem, 1vw, 0.5rem)'
              }}
              >
                  <h3 
            className="font-bold"
            style={{
              fontSize: isShortLandscape ? '1.125rem' : 'clamp(0.875rem, 4vw, 1.5rem)'
            }}
          >VW Golf 8</h3>
                <p 
            style={{
              fontSize: isShortLandscape ? '0.875rem' : 'clamp(0.75rem, 3vw, 1.125rem)'
            }}
          >L’excellence compacte alliée à une innovation moderne.</p>
              </div>
              
              <div className="flex items-center justify-center pointer-events-auto"
              style={{
                gap: isShortLandscape ? '0.25rem' : 'clamp(0.25rem, 2vw, 0.75rem)'
              }}
              >
                <Rounded 
                  backgroundColor="#D32F2F" 
                  onClick={() => handleNavigation("/cars/Golf-8")}
                  style={{ 
                    pointerEvents: isNavigating ? 'none' : 'auto',
                    opacity: isNavigating ? 0.7 : 1,
                    cursor: isNavigating ? 'not-allowed' : 'pointer'
                  }}
                >
                  <p>{isNavigating ? 'Loading...' : 'Réservez maintenant'}</p>
                </Rounded>
              </div>
            </div>
          </motion.div>
          </motion.div>

          



          </motion.div>



        </motion.div>
       
        {/* Final Call-to-Action Section - Appears after Golf 8 */}
        <motion.div
          className="absolute inset-0  flex flex-col items-center justify-center z-0"
          style={{
            opacity: useTransform(scrollYProgress, [0.75, 0.8, 1], [0, 1, 1]),
            y: useTransform(scrollYProgress, [0.75, 0.8, 1], [50, 0, 0])
          }}
        >
          <div className="text-center space-y-6 sm:space-y-8 px-3 sm:px-4 max-w-[90rem] mx-auto flex flex-col items-center justify-center">
            {/* Main Heading */}
            <motion.h2 
              className="font-bold text-gray-800 leading-tight [text-wrap:balance]
                         text-[clamp(28px,7vw,56px)] md:text-[clamp(36px,6vw,72px)] lg:text-[clamp(44px,5vw,90px)]"
              style={{
                // pointerEvents: ctaInteractivity.final ? "auto" : "none",
                opacity: useTransform(scrollYProgress, [0.75, 0.8, 1], [0, 1, 1]),
                y: useTransform(scrollYProgress, [0.75, 0.8, 1], [30, 0, 0])
              }}
            >
              Votre Trajet Idéal
              <br />
              <span className="text-red-600 z-0">Vous attend</span>
            </motion.h2>
            <Rounded
              backgroundColor="#D32F2F"
              onClick={() => handleNavigation("/cars")}
              aria-label="Réservez maintenant"
              style={{ 
                pointerEvents: isNavigating ? 'none' : 'auto',
                opacity: isNavigating ? 0.7 : 1,
                cursor: isNavigating ? 'not-allowed' : 'pointer'
              }}
            >
              <p className="z-10 text-black">{isNavigating ? 'Loading...' : 'Réservez maintenant'}</p>
            </Rounded>

   

            {/* Scroll Indicator */}
            <motion.div 
              className="pt-8"
              style={{
                opacity: useTransform(scrollYProgress, [0.75, 0.8, 1], [0, 1, 1])
              }}
            >
              <div className="flex flex-col items-center border-gray-300">
                <div className="text-xs sm:text-sm mb-2">Faites défiler pour explorer plus</div>
                <div className="border-2 border-gray-300 rounded-full flex justify-center
                                w-[clamp(16px,3vw,24px)] h-[clamp(28px,5.5vw,40px)]">
                  <motion.div 
                    className="bg-gray-300 rounded-full mt-2
                               w-[clamp(3px,0.6vw,4px)] h-[clamp(10px,2vw,14px)]"
                    animate={{
                      y: [0, 12, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}