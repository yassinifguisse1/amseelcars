"use client";

import dynamic from "next/dynamic";

/**
 * Client-only Header so menu SCSS + framer-motion stay off the SSR CSS critical path.
 */
const Header = dynamic(() => import("@/components/Header"), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: 140,
        height: 50,
        zIndex: 40,
        pointerEvents: "none",
      }}
    />
  ),
});

export function DeferredHeader() {
  return <Header />;
}
