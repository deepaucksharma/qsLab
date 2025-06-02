import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CinematicTitle,
  Timeline,
  InteractiveQuiz,
  ParticleBackground,
  MetricDisplay
} from '../../../../components/StorytellingComponents'
import { getSceneState, getStaggeredDelay } from '../../../../utils/animationHelpers'
import ProgressiveReveal from '../../../../components/ProgressiveReveal'

const ModuleRecapScene = ({ time = 0, duration = 6, onComplete }) => {
  const phases = {
    summary: { start: 0, duration: 3 },
    callToAction: { start: 3, duration: 3 }
  }
  
  const { phase, progress, localTime } = getSceneState(time, phases)
  const [quizComplete, setQuizComplete] = useState(false)
  
  const keyTakeaways = [
    {
      icon: '🎯',
      title: 'Metrics Evolution',
      description: 'From partition-based to message-level granularity'
    },
    {
      icon: '⚡',
      title: 'Real-time Insights',
      description: 'Unacknowledged age reveals true processing latency'
    },
    {
      icon: '🔄',
      title: 'Redelivery Tracking',
      description: 'Understand failure patterns with redelivery metrics'
    },
    {
      icon: '🔒',
      title: 'Lock Management',
      description: 'Monitor concurrent processing efficiency'
    }
  ]
  
  const evolutionTimeline = [
    {
      date: 'Traditional',
      title: 'Consumer Groups',
      description: 'Lag-based monitoring'
    },
    {
      date: 'Evolution',
      title: 'Share Groups',
      description: 'State-aware metrics'
    },
    {
      date: 'Future',
      title: 'Your System',
      description: 'Implement today!'
    }
  ]
  
  return (
    <div className="scene-container relative bg-black">
      {/* Cinematic Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-black to-blue-900/20" />
        <ParticleBackground 
          particleCount={60}
          colors={['#8b5cf6', '#3b82f6', '#10b981']}
          behavior="converge"
        />
      </div>
      
      <div className="relative z-10 h-full p-8 overflow-hidden">
        
        {/* Summary Phase */}
        <AnimatePresence>
          {phase === 'summary' && (
            <motion.div
              className="max-w-6xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CinematicTitle
                title="Key Takeaways"
                subtitle="Your monitoring transformation starts here"
                time={localTime}
                startTime={0}
              />
              
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                {keyTakeaways.map((takeaway, index) => (
                  <motion.div
                    key={index}
                    className="bg-gray-900/50 backdrop-blur-lg rounded-lg p-6 border border-purple-600/30"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ 
                      opacity: localTime > getStaggeredDelay(index, 0.3) ? 1 : 0,
                      y: localTime > getStaggeredDelay(index, 0.3) ? 0 : 50
                    }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ scale: 1.05, borderColor: 'rgb(147 51 234)' }}
                  >
                    <div className="text-4xl mb-3">{takeaway.icon}</div>
                    <h3 className="text-xl font-bold text-purple-400 mb-2">
                      {takeaway.title}
                    </h3>
                    <p className="text-gray-300">{takeaway.description}</p>
                  </motion.div>
                ))}
              </div>
              
              {/* Evolution Timeline */}
              {localTime > 1.5 && (
                <motion.div
                  className="mt-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <Timeline
                    events={evolutionTimeline}
                    time={localTime}
                    startTime={1.5}
                  />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Call to Action Phase */}
        {phase === 'callToAction' && (
          <motion.div
            className="flex items-center justify-center h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="max-w-4xl mx-auto text-center">
              {!quizComplete ? (
                <InteractiveQuiz
                  question="Which metric best indicates actual message processing health in Share Groups?"
                  options={[
                    'Consumer lag',
                    'Records unacknowledged age',
                    'Partition count',
                    'Throughput rate'
                  ]}
                  correctAnswer={1}
                  onComplete={(correct) => {
                    setQuizComplete(true)
                    if (onComplete) onComplete(correct)
                  }}
                  time={localTime}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", duration: 0.8 }}
                >
                  <motion.h1
                    className="text-6xl md:text-8xl font-black mb-8"
                    animate={{
                      backgroundImage: [
                        'linear-gradient(45deg, #8b5cf6 0%, #3b82f6 50%, #10b981 100%)',
                        'linear-gradient(45deg, #10b981 0%, #8b5cf6 50%, #3b82f6 100%)',
                        'linear-gradient(45deg, #3b82f6 0%, #10b981 50%, #8b5cf6 100%)'
                      ]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    style={{
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    READY TO EVOLVE?
                  </motion.h1>
                  
                  <p className="text-2xl md:text-3xl text-gray-300 mb-12">
                    Transform your Kafka monitoring today
                  </p>
                  
                  <div className="space-y-6">
                    <ProgressiveReveal>
                      <motion.div
                        className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <h3 className="text-2xl font-bold mb-2">Next Steps</h3>
                        <ul className="text-left space-y-2 text-lg">
                          <li>✓ Implement Share Group metrics in your system</li>
                          <li>✓ Set up alerts based on unacknowledged age</li>
                          <li>✓ Monitor redelivery patterns</li>
                          <li>✓ Track lock duration for optimization</li>
                        </ul>
                      </motion.div>
                    </ProgressiveReveal>
                    
                    <motion.p
                      className="text-xl text-gray-400"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Continue to the next episode →
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Episode Progress */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-green-500"
          style={{ width: `${(time / duration) * 100}%` }}
        />
      </div>
      
      {/* Completion Indicator */}
      {time >= duration - 0.5 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </motion.div>
      )}
    </div>
  )
}

export default ModuleRecapScene