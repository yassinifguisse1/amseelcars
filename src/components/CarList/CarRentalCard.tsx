"use client"

import { useMemo, type MouseEvent } from "react"
import NextLink from "next/link"
import { useSearchParams } from "next/navigation"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { CometCard } from "@/components/ui/comet-card"
import { Button } from "@/components/ui/button"
import { Car, Users, Fuel, Settings } from "lucide-react"
import Image from "next/image"
import { trackEvent } from "@/lib/trackEvent"
import { carBrandScopedHref } from "@/lib/carPublicHref"
import { bookingQueryForLinks } from "@/lib/bookingSearchParams"
import { formatCarPriceLabel, type DisplayCurrency } from "@/lib/currency"
import {
  formatBlackFridayPriceLabel,
  getBlackFridayDailyPrice,
  isBlackFridayPromoLive,
} from "@/lib/blackFridayPromo"
import bfStyles from "@/components/promo/black-friday.module.css"

interface CarRentalCardProps {
  carName: string
  carImage: string
  pricePerDay: number
  pricing?: {
    shortTerm: number
    longTerm: number
    hasDiscount: boolean
  }
  /** When set (>0), show period total instead of daily rate. */
  rentalDays?: number
  seats: number
  fuelType: string
  transmission: string
  /** Optional; omitted so we do not show invented per-car scores. */
  rating?: number
  slug?: string // Optional slug for routing
  /** With `slug`, builds brand-scoped car URL (`/cars/brand/...`) for SEO */
  brand?: string
  href?: string // Optional custom href
  currency?: DisplayCurrency // Currency for price display
  onBook: () => void
  onWhatsapp: () => void
  /** Prefer LCP on dense grids (e.g. first row on /cars). */
  imagePriority?: boolean
  /** Descriptive alt for Google Images; prefer gallery primary `alt` from car data. */
  imageAlt?: string
  /** Tooltip (`title` on img); often a short excerpt, not identical to alt. */
  imageTitle?: string
  /** Optional visible caption under the photo (e.g. trimmed description). */
  imageCaption?: string
}

