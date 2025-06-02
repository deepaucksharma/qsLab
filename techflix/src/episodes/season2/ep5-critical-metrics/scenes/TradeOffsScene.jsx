import React from 'react'
import { motion } from 'framer-motion'
import { 
  CinematicTitle, 
  ComparisonView, 
  ParticleBackground 
} from '../../../../components/StorytellingComponents'
import { getSceneState, getTextRevealStyle } from '../../../../utils/animationHelpers'
import AnimatedMetricCounter from '../../../../components/AnimatedMetricCounter'
import ProgressiveReveal from '../../../../components/ProgressiveReveal'

const TradeOffsScene = ({ time = 0, duration = 12 }) => {
  const phases = {
    hook: { start: 0, duration: 2 },
    problem: { start: 2, duration: 3 },
    exploration: { start: 5, duration: 5 },
    insight: { start: 10, duration: 2 }
  }
  
  const { phase, progress, localTime } = getSceneState(time, phases)
  
  return (
    <div className="scene-container relative">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-purple-900">
        <ParticleBackground 
          particleCount={30} 
          colors={['#ef4444', '#f59e0b']}
          behavior="float"
        />
      </div>
      
      {/* Content Container */}
      <div className="relative z-10 flex items-center justify-center h-full p-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Hook Phase */}
          {phase === 'hook' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="text-center"
            >
              <h1 className="text-7xl font-black mb-4 holographic">
                The Monitoring Paradox
              </h1>
              <p className="text-2xl text-gray-400" style={getTextRevealStyle(localTime, 0.5)}>
                What if everything you knew about metrics was wrong?
              </p>
            </motion.div>
          )}
          
          {/* Problem Phase */}
          {phase === 'problem' && (
            <div className="space-y-8">
              <CinematicTitle 
                title="Traditional Metrics"
                subtitle="Built for a simpler time"
              />
              
              <ProgressiveReveal delay={0.5} stagger={0.3}>
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-red-400 mb-3">The Limitations</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Consumer lag only tells part of the story</li>
                    <li>• Partition-based metrics miss the bigger picture</li>
                    <li>• No visibility into message processing state</li>
                  </ul>
                </div>
              </ProgressiveReveal>
            </div>
          )}
          
          {/* Exploration Phase */}
          {phase === 'exploration' && (
            <div className="space-y-12">
              <motion.h2 
                className="text-5xl font-bold text-center gradient-text"
                style={getTextRevealStyle(localTime, 0)}
              >
                Consumer Groups vs Share Groups
              </motion.h2>
              
              <ComparisonView
                before={{
                  label: 'Consumer Groups',
                  content: (
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-red-400">Consumer Groups</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Primary Metric:</span>
                          <span className="font-mono text-yellow-400">consumer_lag</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Granularity:</span>
                          <span className="text-white">Per partition</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Processing Model:</span>
                          <span className="text-white">Sequential</span>
                        </div>
                      </div>
                    </div>
                  )
                }}
                after={{
                  label: 'Share Groups',
                  content: (
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-green-400">Share Groups</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Primary Metric:</span>
                          <span className="font-mono text-green-400">records_unacked_age</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Granularity:</span>
                          <span className="text-white">Message-level</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Processing Model:</span>
                          <span className="text-white">Concurrent</span>
                        </div>
                      </div>
                    </div>
                  )
                }}
                time={localTime}
                startTime={2}
              />
              
              {/* Animated Metric Comparison */}
              <motion.div 
                className="grid grid-cols-2 gap-8"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: localTime > 3 ? 1 : 0, y: localTime > 3 ? 0 : 50 }}
                transition={{ duration: 0.8 }}
              >
                <div className="text-center">
                  <h4 className="text-lg text-gray-400 mb-2">Traditional Lag</h4>
                  <AnimatedMetricCounter
                    value={localTime > 4 ? 15000 : 0}
                    suffix=" msgs"
                    className="text-5xl text-red-400"
                    duration={2000}
                  />
                </div>
                <div className="text-center">
                  <h4 className="text-lg text-gray-400 mb-2">Unacked Age</h4>
                  <AnimatedMetricCounter
                    value={localTime > 4 ? 250 : 0}
                    suffix=" ms"
                    className="text-5xl text-green-400"
                    duration={2000}
                  />
                </div>
              </motion.div>
            </div>
          )}
          
          {/* Insight Phase */}
          {phase === 'insight' && (
            <motion.div
              className="text-center space-y-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-6xl font-black gradient-text">
                The Paradigm Shift
              </h2>
              <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
                From counting messages to measuring actual processing time.
                From partition boundaries to true concurrent processing.
              </p>
              <motion.div
                className="inline-block mt-8 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg"
                animate={{ 
                  boxShadow: [
                    '0 0 20px rgba(147, 51, 234, 0.5)',
                    '0 0 40px rgba(147, 51, 234, 0.8)',
                    '0 0 20px rgba(147, 51, 234, 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <p className="text-xl font-bold">It's time to evolve your metrics</p>
              </motion.div>
            </motion.div>
          )}
          
        </div>
      </div>
      
      {/* Progress Indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
          style={{ width: `${(time / duration) * 100}%` }}
        />
      </div>
    </div>
  )
}

export default TradeOffsScene