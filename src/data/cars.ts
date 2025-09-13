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
  category: 'luxury' | 'sports' | 'suv' | 'electric' | 'premium' | 'economy' | 'crossover'
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
    carImage: "/images/Bmw x3 pack M 2025 diesel vue devant amseel cars agadir maroc.webp",
    images: [
      { src: "/images/Bmw x3 pack M 2025 diesel vue devant amseel cars agadir maroc.webp", alt: "BMW X3 - vue avant", isPrimary: true },
      { src: "/images/Bmw x3 pack M 2025 diesel vue de côté view amseel cars agadir maroc.webp", alt: "BMW X3 - intérieur" },
      { src: "/images/Bmw x3 pack M 2025 diesel l'intérieure amseel cars agadir maroc.webp", alt: "BMW X3 - vue latérale" },
      { src: "/images/Bmw x3 pack M 2025 diesel intérieure image amseel cars agadir maroc.webp", alt: "BMW X3 - tableau de bord" },
      { src: "/images/Bmw x3 pack M 2025 diesel vue d'arrière amseel cars agadir maroc.webp", alt: "BMW X3 - vue arrière" }
    ],
    pricePerDay: 1400,
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
      { src: "/images/Golf 8 auto diesel 2024.webp", alt: "Volkswagen Golf 8 - vue avant", isPrimary: true },
      { src: "/images/Golf 8 auto diesel 2024.webp", alt: "Volkswagen Golf 8 - intérieur" },
      { src: "/images/Golf 8 auto diesel 2024.webp", alt: "Volkswagen Golf 8 - vue latérale" },
      { src: "/images/Golf 8 auto diesel 2024.webp", alt: "Volkswagen Golf 8 - tableau de bord" },
      { src: "/images/Golf 8 auto diesel 2024.webp", alt: "Volkswagen Golf 8 - vue arrière" }
    ],
    pricePerDay: 700,
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
    model: "T-Roc 1.5 TSI 150 BVM6",
    year: 2024,
    carImage: "/images/T roc automatique gris diesel 2024 vue de côté location de voiture agadir maroc amseel cars.webp",
    images: [
      { src: "/images/T roc automatique gris diesel 2024 vue de côté location de voiture agadir maroc amseel cars.webp", alt: "Volkswagen T-Roc - vue avant", isPrimary: true },
      { src: "/images/T roc automatique gris diesel 2024 vue devant location de voiture agadir maroc amseel cars.webp", alt: "Volkswagen T-Roc - vue latérale" },
      { src: "/images/inside-troc.webp", alt: "Volkswagen T-Roc - intérieur" },
      { src: "/images/inside-2-troc.webp", alt: "Volkswagen T-Roc - vue latérale" },
      { src: "/images/back-troc.jpeg", alt: "Volkswagen T-Roc - tableau de bord" },
      { src: "/images/side-troc.webp", alt: "Volkswagen T-Roc - détails habitacle" }
    ],
    pricePerDay: 600,
    seats: 5,
    fuelType: "Essence",
    transmission: "Manuelle",
    rating: 4.7,
    description: "Compact et technologique, le Volkswagen T-Roc 2024 en 1.5 TSI 150 ch (boîte manuelle 6 rapports) offre des performances équilibrées, une faible consommation et une excellente sécurité. Connectivité Apple CarPlay / Android Auto via App-Connect, aides à la conduite complètes et confort au quotidien — idéal pour Marrakech et ses environs.",
    features: [
      { icon: "🚗", name: "Sièges", value: "5" },
      { icon: "⛽", name: "Carburant", value: "Essence (1.5 TSI 150)" },
      { icon: "⚙️", name: "Boîte de vitesses", value: "Manuelle 6 rapports" },
      { icon: "🛡️", name: "Sécurité", value: "5 étoiles Euro NCAP (2017)" },
      { icon: "❄️", name: "Climatisation", value: "Bi-zone" },
      { icon: "📱", name: "Connectivité", value: "Apple CarPlay / Android Auto (App-Connect)" }
    ],
    specs: {
      engine: "1.5L TSI (ACT) 4 cylindres essence",
      horsepower: "150 ch",
      acceleration: "0–100 km/h en 8,6 s",
      topSpeed: "205 km/h",
      fuelEfficiency: "6,2 l/100 km (WLTP combiné)",
      drivetrain: "Traction (roues avant)"
    },
    category: 'premium',
    availability: true,
    location: "Marrakech, Maroc"
  },
  {
    id: 4,
    slug: 'clio-5-2024',
    carName: "Clio 5",
    brand: "Renault",
    model: "Clio 5 1.5 Blue dCi 100 BVM6",
    year: 2024,
    carImage: "/images/clio 5 gris manuel diesel 2024.webp",
    images: [
      { src: "/images/clio 5 gris manuel diesel 2024.webp", alt: "Renault Clio 5 - vue avant", isPrimary: true },
      { src: "/images/clio 5 gris manuel diesel 2024.webp", alt: "Renault Clio 5 - intérieur" },
      { src: "/images/clio 5 gris manuel diesel 2024.webp", alt: "Renault Clio 5 - vue latérale" }
    ],
    pricePerDay: 350,
    seats: 5,
    fuelType: "Diesel",
    transmission: "Manuelle 6 rapports",
    rating: 4.9,
    description: "La Renault Clio 5 (phase 2) en motorisation 1.5 Blue dCi 100 ch associe sobriété et agrément. Avec sa boîte manuelle à 6 rapports, ses aides à la conduite et la connectivité EASY LINK (Apple CarPlay/Android Auto), elle est parfaite pour la ville comme pour les trajets interurbains.",
    features: [
      { icon: "🚗", name: "Sièges", value: "5" },
      { icon: "⛽", name: "Carburant", value: "Diesel (Blue dCi 100)" },
      { icon: "🔄", name: "Boîte de vitesses", value: "Manuelle 6 rapports" },
      { icon: "🛡️", name: "Sécurité", value: "AEB, maintien de voie, reconnaissance panneaux (Euro NCAP 5★)" },
      { icon: "❄️", name: "Climatisation", value: "Manuelle" },
      { icon: "📱", name: "Connectivité", value: "Apple CarPlay / Android Auto (EASY LINK)" }
    ],
    specs: {
      engine: "1.5L Blue dCi (diesel) – 4 cylindres",
      horsepower: "101 ch",
      acceleration: "0–100 km/h en 11,4 s",
      topSpeed: "174 km/h",
      fuelEfficiency: "4,1 l/100 km (WLTP combiné)",
      drivetrain: "Traction (roues avant)"
    },
    category: 'economy',
    availability: true,
    location: "Casablanca, Maroc"
  }
  ,
  {
    id: 5,
    slug: 'clio-5-blanche-manuel-diesel-2024',
    carName: "Clio 5",
    brand: "Renault",
    model: "Clio 5 1.5 Blue dCi 100 BVM6",
    year: 2024,
    carImage: "/images/clio 5 automatique blanche essence 2025 vue devant location de voiture agadir maroc amseel cars.webp",
    images: [
      { src: "/images/clio 5 automatique blanche essence 2025 vue devant location de voiture agadir maroc amseel cars.webp", alt: "Renault Clio 5 - vue avant", isPrimary: true },
      { src: "/images/clio 5 automatique blanche essence 2025 vue d'arrière location de voiture agadir maroc amseel cars.webp", alt: "Renault Clio 5 - intérieur" },
      { src: "/images/clio 5 automatique blanche essence 2025 vue devant location de voiture agadir maroc amseelcars.webp", alt: "Renault Clio 5 - vue latérale" },
      { src: "/images/left)side-clio-5-white.webp", alt: "Renault Clio 5 - tableau de bord" },
      { src: "/images/inside-clio-5-white.webp", alt: "Renault Clio 5 - détails habitacle" }
    ],
    pricePerDay: 350,
    seats: 5,
    fuelType: "Diesel",
    transmission: "Manuelle 6 rapports",
    rating: 4.8,
    description: "Pratique et économique, la Renault Clio 5 (phase 2) en 1.5 Blue dCi 100 ch avec boîte manuelle 6 rapports offre une faible consommation, des aides à la conduite complètes et la connectivité EASY LINK (Apple CarPlay/Android Auto). Parfaite pour circuler à Agadir comme pour les trajets interurbains.",
    features: [
      { icon: "🚗", name: "Sièges", value: "5" },
      { icon: "⛽", name: "Carburant", value: "Diesel (Blue dCi 100)" },
      { icon: "⚙️", name: "Boîte de vitesses", value: "Manuelle 6 rapports" },
      { icon: "🛡️", name: "Sécurité", value: "AEB, maintien de voie, lecture panneaux (Euro NCAP 5★)" },
      { icon: "❄️", name: "Climatisation", value: "Manuelle" },
      { icon: "📱", name: "Connectivité", value: "Apple CarPlay / Android Auto (EASY LINK)" }
    ],
    specs: {
      engine: "1.5L Blue dCi (diesel) – 4 cylindres",
      horsepower: "101 ch",
      acceleration: "0–100 km/h en 11,4 s",
      topSpeed: "174 km/h",
      fuelEfficiency: "4,1 l/100 km (WLTP combiné)",
      drivetrain: "Traction (roues avant)"
    },
    category: 'economy',
    availability: true,
    location: "Agadir, Morocco"
  }
  ,
  {
    id: 6,
    slug: 'citroen-C4-2025',
    carName: "Citroen C4",
    brand: "Citroën",
    model: "C4 1.2 PureTech 130 EAT8",
    year: 2024,
    carImage: "/images/C4 auto essence 2025.webp",
    images: [
      { src: "/images/C4 auto essence 2025.webp", alt: "Citroën C4 - vue avant", isPrimary: true },
      { src: "/images/C4 auto essence 2025.webp", alt: "Citroën C4 - intérieur" },
      { src: "/images/C4 auto essence 2025.webp", alt: "Citroën C4 - vue latérale" },
      { src: "/images/C4 auto essence 2025.webp", alt: "Citroën C4 - tableau de bord" },
      { src: "/images/C4 auto essence 2025.webp", alt: "Citroën C4 - détails habitacle" }
    ],
    pricePerDay: 500,
    seats: 5,
    fuelType: "Essence",
    transmission: "Automatique EAT8",
    rating: 4.6,
    description: "Confortable et technologique, la Citroën C4 1.2 PureTech 130 ch avec boîte automatique EAT8 offre une conduite souple, une bonne efficience et une connectivité complète (Apple CarPlay / Android Auto sans fil). Idéale pour la ville de Fès comme pour les trajets interurbains.",
    features: [
      { icon: "🚗", name: "Sièges", value: "5" },
      { icon: "⛽", name: "Carburant", value: "Essence (PureTech 130)" },
      { icon: "⚙️", name: "Boîte de vitesses", value: "Automatique EAT8" },
      { icon: "🛡️", name: "Sécurité", value: "4 étoiles Euro NCAP (C4 2021)" },
      { icon: "❄️", name: "Climatisation", value: "Bi-zone (selon finition)" },
      { icon: "📱", name: "Connectivité", value: "Apple CarPlay / Android Auto sans fil" }
    ],
    specs: {
      engine: "1.2L PureTech turbo (3 cylindres, essence)",
      horsepower: "130 ch",
      acceleration: "0–100 km/h en 10,2 s",
      topSpeed: "200 km/h",
      fuelEfficiency: "5,9 l/100 km (WLTP combiné)",
      drivetrain: "Traction (roues avant)"
    },
    category: 'suv',
    availability: true,
    location: "Fez, Morocco"
  }
  ,
  {
    id: 7,
    slug: 'C3-aircross-blanche',
    carName: "C3 Aircross",
    brand: "Citroën",
    model: "C3 Aircross Hybrid 136 e-DSC6",
    year: 2024,
    carImage: "/images/C3 aircross blanche automatique diesel 2024 vue devant location de voiture agadir maroc amseel cars.webp",
    images: [
      { src: "/images/C3 aircross blanche automatique diesel 2024 vue devant location de voiture agadir maroc amseel cars.webp", alt: "Citroën C3 Aircross - vue avant", isPrimary: true },
      { src: "/images/clipboard-image-1757626620.webp", alt: "Citroën C3 Aircross - intérieur" },
      { src: "/images/clipboard-image-1757626720.webp", alt: "Citroën C3 Aircross - vue latérale" },
      { src: "/images/clipboard-image-1757626807.webp", alt: "Citroën C3 Aircross - tableau de bord" }
    ],
    pricePerDay: 300,
    seats: 5,
    fuelType: "Hybride (mild-hybrid 48V, essence)",
    transmission: "Automatique e-DSC6",
    rating: 5.0,
    description: "SUV compact confortable et polyvalent, la nouvelle Citroën C3 Aircross Hybrid 136 e-DSC6 offre une conduite souple, une faible consommation WLTP et une connectivité moderne (écran 10,25\" avec Apple CarPlay / Android Auto selon finition). Idéale pour la ville comme pour les trajets interurbains.",
    features: [
      { icon: "🚗", name: "Sièges", value: "5" },
      { icon: "⛽", name: "Carburant", value: "Hybride léger 48V (essence)" },
      { icon: "⚙️", name: "Boîte de vitesses", value: "Automatique e-DSC6" },
      { icon: "🛡️", name: "Aides à la conduite", value: "Freinage d’urgence, maintien de voie, régulateur" },
      { icon: "❄️", name: "Climatisation", value: "Automatique (selon finition)" },
      { icon: "📱", name: "Connectivité", value: "Apple CarPlay / Android Auto" }
    ],
    specs: {
      engine: "1.2L PureTech mild-hybrid (48V) – 3 cylindres",
      horsepower: "136 ch",
      acceleration: "0–100 km/h en 8,8 s",
      topSpeed: "192 km/h",
      fuelEfficiency: "5,6 l/100 km (WLTP)",
      drivetrain: "Traction (roues avant)"
    },
    category: 'suv',
    availability: true,
    location: "Casablanca, Morocco"
  }
  ,
  {
    id: 8,
    slug: 'C3-aircross-gris',
    carName: "C3 Aircross",
    brand: "Citroën",
    model: "C3 Aircross Hybrid 136 e-DSC6",
    year: 2024,
    carImage: "/images/C3 aircross gris.webp",
    images: [
      { src: "/images/C3 aircross gris.webp", alt: "Citroën C3 Aircross - vue avant", isPrimary: true },
      { src: "/images/C3 aircross gris.webp", alt: "Citroën C3 Aircross - intérieur" },
      { src: "/images/C3 aircross gris.webp", alt: "Citroën C3 Aircross - vue latérale" }
    ],
    pricePerDay: 350,
    seats: 5,
    fuelType: "Hybride (mild-hybrid 48V, essence)",
    transmission: "Automatique e-DSC6",
    rating: 5.0,
    description: "SUV compact confortable et polyvalent, la nouvelle C3 Aircross Hybrid 136 e-DSC6 offre une conduite souple, une faible consommation WLTP et une connectivité moderne (Apple CarPlay / Android Auto selon finition). Idéale pour la ville d’Agadir comme pour les trajets interurbains.",
    features: [
      { icon: "🚗", name: "Sièges", value: "5" },
      { icon: "⛽", name: "Carburant", value: "Hybride léger 48V (essence)" },
      { icon: "⚙️", name: "Boîte de vitesses", value: "Automatique e-DSC6" },
      { icon: "🛡️", name: "Aides à la conduite", value: "Freinage d’urgence, maintien de voie, régulateur" },
      { icon: "❄️", name: "Climatisation", value: "Automatique (selon finition)" },
      { icon: "📱", name: "Connectivité", value: "Apple CarPlay / Android Auto" }
    ],
    specs: {
      engine: "1.2L PureTech mild-hybrid (48V) – 3 cylindres",
      horsepower: "136 ch",
      acceleration: "0–60 mph en 8,8 s",
      topSpeed: "125 mph",
      fuelEfficiency: "5,6 l/100 km (WLTP)",
      drivetrain: "Traction (roues avant)"
    },
    category: 'sports',
    availability: true,
    location: "Agadir, Morocco"
  }
  ,
  {
    id: 9,
    slug: 'C3-normal-manuel-diesel-2024',
    carName: "C3 Normal",
    brand: "Citroën",
    model: "C3 BlueHDi 100 BVM6",
    year: 2024,
    carImage: "/images/C3 normal manuel diesel 2024 vue de face location de voiture agadir maroc amseel cars.webp",
    images: [
      { src: "/images/C3 normal manuel diesel 2024 vue de face location de voiture agadir maroc amseel cars.webp", alt: "Citroën C3 - vue avant", isPrimary: true },
      { src: "/images/C3 normal manuel diesel 2024 vue d'arrière location de voiture agadir maroc amseel cars.webp", alt: "Citroën C3 - intérieur" },
      { src: "/images/C3 normal manuel diesel 2024 vue coffre location de voiture agadir maroc amseel cars.webp", alt: "Citroën C3 - vue latérale" },
      { src: "/images/C3 normal manuel diesel 2024 intérieure location de voiture agadir maroc  amseel cars.webp", alt: "Citroën C3 - vue latérale" },
      { src: "/images/C3 normal manuel diesel 2024 vue de côté location de voiture agadir maroc amseel cars.webp", alt: "Citroën C3 - vue latérale" }
    ],
    pricePerDay: 350,
    seats: 5,
    fuelType: "Diesel",
    transmission: "Manuelle 6 rapports",
    rating: 4.7,
    description: "Citadine polyvalente et économique, la Citroën C3 BlueHDi 100 (BVM6) offre une consommation réduite, des aides à la conduite essentielles et une bonne connectivité (Apple CarPlay / Android Auto selon finition). Idéale pour la ville comme pour les trajets interurbains.",
    features: [
      { icon: "🚗", name: "Sièges", value: "5" },
      { icon: "⛽", name: "Carburant", value: "Diesel (BlueHDi 100)" },
      { icon: "⚙️", name: "Boîte de vitesses", value: "Manuelle 6 rapports" },
      { icon: "🛡️", name: "Sécurité", value: "Freinage d’urgence, maintien de voie" },
      { icon: "❄️", name: "Climatisation", value: "Manuelle (selon finition)" },
      { icon: "📱", name: "Connectivité", value: "Apple CarPlay / Android Auto" }
    ],
    specs: {
      engine: "1.5L BlueHDi (4 cylindres, diesel)",
      horsepower: "102 ch",
      acceleration: "0–100 km/h en 10,2 s",
      topSpeed: "188 km/h",
      fuelEfficiency: "4,4–4,5 l/100 km (WLTP)",
      drivetrain: "Traction (roues avant)"
    },
    category: 'economy',
    availability: true,
    location: "Casablanca, Morocco"
  }
  ,
  {
    id: 10,
    slug: 'hyundai-i10-noire-auto-essence-2024',
    carName: "Hyundai i10",
    brand: "Hyundai",
    model: "i10 1.0 MPi 63 BVR (AMT 5)",
    year: 2024,
    carImage: "/images/Hyundai i10 agadir.webp",
    images: [
      { src: "/images/Hyundai i10 agadir.webp", alt: "Hyundai i10 - vue avant", isPrimary: true },
      { src: "/images/right-side-hyondia-10.webp", alt: "Hyundai i10 - intérieur" },
      { src: "/images/back-htondia-i10.webp", alt: "Hyundai i10 - vue latérale" },
      { src: "/images/inside-hyondia-i10.webp", alt: "Hyundai i10 - vue latérale" }
    ],
    
    pricePerDay: 300,
    seats: 4,
    fuelType: "Essence",
    transmission: "Automatique (BVR 5 rapports)",
    rating: 5.0,
    description: "Citadine agile et économique, la Hyundai i10 1.0 MPi 63 ch avec boîte robotisée (BVR 5) est idéale pour la ville. Elle offre une faible consommation WLTP, les aides à la conduite essentielles et une connectivité moderne via écran 8\" (Apple CarPlay / Android Auto).",
    features: [
      { icon: "🚗", name: "Sièges", value: "4" },
      { icon: "⛽", name: "Carburant", value: "Essence (1.0 MPi 63 ch)" },
      { icon: "⚙️", name: "Boîte de vitesses", value: "Automatique BVR 5 (AMT)" },
      { icon: "🛡️", name: "Aides à la conduite", value: "Freinage d’urgence, maintien/suivi de voie" },
      { icon: "❄️", name: "Climatisation", value: "Manuelle (selon finition)" },
      { icon: "📱", name: "Connectivité", value: "Apple CarPlay / Android Auto (écran 8”)" }
    ],
    specs: {
      engine: "1.0L MPi (3 cylindres, essence)",
      horsepower: "63 ch",
      acceleration: "0–100 km/h en 18,4 s",
      topSpeed: "143 km/h",
      fuelEfficiency: "5,2–5,9 l/100 km (WLTP combiné)",
      drivetrain: "Traction (roues avant)"
    },
    category: 'economy',
    availability: true,
    location: "agadir, Morocco"
  }
  ,
  {
    id: 11,
    slug: 'kia-picanto-auto-essence-blanche-2024',
    carName: "Kia Picanto",
    brand: "Kia",
    model: "Picanto 1.0 MPi AMT (5 rapports)",
    year: 2024,
    carImage: "/images/kia picanto auto essence blanche 2024.webp",
    images: [
      { src: "/images/kia picanto auto essence blanche 2024.webp", alt: "Kia Picanto - vue avant", isPrimary: true },
      { src: "/images/kia picanto auto essence blanche 2024.webp", alt: "Kia Picanto - intérieur" },
      { src: "/images/kia picanto auto essence blanche 2024.webp", alt: "Kia Picanto - vue latérale" },
      { src: "/images/kia picanto auto essence blanche 2024.webp", alt: "Kia Picanto - tableau de bord" },
      { src: "/images/kia picanto auto essence blanche 2024.webp", alt: "Kia Picanto - détails habitacle" }
    ],
    pricePerDay: 300,
    seats: 5,
    fuelType: "Essence",
    transmission: "Automatique (AMT 5)",
    rating: 4.9,
    description: "Citadine agile et économique, la Kia Picanto 1.0 MPi avec boîte automatique robotisée (AMT 5) offre une consommation contenue, des aides à la conduite essentielles (freinage d’urgence, aide au maintien de voie) et une connectivité moderne via écran 8\" avec Apple CarPlay / Android Auto (selon finition).",
    features: [
      { icon: "🚗", name: "Sièges", value: "5" },
      { icon: "⛽", name: "Carburant", value: "Essence (1.0 MPi)" },
      { icon: "⚙️", name: "Boîte de vitesses", value: "Automatique AMT (5 rapports)" },
      { icon: "🛡️", name: "Sécurité", value: "AEB, maintien de voie (selon version)" },
      { icon: "❄️", name: "Climatisation", value: "Manuelle (selon finition)" },
      { icon: "📱", name: "Connectivité", value: "Apple CarPlay / Android Auto" }
    ],
    specs: {
      engine: "1.0L MPi (3 cylindres, essence)",
      horsepower: "63 ch",
      acceleration: "0–100 km/h en ~16,8 s",
      topSpeed: "145 km/h",
      fuelEfficiency: "≈ 5,5 l/100 km (WLTP combiné)",
      drivetrain: "Traction (roues avant)"
    },
    category: 'economy',
    availability: true,
    location: "Tangier, Morocco"
  }
  ,
  {
    id: 12,
    slug: 'stepway-blanche-auto-essence',
    carName: "Stepway",
    brand: "Dacia",
    model: "Sandero Stepway TCe 90 X-Tronic",
    year: 2024,
    carImage: "/images/stepway blanche auto essence.webp",
    images: [
      { src: "/images/stepway blanche auto essence.webp", alt: "Dacia Sandero Stepway - vue avant", isPrimary: true },
      { src: "/images/stepway blanche auto essence.webp", alt: "Dacia Sandero Stepway - intérieur" },
      { src: "/images/stepway blanche auto essence.webp", alt: "Dacia Sandero Stepway - vue latérale" }
    ],
    pricePerDay: 300,
    seats: 5,
    fuelType: "Essence",
    transmission: "Automatique (CVT X-Tronic)",
    rating: 4.8,
    description: "Crossover polyvalent et confortable, la Dacia Sandero Stepway TCe 90 X-Tronic (boîte CVT) offre une conduite souple, une consommation contenue et une connectivité moderne (Apple CarPlay / Android Auto selon finition). Idéale pour la ville comme pour les trajets interurbains à Casablanca.",
    features: [
      { icon: "🚗", name: "Sièges", value: "5" },
      { icon: "⛽", name: "Carburant", value: "Essence (1.0 TCe 90)" },
      { icon: "⚙️", name: "Boîte de vitesses", value: "Automatique CVT (X-Tronic)" },
      { icon: "🛡️", name: "Aides à la conduite", value: "Freinage d’urgence, maintien de voie" },
      { icon: "❄️", name: "Climatisation", value: "Manuelle/auto selon finition" },
      { icon: "📱", name: "Connectivité", value: "Apple CarPlay / Android Auto" }
    ],
    specs: {
      engine: "1.0L TCe turbo (3 cylindres, essence)",
      horsepower: "91 ch",
      acceleration: "0–100 km/h en 14,2 s",
      topSpeed: "163 km/h",
      fuelEfficiency: "5,8–6,2 l/100 km (WLTP combiné)",
      drivetrain: "Traction (roues avant)"
    },
    category: 'crossover',
    availability: true,
    location: "Casablanca, Morocco"
  }
  ,
  {
    id: 13,
    slug: 'stepway-gris-auto-essence',
    carName: "Stepway",
    brand: "Dacia",
    model: "Sandero Stepway TCe 90 X-Tronic",
    year: 2024,
    carImage: "/images/stepway gris auto essence.webp",
    images: [
      { src: "/images/stepway gris auto essence.webp", alt: "Dacia Sandero Stepway Gris - vue avant", isPrimary: true },
      { src: "/images/stepway gris auto essence.webp", alt: "Dacia Sandero Stepway Gris - intérieur" },
      { src: "/images/stepway gris auto essence.webp", alt: "Dacia Sandero Stepway Gris - vue latérale" }
    ],
    pricePerDay: 300,
    seats: 5,
    fuelType: "Essence",
    transmission: "Automatique (CVT X-Tronic)",
    rating: 4.8,
    description: "Crossover polyvalent et confortable, la Dacia Sandero Stepway TCe 90 X-Tronic offre une conduite souple, une consommation maîtrisée et une connectivité moderne (Apple CarPlay / Android Auto selon finition). Parfaite pour la ville comme pour les trajets interurbains à Casablanca.",
    features: [
      { icon: "🚗", name: "Sièges", value: "5" },
      { icon: "⛽", name: "Carburant", value: "Essence (1.0 TCe 90)" },
      { icon: "⚙️", name: "Boîte de vitesses", value: "Automatique CVT (X-Tronic)" },
      { icon: "🛡️", name: "Aides à la conduite", value: "Freinage d’urgence, maintien de voie" },
      { icon: "❄️", name: "Climatisation", value: "Manuelle/auto selon finition" },
      { icon: "📱", name: "Connectivité", value: "Apple CarPlay / Android Auto" }
    ],
    specs: {
      engine: "1.0L TCe turbo (3 cylindres, essence)",
      horsepower: "91 ch",
      acceleration: "0–100 km/h en 14,2 s",
      topSpeed: "163 km/h",
      fuelEfficiency: "5,8–6,2 l/100 km (WLTP combiné)",
      drivetrain: "Traction (roues avant)"
    },
    category: 'crossover',
    availability: true,
    location: "Casablanca, Morocco"
  }
  ,
  {
    id: 14,
    slug: 'touareg-auto-diesel-2025-blanche',
    carName: "Touareg",
    brand: "Volkswagen",
    model: "Touareg V6 TDI 286 4MOTION",
    year: 2024,
    carImage: "/images/Touareg auto diesel 2025 blanche.webp",
    images: [
      { src: "/images/Touareg auto diesel 2025 blanche.webp", alt: "Volkswagen Touareg - vue avant", isPrimary: true },
      { src: "/images/Touareg auto diesel 2025 blanche.webp", alt: "Volkswagen Touareg - intérieur" },
      { src: "/images/Touareg auto diesel 2025 blanche.webp", alt: "Volkswagen Touareg - vue latérale" }
    ],
    pricePerDay: 1100,
    seats: 5,
    fuelType: "Diesel",
    transmission: "Automatique Tiptronic 8",
    rating: 4.8,
    description: "SUV haut de gamme confortable et puissant, le Volkswagen Touareg V6 TDI 286 ch associe transmission intégrale 4MOTION, boîte automatique Tiptronic à 8 rapports et technologies de pointe (IQ.LIGHT HD Matrix, Innovision Cockpit 15\"). Idéal pour les longs trajets comme pour la ville.",
    features: [
      { icon: "🚗", name: "Sièges", value: "5" },
      { icon: "⛽", name: "Carburant", value: "Diesel V6 TDI" },
      { icon: "⚙️", name: "Boîte de vitesses", value: "Automatique Tiptronic 8" },
      { icon: "🧭", name: "Transmission", value: "4MOTION (intégrale)" },
      { icon: "💡", name: "Éclairage", value: "IQ.LIGHT HD Matrix" },
      { icon: "📱", name: "Connectivité", value: "Apple CarPlay / Android Auto" }
    ],
    specs: {
      engine: "3.0L V6 TDI",
      horsepower: "286 ch",
      acceleration: "0–100 km/h en 6,1 s",
      topSpeed: "235 km/h",
      fuelEfficiency: "8,0 l/100 km (WLTP, combiné)",
      drivetrain: "4MOTION (4 roues motrices)"
    },
    category: 'suv',
    availability: true,
    location: "Casablanca, Morocco"
  }
  ,
  {
    id: 15,
    slug: 'dacia-logan-blanche-manuel-diesel-2025',
    carName: "Dacia Logan",
    brand: "Dacia",
    model: "Logan 1.5 Blue dCi 95 BVM5",
    year: 2024,
    carImage: "/images/__dacia logan blanche manuel diesel 2025.webp",
    images: [
      { src: "/images/__dacia logan blanche manuel diesel 2025.webp", alt: "Dacia Logan - vue avant", isPrimary: true },
      { src: "/images/__dacia logan blanche manuel diesel 2025.webp", alt: "Dacia Logan - intérieur" },
      { src: "/images/__dacia logan blanche manuel diesel 2025.webp", alt: "Dacia Logan - vue latérale" }
    ],
    pricePerDay: 300,
    seats: 5,
    fuelType: "Diesel",
    transmission: "Manuelle 5 rapports",
    rating: 4.8,
    description: "Berline économique et spacieuse, la Dacia Logan 1.5 Blue dCi 95 ch (boîte manuelle 5 rapports) allie sobriété, fiabilité et coffre généreux (528 L). Équipements modernes selon finition : écran 8\" Media Display, aides à la conduite essentielles, et connectivité Apple CarPlay / Android Auto.",
    features: [
      { icon: "🚗", name: "Sièges", value: "5" },
      { icon: "⛽", name: "Carburant", value: "Diesel (Blue dCi 95)" },
      { icon: "⚙️", name: "Boîte de vitesses", value: "Manuelle 5 rapports" },
      { icon: "🛡️", name: "Sécurité", value: "ABS, ESP, aide au démarrage en côte" },
      { icon: "❄️", name: "Climatisation", value: "Manuelle (selon finition)" },
      { icon: "📱", name: "Connectivité", value: "Media Display 8\" (Apple CarPlay / Android Auto selon version)" }
    ],
    specs: {
      engine: "1.5L Blue dCi (4 cylindres, turbo diesel)",
      horsepower: "95 ch",
      acceleration: "0–100 km/h en 13,9 s",
      topSpeed: "172 km/h",
      fuelEfficiency: "4,1 l/100 km (mixte WLTP)",
      drivetrain: "Traction (roues avant)"
    },
    category: 'economy',
    availability: true,
    location: "Casablanca, Maroc"
  }
  ,
  {
    id: 16,
    slug: 'kia-sportage-2025-diesel-auto-gris',
    carName: "Kia Sportage",
    brand: "Kia",
    model: "Sportage 1.6 CRDi 136 DCT7",
    year: 2024,
    carImage: "/images/kia sportage 2025 diesel auto gris.webp",
    images: [
      { src: "/images/kia sportage 2025 diesel auto gris.webp", alt: "Kia Sportage - vue avant", isPrimary: true },
      { src: "/images/kia sportage 2025 diesel auto gris.webp", alt: "Kia Sportage - intérieur" },
      { src: "/images/kia sportage 2025 diesel auto gris.webp", alt: "Kia Sportage - vue latérale" }
    ],
    pricePerDay: 600,
    seats: 5,
    fuelType: "Diesel",
    transmission: "Automatique DCT 7",
    rating: 4.8,
    description: "SUV familial moderne, le Kia Sportage 1.6 CRDi 136 ch avec boîte automatique DCT à 7 rapports (2WD) offre confort, technologies utiles (écran 8\" avec Apple CarPlay/Android Auto selon finition) et sobriété au quotidien.",
    features: [
      { icon: "🚗", name: "Sièges", value: "5" },
      { icon: "⛽", name: "Carburant", value: "Diesel (1.6 CRDi 136)" },
      { icon: "⚙️", name: "Boîte de vitesses", value: "Automatique DCT 7" },
      { icon: "🛡️", name: "Sécurité", value: "6 airbags, ABS/ESC; AEB & maintien de voie selon finition" },
      { icon: "❄️", name: "Climatisation", value: "Semi-auto ou bi-zone (selon finition)" },
      { icon: "📱", name: "Connectivité", value: "Apple CarPlay / Android Auto" }
    ],
    specs: {
      engine: "1.6L CRDi (4 cylindres, turbo diesel)",
      horsepower: "136 ch",
      acceleration: "0–100 km/h en 11,4 s",
      topSpeed: "180 km/h",
      fuelEfficiency: "5,8 l/100 km (mixte, WLTP)",
      drivetrain: "Traction (2 roues motrices)"
    },
    category: 'suv',
    availability: true,
    location: "Agadir, Morocco"
  }
  ,
  {
    id: 17,
    slug: 'kia-sportage-2025-diesel-auto-verte',
    carName: "Kia Sportage",
    brand: "Kia",
    model: "Sportage 1.6 CRDi 136 DCT7",
    year: 2024,
    carImage: "/images/Kia sportage 2025 diesel auto verte.webp",
    images: [
      { src: "/images/Kia sportage 2025 diesel auto verte.webp", alt: "Kia Sportage - vue avant", isPrimary: true },
      { src: "/images/Kia sportage 2025 diesel auto verte.webp", alt: "Kia Sportage - intérieur" },
      { src: "/images/Kia sportage 2025 diesel auto verte.webp", alt: "Kia Sportage - vue latérale" }
    ],
    pricePerDay: 600,
    seats: 5,
    fuelType: "Diesel",
    transmission: "Automatique DCT 7",
    rating: 4.8,
    description: "SUV familial moderne, le Kia Sportage 1.6 CRDi 136 ch (mild-hybrid 48V) avec boîte automatique DCT à 7 rapports offre confort, technologies utiles (Apple CarPlay/Android Auto selon finition) et sobriété au quotidien.",
    features: [
      { icon: "🚗", name: "Sièges", value: "5" },
      { icon: "⛽", name: "Carburant", value: "Diesel (1.6 CRDi 136 MHEV)" },
      { icon: "⚙️", name: "Boîte de vitesses", value: "Automatique DCT 7" },
      { icon: "🛡️", name: "Sécurité", value: "Freinage d’urgence, maintien de voie (selon finition)" },
      { icon: "❄️", name: "Climatisation", value: "Manuelle/bi-zone (selon finition)" },
      { icon: "📱", name: "Connectivité", value: "Apple CarPlay / Android Auto" }
    ],
    specs: {
      engine: "1.6L CRDi (4 cyl., turbo diesel, mild-hybrid 48V)",
      horsepower: "136 ch",
      acceleration: "0–100 km/h en 11,4 s",
      topSpeed: "180 km/h",
      fuelEfficiency: "5,6 l/100 km (WLTP combiné)",
      drivetrain: "Traction (2 roues motrices)"
    },
    category: 'suv',
    availability: true,
    location: "Agadir, Morocco"
  }
  ,
  {
    id: 18,
    slug: 'clio-5-auto-blanche-essence-2025',
    carName: "Clio 5",
    brand: "Renault",
    model: "Clio 5 1.5 Blue dCi 100 BVM6",
    year: 2024,
    carImage: "/images/clio 5 auto blanche essence 2025.webp",
    images: [
      { src: "/images/clio 5 auto blanche essence 2025.webp", alt: "Clio 5 - vue avant", isPrimary: true },
      { src: "/images/clio 5 auto blanche essence 2025.webp", alt: "Clio 5 - intérieur" },
      { src: "/images/clio 5 auto blanche essence 2025.webp", alt: "Clio 5 - vue latérale" }
    ],
    pricePerDay: 350,
    seats: 5,
    fuelType: "Diesel",
    transmission: "Automatique DCT 7",
    rating: 4.8,
    description: "SUV familial moderne, le Clio 5 1.5 Blue dCi 100 ch (mild-hybrid 48V) avec boîte automatique DCT à 7 rapports offre confort, technologies utiles (Apple CarPlay/Android Auto selon finition) et sobriété au quotidien.",
    features: [
      { icon: "🚗", name: "Sièges", value: "5" },
      { icon: "⛽", name: "Carburant", value: "Diesel (1.6 CRDi 136 MHEV)" },
      { icon: "⚙️", name: "Boîte de vitesses", value: "Automatique DCT 7" },
      { icon: "🛡️", name: "Sécurité", value: "Freinage d’urgence, maintien de voie (selon finition)" },
      { icon: "❄️", name: "Climatisation", value: "Manuelle/bi-zone (selon finition)" },
      { icon: "📱", name: "Connectivité", value: "Apple CarPlay / Android Auto" }
    ],
    specs: {
      engine: "1.6L CRDi (4 cyl., turbo diesel, mild-hybrid 48V)",
      horsepower: "136 ch",
      acceleration: "0–100 km/h en 11,4 s",
      topSpeed: "180 km/h",
      fuelEfficiency: "5,6 l/100 km (WLTP combiné)",
      drivetrain: "Traction (2 roues motrices)"
    },
    category: 'suv',
    availability: true,
    location: "Agadir, Morocco"
  } ,
  {
    id: 19,
    slug: 'kia-picanto-auto-essence-blanche-2025',
    carName: "Kia Picanto",
    brand: "Kia",
    model: "Kia Picanto 1.0 GDI 66 AMT",
    year: 2024,
    carImage: "/images/kia picanto auto essence blanche 2025.webp",
    images: [
      { src: "/images/kia picanto auto essence blanche 2025.webp", alt: "Kia Picanto - vue avant", isPrimary: true },
      { src: "/images/kia picanto auto essence blanche 2025.webp", alt: "Kia Picanto - intérieur" },
      { src: "/images/kia picanto auto essence blanche 2025.webp", alt: "Kia Picanto - vue latérale" }
    ],
    pricePerDay: 300,
    seats: 5,
    fuelType: "Essence",
    transmission: "Automatique AMT 7",
    rating: 4.8,
    description: "SUV familial moderne, le Kia Picanto 1.0 GDI 66 ch (mild-hybrid 48V) avec boîte automatique DCT à 7 rapports offre confort, technologies utiles (Apple CarPlay/Android Auto selon finition) et sobriété au quotidien.",
    features: [
      { icon: "🚗", name: "Sièges", value: "5" },
      { icon: "⛽", name: "Carburant", value: "Essence (1.0 GDI 66)" },
      { icon: "⚙️", name: "Boîte de vitesses", value: "Automatique DCT 7" },
      { icon: "🛡️", name: "Sécurité", value: "Freinage d’urgence, maintien de voie (selon finition)" },
      { icon: "❄️", name: "Climatisation", value: "Manuelle/bi-zone (selon finition)" },
      { icon: "📱", name: "Connectivité", value: "Apple CarPlay / Android Auto" }
    ],
    specs: {
      engine: "1.6L CRDi (4 cyl., turbo diesel, mild-hybrid 48V)",
      horsepower: "136 ch",
      acceleration: "0–100 km/h en 11,4 s",
      topSpeed: "180 km/h",
      fuelEfficiency: "5,6 l/100 km (WLTP combiné)",
      drivetrain: "Traction (2 roues motrices)"
    },
    category: 'suv',
    availability: true,
    location: "Agadir, Morocco"
  },
  {
    id: 20,
    slug: 'kia-picanto-auto-essence-blue-2025',
    carName: "Kia Picanto",
    brand: "Kia",
    model: "Kia Picanto 1.0 GDI 66 AMT",
    year: 2024,
    carImage: "/images/kia picanto blue automatique essence 2025 vue devant location de voiture agadir maroc amseel cars.webp",
    images: [
      { src: "/images/kia picanto blue automatique essence 2025 vue devant location de voiture agadir maroc amseel cars.webp", alt: "Kia Picanto - vue avant", isPrimary: true },
      { src: "/images/kia picanto blue automatique essence 2025 vue arrière coffre location de voiture agadir maroc amseel cars.webp", alt: "Kia Picanto - intérieur" },
      { src: "/images/kia picanto blue automatique essence 2025 vue arrière location de voiture agadir maroc amseel cars.webp", alt: "Kia Picanto - vue latérale" },
      { src: "/images/kia picanto blue automatique essence 2025 vue de côté location de voiture agadir maroc amseel cars.webp", alt: "Kia Picanto - vue latérale" },
      { src: "/images/kia picanto blue automatique essence 2025 vue d'intérieure location de voiture agadir maroc amseel cars.webp", alt: "Kia Picanto - vue latérale" },
    ],
    pricePerDay: 300,
    seats: 5,
    fuelType: "Essence",
    transmission: "Automatique AMT 7",
    rating: 4.8,
    description: "SUV familial moderne, le Kia Picanto 1.0 GDI 66 ch (mild-hybrid 48V) avec boîte automatique DCT à 7 rapports offre confort, technologies utiles (Apple CarPlay/Android Auto selon finition) et sobriété au quotidien.",
    features: [
      { icon: "🚗", name: "Sièges", value: "5" },
      { icon: "⛽", name: "Carburant", value: "Essence (1.0 GDI 66)" },
      { icon: "⚙️", name: "Boîte de vitesses", value: "Automatique DCT 7" },
      { icon: "🛡️", name: "Sécurité", value: "Freinage d’urgence, maintien de voie (selon finition)" },
      { icon: "❄️", name: "Climatisation", value: "Manuelle/bi-zone (selon finition)" },
      { icon: "📱", name: "Connectivité", value: "Apple CarPlay / Android Auto" }
    ],
    specs: {
      engine: "1.6L CRDi (4 cyl., turbo diesel, mild-hybrid 48V)",
      horsepower: "136 ch",
      acceleration: "0–100 km/h en 11,4 s",
      topSpeed: "180 km/h",
      fuelEfficiency: "5,6 l/100 km (WLTP combiné)",
      drivetrain: "Traction (2 roues motrices)"
    },
    category: 'suv',
    availability: true,
    location: "Agadir, Morocco"
  },
  {
    id: 21,
    slug: 'kia-picanto-auto-essence-gris-2025',
    carName: "Kia Picanto",
    brand: "Kia",
    model: "Kia Picanto 1.0 GDI 66 AMT",
    year: 2024,
    carImage: "/images/kia picanto automatique essence gris 2025 vue devant location de voiture agadir maroc amseel cars.webp",
    images: [
      { src: "/images/kia picanto automatique essence gris 2025 vue devant location de voiture agadir maroc amseel cars.webp", alt: "Kia Picanto - vue avant", isPrimary: true },
      { src: "/images/kia picanto automatique essence gris 2025 vue d'arrière location de voiture agadir maroc amseel cars.webp", alt: "Kia Picanto - intérieur" },
      { src: "/images/kia picanto automatique essence gris 2025 vue de côté location de voiture agadir maroc amseel cars.webp", alt: "Kia Picanto - vue latérale" },
      { src: "/images/kia picanto automatique essence gris 2025 vue d'intérieure location de voiture agadir maroc amseel cars.webp", alt: "Kia Picanto - vue latérale" },
      { src: "/images/kia picanto automatique essence gris 2025 vue de l'intérieure location de voiture agadir maroc amseel cars.webp", alt: "Kia Picanto - vue latérale" },
    ],
    pricePerDay: 300,
    seats: 5,
    fuelType: "Essence",
    transmission: "Automatique AMT 7",
    rating: 4.8,
    description: "SUV familial moderne, le Kia Picanto 1.0 GDI 66 ch (mild-hybrid 48V) avec boîte automatique DCT à 7 rapports offre confort, technologies utiles (Apple CarPlay/Android Auto selon finition) et sobriété au quotidien.",
    features: [
      { icon: "🚗", name: "Sièges", value: "5" },
      { icon: "⛽", name: "Carburant", value: "Essence (1.0 GDI 66)" },
      { icon: "⚙️", name: "Boîte de vitesses", value: "Automatique DCT 7" },
      { icon: "🛡️", name: "Sécurité", value: "Freinage d’urgence, maintien de voie (selon finition)" },
      { icon: "❄️", name: "Climatisation", value: "Manuelle/bi-zone (selon finition)" },
      { icon: "📱", name: "Connectivité", value: "Apple CarPlay / Android Auto" }
    ],
    specs: {
      engine: "1.6L CRDi (4 cyl., turbo diesel, mild-hybrid 48V)",
      horsepower: "136 ch",
      acceleration: "0–100 km/h en 11,4 s",
      topSpeed: "180 km/h",
      fuelEfficiency: "5,6 l/100 km (WLTP combiné)",
      drivetrain: "Traction (2 roues motrices)"
    },
    category: 'suv',
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