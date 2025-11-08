
'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer/Footer';
import { motion } from 'framer-motion';

export default function NotFound() {
  useEffect(() => {
    // Update document title for client component
    document.title = 'Page non trouvée - AmseelCars';
    
    // Add meta robots tag
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex, follow');
  }, []);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black flex items-center justify-center px-4 py-20">
        <motion.div
          className="text-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-9xl md:text-[12rem] font-bold text-white mb-6 font-heading"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            404
          </motion.h1>
          
          <motion.h2
            className="text-3xl md:text-4xl font-semibold text-gray-300 mb-6 font-heading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Page non trouvée
          </motion.h2>
          
          <motion.p
            className="text-lg text-gray-400 mb-12 max-w-md mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée. 
            Retournez à l&apos;accueil ou explorez nos voitures disponibles.
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-[#EC1C25] to-[#ff4757] text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Retour à l&apos;accueil
            </Link>
            
            <Link
              href="/cars"
              className="inline-block bg-transparent border-2 border-white/20 text-white px-8 py-4 rounded-lg font-semibold hover:border-white/40 hover:bg-white/5 transition-all duration-300"
            >
              Voir nos voitures
            </Link>
          </motion.div>

          <motion.div
            className="mt-12 pt-8 border-t border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <p className="text-sm text-gray-500 mb-4">Liens utiles :</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link
                href="/about"
                className="text-gray-400 hover:text-white transition-colors"
              >
                À propos
              </Link>
              <span className="text-gray-600">•</span>
              <Link
                href="/blog"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Blog
              </Link>
              <span className="text-gray-600">•</span>
              <Link
                href="/contact"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Contact
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}

