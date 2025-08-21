import { Antic_Didone, Playfair_Display } from "next/font/google";

export const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400","500","600","700","800","900"],
  style: ["normal","italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const anticDidone = Antic_Didone({
  subsets: ["latin"],
  weight: "400",             // Antic Didone provides one weight
  variable: "--font-antic",
  display: "swap",
}); 