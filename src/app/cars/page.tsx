import { Suspense } from 'react'
import CarGridSection from '@/components/Cars/CarGridSection'
import Footer from '@/components/Footer/Footer'
import ParallexCards from '@/components/Cars/ParallexCards/ParallexCards'
import HeroVideo from '@/components/Cars/HeroVedio/HeroVideo'
import Script from 'next/script'
import { Metadata } from 'next';
import { generateBreadcrumbSchema } from '@/lib/schemas';

export const metadata: Metadata = {
  title: "Voitures de location à Agadir – Tarifs & Disponibilités",
  description:
    "Découvrez notre flotte: citadines, SUV et premium. Retrait/retour à l’aéroport d’Agadir ou en ville. Réservation rapide par WhatsApp.",
  alternates: { canonical: "/cars" },
  openGraph: {
    images: ["/og/og-default.jpg"], // put a specific OG image if you have one
  },
};


export default function CarsPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Cars', url: '/cars' },
  ]);

  return (
    <>
      {/* Breadcrumb Schema */}
      <Script
        id="ld-json-breadcrumb-cars"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    <div>
      <HeroVideo/>
      <Suspense fallback={
        <div 
          className="min-h-[min(60vh,28rem)] bg-neutral-950 flex items-center justify-center"
          role="status"
          aria-label="Loading cars"
        >
          <span className="sr-only">Loading cars...</span>
        </div>
      }>
        <CarGridSection />
      </Suspense>
      <ParallexCards />
      <Footer />
    </div>
    </>
  )
}