import React from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, MessageCircle } from 'lucide-react'

const SceneContent = ({ scene, isPlaying, onPlayPause, onShowOverlay }) => {
  return (
    <div className="relative w-full h-full">
      {/* Background Image/Video Area */}
      <motion.div
        key={scene.id}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-netflix-dark"
        style={{
          backgroundImage: scene.backgroundImage ? `url(${scene.backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      {/* Scene Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-12 max-w-4xl">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <div className="text-sm text-netflix-red font-semibold uppercase tracking-wide">
            {scene.category}
          </div>
          
          <h1 className="text-6xl font-bold text-shadow leading-tight">
            {scene.title}
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl leading-relaxed text-shadow">
            {scene.description}
          </p>

          {/* Interactive Elements */}
          {scene.interactiveElements && scene.interactiveElements.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex space-x-4 mt-8"
            >
              <button
                onClick={onPlayPause}
                className="flex items-center space-x-2 btn-primary text-lg py-3 px-8"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              
              <button
                onClick={onShowOverlay}
                className="flex items-center space-x-2 btn-secondary text-lg py-3 px-8"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Interact</span>
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Floating Animation Elements */}
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-32 right-12 w-32 h-32 bg-netflix-red/20 rounded-full blur-xl"
        />
      </div>

      {/* Scene Narration Text (if playing) */}
      {isPlaying && scene.narration && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute bottom-24 left-12 right-12 glass-effect rounded-lg p-6"
        >
          <p className="text-lg leading-relaxed">{scene.narration}</p>
        </motion.div>
      )}
    </div>
  )
}

export default SceneContent