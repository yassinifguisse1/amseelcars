"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import Rounded from '../../common/RoundedButton';


export default function BMWCarScroll() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress within the section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"], // animates during section scroll
  });

  // Car moves from center to left (offscreen) - Apple-style smooth movement
  const carX = useTransform(scrollYProgress, [0, 1], ["0vw", "-100vw"]);

  // Wheel rotation perfectly synced to car movement (clockwise/forward rotation)
  // Negative rotation for forward movement (right to left)
  const wheelRotate = useTransform(scrollYProgress, [0, 1], [0, -8 * 180]); // Negative for clockwise rotation

  // Optional: Add subtle car bounce/suspension effect
  const carY = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, -2, -2, 0]);

  // Shadow opacity changes with car position for realism
  const shadowOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 0.3, 0.3, 0]);

  // BMW X3 text parallax effect - moves slower than the car for depth
  const textX = useTransform(scrollYProgress, [0, 1], ["50vw", "-50vw"]); // Slower movement
  const textOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.1, 0.8, 0.8, 0.1]); // Fade in/out
  const textScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 1.1]); // Subtle scaling

  return (
    <section ref={containerRef} style={{ height: "300vh" }}>
      <div className="sticky top-0 h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 overflow-hidden border-2 border-red-500">
        
        {/* BMW X3 M Logo - Background parallax layer */}
        <motion.div
          className="absolute z-0 pointer-events-none select-none top-1/4 left-1/14 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            x: textX,
            opacity: textOpacity,
            scale: textScale,
            willChange: 'transform'
          }}
        >
          <Image
            src="/images/x3-bm.webp" // You'll need to save the image with this name
            alt="BMW X3 M Logo"
            width={800}
            height={200}
            className="opacity-100 drop-shadow-2xl"
            draggable={false}
            priority
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

        {/* Book Now Button - moves with the car */}
        <motion.div
          className="absolute bottom-16 z-20"
          style={{
            x: carX, // Same X movement as the car
            left: '40%',
            transform: 'translateX(-50%)',
            opacity: useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [1, 1, 1, 0]),
            y: useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0, 0, 50]),
            willChange: 'transform, opacity'
          }}
        >
          <div className="text-center space-y-4">
            {/* Car description */}
            <div className="text-gray-700 space-y-1 border-2 p-2 border-red-500">
              <h3 className="text-2xl font-bold">BMW X3 M</h3>
              <p className="text-lg">Premium SUV built for performance.</p>
              <p className="text-sm font-medium">From $89/day • Available now</p>
            </div>
            
            {/* Buttons */}
            <div className="flex items-center justify-center gap-4 border-2 border-red-500">
              <Rounded backgroundColor={"#334BD3"} >
                <p>
                Book Now

                </p>
              </Rounded>
              <Rounded backgroundColor={"#334BD3"} >
                <p>
                Explore
                </p>
              </Rounded>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
