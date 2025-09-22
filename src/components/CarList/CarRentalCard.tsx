"use client" // Added semicolon after "use client" directive

import Link from "next/link"
import { CometCard } from "@/components/ui/comet-card"
import { Button } from "@/components/ui/button"
import { Car, Users, Fuel, Settings } from "lucide-react"
import Image from "next/image"

interface CarRentalCardProps {
  carName: string
  carImage: string
  pricePerDay: number
  seats: number
  fuelType: string
  transmission: string
  rating: number
  slug?: string // Optional slug for routing
  href?: string // Optional custom href
  onBook: () => void
  onWhatsapp: () => void
}

export function CarRentalCard({
  carName,
  carImage,
  pricePerDay,
  seats,
  fuelType,
  transmission,
  rating,
  slug,
  href,
  onBook,
  onWhatsapp,
}: CarRentalCardProps) {
  const cardContent = (
    <div className="flex cursor-pointer flex-col items-stretch rounded-xl sm:rounded-2xl border bg-card p-3 sm:p-4 shadow-lg transition-all duration-300 hover:shadow-xl">
        {/* Car Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg sm:rounded-xl">
          <Image
            src={carImage || "/placeholder.svg"}
            alt={carName}
            fill
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 480px) 260px, (max-width: 768px) 300px, (max-width: 1024px) 340px, 380px"
          />
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
            <span>⭐</span>
            <span>{rating}</span>
          </div>
        </div>

        {/* Car Information */}
        <div className="mt-3 sm:mt-4 flex-1 space-y-2 sm:space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-foreground leading-tight">{carName}</h3>
            <div className="text-right flex-shrink-0">
              <p className="text-xl sm:text-2xl font-bold text-primary">DH {pricePerDay}</p>
              <p className="text-xs text-muted-foreground">per day</p>
            </div>
          </div>

          {/* Car Features */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">{seats} seats</span>
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
              <span className="truncate">Premium</span>
            </div>
          </div>
        </div>

        {/* Book Button */}
        <Button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onBook()
          }}
          className="mt-3 sm:mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm sm:text-base"
          size="default"
        >
          Book Now
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
          WhatsApp
        </Button>
      </div>
  )

  // Determine the link URL
  const linkUrl = href || (slug ? `/cars/${slug}` : null)

  if (linkUrl) {
    return (
      <CometCard className="w-full max-w-full sm:max-w-[320px] md:max-w-[350px] lg:max-w-[380px]">
        <Link href={linkUrl} className="block">
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
