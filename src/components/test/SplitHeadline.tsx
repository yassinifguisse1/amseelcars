// app/components/SplitHeadline.tsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Index from "../Description/Index";
import "./style.css";
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
               start: "top 100%",
               // until its top reaches 20% from top:
               end: "top 50%",
               scrub: true,
               // markers: true, // Disabled for production
             },
          })
          .to(".split-left", { xPercent: -40, ease: "none" }, 0)
          .to(".split-right", { xPercent: 40, ease: "none" }, 0);
      });

      mm.add("(max-width: 767px)", () => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: section2.current!,
              start: "top 100%",
              end: "top 50%",
              scrub: true,
            },
          })
          .to(".split-left", { xPercent: -25, ease: "none" }, 0)
          .to(".split-right", { xPercent: 25, ease: "none" }, 0);
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="w-full">
      {/* SECTION 1 (sticky headline lives here) */}
      <section id="section-1" className="min-h-[100vh]s flex flex-col items-center justify-center bg-black pt-20 " >
        <div className=" top-[12vh] w-full ">
          <h1
            className="
              flex justify-center items-start gap-[0.3ch]
              font-bold leading-[0.95]
              text-white will-change-transform
              whitespace-normal sm:whitespace-nowrap
              [text-wrap:balance]
              // text-[clamp(40px,6vw,100px)] md:text-[clamp(36px,7.5vw,96px)] lg:text-[clamp(40px,6vw,100px)]
            "
          >
            <span  className="split-left inline-block text-[30px] md:text-[50px]  lg:text-[90px]">We&nbsp;are</span>
            <span  className="split-right inline-block text-[30px] md:text-[50px]  lg:text-[90px]">your&nbsp;next&nbsp;ride.</span>
          </h1>
        </div>
        <div className="; top-[12vh], w-full  flex flex-col items-center justify-center">
          <h1
            className="
              flex justify-center items-start gap-[0.3ch]
              font-bold leading-[0.95]
              text-white will-change-transform
              whitespace-normal sm:whitespace-nowrap
              [text-wrap:balance]
              text-[clamp(28px,9vw,72px)] md:text-[clamp(36px,7.5vw,96px)] lg:text-[clamp(40px,6vw,110px)]
            "
          >
          <span className="split-lefts inline-block text-[30px] md:text-[45px]  lg:text-[90px]">From&nbsp;airport&nbsp;</span>

            <span className="split-rights inline-block text-[30px] md:text-[45px]  lg:text-[90px]">to&nbsp;anywhere.</span>
          </h1>
        </div>
        <div className="; top-[12vh], w-full  flex flex-col items-center justify-center">
          <h1
            className="
              flex justify-center items-start gap-[0.3ch]
              font-bold leading-[0.95]
              text-white will-change-transform
              whitespace-normal sm:whitespace-nowrap
              [text-wrap:balance]
              text-[clamp(28px,9vw,72px)] md:text-[clamp(36px,7.5vw,96px)] lg:text-[clamp(40px,6vw,110px)]
            "
          >
            <span className="split-leftc inline-block text-[30px] md:text-[50px]  lg:text-[90px]">Book</span>
            <span className="split-rightc inline-block text-[30px] md:text-[50px]  lg:text-[90px]">in&nbsp;minutes</span>

          </h1>
        </div>
        <div className="; top-[12vh], w-full  flex flex-col items-center justify-center">
          <h1
            className="
              flex justify-center items-start gap-[0.3ch]
              font-bold leading-[0.95]
              text-white will-change-transform
              whitespace-normal sm:whitespace-nowrap
              [text-wrap:balance]
              text-[clamp(28px,9vw,72px)] md:text-[clamp(36px,7.5vw,96px)] lg:text-[clamp(40px,6vw,110px)]
            "
          >
            <span className="split-left inline-block text-[30px] md:text-[50px]  lg:text-[90px]">Pick</span>
            <span className="split-right inline-block text-[30px] md:text-[50px]  lg:text-[90px]">a&nbsp;car</span>

          </h1>
        </div>
        <div className="; top-[12vh], w-full  flex flex-col items-center justify-center">
          <h1
            className="
              flex justify-center items-start gap-[0.3ch]
              font-bold leading-[0.95]
              text-white will-change-transform
              whitespace-normal sm:whitespace-nowrap
              [text-wrap:balance]
              text-[clamp(28px,9vw,72px)] md:text-[clamp(36px,7.5vw,96px)] lg:text-[clamp(40px,6vw,110px)] 
            "
          >
            <span className="split-left inline-block text-[30px] md:text-[50px]  lg:text-[90px]">Start</span>
            <span className="split-right inline-block text-[30px] md:text-[50px]  lg:text-[90px]">the&nbsp;journey.</span>

          </h1>
        </div>

      </section>

      {/* SECTION 2 (this drives the animation) */}
      <section
        ref={section2}
        id="section-2"
        className="min-h-screendc flex items-center justify-center px-6 bg-whiteb text-black"
      >
        {/* Your content */}

        <Index />
      </section>
    </div>
  );
}
