import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CinematicTitle,
  Timeline,
  InteractiveQuiz,
  ParticleBackground
} from '../../../../components/StorytellingComponents'
import { getSceneState } from '../../../../utils/animationHelpers'
import ProgressiveReveal from '../../../../components/ProgressiveReveal'

const FutureVisionScene = ({ time = 0, duration = 10, onComplete }) => {
  const phases = {
    innovations: { start: 0, duration: 4 },
    predictions: { start: 4, duration: 4 },
    callToAction: { start: 8, duration: 2 }
  }
  
  const { phase, progress, localTime } = getSceneState(time, phases)
  const [visionRevealed, setVisionRevealed] = useState(false)
  
  const futureInnovations = [
    {
      icon: '🌐',
      title: 'Global Event Mesh',
      description: 'Planetary-scale event streaming',
      features: ['Cross-region replication', 'Edge computing integration', 'Sub-millisecond routing']
    },
    {
      icon: '🤖',
      title: 'AI-Powered Operations',
      description: 'Self-healing, self-optimizing clusters',
      features: ['Predictive scaling', 'Anomaly detection', 'Automated troubleshooting']
    },
    {
      icon: '⚡',
      title: 'Quantum Streaming',
      description: 'Next-gen processing paradigms',
      features: ['Quantum-safe encryption', 'Parallel universe processing', 'Time-series optimization']
    },
    {
      icon: '🔮',
      title: 'Serverless Kafka',
      description: 'True pay-per-event model',
      features: ['Zero ops overhead', 'Infinite scaling', 'Cost optimization']
    }
  ]
  
  const evolutionPredictions = [
    { date: '2024', title: 'KRaft Becomes Default', description: 'ZooKeeper-free deployments' },
    { date: '2025', title: 'Cloud-Native Standard', description: 'Kubernetes-native streaming' },
    { date: '2027', title: 'AI Integration', description: 'ML-driven stream processing' },
    { date: '2030', title: 'Quantum Ready', description: 'Post-classical computing era' }
  ]
  
  return (
    <div className="scene-container relative bg-black">
      {/* Futuristic Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-blue-900/20 to-black" />
        <ParticleBackground 
          particleCount={100}
          colors={['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899']}
          behavior="constellation"
        />
        
        {/* Holographic grid */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(45deg, transparent 48%, #8b5cf6 50%, transparent 52%),
                linear-gradient(-45deg, transparent 48%, #3b82f6 50%, transparent 52%)
              `,
              backgroundSize: '30px 30px'
            }}
          />
        </div>
      </div>
      
      <div className="relative z-10 h-full p-8 overflow-hidden">
        
        {/* Innovations Phase */}
        <AnimatePresence>
          {phase === 'innovations' && (
            <motion.div
              className="max-w-7xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CinematicTitle
                title="The Future is Streaming"
                subtitle="What lies beyond the horizon"
                time={localTime}
                startTime={0}
              />
              
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                {futureInnovations.map((innovation, index) => (
                  <motion.div
                    key={index}
                    className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-lg rounded-lg p-6 border border-purple-600/50"
                    initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                    animate={{ 
                      opacity: localTime > index * 0.5 ? 1 : 0,
                      scale: localTime > index * 0.5 ? 1 : 0.8,
                      rotateY: localTime > index * 0.5 ? 0 : -90
                    }}
                    transition={{ duration: 0.8, type: "spring" }}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)'
                    }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-5xl">{innovation.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2 gradient-text">
                          {innovation.title}
                        </h3>
                        <p className="text-gray-300 mb-3">{innovation.description}</p>
                        <ul className="space-y-1 text-sm text-gray-400">
                          {innovation.features.map((feature, i) => (
                            <li key={i}>• {feature}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Predictions Phase */}
        {phase === 'predictions' && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl font-bold text-center mb-12">
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
                The Evolution Timeline
              </span>
            </h2>
            
            <Timeline
              events={evolutionPredictions}
              time={localTime}
              startTime={0}
            />
            
            {localTime > 2 && !visionRevealed && (
              <motion.div
                className="mt-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.button
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-xl font-bold"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setVisionRevealed(true)}
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(139, 92, 246, 0.5)',
                      '0 0 40px rgba(59, 130, 246, 0.8)',
                      '0 0 20px rgba(139, 92, 246, 0.5)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Reveal the Ultimate Vision
                </motion.button>
              </motion.div>
            )}
            
            {visionRevealed && (
              <motion.div
                className="mt-12 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg p-8 border border-purple-600"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", duration: 1 }}
              >
                <h3 className="text-3xl font-bold mb-4 text-center gradient-text">
                  The Streaming Singularity
                </h3>
                <p className="text-xl text-gray-300 leading-relaxed text-center">
                  A world where every event, every interaction, every data point 
                  flows seamlessly through a global nervous system. Kafka evolves 
                  from a platform to an invisible foundation of our digital reality.
                </p>
              </motion.div>
            )}
          </div>
        )}
        
        {/* Call to Action Phase */}
        {phase === 'callToAction' && (
          <motion.div
            className="flex items-center justify-center h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="max-w-4xl text-center">
              <InteractiveQuiz
                question="What excites you most about Kafka's future?"
                options={[
                  'Unlimited scalability without limits',
                  'AI-powered self-managing clusters',
                  'Serverless event streaming',
                  'Quantum-ready architecture'
                ]}
                correctAnswer={-1} // No correct answer - it's preference
                onComplete={(selected) => {
                  if (onComplete) onComplete(true)
                }}
                time={localTime}
              />
              
              {localTime > 1 && (
                <ProgressiveReveal delay={1}>
                  <motion.div
                    className="mt-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <h1 className="text-6xl md:text-8xl font-black mb-6">
                      <motion.span
                        className="inline-block"
                        animate={{
                          backgroundImage: [
                            'linear-gradient(45deg, #8b5cf6 0%, #3b82f6 50%, #10b981 100%)',
                            'linear-gradient(45deg, #10b981 0%, #f59e0b 50%, #ec4899 100%)',
                            'linear-gradient(45deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)'
                          ]
                        }}
                        transition={{ duration: 5, repeat: Infinity }}
                        style={{
                          WebkitBackgroundClip: 'text',
                          backgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}
                      >
                        BE THE FUTURE
                      </motion.span>
                    </h1>
                    <p className="text-2xl text-gray-300">
                      The next chapter of streaming is yours to write
                    </p>
                    
                    <motion.div
                      className="mt-8 inline-flex space-x-4"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-4xl">🚀</span>
                      <span className="text-4xl">🌟</span>
                      <span className="text-4xl">🔮</span>
                    </motion.div>
                  </motion.div>
                </ProgressiveReveal>
              )}
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-green-500"
          style={{ width: `${(time / duration) * 100}%` }}
        />
      </div>
      
      {/* Episode End Effect */}
      {time >= duration - 0.5 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <p className="text-5xl font-black gradient-text">TO BE CONTINUED...</p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default FutureVisionScene