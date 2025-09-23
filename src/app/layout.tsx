import type { Metadata } from "next";
import "./globals.css";
import { LenisScrollProvider } from "./providers/lenis-scroll-trigger";
// import { ViewTransitions } from "next-view-transitions";
import { playfair, anticDidone } from "@/lib/fonts";
import { clsx } from "clsx";
import { Analytics } from "@vercel/analytics/next";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar/Navbar";

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
  const fontVariables = clsx(playfair.variable, anticDidone.variable);
  return (
    // <ViewTransitions>
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        suppressHydrationWarning
        className={clsx(fontVariables, "antialiased")}
      >
        <LenisScrollProvider />
        {/* Add a wrapper for the header with high z-index */}
        {/* <div className="fixed inset-x-0 top-0 z-[1001] pointer-events-none">
          <div className="pointer-events-none"> */}
        <Header />
        {/* <Navbar/> */}
        {/* </div>
        </div> */}
        {/* Add relative positioning and lower z-index to main content */}
        {/* <main className="relative z-0"> */}
        {children}
        {/* </main> */}
        <Analytics />
      </body>
    </html>
    // </ViewTransitions>
  );
}
