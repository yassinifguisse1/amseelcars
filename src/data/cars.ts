export interface CarImage {
  src: string
  alt: string
  isPrimary?: boolean
}

export interface CarFeature {
  icon: string
  name: string
  value: string
}

export interface CarSpecs {
  engine: string
  horsepower: string
  acceleration: string
  topSpeed: string
  fuelEfficiency: string
  drivetrain: string
}

export interface Car {
  id: number
  slug: string
  carName: string
  brand: string
  model: string
  year: number
  carImage: string // Primary image for card display
  images: CarImage[] // Gallery images for detail page
  pricePerDay: number
  seats: number
  fuelType: string
  transmission: string
  rating: number
  description: string
  features: CarFeature[]
  specs: CarSpecs
  category: 'luxury' | 'sports' | 'suv' | 'electric' | 'premium'
  availability: boolean
  location: string
}

export const cars: Car[] = [
  {
    id: 1,
    slug: 'bmw-x3-2024',
    carName: "BMW X3",
    brand: "BMW",
    model: "X3",
    year: 2024,
    carImage: "/images/1.jpeg",
    images: [
      { src: "/images/1.jpeg", alt: "BMW X3 Front View", isPrimary: true },
      { src: "/images/2.jpeg", alt: "BMW X3 Interior" },
      { src: "/images/3.jpg", alt: "BMW X3 Side View" },
      { src: "/images/4.jpg", alt: "BMW X3 Dashboard" }
    ],
    pricePerDay: 89,
    seats: 5,
    fuelType: "Petrol",
    transmission: "Automatic",
    rating: 4.8,
    description: "Experience luxury and performance with the BMW X5. This premium SUV combines elegant design with cutting-edge technology, perfect for both city driving and long-distance journeys.",
    features: [
      { icon: "🚗", name: "Seats", value: "5" },
      { icon: "⛽", name: "Fuel Type", value: "Petrol" },
      { icon: "⚙️", name: "Transmission", value: "Automatic" },
      { icon: "🛡️", name: "Safety Rating", value: "5 Stars" },
      { icon: "❄️", name: "Climate Control", value: "Dual Zone" },
      { icon: "📱", name: "Connectivity", value: "Apple CarPlay" }
    ],
    specs: {
      engine: "3.0L Twin-Turbo I6",
      horsepower: "335 HP",
      acceleration: "0-60 mph in 5.3s",
      topSpeed: "155 mph",
      fuelEfficiency: "22/29 mpg",
      drivetrain: "All-Wheel Drive"
    },
    category: 'luxury',
    availability: true,
    location: "Casablanca, Morocco"
  },
  {
    id: 2,
    slug: 'mercedes-c-class-2024',
    carName: "Mercedes C-Class",
    brand: "Mercedes-Benz",
    model: "C-Class",
    year: 2024,
    carImage: "/images/2.jpeg",
    images: [
      { src: "/images/2.jpeg", alt: "Mercedes C-Class Front View", isPrimary: true },
      { src: "/images/1.jpeg", alt: "Mercedes C-Class Interior" },
      { src: "/images/5.jpg", alt: "Mercedes C-Class Side View" }
    ],
    pricePerDay: 75,
    seats: 5,
    fuelType: "Hybrid",
    transmission: "Automatic",
    rating: 4.9,
    description: "The Mercedes C-Class represents the perfect balance of luxury, efficiency, and performance. With its hybrid powertrain and sophisticated design, it's ideal for the modern driver.",
    features: [
      { icon: "🚗", name: "Seats", value: "5" },
      { icon: "🔋", name: "Fuel Type", value: "Hybrid" },
      { icon: "⚙️", name: "Transmission", value: "Automatic" },
      { icon: "🛡️", name: "Safety Rating", value: "5 Stars" },
      { icon: "💎", name: "Interior", value: "Premium Leather" },
      { icon: "🎵", name: "Audio", value: "Burmester Sound" }
    ],
    specs: {
      engine: "2.0L Turbo + Electric",
      horsepower: "255 HP",
      acceleration: "0-60 mph in 6.0s",
      topSpeed: "145 mph",
      fuelEfficiency: "28/35 mpg",
      drivetrain: "Rear-Wheel Drive"
    },
    category: 'luxury',
    availability: true,
    location: "Rabat, Morocco"
  },
  {
    id: 3,
    slug: 'audi-a4-2024',
    carName: "Audi A4",
    brand: "Audi",
    model: "A4",
    year: 2024,
    carImage: "/images/3.jpg",
    images: [
      { src: "/images/3.jpg", alt: "Audi A4 Front View", isPrimary: true },
      { src: "/images/4.jpg", alt: "Audi A4 Interior" },
      { src: "/images/6.jpg", alt: "Audi A4 Side View" }
    ],
    pricePerDay: 65,
    seats: 5,
    fuelType: "Petrol",
    transmission: "Manual",
    rating: 4.7,
    description: "The Audi A4 delivers exceptional driving dynamics with its precise handling and refined interior. Perfect for those who appreciate German engineering and sporty performance.",
    features: [
      { icon: "🚗", name: "Seats", value: "5" },
      { icon: "⛽", name: "Fuel Type", value: "Petrol" },
      { icon: "⚙️", name: "Transmission", value: "Manual" },
      { icon: "🏁", name: "Drive Mode", value: "Sport+" },
      { icon: "🎯", name: "Quattro", value: "AWD System" },
      { icon: "📊", name: "Virtual Cockpit", value: "12.3-inch" }
    ],
    specs: {
      engine: "2.0L TFSI Turbo",
      horsepower: "190 HP",
      acceleration: "0-60 mph in 7.1s",
      topSpeed: "140 mph",
      fuelEfficiency: "24/31 mpg",
      drivetrain: "All-Wheel Drive"
    },
    category: 'premium',
    availability: true,
    location: "Marrakech, Morocco"
  },
  {
    id: 4,
    slug: 'tesla-model-s-2024',
    carName: "Tesla Model S",
    brand: "Tesla",
    model: "Model S",
    year: 2024,
    carImage: "/images/4.jpg",
    images: [
      { src: "/images/4.jpg", alt: "Tesla Model S Front View", isPrimary: true },
      { src: "/images/5.jpg", alt: "Tesla Model S Interior" },
      { src: "/images/7.jpg", alt: "Tesla Model S Side View" }
    ],
    pricePerDay: 120,
    seats: 5,
    fuelType: "Electric",
    transmission: "Automatic",
    rating: 4.9,
    description: "Experience the future of driving with the Tesla Model S. This all-electric luxury sedan offers incredible performance, cutting-edge technology, and zero emissions.",
    features: [
      { icon: "🚗", name: "Seats", value: "5" },
      { icon: "⚡", name: "Fuel Type", value: "Electric" },
      { icon: "🔄", name: "Transmission", value: "Single Speed" },
      { icon: "🚀", name: "Acceleration", value: "Ludicrous Mode" },
      { icon: "🔋", name: "Range", value: "405 miles" },
      { icon: "🖥️", name: "Display", value: "17-inch Touch" }
    ],
    specs: {
      engine: "Dual Motor Electric",
      horsepower: "670 HP",
      acceleration: "0-60 mph in 3.1s",
      topSpeed: "200 mph",
      fuelEfficiency: "120 MPGe",
      drivetrain: "All-Wheel Drive"
    },
    category: 'electric',
    availability: true,
    location: "Casablanca, Morocco"
  },
  {
    id: 5,
    slug: 'porsche-911-2024',
    carName: "Porsche 911",
    brand: "Porsche",
    model: "911",
    year: 2024,
    carImage: "/images/5.jpg",
    images: [
      { src: "/images/5.jpg", alt: "Porsche 911 Front View", isPrimary: true },
      { src: "/images/6.jpg", alt: "Porsche 911 Interior" },
      { src: "/images/8.jpg", alt: "Porsche 911 Side View" }
    ],
    pricePerDay: 200,
    seats: 2,
    fuelType: "Petrol",
    transmission: "Manual",
    rating: 4.8,
    description: "The iconic Porsche 911 delivers pure driving pleasure with its legendary design and exceptional performance. A true sports car for enthusiasts who demand the best.",
    features: [
      { icon: "🚗", name: "Seats", value: "2" },
      { icon: "⛽", name: "Fuel Type", value: "Petrol" },
      { icon: "⚙️", name: "Transmission", value: "Manual" },
      { icon: "🏁", name: "Sport Mode", value: "Active" },
      { icon: "🎯", name: "Rear Engine", value: "Classic Layout" },
      { icon: "🛣️", name: "Track Ready", value: "Yes" }
    ],
    specs: {
      engine: "3.0L Twin-Turbo Flat-6",
      horsepower: "379 HP",
      acceleration: "0-60 mph in 4.0s",
      topSpeed: "182 mph",
      fuelEfficiency: "18/24 mpg",
      drivetrain: "Rear-Wheel Drive"
    },
    category: 'sports',
    availability: true,
    location: "Agadir, Morocco"
  },
  {
    id: 6,
    slug: 'range-rover-evoque-2024',
    carName: "Range Rover",
    brand: "Land Rover",
    model: "Range Rover Evoque",
    year: 2024,
    carImage: "/images/6.jpg",
    images: [
      { src: "/images/6.jpg", alt: "Range Rover Front View", isPrimary: true },
      { src: "/images/7.jpg", alt: "Range Rover Interior" },
      { src: "/images/9.jpg", alt: "Range Rover Side View" }
    ],
    pricePerDay: 150,
    seats: 7,
    fuelType: "Diesel",
    transmission: "Automatic",
    rating: 4.6,
    description: "The Range Rover Evoque combines luxury with capability. Perfect for both urban adventures and off-road excursions, offering comfort and versatility for any journey.",
    features: [
      { icon: "🚗", name: "Seats", value: "7" },
      { icon: "⛽", name: "Fuel Type", value: "Diesel" },
      { icon: "⚙️", name: "Transmission", value: "Automatic" },
      { icon: "🏔️", name: "Off-Road", value: "Terrain Response" },
      { icon: "🌊", name: "Wading Depth", value: "600mm" },
      { icon: "🎨", name: "Panoramic", value: "Sunroof" }
    ],
    specs: {
      engine: "2.0L Turbo Diesel",
      horsepower: "180 HP",
      acceleration: "0-60 mph in 8.7s",
      topSpeed: "124 mph",
      fuelEfficiency: "30/38 mpg",
      drivetrain: "All-Wheel Drive"
    },
    category: 'suv',
    availability: true,
    location: "Fez, Morocco"
  },
  {
    id: 7,
    slug: 'ferrari-488-gtb-2024',
    carName: "Ferrari 488",
    brand: "Ferrari",
    model: "488 GTB",
    year: 2024,
    carImage: "/images/7.jpg",
    images: [
      { src: "/images/7.jpg", alt: "Ferrari 488 Front View", isPrimary: true },
      { src: "/images/8.jpg", alt: "Ferrari 488 Interior" },
      { src: "/images/10.jpg", alt: "Ferrari 488 Side View" }
    ],
    pricePerDay: 300,
    seats: 2,
    fuelType: "Petrol",
    transmission: "Automatic",
    rating: 5.0,
    description: "The Ferrari 488 GTB is the pinnacle of Italian automotive excellence. With breathtaking performance and stunning design, it's the ultimate expression of speed and luxury.",
    features: [
      { icon: "🚗", name: "Seats", value: "2" },
      { icon: "⛽", name: "Fuel Type", value: "Petrol" },
      { icon: "⚙️", name: "Transmission", value: "7-Speed DCT" },
      { icon: "🏁", name: "Race Mode", value: "Track" },
      { icon: "🎯", name: "Aerodynamics", value: "Active" },
      { icon: "🔥", name: "Engine Note", value: "V8 Symphony" }
    ],
    specs: {
      engine: "3.9L Twin-Turbo V8",
      horsepower: "661 HP",
      acceleration: "0-60 mph in 3.0s",
      topSpeed: "205 mph",
      fuelEfficiency: "15/22 mpg",
      drivetrain: "Rear-Wheel Drive"
    },
    category: 'sports',
    availability: true,
    location: "Casablanca, Morocco"
  },
  {
    id: 8,
    slug: 'lamborghini-huracan-2024',
    carName: "Lamborghini Huracan",
    brand: "Lamborghini",
    model: "Huracán EVO",
    year: 2024,
    carImage: "/images/8.jpg",
    images: [
      { src: "/images/8.jpg", alt: "Lamborghini Huracan Front View", isPrimary: true },
      { src: "/images/9.jpg", alt: "Lamborghini Huracan Interior" },
      { src: "/images/11.jpg", alt: "Lamborghini Huracan Side View" }
    ],
    pricePerDay: 350,
    seats: 2,
    fuelType: "Petrol",
    transmission: "Automatic",
    rating: 5.0,
    description: "The Lamborghini Huracán EVO embodies the pure essence of a super sports car. With its aggressive styling and mind-bending performance, it's designed to dominate both road and track.",
    features: [
      { icon: "🚗", name: "Seats", value: "2" },
      { icon: "⛽", name: "Fuel Type", value: "Petrol" },
      { icon: "⚙️", name: "Transmission", value: "7-Speed DCT" },
      { icon: "🏁", name: "Performance", value: "ANIMA System" },
      { icon: "🎯", name: "All-Wheel Drive", value: "Haldex" },
      { icon: "🔊", name: "Exhaust", value: "Sport Mode" }
    ],
    specs: {
      engine: "5.2L Naturally Aspirated V10",
      horsepower: "630 HP",
      acceleration: "0-60 mph in 2.9s",
      topSpeed: "202 mph",
      fuelEfficiency: "13/18 mpg",
      drivetrain: "All-Wheel Drive"
    },
    category: 'sports',
    availability: true,
    location: "Marrakech, Morocco"
  },
  {
    id: 9,
    slug: 'bentley-continental-gt-2024',
    carName: "Bentley Continental",
    brand: "Bentley",
    model: "Continental GT",
    year: 2024,
    carImage: "/images/9.jpg",
    images: [
      { src: "/images/9.jpg", alt: "Bentley Continental Front View", isPrimary: true },
      { src: "/images/10.jpg", alt: "Bentley Continental Interior" },
      { src: "/images/12.jpg", alt: "Bentley Continental Side View" }
    ],
    pricePerDay: 280,
    seats: 4,
    fuelType: "Petrol",
    transmission: "Automatic",
    rating: 4.7,
    description: "The Bentley Continental GT represents the ultimate in luxury grand touring. Combining handcrafted excellence with modern technology, it's perfect for those who demand the finest.",
    features: [
      { icon: "🚗", name: "Seats", value: "4" },
      { icon: "⛽", name: "Fuel Type", value: "Petrol" },
      { icon: "⚙️", name: "Transmission", value: "8-Speed Auto" },
      { icon: "💎", name: "Handcrafted", value: "Interior" },
      { icon: "🎵", name: "Naim Audio", value: "Premium Sound" },
      { icon: "🌟", name: "Diamond Quilted", value: "Leather" }
    ],
    specs: {
      engine: "6.0L Twin-Turbo W12",
      horsepower: "626 HP",
      acceleration: "0-60 mph in 3.6s",
      topSpeed: "207 mph",
      fuelEfficiency: "12/20 mpg",
      drivetrain: "All-Wheel Drive"
    },
    category: 'luxury',
    availability: true,
    location: "Casablanca, Morocco"
  },
  {
    id: 10,
    slug: 'rolls-royce-ghost-2024',
    carName: "Rolls Royce Ghost",
    brand: "Rolls-Royce",
    model: "Ghost",
    year: 2024,
    carImage: "/images/10.jpg",
    images: [
      { src: "/images/10.jpg", alt: "Rolls Royce Ghost Front View", isPrimary: true },
      { src: "/images/11.jpg", alt: "Rolls Royce Ghost Interior" },
      { src: "/images/1.jpeg", alt: "Rolls Royce Ghost Side View" }
    ],
    pricePerDay: 450,
    seats: 5,
    fuelType: "Petrol",
    transmission: "Automatic",
    rating: 5.0,
    description: "The Rolls-Royce Ghost represents the pinnacle of luxury and refinement. Every detail is meticulously crafted to provide an unparalleled experience of comfort and prestige.",
    features: [
      { icon: "🚗", name: "Seats", value: "5" },
      { icon: "⛽", name: "Fuel Type", value: "Petrol" },
      { icon: "⚙️", name: "Transmission", value: "8-Speed Auto" },
      { icon: "👑", name: "Magic Carpet", value: "Ride Quality" },
      { icon: "🌟", name: "Starlight", value: "Headliner" },
      { icon: "🔇", name: "Silence", value: "Sanctuary" }
    ],
    specs: {
      engine: "6.75L Twin-Turbo V12",
      horsepower: "563 HP",
      acceleration: "0-60 mph in 4.6s",
      topSpeed: "155 mph",
      fuelEfficiency: "12/18 mpg",
      drivetrain: "Rear-Wheel Drive"
    },
    category: 'luxury',
    availability: true,
    location: "Rabat, Morocco"
  },
  {
    id: 11,
    slug: 'mclaren-720s-2024',
    carName: "McLaren 720S",
    brand: "McLaren",
    model: "720S",
    year: 2024,
    carImage: "/images/11.jpg",
    images: [
      { src: "/images/11.jpg", alt: "McLaren 720S Front View", isPrimary: true },
      { src: "/images/12.jpg", alt: "McLaren 720S Interior" },
      { src: "/images/2.jpeg", alt: "McLaren 720S Side View" }
    ],
    pricePerDay: 400,
    seats: 2,
    fuelType: "Petrol",
    transmission: "Automatic",
    rating: 4.9,
    description: "The McLaren 720S is a masterpiece of automotive engineering. With its carbon fiber construction and twin-turbo V8, it delivers track-focused performance in a road-legal package.",
    features: [
      { icon: "🚗", name: "Seats", value: "2" },
      { icon: "⛽", name: "Fuel Type", value: "Petrol" },
      { icon: "⚙️", name: "Transmission", value: "7-Speed DCT" },
      { icon: "🏁", name: "Carbon Fiber", value: "Monocoque" },
      { icon: "🚪", name: "Dihedral", value: "Doors" },
      { icon: "🎯", name: "Active Aero", value: "Dynamics" }
    ],
    specs: {
      engine: "4.0L Twin-Turbo V8",
      horsepower: "710 HP",
      acceleration: "0-60 mph in 2.8s",
      topSpeed: "212 mph",
      fuelEfficiency: "15/22 mpg",
      drivetrain: "Rear-Wheel Drive"
    },
    category: 'sports',
    availability: true,
    location: "Tangier, Morocco"
  },
  {
    id: 12,
    slug: 'aston-martin-db11-2024',
    carName: "Aston Martin DB11",
    brand: "Aston Martin",
    model: "DB11",
    year: 2024,
    carImage: "/images/12.jpg",
    images: [
      { src: "/images/12.jpg", alt: "Aston Martin DB11 Front View", isPrimary: true },
      { src: "/images/1.jpeg", alt: "Aston Martin DB11 Interior" },
      { src: "/images/3.jpg", alt: "Aston Martin DB11 Side View" }
    ],
    pricePerDay: 320,
    seats: 2,
    fuelType: "Petrol",
    transmission: "Automatic",
    rating: 4.8,
    description: "The Aston Martin DB11 embodies British elegance and performance. With its stunning design and powerful V8 engine, it's the perfect grand tourer for discerning drivers.",
    features: [
      { icon: "🚗", name: "Seats", value: "2+2" },
      { icon: "⛽", name: "Fuel Type", value: "Petrol" },
      { icon: "⚙️", name: "Transmission", value: "8-Speed Auto" },
      { icon: "🎨", name: "British", value: "Craftsmanship" },
      { icon: "🔊", name: "Engine Note", value: "V8 Symphony" },
      { icon: "🏁", name: "GT Mode", value: "Grand Touring" }
    ],
    specs: {
      engine: "4.0L Twin-Turbo V8",
      horsepower: "503 HP",
      acceleration: "0-60 mph in 3.9s",
      topSpeed: "187 mph",
      fuelEfficiency: "17/24 mpg",
      drivetrain: "Rear-Wheel Drive"
    },
    category: 'sports',
    availability: true,
    location: "Casablanca, Morocco"
  }
]

// Utility functions
export function getAllCars(): Car[] {
  return cars
}

export function getCarBySlug(slug: string): Car | undefined {
  return cars.find(car => car.slug === slug)
}

export function getAllCarSlugs(): string[] {
  return cars.map(car => car.slug)
}

export function getCarsByCategory(category: Car['category']): Car[] {
  return cars.filter(car => car.category === category)
}

export function getAvailableCars(): Car[] {
  return cars.filter(car => car.availability)
}

export function searchCars(query: string): Car[] {
  const lowercaseQuery = query.toLowerCase()
  return cars.filter(car => 
    car.carName.toLowerCase().includes(lowercaseQuery) ||
    car.brand.toLowerCase().includes(lowercaseQuery) ||
    car.model.toLowerCase().includes(lowercaseQuery) ||
    car.category.toLowerCase().includes(lowercaseQuery)
  )
} 