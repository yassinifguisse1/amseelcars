// app/components/SplitHeadline.tsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Index from "../Description/Index";
gsap.registerPlugin(ScrollTrigger);

export default function SplitHeadline() {
  const root = useRef<HTMLDivElement>(null);
//   const leftChunk = useRef<HTMLSpanElement>(null);
//   const rightChunk = useRef<HTMLSpanElement>(null);
  const section2 = useRef<HTMLElement>(null); // <-- trigger is the section AFTER the sticky headline

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Responsive distances (optional)
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        gsap
                     .timeline({
             scrollTrigger: {
               trigger: section2.current!,
               // the moment section-2 starts to enter the viewport:
               start: "top 130%",
               // until its top reaches 20% from top:
               end: "top 0%",
               scrub: true,
               // markers: true, // Disabled for production
             },
          })
          .to(".split-left", { xPercent: -120, ease: "none" }, 0)
          .to(".split-right", { xPercent: 120, ease: "none" }, 0);
      });

      mm.add("(max-width: 767px)", () => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: section2.current!,
              start: "top 80%",
              end: "top 35%",
              scrub: true,
            },
          })
          .to(".split-left", { xPercent: -95, ease: "none" }, 0)
          .to(".split-right", { xPercent: 95, ease: "none" }, 0);
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="w-full">
      {/* SECTION 1 (sticky headline lives here) */}
      <section id="section-1" className="min-h-[100vh] flex flex-col items-center justify-center bg-black">
        <div className=" top-[12vhs] w-full ">
          <h1
            className="
              flex justify-center items-start gap-[0.3ch]
              font-bold leading-[0.95]
              whitespace-nowrap text-white will-change-transform
              text-[clamp(36px,11vw,160px)]
            "
          >
            <span  className="split-left inline-block">We&nbsp;are</span>
            <span  className="split-right inline-block">your&nbsp;next&nbsp;ride.</span>
          </h1>
        </div>
        <div className="; top-[12vh], w-full  flex flex-col items-start justify-center">
          <h1
            className="
              flex justify-center items-start gap-[0.3ch]
              font-bold leading-[0.95]
              whitespace-nowrap text-white will-change-transform
              text-[clamp(36px,11vw,160px)]
            "
          >
          <span className="split-left inline-block">From&nbsp;airport&nbsp;</span>

            <span className="split-right inline-block">to&nbsp;anywhere.</span>
          </h1>
        </div>
        <div className="; top-[12vh], w-full  flex flex-col items-center justify-center">
          <h1
            className="
              flex justify-center items-start gap-[0.3ch]
              font-bold leading-[0.95]
              whitespace-nowrap text-white will-change-transform
              text-[clamp(36px,11vw,160px)]
            "
          >
            <span className="split-left inline-block">Book</span>
            <span className="split-right inline-block">in&nbsp;minutes</span>

          </h1>
        </div>
        <div className="; top-[12vh], w-full  flex flex-col items-center justify-center">
          <h1
            className="
              flex justify-center items-start gap-[0.3ch]
              font-bold leading-[0.95]
              whitespace-nowrap text-white will-change-transform
              text-[clamp(36px,11vw,160px)]
            "
          >
            <span className="split-left inline-block">Pick</span>
            <span className="split-right inline-block">a&nbsp;car</span>

          </h1>
        </div>
        <div className="; top-[12vh], w-full  flex flex-col items-center justify-center">
          <h1
            className="
              flex justify-center items-start gap-[0.3ch]
              font-bold leading-[0.95]
              whitespace-nowrap text-white will-change-transform
              text-[clamp(36px,11vw,160px)]
            "
          >
            <span className="split-left inline-block">start</span>
            <span className="split-right inline-block">the&nbsp;journey.</span>

          </h1>
        </div>

      </section>

      {/* SECTION 2 (this drives the animation) */}
      <section
        ref={section2}
        id="section-2"
        className="min-h-screend flex items-center justify-center px-6d bg-whitev text-black"
      >
        {/* Your content */}
        <Index />
      </section>
    </div>
  );
}
