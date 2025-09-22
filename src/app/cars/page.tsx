
import CarGridSection from '@/components/Cars/CarGridSection'
import Footer from '@/components/Footer/Footer'
import ParallexCards from '@/components/Cars/ParallexCards/ParallexCards'
import HeroVideo from '@/components/Cars/HeroVedio/HeroVideo'

export default function CarsPage() {

  return (
    <div>
     
      <HeroVideo/>
      <CarGridSection />
      <ParallexCards />
      <Footer />
    </div>
  )
}