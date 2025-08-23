import type { Metadata } from "next";
import "./globals.css";
import Menu from "@/components/menu/menu";
import { LenisScrollProvider } from "./providers/lenis-scroll-trigger";
import { ViewTransitions } from "next-view-transitions";
import { playfair, anticDidone } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Rental Cars",
  description: "Rental Cars",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  
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
