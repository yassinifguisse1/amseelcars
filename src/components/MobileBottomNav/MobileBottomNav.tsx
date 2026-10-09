"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { CalendarDays, Car, Home, MessageCircle } from "lucide-react";
import { BUSINESS_WHATSAPP_URL } from "@/lib/business";
import { trackEvent } from "@/lib/trackEvent";
import { cn } from "@/lib/utils";

const BOOKING_HASH = "home-booking";

function pathIsHome(pathname: string) {
  return pathname === "/" || pathname === "";
}

function pathIsCars(pathname: string) {
  return pathname === "/cars" || pathname.startsWith("/cars/");
}

export function MobileBottomNav() {
  const t = useTranslations("bottomNav");
  const tFooter = useTranslations("footer");
  const pathname = usePathname();

  const goToBooking = useCallback(
    (e: React.MouseEvent) => {
      trackEvent({
        event: "scroll-reservation",
        path: typeof window !== "undefined" ? window.location.pathname : "/",
        source: "mobile-bottom-nav",
        ctaLabel: "dates",
      });

      if (pathIsHome(pathname)) {
        e.preventDefault();
        const el = document.getElementById(BOOKING_HASH);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
      }
      // Cross-page: let the Link navigate to `/#home-booking`
    },
    [pathname],
  );

  const onWhatsApp = () => {
    trackEvent({
      event: "whatsapp",
      path: typeof window !== "undefined" ? window.location.pathname : "/",
      source: "mobile-bottom-nav",
      ctaLabel: "whatsapp",
    });
  };

  const waHref = `${BUSINESS_WHATSAPP_URL}/?text=${encodeURIComponent(tFooter("whatsappPrefill"))}`;
  const homeActive = pathIsHome(pathname);
  const carsActive = pathIsCars(pathname);

  return (
    <nav
      className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 right-3 z-50 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-3xl border-2 border-[#b11226]/80 bg-white/55 text-[#b11226] shadow-[0_8px_28px_rgba(0,0,0,0.1)] backdrop-blur-xl backdrop-saturate-150 md:hidden"
      aria-label={t("ariaLabel")}
    >
      <ul className="mx-auto grid h-14 max-w-lg grid-cols-4 items-stretch px-1 [&_svg]:!fill-none [&_svg]:!stroke-[#b11226] [&_svg]:!text-[#b11226]">
        <li>
          <Link
            href="/"
            className={cn(
              "flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-[#b11226]",
              homeActive && "font-bold",
            )}
          >
            <Home className="h-5 w-5" strokeWidth={homeActive ? 2.5 : 2.25} aria-hidden />
            <span>{t("home")}</span>
          </Link>
        </li>
        <li>
          <Link
            href="/cars"
            className={cn(
              "flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-[#b11226]",
              carsActive && "font-bold",
            )}
          >
            <Car className="h-5 w-5" strokeWidth={carsActive ? 2.5 : 2.25} aria-hidden />
            <span>{t("cars")}</span>
          </Link>
        </li>
        <li>
          <Link
            href={{ pathname: "/", hash: BOOKING_HASH }}
            onClick={goToBooking}
            className="flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-[#b11226]"
          >
            <CalendarDays className="h-5 w-5" strokeWidth={2.25} aria-hidden />
            <span>{t("dates")}</span>
          </Link>
        </li>
        <li>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onWhatsApp}
            className="flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-[#b11226]"
          >
            <MessageCircle className="h-5 w-5" strokeWidth={2.25} aria-hidden />
            <span>{t("whatsapp")}</span>
          </a>
        </li>
      </ul>
    </nav>
  );
}
