"use client";

import React from "react";
import CarePage from "@/components/Cars/CarePage/CarePage";
import { LoadingProvider } from "@/contexts/LoadingContext";

/** Client tree for `/about` (currently implemented with the shared CarePage layout). */
export function AboutPageClient() {
  return (
    <LoadingProvider>
      <CarePage />
    </LoadingProvider>
  );
}
