"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLoading } from "@/contexts/LoadingContext";

// ---- tune these ----
const FRAME_START = 400;
const FRAME_END   = 763;

type Drawable = HTMLImageElement | ImageBitmap;

export default function Cardrive() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);

  const [frames, setFrames] = useState<Drawable[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // store CSS-pixel canvas size + device ratio
  const cssW = useRef(0);
  const cssH = useRef(0);
  const dpr  = useRef(1);

  // loading UI (optional)
  const { updateFramesProgress, setFramesLoaded, setWordsComplete, setMinimumTimeElapsed } = useLoading();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Compute effective frame count (skip some on mobile)
  const frameStep = isMobile ? 2 : 1; // skip every 2nd frame on mobile
  const totalFrames = Math.floor((FRAME_END - FRAME_START + 1) / frameStep);

  // Map scroll -> frame index in [0, totalFrames-1]
  const currentIndex = useTransform(scrollYProgress, [0, 1], [0, totalFrames - 1]);

  // ------------------ load ------------------
  useEffect(() => {
    const useMobileFrames = window.innerWidth < 768;
    setIsMobile(useMobileFrames);

    // let the global preloader finish nicely
    setWordsComplete?.(true);
    setMinimumTimeElapsed?.(false);
    setTimeout(() => setMinimumTimeElapsed?.(true), 2000);

    let cancelled = false;

    async function loadAll() {
      const folder = useMobileFrames ? "/mobile-frames" : "/frame";
      const framesToLoad = Array.from({ length: totalFrames }, (_, i) => FRAME_START + i * frameStep);

      updateFramesProgress?.(0, framesToLoad.length);

      const loaded: Drawable[] = new Array(framesToLoad.length);
      let done = 0;

      async function loadOne(idx: number) {
        const frameNo = String(framesToLoad[idx]).padStart(5, "0");
        const url = `${folder}/frame_${frameNo}.webp`;

        try {
          if ("createImageBitmap" in window) {
            // GPU-friendly decode path
            const res = await fetch(url, { cache: "force-cache" });
            const blob = await res.blob();
            const bmp = await createImageBitmap(blob);
            return bmp as Drawable;
          } else {
            const img = new Image();
            img.decoding = "async";
            img.loading = "eager";
            img.src = url;
            await img.decode();
            return img as Drawable;
          }
        } catch {
          // tiny black placeholder so indices stay aligned
          const fallback = new Image();
          fallback.src =
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9ImJsYWNrIi8+PC9zdmc+";
          return fallback as Drawable;
        }
      }

      await Promise.all(
        framesToLoad.map(async (_, i) => {
          const img = await loadOne(i);
          if (cancelled) return;
          loaded[i] = img;
          done++;
          updateFramesProgress?.(done, framesToLoad.length);
        })
      );

      if (cancelled) return;
      setFrames(loaded);
      setImagesLoaded(true);
      setFramesLoaded?.(true);
    }

    loadAll();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameStep, totalFrames]);

  // ------------------ canvas sizing ------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const vpH = window.visualViewport?.height ?? window.innerHeight;

      cssW.current = window.innerWidth;
      cssH.current = vpH;

      dpr.current = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);

      // real pixel buffer
      canvas.width = Math.max(1, Math.floor(cssW.current * dpr.current));
      canvas.height = Math.max(1, Math.floor(cssH.current * dpr.current));

      // CSS size
      canvas.style.width = `${cssW.current}px`;
      canvas.style.height = `${cssH.current}px`;
    };

    // first sizing
    isMobile ? setTimeout(resize, 80) : resize();

    const onResize = () => resize();
    const onOrientation = () => setTimeout(resize, 300);

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onOrientation);

    if (window.visualViewport && isMobile) {
      const vpr = () => setTimeout(resize, 100);
      window.visualViewport.addEventListener("resize", vpr);
      return () => {
        window.removeEventListener("resize", onResize);
        window.removeEventListener("orientationchange", onOrientation);
        window.visualViewport?.removeEventListener("resize", vpr);
      };
    }

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrientation);
    };
  }, [isMobile]);

  // ------------------ draw ------------------
  const lastDrawn = useRef(-1);
  const rafId = useRef<number | null>(null);
  const pending = useRef<number | null>(null);

  const drawFrame = useCallback(
    (idx: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !imagesLoaded || frames.length === 0) return;

      const i = Math.max(0, Math.min(Math.round(idx), frames.length - 1));
      if (i === lastDrawn.current) return;
      lastDrawn.current = i;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // always work in CSS pixels; set transform each paint
      ctx.setTransform(dpr.current, 0, 0, dpr.current, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = isMobile ? "low" : "medium";

      // clear
      ctx.clearRect(0, 0, cssW.current, cssH.current);

      const img = frames[i] as Drawable;

      // fill canvas, keep aspect
      const canvasAspect = cssW.current / cssH.current;
      const imageAspect =
        "width" in img && "height" in img ? img.width / img.height : 16 / 9;

      let w, h, x, y;
      if (canvasAspect > imageAspect) {
        w = cssW.current;
        h = w / imageAspect;
        x = 0;
        y = (cssH.current - h) / 2;
      } else {
        h = cssH.current;
        w = h * imageAspect;
        x = (cssW.current - w) / 2;
        y = 0;
      }

      try {
        ctx.drawImage(img, x, y, w, h);
      } catch {
        // ignore draw errors on slow devices
      }
    },
    [frames, imagesLoaded, isMobile]
  );

  const requestDraw = (idx: number) => {
    pending.current = idx;
    if (rafId.current != null) return;
    rafId.current = requestAnimationFrame(() => {
      if (pending.current != null) drawFrame(pending.current);
      pending.current = null;
      rafId.current = null;
    });
  };

  // initial paint when images ready
  useEffect(() => {
    if (imagesLoaded && frames.length) {
      requestDraw(0);
    }
  }, [imagesLoaded, frames]);

  // paint on scroll (RAF throttled)
  useMotionValueEvent(currentIndex, "change", (latest) => {
    requestDraw(Number(latest));
  });

  // ------------------ button transforms ------------------
  const buttonY = useTransform(scrollYProgress, [0, 0.4, 0.8, 1], ["30vh", "28vh", "12vh", "8vh"]);
  const buttonOpacity = useTransform(scrollYProgress, [0, 0.2, 0.3, 1], [0, 0, 1, 1]);
  const buttonScale = useTransform(scrollYProgress, [0.2, 0.5, 0.6], [0.4, 1, 1]);

  return (
    <motion.section
      ref={containerRef}
      className="relative bg-black"
      style={{ height: isMobile ? "250svh" : "300svh", touchAction: "pan-y" }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      <div className="sticky top-0 h-[100svh] w-full flex items-center justify-center bg-black">
        <canvas
          ref={canvasRef}
          className="block"
          style={{
            display: "block",
            width: "100vw",
            height: isMobile ? "100svh" : "100vh",
            objectFit: "cover",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />

        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto"
          style={{ y: buttonY, opacity: buttonOpacity, scale: buttonScale }}
        >
          <Link href="/cars">
            <motion.button
              className={`relative px-8 py-4 bg-white text-black font-bold rounded-full border-2 border-white shadow-2xl ${
                isMobile ? "px-6 py-3 text-base" : "text-lg"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore All Cars →
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}
