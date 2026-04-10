// src/app/providers/lenis-scroll-trigger.tsx
"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Defer smooth scroll so first paint / LCP is less contended with rAF + ScrollTrigger work. */
const LENIS_DEFER_MS = 220;

export function LenisScrollProvider() {
  useEffect(() => {
    let disposed = false;
    let lenis: Lenis | null = null;
    let rafId = 0;
    let onScroll: (() => void) | null = null;
    let onRefresh: (() => void) | null = null;

    const timer = window.setTimeout(() => {
      if (disposed) return;

      lenis = new Lenis({ smoothWheel: true });

      function raf(time: number) {
        if (!lenis || disposed) return;
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);

      ScrollTrigger.scrollerProxy(document.body, {
        scrollTop(value) {
          if (!lenis) return 0;
          if (value != null) lenis.scrollTo(value, { immediate: true });
          return lenis.scroll;
        },
        getBoundingClientRect() {
          return { top: 0, left: 0, width: innerWidth, height: innerHeight };
        },
      });

      onScroll = () => ScrollTrigger.update();
      lenis.on("scroll", onScroll);

      onRefresh = () => lenis?.resize();
      ScrollTrigger.addEventListener("refresh", onRefresh);
      ScrollTrigger.refresh();
    }, LENIS_DEFER_MS);

    return () => {
      disposed = true;
      clearTimeout(timer);
      cancelAnimationFrame(rafId);
      if (lenis && onScroll) lenis.off("scroll", onScroll);
      if (onRefresh) ScrollTrigger.removeEventListener("refresh", onRefresh);
      lenis?.destroy();
      ScrollTrigger.killAll();
    };
  }, []);

  return null;
}
