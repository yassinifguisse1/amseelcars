"use client"
import { motion, type Variants, cubicBezier } from 'framer-motion';
import { useRevealed } from '@/hooks/useRevealed';

export default function About() {
  useRevealed()
  
  const textVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 1,
        ease: cubicBezier(0.25, 0.1, 0.25, 1)
      }
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  return (
    <>
      <div className='revealed'></div>
      
      {/* Video Hero Section */}
      <section className="relative min-h-screen overflow-hidden bg-black">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full">
          <video 
            autoPlay 
            loop 
            muted
            playsInline
            className="w-full h-full object-cover opacity-50"
          >
            <source src="/video/cardri.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Video Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-screen flex items-center justify-center px-6 md:px-12">
          <motion.div 
            className="text-center text-white max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Main Heading */}
            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
              variants={textVariants}
            >
              About{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                Amseel Cars
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p 
              className="text-xl md:text-2xl lg:text-3xl font-light mb-8 text-gray-200"
              variants={textVariants}
            >
              Redefining luxury car rental experiences in Morocco
            </motion.p>

            {/* Description */}
            <motion.p 
              className="text-lg md:text-xl font-normal mb-12 max-w-3xl mx-auto leading-relaxed text-gray-300"
              variants={textVariants}
            >
                             Since our inception, we&apos;ve been committed to providing exceptional vehicles 
              and unparalleled service, making every journey extraordinary for our valued customers.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              variants={textVariants}
            >
              <button className="bg-white text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[200px]">
                Our Story
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-black transition-all duration-300 min-w-[200px]">
                Meet Our Team
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-light tracking-wider">SCROLL TO EXPLORE</span>
            <motion.div 
              className="w-[2px] h-8 bg-white"
              animate={{ scaleY: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            ></motion.div>
          </div>
        </motion.div>
      </section>

      {/* Additional About Sections would go here */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              Our Mission
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              To provide premium car rental services that exceed expectations, 
              combining luxury vehicles with exceptional customer service across Morocco.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}