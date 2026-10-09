"use client";
import { useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

import { HomeHeroCopyBand, HomeFleetCtaButton } from "@/components/home/HomeHeroCopyBand";
import { HomeAirportFlightBand } from "@/components/home/HomeAirportFlightBand";
import { HomeBookingSearchBar } from "@/components/home/HomeBookingSearchBar";
import CarsGridLoadingFallback from "@/components/Cars/CarsGridLoadingFallback";

const CarGridSection = dynamic(
  () => import("@/components/Cars/CarGridSection"),
  { loading: () => <CarsGridLoadingFallback /> },
);

const MapExample = dynamic(() => import("@/components/CarDashboardMap/Example"), {
  loading: () => (
    <div className="min-h-[min(70vh,32rem)] w-full bg-[#f7f5f2]" aria-hidden />
  ),
  ssr: false,
});

const Brands = dynamic(() => import("@/components/Brands/Brands"), {
  loading: () => <div className="min-h-[40vh] bg-black" aria-hidden />,
});

const Reviews = dynamic(() => import("@/components/Reviews/Reviews"), {
  loading: () => <div className="min-h-[28vh] bg-[#f7f5f2]" aria-hidden />,
});

const SplitHeadline = dynamic(() => import("@/components/test/SplitHeadline"), {
  loading: () => <div className="min-h-[20vh]" aria-hidden />,
});

const Footer = dynamic(() => import("@/components/Footer/Footer"));

import {
  HomeSeoTrustBar,
  HomeSeoMainIntroBlock,
  HomeSeoAirportBlock,
  HomeSeoVehicleTypesBlock,
  HomeSeoLocalDiscoveryBlock,
  HomeSeoLocationNapBlock,
  HomeSeoBookingCtaBlock,
  HomeSeoFaqBlock,
} from "@/components/home-seo/home-seo";
import { HomeBrowseServicesSection } from "@/components/home-seo/HomeBrowseServicesSection";
import { reviews } from "@/data/reviews";

export function HomeContentLandingPage() {
  const t = useTranslations("home");

  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.overflow = "visible";
    document.body.style.height = "auto";
    document.body.style.transform = "none";
    document.documentElement.style.transform = "none";
    window.scrollTo(0, 0);

    return () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
      document.body.style.transform = "";
      document.documentElement.style.transform = "";
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return (
    <div className="page-content hero">
      <div className="relative">
        <HomeHeroCopyBand>
          <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-8" aria-hidden />}>
            <HomeBookingSearchBar className="bg-transparent px-2 pb-3 pt-1 sm:px-6 sm:pb-8 sm:pt-2" />
          </Suspense>
        </HomeHeroCopyBand>
        <div className="relative bg-white">
          <HomeFleetCtaButton />
        </div>
      </div>
      <Suspense fallback={<CarsGridLoadingFallback />}>
        <CarGridSection showTitle />
      </Suspense>
      <HomeSeoTrustBar />
      <HomeSeoMainIntroBlock />
      <HomeAirportFlightBand />
      <HomeSeoAirportBlock />
      <SplitHeadline />
      <Brands />
      <HomeSeoVehicleTypesBlock />
      <Reviews
        reviews={reviews}
        useApi={false}
        introParagraph={t("reviewsIntro")}
      />
      <HomeSeoLocalDiscoveryBlock />
      <HomeBrowseServicesSection />
      <MapExample />
      <HomeSeoLocationNapBlock />
      <HomeSeoBookingCtaBlock />
      <HomeSeoFaqBlock />
      <Footer />
    </div>
  );
}
