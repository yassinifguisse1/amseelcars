import { Brand } from '@/components/about/Hero/OurBrandsGrid'

export const sampleBrands: Brand[] = [
  {
    name: "BMW",
    logo: "https://amseelcars.com/wp-content/uploads/2025/03/bmw-01.svg",
    preview: "/images/bmwx3.webp",
    href: "/cars/bmw"
  },
  {
    name: "DACIA",
    logo: "https://amseelcars.com/wp-content/uploads/2025/03/dacia-01.svg", 
    preview: "/images/2.jpeg",
    href: "/cars/mercedes"
  },
  {
    name: "VOLKSWAGEN",
    logo: "https://amseelcars.com/wp-content/uploads/2025/03/Volkswagen-01.svg",
    preview: "/images/touaregggg.webp",
    href: "/cars/audi"
  },
  {
    name: "HYUNDAI",
    logo: "https://amseelcars.com/wp-content/uploads/2025/03/Hyundai-01.svg",
    preview: "/images/hyundai10.webp", 
    href: "/cars/tesla"
  },
  {
    name: "KIA",
    logo: "https://amseelcars.com/wp-content/uploads/2025/03/kia-01.svg",
    preview: "/images/kia.jpg",
    href: "/cars/porsche"
  },
  {
    name: "FORD",
    logo: "https://amseelcars.com/wp-content/uploads/2025/03/ford-01.svg",
    preview: "/images/kia.jpg",
    href: "/cars/landrover"
  },
  {
    name: "RENAULT",
    logo: "https://amseelcars.com/wp-content/uploads/2025/03/renault-01.svg",
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