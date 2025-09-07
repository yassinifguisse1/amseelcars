'use client';

import Image from 'next/image';
import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Heroo() {
  const root = useRef<HTMLDivElement>(null);
  const imgHolder = useRef<HTMLDivElement>(null);
  const imgInner = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      
      // Create a single ScrollTrigger that pins the section and drives all animations
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=300%', // How long the animation lasts (3x viewport height)
          scrub: 1,
          pin: true, // Pin the entire section during animation
          anticipatePin: 1,
          pinSpacing: true, // Allows content after to be pushed down
          onUpdate: (self) => {
            // Track animation progress
            if (self.progress === 1) {
              console.log('Animation complete - ready to scroll to next section');
            }
          }
        }
      });

      // First letters animation (AMSIL) - slide left and scale up
      tl.to('.header .letters:first-child', {
        x: () => -window.innerWidth * 3,
        scale: 10,
        ease: "power2.inOut",
      }, 0)

      // Last letters animation (CAR) - slide right and scale up  
      .to('.header .letters:last-child', {
        x: () => window.innerWidth * 3,
        scale: 10,
        ease: "power2.inOut",
      }, 0)

      // Optional: Fade out or transform the image during animation
      .to('.website-content', {
        scale: 1.1,
        opacity: 0.8,
        ease: "power2.inOut",
      }, 0);
    //   gsap.set('.img-holder'
    gsap.to(".img-holder", {
        rotate: 0,
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        ease: "power2.inOut",
        scrollTrigger: {
         start: 'top top',
         end:`+=200%`,
         scrub: 1,
        }

      })
      gsap.to(".img-holder img", {
        scale: 1,
        ease: "power2.inOut",
        scrollTrigger: {
         start: 'top top',
         end:`+=200%`,
         scrub: 1,
        }

      })



    }, root);

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      document.body.style.height = 'auto';
      ctx.revert();
    };
  }, []);

  return (
    <section ref={root} className="relative bg-whitex w-full h-screen overflow-hidden bg-black">
      {/* Logo */}
      <div className="logo absolute top-0 right-0 m-[32px] w-[18px] h-[18px] bg-red-500 rounded-full z-[100] hidden"></div>
      
      {/* Header with letters */}
      <div className="header absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex w-full z-[2] ">
        {/* First letters group (AMSIL) */}
        <div className="letters flex flex-1 uppercase z-10">
          <div className="letter flex-1 text-[15vw] font-bold text-center text-white poppins">A</div>
          <div className="letter flex-1 text-[15vw] font-bold text-center text-white poppins">M</div>
          <div className="letter flex-1 text-[15vw] font-bold text-center text-white poppins">S</div>
          <div className="letter flex-1 text-[15vw] font-bold text-center text-white poppins">E</div>
          <div className="letter flex-1 text-[15vw] font-bold text-center text-white poppins">E</div>
          <div className="letter flex-1 text-[15vw] font-bold text-center text-white poppins">L</div>
        </div>
        
        {/* Second letters group (CAR) */}
        <div className="letters flex flex-1 uppercase z-10">
          <div className="letter flex-1 text-[15vw]  font-extralight text-center text-white">C</div>
          <div className="letter flex-1 text-[15vw]  font-extralight text-center text-white">A</div>
          <div className="letter flex-1 text-[15vw]  font-extralight text-center text-white">R</div>
          <div className="letter flex-1 text-[15vw]  font-extralight text-center text-white">S</div>

        </div>
      </div>

      {/* Website content with image */}
      <div className="website-content absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-screen z-0">
        <div 
          ref={imgHolder}
          className="img-holder relative w-full h-full  [clip-path:polygon(37.5%_20%,_62.5%_20%,_62.5%_80%,_37.5%_80%)] rotate-[30deg] overflow-hidden"
        >
          <div ref={imgInner} className="absolute inset-0">
            <Image
              src="/images/banner-5.jpg"
              alt="img1"
              fill
              className="object-cover  "
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
