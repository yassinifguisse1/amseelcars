"use client"

import { useState } from 'react'
import { CarRentalCard } from '@/components/CarList/CarRentalCard'
import { getAllCars } from '@/data/cars'
import BookingDialog from '@/components/BookingDialog/BookingDialog'
import styles from './CarGridSection.module.scss'

interface CarGridSectionProps {
  className?: string
  showTitle?: boolean
  title?: string
  subtitle?: string
}

const CarGridSection = ({ 
  className = '', 
  showTitle = true,
  title = "Notre flotte haut de gamme",
  subtitle = "Choisissez parmi notre vaste collection de véhicules de luxe"
 
}: CarGridSectionProps) => {
  // Booking dialog state
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [selectedCar, setSelectedCar] = useState<{
    name: string
    price: number
    image: string
  } | null>(null)

  // Get all cars
  const allCars = getAllCars()

  const handleBookCar = (carName: string) => {
    const car = allCars.find(c => c.carName === carName)
    if (car) {
      setSelectedCar({
        name: car.carName,
        price: car.pricePerDay,
        image: car.carImage
      })
      setIsBookingDialogOpen(true)
    }
  }

  const handleWhatsapp = (carName: string) => {
    const car = allCars.find(c => c.carName === carName)
    if (car) {
      const message = `Bonjour, je souhaite louer la ${car.carName} au tarif de ${car.pricePerDay} DH/jour. Pourriez-vous me confirmer les disponibilités et m'indiquer la procédure de réservation ? Merci.`
      const encodedMessage = encodeURIComponent(message)
      const whatsappNumber = '212662500181'
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
      window.open(whatsappUrl, '_blank')
    }
  }

  return (
    <section className={`${styles.carGridSection} ${className}`} id="cars">
      <div className={styles.container}>
        {/* Section Header */}
        {showTitle && (
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{title}</h2>
            {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
          </header>
        )}

        {/* Car Grid */}
        <div className={styles.carGrid}>
          {allCars.map((car) => (
            <article key={car.id} className={styles.carCard}>
              <CarRentalCard
                carName={car.carName}
                carImage={car.carImage}
                pricePerDay={car.pricePerDay}
                seats={car.seats}
                fuelType={car.fuelType}
                transmission={car.transmission}
                rating={car.rating}
                slug={car.slug}
                onBook={() => handleBookCar(car.carName)}
                onWhatsapp={() => handleWhatsapp(car.carName)}
              />
            </article>
          ))}
        </div>
      </div>

      {/* Booking Dialog */}
      {selectedCar && (
        <BookingDialog
          isOpen={isBookingDialogOpen}
          onClose={() => {
            setIsBookingDialogOpen(false)
            setSelectedCar(null)
          }}
          carName={selectedCar.name}
          carPrice={selectedCar.price}
          carImage={selectedCar.image}
        />
      )}
    </section>
  )
}

export default CarGridSection
