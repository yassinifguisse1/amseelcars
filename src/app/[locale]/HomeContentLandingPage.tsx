"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

// import Landing from '@/components/Landing';
import { AnimatePresence, motion } from "framer-motion";
import Cardrive from "@/components/scroll-video/scroll-video";
import Brands from "@/components/Brands/Brands";

const BMWCarScroll = dynamic(() => import("@/components/CarsMoving/BMWCar"), {
  loading: () => (
    <div className="min-h-[min(70vh,36rem)] w-full bg-gray-200" aria-hidden />
  ),
});

const MapExample = dynamic(() => import("@/components/CarDashboardMap/Example"), {
  loading: () => (
    <div className="min-h-[min(70vh,32rem)] w-full bg-[#f7f5f2]" aria-hidden />
  ),
});
import Footer from "@/components/Footer/Footer";
import SplitHeadline from "@/components/test/SplitHeadline";
import Reviews from "@/components/Reviews/Reviews";
import {
  HomeSeoTrustBar,
  HomeSeoAirportBlock,
  HomeSeoVehicleTypesBlock,
  HomeSeoLocalDiscoveryBlock,
  HomeSeoLocationNapBlock,
  HomeSeoBookingCtaBlock,
  HomeSeoFaqBlock,
} from "@/components/home-seo/home-seo";
import { reviews } from "@/data/reviews";
import { useLoading } from "@/contexts/LoadingContext";
import Speedometer from "@/components/Preloader/Speedometer";
// import Header from "@/components/Header";

// Speedometer Preloader Component
function SpeedometerPreloader() {
  const { loadingState } = useLoading();
  const t = useTranslations("home.preloader");

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
          <h2 className="text-2xl md:text-4xl font-bold mb-2">{t("title")}</h2>
          <p className="text-sm md:text-base text-gray-400 mb-4">{t("tagline")}</p>
         
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Inner component that uses the loading context
export function HomeContentLandingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { loadingState} = useLoading();
  const t = useTranslations("home");

  useEffect(() => {
    // Clean up any lingering scroll conflicts from other pages
    if (typeof window !== 'undefined') {
      // Reset scroll behavior to default
      document.documentElement.style.scrollBehavior = 'auto';
      document.body.style.overflow = 'visible';
      document.body.style.height = 'auto';
      
      // Reset any transform styles that might block scroll
      document.body.style.transform = 'none';
      document.documentElement.style.transform = 'none';
      
      // Ensure scroll is at top
      window.scrollTo(0, 0);
    }
  }, []);


  useEffect(() => {
    if (!loadingState.isComplete) return;

    // Short exit: long delays block LCP (hero video / H1 stay hidden behind the preloader).
    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.cursor = "default";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 320);

    return () => clearTimeout(timer);
  }, [loadingState]);

  // Cleanup when component unmounts (navigating away)
  useEffect(() => {
    return () => {
      // Reset any scroll-related styles when leaving home page
      if (typeof window !== 'undefined') {
        document.body.style.overflow = '';
        document.body.style.height = '';
        document.body.style.transform = '';
        document.documentElement.style.transform = '';
        document.documentElement.style.scrollBehavior = '';
      }
    };
  }, []);

  return (
    <div className="page-content hero">
      <AnimatePresence mode="wait">
        {isLoading && <SpeedometerPreloader />}
      </AnimatePresence>
      
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoading ? 0 : 1 }}
          transition={{ 
            duration: 1.0, 
            ease: [0.25, 0.1, 0.25, 1],
            delay: isLoading ? 0 : 0.3
          }}
        >
          <Cardrive />
          {/* SEO: trust strip — after hero, before BMW/Kia showcase */}
          <HomeSeoTrustBar />
          <BMWCarScroll />
          {/* Blend BMW gray into aéroport cream (avoids a sharp “white” seam when scrolling) */}
          <div
            className="h-[min(8vh,88px)] shrink-0 bg-gradient-to-b from-gray-200 to-[#f7f5f2]"
            aria-hidden
          />
          {/* SEO: airport / aéroport — after “Votre Trajet Idéal”, before black storytelling */}
          <HomeSeoAirportBlock />
          <SplitHeadline />
          <Brands />
          {/* SEO: vehicle categories — after Nos Marques, before reviews */}
          <HomeSeoVehicleTypesBlock />
          <Reviews
            reviews={reviews}
            useApi={true}
            introParagraph={t("reviewsIntro")}
          />
          {/* SEO: destinations — after reviews, before map dashboard */}
          <HomeSeoLocalDiscoveryBlock />
          <MapExample />
          {/* SEO: NAP + location copy — below map-in-dashboard */}
          <HomeSeoLocationNapBlock />
          {/* SEO: conversion — before FAQ */}
          <HomeSeoBookingCtaBlock />
          {/* SEO: FAQ — before footer */}
          <HomeSeoFaqBlock />
          <Footer />
        </motion.div>
    </div>
  );
}