"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

export default function BMWCarScroll() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress within the section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"], // animates during section scroll
  });

  // Car moves from right (offscreen) to left (offscreen) - Apple-style smooth movement
  const carX = useTransform(scrollYProgress, [0, 1], ["100vw", "-100vw"]);

  // Wheel rotation perfectly synced to car movement (clockwise/forward rotation)
  // Negative rotation for forward movement (right to left)
  const wheelRotate = useTransform(scrollYProgress, [0, 1], [0, -8 * 360]); // Negative for clockwise rotation

  // Optional: Add subtle car bounce/suspension effect
  const carY = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, -2, -2, 0]);

  // Shadow opacity changes with car position for realism
  const shadowOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 0.3, 0.3, 0]);

  // BMW logo parallax effect - moves slower than the car for depth
  const logoX = useTransform(scrollYProgress, [0, 2], ["80vw", "-80vw"]); // Slower movement
  const logoOpacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]); // Fade in/out
  const logoScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 2.2]); // Subtle scaling

  return (
    <section ref={containerRef} style={{ height: "300vh" }}>
      <div className="sticky top-0 h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 overflow-hidden border-2 border-amber-700">
        
        {/* BMW Logo - Background parallax layer */}
        <motion.div
          className="absolute z-0 pointer-events-none"
          style={{
            x: logoX,
            opacity: logoOpacity,
            scale: logoScale,
            willChange: 'transform'
          }}
        >
          <Image
            src="https://amseelcars.com/wp-content/uploads/2025/03/bmw-01.svg" // Make sure you have this image
            alt="BMW Logo"
            width={300}
            height={300}
            className="drop-shadow-lg opacity-20" // Semi-transparent for background effect
            draggable={false}
          />
        </motion.div>

        {/* Car wrapper with Apple-style smooth transforms */}
        <motion.div
          className="relative z-10" // Higher z-index to be in front of logo
          style={{ 
            x: carX, 
            y: carY,
            width: 1220,
            willChange: 'transform' // Optimize for smooth animation
          }}
        >
          {/* Car body */}
          <Image
            src="/images/bmw-body.png"
            alt="BMW X3 body"
            width={720}
            height={400}
            className="block w-full h-auto pointer-events-none select-none"
            draggable={false}
            priority // Load immediately for smooth animation
          />

          {/* Rear wheel with smooth rotation */}
          <motion.div
            className="absolute bottom-[16.3%] left-[9.7%] w-[190.5px] h-[190.5px]"
            style={{ 
              rotate: wheelRotate,
              willChange: 'transform'
            }}
          >
            <Image
              src="/images/wheel-rear.png"
              alt="Rear wheel"
              width={120}
              height={120}
              className="w-full h-full pointer-events-none select-none"
              draggable={false}
            />
          </motion.div>

          {/* Front wheel with smooth rotation */}
          <motion.div
            className="absolute bottom-[16.3%] left-[70.5%] w-[190.5px] h-[190.5px]"
            style={{ 
              rotate: wheelRotate,
              willChange: 'transform'
            }}
          >
            <Image
              src="/images/wheel-front.png"
              alt="Front wheel"
              width={120}
              height={120}
              className="w-full h-full pointer-events-none select-none"
              draggable={false}
            />
          </motion.div>

          {/* Dynamic shadow that fades with car position */}
          <motion.div 
            className="absolute -bottom-[19%] left-1/2 -translate-x-1/2 w-[60%] h-[20px] bg-black blur-2xl rounded-full"
            style={{ 
              opacity: shadowOpacity,
              willChange: 'opacity'
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}
