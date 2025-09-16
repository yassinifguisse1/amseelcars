"use client";

import Link from "next/link";
import React, { useRef, useState, useEffect } from "react";
import "./menu.css";
import { usePathname, useRouter } from "next/navigation";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Magnetic from "@/common/Magnetic";
import { Facebook, Instagram, Mail, Phone } from "lucide-react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const menuLinks = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/cars", label: "CARS" },
  { path: "/contact", label: "Contact" },
];

export default function Menu() {
  const container = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [textColor, setTextColor] = useState('#fff');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    try { menuLinks.forEach((l) => router.prefetch?.(l.path)); } catch {}
  }, [router]);

  // Fallback: Detect background color if mix-blend-mode doesn't work
  useEffect(() => {
    const detectBackground = () => {
      const menuBar = document.querySelector('.menu-bar');
      if (!menuBar) return;

      // Get the element behind the menu bar
      const rect = menuBar.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const elementBelow = document.elementFromPoint(centerX, centerY);
      
      if (elementBelow) {
        const style = window.getComputedStyle(elementBelow);
        const bgColor = style.backgroundColor;
        
        // Simple detection: if background is white-ish, use black text
        if (bgColor.includes('rgb(255, 255, 255)') || 
            bgColor.includes('rgb(248, 250, 252)') || 
            bgColor.includes('#fff') ||
            bgColor.includes('#f8fafc')) {
          setTextColor('#000'); // Black text on white background
        } else {
          setTextColor('#fff'); // White text on dark background
        }
      }
    };

    // Check on scroll and resize
    const handleScroll = () => requestAnimationFrame(detectBackground);
    const handleResize = () => requestAnimationFrame(detectBackground);

    // Initial check
    detectBackground();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [pathname]);

  useGSAP(
    () => {
      gsap.set(".menu-link-item-holder", { y: 75 });

      tl.current = gsap
        .timeline({ paused: true })
        .to(".menu-overlay", {
          duration: 0.9,
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          ease: "power4.inOut",
          onStart: () => {
            overlayRef.current?.setAttribute("data-open", "true");
            document.documentElement.style.overflow = "hidden";
            container.current?.setAttribute("data-open", "true");
          },
        })
        .to(
          ".menu-link-item-holder",
          { y: 0, duration: 0.8, stagger: 0.08, ease: "power4.out" },
          "-=0.5"
        );
    },
    { scope: container }
  );

  useEffect(() => {
    // keep attributes synced even if timeline isn't used
    overlayRef.current?.setAttribute("data-open", isOpen ? "true" : "false");
    container.current?.setAttribute("data-open", isOpen ? "true" : "false");
  }, [isOpen]);

  const openMenu = () => {
    if (!isOpen) {
      setIsOpen(true);
      tl.current?.play();
    }
  };

  const closeMenu = (after?: () => void) => {
    if (isOpen) {
      tl.current?.eventCallback("onReverseComplete", () => {
        document.documentElement.style.overflow = "";
        setIsOpen(false);
        container.current?.setAttribute("data-open", "false");
        overlayRef.current?.setAttribute("data-open", "false");
        after?.();
      });
      tl.current?.reverse();
    } else {
      after?.();
    }
  };

  const handleRoute = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === path) return closeMenu();
    closeMenu(() => router.push(path));
  };

  return (
    <div className="menu-container" ref={container} data-open="false">
      {/* Top bar (hidden while overlay is open via CSS) */}
      <div className="menu-bar">
        <div className="menu-logo">
          <Link href="/" style={{ color: textColor }}>amseelcars</Link>
        </div>
        <button
          className="menu-open"
          aria-label="Open menu"
          aria-expanded={isOpen}
          onClick={openMenu}
        >
          <p style={{ color: textColor }}>Menu</p>
        </button>
      </div>

      {/* Overlay */}
      <div className="menu-overlay" ref={overlayRef} data-open="false">
        <div className="menu-overlay-bar">
          <div className="menu-logo">
            <Link href="/" onClick={handleRoute("/")}>amseelcars</Link>
          </div>
          <button className="menu-close" onClick={() => closeMenu()} aria-label="Close menu">
            <p>Close</p>
          </button>
        </div>

        <button className="menu-close-icon" onClick={() => closeMenu()} aria-label="Close menu">
          <p>&#x2715;</p>
        </button>

        <div className="menu-copy">
          <div className="menu-links">
            {menuLinks.map((link) => (
              <div className="menu-link-item" key={link.path}>
                <div className="menu-link-item-holder">
                  <Link
                    className="menu-link font-heading font-bold"
                    href={link.path}
                    onClick={handleRoute(link.path)}
                  >
                    {link.label}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="menu-info">
            <div className="menu-info-col flex gap-4">
              <Magnetic>
                <Link href="https://www.facebook.com/amseelcars/" target="_blank" className="menu-link">
                  <div className="flex items-center gap-2">
                    <Facebook className="w-7 h-7 text-black bg-black rounded-full p-1" />
                    <p>Facebook</p>
                  </div>
                </Link>
              </Magnetic>
              <Magnetic>
                <Link href="https://www.instagram.com/amseelcars/" target="_blank" className="menu-link">
                  <div className="flex items-center gap-2">
                    <Instagram className="w-7 h-7 text-black bg-black rounded-full p-1" />
                    <p>Instagram</p>
                  </div>
                </Link>
              </Magnetic>
              <Magnetic>
                <Link href="https://wa.me/212662500181" target="_blank" className="menu-link">
                  <div className="flex items-center gap-2">
                    <Phone className="w-7 h-7 text-black bg-black rounded-full p-1" />
                    <p>Whatsapp</p>
                  </div>
                </Link>
              </Magnetic>
            </div>

            <div className="menu-info-col flex gap-4">
              <Link href="mailto:info@amseelcars.com" target="_blank" className="menu-link">
                <div className="flex items-center gap-2">
                  <Mail className="w-7 h-7 text-black bg-black rounded-full p-1" />
                  <p className="menu-link">info@amseelcars.com</p>
                </div>
              </Link>

              <Link href="tel:+212662500181" target="_blank" className="menu-link">
                <div className="flex items-center gap-2">
                  <Phone className="w-7 h-7 text-black bg-black rounded-full p-1" />
                  <p className="menu-link">+212 662 500 181</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="menu-preview">
          <p>view showreel</p>
        </div>
      </div>
    </div>
  );
}
