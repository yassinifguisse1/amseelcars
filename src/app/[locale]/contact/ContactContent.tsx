"use client";

import React, { useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AnimatedHeader from "@/components/Contact/AnimatedHeader";
import ContactForm from "@/components/Contact/ContactForm";
import ContactInfo from "@/components/Contact/ContactInfo";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useLoading } from "@/contexts/LoadingContext";
import Speedometer from "@/components/Preloader/Speedometer";
import { useTranslations } from "next-intl";

gsap.registerPlugin(ScrollTrigger);

function SpeedometerPreloader() {
  const { loadingState } = useLoading();
  const t = useTranslations("contactPage.preloader");

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.06,
        transition: {
          duration: 1.1,
          ease: [0.25, 0.1, 0.25, 1],
          opacity: { duration: 0.75 },
          scale: { duration: 1.1, ease: "easeOut" },
        },
      }}
    >
      <motion.div
        className="text-center"
        initial={{ y: 0, opacity: 1, scale: 1 }}
        exit={{
          y: -64,
          opacity: 0,
          scale: 0.94,
          transition: {
            duration: 0.95,
            ease: [0.25, 0.1, 0.25, 1],
          },
        }}
      >
        <Speedometer
          value={loadingState.framesProgress}
          max={100}
          size={400}
          autoplay={false}
        />
        <motion.div
          className="mt-8 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.55 }}
        >
          <h1 className="font-[family-name:var(--font-heading)] mb-2 text-2xl font-bold tracking-wide md:text-4xl">
            {t("brandTitle")}
          </h1>
          <p className="mx-auto max-w-md text-sm text-neutral-400 md:text-base">
            {t("tagline")}
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function ContactContent() {
  const t = useTranslations("contactPage.cta");
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const {
    loadingState,
    updateFramesProgress,
    setFramesLoaded,
    setWordsComplete,
    setMinimumTimeElapsed,
  } = useLoading();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      if (progress <= 100) {
        const totalFrames = 100;
        const loadedFrames = Math.round((progress / 100) * totalFrames);
        updateFramesProgress(loadedFrames, totalFrames);
      } else {
        clearInterval(progressInterval);
      }
    }, 200);

    const completionTimer = setTimeout(() => {
      clearInterval(progressInterval);
      setFramesLoaded(true);
      setWordsComplete(true);
      setMinimumTimeElapsed(true);
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(completionTimer);
    };
  }, [
    isClient,
    updateFramesProgress,
    setFramesLoaded,
    setWordsComplete,
    setMinimumTimeElapsed,
  ]);

  useEffect(() => {
    if (loadingState.isComplete && isClient) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        document.body.style.cursor = "default";
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [loadingState, isClient]);

  useEffect(() => {
    ScrollTrigger.refresh();
    return () => {
      ScrollTrigger.getAll().forEach((tr) => tr.kill());
    };
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <SpeedometerPreloader />}
      </AnimatePresence>

      <AnimatedHeader />

      <section className="relative border-t border-white/[0.06] bg-black py-20 md:py-28">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, rgba(236,28,37,0.12), transparent 45%),
              radial-gradient(circle at 85% 70%, rgba(236,28,37,0.08), transparent 40%)`,
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.2]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <div className="mb-14 text-center md:mb-16">
            <div className="mx-auto mb-4 h-px w-16 bg-gradient-to-r from-transparent via-[#EC1C25]/60 to-transparent" />
            <p className="font-[family-name:var(--font-heading)] text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-[#EC1C25]/75">
              Amseel Cars · Agadir
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/[0.07] bg-neutral-950/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-xl md:p-10 lg:p-12">
            <div className="hidden items-start gap-16 lg:grid lg:grid-cols-2 lg:gap-20">
              <div className="lg:sticky lg:top-24">
                <ContactForm />
              </div>
              <div>
                <ContactInfo />
              </div>
            </div>

            <div className="space-y-20 lg:hidden">
              <ContactForm />
              <ContactInfo />
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </section>

      <section className="relative overflow-hidden border-t border-white/[0.06] bg-gradient-to-b from-neutral-950 to-black py-20 md:py-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(circle at 50% 120%, #EC1C25 0%, transparent 55%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-[family-name:var(--font-heading)] mb-5 text-3xl font-bold leading-tight text-white md:text-4xl lg:text-[2.75rem]">
            {t("title")}
          </h2>
          <p className="mb-10 text-lg leading-relaxed text-neutral-400 md:text-xl">
            {t("lead")}
          </p>
          <div className="flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            <Link
              href="https://wa.me/212662500181"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#EC1C25] to-[#c41520] px-8 py-4 font-semibold text-white shadow-lg shadow-[#EC1C25]/20 transition hover:shadow-xl hover:shadow-[#EC1C25]/30"
            >
              {t("whatsappCta")}
            </Link>
            <Link
              href="mailto:amseelcars5@gmail.com"
              className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.05] px-8 py-4 font-semibold text-white backdrop-blur-sm transition hover:border-white/25 hover:bg-white/[0.08]"
            >
              {t("emailCta")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
