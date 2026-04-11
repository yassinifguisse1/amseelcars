"use client"

import NextLink from "next/link"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { CometCard } from "@/components/ui/comet-card"
import { Button } from "@/components/ui/button"
import { Car, Users, Fuel, Settings } from "lucide-react"
import Image from "next/image"
import { getWhatsAppTrackBody } from "@/lib/trackWhatsApp"

interface CarRentalCardProps {
  carName: string
  carImage: string
  pricePerDay: number
  pricing?: {
    shortTerm: number
    longTerm: number
    hasDiscount: boolean
  }
  seats: number
  fuelType: string
  transmission: string
  rating: number
  slug?: string // Optional slug for routing
  href?: string // Optional custom href
  currency?: 'MAD' | 'EUR' | 'USD' // Currency for price display
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
  seats,
  fuelType,
  transmission,
  rating,
  slug,
  href,
  currency = 'MAD',
  onBook,
  onWhatsapp,
  imagePriority = false,
  imageAlt,
  imageTitle,
  imageCaption,
}: CarRentalCardProps) {
  const t = useTranslations("carsPage.card")
  const resolvedAlt =
    imageAlt?.trim() || t("altFallback", { carName })
  const resolvedTitle = (imageTitle?.trim() || resolvedAlt).slice(0, 200)

  const cardContent = (
    <div className="flex cursor-pointer flex-col items-stretch rounded-xl sm:rounded-2xl border bg-card p-3 sm:p-4 shadow-lg transition-all duration-300 hover:shadow-xl">
        {/* Car Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg sm:rounded-xl">
          <Image
            src={carImage || "/placeholder.svg"}
            alt={resolvedAlt}
            title={resolvedTitle}
            fill
            priority={imagePriority}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 480px) 260px, (max-width: 768px) 300px, (max-width: 1024px) 340px, 380px"
          />
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
            <span>⭐</span>
            <span>{rating}</span>
          </div>
        </div>
        {imageCaption ? (
          <p className="mt-2 line-clamp-2 text-xs leading-snug text-muted-foreground px-0.5">
            {imageCaption}
          </p>
        ) : null}

        {/* Car Information */}
        <div className="mt-3 sm:mt-4 flex-1 space-y-2 sm:space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-foreground leading-tight">{carName}</h3>
            <div className="text-right flex-shrink-0">
              {pricing?.hasDiscount ? (
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-lg sm:text-xl font-bold text-primary">{pricing.shortTerm.toFixed(currency === 'MAD' ? 0 : 2)} {currency} /</p>
                    {/* <Tag className="h-3 w-3 text-green-600" /> */}
                  <p className="text-xs text-muted-foreground">
                    {" "}
                    {t("daysShort")}
                  </p>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <p className="text-sm font-semibold text-green-600">{pricing.longTerm.toFixed(currency === 'MAD' ? 0 : 2)} {currency} </p>
                    <span className="text-xs bg-green-100 text-green-700 px-1 rounded">
                      {t("daysLong")}
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-primary">{pricePerDay.toFixed(currency === 'MAD' ? 0 : 2)} {currency} </p>
                  <p className="text-xs text-muted-foreground"></p>
                </div>
              )}
            </div>
          </div>

          {/* Car Features */}
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

        {/* Book Button */}
        <Button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            fetch('/api/track/whatsapp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(
                getWhatsAppTrackBody({
                  path: typeof window !== 'undefined' ? window.location.pathname : '/cars',
                  source: 'car-card',
                  carSlug: slug,
                  carName,
                  event: 'reserver',
                })
              ),
            }).catch(() => {})
            onBook()
          }}
          className="mt-3 sm:mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm sm:text-base"
          size="default"
        >
          {t("bookNow")}
        </Button>
        <Button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onWhatsapp()
          }}
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
    return (
      <CometCard className="w-full max-w-full sm:max-w-[320px] md:max-w-[350px] lg:max-w-[380px]">
        <Link
          href={{
            pathname: "/cars/[slug]",
            params: { slug },
            query: { currency },
          }}
          className="block"
        >
          {cardContent}
        </Link>
      </CometCard>
    )
  }

  return (
    <CometCard className="w-full max-w-full  sm:max-w-[320px] md:max-w-[350px] lg:max-w-[380px]">
      {cardContent}
    </CometCard>
  )
}
