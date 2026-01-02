import { Brand } from '@/components/about/Hero/OurBrandsGrid'

export const sampleBrands: Brand[] = [
  {
    name: "BMW",
    logo: "/images/BMW.webp",
    preview: "/images/Bmw x3 pack M 2025 diesel vue devant amseel cars agadir maroc.webp",
    href: "/cars/bmw-x3-pack-m"
  },
  {
    name: "DACIA",
    logo: "/images/Dacia.webp", 
    preview: "/images/dacia logan blanche manuel diesel 2025 vue devant location de voiture agadir maroc amseel cars.webp",
    href: "/cars/dacia-logan"
  },
  {
    name: "VOLKSWAGEN",
    logo: "/images/VOLKSWAGEN.webp",
    preview: "/images/T roc automatique gris diesel 2024 vue de côté location de voiture agadir maroc amseel cars.webp",
    href: "/cars/t-roc"
  },
  {
    name: "HYUNDAI",
    logo: "/images/HYUNDAI.webp",
    preview: "/images/hyundai10.webp", 
    href: "/cars/hyundai-i10"
  },
  {
    name: "KIA",
    logo: "/images/KIA.webp",
    preview: "/images/kia.jpg",
    href: "/cars/kia-sportage-vert"
  },

  {
    name: "RENAULT",
    logo: "/images/RENAULT.webp",
    preview: "/images/clio 5 blanche manuel diesel 2024.webp",
    href: "/cars/clio-5-blanche"
  },
  {
    name: "CITROËN",
    logo: "/images/Citroen-Logo.webp",
    preview: "/images/C4 auto essence 2025.webp",
    href: "/cars/citroen-c4"
  }
]

export function getAllBrands(): Brand[] {
  return sampleBrands
}
