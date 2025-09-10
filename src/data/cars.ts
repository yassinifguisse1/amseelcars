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
    slug: 'bmw-x3-2025',
    carName: "BMW X3 Pack M",
    brand: "BMW",
    model: "X3 Pack M",
    year: 2025,
    carImage: "/images/bmwx3.webp",
    images: [
      { src: "/images/bmwx3.webp", alt: "BMW X3 - vue avant", isPrimary: true },
      { src: "/images/bmwx3.webp", alt: "BMW X3 - intérieur" },
      { src: "/images/bmwx3.webp", alt: "BMW X3 - vue latérale" },
      { src: "/images/bmwx3.webp", alt: "BMW X3 - tableau de bord" }
    ],
    pricePerDay: 89,
    seats: 5,
    fuelType: "diesel",
    transmission: "Automatique",
    rating: 4.8,
    description: "Vivez le confort et les performances du BMW X3 Pack M (2025). Ce SUV premium reçoit le diesel mild-hybrid 48V, la transmission intégrale xDrive, l’iDrive 9 avec écran incurvé, ainsi que la compatibilité Apple CarPlay/Android Auto — parfait pour la ville comme pour les longs trajets.",
    features: [
      { icon: "🚗", name: "Sièges", value: "5" },
      { icon: "⛽", name: "Carburant", value: "Diesel (mild-hybrid 48V)" },
      { icon: "⚙️", name: "Boîte de vitesses", value: "Automatique Steptronic à 8 rapports" },
      { icon: "🛡️", name: "Aides à la conduite", value: "Freinage d’urgence, maintien de voie, angle mort" },
      { icon: "❄️", name: "Climatisation", value: "Bi-zone" },
      { icon: "📱", name: "Connectivité", value: "Apple CarPlay / Android Auto sans fil" }
    ],
    specs: {
      engine: "2.0L diesel TwinPower Turbo 4 cylindres (mild-hybrid 48V) – 20d",
      horsepower: "197 ch",
      acceleration: "0-100 km/h en 7,7 s",
      topSpeed: "215 km/h",
      fuelEfficiency: "5,8-6,5 l/100 km (WLTP)",
      drivetrain: "xDrive (4 roues motrices)"
    },
    category: 'luxury',
    availability: true,
    location: "Agadir, Maroc"
  }
  ,
  {
    id: 2,
    slug: 'Golf-8',
    carName: "Golf 8",
    brand: "Volkswagen",
    model: "Golf 8 1.5 eTSI 150 DSG",
    year: 2024,
    carImage: "/images/Golf 8 auto diesel 2024.webp",
    images: [
      { src: "/images/2.jpeg", alt: "Volkswagen Golf 8 - vue avant", isPrimary: true },
      { src: "/images/1.jpeg", alt: "Volkswagen Golf 8 - intérieur" },
      { src: "/images/5.jpg", alt: "Volkswagen Golf 8 - vue latérale" },
      { src: "/images/5.jpg", alt: "Volkswagen Golf 8 - tableau de bord" },
      { src: "/images/5.jpg", alt: "Volkswagen Golf 8 - vue arrière" }
    ],
    pricePerDay: 75,
    seats: 5,
    fuelType: "Hybride (mild-hybrid 48V, essence)",
    transmission: "Automatique DSG 7",
    rating: 4.9,
    description: "La Golf 8 allie compacité et technologie. Avec le moteur 1.5 eTSI 150 ch mild-hybrid 48V et la boîte DSG à 7 rapports, elle offre des performances souples, une consommation contenue et une connectivité moderne (App-Connect Apple CarPlay/Android Auto).",
    features: [
      { icon: "🚗", name: "Sièges", value: "5" },
      { icon: "🔋", name: "Carburant", value: "Hybride léger 48V (essence)" },
      { icon: "⚙️", name: "Boîte de vitesses", value: "Automatique DSG 7" },
      { icon: "🛡️", name: "Sécurité", value: "5 étoiles Euro NCAP (Golf 8)" },
      { icon: "❄️", name: "Climatisation", value: "Bi-zone" },
      { icon: "📱", name: "Connectivité", value: "Apple CarPlay / Android Auto (App-Connect)" }
    ],
    specs: {
      engine: "1.5L eTSI turbo essence (mild-hybrid 48V) – 4 cylindres",
      horsepower: "150 ch",
      acceleration: "0–100 km/h en 8,4 s",
      topSpeed: "224 km/h",
      fuelEfficiency: "5,3–5,4 l/100 km (WLTP)",
      drivetrain: "Traction (roues avant)"
    },
    category: 'luxury',
    availability: true,
    location: "Rabat, Morocco"
  }
  ,
  {
    id: 3,
    slug: 'T-Roc-2024',
    carName: "T-Roc",
    brand: "Volkswagen",
    model: "T-Roc",
    year: 2024,
    carImage: "/images/T roc auto diesel 2024 gris.webp",
    images: [
      { src: "/images/T roc auto diesel 2024 gris.webp", alt: "Audi A4 Front View", isPrimary: true },
      { src: "/images/T roc auto diesel 2024 gris.webp", alt: "Audi A4 Interior" },
      { src: "/images/T roc auto diesel 2024 gris.webp", alt: "Audi A4 Side View" },
      { src: "/images/T roc auto diesel 2024 gris.webp", alt: "Audi A4 Dashboard" },
      { src: "/images/T roc auto diesel 2024 gris.webp", alt: "Audi A4 Dashboard" },
      
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
    slug: 'clio-5-2024',
    carName: "Clio 5",
    brand: "Renault",
    model: "Clio 5",
    year: 2024,
    carImage: "/images/clio 5 gris manuel diesel 2024.webp",
    images: [
      { src: "/images/clio 5 gris manuel diesel 2024.webp", alt: "Clio 5 Front View", isPrimary: true },
      { src: "/images/clio 5 gris manuel diesel 2024.webp", alt: "Clio 5 Interior" },
      { src: "/images/clio 5 gris manuel diesel 2024.webp", alt: "Clio 5 Side View" }
    ],
    pricePerDay: 120,
    seats: 5,
    fuelType: "diesel",
    transmission: "Manual",
    rating: 4.9,
    description: "Experience the future of driving with the Volkswagen Touareg 2025. This all-electric luxury sedan offers incredible performance, cutting-edge technology, and zero emissions.",
    features: [
      { icon: "🚗", name: "Seats", value: "5" },
      { icon: "⚡", name: "Fuel Type", value: "diesel" },
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
    slug: 'clio-5-blanche-manuel-diesel-2024',
    carName: "Clio 5",
    brand: "Renault",
    model: "Clio 5",
    year: 2024,
    carImage: "/images/clio 5 blanche manuel diesel 2024.webp",
    images: [
      { src: "/images/clio 5 blanche manuel diesel 2024.webp", alt: "Porsche 911 Front View", isPrimary: true },
      { src: "/images/clio 5 blanche manuel diesel 2024.webp", alt: "Clio 5 Interior" },
      { src: "/images/clio 5 blanche manuel diesel 2024.webp", alt: "Clio 5 Side View" },
      { src: "/images/clio 5 blanche manuel diesel 2024.webp", alt: "Clio 5 Dashboard" },
      { src: "/images/clio 5 blanche manuel diesel 2024.webp", alt: "Porsche 911 Dashboard" },

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
    slug: 'citroen-C4-2025',
    carName: "Citroen C4",
    brand: "Renault",
    model: "Citroen C4",
    year: 2024,
    carImage: "/images/C4 auto essence 2025.webp",
    images: [
      { src: "/images/C4 auto essence 2025.webp", alt: "C4 Front View", isPrimary: true },
      { src: "/images/C4 auto essence 2025.webp", alt: "C4 Interior" },
      { src: "/images/C4 auto essence 2025.webp", alt: "C4 Side View" },
      { src: "/images/C4 auto essence 2025.webp", alt: "C4 Dashboard" },
      { src: "/images/C4 auto essence 2025.webp", alt: "C4 Dashboard" },
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
    slug: 'C3-aircross-blanche',
    carName: "C3 Aircross",
    brand: "Ferrari",
    model: "C3 Aircross",
    year: 2024,
    carImage: "/images/C3 aircross blanche.webp",
    images: [
      { src: "/images/C3 aircross blanche.webp", alt: "Ferrari 488 Front View", isPrimary: true },
      { src: "/images/C3 aircross blanche.webp", alt: "Ferrari 488 Interior" },
      { src: "/images/C3 aircross blanche.webp", alt: "Ferrari 488 Side View" },
      { src: "/images/C3 aircross blanche.webp", alt: "Ferrari 488 Dashboard" },
      { src: "/images/C3 aircross blanche.webp", alt: "Ferrari 488 Dashboard" },
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
    slug: 'C3-aircross-gris',
    carName: "C3 Aircross",
    brand: "Citroen",
    model: "C3 Aircross",
    year: 2024,
    carImage: "/images/C3 aircross gris.webp",
    images: [
      { src: "/images/C3 aircross gris.webp", alt: "C3 aircross  Front View", isPrimary: true },
      { src: "/images/C3 aircross gris.webp", alt: "C3 aircross Interior" },
      { src: "/images/C3 aircross gris.webp", alt: "C3 aircross Side View" }
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
    location: "Agadir, Morocco"
  },
  {
    id: 9,
    slug: 'C3-normal-manuel-diesel-2024',
    carName: "C3 Normal",
    brand: "Citroen",
    model: "C3 Normal",
    year: 2024,
    carImage: "/images/C3 normal manuel diesel 2024.webp",
    images: [
      { src: "/images/C3 normal manuel diesel 2024.webp", alt: "Bentley Continental Front View", isPrimary: true },
      { src: "/images/C3 normal manuel diesel 2024.webp", alt: "Bentley Continental Interior" },
      { src: "/images/C3 normal manuel diesel 2024.webp", alt: "Bentley Continental Side View" }
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
    slug: 'hyundai-i10-noire-auto-essence-2024',
    carName: "Hyundai I10",
    brand: "Hyundai",
    model: "Hyundai I10",
    year: 2024,
    carImage: "/images/hyundai i10 noire auto essence2024.webp",
    images: [
      { src: "/images/hyundai i10 noire auto essence2024.webp", alt: "Rolls Royce Ghost Front View", isPrimary: true },
      { src: "/images/hyundai i10 noire auto essence2024.webp", alt: "Rolls Royce Ghost Interior" },
      { src: "/images/hyundai i10 noire auto essence2024.webp", alt: "Rolls Royce Ghost Side View" }
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
    slug: 'kia-picanto-auto-essence-blanche-2024',
    carName: "Kia Picanto",
    brand: "Kia",
    model: "Kia Picanto",
    year: 2024,
    carImage: "/images/kia picanto auto essence blanche 2024.webp",
    images: [
      { src: "/images/kia picanto auto essence blanche 2024.webp", alt: "Kia Picanto Front View", isPrimary: true },
      { src: "/images/kia picanto auto essence blanche 2024.webp", alt: "Kia Picanto Interior" },
      { src: "/images/kia picanto auto essence blanche 2024.webp", alt: "McLaren 720S Side View" },
      { src: "/images/kia picanto auto essence blanche 2024.webp", alt: "Kia Picanto Side View" },
      { src: "/images/kia picanto auto essence blanche 2024.webp", alt: "Kia Picanto Dashboard" },
      { src: "/images/kia picanto auto essence blanche 2024.webp", alt: "Kia Picanto Dashboard" },
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
    slug: 'stepway-blanche-auto-essence',
    carName: "Stepway",
    brand: "Renault",
    model: "Stepway",
    year: 2024,
    carImage: "/images/stepway blanche auto essence.webp",
    images: [
      { src: "/images/stepway blanche auto essence.webp", alt: "Stepway Front View", isPrimary: true },
      { src: "/images/stepway blanche auto essence.webp", alt: "Stepway Interior" },
      { src: "/images/stepway blanche auto essence.webp", alt: "Stepway Side View" }
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
  },
  {
    id: 13,
    slug: 'stepway-gris-auto-essence',
    carName: "Stepway",
    brand: "Renault",
    model: "Stepway Gris",
    year: 2024,
    carImage: "/images/stepway gris auto essence.webp",
    images: [
      { src: "/images/stepway gris auto essence.webp", alt: "Stepway Gris Front View", isPrimary: true },
      { src: "/images/stepway gris auto essence.webp", alt: "Stepway Gris Interior" },
      { src: "/images/stepway gris auto essence.webp", alt: "Stepway Gris Side View" }
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
  },
  {
    id: 14,
    slug: 'touareg-auto-diesel-2025-blanche',
    carName: "Touareg",
    brand: "Volkswagen",
    model: "Touareg",
    year: 2024,
    carImage: "/images/Touareg auto diesel 2025 blanche.webp",
    images: [
      { src: "/images/Touareg auto diesel 2025 blanche.webp", alt: "Touareg Front View", isPrimary: true },
      { src: "/images/Touareg auto diesel 2025 blanche.webp", alt: "Touareg Interior" },
      { src: "/images/Touareg auto diesel 2025 blanche.webp", alt: "Touareg Side View" }
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
  },
  {
    id: 15,
    slug: 'dacia-logan-blanche-manuel-diesel-2025',
    carName: "Dacia Logan",
    brand: "Dacia",
    model: "Dacia Logan",
    year: 2024,
    carImage: "/images/__dacia logan blanche manuel diesel 2025.webp",
    images: [
      { src: "/images/__dacia logan blanche manuel diesel 2025.webp", alt: "Dacia Logan Front View", isPrimary: true },
      { src: "/images/__dacia logan blanche manuel diesel 2025.webp", alt: "Dacia Logan Interior" },
      { src: "/images/__dacia logan blanche manuel diesel 2025.webp", alt: "Dacia Logan Side View" }
    ],
    pricePerDay: 320,
    seats: 2,
    fuelType: "Diesel",
    transmission: "Manual",
    rating: 4.8,
    description: "The Aston Martin DB11 embodies British elegance and performance. With its stunning design and powerful V8 engine, it's the perfect grand tourer for discerning drivers.",
    features: [
      { icon: "🚗", name: "Seats", value: "2+2" },
      { icon: "⛽", name: "Fuel Type", value: "Diesel" },
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
  },
  {
    id: 16,
    slug: 'kia-sportage-2025-diesel-auto-gris',
    carName: "Kia Sportage",
    brand: "Kia",
    model: "Kia Sportage",
    year: 2024,
    carImage: "/images/kia sportage 2025 diesel auto gris.webp",
    images: [
      { src: "/images/kia sportage 2025 diesel auto gris.webp", alt: "Kia Sportage Front View", isPrimary: true },
      { src: "/images/kia sportage 2025 diesel auto gris.webp", alt: "Kia Sportage Interior" },
      { src: "/images/kia sportage 2025 diesel auto gris.webp", alt: "Kia Sportage Side View" }
    ],
    pricePerDay: 320,
    seats: 2,
    fuelType: "Diesel",
    transmission: "Automatic",
    rating: 4.8,
    description: "The Aston Martin DB11 embodies British elegance and performance. With its stunning design and powerful V8 engine, it's the perfect grand tourer for discerning drivers.",
    features: [
      { icon: "🚗", name: "Seats", value: "2+2" },
      { icon: "⛽", name: "Fuel Type", value: "Diesel" },
      { icon: "⚙️", name: "Transmission", value: "Automatic" },
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
    location: "Agadir, Morocco"
  },
  {
    id: 17,
    slug: 'kia-sportage-2025-diesel-auto-verte',
    carName: "Kia Sportage",
    brand: "Kia",
    model: "Kia Sportage",
    year: 2024,
    carImage: "/images/Kia sportage 2025 diesel auto verte.webp",
    images: [
      { src: "/images/Kia sportage 2025 diesel auto verte.webp", alt: "Kia Sportage Front View", isPrimary: true },
      { src: "/images/Kia sportage 2025 diesel auto verte.webp", alt: "Kia Sportage Interior" },
      { src: "/images/Kia sportage 2025 diesel auto verte.webp", alt: "Kia Sportage Side View" }
    ],
    pricePerDay: 320,
    seats: 2,
    fuelType: "Diesel",
    transmission: "Automatic",
    rating: 4.8,
    description: "The Aston Martin DB11 embodies British elegance and performance. With its stunning design and powerful V8 engine, it's the perfect grand tourer for discerning drivers.",
    features: [
      { icon: "🚗", name: "Seats", value: "2+2" },
      { icon: "⛽", name: "Fuel Type", value: "Diesel" },
      { icon: "⚙️", name: "Transmission", value: "Automatic" },
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
    location: "Agadir, Morocco"
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