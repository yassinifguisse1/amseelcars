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
    preview: "/images/touaregggg.webp",
    href: "/cars/audi"
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
    preview: "/images/clio-5-restylee-10.jpg",
    href: "/cars/ferrari"
  }
]

export function getAllBrands(): Brand[] {
  return sampleBrands
}

export function getBrandsByCategory(category: string): Brand[] {
  // For future categorization if needed
  return sampleBrands
} 