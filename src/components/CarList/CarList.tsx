"use client"
import { CarRentalCard } from "./CarRentalCard"


export default function CarList() {
  const handleBookCar = () => {
    alert("Booking functionality would be implemented here!")
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-center text-3xl font-bold text-foreground">Premium Car Rentals</h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <CarRentalCard
            carName="BMW X5"
            carImage="/images/1.jpeg"
            pricePerDay={89}
            seats={5}
            fuelType="Petrol"
            transmission="Automatic"
            rating={4.8}
            onBook={handleBookCar}
          />

          <CarRentalCard
            carName="Mercedes C-Class"
            carImage="/images/1.jpeg"
            pricePerDay={75}
            seats={5}
            fuelType="Hybrid"
            transmission="Automatic"
            rating={4.9}
            onBook={handleBookCar}
          />

          <CarRentalCard
            carName="Audi A4"
            carImage="/images/1.jpeg"
            pricePerDay={65}
            seats={5}
            fuelType="Petrol"
            transmission="Manual"
            rating={4.7}
            onBook={handleBookCar}
          />
        </div>
      </div>
    </div>
  )
}
