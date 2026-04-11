"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Car, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

gsap.registerPlugin(ScrollTrigger);

const ACCENT = "#EC1C25";

export default function AnimatedHeader() {
  const t = useTranslations("contactPage.hero");
  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const decorRef = useRef<HTMLDivElement>(null);
  const sparklesRef = useRef<HTMLDivElement[]>([]);

  const addSparkleRef = (el: HTMLDivElement | null) => {
    if (el && !sparklesRef.current.includes(el)) {
      sparklesRef.current.push(el);
    }
  };

  useEffect(() => {
    const header = headerRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const decor = decorRef.current;
    const sparkles = sparklesRef.current;

    if (!header || !title || !subtitle) return;

    gsap.set([title, subtitle], { opacity: 0, y: 50, scale: 0.96 });
    if (decor) gsap.set(decor, { opacity: 0, scale: 0, rotation: -12 });
    gsap.set(sparkles, { opacity: 0, scale: 0 });

    const tl = gsap.timeline({ delay: 0.15 });
    tl.to(title, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1,
      ease: "power3.out",
    })
      .to(
        subtitle,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.85,
          ease: "power3.out",
        },
        "-=0.55",
      );

    if (decor) {
      tl.to(
        decor,
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.75,
          ease: "back.out(1.6)",
        },
        "-=0.5",
      );
    }

    if (sparkles.length) {
      tl.to(
        sparkles,
        {
          opacity: 1,
          scale: 1,
          duration: 0.55,
          stagger: 0.08,
          ease: "back.out(1.5)",
        },
        "-=0.35",
      );
      sparkles.forEach((sparkle, index) => {
        gsap.to(sparkle, {
          rotation: 360,
          duration: 4 + index * 0.4,
          repeat: -1,
          ease: "none",
        });
        gsap.to(sparkle, {
          y: -8,
          duration: 2.2 + index * 0.25,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      });
    }

    ScrollTrigger.create({
      trigger: header,
      start: "top top",
      end: "bottom top",
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;
        gsap.to(title, {
          y: p * -40,
          opacity: 1 - p * 0.45,
          duration: 0.2,
        });
        gsap.to(subtitle, {
          y: p * -24,
          opacity: 1 - p * 0.65,
          duration: 0.2,
        });
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((tr) => tr.kill());
    };
  }, []);

  return (
    <div
      ref={headerRef}
      className="relative min-h-[88vh] flex items-center justify-center overflow-hidden bg-black"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, ${ACCENT}33, transparent 55%),
            radial-gradient(circle at 15% 40%, ${ACCENT}18, transparent 42%),
            radial-gradient(circle at 88% 65%, rgba(251, 191, 36, 0.08), transparent 40%)
          `,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />

      <div className="absolute inset-0 overflow-hidden">
        <div
          ref={addSparkleRef}
          className="absolute top-[22%] left-[18%] text-[#EC1C25]/35"
        >
          <Sparkles className="h-6 w-6" strokeWidth={1.25} />
        </div>
        <div
          ref={addSparkleRef}
          className="absolute top-[28%] right-[20%] text-amber-200/25"
        >
          <Sparkles className="h-4 w-4" strokeWidth={1.25} />
        </div>
        <div
          ref={addSparkleRef}
          className="absolute bottom-[32%] left-[28%] text-[#EC1C25]/25"
        >
          <Sparkles className="h-8 w-8" strokeWidth={1} />
        </div>
        <div
          ref={addSparkleRef}
          className="absolute bottom-[26%] right-[24%] text-amber-100/20"
        >
          <Sparkles className="h-5 w-5" strokeWidth={1.25} />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <p className="font-[family-name:var(--font-heading)] mb-6 text-[0.65rem] font-semibold uppercase tracking-[0.38em] text-white/45 md:text-xs">
          {t("kicker")}
        </p>

        <div
          ref={decorRef}
          className="mx-auto mb-10 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset,0_24px_48px_rgba(236,28,37,0.12)] backdrop-blur-md"
        >
          <Car className="h-10 w-10 text-[#EC1C25]" strokeWidth={1.25} />
        </div>

        <h1
          ref={titleRef}
          className="font-[family-name:var(--font-heading)] mb-8 text-5xl font-bold leading-[1.05] text-white md:text-7xl lg:text-8xl"
        >
          {t("titleStart")}
          <span className="bg-gradient-to-r from-[#EC1C25] to-[#ff5a62] bg-clip-text pl-2 text-transparent md:pl-3">
            {t("titleAccent")}
          </span>
        </h1>

        <p
          ref={subtitleRef}
          className="mx-auto max-w-2xl text-lg leading-relaxed text-neutral-300 md:text-xl md:leading-relaxed"
        >
          {t("subtitle")}
        </p>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#EC1C25]/40 to-transparent" />
    </div>
  );
}
