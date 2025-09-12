'use client'
import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Content() {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contentRef.current) return

    const ctx = gsap.context(() => {
      // Animate content elements with stagger
      gsap.fromTo('.footer-animate', {
        y: 100,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      })

      // Animate logo
      gsap.fromTo('.logo-animate', {
        scale: 0.8,
        opacity: 0
      }, {
        scale: 1,
        opacity: 1,
        duration: 1.2,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      })

      // Hover animations for links
      const links = gsap.utils.toArray('.footer-link') as HTMLElement[]
      links.forEach((link: HTMLElement) => {
        const tl = gsap.timeline({ paused: true })
        tl.to(link, { 
          x: 10,
          color: '#3b82f6',
          duration: 0.3,
          ease: "power2.out"
        })

        link.addEventListener('mouseenter', () => tl.play())
        link.addEventListener('mouseleave', () => tl.reverse())
      })
    }, contentRef)

    return () => ctx.revert()
  }, [])

  return (
    <div 
      ref={contentRef}
      className='relative h-full w-full px-8 md:px-16 lg:px-24 py-16 flex flex-col justify-between overflow-hidden border-2 border-red-500'
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 rounded-full border border-white/20"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full border border-white/20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/10"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <MainSection />
      </div>
      
      {/* Bottom Section */}
      <div className="relative z-10">
        <BottomSection />
      </div>
    </div>
  )
}

const MainSection = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-16">
      {/* Brand Section */}
      <div className="lg:col-span-2 footer-animate">
        <div className="logo-animate mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#CB1939] to-[#CB1939]/80 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Amseel Cars</h2>
              <p className="text-blue-400 font-medium">Premium Car Rental</p>
            </div>
          </div>
        </div>
        <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-md">
          Experience luxury and comfort with our premium fleet. Your journey begins with the perfect car for every occasion.
        </p>
        
        {/* Social Links */}
        <div className="flex space-x-6">
          {['Facebook', 'Instagram', 'Twitter', 'LinkedIn'].map((social) => (
            <a key={social} href="#" className="footer-link w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all duration-300 group">
              <div className="w-5 h-5 bg-white rounded-sm group-hover:scale-110 transition-transform duration-300"></div>
            </a>
          ))}
        </div>
      </div>

      {/* Services */}
      <div className="footer-animate">
        <h3 className="text-white font-semibold text-xl mb-6 relative">
          Services
          <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-blue-500"></div>
        </h3>
        <div className="space-y-4">
          {['Luxury Car Rental', 'Airport Transfer', 'Corporate Fleet', 'Wedding Cars', 'Long Term Rental', 'Chauffeur Service'].map((service) => (
            <a key={service} href="#" className="footer-link block text-gray-300 hover:text-blue-400 transition-colors duration-300">
              {service}
            </a>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="footer-animate">
        <h3 className="text-white font-semibold text-xl mb-6 relative">
          Contact Us
          <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-blue-500"></div>
        </h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
            <div>
              <p className="text-gray-300">Agadir, Morocco</p>
              <p className="text-gray-400 text-sm">Bay Area, Agadir</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex-shrink-0"></div>
            <a href="tel:+212123456789" className="footer-link text-gray-300 hover:text-blue-400 transition-colors duration-300">
              +212 123 456 789
            </a>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex-shrink-0"></div>
            <a href="mailto:info@amseelcars.com" className="footer-link text-gray-300 hover:text-blue-400 transition-colors duration-300">
              info@amseelcars.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

const BottomSection = () => {
  return (
    <div className="footer-animate border-t border-white/20 pt-8 mt-12">
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-8">
          <p className="text-gray-400 text-sm">
            © 2024 Amseel Cars. All rights reserved.
          </p>
          <div className="flex space-x-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link) => (
              <a key={link} href="#" className="footer-link text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm">
                {link}
              </a>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-gray-400 text-sm">Available 24/7</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}