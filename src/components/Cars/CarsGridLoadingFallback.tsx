"use client"

import { useTranslations } from "next-intl"

export default function CarsGridLoadingFallback() {
  const t = useTranslations("carsPage")
  return (
    <div
      className="min-h-[min(60vh,28rem)] bg-neutral-950 flex items-center justify-center"
      role="status"
      aria-label={t("loadingAria")}
    >
      <span className="sr-only">{t("loadingSrOnly")}</span>
    </div>
  )
}
