"use client";
import React from "react";
import CarePage from "@/components/Cars/CarePage/CarePage";
import { LoadingProvider } from "@/contexts/LoadingContext";
import Script from "next/script";
import { generateBreadcrumbSchema } from "@/lib/schemas";



function HomeContent() {
  // const [isLoading, setIsLoading] = useState(true);
  // const [isClient, setIsClient] = useState(false);
  // const { loadingState, updateFramesProgress, setFramesLoaded, setWordsComplete, setMinimumTimeElapsed } = useLoading();

  // useEffect(() => {
  //   // Ensure client-side hydration
  //   setIsClient(true);
  // }, []);
  // useEffect(() => {
  //   if (isClient) {
  //     // Simulate loading progress for cars page
  //     let progress = 0;
  //     const progressInterval = setInterval(() => {
  //       progress += 10;
  //       if (progress <= 100) {
  //         // Simulate frame loading progress
  //         const totalFrames = 100;
  //         const loadedFrames = Math.round((progress / 100) * totalFrames);
  //         updateFramesProgress(loadedFrames, totalFrames);
  //         setWordsComplete(true);
  //         setMinimumTimeElapsed(true);
  //       } else {
  //         clearInterval(progressInterval);
  //       }
  //     }, 200); // Update every 200ms

  //     // Complete loading after 2 seconds
  //     const completionTimer = setTimeout(() => {
  //       clearInterval(progressInterval);
  //       setFramesLoaded(true);
  //       setWordsComplete(true);
  //       setMinimumTimeElapsed(true);
  //     }, 2000);

  //     return () => {
  //       clearInterval(progressInterval);
  //       clearTimeout(completionTimer);
  //     };
  //   }
  // }, [isClient, updateFramesProgress, setFramesLoaded, setWordsComplete, setMinimumTimeElapsed]);

  // useEffect(() => {
  //   console.log('Loading state changed:', loadingState);
  //   // Only finish loading when frames are complete
  //   if (loadingState.isComplete && isClient) {
  //     console.log('All loading complete, hiding preloader...');
  //     const timer = setTimeout(() => {
  //       setIsLoading(false);
  //       document.body.style.cursor = "default";
  //       // Smooth scroll to top with easing
  //       window.scrollTo({
  //         top: 0,
  //         behavior: 'smooth'
  //       });
  //     }, 1500); // Longer delay for smoother speedometer transition

  //     return () => clearTimeout(timer);
  //   }
  // }, [loadingState.isComplete, isClient]);
  return (
    <>
      {/* <AnimatePresence mode="wait">
        {isLoading && <SpeedometerPreloader />}
      </AnimatePresence> */}

      <div>
        <CarePage />
      </div>
    </>
  );
}

export default function Home() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "About", url: "/about" },
  ]);

  return (
    <>
      {/* Breadcrumb Schema */}
      <Script
        id="ld-json-breadcrumb-about"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <LoadingProvider>
        <HomeContent />
      </LoadingProvider>
    </>
  );
}
