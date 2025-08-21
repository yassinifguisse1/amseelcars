import type { Metadata } from "next";
import { Antic_Didone, Playfair_Display } from "next/font/google";
import "./globals.css";
import Menu from "@/components/menu/menu";
import { LenisScrollProvider } from "./providers/lenis-scroll-trigger";
import { ViewTransitions } from "next-view-transitions";


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
    <ViewTransitions>
    <html lang="en" suppressHydrationWarning>
      
      <body
        className={` ${playfair.variable} ${anticDidone.variable} antialiased`}
      >
        <LenisScrollProvider />
        <Menu />
        {children}
      
      </body>
    </html>
    </ViewTransitions>
  );
}
