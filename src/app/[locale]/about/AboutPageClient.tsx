"use client";

import React from "react";
import CarePage from "@/components/Cars/CarePage/CarePage";
import { LogoFloatPreloader } from "@/components/Preloader/LogoFloatPreloader";

/** Client tree for `/about` (currently implemented with the shared CarePage layout). */
export function AboutPageClient() {
  return (
    <>
      <LogoFloatPreloader />
      <CarePage />
    </>
  );
}
