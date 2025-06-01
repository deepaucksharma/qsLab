import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Settings, Volume2 } from 'lucide-react'

const VideoHeader = () => {
  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 w-full z-40 bg-gradient-to-b from-black/80 to-transparent p-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-shadow">TechFlix</h1>
            <p className="text-sm text-gray-300">Kafka Share Groups - Episode 1</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors">
            <Volume2 className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.header>
  )
}

export default VideoHeader