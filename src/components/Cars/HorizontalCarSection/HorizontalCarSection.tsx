"use client"

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CarRentalCard } from '@/components/CarList/CarRentalCard'
import styles from './HorizontalCarSection.module.scss'

interface Car {
  id: number
  carName: string
  carImage: string
  pricePerDay: number
  seats: number
  fuelType: string
  transmission: string
  rating: number
}

const HorizontalCarSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRow1Ref = useRef<HTMLDivElement>(null)
  const cardsRow2Ref = useRef<HTMLDivElement>(null)

  // First row cars
  const carsRow1: Car[] = [
    {
      id: 1,
      carName: "BMW X5",
      carImage: "/images/1.jpeg",
      pricePerDay: 89,
      seats: 5,
      fuelType: "Petrol",
      transmission: "Automatic",
      rating: 4.8
    },
    {
      id: 2,
      carName: "Mercedes C-Class",
      carImage: "/images/2.jpeg",
      pricePerDay: 75,
      seats: 5,
      fuelType: "Hybrid",
      transmission: "Automatic",
      rating: 4.9
    },
    {
      id: 3,
      carName: "Audi A4",
      carImage: "/images/3.jpg",
      pricePerDay: 65,
      seats: 5,
      fuelType: "Petrol",
      transmission: "Manual",
      rating: 4.7
    },
    {
      id: 4,
      carName: "Tesla Model S",
      carImage: "/images/4.jpg",
      pricePerDay: 120,
      seats: 5,
      fuelType: "Electric",
      transmission: "Automatic",
      rating: 4.9
    },
    {
      id: 5,
      carName: "Porsche 911",
      carImage: "/images/5.jpg",
      pricePerDay: 200,
      seats: 2,
      fuelType: "Petrol",
      transmission: "Manual",
      rating: 4.8
    },
    {
      id: 6,
      carName: "Range Rover",
      carImage: "/images/6.jpg",
      pricePerDay: 150,
      seats: 7,
      fuelType: "Diesel",
      transmission: "Automatic",
      rating: 4.6
    }
  ]

  // Second row cars
  const carsRow2: Car[] = [
    {
      id: 7,
      carName: "Ferrari 488",
      carImage: "/images/7.jpg",
      pricePerDay: 300,
      seats: 2,
      fuelType: "Petrol",
      transmission: "Automatic",
      rating: 5.0
    },
    {
      id: 8,
      carName: "Lamborghini Huracan",
      carImage: "/images/8.jpg",
      pricePerDay: 350,
      seats: 2,
      fuelType: "Petrol",
      transmission: "Automatic",
      rating: 5.0
    },
    {
      id: 9,
      carName: "Bentley Continental",
      carImage: "/images/9.jpg",
      pricePerDay: 280,
      seats: 4,
      fuelType: "Petrol",
      transmission: "Automatic",
      rating: 4.7
    },
    {
      id: 10,
      carName: "Rolls Royce Ghost",
      carImage: "/images/10.jpg",
      pricePerDay: 450,
      seats: 5,
      fuelType: "Petrol",
      transmission: "Automatic",
      rating: 5.0
    },
    {
      id: 11,
      carName: "McLaren 720S",
      carImage: "/images/11.jpg",
      pricePerDay: 400,
      seats: 2,
      fuelType: "Petrol",
      transmission: "Automatic",
      rating: 4.9
    },
    {
      id: 12,
      carName: "Aston Martin DB11",
      carImage: "/images/12.jpg",
      pricePerDay: 320,
      seats: 2,
      fuelType: "Petrol",
      transmission: "Automatic",
      rating: 4.8
    }
  ]

  const handleBookCar = (carName: string) => {
    alert(`Booking ${carName}! Functionality would be implemented here.`)
  }

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    if (!sectionRef.current || !cardsRow1Ref.current || !cardsRow2Ref.current || !containerRef.current) return

    const section = sectionRef.current
    const cardsRow1 = cardsRow1Ref.current
    const cardsRow2 = cardsRow2Ref.current
    const container = containerRef.current

    // Wait for next frame to ensure proper measurement
    gsap.set([cardsRow1, cardsRow2], { clearProps: "all" })
    
    // Calculate actual card dimensions
    const firstCard = cardsRow1.children[0] as HTMLElement
    const cardStyle = getComputedStyle(firstCard)
    const cardWidth = firstCard.offsetWidth
    const gap = parseInt(cardStyle.marginRight) || 32 // 2rem = 32px default
    
    // Calculate total width for each row (cards + gaps)
    const row1CardsCount = cardsRow1.children.length
    const row2CardsCount = cardsRow2.children.length
    const row1TotalWidth = (cardWidth * row1CardsCount) + (gap * (row1CardsCount - 1))
    const row2TotalWidth = (cardWidth * row2CardsCount) + (gap * (row2CardsCount - 1))
    
    // Since both rows have 6 cards, they should have the same width
    const rowWidth = Math.max(row1TotalWidth, row2TotalWidth)
    
    // Set both containers to the same width
    gsap.set([cardsRow1, cardsRow2], { width: rowWidth })
    
    // Calculate viewport and scroll distances
    const viewportWidth = window.innerWidth
    // The scroll distance should be the full content width to reveal all cards
    const scrollDistance = rowWidth
    
    // Calculate center positions for both rows
    // Center the first card of each row in the viewport
    const centerOffset = (viewportWidth - cardWidth) / 2
    
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
      horizontalScrollRow1.kill()
      horizontalScrollRow2.kill()
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <section ref={sectionRef} className={styles.horizontalSection}>
      <div ref={containerRef} className={styles.container}>
        {/* <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Our Premium Fleet</h2>
          <p className={styles.sectionSubtitle}>
            Discover our collection of luxury vehicles
          </p>
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
