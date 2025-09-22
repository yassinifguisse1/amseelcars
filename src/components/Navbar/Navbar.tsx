// components/Navbar.tsx
"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[2000] bg-white/80 backdrop-blur border-b border-black/5">
        <nav className="mx-auto max-w-7xl h-14 px-4 sm:px-6 lg:px-8 flex items-center">
          {/* Brand */}
          <Link href="/" className="font-semibold tracking-tight text-gray-900">
            AMSSEEL CARS
          </Link>

          {/* Links */}
          <div className="ml-auto flex items-center gap-4 sm:gap-6 text-sm text-gray-700">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <Link href="/cars" className="hover:text-gray-900">Cars</Link>
            <Link href="/about" className="hover:text-gray-900">about</Link>
            <Link href="/contact" className="hover:text-gray-900">contact</Link>

            <a
              href="#"
              className="inline-flex items-center rounded-lg bg-black text-white px-3 py-1.5 hover:opacity-90"
            >
              Book now
            </a>
          </div>
        </nav>
      </header>

      {/* Spacer so page content isn't hidden under the fixed bar */}
      <div className="h-14" />
    </>
  );
}
