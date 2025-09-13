"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLoading } from "@/contexts/LoadingContext";
import Speedometer from "@/components/Preloader/Speedometer";

// Speedometer Preloader Component
function SpeedometerPreloader() {
  const { loadingState } = useLoading();
  
  return (
    <motion.div 
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
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
        className="text-center"
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
          <p className="text-sm md:text-base text-gray-400 mb-4">Premium Car Rental Experience</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Main Global Preloader Component
export default function GlobalPreloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const { loadingState, updateFramesProgress, setFramesLoaded, setWordsComplete, setMinimumTimeElapsed, resetLoading } = useLoading();

  useEffect(() => {
    // Ensure client-side hydration
    setIsClient(true);
    // Reset loading state when component mounts (page change)
    resetLoading();
    setIsLoading(true);
  }, [resetLoading]);

  useEffect(() => {
    if (isClient) {
      // Check if we're on the home page (which has the video component)
      const isHomePage = window.location.pathname === '/';
      
      if (!isHomePage) {
        // For non-home pages, simulate loading progress
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 10;
          if (progress <= 100) {
            // Simulate frame loading progress
            const totalFrames = 100;
            const loadedFrames = Math.round((progress / 100) * totalFrames);
            updateFramesProgress(loadedFrames, totalFrames);
            setWordsComplete(true);
            setMinimumTimeElapsed(true);
          } else {
            clearInterval(progressInterval);
          }
        }, 200); // Update every 200ms

        // Complete loading after 2 seconds
        const completionTimer = setTimeout(() => {
          clearInterval(progressInterval);
          setFramesLoaded(true);
          setWordsComplete(true);
          setMinimumTimeElapsed(true);
        }, 2000);

        return () => {
          clearInterval(progressInterval);
          clearTimeout(completionTimer);
        };
      }
    }
  }, [isClient, updateFramesProgress, setFramesLoaded, setWordsComplete, setMinimumTimeElapsed]);

  useEffect(() => {
    console.log('Loading state changed:', loadingState);
    // Only finish loading when frames are complete
    if (loadingState.isComplete && isClient) {
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
  }, [loadingState, isClient]);

  return (
    <AnimatePresence mode="wait">
      {isLoading && <SpeedometerPreloader />}
    </AnimatePresence>
  );
}
