"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./WeekndParallax.module.scss";

gsap.registerPlugin(ScrollTrigger);

export default function WeekndParallax() {
  const rootRef = useRef<HTMLDivElement>(null);
  const imgWrapperRef = useRef<HTMLDivElement>(null);
  const codeByLinkRef = useRef<HTMLAnchorElement>(null);

  // image refs
  const img1Ref = useRef<HTMLImageElement>(null);
  const img2Ref = useRef<HTMLImageElement>(null);
  const img3Ref = useRef<HTMLImageElement>(null);
  const img4Ref = useRef<HTMLImageElement>(null);
  const img5Ref = useRef<HTMLImageElement>(null);
  const img6Ref = useRef<HTMLImageElement>(null);
  const img7Ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!rootRef.current || !imgWrapperRef.current) return;

    const ctx = gsap.context(() => {
      // fade in
      gsap.to(rootRef.current, { opacity: 1, duration: 1.3 });

      // hover color swap for the link
      const onEnter = () => {
        gsap.to(imgWrapperRef.current, { backgroundColor: "#f0f0f0", duration: 0.3 });
        gsap.to(codeByLinkRef.current, { color: "#2e2e2e", duration: 0.3 });
        const span = codeByLinkRef.current?.querySelector("span");
        if (span) gsap.to(span, { color: "#000000", duration: 0.3 });
      };
      const onLeave = () => {
        gsap.to(imgWrapperRef.current, { backgroundColor: "#000000", duration: 0.3 });
        gsap.to(codeByLinkRef.current, { color: "#e6e6e6", duration: 0.3 });
        const span = codeByLinkRef.current?.querySelector("span");
        if (span) gsap.to(span, { color: "#f0f0f0", duration: 0.3 });
      };
      codeByLinkRef.current?.addEventListener("mouseenter", onEnter);
      codeByLinkRef.current?.addEventListener("mouseleave", onLeave);

      // pinned parallax
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: imgWrapperRef.current,
          start: "top top",
          end: "bottom top",
          pin: imgWrapperRef.current,
          scrub: 2.2,
        },
      });

      tl.to(img7Ref.current, { z: 4500 }, 0)
        .to(img6Ref.current, { z: 3700 }, 0)
        .to(img5Ref.current, { z: 3100 }, 0)
        .to(img4Ref.current, { z: 2800 }, 0)
        .to(img3Ref.current, { z: 2600 }, 0)
        .to(img2Ref.current, { z: 2400 }, 0)
        .to(img1Ref.current, { z: 2200 }, 0)
        .from(codeByLinkRef.current, { y: 130, opacity: 0, ease: "power2.out" }, 0.31);

      return () => {
        codeByLinkRef.current?.removeEventListener("mouseenter", onEnter);
        codeByLinkRef.current?.removeEventListener("mouseleave", onLeave);
      };
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className={styles.root}>
      {/* Intro */}
      <div className={styles.wrapper}>
        <h1>
          The Weeknd <br /> <span>GSAP Scroll Effect</span>
        </h1>
        <p>Scroll Down</p>
      </div>

      {/* Pinned stage */}
      <div ref={imgWrapperRef} className={styles.imgWrapper}>
        <img
          ref={img1Ref}
          src="/images/1.jpeg"
          alt="img1"
          className={`${styles.img} ${styles.img1}`}
        />
        <img
          ref={img2Ref}
          src="/images/2.jpeg"
          alt="img2"
          className={`${styles.img} ${styles.img2}`}
        />
        {/* <img
          ref={img3Ref}
          src="/images/6.jpg"
          alt="img3"
          className={`${styles.img} ${styles.img3}`}
        /> */}
        <img
          ref={img4Ref}
          src="/images/5.jpg"
          alt="img4"
          className={`${styles.img} ${styles.img4}`}
        />
        <img
          ref={img5Ref}
          src="/images/3.jpg"
          alt="img5"
          className={`${styles.img} ${styles.img5}`}
        />
        <img
          ref={img6Ref}
          src="/images/4.jpg"
          alt="img6"
          className={`${styles.img} ${styles.img6}`}
        />
        <img
          ref={img7Ref}
          src="/images/7.jpeg"
          alt="img7"
          className={`${styles.img} ${styles.img7}`}
        />

        <div className={styles.codeby}>
          <a
            ref={codeByLinkRef}
            href="https://icodeayush.github.io/"
            target="_blank"
            rel="noreferrer"
          >
            Code By <span>iCodeAyush</span>
          </a>
        </div>
      </div>
    </div>
  );
}
