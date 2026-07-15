import { Antic_Didone, Playfair_Display } from "next/font/google";

/**
 * Keep faces/weights minimal — extra axes crush PageSpeed.
 * Do not preload Playfair: the woff2 was on the critical path (~1.6s in Lighthouse).
 * Fallback serifs paint immediately; Playfair swaps in when ready.
 */
export const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal"],
  variable: "--font-playfair",
  display: "optional",
  preload: false,
  adjustFontFallback: true,
  fallback: ["Times New Roman", "Times", "serif"],
});

export const anticDidone = Antic_Didone({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-antic",
  display: "optional",
  preload: false,
  adjustFontFallback: true,
  fallback: ["Palatino Linotype", "Palatino", "serif"],
});
