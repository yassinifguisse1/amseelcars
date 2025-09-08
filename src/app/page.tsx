"use client";
import { useEffect, useState } from "react";
import ZoomParallax from "@/components/ZoomParallax";

// import Landing from '@/components/Landing';
import { AnimatePresence } from "framer-motion";
import Preloader from "@/components/Preloader";
import Cardrive from "@/components/scroll-video/scroll-video";
import Brands from "@/components/Brands/Brands";
import BMWCarScroll from "@/components/CarsMoving/BMWCar";
import Example from "@/components/CarDashboardMap/Example";
import Footer from "@/components/Footer/Footer";
import SplitHeadline from "@/components/test/SplitHeadline";
import { LoadingProvider, useLoading } from "@/contexts/LoadingContext";

// Inner component that uses the loading context
function HomeContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const { loadingState } = useLoading();

  useEffect(() => {
    // Ensure client-side hydration
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only finish loading when frames are complete
    if (loadingState.isComplete && isClient) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        document.body.style.cursor = "default";
        window.scrollTo(0, 0);
      }, 500); // Small delay to ensure smooth transition

      return () => clearTimeout(timer);
    }
  }, [loadingState.isComplete, isClient]);

  return (
    <div className="page-content hero">
      <AnimatePresence mode="wait">
        {isLoading && <Preloader />}
      </AnimatePresence>
      
      {isClient && (
        <>
          <Cardrive />
          <ZoomParallax />
          <BMWCarScroll />
          <SplitHeadline />
          <Brands />
          <Example/>
          <Footer/>
        </>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <LoadingProvider>
      <HomeContent />
    </LoadingProvider>
  );
}
