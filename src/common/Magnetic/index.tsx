"use client";
import React, { useEffect, useRef, ReactElement } from "react";
import gsap from "gsap";

interface MagneticProps {
  children: ReactElement;
}

export default function Index({ children }: MagneticProps) {
  const magnetic = useRef<HTMLElement>(null);

  useEffect(() => {
    const currentElement = magnetic.current;
    if (!currentElement) return;

    console.log(children);
    const xTo = gsap.quickTo(currentElement, "x", {
      duration: 1,
      ease: "elastic.out(1, 0.3)",
    });
    const yTo = gsap.quickTo(currentElement, "y", {
      duration: 1,
      ease: "elastic.out(1, 0.3)",
    });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } =
        currentElement.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      xTo(x * 0.35);
      yTo(y * 0.35);
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
    };

    currentElement.addEventListener("mousemove", handleMouseMove);
    currentElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      currentElement.removeEventListener("mousemove", handleMouseMove);
      currentElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [children]);

  return React.cloneElement(children, {
    ref: (node: HTMLElement) => {
      magnetic.current = node;
      // If the original element had a ref, call it too
      const originalRef = (children as React.ReactElement & { ref?: unknown }).ref;
      if (typeof originalRef === "function") {
        originalRef(node);
      } else if (originalRef) {
        (originalRef as React.MutableRefObject<HTMLElement | null>).current =
          node;
      }
    },
  } as Partial<React.HTMLAttributes<HTMLElement>>);
}
