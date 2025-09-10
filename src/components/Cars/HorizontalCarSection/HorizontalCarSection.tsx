"use client"

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CarRentalCard } from '@/components/CarList/CarRentalCard'
import { getAllCars } from '@/data/cars'
import styles from './HorizontalCarSection.module.scss'

const HorizontalCarSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRow1Ref = useRef<HTMLDivElement>(null)
  const cardsRow2Ref = useRef<HTMLDivElement>(null)

  // Get all cars and split into two rows
  const allCars = getAllCars()
  const carsRow1 = allCars.slice(0, 8) // First 6 cars
  const carsRow2 = allCars.slice(8, 16) // Next 6 cars

  const handleBookCar = (carName: string) => {
    alert(`Booking ${carName}! Functionality would be implemented here.`)
  }

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    if (!sectionRef.current || !cardsRow1Ref.current || !cardsRow2Ref.current || !containerRef.current) return

    const section = sectionRef.current
    const cardsRow1 = cardsRow1Ref.current
    const cardsRow2 = cardsRow2Ref.current

    // Wait for next frame to ensure proper measurement
    gsap.set([cardsRow1, cardsRow2], { clearProps: "all" })
    
    // Calculate actual card dimensions with responsive handling
    const firstCard = cardsRow1.children[0] as HTMLElement
    if (!firstCard) return;
    
    const cardStyle = getComputedStyle(firstCard)
    const cardWidth = firstCard.offsetWidth
    const marginRight = parseInt(cardStyle.marginRight) || 32
    
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
    const row2CardsCount = cardsRow2.children.length
    const row1TotalWidth = (cardWidth * row1CardsCount) + (gap * (row1CardsCount - 1))
    const row2TotalWidth = (cardWidth * row2CardsCount) + (gap * (row2CardsCount - 1))
    
    // Since both rows have 6 cards, they should have the same width
    const rowWidth = Math.max(row1TotalWidth, row2TotalWidth)
    
    // Set both containers to the same width
    gsap.set([cardsRow1, cardsRow2], { width: rowWidth })
    
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
    
    // Calculate center positions for both rows
    // Center the first card of each row in the viewport
    const centerOffset = Math.max(0, (viewportWidth - cardWidth) / 2)
    
    // Set initial positions to center both rows
    // Row 1: Start centered, scroll left to reveal all cards
    gsap.set(cardsRow1, { x: centerOffset })
    
    // Row 2: Start centered (but off-screen), scroll right to reveal all cards
    gsap.set(cardsRow2, { x: -rowWidth + centerOffset })

    // Pin the section and create horizontal scroll for first row (right to left)
    const horizontalScrollRow1 = gsap.to(cardsRow1, {
      x: centerOffset - scrollDistance, // End position maintains center offset
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${scrollDistance}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          // Add parallax effect to row 1 cards
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
        }
      }
    })

    // Create horizontal scroll for second row (left to right)
    const horizontalScrollRow2 = gsap.to(cardsRow2, {
      x: centerOffset, // End at center position to show all cards
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${scrollDistance}`,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          // Add parallax effect to row 2 cards (opposite direction)
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
    })

    // Animate cards on entry for both rows
    gsap.fromTo(
      [cardsRow1.children, cardsRow2.children],
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
      // Clear all GSAP transforms before cleanup
      gsap.set([cardsRow1, cardsRow2], { clearProps: "all" })
      gsap.set([cardsRow1.children, cardsRow2.children], { clearProps: "all" })
      
      // Kill animations
      horizontalScrollRow1.kill()
      horizontalScrollRow2.kill()
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <section ref={sectionRef} className={styles.horizontalSection}>
      <div ref={containerRef} className={styles.container}>
        {/* Section Header */}
        {/* <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Premium Fleet</h2>
          <p className={styles.sectionSubtitle}>Discover Our Cars</p>
        </div> */}

        {/* First row - scrolls right to left */}
        <div className={styles.rowContainer}>
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
                />
              </div>
            ))}
          </div>
        </div>

        {/* Second row - scrolls left to right */}
        <div className={styles.rowContainer}>
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
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HorizontalCarSection 
