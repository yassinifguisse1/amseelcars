"use client"
import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto px-6 text-center"
      >
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl font-bold mb-8"
        >
          About Me
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl leading-relaxed mb-8 text-white"
        >
          I&apos;m a passionate developer who loves creating amazing digital experiences. 
          With expertise in modern web technologies, I help brands stand out in the digital era.
        </motion.p>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg leading-relaxed  text-white"
        >
          The combination of my passion for design, code & interaction positions me 
          in a unique place in the web design world. I&apos;m always on the cutting edge, 
          ready to set new standards.
        </motion.p>
      </motion.div>
    </div>
  );
}