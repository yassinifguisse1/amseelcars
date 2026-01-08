"use client";

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Star, MapPin, Calendar, Users, Fuel, Settings, Shield, Phone, Tag } from 'lucide-react'
import BookingDialog from '@/components/BookingDialog/BookingDialog'

// Currency conversion rates (same as CarGridSection)
const EUR_TO_MAD_RATE = 11
const USD_TO_MAD_RATE = 10

interface CarDetailClientProps {
  car: {
    carName: string
    carImage: string
    description: string
    brand: string
    model: string
    category: string
    rating: number
    location: string
    pricePerDay: number
    pricing?: {
      shortTerm: number
      longTerm: number
      hasDiscount: boolean
    }
    seats: number
    fuelType: string
    transmission: string
    year: number
    images: Array<{
      src: string
      alt: string
    }>
    features: Array<{
      icon: string
      name: string
      value: string
    }>
    specs: {
      engine: string
      horsepower: string
      acceleration: string
      topSpeed: string
      fuelEfficiency: string
      drivetrain: string
    }
    richContent?: {
      h1Title?: string
      sections: Array<{
        h2?: string
        h3?: string
        paragraphs: string[]
      }>
      faqs?: Array<{
        question: string
        answer: string
      }>
    }
  }
}

export default function CarDetailClient({ car }: CarDetailClientProps) {
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [currency, setCurrency] = useState<'MAD' | 'EUR' | 'USD'>('MAD')
  const router = useRouter()

  // Load currency from localStorage or URL param
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check URL parameter first
      const urlParams = new URLSearchParams(window.location.search)
      const urlCurrency = urlParams.get('currency') as 'MAD' | 'EUR' | 'USD' | null
      
      if (urlCurrency && (urlCurrency === 'MAD' || urlCurrency === 'EUR' || urlCurrency === 'USD')) {
        setCurrency(urlCurrency)
        localStorage.setItem('carRentalCurrency', urlCurrency)
      } else {
        // Fallback to localStorage
        const savedCurrency = localStorage.getItem('carRentalCurrency') as 'MAD' | 'EUR' | 'USD' | null
        if (savedCurrency && (savedCurrency === 'MAD' || savedCurrency === 'EUR' || savedCurrency === 'USD')) {
          setCurrency(savedCurrency)
        }
      }
    }
  }, [])

  // Convert price based on currency
  const convertPrice = (priceInMAD: number, targetCurrency: 'MAD' | 'EUR' | 'USD'): number => {
    if (targetCurrency === 'EUR') {
      return Math.round((priceInMAD / EUR_TO_MAD_RATE) * 100) / 100
    }
    if (targetCurrency === 'USD') {
      return Math.round((priceInMAD / USD_TO_MAD_RATE) * 100) / 100
    }
    return priceInMAD
  }

  // Format price with appropriate decimals
  const formatPrice = (price: number, curr: 'MAD' | 'EUR' | 'USD'): string => {
    return price.toFixed(curr === 'MAD' ? 0 : 2)
  }

  const handleBackToCars = () => {
    // Check if we're already on the cars page
    if (window.location.pathname === '/cars') {
      // If already on cars page, just scroll to the section
      const carsSection = document.getElementById('cars')
      if (carsSection) {
        carsSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      }
    } else {
      // Navigate to cars page with hash
      router.push('/cars#cars')
      
      // Also handle the scroll with multiple attempts for better reliability
      const scrollToCarsSection = () => {
        const carsSection = document.getElementById('cars')
        if (carsSection) {
          carsSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          })
          return true
        }
        return false
      }

      // Try scrolling with increasing delays
      const delays = [100, 300, 500, 1000]
      delays.forEach(delay => {
        setTimeout(() => {
          if (!scrollToCarsSection()) {
            // If element not found, try again
            console.log(`Attempting to scroll to cars section after ${delay}ms`)
          }
        }, delay)
      })
    }
  }

  return (
    <div className="min-h-screen bg-background  pt-20">
      {/* Breadcrumb Navigation */}
      <nav className="bg-muted/30 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              Accueil
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/cars" className="text-muted-foreground hover:text-foreground">
              Voitures
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">{car.carName}</span>
          </div>
        </div>
      </nav>

      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <button 
          onClick={handleBackToCars}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors border-2 border-border rounded-lg p-2 hover:bg-muted/50"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux voitures
        </button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Primary Image */}
            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted">
              <Image
                src={car.images[selectedImageIndex]?.src || car.carImage}
                alt={car.images[selectedImageIndex]?.alt || car.carName}
                width={600}
                height={450}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            
            {/* Thumbnail Gallery */}
            {car.images.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {car.images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`aspect-[4/3] overflow-hidden rounded-lg bg-muted cursor-pointer transition-all duration-300 ${
                      selectedImageIndex === index 
                        ? 'ring-2 ring-primary ring-offset-2' 
                        : 'hover:scale-105'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={200}
                      height={150}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Car Details */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium uppercase">
                  {car.category}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{car.rating}</span>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {car.carName}
              </h1>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{car.location}</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-muted/30 rounded-lg p-6">
              {car.pricing?.hasDiscount ? (
                <div>
                  {/* Short-term pricing */}
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-bold text-foreground">
                      {formatPrice(convertPrice(car.pricing.shortTerm, currency), currency)} {currency} /
                    </span>
                    <span className="text-muted-foreground">(1-4 jours)</span>
                    <Tag className="h-4 w-4 text-primary" />
                  </div>
                  
                  {/* Long-term pricing with discount */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                   
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-green-700">
                        {formatPrice(convertPrice(car.pricing.longTerm, currency), currency)} {currency} /
                      </span>
                      <span className="text-green-600"> (5+ jours)</span>
                    </div>
                   
                  </div>
                </div>
              ) : (
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-foreground">
                    {formatPrice(convertPrice(car.pricePerDay, currency), currency)} {currency} 
                  </span>
                  <span className="text-muted-foreground">/</span>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Meilleur prix garanti • Annulation gratuite
              </p>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{car.seats} Sièges</p>
                  <p className="text-sm text-muted-foreground">Capacité</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <Fuel className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{car.fuelType}</p>
                  <p className="text-sm text-muted-foreground">Type de carburant</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <Settings className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{car.transmission}</p>
                  <p className="text-sm text-muted-foreground">Transmission</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{car.year}</p>
                  <p className="text-sm text-muted-foreground">Année du modèle</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center  gap-2">
              <Button 
                size="lg" 
                className=" bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                onClick={() => setIsBookingDialogOpen(true)}
              >
                Réserver maintenant - {formatPrice(convertPrice(car.pricePerDay, currency), currency)} {currency}/jour
              </Button>
              <Button 
                size="lg" 
                className="bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                onClick={() => {
                  const price = car.pricing?.shortTerm || car.pricePerDay
                  const priceInCurrency = convertPrice(price, currency)
                  const message = `Bonjour, je souhaite louer la ${car.carName} au tarif de ${formatPrice(priceInCurrency, currency)} ${currency}/jour. Pourriez-vous me confirmer les disponibilités et m'indiquer la procédure de réservation ? Merci.`;
                  const encodedMessage = encodeURIComponent(message);
                  const whatsappUrl = `https://wa.me/212662500181?text=${encodedMessage}`;
                  window.open(whatsappUrl, '_blank');
                }}
              >
                <Phone className="h-5 w-5 mr-2" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-12 space-y-8">
         

          {/* Features Grid */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Caractéristiques et aménagements</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {car.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <span className="text-2xl">{feature.icon}</span>
                  <div>
                    <p className="font-medium text-foreground">{feature.name}</p>
                    <p className="text-sm text-muted-foreground">{feature.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specifications */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Spécifications techniques</h2>
            <div className="bg-muted/30 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Moteur</span>
                    <span className="font-medium">{car.specs.engine}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Puissance</span>
                    <span className="font-medium">{car.specs.horsepower}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Accélération</span>
                    <span className="font-medium">{car.specs.acceleration}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Vitesse maximale</span>
                    <span className="font-medium">{car.specs.topSpeed}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Efficacité du carburant</span>
                    <span className="font-medium">{car.specs.fuelEfficiency}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Transmission</span>
                    <span className="font-medium">{car.specs.drivetrain}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Availability Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Disponible pour la location</p>
                <p className="text-sm text-green-700">
                  Cette voiture est actuellement disponible et prête pour votre prochaine aventure.
                </p>
              </div>
            </div>
          </div>
          {/* Rich Content Description */}
          <div className="space-y-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">
              {car.richContent?.h1Title || "À propos de cette voiture"}
            </h1>
            
            {car.richContent ? (
              <>
                {/* Render rich content sections */}
                {car.richContent.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="space-y-4">
                    {section.h2 && (
                      <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">{section.h2}</h2>
                    )}
                    {section.h3 && (
                      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">{section.h3}</h3>
                    )}
                    {section.paragraphs.map((paragraph, paraIndex) => (
                      <p key={paraIndex} className="text-muted-foreground leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ))}

                {/* Render FAQs */}
                {car.richContent.faqs && car.richContent.faqs.length > 0 && (
                  <div className="mt-12 space-y-6">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Questions fréquentes</h2>
                    <div className="space-y-6">
                      {car.richContent.faqs.map((faq, faqIndex) => (
                        <div key={faqIndex} className="bg-muted/30 rounded-lg p-6 space-y-2">
                          <h3 className="text-lg font-semibold text-foreground">{faq.question}</h3>
                          <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Fallback to simple description if richContent is not available */
              <p className="text-muted-foreground leading-relaxed">{car.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <BookingDialog
        isOpen={isBookingDialogOpen}
        onClose={() => setIsBookingDialogOpen(false)}
        carName={car.carName}
        carPrice={car.pricePerDay}
        // carImage={car.carImage}
      />
    </div>
  )
}
