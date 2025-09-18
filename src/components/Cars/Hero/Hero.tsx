import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'
import './style.css'
import TextHover from './TextHover'
import OurBrandsGrid from '@/components/about/Hero/OurBrandsGrid'
import { sampleBrands } from '@/data/brands'
import SplitingText from '@/components/about/SplitingText/SplitingText'
import SplitContentSection from '@/components/about/SplitContentSection/SplitContentSection'

const Hero = () => {
  const revealerRef = useRef<HTMLDivElement>(null)
  const revealer1Ref = useRef<HTMLDivElement>(null)
  const revealer2Ref = useRef<HTMLDivElement>(null)
  const pinnedRef = useRef<HTMLElement>(null)
  const headerInfoRef = useRef<HTMLElement>(null)
  const whitespaceRef = useRef<HTMLElement>(null)
  

  useEffect(() => {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger)

    // Initialize Lenis smooth scroll
    const lenis = new Lenis()

    lenis.on("scroll", ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)

    // Pin the "pinned" section
    ScrollTrigger.create({
      trigger: pinnedRef.current,
      start: "top top",
      endTrigger: whitespaceRef.current,
      end: "bottom top",
      pin: true,
      pinSpacing: false,
    })

    // Pin the "header-info" section
    ScrollTrigger.create({
      trigger: headerInfoRef.current,
      start: "top top",
      endTrigger: whitespaceRef.current,
      end: "bottom top",
      pin: true,
      pinSpacing: false,
    })

    // Rotate revealer based on scroll progress
    ScrollTrigger.create({
      trigger: pinnedRef.current,
      start: "top top",
      endTrigger: headerInfoRef.current,
      end: "bottom bottom",
      onUpdate: (self) => {
        const rotation = self.progress * 360
        gsap.to(revealerRef.current, { rotation })
      }
    })

    // Animate clip-path of revealer elements
    ScrollTrigger.create({
      trigger: pinnedRef.current,
      start: "top top",
      endTrigger: headerInfoRef.current,
      end: "bottom bottom",
      onUpdate: (self) => {
        const progress = self.progress
        const clipPath = `polygon(
          ${30 - 30 * progress}% ${0 + 0 * progress}%, 
          ${70 + 30 * progress}% ${0 + 0 * progress}%,
          ${70 + 30 * progress}% ${100 - 0 * progress}%,
          ${30 - 30 * progress}% ${100 - 0 * progress}%
        )`

        gsap.to([revealer1Ref.current, revealer2Ref.current], {
          clipPath: clipPath,
          ease: "none",
          duration: 0,
        })
      }
    })

    // Move revealer left position
    ScrollTrigger.create({
      trigger: headerInfoRef.current,
      start: "top top",
      end: "bottom 50%",
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress
        const left = 35 + 15 * progress
        gsap.to(revealerRef.current, {
          left: `${left}%`,
          ease: "none",
          duration: 0,
        })
      }
    })

       // Scale revealer
   ScrollTrigger.create({
     trigger: whitespaceRef.current,
     start: "top 60%",
     end: "+=400",
     scrub: 0.2,
     onUpdate: (self) => {
        
        const scaleX = 1 + 19 * Math.pow(self.progress, 0.75);
        const scaleY = 1 + 15 * Math.pow(self.progress, 0.75);
       gsap.set(revealerRef.current, {
        transformOrigin: "50% 50%",
           scaleX,
           scaleY,
            //    ease: "none",
            //    duration: 0,
         
       })
     }
   })

    // Cleanup function
    return () => {
      lenis.destroy()
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000)
      })
    }
  }, [])

  return (
    <div>
        <section className="hero">
            <video 
                className="hero-video" 
                autoPlay 
                muted 
                loop 
                playsInline
            >
                <source src="/video/cardri.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            {/* <h2 className='uppercase font-bold text-white'>
                Symphonia
            </h2> */}
        </section>
        <section className="info">
            <div className='header-rows w-full'>
                <div className='header-row flex justify-start items-center'>
                    <h2 className='flex justify-start items-center'>
                        Amseel
                    </h2>
                </div>
                <div className="header-row flex justify-end items-center">
                    <h2>
                        Cars
                    </h2>
                </div>
            </div>
        </section>
        <section className="header-info" ref={headerInfoRef}>
            <p >
            Amceel Car : réservation rapide, retrait aéroport/centre-ville, prix transparents et assistance 24/7 pour voyager partout au Maroc.
            </p>
           
        </section>
        <section className="whitespace " ref={whitespaceRef}></section>
        <section className="pinned" ref={pinnedRef}>
            <div className="revealer " ref={revealerRef}>
                <div className="revealer-1" ref={revealer1Ref}></div>
                <div className="revealer-2" ref={revealer2Ref}></div>
            </div>
        </section>
        <section className="website-content">
            <TextHover />
            <OurBrandsGrid brands={sampleBrands} />
            <SplitingText />
            
           
            <SplitContentSection
                image={{
                    src: "/images/amseelcars-logo-apropos.jpg",
                    alt: "Luxury car interior detail"
                }}
                content={{
                    title: "À propos d’Amseel Cars",
                    paragraphs: [
                        "Chez Amseel Cars, nous ne nous contentons pas de vous transporter — nous créons des expériences. Animés par la passion de l’excellence automobile, nous évoluons aux frontières du luxe, repoussant les limites de la location de voitures haut de gamme.",
                        "Nous ne sommes pas là pour proposer des trajets ordinaires. Nous sommes là pour créer des voyages qui vous captivent du début à la fin. C’est pourquoi nous avons constitué une flotte d’exception, servi des milliers de clients satisfaits et établi des partenariats avec des marques premium à travers le Maroc.",
                        "Amseel Cars, c’est l’endroit où le luxe rencontre la fiabilité : des véhicules d’exception, un service professionnel et des expériences inoubliables. Nous ne faisons pas que répondre aux attentes, nous les dépassons à chaque fois. Sans exception.",
                        "Nous apportons l’excellence automobile à Agadir et au-delà. Chaque véhicule, chaque service, est entretenu avec le plus grand soin, car l’ordinaire ne suffit pas. Nous sommes là pour rendre votre voyage exceptionnel. Chez Amseel Cars, nous ne faisons pas que déplacer des personnes nous créons des souvenirs. C’est notre métier."
                    ]
                }}
                backgroundColor="#000000"
                textColor="#ffffff"
            />
            
            <SplitContentSection
                image={{
                    src: "/images/banner-5.jpg",
                    alt: "Expérience de flotte haut de gammer"
                }}
                content={{
                    title: "Premium Fleet Experience",
                    paragraphs: [
                        "Vivez un luxe réinventé grâce à notre flotte soigneusement sélectionnée de véhicules premium. Chaque voiture de notre collection incarne le summum de l’excellence automobile, alliant technologies de pointe et design intemporel.",
                        "Des transferts aéroport aux occasions spéciales, nos véhicules sont entretenus avec un soin méticuleux pour que votre trajet soit aussi mémorable que votre destination. Nous ne vous offrons pas seulement un moyen de transport, mais une expérience qui sublime chaque instant.",
                        "Notre engagement envers l’excellence dépasse le simple véhicule : chauffeurs professionnels, réservation fluide et assistance client 24h/24 et 7j/7 vous assurent une tranquillité d’esprit totale tout au long de votre location."
                    ]
                }}
                backgroundColor="#000000"
                textColor="#ffffff"
            />
        
        </section>
    </div>
  )
}

export default Hero