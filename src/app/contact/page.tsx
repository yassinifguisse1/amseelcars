"use client"
import React, { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRevealed } from '@/hooks/useRevealed'
import AnimatedHeader from '@/components/Contact/AnimatedHeader'
import ContactForm from '@/components/Contact/ContactForm'
import ContactInfo from '@/components/Contact/ContactInfo'
import Link from 'next/link'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

const ContactPage: React.FC = () => {
  // Use the existing revealed hook for consistency
  useRevealed()

  useEffect(() => {
    // Refresh ScrollTrigger after component mount
    ScrollTrigger.refresh()

    // Cleanup on unmount
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <>
      {/* Revealed div for consistency with existing pages */}
      <div className='revealed'></div>
      
      {/* Animated Header Section */}
      <AnimatedHeader />
      
      {/* Main Content Section */}
      <section className="relative min-h-screen   py-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, #3b82f6 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, #8b5cf6 0%, transparent 50%),
                             radial-gradient(circle at 40% 60%, #06b6d4 0%, transparent 50%)`
          }} />
        </div>

        <div className="relative z-10 container mx-auto px-4">
          {/* Desktop Layout: Side by side */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start">
            {/* Contact Form */}
            <div className="lg:sticky lg:top-20">
              <ContactForm />
            </div>
            
            {/* Contact Information */}
            <div>
              <ContactInfo />
            </div>
          </div>

          {/* Mobile/Tablet Layout: Stacked */}
          <div className="lg:hidden space-y-16">
            {/* Contact Form First on Mobile */}
            <ContactForm />
            
            {/* Contact Information */}
            <ContactInfo />
          </div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
      </section>

      {/* Additional CTA Section */}
      <section className="relative bg-gradient-to-r from-blue-600/10 to-purple-600/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Drive Your Dream Car?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Don&apos;t wait any longer. Contact us today and experience the luxury, 
              performance, and service that sets Amseel Cars apart from the rest.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* whatsapp */}
              <Link
                href="https://wa.me/212662500181"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
              >
                Whatsapp: +212 662 500 181
              </Link>
              <Link
                href="mailto:info@amseelcars.com"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 backdrop-blur-sm"
              >
                Send Email
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  ) 
}

export default ContactPage