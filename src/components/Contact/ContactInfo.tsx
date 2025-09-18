"use client"
import React, { useRef, useEffect, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Instagram,
  Car,
  Shield,
  Star,
  Users
} from 'lucide-react'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

// Google Maps configuration
const mapContainerStyle = {
  width: '100%',
  height: '400px'
}

const center = {
  lat: 30.4007408, // Amseel Cars location in Agadir
  lng: -9.577593
}

const mapOptions = {
  mapTypeId: 'terrain',
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
  fullscreenControl: true,
  mapTypeControl: true,
  mapTypeControlOptions: {
    style: 1, // HORIZONTAL_BAR
    position: 3 // TOP_RIGHT
  }
}

interface ContactDetail {
  icon: React.ReactNode
  title: string
  info: string[]
  link?: string
}

interface SocialLink {
  icon: React.ReactNode
  name: string
  url: string
  color: string
}

const ContactInfo: React.FC = () => {
  // Refs for GSAP animations
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])
  const socialRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  // Google Maps state
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [showInfoWindow, setShowInfoWindow] = useState(false)

  // Add card ref to array
  const addCardRef = (el: HTMLDivElement | null) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el)
    }
  }

  // Google Maps callbacks
  const onMapLoad = useCallback(() => {
    setMapLoaded(true)
    setMapError(false)
  }, [])

  const onMapError = useCallback(() => {
    setMapError(true)
    setMapLoaded(false)
  }, [])


  const onMarkerClick = useCallback(() => {
    setShowInfoWindow(true)
  }, [])

  const onInfoWindowClose = useCallback(() => {
    setShowInfoWindow(false)
  }, [])

  // Contact details data
  const contactDetails: ContactDetail[] = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Whatsapp",
      info: ["+212 662 500 181"],
      link: "https://wa.me/212662500181"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email",
      info: ["amseelcars5@gmail.com"],
      link: "mailto:amseelcars5@gmail.com"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Adresse",
      info: ["Haut founty rdc imm sinwan, Agadir 80000, Maroc"],
      link: "https://www.google.com/maps/place/Amseel+cars/@30.4007453,-9.5824693,17z/data=!3m1!4b1!4m6!3m5!1s0xdb3b76e940846e9:0x4fa73710c2ac5d92!8m2!3d30.4007408!4d-9.577593!16s%2Fg%2F11w7lk46s0?entry=ttu&g_ep=EgoyMDI1MDkwOS4wIKXMDSoASAFQAw%3D%3D"
    }
  ]

  // Social media links
  const socialLinks: SocialLink[] = [
    {
      icon: <Facebook className="w-5 h-5" />,
      name: "Facebook",
      url: "https://www.facebook.com/amseelcars/",
      color: "#1877f2"
    },
    {
      icon: <Instagram className="w-5 h-5" />,
      name: "Instagram",
      url: "https://www.instagram.com/amseelcars/",
      color: "#e4405f"
    },
   
   
   
  ]

  // Stats data
  const stats = [
    { icon: <Car className="w-8 h-8" />, value: "30+", label: "Voitures de luxe" },
    { icon: <Users className="w-8 h-8" />, value: "1000+", label: "Clients Satisfaits" },
    { icon: <Star className="w-8 h-8" />, value: "4.9", label: "Note Moyenne" },
    { icon: <Shield className="w-8 h-8" />, value: "24/7", label: "Assistance" }
  ]

  // GSAP animations setup
  useEffect(() => {
    const container = containerRef.current
    const cards = cardsRef.current
    const social = socialRef.current
    const statsContainer = statsRef.current

    if (!container || !cards.length) return

    // Initial setup - hide elements
    gsap.set(cards, { opacity: 0, x: 50, scale: 0.9 })
    if (social) gsap.set(social.children, { opacity: 0, y: 30, scale: 0.8 })
    if (statsContainer) gsap.set(statsContainer.children, { opacity: 0, y: 40, scale: 0.9 })

    // Create timeline for contact info entrance
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      }
    })

    // Animate contact cards
    tl.to(cards, {
      opacity: 1,
      x: 0,
      scale: 1,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out'
    })

    // Animate social links
    if (social) {
      tl.to(social.children, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.7)'
      }, '-=0.4')
    }

    // Animate stats
    if (statsContainer) {
      tl.to(statsContainer.children, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out'
      }, '-=0.3')
    }

    // Add hover animations for cards
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          scale: 1.05,
          y: -5,
          duration: 0.3,
          ease: 'power2.out'
        })
      })

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        })
      })
    })

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <div ref={containerRef} className="w-full max-w-2xl mx-auto space-y-8">
      {/* Contact Details */}
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Informations de Contact
          </h2>
          <p className="text-gray-300 text-lg">
            Plusieurs façons de nous contacter. Nous sommes là pour vous aider à trouver votre trajet parfait.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid gap-6">
          {contactDetails.map((detail, index) => (
            <div
              key={index}
              ref={addCardRef}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group cursor-pointer"
              onClick={() => detail.link && window.open(detail.link, '_blank')}
              role={detail.link ? "button" : "article"}
              tabIndex={detail.link ? 0 : -1}
              onKeyDown={(e) => {
                if (detail.link && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  window.open(detail.link, '_blank')
                }
              }}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 p-3 bg-gradient-to-br from-[#CB1939]/20 to-[#CB1939]/30 rounded-lg group-hover:from-[#CB1939]/30 group-hover:to-[#CB1939]/40 transition-all duration-300">
                  <div className="text-[#CB1939] group-hover:text-[#CB1939]/80 transition-colors duration-300">
                    {detail.icon}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors duration-300">
                    {detail.title}
                  </h3>
                  <div className="space-y-1">
                    {detail.info.map((info, infoIndex) => (
                      <p key={infoIndex} className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                        {info}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social Media Links */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-6">Suivez-nous</h3>
        <div ref={socialRef} className="flex justify-center space-x-4">
          {socialLinks.map((social, index) => (
            <a
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300"
              aria-label={`Follow us on ${social.name}`}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  scale: 1.1,
                  backgroundColor: `${social.color}20`,
                  duration: 0.3
                })
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  scale: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  duration: 0.3
                })
              }}
            >
              <div className="text-gray-400 group-hover:text-white transition-colors duration-300">
                {social.icon}
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-[#CB1939]/10 to-[#CB1939]/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
        <h3 className="text-2xl font-bold text-white text-center mb-8">Pourquoi choisir Amseel Cars?</h3>
        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#CB1939]/20 to-[#CB1939]/30 rounded-full mb-4 group-hover:from-[#CB1939]/30 group-hover:to-[#CB1939]/40 transition-all duration-300">
                <div className="text-[#CB1939] group-hover:text-[#CB1939]/80 transition-colors duration-300">
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Google Maps */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">Nous trouver</h3>
        <div ref={mapRef} className="relative">
          {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center border border-white/10">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Google Maps API key non configuré</p>
                <p className="text-sm text-gray-500 mt-2">Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file</p>
                <p className="text-sm text-gray-500 mt-2">Haut founty rdc imm sinwan, Agadir 80000, Morocco</p>
              </div>
            </div>
          ) : mapError ? (
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center border border-white/10">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Map échoué à charger</p>
                <p className="text-sm text-gray-500 mt-2">Haut founty rdc imm sinwan, Agadir 80000, Morocco</p>
                <button 
                  onClick={() => {
                    setMapError(false)
                    setMapLoaded(false)
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Réessayer
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              {!mapLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center border border-white/10 z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
                    <p className="text-gray-400">Chargement de la map...</p>
                  </div>
                </div>
              )}
              <LoadScript
                googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
                onLoad={onMapLoad}
                onError={onMapError}
                loadingElement={
                  <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center border border-white/10">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
                      <p className="text-gray-400">Chargement de Google Maps...</p>
                    </div>
                  </div>
                }
              >
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={15}
                  options={mapOptions}
                  onLoad={onMapLoad}
                >
                  <Marker
                    position={center}
                    onClick={onMarkerClick}
                  />
                  {showInfoWindow && (
                    <InfoWindow
                      position={center}
                      onCloseClick={onInfoWindowClose}
                    >
                      <div className="p-2">
                        <h4 className="font-bold text-gray-800 mb-2">Amseel Cars</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Haut founty rdc imm sinwan
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          Agadir 80000, Morocco
                        </p>
                        <a
                          href="https://www.google.com/maps/place/Amseel+cars/@30.4007453,-9.5824693,17z/data=!3m1!4b1!4m6!3m5!1s0xdb3b76e940846e9:0x4fa73710c2ac5d92!8m2!3d30.4007408!4d-9.577593!16s%2Fg%2F11w7lk46s0?entry=ttu&g_ep=EgoyMDI1MDkwOS4wIKXMDSoASAFQAw%3D%3D"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Voir sur Google Maps →
                        </a>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </LoadScript>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContactInfo
