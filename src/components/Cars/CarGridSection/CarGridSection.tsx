"use client"

import { useState, useMemo, useEffect } from 'react'
import { CarRentalCard } from '@/components/CarList/CarRentalCard'
import { getAllCars, Car } from '@/data/cars'
import BookingDialog from '@/components/BookingDialog/BookingDialog'
import FilterBar, { FilterState } from './FilterBar'
import styles from './CarGridSection.module.scss'

// Currency conversion rates
const EUR_TO_MAD_RATE = 10.7
const USD_TO_MAD_RATE = 10

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

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    brand: '',
    name: '',
    minPrice: '',
    maxPrice: '',
    currency: 'EUR'
  })

  const [currency, setCurrency] = useState<'MAD' | 'EUR' | 'USD'>('EUR')

  // Get all cars
  const allCars = getAllCars()

  // Get unique brands
  const brands = useMemo(() => {
    const uniqueBrands = Array.from(new Set(allCars.map(car => car.brand)))
    return uniqueBrands.sort()
  }, [allCars])

  // Convert price based on currency
  const convertPrice = (priceInMAD: number, targetCurrency: 'MAD' | 'EUR' | 'USD'): number => {
    if (targetCurrency === 'EUR') {
      // Round to nearest whole number for EUR (like USD)
      return Math.round(priceInMAD / EUR_TO_MAD_RATE)
    }
    if (targetCurrency === 'USD') {
      return Math.round((priceInMAD / USD_TO_MAD_RATE) * 100) / 100
    }
    return priceInMAD
  }

  // Filter cars based on filter state
  const filteredCars = useMemo(() => {
    return allCars.filter((car: Car) => {
      // Brand filter
      if (filters.brand && car.brand !== filters.brand) {
        return false
      }

      // Name filter (case-insensitive search)
      if (filters.name) {
        const searchTerm = filters.name.toLowerCase()
        const carName = car.carName.toLowerCase()
        if (!carName.includes(searchTerm)) {
          return false
        }
      }

      // Price filter
      const carPrice = car.pricing?.shortTerm || car.pricePerDay
      const priceInSelectedCurrency = convertPrice(carPrice, currency)

      if (filters.minPrice) {
        const minPrice = parseFloat(filters.minPrice)
        if (priceInSelectedCurrency < minPrice) {
          return false
        }
      }

      if (filters.maxPrice) {
        const maxPrice = parseFloat(filters.maxPrice)
        if (priceInSelectedCurrency > maxPrice) {
          return false
        }
      }

      return true
    })
  }, [allCars, filters, currency])

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
      const price = car.pricing?.shortTerm || car.pricePerDay
      const priceInCurrency = convertPrice(price, currency)
      const message = `Bonjour, je souhaite louer la ${car.carName} au tarif de ${priceInCurrency.toFixed(currency === 'MAD' ? 0 : 2)} ${currency}/jour. Pourriez-vous me confirmer les disponibilités et m'indiquer la procédure de réservation ? Merci.`
      const encodedMessage = encodeURIComponent(message)
      const whatsappNumber = '212662500181'
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
      window.open(whatsappUrl, '_blank')
    }
  }

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const handleCurrencyChange = (newCurrency: 'MAD' | 'EUR' | 'USD') => {
    setCurrency(newCurrency)
    setFilters({ ...filters, currency: newCurrency })
    // Store currency preference in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('carRentalCurrency', newCurrency)
    }
  }

  // Load currency from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCurrency = localStorage.getItem('carRentalCurrency') as 'MAD' | 'EUR' | 'USD' | null
      if (savedCurrency && (savedCurrency === 'MAD' || savedCurrency === 'EUR' || savedCurrency === 'USD')) {
        setCurrency(savedCurrency)
        setFilters(prev => ({ ...prev, currency: savedCurrency }))
      }
    }
  }, [])

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

        {/* Filter Bar */}
        <FilterBar
          brands={brands}
          onFilterChange={handleFilterChange}
          currency={currency}
          onCurrencyChange={handleCurrencyChange}
        />

        {/* Results Count */}
        {filteredCars.length !== allCars.length && (
          <div className={styles.resultsCount}>
            {filteredCars.length} véhicule{filteredCars.length > 1 ? 's' : ''} trouvé{filteredCars.length > 1 ? 's' : ''}
          </div>
        )}

        {/* Car Grid */}
        {filteredCars.length > 0 ? (
          <div className={styles.carGrid}>
            {filteredCars.map((car) => {
              const pricePerDay = car.pricing?.shortTerm || car.pricePerDay
              const priceInCurrency = convertPrice(pricePerDay, currency)
              const longTermPrice = car.pricing?.longTerm 
                ? convertPrice(car.pricing.longTerm, currency)
                : undefined

              return (
                <article key={car.id} className={styles.carCard}>
                  <CarRentalCard
                    carName={car.carName}
                    carImage={car.carImage}
                    pricePerDay={priceInCurrency}
                    pricing={car.pricing ? {
                      shortTerm: priceInCurrency,
                      longTerm: longTermPrice || priceInCurrency,
                      hasDiscount: car.pricing.hasDiscount
                    } : undefined}
                    seats={car.seats}
                    fuelType={car.fuelType}
                    transmission={car.transmission}
                    rating={car.rating}
                    slug={car.slug}
                    currency={currency}
                    onBook={() => handleBookCar(car.carName)}
                    onWhatsapp={() => handleWhatsapp(car.carName)}
                  />
                </article>
              )
            })}
          </div>
        ) : (
          <div className={styles.noResults}>
            <p>Aucun véhicule ne correspond à vos critères de recherche.</p>
            <button 
              className={styles.resetButton}
              onClick={() => {
                setFilters({
                  brand: '',
                  name: '',
                  minPrice: '',
                  maxPrice: '',
                  currency: currency
                })
              }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
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
        />
      )}
    </section>
  )
}

export default CarGridSection
