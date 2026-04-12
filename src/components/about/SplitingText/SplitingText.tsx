"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";
import "./style.css";
gsap.registerPlugin(ScrollTrigger);

export default function SplitingText() {
  const t = useTranslations("aboutPage");
  const root = useRef<HTMLDivElement>(null);
  const section1 = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: section1.current!,
              start: "50% 100%",
              end: "bottom top",
              scrub: 1,
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
              start: "50% 100%",
              end: "bottom top",
              scrub: 1,
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
            <span className="split-left inline-block  text-[20px] sm:-[28px] md:text-[50px]  lg:text-[50px]">{t("splitLine1Left")}</span>
            <span className="split-right inline-block text-[20px] sm:-[28px] md:text-[50px]  lg:text-[50px]">{t("splitLine1Right")}</span>
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
            <span className="inline-block text-[20px] sm:-[28px] md:text-[50px]  lg:text-[50px] font-poppins">{t("splitLine2")}</span>
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
            <span className="split-left inline-block text-[20px] sm:-[28px] md:text-[50px]  lg:text-[50px] font-poppins">{t("splitLine3Left")}</span>
            <span className="split-right inline-block text-[20px] sm:-[28px] md:text-[50px]  lg:text-[50px] font-poppins">{t("splitLine3Right")}</span>
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
            <span className="split-leftd inline-block text-[20px] sm:-[28px] md:text-[50px]  lg:text-[50px] font-poppins">{t("splitLine4Left")}</span>
            <span className="split-rightd inline-block text-[20px] sm:-[28px] md:text-[50px]  lg:text-[50px] font-poppins">{t("splitLine4Right")}</span>
          </h1>
        </div>
      </section>
    </div>
  );
}
