/**
 * Evolution Timeline Scene V3 - Streamlined Audio Implementation
 * Shows the history of Apache Kafka from 2011 to present
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Users, MessageSquare, TrendingUp, Zap } from 'lucide-react'
import audioManager from '@utils/audioManagerV2' // Use new streamlined audio manager
import logger from '@utils/logger'

const EvolutionTimelineSceneV3 = ({ time = 0, duration = 480 }) => {
  const [currentPhase, setCurrentPhase] = useState(0)
  const [showSubtitles, setShowSubtitles] = useState(true)
  const [currentSubtitle, setCurrentSubtitle] = useState('')
  const audioInitialized = useRef(false)
  
  const progress = time / duration
  
  // Timeline events
  const timelineEvents = [
    {
      year: 2011,
      title: "The Crisis",
      description: "LinkedIn's architecture crumbling",
      icon: Users,
      color: "from-red-600 to-orange-600",
      voiceover: "evolution-intro",
      effects: ["crisis-alarm", "tech-atmosphere"]
    },
    {
      year: 2011,
      title: "Kafka Born",
      description: "Version 0.7 released",
      icon: MessageSquare,
      color: "from-blue-600 to-cyan-600",
      voiceover: "evolution-birth",
      effects: ["reveal", "data-flow"]
    },
    {
      year: 2014,
      title: "Early Growth",
      description: "Replication & new APIs",
      icon: TrendingUp,
      color: "from-green-600 to-emerald-600",
      voiceover: "evolution-early-days",
      effects: ["timeline-whoosh"]
    },
    {
      year: 2017,
      title: "Scale Challenges",
      description: "Partition limits exposed",
      icon: Zap,
      color: "from-yellow-600 to-amber-600",
      voiceover: "evolution-growth",
      effects: ["error-buzz", "data-stream"]
    },
    {
      year: 2019,
      title: "Global Nervous System",
      description: "7 trillion messages/day",
      icon: Calendar,
      color: "from-purple-600 to-pink-600",
      voiceover: "evolution-transformation",
      effects: ["impact-boom", "success-chime"]
    }
  ]
  
  // Initialize audio
  useEffect(() => {
    if (!audioInitialized.current) {
      audioInitialized.current = true
      
      // Load episode audio with streamlined API
      audioManager.loadEpisodeAudio('s2e1').then((success) => {
        if (success) {
          // Set subtitle callback
          audioManager.setSubtitleCallback(setCurrentSubtitle)
          
          // Start ambient sound
          audioManager.playAmbient('tech-atmosphere')
          
          logger.debug('EvolutionTimelineSceneV3: Episode audio loaded')
        } else {
          logger.error('EvolutionTimelineSceneV3: Failed to load episode audio')
        }
      })
    }
    
    return () => {
      // Cleanup scene-specific audio when component unmounts
      if (audioInitialized.current) {
        logger.debug('EvolutionTimelineSceneV3: Cleaning up scene audio')
        audioManager.cleanupSceneAudio()
      }
    }
  }, [])
  
  // Handle timeline progression and audio
  useEffect(() => {
    // Determine current phase based on time
    const phaseIndex = Math.floor(progress * timelineEvents.length)
    
    if (phaseIndex !== currentPhase && phaseIndex < timelineEvents.length) {
      setCurrentPhase(phaseIndex)
      
      const event = timelineEvents[phaseIndex]
      
      // Play voiceover with streamlined API
      if (event.voiceover) {
        audioManager.playVoiceover(event.voiceover)
      }
      
      // Play effects with streamlined API
      if (event.effects) {
        event.effects.forEach(effect => {
          audioManager.playEffect(effect)
        })
      }
      
      logger.debug('Timeline phase changed', { phase: phaseIndex, time })
    }
  }, [time, progress, currentPhase])
  
  return (
    <div className="scene-container evolution-timeline min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent"
          animate={{
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center p-8">
        <motion.h1
          className="text-6xl font-bold text-white mb-16 text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          The Evolution of Apache Kafka
        </motion.h1>
        
        {/* Timeline */}
        <div className="relative w-full max-w-6xl">
          {/* Timeline Line */}
          <motion.div
            className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          
          {/* Timeline Events */}
          <div className="relative flex justify-between">
            {timelineEvents.map((event, index) => {
              const isActive = index <= currentPhase
              const isCurrent = index === currentPhase
              
              return (
                <motion.div
                  key={event.year}
                  className="relative flex flex-col items-center"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ 
                    opacity: isActive ? 1 : 0.3,
                    y: 0,
                    scale: isCurrent ? 1.1 : 1
                  }}
                  transition={{ 
                    duration: 0.8,
                    delay: index * 0.2
                  }}
                >
                  {/* Event Dot */}
                  <motion.div
                    className={`relative w-20 h-20 rounded-full bg-gradient-to-r ${event.color} 
                               flex items-center justify-center shadow-2xl`}
                    animate={isCurrent ? {
                      boxShadow: [
                        "0 0 20px rgba(59, 130, 246, 0.5)",
                        "0 0 40px rgba(59, 130, 246, 0.8)",
                        "0 0 20px rgba(59, 130, 246, 0.5)"
                      ]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <event.icon className="w-10 h-10 text-white" />
                    
                    {/* Pulse Effect */}
                    {isCurrent && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-white/30"
                        animate={{
                          scale: [1, 1.5, 1.5],
                          opacity: [0.5, 0, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeOut"
                        }}
                      />
                    )}
                  </motion.div>
                  
                  {/* Event Details */}
                  <motion.div
                    className="absolute top-24 text-center"
                    animate={{
                      opacity: isCurrent ? 1 : 0.6
                    }}
                  >
                    <div className="text-2xl font-bold text-white mb-1">
                      {event.year}
                    </div>
                    <div className="text-lg font-semibold text-blue-400 mb-1">
                      {event.title}
                    </div>
                    <div className="text-sm text-gray-400 max-w-[150px]">
                      {event.description}
                    </div>
                  </motion.div>
                  
                  {/* Connection Line to Timeline */}
                  <motion.div
                    className="absolute top-20 w-0.5 h-8 bg-gradient-to-b from-transparent via-white/50 to-transparent"
                    animate={{
                      opacity: isActive ? 1 : 0.3
                    }}
                  />
                </motion.div>
              )
            })}
          </div>
        </div>
        
        {/* Current Event Spotlight */}
        <AnimatePresence mode="wait">
          {currentPhase < timelineEvents.length && (
            <motion.div
              key={currentPhase}
              className="mt-16 text-center max-w-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="text-3xl font-bold text-white mb-4"
                animate={{
                  textShadow: [
                    "0 0 20px rgba(255, 255, 255, 0.5)",
                    "0 0 40px rgba(255, 255, 255, 0.8)",
                    "0 0 20px rgba(255, 255, 255, 0.5)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {timelineEvents[currentPhase].title}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Progress Indicator */}
        <div className="absolute bottom-8 left-8 right-8">
          <div className="relative h-1 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Subtitles */}
      {showSubtitles && currentSubtitle && (
        <motion.div
          className="absolute bottom-20 left-0 right-0 flex justify-center px-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <div className="bg-black/80 backdrop-blur-sm px-6 py-3 rounded-lg max-w-4xl">
            <p className="text-white text-lg text-center leading-relaxed">
              {currentSubtitle}
            </p>
          </div>
        </motion.div>
      )}
      
      {/* Subtitle Toggle */}
      <button
        className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors"
        onClick={() => setShowSubtitles(!showSubtitles)}
      >
        CC {showSubtitles ? 'ON' : 'OFF'}
      </button>
    </div>
  )
}

export default EvolutionTimelineSceneV3