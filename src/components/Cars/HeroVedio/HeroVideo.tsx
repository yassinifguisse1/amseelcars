"use client"
import React, { useState, useEffect } from 'react'

const HeroVideo = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Set client-side flag
    setIsClient(true)
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 868)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Don't render until client-side to avoid hydration mismatch
  if (!isClient) {
    return <div className="hero w-full h-[100svh] bg-black"></div>
  }

  return (
    <section className="hero  ">
    <video 
        className="hero-video w-full h-[100svh] object-cover" 
        autoPlay 
        muted 
        loop 
        playsInline
        preload="metadata"
        key={isMobile ? 'mobile' : 'desktop'} // Force re-render when mobile state changes
    >
        <source 
          src={isMobile ? "/video/Mobile-video.mp4" : "/video/HeroVideo.mp4"} 
          type="video/mp4" 
        />
        Your browser does not support the video tag.
    </video>
    {/* <h2 className='uppercase font-bold text-white'>
        Symphonia
    </h2> */}
    </section>
  )
}

export default HeroVideo