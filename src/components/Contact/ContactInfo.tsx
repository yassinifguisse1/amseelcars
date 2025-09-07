"use client"
import React, { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Car,
  Shield,
  Star,
  Users
} from 'lucide-react'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

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

  // Add card ref to array
  const addCardRef = (el: HTMLDivElement | null) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el)
    }
  }

  // Contact details data
  const contactDetails: ContactDetail[] = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone",
      info: ["+212 6 12 34 56 78", "+212 5 22 34 56 78"],
      link: "tel:+212612345678"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email",
      info: ["info@amseelcars.ma", "support@amseelcars.ma"],
      link: "mailto:info@amseelcars.ma"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Address",
      info: ["123 Mohammed V Avenue", "Casablanca, Morocco 20000"],
      link: "https://maps.google.com"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Business Hours",
      info: ["Mon - Fri: 8:00 AM - 8:00 PM", "Sat - Sun: 9:00 AM - 6:00 PM"]
    }
  ]

  // Social media links
  const socialLinks: SocialLink[] = [
    {
      icon: <Facebook className="w-5 h-5" />,
      name: "Facebook",
      url: "https://facebook.com/amseelcars",
      color: "#1877f2"
    },
    {
      icon: <Instagram className="w-5 h-5" />,
      name: "Instagram",
      url: "https://instagram.com/amseelcars",
      color: "#e4405f"
    },
    {
      icon: <Twitter className="w-5 h-5" />,
      name: "Twitter",
      url: "https://twitter.com/amseelcars",
      color: "#1da1f2"
    },
    {
      icon: <Linkedin className="w-5 h-5" />,
      name: "LinkedIn",
      url: "https://linkedin.com/company/amseelcars",
      color: "#0077b5"
    }
  ]

  // Stats data
  const stats = [
    { icon: <Car className="w-8 h-8" />, value: "500+", label: "Premium Cars" },
    { icon: <Users className="w-8 h-8" />, value: "10K+", label: "Happy Clients" },
    { icon: <Star className="w-8 h-8" />, value: "4.9", label: "Average Rating" },
    { icon: <Shield className="w-8 h-8" />, value: "24/7", label: "Support" }
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
            Contact Information
          </h2>
          <p className="text-gray-300 text-lg">
            Multiple ways to reach us. We're here to help you find your perfect ride.
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
                <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300">
                  <div className="text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
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
        <h3 className="text-2xl font-bold text-white mb-6">Follow Us</h3>
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
      <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
        <h3 className="text-2xl font-bold text-white text-center mb-8">Why Choose Amseel Cars?</h3>
        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full mb-4 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300">
                <div className="text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
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

      {/* Map Placeholder */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">Find Us</h3>
        <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center border border-white/10">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Interactive map coming soon</p>
            <p className="text-sm text-gray-500 mt-2">123 Mohammed V Avenue, Casablanca</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactInfo
