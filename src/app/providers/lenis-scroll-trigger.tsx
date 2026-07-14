// src/app/providers/lenis-scroll-trigger.tsx
"use client";

import { useEffect } from "react";

/** Defer smooth scroll so LCP / TBT stay free of Lenis + GSAP ScrollTrigger. */
const LENIS_DEFER_MS = 2800;

export function LenisScrollProvider() {
  useEffect(() => {
    let disposed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lenis: any = null;
    let rafId = 0;
    let onScroll: (() => void) | null = null;
    let onRefresh: (() => void) | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ScrollTrigger: any = null;

    const start = async () => {
      if (disposed) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      // Native scroll on phones is better for PageSpeed + UX.
      if (window.matchMedia("(pointer: coarse)").matches && window.innerWidth < 900) {
        return;
      }

      const [{ default: Lenis }, gsapMod, stMod] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (disposed) return;

      const gsap = gsapMod.gsap ?? gsapMod.default;
      ScrollTrigger = stMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      lenis = new Lenis({ smoothWheel: true });

      const raf = (time: number) => {
        if (!lenis || disposed) return;
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);

      ScrollTrigger.scrollerProxy(document.body, {
        scrollTop(value?: number) {
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
    };

    const schedule = () => {
      window.setTimeout(() => {
        void start();
      }, LENIS_DEFER_MS);
    };

    if (document.readyState === "complete") {
      schedule();
    } else {
      window.addEventListener("load", schedule, { once: true });
    }

    return () => {
      disposed = true;
      window.removeEventListener("load", schedule);
      cancelAnimationFrame(rafId);
      if (lenis && onScroll) lenis.off("scroll", onScroll);
      if (onRefresh && ScrollTrigger) {
        ScrollTrigger.removeEventListener("refresh", onRefresh);
      }
      lenis?.destroy();
      ScrollTrigger?.killAll();
    };
  }, []);

  return null;
}
