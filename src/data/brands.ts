import { Brand } from '@/components/about/Hero/OurBrandsGrid'

export const sampleBrands: Brand[] = [
  {
    name: "BMW",
    logo: "/images/bmw.webp",
    preview: "/images/bmwx3.webp",
    href: "/cars/bmw"
  },
  {
    name: "DACIA",
    logo: "/images/Dacia.webp", 
    preview: "/images/2.jpeg",
    href: "/cars/mercedes"
  },
  {
    name: "VOLKSWAGEN",
    logo: "/images/VOLKSWAGEN.webp",
    preview: "/images/T roc auto diesel 2024 gris.webp",
    href: "/cars/T-Roc-2024"
  },
  {
    name: "HYUNDAI",
    logo: "/images/HYUNDAI.webp",
    preview: "/images/hyundai10.webp", 
    href: "/cars/tesla"
  },
  {
    name: "KIA",
    logo: "/images/KIA.webp",
    preview: "/images/kia.jpg",
    href: "/cars/porsche"
  },
  {
    name: "FORD",
    logo: "/images/FORD.webp",
    preview: "/images/kia.jpg",
    href: "/cars/landrover"
  },
  {
    name: "RENAULT",
    logo: "/images/RENAULT.webp",
    preview: "/images/clio 5 blanche manuel diesel 2024.webp",
    href: "/cars/clio-5-blanche-manuel-diesel-2024"
  },
  {
    name: "CITROËN",
    logo: "/images/Citroen-Logo.webp",
    preview: "/images/C4 auto essence 2025.webp",
    href: "/cars/citroen-C4-2025"
  }
]

export function getAllBrands(): Brand[] {
  return sampleBrands
}

export function getBrandsByCategory(category: string): Brand[] {
  // For future categorization if needed
  return sampleBrands
} 