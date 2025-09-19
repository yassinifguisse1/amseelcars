import type { Metadata } from "next";
import "./globals.css";
import { LenisScrollProvider } from "./providers/lenis-scroll-trigger";
// import { ViewTransitions } from "next-view-transitions";
import { playfair, anticDidone } from "@/lib/fonts";
import { Analytics } from '@vercel/analytics/next';
import Header from "@/components/Header";

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
      // <ViewTransitions>
    <html lang="en" suppressHydrationWarning>
      
      <body
        className={` ${playfair.variable} ${anticDidone.variable} antialiased`}
      >
        <LenisScrollProvider />
        {/* <Menu /> */}
        <Header/>
        {children}
        <Analytics />

      </body>
    </html>
        // </ViewTransitions>
  );
}
