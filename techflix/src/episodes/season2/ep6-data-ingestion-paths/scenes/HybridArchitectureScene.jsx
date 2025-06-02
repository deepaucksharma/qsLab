import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CinematicTitle,
  ComparisonView,
  MetricDisplay,
  InteractiveQuiz,
  ParticleBackground
} from '../../../../components/StorytellingComponents'
import { getSceneState } from '../../../../utils/animationHelpers'
import ProgressiveReveal from '../../../../components/ProgressiveReveal'

const HybridArchitectureScene = ({ time = 0, duration = 10, onComplete }) => {
  const phases = {
    comparison: { start: 0, duration: 4 },
    bestPractices: { start: 4, duration: 4 },
    conclusion: { start: 8, duration: 2 }
  }
  
  const { phase, progress, localTime } = getSceneState(time, phases)
  const [decisionMade, setDecisionMade] = useState(false)
  const [selectedPath, setSelectedPath] = useState(null)
  
  const ingestionPaths = {
    direct: {
      name: 'Direct Producer',
      pros: ['Lowest latency', 'Full control', 'Custom partitioning'],
      cons: ['Complex error handling', 'Manual batching', 'Code maintenance'],
      useCase: 'Real-time event streaming',
      metrics: { latency: 2, throughput: 100000, complexity: 'High' }
    },
    connect: {
      name: 'Kafka Connect',
      pros: ['No code required', 'Built-in connectors', 'Automatic scaling'],
      cons: ['Higher latency', 'Less flexibility', 'Connector limitations'],
      useCase: 'Database CDC, File imports',
      metrics: { latency: 50, throughput: 50000, complexity: 'Low' }
    },
    streams: {
      name: 'Stream Processing',
      pros: ['Data transformation', 'Stateful processing', 'Join streams'],
      cons: ['Processing overhead', 'State management', 'Complex deployment'],
      useCase: 'ETL pipelines, Analytics',
      metrics: { latency: 10, throughput: 80000, complexity: 'Medium' }
    },
    hybrid: {
      name: 'Hybrid Approach',
      pros: ['Best of all worlds', 'Flexible architecture', 'Risk mitigation'],
      cons: ['Multiple systems', 'Operational overhead', 'Integration complexity'],
      useCase: 'Enterprise architectures',
      metrics: { latency: 5, throughput: 90000, complexity: 'Very High' }
    }
  }
  
  return (
    <div className="scene-container relative bg-black">
      {/* Convergence Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-black to-blue-900/20" />
        <ParticleBackground 
          particleCount={60}
          colors={['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b']}
          behavior="converge"
        />
      </div>
      
      <div className="relative z-10 h-full p-8 overflow-hidden">
        
        {/* Comparison Phase */}
        <AnimatePresence>
          {phase === 'comparison' && !decisionMade && (
            <motion.div
              className="max-w-7xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CinematicTitle
                title="Choosing Your Path"
                subtitle="Compare ingestion strategies"
                time={localTime}
                startTime={0}
              />
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(ingestionPaths).map(([key, path], index) => (
                  <motion.div
                    key={key}
                    className="bg-gray-900/50 backdrop-blur-lg rounded-lg p-6 border border-gray-700 cursor-pointer hover:border-purple-500 transition-all"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ 
                      opacity: localTime > index * 0.5 ? 1 : 0,
                      y: localTime > index * 0.5 ? 0 : 50
                    }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      setSelectedPath(key)
                      setDecisionMade(true)
                    }}
                  >
                    <h3 className="text-xl font-bold mb-3 text-purple-400">
                      {path.name}
                    </h3>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-green-400 mb-1">Pros:</h4>
                      <ul className="text-xs text-gray-300 space-y-1">
                        {path.pros.map((pro, i) => (
                          <li key={i}>• {pro}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-red-400 mb-1">Cons:</h4>
                      <ul className="text-xs text-gray-300 space-y-1">
                        {path.cons.map((con, i) => (
                          <li key={i}>• {con}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-700">
                      <p className="text-sm text-blue-400 font-semibold">
                        {path.useCase}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <motion.p
                className="text-center mt-8 text-xl text-gray-400"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Click on a path to explore deeper
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Selected Path Deep Dive */}
        {decisionMade && selectedPath && phase === 'comparison' && (
          <motion.div
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-5xl font-bold text-center mb-8 gradient-text">
              {ingestionPaths[selectedPath].name} Deep Dive
            </h2>
            
            <MetricDisplay
              metrics={[
                {
                  label: 'Latency',
                  value: ingestionPaths[selectedPath].metrics.latency,
                  suffix: 'ms',
                  prefix: '',
                  change: null
                },
                {
                  label: 'Throughput',
                  value: ingestionPaths[selectedPath].metrics.throughput,
                  suffix: '/s',
                  prefix: '',
                  change: null
                },
                {
                  label: 'Complexity',
                  value: ingestionPaths[selectedPath].metrics.complexity,
                  suffix: '',
                  prefix: '',
                  change: null
                }
              ]}
              time={localTime}
              startTime={0}
            />
            
            <motion.button
              className="mt-8 mx-auto block px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
              onClick={() => setDecisionMade(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Compare Other Options
            </motion.button>
          </motion.div>
        )}
        
        {/* Best Practices Phase */}
        {phase === 'bestPractices' && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-8">
              Hybrid Architecture Best Practices
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ComparisonView
                before={{
                  label: 'Common Mistakes',
                  content: (
                    <ul className="space-y-3 text-gray-300">
                      <li>❌ One-size-fits-all approach</li>
                      <li>❌ Ignoring operational complexity</li>
                      <li>❌ Over-engineering simple use cases</li>
                      <li>❌ Neglecting monitoring setup</li>
                      <li>❌ Poor error handling strategies</li>
                    </ul>
                  )
                }}
                after={{
                  label: 'Best Practices',
                  content: (
                    <ul className="space-y-3 text-gray-300">
                      <li>✅ Match pattern to use case</li>
                      <li>✅ Start simple, evolve gradually</li>
                      <li>✅ Implement comprehensive monitoring</li>
                      <li>✅ Design for failure scenarios</li>
                      <li>✅ Document architectural decisions</li>
                    </ul>
                  )
                }}
                time={localTime}
                startTime={0}
              />
            </div>
            
            <motion.div
              className="mt-12 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-8 border border-purple-600/50"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
            >
              <h3 className="text-2xl font-bold mb-4 text-center">
                The Hybrid Advantage
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-4xl mb-2">🎯</div>
                  <h4 className="font-bold text-purple-400">Direct API</h4>
                  <p className="text-sm text-gray-300">For critical real-time events</p>
                </div>
                <div>
                  <div className="text-4xl mb-2">🔌</div>
                  <h4 className="font-bold text-blue-400">Connect</h4>
                  <p className="text-sm text-gray-300">For bulk data ingestion</p>
                </div>
                <div>
                  <div className="text-4xl mb-2">🔄</div>
                  <h4 className="font-bold text-green-400">Streams</h4>
                  <p className="text-sm text-gray-300">For data enrichment</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        
        {/* Conclusion Phase */}
        {phase === 'conclusion' && (
          <motion.div
            className="flex items-center justify-center h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="max-w-4xl text-center">
              <InteractiveQuiz
                question="What's the most important factor when choosing an ingestion path?"
                options={[
                  'Maximum throughput capability',
                  'Matching the pattern to your specific use case',
                  'Using the newest technology',
                  'Minimizing operational complexity'
                ]}
                correctAnswer={1}
                onComplete={(correct) => {
                  if (onComplete) onComplete(correct)
                }}
                time={localTime}
              />
              
              {localTime > 1 && (
                <motion.div
                  className="mt-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <h2 className="text-5xl font-black mb-4">
                    <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
                      Your Data, Your Choice
                    </span>
                  </h2>
                  <p className="text-2xl text-gray-300">
                    Master all paths. Use them wisely.
                  </p>
                </motion.div>
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
    </div>
  )
}

export default HybridArchitectureScene