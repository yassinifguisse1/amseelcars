import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import Menu from "@/components/menu/menu";
import { LenisScrollProvider } from "./providers/lenis-scroll-trigger";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  // display: "swap",
  weight: ["400","500","600","700","800","900"],     // pick what you use
  style: ["normal","italic"],                        // optional
});

export const metadata: Metadata = {
  title: "Rental Cars",
  description: "Rental Cars",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` ${playfair.variable} antialiased`}
      >
        <LenisScrollProvider />
        <Menu />
        {children}
      
      </body>
    </html>
  );
}
