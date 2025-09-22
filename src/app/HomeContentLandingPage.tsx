"use client";
import { useEffect, useState } from "react";

// import Landing from '@/components/Landing';
import { AnimatePresence, motion } from "framer-motion";
import Cardrive from "@/components/scroll-video/scroll-video";
import Brands from "@/components/Brands/Brands";
import BMWCarScroll from "@/components/CarsMoving/BMWCar";
import Example from "@/components/CarDashboardMap/Example";
import Footer from "@/components/Footer/Footer";
import SplitHeadline from "@/components/test/SplitHeadline";
import { useLoading } from "@/contexts/LoadingContext";
import Speedometer from "@/components/Preloader/Speedometer";
// import Header from "@/components/Header";

// Speedometer Preloader Component
function SpeedometerPreloader() {
  const { loadingState } = useLoading();
  
  return (
    <motion.div 
      className="fixed inset-0 bg-black z-50 flex items-center justify-center "
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        scale: 1.1,
        transition: { 
          duration: 1.2, 
          ease: [0.25, 0.1, 0.25, 1],
          opacity: { duration: 0.8 },
          scale: { duration: 1.2, ease: "easeOut" }
        }
      }}
    >
      <motion.div 
        className="text-center "
        initial={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ 
          y: -80, 
          opacity: 0,
          scale: 0.9,
          transition: { 
            duration: 1.0, 
            ease: [0.25, 0.1, 0.25, 1],
            y: { duration: 1.0, ease: "easeInOut" },
            opacity: { duration: 0.6 },
            scale: { duration: 1.0, ease: "easeOut" }
          }
        }}
      >
        <Speedometer 
          value={loadingState.framesProgress} 
          max={100}
          size={400}
          autoplay={false}
        />
        <motion.div 
          className="mt-8 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h1 className="text-2xl md:text-4xl font-bold mb-2">AMSSEEL CARS</h1>
          <p className="text-sm md:text-base text-gray-400 mb-4">Expérience de location de voitures haut de gamme.</p>
         
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Inner component that uses the loading context
export function HomeContentLandingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const { loadingState } = useLoading();

  useEffect(() => {
    // Ensure client-side hydration
    setIsClient(true);
  }, []);

  useEffect(() => {
    console.log('Loading state changed:', loadingState);
    // Only finish loading when frames are complete
    if (loadingState.isComplete ) {
      console.log('All loading complete, hiding preloader...');
      const timer = setTimeout(() => {
        setIsLoading(false);
        document.body.style.cursor = "default";
        // Smooth scroll to top with easing
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 1500); // Longer delay for smoother speedometer transition

      return () => clearTimeout(timer);
    }
  }, [loadingState]);

  return (
    <div className="page-content hero">
      <AnimatePresence mode="wait">
        {isLoading && <SpeedometerPreloader />}
      </AnimatePresence>
      
      {isClient && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoading ? 0 : 1 }}
          transition={{ 
            duration: 1.0, 
            ease: [0.25, 0.1, 0.25, 1],
            delay: isLoading ? 0 : 0.3
          }}
        >
          {/* <Header/> */}
          <Cardrive />
          {/* <ZoomParallax /> */}
          <BMWCarScroll />
          <SplitHeadline />
          <Brands />
          <Example/>
          <Footer/>
        </motion.div>
      )} 
    </div>
  );
}