"use client"

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import type { AppLocale } from '@/i18n/routing'
import { carForLocale } from '@/lib/carLocale'
import { CarRentalCard } from '@/components/CarList/CarRentalCard'
import { carListingImageAlt, carListingImageTitle, carListingCaption } from '@/lib/carImageAlt'
import { getAllCars, Car } from '@/data/cars'
import BookingDialog from '@/components/BookingDialog/BookingDialog'
import FilterBar, { FilterState } from './FilterBar'
import { convertCarPrice, formatCarPrice } from '@/lib/currency'
import { getWhatsAppTrackBody } from '@/lib/trackWhatsApp'
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
  title,
  subtitle,
}: CarGridSectionProps) => {
  const t = useTranslations('carsPage')
  const localeUi = useLocale()
  const l: AppLocale = localeUi === 'en' ? 'en' : 'fr'
  const searchParams = useSearchParams()
  const displayTitle = title ?? t('gridTitle')
  const displaySubtitle = subtitle ?? t('gridSubtitle')

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

  useEffect(() => {
    const raw = searchParams.get('brand')
    if (!raw) return
    const brand = decodeURIComponent(raw)
    if (brands.includes(brand)) {
      setFilters((prev) => (prev.brand === brand ? prev : { ...prev, brand }))
    }
  }, [searchParams, brands])

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
      const priceInSelectedCurrency = convertCarPrice(carPrice, currency)

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
      const path =
        typeof window !== 'undefined' ? window.location.pathname : '/cars'
      fetch('/api/track/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          getWhatsAppTrackBody({
            path,
            source: 'car-listing',
            carSlug: car.slug,
            carName: car.carName,
            event: 'whatsapp',
          })
        ),
      }).catch(() => {})
      const price = car.pricing?.shortTerm || car.pricePerDay
      const priceInCurrency = convertCarPrice(price, currency)
      const priceStr = formatCarPrice(priceInCurrency, currency)
      const message = t('waInquiry', {
        carName: car.carName,
        price: priceStr,
        currency,
      })
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
            <h2 className={styles.sectionTitle}>{displayTitle}</h2>
            {displaySubtitle ? (
              <p className={styles.sectionSubtitle}>{displaySubtitle}</p>
            ) : null}
          </header>
        )}

        {/* Filter Bar */}
        <FilterBar
          brands={brands}
          filters={filters}
          onFilterChange={handleFilterChange}
          currency={currency}
          onCurrencyChange={handleCurrencyChange}
        />

        {/* Results Count */}
        {filteredCars.length !== allCars.length && (
          <div className={styles.resultsCount}>
            {t('resultsCount', { count: filteredCars.length })}
          </div>
        )}

        {/* Car Grid */}
        {filteredCars.length > 0 ? (
          <div className={styles.carGrid}>
            {filteredCars.map((car, index) => {
              const displayCar = carForLocale(car, l)
              const pricePerDay = car.pricing?.shortTerm || car.pricePerDay
              const priceInCurrency = convertCarPrice(pricePerDay, currency)
              const longTermPrice = car.pricing?.longTerm 
                ? convertCarPrice(car.pricing.longTerm, currency)
                : undefined

              return (
                <article key={car.slug || car.id} className={styles.carCard}>
                  <CarRentalCard
                    carName={car.carName}
                    carImage={car.carImage}
                    imageAlt={carListingImageAlt(displayCar, l)}
                    imageTitle={carListingImageTitle(displayCar, l)}
                    imageCaption={carListingCaption(displayCar, l)}
                    imagePriority={index < 3}
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
                    slug={displayCar.slug}
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
            <p>{t('noResults')}</p>
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
              {t('resetFilters')}
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
