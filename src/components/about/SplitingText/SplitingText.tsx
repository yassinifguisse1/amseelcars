"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./style.css";
gsap.registerPlugin(ScrollTrigger);

export default function SplitingText() {
  const root = useRef<HTMLDivElement>(null);
  const section1 = useRef<HTMLElement>(null); // The main section to trigger animations

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Responsive distances (optional)
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: section1.current!,
              // Start animation when section reaches center of viewport
              start: "50% 100%",
              // End when section exits viewport
              end: "bottom top",
              scrub: 1,
              // markers: true, // Enable for debugging
            },
          })
          .to(".split-left", { xPercent: -45, ease: "none" }, 0)
          .to(".split-right", { xPercent: 45, ease: "none" }, 0);
      });

      mm.add("(max-width: 767px)", () => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: section1.current!,
              // Start animation when section reaches center of viewport
              start: "50% 100%",
              // End when section exits viewport  
              end: "bottom top",
              scrub: 1,
              // markers: true, // Enable for debugging
            },
          })
          .to(".split-left", { xPercent: -25, ease: "none" }, 0)
          .to(".split-right", { xPercent: 25, ease: "none" }, 0);
      });
    }, root);

    return () => ctx.revert();
  }, []);

//   YOUR CAR RENTAL IN AGADIR.
//   AMSEEL CARS
//   PICK YOUR BRAND,
//   SHORT OR LONG TERM
  

  return (
    <div ref={root} className="w-full">
      {/* SECTION 1 (main content section) */}
      <section ref={section1} id="section-1" className="min-h-[100vh]n py-[3vh] flex flex-col items-center justify-center overflow-hidden">
        <div className=" top-[12vhs] w-full ">
          <h1
            className="
              flex justify-center items-start gap-[0.3ch]
              font-bold leading-[0.95]
              whitespace-nowrap text-black will-change-transform
              text-[clamp(36px,11vw,100px)]
            "
          >
            <span  className="split-left inline-block  text-[clamp(22px,8vw,100px)]">EXPLORE</span>
            <span  className="split-right inline-block text-[clamp(22px,8vw,100px)]">AGADIR.</span>
          </h1>
        </div>
        <div className="w-full flex flex-col items-center justify-center">
          <h1
            className="
              flex justify-center items-start gap-[0.3ch]
              font-bold leading-[0.95]
              whitespace-nowrap text-black will-change-transform
              text-[clamp(36px,11vw,100px)]
            "
          >
            <span className="inline-block text-[clamp(22px,8vw,100px)] font-poppins">AMSEEL CARS</span>
          </h1>
        </div>
        <div className="w-full flex flex-col items-center justify-center">
          <h1
            className="
              flex justify-center items-start gap-[0.3ch]
              font-bold leading-[0.95]
              whitespace-nowrap text-black will-change-transform
              text-[clamp(36px,11vw,100px)]
            "
          >
            <span className="split-left inline-block text-[clamp(22px,8vw,100px)] font-poppins">PICK</span>
            <span className="split-right inline-block text-[clamp(22px,8vw,100px)] font-poppins">YOUR BRAND</span>
          </h1>
        </div>
        <div className="w-full flex flex-col items-center justify-center">
          <h1
            className="
              flex justify-center items-start gap-[0.3ch]
              font-bold leading-[0.95]
              whitespace-nowrap text-black will-change-transform
              text-[clamp(36px,11vw,100px)]
            "
          >
            <span className="split-left inline-block text-[clamp(22px,8vw,100px)] font-poppins">SHORT OR</span>
            <span className="split-right inline-block text-[clamp(22px,8vw,100px)] font-poppins">LONG TERM</span>
          </h1>
        </div>
        {/* <div className="w-full flex flex-col items-center justify-center">
          <h1
            className="
              flex justify-center items-start gap-[0.3ch]
              font-bold leading-[0.95]
              whitespace-nowrap text-black will-change-transform
              text-[clamp(36px,11vw,160px)]
            "
          >
            <span className="split-left inline-block">start</span>
            <span className="split-right inline-block">the&nbsp;journey.</span>
          </h1>
        </div> */}

      </section>

      {/* SECTION 2 (this drives the animation) */}
     
    </div>
  );
}
