"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Link, useRouter, usePathname } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import type { AppLocale } from '@/i18n/routing'
import { toAppLocale } from '@/i18n/locale-utils'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Fuel,
  Settings,
  Shield,
  Phone,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import BookingDialog from '@/components/BookingDialog/BookingDialog'
import { MenuStyleButton } from '@/components/Header/Button'
import {
  convertCarPrice,
  formatCarPriceLabel,
  isDisplayCurrency,
  resolveDisplayCurrency,
  type DisplayCurrency,
} from '@/lib/currency'
import { trackEvent } from '@/lib/trackEvent'
import type { Car } from '@/data/cars'
import { carDetailImageAlt, carDetailImageTitle } from '@/lib/carImageAlt'
import Footer from '@/components/Footer/Footer'

interface CarDetailClientProps {
  /** Optional brand hub crumb: Home / Fleet / Brand / Model */
  brandHub?: { label: string; brandSlug: string };
  car: {
    slug?: string
    carName: string
    carImage: string
    description: string
    brand: string
    model: string
    category: Car['category']
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
      title?: string
      caption?: string
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

const RESERVATION_FORM_ID = 'reservation-form'

/**
 * Renders a client-side car details page with image gallery, pricing, specifications, features, booking UI, and a sticky reservation shortcut.
 *
 * @param car - Detailed car data used to populate images, pricing (including short/long term discounts), specs, features, location, and rich content shown on the page
 * @returns The React element for the car detail client component
 */
export default function CarDetailClient({ car, brandHub }: CarDetailClientProps) {
  const localeUi = useLocale()
  const l: AppLocale = toAppLocale(localeUi)
  const tNav = useTranslations('nav')
  const t = useTranslations('carDetail')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [currency, setCurrency] = useState<DisplayCurrency>('EUR')
  const [isReservationFormInView, setIsReservationFormInView] = useState(true)
  const mobileGalleryRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const galleryImages =
    car.images.length > 0
      ? car.images
      : [{ src: car.carImage, alt: car.carName }]

  const scrollMobileGalleryTo = useCallback((index: number) => {
    const el = mobileGalleryRef.current
    if (!el) return
    const slide = el.children[index] as HTMLElement | undefined
    if (!slide) return
    el.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' })
    setSelectedImageIndex(index)
  }, [])

  const onMobileGalleryScroll = useCallback(() => {
    const el = mobileGalleryRef.current
    if (!el) return
    const width = el.clientWidth
    if (!width) return
    const idx = Math.round(el.scrollLeft / width)
    setSelectedImageIndex((prev) =>
      idx !== prev && idx >= 0 && idx < galleryImages.length ? idx : prev,
    )
  }, [galleryImages.length])

  // Resolve currency on client only: URL wins, then localStorage, default EUR
  useEffect(() => {
    const fromUrl = searchParams.get('currency')
    if (isDisplayCurrency(fromUrl)) {
      setCurrency(fromUrl)
      try {
        localStorage.setItem('carRentalCurrency', fromUrl)
      } catch (_) {}
      return
    }
    try {
      setCurrency(resolveDisplayCurrency(localStorage.getItem('carRentalCurrency')))
    } catch (_) {}
  }, [searchParams])

  // Show/hide sticky "Go to reservation" button based on form visibility
  useEffect(() => {
    const el = document.getElementById(RESERVATION_FORM_ID)
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsReservationFormInView(entry.isIntersecting),
      { threshold: 0.2, rootMargin: '-80px 0px -80px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const scrollToReservationForm = () => {
    trackEvent({
      event: 'scroll-reservation',
      path: typeof window !== 'undefined' ? window.location.pathname : '/',
      source: 'car-detail',
      carSlug: car.slug,
      carName: car.carName,
    })
    document.getElementById(RESERVATION_FORM_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleBackToCars = () => {
    const p = pathname as string
    if (p === '/cars' || p === '/voitures') {
      // If already on cars page, just scroll to the section
      const carsSection = document.getElementById('cars')
      if (carsSection) {
        carsSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      }
    } else {
      router.push({ pathname: "/cars" })
      
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
          scrollToCarsSection()
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
              {tNav('home')}
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/cars" className="text-muted-foreground hover:text-foreground">
              {tNav('cars')}
            </Link>
            {brandHub ? (
              <>
                <span className="text-muted-foreground">/</span>
                <Link
                  href={{
                    pathname: "/cars/brand/[brandSlug]",
                    params: { brandSlug: brandHub.brandSlug },
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {brandHub.label}
                </Link>
              </>
            ) : null}
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
          {tNav('backToCars')}
        </button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        {/*
          Mobile order: title → photos → booking.
          Desktop: photos left; title + booking right.
        */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Title — first on mobile (above photos), top-right on desktop */}
          <header className="lg:col-start-2 lg:row-start-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium uppercase">
                {
                  {
                    luxury: t('categories.luxury'),
                    sports: t('categories.sports'),
                    suv: t('categories.suv'),
                    electric: t('categories.electric'),
                    premium: t('categories.premium'),
                    economy: t('categories.economy'),
                    crossover: t('categories.crossover'),
                  }[car.category]
                }
              </span>
            </div>

            <h1 className="mb-2 !font-sans text-3xl font-semibold tracking-normal text-foreground md:text-4xl [font-family:ui-sans-serif,system-ui,sans-serif]">
              {car.carName}
            </h1>

            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{car.location}</span>
            </div>
          </header>

          {/* Image Gallery — second on mobile; left column on desktop */}
          <div className="space-y-4 lg:col-start-1 lg:row-start-1 lg:row-span-2">
            {/* Mobile: one photo, swipe left/right */}
            <div className="relative lg:hidden">
              <div
                ref={mobileGalleryRef}
                onScroll={onMobileGalleryScroll}
                className="flex aspect-[4/3] w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-2xl bg-muted [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                aria-label={t('galleryAria', { carName: car.carName })}
              >
                {galleryImages.map((_, index) => (
                  <div
                    key={index}
                    className="relative h-full w-full min-w-full shrink-0 snap-center snap-always"
                  >
                    <Image
                      src={galleryImages[index]?.src || car.carImage}
                      alt={carDetailImageAlt(car, index, l)}
                      title={carDetailImageTitle(car, index, l)}
                      fill
                      sizes="100vw"
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                ))}
              </div>

              {galleryImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm disabled:opacity-30"
                    aria-label={t('galleryPrev')}
                    disabled={selectedImageIndex <= 0}
                    onClick={() => scrollMobileGalleryTo(selectedImageIndex - 1)}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm disabled:opacity-30"
                    aria-label={t('galleryNext')}
                    disabled={selectedImageIndex >= galleryImages.length - 1}
                    onClick={() => scrollMobileGalleryTo(selectedImageIndex + 1)}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="pointer-events-none absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {galleryImages.map((_, index) => (
                      <span
                        key={index}
                        className={`h-1.5 rounded-full transition-all ${
                          index === selectedImageIndex
                            ? 'w-4 bg-white'
                            : 'w-1.5 bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    {selectedImageIndex + 1} / {galleryImages.length}
                  </p>
                </>
              ) : null}
            </div>

            {/* Desktop: main image + thumbnail grid */}
            <div className="hidden space-y-4 lg:block">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted">
                <Image
                  src={galleryImages[selectedImageIndex]?.src || car.carImage}
                  alt={carDetailImageAlt(car, selectedImageIndex, l)}
                  title={carDetailImageTitle(car, selectedImageIndex, l)}
                  width={600}
                  height={450}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>

              {galleryImages.length > 1 && (
                <div className="grid grid-cols-3 gap-4">
                  {galleryImages.map((_, index) => (
                    <div
                      key={index}
                      className={`aspect-[4/3] cursor-pointer overflow-hidden rounded-lg bg-muted transition-all duration-300 ${
                        selectedImageIndex === index
                          ? 'ring-2 ring-primary ring-offset-2'
                          : 'hover:scale-105'
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <Image
                        src={galleryImages[index]?.src || car.carImage}
                        alt={carDetailImageAlt(car, index, l)}
                        title={carDetailImageTitle(car, index, l)}
                        width={200}
                        height={150}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Booking — third on mobile; under title on desktop */}
          <div className="space-y-8 lg:col-start-2 lg:row-start-2">
            <BookingDialog
              inline
              carName={car.carName}
              carSlug={car.slug}
              currency={currency}
              carPrice={convertCarPrice(
                car.pricing?.shortTerm ?? car.pricePerDay,
                currency,
              )}
              pricing={
                car.pricing
                  ? {
                      shortTerm: convertCarPrice(car.pricing.shortTerm, currency),
                      longTerm: convertCarPrice(car.pricing.longTerm, currency),
                      hasDiscount: car.pricing.hasDiscount,
                    }
                  : undefined
              }
              priceLabel={`${formatCarPriceLabel(
                convertCarPrice(
                  car.pricing?.shortTerm ?? car.pricePerDay,
                  currency,
                ),
                currency,
              )} ${t('perDay')}`}
              priceTagline={t('priceTagline')}
              extraActions={
                <Button
                  type="button"
                  size="lg"
                  className="w-full bg-green-600 text-white hover:bg-green-700 cursor-pointer rounded-[25px] h-10"
                  onClick={() => {
                    trackEvent({
                      event: 'whatsapp',
                      path: typeof window !== 'undefined' ? window.location.pathname : '',
                      source: 'car-detail',
                      carSlug: car.slug,
                      carName: car.carName,
                    })
                    const price = car.pricing?.shortTerm || car.pricePerDay
                    const priceInCurrency = convertCarPrice(price, currency)
                    const message = t('waInquiry', {
                      carName: car.carName,
                      price: formatCarPriceLabel(priceInCurrency, currency),
                      currency: '',
                    })
                    const encodedMessage = encodeURIComponent(message);
                    const whatsappUrl = `https://wa.me/212662500181?text=${encodedMessage}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                >
                  <Phone className="h-5 w-5 mr-2" />
                  {t('waButton')}
                </Button>
              }
            />

            {/* Key specs under the booking form */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{t('seats', { count: car.seats })}</p>
                  <p className="text-sm text-muted-foreground">{t('capacity')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <Fuel className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{car.fuelType}</p>
                  <p className="text-sm text-muted-foreground">{t('fuelTypeLabel')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <Settings className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{car.transmission}</p>
                  <p className="text-sm text-muted-foreground">{t('transmissionLabel')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{car.year}</p>
                  <p className="text-sm text-muted-foreground">{t('modelYear')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-12 space-y-8">
         

          {/* Features Grid */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">{t('featuresHeading')}</h2>
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
            <h2 className="text-2xl font-bold text-foreground mb-6">{t('specsHeading')}</h2>
            <div className="bg-muted/30 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">{t('specEngine')}</span>
                    <span className="font-medium">{car.specs.engine}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">{t('specPower')}</span>
                    <span className="font-medium">{car.specs.horsepower}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">{t('specAcceleration')}</span>
                    <span className="font-medium">{car.specs.acceleration}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">{t('specTopSpeed')}</span>
                    <span className="font-medium">{car.specs.topSpeed}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">{t('specFuelEfficiency')}</span>
                    <span className="font-medium">{car.specs.fuelEfficiency}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">{t('specDrivetrain')}</span>
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
                <p className="font-medium text-green-900">{t('availabilityTitle')}</p>
                <p className="text-sm text-green-700">
                  {t('availabilityBody')}
                </p>
              </div>
            </div>
          </div>
          {/* Rich Content Description */}
          <div className="space-y-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">
              {car.richContent?.h1Title || t('defaultAboutTitle')}
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
                    <h2 className="text-2xl font-bold text-foreground mb-6">{t('faqHeading')}</h2>
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

      {/* Sticky "Go to reservation" button - same design as menu button, visible when form is not in view */}
      {!isReservationFormInView && (
        <div className="fixed bottom-4 left-6 z-40 px-12 py-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="relative w-[140px] h-[50px]">
            <MenuStyleButton label={t('stickyReserve')} onClick={scrollToReservationForm} />
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
