'use client'
import { useEffect } from 'react';
import ZoomParallax from "@/components/ZoomParallax";
import Lenis from 'lenis';


export default function Home() {

  useEffect( () => {
    const lenis = new Lenis()
   
    function raf(time: number) {
        lenis.raf(time)
        requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)
},[])
  return (
   
    <div className="page-content hero" >
      <ZoomParallax />
      
    </div>
  );
}
