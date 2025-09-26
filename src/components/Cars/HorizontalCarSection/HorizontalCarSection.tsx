"use client"

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CarRentalCard } from '@/components/CarList/CarRentalCard'
import { getAllCars } from '@/data/cars'
import BookingDialog from '@/components/BookingDialog/BookingDialog'
import styles from './HorizontalCarSection.module.scss'

interface HorizontalCarSectionProps {
  onAnimationComplete?: () => void
}

const HorizontalCarSection = ({ onAnimationComplete }: HorizontalCarSectionProps = {}) => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRow1Ref = useRef<HTMLDivElement>(null)
  const cardsRow2Ref = useRef<HTMLDivElement>(null)

  // Custom hook for responsive height detection
  function useResponsiveHeight() {
    const [screenConfig, setScreenConfig] = useState({
      isShortHeight: false,
      isSingleRow: false,
      heightCategory: 'normal' as 'normal' | 'short' | 'very-short' | 'ultra-short'
    })
    
    useEffect(() => {
      const checkScreenHeight = () => {
        const height = window.innerHeight
        
        let heightCategory: 'normal' | 'short' | 'very-short' | 'ultra-short' = 'normal'
        let isShortHeight = false
        let isSingleRow = false
        
        // Define height breakpoints for responsive design
        // All heights from 800px down to 500px should use single row
        if (height <= 500) {
          heightCategory = 'ultra-short'
          isShortHeight = true
          isSingleRow = true
        } else if (height <= 600) {
          heightCategory = 'very-short'
          isShortHeight = true
          isSingleRow = true
        } else if (height <= 700) {
          heightCategory = 'short'
          isShortHeight = true
          isSingleRow = true
        } else if (height <= 800) {
          heightCategory = 'short'
          isShortHeight = true
          isSingleRow = true
        }
        
        setScreenConfig({
          isShortHeight,
          isSingleRow,
          heightCategory
        })
      }
      
      checkScreenHeight()
      window.addEventListener('resize', checkScreenHeight)
      return () => window.removeEventListener('resize', checkScreenHeight)
    }, [])
    
    return screenConfig
  }

  const { isShortHeight, isSingleRow, heightCategory } = useResponsiveHeight()

  // Booking dialog state
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [selectedCar, setSelectedCar] = useState<{
    name: string
    price: number
    image: string
  } | null>(null)

  // Get all cars and handle responsive layout
  const allCars = getAllCars()
  
  // Adaptive car distribution based on screen height
  const getCarsData = () => {
    if (isSingleRow) {
      // Single row: Show all cars in one row
      return {
        carsRow1: allCars,
        carsRow2: [],
        allCarsSingleRow: allCars
      }
    } else {
      // Two rows: Split cars optimally
      const midPoint = Math.ceil(allCars.length / 2)
      return {
        carsRow1: allCars.slice(0, midPoint),
        carsRow2: allCars.slice(midPoint),
        allCarsSingleRow: null
      }
    }
  }
  
  const { carsRow1, carsRow2, allCarsSingleRow } = getCarsData()

  const handleBookCar = (carName: string) => {
    // Find the car data
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
    // Find the car data
    const car = allCars.find(c => c.carName === carName)
    if (car) {
      // Create WhatsApp message with car details
      const message = `Bonjour, je souhaite louer la ${car.carName} au tarif de ${car.pricePerDay} MAD/jour. Pourriez-vous me confirmer les disponibilités et m’indiquer la procédure de réservation ? Merci.`;
      
      // Encode the message for URL
      const encodedMessage = encodeURIComponent(message);
      
      // WhatsApp number (replace with your actual WhatsApp number)
      const whatsappNumber = '212662500181';
      
      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      
      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');
    }
  }

  useEffect(() => {
    // Skip GSAP animations for short height screens - use normal grid layout instead
    if (isShortHeight) {
      console.log(`Using grid layout for height: ${heightCategory}`)
      return
    }

    gsap.registerPlugin(ScrollTrigger)

    if (!sectionRef.current || !cardsRow1Ref.current || !containerRef.current) return
    
    // Only check cardsRow2 if we're not in single row mode
    if (!isSingleRow && !cardsRow2Ref.current) return

    const section = sectionRef.current
    const cardsRow1 = cardsRow1Ref.current
    const cardsRow2 = cardsRow2Ref.current

    // Wait for next frame to ensure proper measurement
    if (isSingleRow) {
      gsap.set(cardsRow1, { clearProps: "all" })
    } else {
      gsap.set([cardsRow1, cardsRow2], { clearProps: "all" })
    }
    
    // Calculate actual card dimensions with responsive handling
    const firstCard = cardsRow1.children[0] as HTMLElement
    if (!firstCard) return;
    
    const cardWidth = firstCard.offsetWidth
    
    // Get responsive gap based on screen size
    const getResponsiveGap = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth <= 375) return 10; // 0.6rem
      if (screenWidth <= 480) return 13; // 0.8rem  
      if (screenWidth <= 640) return 16; // 1rem
      if (screenWidth <= 768) return 19; // 1.2rem
      if (screenWidth <= 1024) return 24; // 1.5rem
      if (screenWidth <= 1200) return 29; // 1.8rem
      return 32; // 2rem default
    };
    
    const gap = getResponsiveGap();
    
    // Calculate total width for each row (cards + gaps)
    const row1CardsCount = cardsRow1.children.length
    const row2CardsCount = cardsRow2?.children.length || 0
    const row1TotalWidth = (cardWidth * row1CardsCount) + (gap * (row1CardsCount - 1))
    const row2TotalWidth = cardsRow2 ? (cardWidth * row2CardsCount) + (gap * (row2CardsCount - 1)) : 0
    
    // Calculate row width based on layout mode
    const rowWidth = isSingleRow ? row1TotalWidth : Math.max(row1TotalWidth, row2TotalWidth)
    
    // Set container widths based on layout mode
    if (isSingleRow) {
      gsap.set(cardsRow1, { width: rowWidth })
    } else {
      gsap.set([cardsRow1, cardsRow2], { width: rowWidth })
    }
    
    // Calculate viewport and scroll distances with responsive adjustments
    const viewportWidth = window.innerWidth
    // Adjust scroll distance based on screen size for better mobile experience
    const getScrollDistance = () => {
      if (viewportWidth <= 768) {
        return rowWidth * 0.8; // Shorter scroll on mobile
      }
      return rowWidth;
    };
    const scrollDistance = getScrollDistance();
    
    // Calculate center positions
    const centerOffset = Math.max(0, (viewportWidth - cardWidth) / 2)
    
    let horizontalScrollRow1, horizontalScrollRow2;
    
    if (isSingleRow) {
      // Single row mode: Show all cars in one continuous scroll
      // Start from the very beginning to show first car properly
      const startPosition = Math.max(centerOffset, 0)
      gsap.set(cardsRow1, { x: startPosition })
      
      // Calculate proper scroll distance to show ALL cars
      const totalCars = allCarsSingleRow?.length || 0
      const totalWidth = (cardWidth * totalCars) + (gap * (totalCars - 1))
      const totalScrollDistance = Math.max(totalWidth - viewportWidth + startPosition, totalWidth * 0.8)
      
      console.log(`Single row setup - Height: ${heightCategory}`, {
        totalCars,
        totalWidth,
        totalScrollDistance,
        viewportWidth,
        cardWidth,
        startPosition
      })
      
      horizontalScrollRow1 = gsap.to(cardsRow1, {
        x: startPosition - totalScrollDistance,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${totalScrollDistance}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            // Add parallax effect optimized for many cards
            const cards = cardsRow1Ref.current?.children
            if (cards) {
              Array.from(cards).forEach((card, index) => {
                const element = card as HTMLElement
                const progress = self.progress
                const offset = (index * 0.03) - progress // Even more reduced for smoother effect
                gsap.set(element, {
                  rotationY: offset * 2,
                  z: Math.abs(offset) * -20
                })
              })
            }
            
            // Call completion callback when animation is near end
            if (self.progress >= 0.95 && onAnimationComplete) {
              onAnimationComplete()
            }
          }
        }
      })
      
      // Create dummy for cleanup
      horizontalScrollRow2 = { kill: () => {} }
      
    } else {
      // Two row mode: Original behavior
      gsap.set(cardsRow1, { x: centerOffset })
      gsap.set(cardsRow2, { x: -rowWidth + centerOffset })

      // Adjust scroll distance based on height category
      const adjustedScrollDistance = heightCategory === 'short' ? scrollDistance * 0.8 : scrollDistance

      horizontalScrollRow1 = gsap.to(cardsRow1, {
        x: centerOffset - adjustedScrollDistance,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${adjustedScrollDistance}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const cards = cardsRow1Ref.current?.children
            if (cards) {
              Array.from(cards).forEach((card, index) => {
                const element = card as HTMLElement
                const progress = self.progress
                const offset = (index * 0.1) - progress
                gsap.set(element, {
                  rotationY: offset * 5,
                  z: Math.abs(offset) * -50
                })
              })
            }
            
            // Call completion callback when both rows are near completion
            if (self.progress >= 0.95 && onAnimationComplete) {
              onAnimationComplete()
            }
          }
        }
      })

      horizontalScrollRow2 = cardsRow2 ? gsap.to(cardsRow2, {
        x: centerOffset,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${adjustedScrollDistance}`,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const cards = cardsRow2Ref.current?.children
            if (cards) {
              Array.from(cards).forEach((card, index) => {
                const element = card as HTMLElement
                const progress = self.progress
                const offset = progress - (index * 0.1)
                gsap.set(element, {
                  rotationY: offset * -5,
                  z: Math.abs(offset) * -50
                })
              })
            }
          }
        }
      }) : { kill: () => {} }
    }

    // Animate cards on entry based on layout mode
    if (isSingleRow) {
      gsap.fromTo(
        cardsRow1.children,
        {
          y: 100,
          opacity: 0,
          rotationX: 45
        },
        {
          y: 0,
          opacity: 1,
          rotationX: 0,
          duration: 1,
          stagger: 0.03, // Faster stagger for more cards
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "top 20%",
            toggleActions: "play none none reverse"
          }
        }
      )
    } else {
      const elementsToAnimate = cardsRow2 ? [cardsRow1.children, cardsRow2.children] : [cardsRow1.children]
      gsap.fromTo(
        elementsToAnimate,
        {
          y: 100,
          opacity: 0,
          rotationX: 45
        },
        {
          y: 0,
          opacity: 1,
          rotationX: 0,
          duration: 1,
          stagger: 0.05,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "top 20%",
            toggleActions: "play none none reverse"
          }
        }
      )
    }

    // Section title animation
    gsap.fromTo(
      `.${styles.sectionTitle}`,
      {
        y: 50,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 90%",
          toggleActions: "play none none reverse"
        }
      }
    )

    return () => {
      // Only cleanup GSAP if we used animations (not for short height screens)
      if (!isShortHeight && horizontalScrollRow1 && horizontalScrollRow2) {
        // Clear all GSAP transforms before cleanup
        if (isSingleRow) {
          gsap.set(cardsRow1, { clearProps: "all" })
          gsap.set(cardsRow1.children, { clearProps: "all" })
        } else {
          gsap.set([cardsRow1, cardsRow2], { clearProps: "all" })
          if (cardsRow2) {
            gsap.set([cardsRow1.children, cardsRow2.children], { clearProps: "all" })
          }
        }
        
        // Kill animations
        horizontalScrollRow1.kill()
        horizontalScrollRow2.kill()
        ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      }
    }
  }, [isShortHeight, isSingleRow, heightCategory, allCarsSingleRow?.length, onAnimationComplete])

  // Cleanup ScrollTrigger pins when switching to grid mode
  useEffect(() => {
    if (!sectionRef.current) return;

    if (isShortHeight) {
      // Kill all triggers so nothing pins
      ScrollTrigger.getAll().forEach(t => t.kill());

      // Clear GSAP inline styles on the pinned/animated nodes
      gsap.set([sectionRef.current, cardsRow1Ref.current, cardsRow2Ref.current], { clearProps: "all" });
    }
  }, [isShortHeight]);

  return (
    <section 
      ref={sectionRef} 
      className={`${styles.horizontalSection} ${isShortHeight ? styles.gridMode : ''}`} 
      id="cars"
    >
      <div ref={containerRef} className={styles.container}>
        {/* Section Header */}
        {/* <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Premium Fleet</h2>
          <p className={styles.sectionSubtitle}>Discover Our Cars</p>
        </div> */}

        {isShortHeight ? (
          // Grid layout for short height screens (no animations)
          <div className={`${styles.gridContainer} `} data-height-category={heightCategory}>
            <div className={`${styles.gridLayout} ${styles[`grid-${heightCategory}`]}`}>
              {allCars.map((car) => (
                <div key={car.id} className={`${styles.gridCard}`}>
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
                </div>
              ))}
            </div>
          </div>
        ) : isSingleRow ? (
          // Single row layout for normal height single row screens (with animations)
          <div className={`${styles.rowContainer} ${styles.singleRowLayout}`} data-height-category={heightCategory}>
            <div ref={cardsRow1Ref} className={styles.cardsContainer}>
              {allCarsSingleRow?.map((car) => (
                <div key={car.id} className={styles.cardWrapper}>
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
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Two row layout for normal height screens
          <>
            {/* First row - scrolls right to left */}
            <div className={`${styles.rowContainer} ${styles.twoRowLayout}`} data-height-category={heightCategory}>
              <div ref={cardsRow1Ref} className={styles.cardsContainer}>
                {carsRow1.map((car) => (
                  <div key={car.id} className={styles.cardWrapper}>
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
                  </div>
                ))}
              </div>
            </div>

            {/* Second row - scrolls left to right */}
            <div className={`${styles.rowContainer} ${styles.twoRowLayout}`} data-height-category={heightCategory}>
              <div ref={cardsRow2Ref} className={`${styles.cardsContainer} ${styles.cardsContainerReverse}`}>
                {carsRow2.map((car) => (
                  <div key={car.id} className={styles.cardWrapper}>
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
                  </div>
                ))}
              </div>
            </div>
          </>
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

export default HorizontalCarSection 
