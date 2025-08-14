// src/app/providers/lenis-scroll-trigger.tsx
"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function LenisScrollProvider() {
  useEffect(() => {
    const lenis = new Lenis({ smoothWheel: true });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Tell ScrollTrigger to use Lenis instead of native scroll
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (value != null) lenis.scrollTo(value, { immediate: true });
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: innerWidth, height: innerHeight };
      },
    });

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    ScrollTrigger.addEventListener("refresh", () => lenis.resize());
    ScrollTrigger.refresh();

    return () => {
      lenis.off("scroll", onScroll);
      lenis.destroy();
      ScrollTrigger.killAll();
    };
  }, []);

  return null;
}
