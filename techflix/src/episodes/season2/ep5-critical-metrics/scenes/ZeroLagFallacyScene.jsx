import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CinematicTitle,
  CodeDemo,
  ArchitectureDiagram,
  MetricDisplay,
  ParticleBackground
} from '../../../../components/StorytellingComponents'
import { getSceneState, lerp, easings } from '../../../../utils/animationHelpers'
import AnimatedMetricCounter from '../../../../components/AnimatedMetricCounter'
import ProgressiveReveal from '../../../../components/ProgressiveReveal'

const ZeroLagFallacyScene = ({ time = 0, duration = 12 }) => {
  const phases = {
    setup: { start: 0, duration: 3 },
    demonstration: { start: 3, duration: 5 },
    reality: { start: 8, duration: 4 }
  }
  
  const { phase, progress, localTime } = getSceneState(time, phases)
  const [simulationActive, setSimulationActive] = useState(false)
  
  useEffect(() => {
    if (phase === 'demonstration' && localTime > 1) {
      setSimulationActive(true)
    } else {
      setSimulationActive(false)
    }
  }, [phase, localTime])
  
  // Architecture nodes for the demonstration
  const architectureNodes = [
    { id: 'producer', label: 'Producer', icon: '📤', x: 20, y: 50, description: '1000 msg/s' },
    { id: 'kafka', label: 'Kafka', icon: '🗄️', x: 50, y: 50, description: 'Zero lag' },
    { id: 'consumer1', label: 'Consumer 1', icon: '📥', x: 80, y: 30, description: 'Processing...' },
    { id: 'consumer2', label: 'Consumer 2', icon: '📥', x: 80, y: 70, description: 'Processing...' }
  ]
  
  const connections = [
    { x1: '25%', y1: '50%', x2: '45%', y2: '50%' },
    { x1: '55%', y1: '50%', x2: '75%', y2: '30%' },
    { x1: '55%', y1: '50%', x2: '75%', y2: '70%' }
  ]
  
  return (
    <div className="scene-container relative bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-orange-900/20" />
        <ParticleBackground 
          particleCount={40}
          colors={['#ef4444', '#f97316', '#f59e0b']}
          behavior="pulse"
        />
      </div>
      
      <div className="relative z-10 h-full p-8 overflow-hidden">
        
        {/* Setup Phase */}
        <AnimatePresence>
          {phase === 'setup' && (
            <motion.div
              className="flex items-center justify-center h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center max-w-4xl">
                <motion.h1
                  className="text-7xl md:text-9xl font-black mb-6"
                  animate={{
                    backgroundImage: [
                      'linear-gradient(45deg, #ef4444 0%, #f59e0b 100%)',
                      'linear-gradient(45deg, #f59e0b 0%, #ef4444 100%)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  ZERO LAG
                </motion.h1>
                <motion.p
                  className="text-3xl text-gray-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  The dangerous illusion of perfect performance
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Demonstration Phase */}
        {phase === 'demonstration' && (
          <div className="max-w-7xl mx-auto space-y-8">
            <CinematicTitle
              title="The Illusion"
              subtitle="When metrics lie"
              time={localTime}
              startTime={0}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Architecture Visualization */}
              <motion.div
                className="bg-gray-900/50 backdrop-blur-lg rounded-lg p-6 border border-gray-700"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h3 className="text-2xl font-bold mb-4">System State</h3>
                <div className="relative h-64">
                  <ArchitectureDiagram
                    nodes={architectureNodes}
                    connections={connections}
                    time={localTime}
                    startTime={0}
                  />
                  
                  {/* Lag Display */}
                  <motion.div
                    className="absolute top-4 right-4 bg-green-600/20 border border-green-600 rounded-lg px-4 py-2"
                    animate={simulationActive ? {
                      borderColor: ['#10b981', '#f59e0b', '#10b981']
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="text-sm text-gray-400">Consumer Lag</div>
                    <AnimatedMetricCounter
                      value={simulationActive ? 0 : 0}
                      suffix=" msgs"
                      className="text-2xl font-bold text-green-400"
                    />
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Hidden Reality */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="bg-gray-900/50 backdrop-blur-lg rounded-lg p-6 border border-gray-700">
                  <h3 className="text-2xl font-bold mb-4 text-orange-400">The Hidden Truth</h3>
                  
                  <div className="space-y-3">
                    {simulationActive && (
                      <ProgressiveReveal delay={0} stagger={0.5}>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Messages in Processing:</span>
                          <AnimatedMetricCounter
                            value={850}
                            className="text-xl font-mono text-yellow-400"
                            duration={2000}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Average Processing Time:</span>
                          <AnimatedMetricCounter
                            value={3.2}
                            suffix="s"
                            decimals={1}
                            className="text-xl font-mono text-orange-400"
                            duration={2000}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Oldest Unacked:</span>
                          <AnimatedMetricCounter
                            value={45}
                            suffix="s ago"
                            className="text-xl font-mono text-red-400"
                            duration={2000}
                          />
                        </div>
                      </ProgressiveReveal>
                    )}
                  </div>
                </div>
                
                {/* Code Example */}
                {localTime > 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <CodeDemo
                      code={`// The misleading metric
consumer.lag = 0  // ✅ Looks perfect!

// The reality
messages_in_flight = 850
oldest_message_age = 45s
processing_failures = 12/min

// What zero lag actually means:
// Consumers are keeping up with production rate
// BUT NOT with processing requirements!`}
                      language="javascript"
                      time={localTime}
                      startTime={2}
                      highlights={[
                        { start: 3, end: 5, lines: [2] },
                        { start: 4, end: 5, lines: [5, 6, 7] }
                      ]}
                    />
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        )}
        
        {/* Reality Phase */}
        {phase === 'reality' && (
          <motion.div
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-5xl font-bold text-center mb-12">
              The New Reality: Share Group Metrics
            </h2>
            
            <MetricDisplay
              metrics={[
                { 
                  label: 'Traditional View',
                  prefix: '',
                  value: 0,
                  suffix: ' lag',
                  change: 0
                },
                {
                  label: 'Messages Processing',
                  prefix: '',
                  value: 850,
                  suffix: ' active',
                  change: -15
                },
                {
                  label: 'Processing Latency',
                  prefix: '',
                  value: 3.2,
                  suffix: 's avg',
                  change: 25
                },
                {
                  label: 'Unacked Age',
                  prefix: '',
                  value: 45,
                  suffix: 's max',
                  change: 40
                }
              ]}
              time={localTime}
              startTime={0}
            />
            
            <motion.div
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-lg p-8 max-w-3xl mx-auto">
                <h3 className="text-3xl font-bold mb-4">The Lesson</h3>
                <p className="text-xl leading-relaxed">
                  Zero lag doesn't mean zero problems. Share Groups reveal what's really 
                  happening: how long messages wait, how often they fail, and where 
                  your system truly struggles.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-500 to-red-500"
          style={{ width: `${(time / duration) * 100}%` }}
        />
      </div>
    </div>
  )
}

export default ZeroLagFallacyScene