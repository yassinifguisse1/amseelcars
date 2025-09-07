"use client"
import React, { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Mail, Phone, User, MessageSquare, Send, CheckCircle } from 'lucide-react'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

// TypeScript interfaces for form data
interface FormData {
  name: string
  email: string
  phone: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  message?: string
}

const ContactForm: React.FC = () => {
  // Form state management
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Refs for GSAP animations
  const formRef = useRef<HTMLFormElement>(null)
  const fieldsRef = useRef<HTMLDivElement[]>([])
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Add field ref to array
  const addFieldRef = (el: HTMLDivElement | null) => {
    if (el && !fieldsRef.current.includes(el)) {
      fieldsRef.current.push(el)
    }
  }

  // GSAP animations setup
  useEffect(() => {
    const form = formRef.current
    const fields = fieldsRef.current
    const button = buttonRef.current

    if (!form || !fields.length || !button) return

    // Initial setup - hide elements
    gsap.set([...fields, button], { 
      opacity: 0, 
      y: 30,
      scale: 0.95 
    })

    // Create timeline for form entrance
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: form,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      }
    })

    // Animate form fields with stagger
    tl.to(fields, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out'
    })
    .to(button, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      ease: 'back.out(1.7)'
    }, '-=0.3')

    // Add hover animations for input fields
    fields.forEach(field => {
      const input = field.querySelector('input, textarea')
      if (input) {
        // Focus animations
        input.addEventListener('focus', () => {
          gsap.to(field, {
            scale: 1.02,
            duration: 0.3,
            ease: 'power2.out'
          })
          gsap.to(field.querySelector('.field-icon'), {
            scale: 1.1,
            color: '#3b82f6',
            duration: 0.3
          })
        })

        input.addEventListener('blur', () => {
          gsap.to(field, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
          })
          gsap.to(field.querySelector('.field-icon'), {
            scale: 1,
            color: '#6b7280',
            duration: 0.3
          })
        })
      }
    })

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      // Shake animation for errors
      gsap.to(formRef.current, {
        x: [-10, 10, -10, 10, 0],
        duration: 0.5,
        ease: 'power2.inOut'
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Form submitted:', formData)
      
      setIsSubmitted(true)
      
      // Success animation
      if (buttonRef.current) {
        gsap.to(buttonRef.current, {
          scale: 1.1,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: 'power2.inOut'
        })
      }

      // Reset form after delay
      setTimeout(() => {
        setFormData({ name: '', email: '', phone: '', message: '' })
        setIsSubmitted(false)
      }, 3000)

    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form 
        ref={formRef}
        onSubmit={handleSubmit}
        className="space-y-6 bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
        noValidate
      >
        {/* Form Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Get In Touch
          </h2>
          <p className="text-gray-300 text-lg">
            Ready to experience luxury? Send us a message and we'll get back to you within 24 hours.
          </p>
        </div>

        {/* Name Field */}
        <div ref={addFieldRef} className="relative">
          <label 
            htmlFor="name" 
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Full Name *
          </label>
          <div className="relative">
            <User className="field-icon absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-300" />
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                errors.name ? 'border-red-500' : 'border-white/20'
              }`}
              placeholder="Enter your full name"
              aria-describedby={errors.name ? 'name-error' : undefined}
              required
            />
          </div>
          {errors.name && (
            <p id="name-error" className="mt-2 text-sm text-red-400" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div ref={addFieldRef} className="relative">
          <label 
            htmlFor="email" 
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Email Address *
          </label>
          <div className="relative">
            <Mail className="field-icon absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-300" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                errors.email ? 'border-red-500' : 'border-white/20'
              }`}
              placeholder="your.email@example.com"
              aria-describedby={errors.email ? 'email-error' : undefined}
              required
            />
          </div>
          {errors.email && (
            <p id="email-error" className="mt-2 text-sm text-red-400" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone Field */}
        <div ref={addFieldRef} className="relative">
          <label 
            htmlFor="phone" 
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Phone Number (Optional)
          </label>
          <div className="relative">
            <Phone className="field-icon absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-300" />
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        {/* Message Field */}
        <div ref={addFieldRef} className="relative">
          <label 
            htmlFor="message" 
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Message *
          </label>
          <div className="relative">
            <MessageSquare className="field-icon absolute left-4 top-4 w-5 h-5 text-gray-400 transition-colors duration-300" />
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none ${
                errors.message ? 'border-red-500' : 'border-white/20'
              }`}
              placeholder="Tell us about your rental needs, preferred dates, or any special requirements..."
              aria-describedby={errors.message ? 'message-error' : undefined}
              required
            />
          </div>
          {errors.message && (
            <p id="message-error" className="mt-2 text-sm text-red-400" role="alert">
              {errors.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          ref={buttonRef}
          type="submit"
          disabled={isSubmitting || isSubmitted}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-3 ${
            isSubmitted
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
          } ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-blue-500/25'
          }`}
          aria-describedby="submit-status"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Sending Message...</span>
            </>
          ) : isSubmitted ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Message Sent!</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Send Message</span>
            </>
          )}
        </button>

        {/* Status Message */}
        {isSubmitted && (
          <div className="text-center">
            <p className="text-green-400 text-sm" id="submit-status">
              Thank you! We'll get back to you within 24 hours.
            </p>
          </div>
        )}
      </form>
    </div>
  )
}

export default ContactForm
