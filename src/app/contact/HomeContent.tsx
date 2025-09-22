"use client"
import React, { useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import AnimatedHeader from '@/components/Contact/AnimatedHeader'
import ContactForm from '@/components/Contact/ContactForm'
import ContactInfo from '@/components/Contact/ContactInfo'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {useLoading } from '@/contexts/LoadingContext'
import Speedometer from '@/components/Preloader/Speedometer'



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

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

export function HomeContent() {
  // Use the existing revealed hook for consistency
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const { loadingState, updateFramesProgress, setFramesLoaded, setWordsComplete, setMinimumTimeElapsed } = useLoading();


  useEffect(() => {
    // Ensure client-side hydration
    setIsClient(true);
  }, [])
  useEffect(() => {
    if (isClient) {
      // Simulate loading progress for cars page
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

  useEffect(() => {
    // Refresh ScrollTrigger after component mount
    ScrollTrigger.refresh()

    // Cleanup on unmount
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <>
      {/* Revealed div for consistency with existing pages */}
      <AnimatePresence  mode="wait">
        {isLoading && <SpeedometerPreloader />}
      </AnimatePresence>

      {/* Animated Header Section */}
      <AnimatedHeader />
      
      {/* Main Content Section */}
      <section className="relative min-h-screen   py-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, #CB1939 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, #CB1939 0%, transparent 50%),
                             radial-gradient(circle at 40% 60%, #CB1939 0%, transparent 50%)`
          }} />
        </div>

        <div className="relative z-10 container mx-auto px-4">
          {/* Desktop Layout: Side by side */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start">
            {/* Contact Form */}
            <div className="lg:sticky lg:top-20">
              <ContactForm />
            </div>
            
            {/* Contact Information */}
            <div>
              <ContactInfo />
            </div>
          </div>

          {/* Mobile/Tablet Layout: Stacked */}
          <div className="lg:hidden space-y-16">
            {/* Contact Form First on Mobile */}
            <ContactForm />
            
            {/* Contact Information */}
            <ContactInfo />
          </div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#CB1939]/30 to-transparent pointer-events-none" />
      </section>

      {/* Additional CTA Section */}
      <section className="relative bg-gradient-to-r from-[#CB1939]/10 to-[#CB1939]/20 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Prêt(e) à conduire votre rêve de voiture ?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Ne plus attendre. Contactez-nous aujourd’hui et profitez du luxe, 
              performance, et service qui nous distingue du reste.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* whatsapp */}
              <Link
                href="https://wa.me/212662500181"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#CB1939] to-[#CB1939]/80 text-white font-semibold rounded-xl hover:from-[#CB1939]/90 hover:to-[#CB1939]/70 transition-all duration-300 hover:shadow-lg hover:shadow-[#CB1939]/25"
              >
                Whatsapp: +212 662 500 181 (Whatsapp)
              </Link>
              <Link
                href="mailto:info@amseelcars.com"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 backdrop-blur-sm"
              >
                Envoyer Email
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  ) 
}
