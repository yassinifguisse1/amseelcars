import React from 'react'

const HeroVideo = () => {
  return (
    <section className="hero ">
    <video 
        className="hero-video w-full h-full object-cover" 
        autoPlay 
        muted 
        loop 
        playsInline
    >
        <source src="/video/HeroVideo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
    </video>
    {/* <h2 className='uppercase font-bold text-white'>
        Symphonia
    </h2> */}
</section>
  )
}

export default HeroVideo