export function CarRentalCard({
  carName,
  carImage,
  pricePerDay,
  pricing,
  rentalDays,
  seats,
  fuelType,
  transmission,
  rating,
  slug,
  brand,
  href,
  currency = "EUR",
  onBook,
  onWhatsapp,
  imagePriority = false,
  imageAlt,
  imageTitle,
  imageCaption,
}: CarRentalCardProps) {
  const t = useTranslations("carsPage.card")
  const tBf = useTranslations("blackFriday")
  const searchParams = useSearchParams()
  const detailQuery = useMemo(
    () => bookingQueryForLinks(searchParams, { currency }),
    [searchParams, currency],
  )
  const resolvedAlt = imageAlt?.trim() || t("altFallback", { carName })
  const resolvedTitle = (imageTitle?.trim() || resolvedAlt).slice(0, 200)
  const dailyRate = pricing?.shortTerm ?? pricePerDay
  const showPeriod = typeof rentalDays === "number" && rentalDays > 0
  const displayPrice = showPeriod ? dailyRate * rentalDays : dailyRate
  const bfLive = isBlackFridayPromoLive()
  const bfDaily = getBlackFridayDailyPrice(slug, currency)
  const hasBfPrice = bfDaily != null
  const bfLabel = formatBlackFridayPriceLabel(slug, currency)
  const cardPriceLabel =
    hasBfPrice && bfDaily != null
      ? showPeriod
        ? formatCarPriceLabel(bfDaily * (rentalDays as number), currency)
        : (bfLabel ?? formatCarPriceLabel(bfDaily, currency))
      : formatCarPriceLabel(displayPrice, currency)

  const trackBook = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    trackEvent({
      event: "reserver",
      path: typeof window !== "undefined" ? window.location.pathname : "/cars",
      source: "car-card",
      carSlug: slug,
      carName,
    })
    onBook()
  }

  const trackWa = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onWhatsapp()
  }

  const imageBlock = (
    <>
      <Image
        src={carImage || "/placeholder.svg"}
        alt={resolvedAlt}
        title={resolvedTitle}
        fill
        priority={imagePriority}
        fetchPriority={imagePriority ? "high" : "auto"}
        loading={imagePriority ? "eager" : "lazy"}
        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        sizes="(max-width: 480px) 260px, (max-width: 768px) 300px, (max-width: 1024px) 340px, 380px"
      />
      {typeof rating === "number" && rating > 0 ? (
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-[2] flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
          <span>⭐</span>
          <span>{rating}</span>
        </div>
      ) : null}
    </>
  )

  const priceBlock = (
    <div className="text-right flex-shrink-0">
      <div
        className={
          bfLive ? bfStyles.fleetCardPriceRow : "flex items-center justify-end gap-1.5"
        }
      >
        <p
          className={
            bfLive
              ? bfStyles.fleetCardPrice
              : "text-lg sm:text-xl font-bold text-primary"
          }
        >
          {cardPriceLabel}
          {showPeriod ? (
            <span className="ml-1.5 text-sm font-semibold opacity-70 sm:text-base">
              {t("periodDays", { days: rentalDays })}
            </span>
          ) : null}
        </p>
        {hasBfPrice ? (
          <p
            className={
              bfLive
                ? bfStyles.fleetCardOldPrice
                : `text-lg sm:text-xl ${bfStyles.oldPriceStruck}`
            }
          >
            {formatCarPriceLabel(displayPrice, currency)}
          </p>
        ) : null}
      </div>
      {showPeriod ? (
        <p
          className={
            bfLive
              ? "mt-0.5 text-[0.65rem] leading-tight text-[rgba(247,244,238,0.55)] sm:text-xs"
              : "text-[0.65rem] leading-tight text-muted-foreground sm:text-xs"
          }
        >
          {t("periodDaily", {
            daily:
              hasBfPrice && bfDaily != null
                ? formatCarPriceLabel(bfDaily, currency)
                : formatCarPriceLabel(dailyRate, currency),
          })}
        </p>
      ) : null}
    </div>
  )

  const cardContent = bfLive ? (
    <div
      className={`${bfStyles.fleetCard}${hasBfPrice ? ` ${bfStyles.fleetCardHot}` : ""}`}
    >
      <div className={bfStyles.fleetCardMedia}>
        {imageBlock}
        <div className={bfStyles.fleetCardMediaFade} aria-hidden />
        <span className={bfStyles.fleetCardDeal}>
          <span className={bfStyles.fleetCardDealDot} aria-hidden />
          {tBf("photoBadge")}
        </span>
      </div>

      {imageCaption ? (
        <p className={bfStyles.fleetCardCaption}>{imageCaption}</p>
      ) : null}

      <div className={bfStyles.fleetCardBody}>
        <div className={bfStyles.fleetCardHead}>
          <h3 className={bfStyles.fleetCardTitle}>{carName}</h3>
          {priceBlock}
        </div>

        <div className={bfStyles.fleetCardSpecs}>
          <div className={bfStyles.fleetCardSpec}>
            <Users className={bfStyles.fleetCardSpecIcon} aria-hidden />
            <span className="truncate">{t("seats", { count: seats })}</span>
          </div>
          <div className={bfStyles.fleetCardSpec}>
            <Fuel className={bfStyles.fleetCardSpecIcon} aria-hidden />
            <span className="truncate">{fuelType}</span>
          </div>
          <div className={bfStyles.fleetCardSpec}>
            <Settings className={bfStyles.fleetCardSpecIcon} aria-hidden />
            <span className="truncate">{transmission}</span>
          </div>
          <div className={bfStyles.fleetCardSpec}>
            <Car className={bfStyles.fleetCardSpecIcon} aria-hidden />
            <span className="truncate">{t("premium")}</span>
          </div>
        </div>
      </div>

      <button type="button" onClick={trackBook} className={bfStyles.fleetCardBook}>
        {t("bookNow")}
      </button>
      <button type="button" onClick={trackWa} className={bfStyles.fleetCardWa}>
        {t("whatsapp")}
      </button>
    </div>
  ) : (
    <div className="flex cursor-pointer flex-col items-stretch rounded-xl sm:rounded-2xl border bg-card p-3 sm:p-4 shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg sm:rounded-xl">
        {imageBlock}
      </div>
      {imageCaption ? (
        <p className="mt-2 line-clamp-2 text-xs leading-snug text-muted-foreground px-0.5">
          {imageCaption}
        </p>
      ) : null}

      <div className="mt-3 sm:mt-4 flex-1 space-y-2 sm:space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-foreground leading-tight">
            {carName}
          </h3>
          {priceBlock}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">{t("seats", { count: seats })}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Fuel className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">{fuelType}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Settings className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">{transmission}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Car className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">{t("premium")}</span>
          </div>
        </div>
      </div>

      <Button
        onClick={trackBook}
        className="mt-3 sm:mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm sm:text-base"
        size="default"
      >
        {t("bookNow")}
      </Button>
      <Button
        onClick={trackWa}
        className="mt-3 sm:mt-4 w-full bg-green-600 text-white hover:bg-green-700 text-sm sm:text-base"
        size="default"
      >
        {t("whatsapp")}
      </Button>
    </div>
  )

  if (href) {
    return (
      <CometCard className="w-full max-w-full sm:max-w-[320px] md:max-w-[350px] lg:max-w-[380px]">
        <NextLink href={href} className="block">
          {cardContent}
        </NextLink>
      </CometCard>
    )
  }

  if (slug) {
    const detailHref =
      brand != null && brand.length > 0
        ? {
            ...carBrandScopedHref(brand, slug),
            query: detailQuery,
          }
        : {
            pathname: "/cars/[slug]" as const,
            params: { slug },
            query: detailQuery,
          }
    return (
      <CometCard className="w-full max-w-full sm:max-w-[320px] md:max-w-[350px] lg:max-w-[380px]">
        <Link
          href={detailHref}
          className="block"
          onClick={() => {
            trackEvent({
              event: "car-card-click",
              path:
                typeof window !== "undefined" ? window.location.pathname : "/cars",
              source: "car-card",
              carSlug: slug,
              carName,
            })
          }}
        >
          {cardContent}
        </Link>
      </CometCard>
    )
  }

  return (
    <CometCard className="w-full max-w-full sm:max-w-[320px] md:max-w-[350px] lg:max-w-[380px]">
      {cardContent}
    </CometCard>
  )
}
