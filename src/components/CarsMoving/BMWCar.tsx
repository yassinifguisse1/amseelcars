"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import Rounded from '../../common/RoundedButton';

// Image preloading hook for better performance
function useImagePreloader(imageUrls: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const preloadImage = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = document.createElement('img');
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, src]));
          resolve();
        };
        img.onerror = reject;
        img.src = src;
      });
    };

    const preloadAllImages = async () => {
      try {
        await Promise.allSettled(imageUrls.map(preloadImage));
        setIsLoading(false);
        console.log('All car images preloaded successfully');
      } catch (error) {
        console.error('Error preloading images:', error);
        setIsLoading(false);
      }
    };

    preloadAllImages();
  }, [imageUrls]);

  return { loadedImages, isLoading };
}

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

export default function BMWCarScroll() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Define all images that need to be preloaded for instant loading
  const criticalImages = [
    '/images/bmw-body.png',
    '/images/wheel-rear.png',
    '/images/wheel-front.png',
    '/images/kia body.webp',
    '/images/left wheel kia.webp',
    '/images/right wheel kia.webp',
    '/images/t-roc body.png',
    '/images/t-roc wheel left.png',
    '/images/t-roc wheel right.png',
    '/images/golf8-body.png',
    '/images/golf8-wheel-left.png',
    '/images/golf8-wheel-right.png',
    '/images/x3-bm.webp',
    '/images/Kia-sportage-logo.webp',
    '/images/touareg-LOGO.png',
    '/images/GOLF-8-LOGO.png'
  ];

  // Preload all critical images
  const { loadedImages, isLoading: imagesLoading } = useImagePreloader(criticalImages);

  // Track scroll progress within the section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  // Helper function to check if image is loaded
  const isImageLoaded = useCallback((src: string) => loadedImages.has(src), [loadedImages]);

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
  const bmwShadowOpacity = useTransform(scrollYProgress, [0, 0.1, 0.2, 0.3], [0, 0.3, 0.3, 0]);
  const bmwTextX = useTransform(scrollYProgress, [0, 0.3], [`${bmwTextStartVW}vw`, "-50vw"]);
  const bmwTextOpacity = useTransform(scrollYProgress, [0, 0.1, 0.2, 0.3], [0.1, 0.8, 0.8, 0.1]);
  const bmwTextScale = useTransform(scrollYProgress, [0, 0.15, 0.3], [0.9, 1, 1.1]);
  const bmwOpacity = useTransform(scrollYProgress, [0, 0.2, 0.25, 0.35], [1, 1, 1, 0]);

  // KIA Car Animations (second part: 0.25 to 0.55)
  const kiaCarX = useTransform(scrollYProgress, [0, 0.5], [`${kiaStartVW}vw`, "-100vw"]);
  const kiaWheelRotate = useTransform(scrollYProgress, [0, 0.5], [0, -11 * 180]);
  const kiaCarY = useTransform(scrollYProgress, [0.5, 0.55, 0.75, 0.8], [0, -2, -2, 0]);
  const kiaShadowOpacity = useTransform(scrollYProgress, [0.25, 0.3, 0.5, 0.55], [0, 0.6, 0.6, 0]);
  const kiaTextX = useTransform(scrollYProgress, [0, 0.7], [`${kiaTextStartVW}vw`, "-100vw"]);
  const kiaTextOpacity = useTransform(scrollYProgress, [0.1, 0.2, 0.3, 0.4], [0.1, 0.8, 0.8, 0.1]);
  const kiaTextScale = useTransform(scrollYProgress, [0.25, 0.4, 0.55], [0.9, 1, 1.1]);
  // const kiaOpacity = useTransform(scrollYProgress, [0.2, 0.3, 0.5, 0.6], [0, 1, 1, 0]);





  // Touareg Car Animations (third part: 0.5 to 0.8)
  const touaregCarX = useTransform(scrollYProgress, [0, 0.7], [`${touaregStartVW}vw`, "-100vw"]);
  const touaregWheelRotate = useTransform(scrollYProgress, [0, 0.7], [0, -7 * 180]);
  const touaregCarY = useTransform(scrollYProgress, [0.5, 0.55, 0.75, 0.8], [-20, -20, -20, 0]);
  const touaregShadowOpacity = useTransform(scrollYProgress, [0.5, 0.55, 0.75, 0.8], [0, 0.4, 0.4, 0]);
  const touaregTextX = useTransform(scrollYProgress, [0, 0.7], [`${touaregTextStartVW}vw`, "-50vw"]); // Same timing as car
  const touaregTextOpacity = useTransform(scrollYProgress, [0.2, 0.3, 0.5, 0.55], [0.1, 0.8, 0.8, 0.1]); // Same timing as car
  const touaregTextScale = useTransform(scrollYProgress, [0.5, 0.65, 0.8], [0.9, 1, 1.1]);
  // const touaregOpacity = useTransform(scrollYProgress, [0.45, 0.55, 0.75, 0.85], [0, 1, 1, 0]);



  // Golf 8 Car Animations (fourth part: 0.75 to 1.0)
  const golf8CarX = useTransform(scrollYProgress, [0, 0.9], [`${golf8StartVW}vw`, "-100vw"]);
  const golf8WheelRotate = useTransform(scrollYProgress, [0, 0.95], [0, -10 * 180]);
  const golf8CarY = useTransform(scrollYProgress, [0.75, 0.8, 0.95, 1], [0, -2, -2, 0]);
  const golf8ShadowOpacity = useTransform(scrollYProgress, [0.75, 0.8, 0.95, 1], [0, 0.3, 0.3, 0]);
  const golf8TextX = useTransform(scrollYProgress, [0, 1], [`${golf8TextStartVW}vw`, "-100vw"]);
  const golf8TextOpacity = useTransform(scrollYProgress, [0.45, 0.6, 0.6, 0.85], [0.1, 0.9, 0.9, 0.1]);
  const golf8TextScale = useTransform(scrollYProgress, [0.5, 0.65, 0.8], [0.9, 1, 1.1]);
  // const golf8Opacity = useTransform(scrollYProgress, [0.7, 0.8, 0.95, 1], [0, 1, 1, 1]);

  // Background color transitions
  const backgroundOpacity = useTransform(scrollYProgress, [0.2, 0.35], [0, 1]); // BMW to KIA (gray to red)
  const backgroundOpacity2 = useTransform(scrollYProgress, [0.45, 0.6], [0, 1]); // KIA to Touareg (red to blue)
  const backgroundOpacity3 = useTransform(scrollYProgress, [0.7, 0.85], [0, 1]); // Touareg to Golf 8 (blue to red)



      return (
    <section ref={containerRef} style={{ height: "600vh" }}>
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        
        {/* Loading indicator */}
        {imagesLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-lg">Loading car models...</p>
              <p className="text-sm text-gray-300 mt-2">
                {loadedImages.size}/{criticalImages.length} images loaded
              </p>
            </div>
          </div>
        )}
        
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-gray-200" />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-b from-red-50 to-red-100"
          style={{ opacity: backgroundOpacity }}
        />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-b from-blue-50 to-blue-100"
          style={{ opacity: backgroundOpacity2 }}
        />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-b from-red-50 to-red-100"
          style={{ opacity: backgroundOpacity3 }}
        />

        {/* BMW Section */}
        <motion.div
       style={{ opacity: bmwOpacity }}
      className="absolute inset-0 flex items-center justify-center px-3 sm:px-6">
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
          opacity: isImageLoaded('/images/x3-bm.webp') ? bmwTextOpacity : 0, 
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
  <motion.div
    className="relative z-10"
    style={{
      x: bmwCarX,
      y: bmwCarY,
      width: 'clamp(280px, 85vw, 1120px)', // <— scales for all devices
      opacity: isImageLoaded('/images/bmw-body.png') && 
               isImageLoaded('/images/wheel-rear.png') && 
               isImageLoaded('/images/wheel-front.png') ? 1 : 0,
      willChange: 'transform',
    }}
  >
    {/* BMW Car body (keeps aspect, no CLS) */}
    <Image
      src="/images/bmw-body.png"
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
    >
      <Image
        src="/images/wheel-rear.png"
        alt="BMW Rear wheel"
        fill
        sizes="(max-width: 640px) 22vw, (max-width: 1024px) 18vw, 16vw"
        className="object-contain pointer-events-none select-none"
        draggable={false}
        loading="eager" // Critical for wheel sync
      />
    </motion.div>

    {/* Front wheel */}
    <motion.div
      className="absolute bottom-[16.3%] left-[70.4%] w-[16%] aspect-square"
      style={{ rotate: bmwWheelRotate, willChange: 'transform' }}
    >
      <Image
        src="/images/wheel-front.png"
        alt="BMW Front wheel"
        fill
        sizes="(max-width: 640px) 22vw, (max-width: 1024px) 18vw, 16vw"
        className="object-contain pointer-events-none select-none"
        draggable={false}
        loading="eager" // Critical for wheel sync
      />
    </motion.div>

    {/* Shadow — scale thickness with viewport */}
    <motion.div
      className="absolute left-1/2 -translate-x-1/2 w-[60%] rounded-full bg-black blur-2xl"
      style={{
        bottom: 'calc(-1 * clamp(6px, 2.2vw, 20px))',
        height: 'clamp(6px, 2.2vw, 20px)',
        opacity: bmwShadowOpacity,
        willChange: 'opacity',
      }}
    />
  </motion.div>

  {/* BMW Book Now Button (follows car) */}
  <motion.div
    className=" absolute z-50 
                left-1/2 md:left-[50%] lg:left-[50%] 
                -translate-x-1/2 
                bottom-[clamp(135px,4vh,4rem)] md:bottom-[clamp(30px,5vh,4rem)] lg:bottom-[clamp(150px,5vh,4rem)] xl:bottom-[clamp(50px,5vh,4rem)]
                "
    style={{
      x: bmwCarX,
      left: '50%',
      transform: 'translateX(-50%)',
      opacity: useTransform(scrollYProgress, [0, 0.1, 0.2, 0.3], [1, 1, 1, 0]),
      y: useTransform(scrollYProgress, [0, 0.1, 0.2, 0.3], [0, 0, 0, 50]),
      willChange: 'transform, opacity',
      
    }}
  >
      <div className="text-center px-3 sm:px-4 md:px-0 space-y-2 sm:space-y-3 md:space-y-4 max-w-[90vw] md:max-w-none">
                <div className="p-2">
                  <h3 className="text-base sm:text-lg md:text-2xl font-bold">BMW X3 M</h3>
                  <p className="text-xs sm:text-sm md:text-lg">Premium SUV built for performance.</p>
                </div>
                <div className="flex items-center justify-center pointer-events-auto">
                  <Rounded backgroundColor="#D32F2F" href="/cars/bmw-x5-2024">
                    <p>Book Now</p>
                  </Rounded>
                </div>
      </div>
  </motion.div>
