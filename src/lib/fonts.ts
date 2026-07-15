import { Antic_Didone, Playfair_Display } from "next/font/google";

/** Keep faces/weights minimal — extra axes crush PageSpeed. */
export const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal"],
  variable: "--font-playfair",
  display: "swap",
  preload: true,
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
