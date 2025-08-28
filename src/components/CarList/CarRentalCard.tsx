"use client" // Added semicolon after "use client" directive

import { CometCard } from "@/components/ui/comet-card"
import { Button } from "@/components/ui/button"
import { Car, Users, Fuel, Settings } from "lucide-react"

interface CarRentalCardProps {
  carName: string
  carImage: string
  pricePerDay: number
  seats: number
  fuelType: string
  transmission: string
  rating: number
  onBook: () => void
}

export function CarRentalCard({
  carName,
  carImage,
  pricePerDay,
  seats,
  fuelType,
  transmission,
  rating,
  onBook,
}: CarRentalCardProps) {
  return (
    <CometCard className="w-80">
      <div className="flex cursor-pointer flex-col items-stretch rounded-2xl border bg-card p-4 shadow-lg transition-all duration-300 hover:shadow-xl">
        {/* Car Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
          <img
            src={carImage || "/placeholder.svg"}
            alt={carName}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
            <span>⭐</span>
            <span>{rating}</span>
          </div>
        </div>

        {/* Car Information */}
        <div className="mt-4 flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">{carName}</h3>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">${pricePerDay}</p>
              <p className="text-xs text-muted-foreground">per day</p>
            </div>
          </div>

          {/* Car Features */}
          <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{seats} seats</span>
            </div>
            <div className="flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              <span>{fuelType}</span>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>{transmission}</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              <span>Premium</span>
            </div>
          </div>
        </div>

        {/* Book Button */}
        <Button
          onClick={onBook}
          className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90"
          size="lg"
        >
          Book Now
        </Button>
      </div>
    </CometCard>
  )
}
