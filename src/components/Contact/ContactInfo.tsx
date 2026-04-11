"use client";

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Car,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";

gsap.registerPlugin(ScrollTrigger);

const mapContainerStyle = { width: "100%", height: "400px" };
const center = { lat: 30.4007408, lng: -9.577593 };
const mapOptions = {
  mapTypeId: "terrain" as const,
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
  fullscreenControl: true,
  mapTypeControl: true,
  mapTypeControlOptions: { style: 1 as const, position: 3 as const },
};

interface ContactDetail {
  icon: React.ReactNode;
  title: string;
  info: string[];
  link?: string;
}

interface SocialLink {
  icon: React.ReactNode;
  name: string;
  url: string;
  color: string;
}

export default function ContactInfo() {
  const t = useTranslations("contactPage.info");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [showInfoWindow, setShowInfoWindow] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const socialRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const addCardRef = (el: HTMLDivElement | null) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  const onMapLoad = useCallback(() => {
    setMapLoaded(true);
    setMapError(false);
  }, []);

  const onMapError = useCallback(() => {
    setMapError(true);
    setMapLoaded(false);
  }, []);

  const contactDetails: ContactDetail[] = useMemo(
    () => [
      {
        icon: <Phone className="h-6 w-6" strokeWidth={1.5} />,
        title: t("cardWhatsapp"),
        info: [t("phoneValue")],
        link: "https://wa.me/212662500181",
      },
      {
        icon: <Mail className="h-6 w-6" strokeWidth={1.5} />,
        title: t("cardEmail"),
        info: [t("emailValue")],
        link: `mailto:${t("emailValue")}`,
      },
      {
        icon: <MapPin className="h-6 w-6" strokeWidth={1.5} />,
        title: t("cardAddress"),
        info: [t("addressValue")],
        link: "https://www.google.com/maps/place/Amseel+cars/@30.4007453,-9.5824693,17z/data=!3m1!4b1!4m6!3m5!1s0xdb3b76e940846e9:0x4fa73710c2ac5d92!8m2!3d30.4007408!4d-9.577593!16s%2Fg%2F11w7lk46s0?entry=ttu&g_ep=EgoyMDI1MDkwOS4wIKXMDSoASAFQAw%3D%3D",
      },
    ],
    [t],
  );

  const socialLinks: SocialLink[] = useMemo(
    () => [
      {
        icon: <Facebook className="h-5 w-5" />,
        name: "Facebook",
        url: "https://www.facebook.com/amseelcars/",
        color: "#1877f2",
      },
      {
        icon: <Instagram className="h-5 w-5" />,
        name: "Instagram",
        url: "https://www.instagram.com/amseelcars/",
        color: "#e4405f",
      },
    ],
    [],
  );

  const stats = useMemo(
    () => [
      {
        icon: <Car className="h-8 w-8" strokeWidth={1.25} />,
        value: "30+",
        label: t("statLuxury"),
      },
      {
        icon: <Users className="h-8 w-8" strokeWidth={1.25} />,
        value: "1000+",
        label: t("statClients"),
      },
      {
        icon: <Star className="h-8 w-8" strokeWidth={1.25} />,
        value: "4.9",
        label: t("statRating"),
      },
      {
        icon: <Shield className="h-8 w-8" strokeWidth={1.25} />,
        value: "24/7",
        label: t("statSupport"),
      },
    ],
    [t],
  );

  useEffect(() => {
    const container = containerRef.current;
    const cards = cardsRef.current;
    const social = socialRef.current;
    const statsContainer = statsRef.current;
    if (!container || !cards.length) return;

    gsap.set(cards, { opacity: 0, x: 40, scale: 0.96 });
    if (social) gsap.set(social.children, { opacity: 0, y: 24, scale: 0.94 });
    if (statsContainer)
      gsap.set(statsContainer.children, { opacity: 0, y: 32, scale: 0.95 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top 82%",
        end: "bottom 12%",
        toggleActions: "play none none reverse",
      },
    });

    tl.to(cards, {
      opacity: 1,
      x: 0,
      scale: 1,
      duration: 0.75,
      stagger: 0.12,
      ease: "power3.out",
    });

    if (social) {
      tl.to(
        social.children,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          stagger: 0.08,
          ease: "back.out(1.4)",
        },
        "-=0.35",
      );
    }

    if (statsContainer) {
      tl.to(
        statsContainer.children,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.65,
          stagger: 0.08,
          ease: "power3.out",
        },
        "-=0.28",
      );
    }

    cards.forEach((card) => {
      const enter = () => {
        gsap.to(card, { scale: 1.02, y: -4, duration: 0.28, ease: "power2.out" });
      };
      const leave = () => {
        gsap.to(card, { scale: 1, y: 0, duration: 0.28, ease: "power2.out" });
      };
      card.addEventListener("mouseenter", enter);
      card.addEventListener("mouseleave", leave);
    });

    return () => {
      ScrollTrigger.getAll().forEach((tr) => tr.kill());
    };
  }, []);

  const cardClass =
    "group cursor-pointer rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] transition-colors hover:border-[#EC1C25]/25";

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-xl space-y-10">
      <div className="space-y-6">
        <div className="mb-2 text-center lg:text-left">
          <p className="font-[family-name:var(--font-heading)] mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-[#EC1C25]/80">
            Amseel Cars
          </p>
          <h2 className="font-[family-name:var(--font-heading)] mb-3 text-3xl font-bold text-white md:text-4xl">
            {t("sectionTitle")}
          </h2>
          <p className="text-lg leading-relaxed text-neutral-400">
            {t("sectionLead")}
          </p>
        </div>

        <div className="grid gap-4">
          {contactDetails.map((detail, index) => (
            <div
              key={index}
              ref={addCardRef}
              className={cardClass}
              onClick={() => detail.link && window.open(detail.link, "_blank")}
              role={detail.link ? "button" : "article"}
              tabIndex={detail.link ? 0 : -1}
              onKeyDown={(e) => {
                if (detail.link && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  window.open(detail.link, "_blank");
                }
              }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 rounded-xl border border-[#EC1C25]/20 bg-[#EC1C25]/10 p-3 transition-colors group-hover:border-[#EC1C25]/35 group-hover:bg-[#EC1C25]/15">
                  <div className="text-[#EC1C25]">{detail.icon}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-2 text-xl font-semibold text-white transition-colors group-hover:text-[#ffb4b8]">
                    {detail.title}
                  </h3>
                  <div className="space-y-1">
                    {detail.info.map((info, infoIndex) => (
                      <p
                        key={infoIndex}
                        className="text-neutral-300 transition-colors group-hover:text-neutral-200"
                      >
                        {info}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-5 text-center font-[family-name:var(--font-heading)] text-xl font-bold text-white lg:text-left">
          {t("followTitle")}
        </h3>
        <div ref={socialRef} className="flex justify-center gap-4 lg:justify-start">
          {socialLinks.map((social, index) => (
            <a
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-white/20"
              aria-label={t("socialFollowAria", { name: social.name })}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  scale: 1.06,
                  backgroundColor: `${social.color}22`,
                  duration: 0.25,
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  scale: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  duration: 0.25,
                });
              }}
            >
              <span className="text-neutral-400 transition-colors hover:text-white">
                {social.icon}
              </span>
            </a>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-[#EC1C25]/15 bg-gradient-to-br from-[#EC1C25]/10 to-transparent p-8 backdrop-blur-sm">
        <h3 className="mb-8 text-center font-[family-name:var(--font-heading)] text-2xl font-bold text-white">
          {t("whyTitle")}
        </h3>
        <div
          ref={statsRef}
          className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-4"
        >
          {stats.map((stat, index) => (
            <div key={index} className="group text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#EC1C25]/20 bg-[#EC1C25]/10 transition-colors group-hover:border-[#EC1C25]/35">
                <span className="text-[#EC1C25]">{stat.icon}</span>
              </div>
              <div className="mb-1 text-2xl font-bold text-white md:text-3xl">
                {stat.value}
              </div>
              <div className="text-xs font-medium uppercase tracking-wide text-neutral-400 md:text-sm md:normal-case md:tracking-normal">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-md">
        <h3 className="mb-4 font-[family-name:var(--font-heading)] text-xl font-bold text-white">
          {t("mapTitle")}
        </h3>
        <div className="relative">
          {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
            <div className="flex aspect-video items-center justify-center rounded-2xl border border-white/10 bg-neutral-900/80">
              <div className="px-4 text-center">
                <MapPin className="mx-auto mb-3 h-12 w-12 text-neutral-500" />
                <p className="text-neutral-400">{t("mapNoKey")}</p>
                <p className="mt-2 text-sm text-neutral-500">{t("mapNoKeyHint")}</p>
                <p className="mt-3 text-sm text-neutral-400">{t("mapFallbackAddress")}</p>
              </div>
            </div>
          ) : mapError ? (
            <div className="flex aspect-video flex-col items-center justify-center rounded-2xl border border-white/10 bg-neutral-900/80">
              <MapPin className="mb-3 h-12 w-12 text-neutral-500" />
              <p className="text-neutral-400">{t("mapError")}</p>
              <p className="mt-2 text-sm text-neutral-500">{t("mapFallbackAddress")}</p>
              <button
                type="button"
                onClick={() => {
                  setMapError(false);
                  setMapLoaded(false);
                }}
                className="mt-4 rounded-xl bg-[#EC1C25] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c41520]"
              >
                {t("mapRetry")}
              </button>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl border border-white/10">
              {!mapLoaded && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-900/90">
                  <div className="text-center">
                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#EC1C25]/30 border-t-[#EC1C25]" />
                    <p className="text-sm text-neutral-400">{t("mapLoading")}</p>
                  </div>
                </div>
              )}
              <LoadScript
                googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
                onLoad={onMapLoad}
                onError={onMapError}
                loadingElement={
                  <div className="flex aspect-video items-center justify-center bg-neutral-900">
                    <div className="text-center">
                      <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#EC1C25]/30 border-t-[#EC1C25]" />
                      <p className="text-sm text-neutral-400">{t("mapLoadGoogle")}</p>
                    </div>
                  </div>
                }
              >
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={15}
                  options={mapOptions}
                  onLoad={onMapLoad}
                >
                  <Marker position={center} onClick={() => setShowInfoWindow(true)} />
                  {showInfoWindow && (
                    <InfoWindow
                      position={center}
                      onCloseClick={() => setShowInfoWindow(false)}
                    >
                      <div className="p-1">
                        <h4 className="mb-1 font-bold text-neutral-900">
                          {t("mapInfoBusiness")}
                        </h4>
                        <p className="text-sm text-neutral-700">{t("mapInfoLine1")}</p>
                        <p className="mb-2 text-sm text-neutral-700">{t("mapInfoLine2")}</p>
                        <a
                          href="https://www.google.com/maps/place/Amseel+cars/@30.4007453,-9.5824693,17z/data=!3m1!4b1!4m6!3m5!1s0xdb3b76e940846e9:0x4fa73710c2ac5d92!8m2!3d30.4007408!4d-9.577593!16s%2Fg%2F11w7lk46s0?entry=ttu&g_ep=EgoyMDI1MDkwOS4wIKXMDSoASAFQAw%3D%3D"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-[#EC1C25] hover:underline"
                        >
                          {t("mapOpenInMaps")}
                        </a>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </LoadScript>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