</motion.div>

        {/* KIA Section */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center mt-[clamp(24px,8vh,120px)] bottom-[3%] md:bottom-[0%] "
          // style={{ opacity: kiaOpacity }}
        >
          {/* KIA Logo - Background parallax layer */}
          <motion.div
          className=" absolute  z-0 pointer-events-none select-none top-[30%] sm:top-[24%] md:top-[23%] lg:top-[19%] left-1/10 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
            style={{
              x: kiaTextX,
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
                />
            </div>
           
            {/* <Image
              src="/images/kia-logo.webp"
              alt="KIA Logo"
              width={600}
              height={100}
              className="opacity-100 pointer-events-none select-none"
              draggable={false}
            /> */}
              
          </motion.div>

          {/* KIA Car wrapper */}
          <motion.div
            className="relative z-10"
            style={{ 
              x: kiaCarX, 
              y: kiaCarY,
              width: 'clamp(280px, 85vw, 1120px)', // <— scales for all devices
              opacity: isImageLoaded('/images/kia body.webp') && 
                       isImageLoaded('/images/left wheel kia.webp') && 
                       isImageLoaded('/images/right wheel kia.webp') ? 1 : 0,
               willChange: 'transform',
            }}
          >
            {/* KIA Car body */}
            <Image
              src="/images/kia body.webp"
              alt="KIA body"
              width={1440}
              height={800}
              sizes="(max-width: 640px) 85vw, (max-width: 1024px) 70vw, 60vw"
              className="block w-full h-auto pointer-events-none select-none"
              draggable={false}
              loading="eager" // Load eagerly for second car
            />

            {/* KIA Rear wheel (left) */}
            <motion.div
              className="absolute bottom-[16.9%] left-[12.77%] w-[15.1%] aspect-square"
              style={{ 
                rotate: kiaWheelRotate,
                willChange: 'transform'
              }}
            >
              <Image
                src="/images/left wheel kia.webp"
                alt="KIA Left wheel"
                fill
                sizes="(max-width: 640px) 22vw, (max-width: 1024px) 18vw, 16vw"
                className="object-contain pointer-events-none select-none"
                draggable={false}
                loading="eager" // Critical for wheel sync
              />
            </motion.div>

            {/* KIA Front wheel (right) */}
            <motion.div
              className="absolute bottom-[16.7%] left-[68.55%] w-[15.1%] aspect-square"
              style={{ 
                rotate: kiaWheelRotate,
                willChange: 'transform'
              }}
            >
              <Image
                src="/images/right wheel kia.webp"
                alt="KIA Right wheel"
                fill
                sizes="(max-width: 640px) 22vw, (max-width: 1024px) 18vw, 16vw"
                className="object-contain pointer-events-none select-none"
                draggable={false}
                loading="eager" // Critical for wheel sync
              />
            </motion.div>

            {/* KIA Shadow */}
            <motion.div 
              className="absolute -bottom-[7%] left-1/2 -translate-x-1/2 w-[60%] h-[20px] bg-black blur-2xl rounded-full"
              style={{ 
                opacity: kiaShadowOpacity,
                willChange: 'opacity'
              }}
            />
          </motion.div>

    
            <motion.div
              className="
                absolute z-50 
                left-1/2 md:left-[50%] lg:left-[50%] 
                -translate-x-1/2 
                bottom-[clamp(100px,4vh,4rem)] md:bottom-[clamp(30px,5vh,4rem)] lg:bottom-[clamp(150px,5vh,4rem)] xl:bottom-[clamp(50px,5vh,4rem)]
               
              "
              style={{
                x: kiaCarX,
                opacity: useTransform(scrollYProgress, [0.25, 0.3, 0.5, 0.55], [1, 1, 1, 0]),
                y: useTransform(scrollYProgress, [0.25, 0.3, 0.5, 0.55], [0, 0, 0, 50]),
                willChange: 'transform, opacity',
              }}
            >
              <div className="text-center px-3 sm:px-4 md:px-0 space-y-2 sm:space-y-3 md:space-y-4 max-w-[90vw] md:max-w-none">
                <div className="p-2">
                  <h3 className="text-base sm:text-lg md:text-2xl font-bold">KIA Sportage</h3>
                  <p className="text-xs sm:text-sm md:text-lg">Dynamic design meets advanced technology.</p>
                </div>
                <div className="flex items-center justify-center pointer-events-auto">
                  <Rounded backgroundColor="#D32F2F" href="/cars/kia-sportage-2024">
                    <p>Book Now</p>
                  </Rounded>
                </div>
              </div>
            </motion.div>
        </motion.div>

        {/* Touareg Section */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center mt-[110px] bottom-[3%] md:bottom-[0%] "
          // style={{ opacity: touaregOpacity }}
        >
          {/* Touareg Logo - Background parallax layer */}
         
           {/* Touareg Logo - Background parallax layer */}
           <motion.div
            className="absolute z-0 pointer-events-none select-none top-[28%] sm:top-[22%] md:top-[21%] lg:top-[17%] left-1/10 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              x: touaregTextX,
              opacity: touaregTextOpacity,
              scale: touaregTextScale,
              willChange: 'transform'
            }}
          >
            <div className="relative w-[clamp(350px,50vw,840px)] sm:w-[clamp(420px,45vw,700px)] md:w-[clamp(560px,40vw,900px)]">
              
            <Image
              src="/images/touareg-LOGO.png"
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
          <motion.div
            className="relative z-10 "
            style={{ 
              x: touaregCarX, 
              y: touaregCarY,
              width: 'clamp(280px, 85vw, 1120px)', // <— scales for all devices
              opacity: isImageLoaded('/images/t-roc body.png') && 
                       isImageLoaded('/images/t-roc wheel left.png') && 
                       isImageLoaded('/images/t-roc wheel right.png') ? 1 : 0,
              willChange: 'transform',
            }}
          >
            {/* Touareg Car body */}
            <Image
              src="/images/t-roc body.png"
              alt="Touareg body"
              width={1440}
              height={800}
              sizes="(max-width: 640px) 85vw, (max-width: 1024px) 70vw, 60vw"
              className="block w-full h-auto pointer-events-none select-none"
              draggable={false}
              loading="lazy" // Lazy load for later cars
            />

            {/* Touareg Rear wheel (left) */}
            <motion.div
              className="absolute bottom-[9%] left-[11.9%] w-[16%] aspect-square"
              style={{
                rotate: touaregWheelRotate,
                willChange: 'transform'
              }}
            >
              <Image
                src="/images/t-roc wheel left.png"
                alt="Touareg Left wheel"
                fill
                sizes="(max-width: 640px) 22vw, (max-width: 1024px) 18vw, 16vw"
                className="object-contain pointer-events-none select-none"
                draggable={false}
              />
            </motion.div>

            {/* Touareg Front wheel (right) */}
            <motion.div
              className="absolute bottom-[9.2%] left-[73.5%] w-[16%] aspect-square"
              style={{ 
                rotate: touaregWheelRotate,
                willChange: 'transform'
              }}
            >
              <Image
                src="/images/t-roc wheel right.png"
                alt="Touareg Right wheel"
                fill
                sizes="(max-width: 640px) 22vw, (max-width: 1024px) 18vw, 16vw"
                className="object-contain pointer-events-none select-none"
                draggable={false}
              />
            </motion.div>

            {/* Touareg Shadow */}
            <motion.div 
              className="absolute left-1/2 -translate-x-1/2 w-[60%] bg-black blur-2xl rounded-full"
              style={{ 
                opacity: touaregShadowOpacity,
                willChange: 'opacity'
              }}
            />
          </motion.div>

          {/* Touareg Book Now Button */}
          <motion.div
              className="
                absolute z-50 
                left-1/2 md:left-[50%] lg:left-[50%] 
                -translate-x-1/2 
                bottom-[clamp(100px,4vh,4rem)] md:bottom-[clamp(30px,5vh,4rem)] lg:bottom-[clamp(150px,5vh,4rem)] xl:bottom-[clamp(50px,5vh,4rem)]
               
              "
              style={{
                x: touaregCarX,
                opacity: useTransform(scrollYProgress, [0.5, 0.55, 0.75, 0.8], [1, 1, 1, 0]),
                 y: useTransform(scrollYProgress, [0.5, 0.55, 0.75, 0.8], [0, 0, 0, 50]),
                willChange: 'transform, opacity',
              }}
            >
              <div className="text-center px-3 sm:px-4 md:px-0 space-y-2 sm:space-y-3 md:space-y-4 max-w-[90vw] md:max-w-none">
                <div className="p-2">
                  <h3 className="text-base sm:text-lg md:text-2xl font-bold">T-Roc</h3>
                  <p className="text-xs sm:text-sm md:text-lg">Compact SUV built for performance.</p>
                </div>
                <div className="flex items-center justify-center pointer-events-auto">
                  <Rounded backgroundColor="#D32F2F" href="/cars/t-roc-2024">
                    <p>Book Now</p>
                  </Rounded>
                </div>
              </div>
            </motion.div>
        </motion.div>
        
        {/* Golf 8 Section */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center mt-[110px] bottom-[3%] md:bottom-[0%] "
          // style={{ opacity: golf8Opacity }}
        >
          {/* Golf 8 Logo - Background parallax layer */}
       

          <motion.div
            className="absolute z-0 pointer-events-none select-none top-[30%] sm:top-[24%] md:top-[23%] lg:top-[19%] left-1/10 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              x: golf8TextX,
              opacity: golf8TextOpacity,
              scale: golf8TextScale,
              willChange: 'transform'
            }}
          >
            <div className="relative w-[clamp(350px,50vw,840px)] sm:w-[clamp(420px,45vw,700px)] md:w-[clamp(560px,40vw,900px)]">
            <Image
              src="/images/GOLF-8-LOGO.png"
              alt="Golf 8 Logo"
              width={800}
              height={200}
              className="opacity-100 drop-shadow-2xl"
              draggable={false}
              priority
            />
            </div>
          </motion.div>

          {/* Golf 8 Car wrapper */}
          <motion.div
            className="relative z-10"
            style={{ 
              x: golf8CarX, 
              y: golf8CarY,
              width: 'clamp(280px, 85vw, 1120px)', // <— scales for all devices
              opacity: isImageLoaded('/images/golf8-body.png') && 
                       isImageLoaded('/images/golf8-wheel-left.png') && 
                       isImageLoaded('/images/golf8-wheel-right.png') ? 1 : 0,
              willChange: 'transform',
            }}
          >
            {/* Golf 8 Car body */}
            <Image
              src="/images/golf8-body.png"
              alt="Golf 8 body"
              width={1440}
              height={800}
              sizes="(max-width: 640px) 85vw, (max-width: 1024px) 70vw, 60vw"
              className="block w-full h-auto pointer-events-none select-none"
              draggable={false}
              loading="lazy" // Lazy load for later cars
            />

            {/* Golf 8 Rear wheel (left) */}
            <motion.div
              className="absolute bottom-[16.5%] left-[11.77%] w-[15.5%] aspect-square"
              style={{ 
                rotate: golf8WheelRotate,
                willChange: 'transform'
              }}
            >
              <Image
                src="/images/golf8-wheel-left.png"
                alt="Golf 8 Left wheel"
                fill
                sizes="(max-width: 640px) 22vw, (max-width: 1024px) 18vw, 16vw"
                className="object-contain pointer-events-none select-none"
                draggable={false}
              />
            </motion.div>

            {/* Golf 8 Front wheel (right) */}
            <motion.div
              className="absolute bottom-[16.1%] left-[74.2%] w-[15.5%] aspect-square"
              style={{ 
                rotate: golf8WheelRotate,
                willChange: 'transform'
              }}
            >
              <Image
                src="/images/golf8-wheel-right.png"
                alt="Golf 8 Right wheel"
                fill
                sizes="(max-width: 640px) 22vw, (max-width: 1024px) 18vw, 16vw"
                className="object-contain pointer-events-none select-none"
                draggable={false}
              />
            </motion.div>

            {/* Golf 8 Shadow */}
            <motion.div 
              className="absolute left-1/2 -translate-x-1/2 w-[60%] bg-black blur-2xl rounded-full"
              style={{ 
                opacity: golf8ShadowOpacity,
                willChange: 'opacity'
              }}
            />
          </motion.div>

          {/* Golf 8 Book Now Button */}
          <motion.div
            className=" absolute z-50 
                left-1/2 md:left-[50%] lg:left-[50%] 
                -translate-x-1/2 
                bottom-[clamp(100px,4vh,4rem)] md:bottom-[clamp(30px,5vh,4rem)] lg:bottom-[clamp(150px,5vh,4rem)] xl:bottom-[clamp(50px,5vh,4rem)]"
            style={{
              x: golf8CarX,
              left: '50%',
              transform: 'translateX(-50%)',
              opacity: useTransform(scrollYProgress, [0.75, 0.8, 0.95, 1], [1, 1, 1, 0]),
              y: useTransform(scrollYProgress, [0.75, 0.8, 0.95, 1], [0, 0, 0, 50]),
              willChange: 'transform, opacity'
            }}
          >
            <div className="text-center px-3 sm:px-4 md:px-0 space-y-2 sm:space-y-3 md:space-y-4 max-w-[90vw] md:max-w-none">
              <div className=" p-2">
                <h3 className="text-base sm:text-lg md:text-2xl font-bold">VW Golf 8</h3>
                <p className="text-xs sm:text-sm md:text-lg">Compact excellence with modern innovation.</p>
              </div>
              
              <div className="flex items-center justify-center pointer-events-auto">
                <Rounded backgroundColor={"#D32F2F"} href="/cars/golf-8-2024">
                  <p className="">Book Now</p>
                </Rounded>
              </div>
            </div>
          </motion.div>
        </motion.div>
       
        {/* Final Call-to-Action Section - Appears after Golf 8 */}
        <motion.div
          className="absolute inset-0  flex flex-col items-center justify-center z-40"
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
                opacity: useTransform(scrollYProgress, [0.75, 0.8, 1], [0, 1, 1]),
                y: useTransform(scrollYProgress, [0.75, 0.8, 1], [30, 0, 0])
              }}
            >
              Your Perfect Ride
              <br />
              <span className="text-red-600 z-0">Awaits You</span>
            </motion.h2>
            <Rounded
              backgroundColor="#D32F2F"
              href="/cars"
              aria-label="Book Now"
            >
              <p className="z-10 text-black ">Book Now</p>
            </Rounded>

   

            {/* Scroll Indicator */}
            <motion.div 
              className="pt-8"
              style={{
                opacity: useTransform(scrollYProgress, [0.75, 0.8, 1], [0, 1, 1])
              }}
            >
              <div className="flex flex-col items-center text-gray-500">
                <div className="text-xs sm:text-sm mb-2">Scroll to explore more</div>
                <div className="border-2 border-gray-400 rounded-full flex justify-center
                                w-[clamp(16px,3vw,24px)] h-[clamp(28px,5.5vw,40px)]">
                  <motion.div 
                    className="bg-gray-400 rounded-full mt-2
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
