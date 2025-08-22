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
    offset: ["start center", "end center"],
  });

  // BMW Car Animations (first part: 0 to 0.3)
  const bmwCarX = useTransform(scrollYProgress, [0, 0.3], ["0vw", "-100vw"]);
  const bmwWheelRotate = useTransform(scrollYProgress, [0, 0.3], [0, -7 * 180]);
  const bmwCarY = useTransform(scrollYProgress, [0, 0.1, 0.2, 0.3], [0, -2, -2, 0]);
  const bmwShadowOpacity = useTransform(scrollYProgress, [0, 0.1, 0.2, 0.3], [0, 0.3, 0.3, 0]);
  const bmwTextX = useTransform(scrollYProgress, [0, 0.3], ["50vw", "-50vw"]);
  const bmwTextOpacity = useTransform(scrollYProgress, [0, 0.1, 0.2, 0.3], [0.1, 0.8, 0.8, 0.1]);
  const bmwTextScale = useTransform(scrollYProgress, [0, 0.15, 0.3], [0.9, 1, 1.1]);
  const bmwOpacity = useTransform(scrollYProgress, [0, 0.2, 0.25, 0.35], [1, 1, 1, 0]);

  // KIA Car Animations (second part: 0.25 to 0.55)
  const kiaCarX = useTransform(scrollYProgress, [0.25, 0.55], ["0vw", "-100vw"]);
  const kiaWheelRotate = useTransform(scrollYProgress, [0.25, 0.55], [0, -7 * 180]);
  const kiaCarY = useTransform(scrollYProgress, [0.25, 0.3, 0.5, 0.55], [0, -2, -2, 0]);
  const kiaShadowOpacity = useTransform(scrollYProgress, [0.25, 0.3, 0.5, 0.55], [0, 0.6, 0.6, 0]);
  const kiaTextX = useTransform(scrollYProgress, [0.25, 0.55], ["50vw", "-50vw"]);
  const kiaTextOpacity = useTransform(scrollYProgress, [0.25, 0.3, 0.5, 0.55], [0.1, 0.8, 0.8, 0.1]);
  const kiaTextScale = useTransform(scrollYProgress, [0.25, 0.4, 0.55], [0.9, 1, 1.1]);
  const kiaOpacity = useTransform(scrollYProgress, [0.2, 0.3, 0.5, 0.6], [0, 1, 1, 0]);

  // Touareg Car Animations (third part: 0.5 to 0.8)
  const touaregCarX = useTransform(scrollYProgress, [0.5, 0.8], ["0vw", "-100vw"]);
  const touaregWheelRotate = useTransform(scrollYProgress, [0.5, 0.8], [0, -7 * 180]);
  const touaregCarY = useTransform(scrollYProgress, [0.5, 0.55, 0.75, 0.8], [0, -2, -2, 0]);
  const touaregShadowOpacity = useTransform(scrollYProgress, [0.5, 0.55, 0.75, 0.8], [0, 0.4, 0.4, 0]);
  const touaregTextX = useTransform(scrollYProgress, [0.5, 0.8], ["50vw", "-50vw"]);
  const touaregTextOpacity = useTransform(scrollYProgress, [0.5, 0.55, 0.75, 0.8], [0.1, 0.8, 0.8, 0.1]);
  const touaregTextScale = useTransform(scrollYProgress, [0.5, 0.65, 0.8], [0.9, 1, 1.1]);
  const touaregOpacity = useTransform(scrollYProgress, [0.45, 0.55, 0.75, 0.85], [0, 1, 1, 0]);

  // Golf 8 Car Animations (fourth part: 0.75 to 1.0)
  const golf8CarX = useTransform(scrollYProgress, [0.75, 1], ["0vw", "-100vw"]);
  const golf8WheelRotate = useTransform(scrollYProgress, [0.75, 1], [0, -7 * 180]);
  const golf8CarY = useTransform(scrollYProgress, [0.75, 0.8, 0.95, 1], [0, -2, -2, 0]);
  const golf8ShadowOpacity = useTransform(scrollYProgress, [0.75, 0.8, 0.95, 1], [0, 0.3, 0.3, 0]);
  const golf8TextX = useTransform(scrollYProgress, [0.75, 1], ["50vw", "-50vw"]);
  const golf8TextOpacity = useTransform(scrollYProgress, [0.75, 0.8, 0.95, 1], [0.1, 0.8, 0.8, 0.1]);
  const golf8TextScale = useTransform(scrollYProgress, [0.75, 0.875, 1], [0.9, 1, 1.1]);
  const golf8Opacity = useTransform(scrollYProgress, [0.7, 0.8, 0.95, 1], [0, 1, 1, 1]);

  // Background color transitions
  const backgroundOpacity = useTransform(scrollYProgress, [0.2, 0.35], [0, 1]); // BMW to KIA (gray to red)
  const backgroundOpacity2 = useTransform(scrollYProgress, [0.45, 0.6], [0, 1]); // KIA to Touareg (red to blue)
  const backgroundOpacity3 = useTransform(scrollYProgress, [0.7, 0.85], [0, 1]); // Touareg to Golf 8 (blue to green)

      return (
    <section ref={containerRef} style={{ height: "600vh" }}>
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden ">
        
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
          className="absolute inset-0 bg-gradient-to-b from-green-50 to-green-100"
          style={{ opacity: backgroundOpacity3 }}
        />

        {/* BMW Section */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: bmwOpacity }}
        >
          {/* BMW X3 M Logo - Background parallax layer */}
          <motion.div
            className="absolute z-0 pointer-events-none select-none top-1/4 left-1/14 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              x: bmwTextX,
              opacity: bmwTextOpacity,
              scale: bmwTextScale,
              willChange: 'transform'
            }}
          >
            <Image
              src="/images/x3-bm.webp"
              alt="BMW X3 M Logo"
              width={800}
              height={200}
              className="opacity-100 drop-shadow-2xl"
              draggable={false}
              priority
            />
          </motion.div>

          {/* BMW Car wrapper */}
          <motion.div
            className="relative z-10"
            style={{ 
              x: bmwCarX, 
              y: bmwCarY,
              width: 1220,
              willChange: 'transform'
            }}
          >
            {/* BMW Car body */}
            <Image
              src="/images/bmw-body.png"
              alt="BMW X3 body"
              width={720}
              height={400}
              className="block w-full h-auto pointer-events-none select-none"
              draggable={false}
              priority
            />

            {/* BMW Rear wheel */}
            <motion.div
              className="absolute bottom-[16.3%] left-[9.7%] w-[190.5px] h-[190.5px]"
              style={{ 
                rotate: bmwWheelRotate,
                willChange: 'transform'
              }}
            >
              <Image
                src="/images/wheel-rear.png"
                alt="BMW Rear wheel"
                width={120}
                height={120}
                className="w-full h-full pointer-events-none select-none"
                draggable={false}
              />
            </motion.div>

            {/* BMW Front wheel */}
            <motion.div
              className="absolute bottom-[16.3%] left-[70.5%] w-[190.5px] h-[190.5px]"
              style={{ 
                rotate: bmwWheelRotate,
                willChange: 'transform'
              }}
            >
              <Image
                src="/images/wheel-front.png"
                alt="BMW Front wheel"
                width={120}
                height={120}
                className="w-full h-full pointer-events-none select-none"
                draggable={false}
              />
            </motion.div>

            {/* BMW Shadow */}
            <motion.div 
              className="absolute -bottom-[19%] left-1/2 -translate-x-1/2 w-[60%] h-[20px] bg-black blur-2xl rounded-full"
              style={{ 
                opacity: bmwShadowOpacity,
                willChange: 'opacity'
              }}
            />
          </motion.div>

          {/* BMW Book Now Button */}
          <motion.div
            className="absolute bottom-16 z-20"
            style={{
              x: bmwCarX,
              left: '40%',
              transform: 'translateX(-50%)',
              opacity: useTransform(scrollYProgress, [0, 0.1, 0.2, 0.3], [1, 1, 1, 0]),
              y: useTransform(scrollYProgress, [0, 0.1, 0.2, 0.3], [0, 0, 0, 50]),
              willChange: 'transform, opacity'
            }}
          >
            <div className="text-center space-y-4">
              <div className="text-gray-700 space-y-1 p-2">
                <h3 className="text-2xl font-bold">BMW X3 M</h3>
                <p className="text-lg">Premium SUV built for performance.</p>
              </div>
              
              <div className="flex items-center justify-center">
                <Rounded backgroundColor={"#334BD3"}>
                  <p>Book Now</p>
                </Rounded>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* KIA Section */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center mt-[90px]"
          style={{ opacity: kiaOpacity }}
        >
          {/* KIA Logo - Background parallax layer */}
          <motion.div
          className=" absolute z-0 pointer-events-none select-none top-1/5 left-1/22 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
            style={{
              x: kiaTextX,
              opacity: kiaTextOpacity,
              scale: kiaTextScale,
              willChange: 'transform'
            }}
          >
           
            <Image
              src="/images/kia-logo.png"
              alt="KIA Logo"
              width={600}
              height={100}
              className="opacity-100 pointer-events-none select-none"
              draggable={false}
            />
              <Image
              src="/images/spppp.png"
              alt="KIA Logo"
              width={400}
              height={200}
              className="opacity-100 pointer-events-none select-none"
              draggable={false}
            />
          </motion.div>

          {/* KIA Car wrapper */}
          <motion.div
            className="relative z-10"
            style={{ 
              x: kiaCarX, 
              y: kiaCarY,
              width: 1220,
              willChange: 'transform'
            }}
          >
            {/* KIA Car body */}
            <Image
              src="/images/kia_car_body.png"
              alt="KIA body"
              width={720}
              height={400}
              className="block w-full h-auto pointer-events-none select-none"
              draggable={false}
              priority
            />

            {/* KIA Rear wheel (left) */}
            <motion.div
              className="absolute bottom-[10.7%] left-[14.5%] w-[184.9px] h-[184.9px]"
              style={{ 
                rotate: kiaWheelRotate,
                willChange: 'transform'
              }}
            >
              <Image
                src="/images/left-wheel-kiann.png"
                alt="KIA Left wheel"
                width={120}
                height={120}
                className="w-full h-full pointer-events-none select-none"
                draggable={false}
              />
            </motion.div>

            {/* KIA Front wheel (right) */}
            <motion.div
              className="absolute bottom-[10.7%] left-[67.6%] w-[184.9px] h-[184.9px"
              style={{ 
                rotate: kiaWheelRotate,
                willChange: 'transform'
              }}
            >
              <Image
                src="/images/right_wheel_kia.png"
                alt="KIA Right wheel"
                width={120}
                height={120}
                className="w-full h-full pointer-events-none select-none"
                draggable={false}
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

          {/* KIA Book Now Button */}
          <motion.div
            className="absolute bottom-16 z-20"
            style={{
              x: kiaCarX,
              left: '40%',
              transform: 'translateX(-50%)',
              opacity: useTransform(scrollYProgress, [0.25, 0.3, 0.5, 0.55], [1, 1, 1, 0]),
              y: useTransform(scrollYProgress, [0.25, 0.3, 0.5, 0.55], [0, 0, 0, 50]),
              willChange: 'transform, opacity'
            }}
          >
            <div className="text-center space-y-4">
              <div className="text-red-700 space-y-1 p-2">
                <h3 className="text-2xl font-bold">KIA Sportage</h3>
                <p className="text-lg">Dynamic design meets advanced technology.</p>
              </div>
              
              <div className="flex items-center justify-center">
                <Rounded backgroundColor={"#D32F2F"}>
                  <p>Book Now</p>
                </Rounded>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Touareg Section */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center mt-[110px]"
          style={{ opacity: touaregOpacity }}
        >
          {/* Touareg Logo - Background parallax layer */}
          <motion.div
            className="absolute z-0 pointer-events-none select-none top-1/4 left-1/14 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              x: touaregTextX,
              opacity: touaregTextOpacity,
              scale: touaregTextScale,
              willChange: 'transform'
            }}
          >
            <div className="text-8xl md:text-9xl font-bold text-blue-600/20 tracking-wider">
              TOUAREG
            </div>
          </motion.div>

          {/* Touareg Car wrapper */}
          <motion.div
            className="relative z-10 "
            style={{ 
              x: touaregCarX, 
              y: touaregCarY,
              width: 1220,
              willChange: 'transform'
            }}
          >
            {/* Touareg Car body */}
            <Image
              src="/images/touareg-body.png"
              alt="Touareg body"
              width={720}
              height={400}
              className="block w-full h-auto pointer-events-none select-none"
              draggable={false}
              priority
            />

            {/* Touareg Rear wheel (left) */}
            <motion.div
              className="absolute bottom-[7.7%] left-[10.9%] w-[230.5px] h-[230.5px]"
              style={{
                rotate: touaregWheelRotate,
                willChange: 'transform'
              }}
            >
              <Image
                src="/images/left-wheel-touareg.png"
                alt="Touareg Left wheel"
                width={120}
                height={120}
                className="w-full h-full pointer-events-none select-none"
                draggable={false}
              />
            </motion.div>

            {/* Touareg Front wheel (right) */}
            <motion.div
              className="absolute bottom-[10.3%] left-[70.5%] w-[230.5px] h-[230.5px]"
              style={{ 
                rotate: touaregWheelRotate,
                willChange: 'transform'
              }}
            >
              <Image
                src="/images/right-wheel-touareg.png"
                alt="Touareg Right wheel"
                width={120}
                height={120}
                className="w-full h-full pointer-events-none select-none"
                draggable={false}
              />
            </motion.div>

            {/* Touareg Shadow */}
            <motion.div 
              className="absolute -bottom-[19%] left-1/2 -translate-x-1/2 w-[60%] h-[20px] bg-black blur-2xl rounded-full"
              style={{ 
                opacity: touaregShadowOpacity,
                willChange: 'opacity'
              }}
            />
          </motion.div>

          {/* Touareg Book Now Button */}
          <motion.div
            className="absolute bottom-16 z-20"
            style={{
              x: touaregCarX,
              left: '40%',
              transform: 'translateX(-50%)',
              opacity: useTransform(scrollYProgress, [0.5, 0.55, 0.75, 0.8], [1, 1, 1, 0]),
              y: useTransform(scrollYProgress, [0.5, 0.55, 0.75, 0.8], [0, 0, 0, 50]),
              willChange: 'transform, opacity'
            }}
          >
            <div className="text-center space-y-4">
              <div className="text-blue-700 space-y-1 p-2">
                <h3 className="text-2xl font-bold">VW Touareg</h3>
                <p className="text-lg">Luxury SUV with unmatched comfort.</p>
              </div>
              
              <div className="flex items-center justify-center">
                <Rounded backgroundColor={"#1976D2"}>
                  <p>Book Now</p>
                </Rounded>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Golf 8 Section */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center mt-[110px]"
          style={{ opacity: golf8Opacity }}
        >
          {/* Golf 8 Logo - Background parallax layer */}
          <motion.div
            className="absolute z-0 pointer-events-none select-none top-1/4 left-1/14 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              x: golf8TextX,
              opacity: golf8TextOpacity,
              scale: golf8TextScale,
              willChange: 'transform'
            }}
          >
            <div className="text-8xl md:text-9xl font-bold text-green-600/20 tracking-wider">
              GOLF 8
            </div>
          </motion.div>

          {/* Golf 8 Car wrapper */}
          <motion.div
            className="relative z-10"
            style={{ 
              x: golf8CarX, 
              y: golf8CarY,
              width: 1220,
              willChange: 'transform'
            }}
          >
            {/* Golf 8 Car body */}
            <Image
              src="/images/golf8-body.png"
              alt="Golf 8 body"
              width={720}
              height={400}
              className="block w-full h-auto pointer-events-none select-none"
              draggable={false}
              priority
            />

            {/* Golf 8 Rear wheel (left) */}
            <motion.div
              className="absolute bottom-[12%] left-[19.6%] w-[162.5px] h-[162.5px]"
              style={{ 
                rotate: golf8WheelRotate,
                willChange: 'transform'
              }}
            >
              <Image
                src="/images/golf-8-left-wheel.png"
                alt="Golf 8 Left wheel"
                width={120}
                height={120}
                className="w-full h-full pointer-events-none select-none"
                draggable={false}
              />
            </motion.div>

            {/* Golf 8 Front wheel (right) */}
            <motion.div
              className="absolute bottom-[12.3%] left-[73.3%] w-[167px] h-[167px]"
              style={{ 
                rotate: golf8WheelRotate,
                willChange: 'transform'
              }}
            >
              <Image
                src="/images/golf-8-right-wheel.png"
                alt="Golf 8 Right wheel"
                width={120}
                height={120}
                className="w-full h-full pointer-events-none select-none"
                draggable={false}
              />
            </motion.div>

            {/* Golf 8 Shadow */}
            <motion.div 
              className="absolute -bottom-[19%] left-1/2 -translate-x-1/2 w-[60%] h-[20px] bg-black blur-2xl rounded-full"
              style={{ 
                opacity: golf8ShadowOpacity,
                willChange: 'opacity'
              }}
            />
          </motion.div>

          {/* Golf 8 Book Now Button */}
          <motion.div
            className="absolute bottom-16 z-20"
            style={{
              x: golf8CarX,
              left: '40%',
              transform: 'translateX(-50%)',
              opacity: useTransform(scrollYProgress, [0.75, 0.8, 0.95, 1], [1, 1, 1, 0]),
              y: useTransform(scrollYProgress, [0.75, 0.8, 0.95, 1], [0, 0, 0, 50]),
              willChange: 'transform, opacity'
            }}
          >
            <div className="text-center space-y-4">
              <div className="text-green-700 space-y-1 p-2">
                <h3 className="text-2xl font-bold">VW Golf 8</h3>
                <p className="text-lg">Compact excellence with modern innovation.</p>
              </div>
              
              <div className="flex items-center justify-center">
                <Rounded backgroundColor={"#388E3C"}>
                  <p>Book Now</p>
                </Rounded>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
