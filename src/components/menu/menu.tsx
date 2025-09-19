"use client";

import Link from "next/link";
import React, { useRef, useState, useEffect } from "react";
import "./menu.css";
// import { usePathname, useRouter } from "next/navigation";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Magnetic from "@/common/Magnetic";
import { Facebook, Instagram, Mail, Phone } from "lucide-react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const menuLinks = [
  { path: "/", label: "Accueil" },
  { path: "/about", label: "À propos" },
  { path: "/cars", label: "Voitures" },
  { path: "/contact", label: "Contactez-nous" },
];

export default function Menu() {
  const container = useRef<HTMLDivElement>(null);
  // const overlayRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  // const pathname = usePathname();
  // const router = useRouter();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  useGSAP(
    () => {
      if (!container.current) return;

      gsap.set(".menu-link-item-holder", { y: 75 });
      gsap.set(".menu-overlay", {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        opacity: 0,
        pointerEvents: "none",
      });

      tl.current = gsap
        .timeline({ paused: true })
        .to(".menu-overlay", {
          duration: 0.1,
          opacity: 1,
          pointerEvents: "auto",
          ease: "none",
        })
        .to(
          ".menu-overlay",
          {
            duration: 0.9,
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            ease: "power4.inOut",
          },
          0.1
        )
        .to(
          ".menu-link-item-holder",
          {
            y: 0,
            duration: 1,
            stagger: 0.1,
            ease: "power4.out",
          },
          "-=0.75"
        );
    },
    { scope: container }
  );

  useEffect(() => {
    if (isOpen) {
      // document.body.style.overflow = "hidden"; // Prevent scrolling when menu is open
      tl.current?.play();
    } else {
      // document.body.style.overflow = "unset";
      tl.current?.reverse();
    }

    // Cleanup on unmount
    // return () => {
    //   document.body.style.overflow = "unset";
    // };
  }, [isOpen]);

  return (
    <div className="menu-container" ref={container} data-open={isOpen}>
      {/* Top bar (hidden while overlay is open via CSS) */}
      <div className="menu-bar bg-black">
        <div className="menu-logo">
          <Link href="/">AmseelCars</Link>
        </div>
        <div className="menu-open" onClick={toggleMenu}>
          <p>Menu</p>
        </div>

        {/* </button> */}
      </div>

      {/* Overlay */}
      <div className="menu-overlay" data-open={isOpen}>
        <div className="menu-overlay-bar">
          <div className="menu-logo">
            <Link href="/" onClick={closeMenu}>
              AmseelCars
            </Link>
          </div>
          <button className="menu-close" onClick={toggleMenu}>
            <p>Fermer</p>
          </button>
        </div>

        <button className="menu-close-icon" onClick={toggleMenu}>
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
                    onClick={closeMenu}
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
                <Link
                  href="https://www.facebook.com/amseelcars/"
                  target="_blank"
                  className="menu-link"
                >
                  <div className="flex items-center gap-2">
                    <Facebook className="w-7 h-7 text-black bg-black rounded-full p-1" />
                    <p>Facebook</p>
                  </div>
                </Link>
              </Magnetic>
              <Magnetic>
                <Link
                  href="https://www.instagram.com/amseelcars/"
                  target="_blank"
                  className="menu-link"
                >
                  <div className="flex items-center gap-2">
                    <Instagram className="w-7 h-7 text-black bg-black rounded-full p-1" />
                    <p>Instagram</p>
                  </div>
                </Link>
              </Magnetic>
              <Magnetic>
                <Link
                  href="https://wa.me/212662500181"
                  target="_blank"
                  className="menu-link"
                >
                  <div className="flex items-center gap-2">
                    <Phone className="w-7 h-7 text-black bg-black rounded-full p-1" />
                    <p>Whatsapp</p>
                  </div>
                </Link>
              </Magnetic>
            </div>

            <div className="menu-info-col flex gap-4">
              <Link
                href="mailto:amseelcars5@gmail.com"
                target="_blank"
                className="menu-link"
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-7 h-7 text-black bg-black rounded-full p-1" />
                  <p className="menu-link">amseelcars5@gmail.com</p>
                </div>
              </Link>

              <Link
                href="tel:+212662500181"
                target="_blank"
                className="menu-link"
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-7 h-7 text-black bg-black rounded-full p-1" />
                  <p className="menu-link">+212 662 500 181</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="menu-preview">
          <p>Voir le showreel</p>
        </div>
      </div>
    </div>
  );
}
