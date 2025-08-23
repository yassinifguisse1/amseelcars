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

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
      document.body.style.cursor = "default";
      window.scrollTo(0, 0);
    }, 2000);
  }, []);

  return (
    <div className="page-content hero">
      <AnimatePresence mode="wait">
        {isLoading && <Preloader />}
      </AnimatePresence>
      <Cardrive />

      {/* <Landing /> */}
      {/* <FloatingHero /> */}
      {/* <MasonryGallery /> */}
      <ZoomParallax />
      <SplitHeadline />
      
      <Brands />
      <BMWCarScroll />
      <Example/>
      <Footer/>
     
    </div>
  );
}
