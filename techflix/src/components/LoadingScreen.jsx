import React from 'react'
import { motion } from 'framer-motion'

const LoadingScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50"
    >
      <div className="relative mb-8">
        <div className="w-16 h-16 border-4 border-transparent border-t-netflix-red rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-red-400 rounded-full animate-spin" 
             style={{ animationDelay: '0.2s', width: '80%', height: '80%', top: '10%', left: '10%' }}></div>
      </div>
      
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-gray-400 text-lg"
      >
        Loading TechFlix Experience...
      </motion.div>
      
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '200px' }}
        transition={{ duration: 2, ease: 'easeInOut' }}
        className="mt-6 h-1 bg-netflix-red rounded-full"
      />
    </motion.div>
  )
}

export default LoadingScreen