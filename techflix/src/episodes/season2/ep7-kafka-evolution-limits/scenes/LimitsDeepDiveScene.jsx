import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CinematicTitle,
  CodeDemo,
  ArchitectureDiagram,
  ComparisonView,
  ParticleBackground
} from '../../../../components/StorytellingComponents'
import { getSceneState, getStaggeredDelay } from '../../../../utils/animationHelpers'
import AnimatedMetricCounter from '../../../../components/AnimatedMetricCounter'
import ProgressiveReveal from '../../../../components/ProgressiveReveal'

const LimitsDeepDiveScene = ({ time = 0, duration = 18 }) => {
  const phases = {
    theoretical: { start: 0, duration: 6 },
    practical: { start: 6, duration: 8 },
    workarounds: { start: 14, duration: 4 }
  }
  
  const { phase, progress, localTime } = getSceneState(time, phases)
  const [selectedLimit, setSelectedLimit] = useState('partitions')
  
  const kafkaLimits = {
    partitions: {
      name: 'Partition Limits',
      theoretical: '200,000 per cluster',
      practical: '4,000 per broker',
      impact: 'Coordinator overhead, rebalancing storms',
      workaround: 'Multi-cluster architecture',
      visualization: {
        current: 4000,
        max: 200000,
        recommended: 50000
      }
    },
    topics: {
      name: 'Topic Count',
      theoretical: 'Unlimited',
      practical: '10,000 per cluster',
      impact: 'Metadata management, controller load',
      workaround: 'Topic namespacing, archival strategies',
      visualization: {
        current: 5000,
        max: 50000,
        recommended: 10000
      }
    },
    throughput: {
      name: 'Message Throughput',
      theoretical: '10 GB/s per broker',
      practical: '1-2 GB/s sustained',
      impact: 'Network saturation, disk I/O limits',
      workaround: 'Compression, batch optimization',
      visualization: {
        current: 1.5,
        max: 10,
        recommended: 2
      }
    },
    connections: {
      name: 'Client Connections',
      theoretical: '100,000 per broker',
      practical: '10,000 active',
      impact: 'Memory usage, CPU overhead',
      workaround: 'Connection pooling, proxy layers',
      visualization: {
        current: 8000,
        max: 100000,
        recommended: 10000
      }
    }
  }
  
  const currentLimit = kafkaLimits[selectedLimit]
  
  return (
    <div className="scene-container relative bg-black">
      {/* Warning System Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-orange-900/20" />
        <ParticleBackground 
          particleCount={40}
          colors={['#ef4444', '#f97316', '#facc15']}
          behavior="warning"
        />
      </div>
      
      <div className="relative z-10 h-full p-8 overflow-hidden">
        
        {/* Theoretical Phase */}
        <AnimatePresence>
          {phase === 'theoretical' && (
            <motion.div
              className="max-w-7xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CinematicTitle
                title="The Limits"
                subtitle="Where Kafka meets reality"
                time={localTime}
                startTime={0}
              />
              
              <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(kafkaLimits).map(([key, limit], index) => (
                  <motion.button
                    key={key}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      selectedLimit === key
                        ? 'bg-red-900/50 border-red-500'
                        : 'bg-gray-900/50 border-gray-700 hover:border-orange-600'
                    }`}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ 
                      opacity: localTime > getStaggeredDelay(index, 0.3) ? 1 : 0,
                      y: localTime > getStaggeredDelay(index, 0.3) ? 0 : 50
                    }}
                    onClick={() => setSelectedLimit(key)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <h3 className="text-xl font-bold mb-2 text-orange-400">
                      {limit.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {limit.theoretical}
                    </p>
                  </motion.button>
                ))}
              </div>
              
              {/* Limit Visualization */}
              <motion.div
                className="mt-8 bg-gray-900/50 backdrop-blur-lg rounded-lg p-8 border border-red-600/50"
                key={selectedLimit}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <h3 className="text-2xl font-bold mb-6 text-red-400">
                  {currentLimit.name} Analysis
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Current Usage</span>
                      <AnimatedMetricCounter
                        value={currentLimit.visualization.current}
                        suffix={selectedLimit === 'throughput' ? ' GB/s' : ''}
                        decimals={selectedLimit === 'throughput' ? 1 : 0}
                        className="text-xl font-mono text-yellow-400"
                      />
                    </div>
                    <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${(currentLimit.visualization.current / currentLimit.visualization.max) * 100}%` 
                        }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-gray-400">Practical</div>
                      <div className="text-lg font-bold text-orange-400">
                        {currentLimit.practical}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Recommended</div>
                      <div className="text-lg font-bold text-yellow-400">
                        {currentLimit.visualization.recommended}
                        {selectedLimit === 'throughput' ? ' GB/s' : ''}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Theoretical</div>
                      <div className="text-lg font-bold text-red-400">
                        {currentLimit.theoretical}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Practical Phase */}
        {phase === 'practical' && (
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-8">
              Real-World Impact
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ComparisonView
                before={{
                  label: 'Below Limits',
                  content: (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">✅</span>
                        <span>Stable performance</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">✅</span>
                        <span>Quick rebalancing</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">✅</span>
                        <span>Low latency</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">✅</span>
                        <span>Easy operations</span>
                      </div>
                    </div>
                  )
                }}
                after={{
                  label: 'Hitting Limits',
                  content: (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">❌</span>
                        <span>Performance degradation</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">❌</span>
                        <span>Rebalancing storms</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">❌</span>
                        <span>Increased latency</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">❌</span>
                        <span>Operational nightmares</span>
                      </div>
                    </div>
                  )
                }}
                time={localTime}
                startTime={0}
              />
              
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <div className="bg-red-900/30 backdrop-blur-lg rounded-lg p-6 border border-red-600/50">
                  <h3 className="text-xl font-bold mb-4 text-red-400">
                    Common Symptoms
                  </h3>
                  <CodeDemo
                    code={`// Controller logs showing partition limit stress
[Controller] ERROR Partition reassignment failed
  Reason: Too many partitions (50,432)
  Time spent: 45.3 seconds
  
// Broker memory pressure
[Broker-1] WARN JVM heap usage at 95%
  Active partitions: 4,821
  Memory per partition: ~2MB
  
// Client timeouts
[Producer] ERROR Send failed after 3 retries
  org.apache.kafka.common.errors.TimeoutException:
  Expiring 1847 records: 30000ms has passed`}
                    language="log"
                    time={localTime}
                    startTime={1}
                  />
                </div>
              </motion.div>
            </div>
            
            {/* Warning Alert */}
            {localTime > 4 && (
              <motion.div
                className="mt-8 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg p-6 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  boxShadow: [
                    '0 0 20px rgba(239, 68, 68, 0.5)',
                    '0 0 40px rgba(239, 68, 68, 0.8)',
                    '0 0 20px rgba(239, 68, 68, 0.5)'
                  ]
                }}
                transition={{ 
                  boxShadow: { duration: 2, repeat: Infinity }
                }}
              >
                <h3 className="text-2xl font-bold mb-2">⚠️ Critical Insight</h3>
                <p className="text-lg">
                  Hitting Kafka limits isn't gradual - it's a cliff. 
                  Plan your architecture before you reach the edge.
                </p>
              </motion.div>
            )}
          </div>
        )}
        
        {/* Workarounds Phase */}
        {phase === 'workarounds' && (
          <motion.div
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-5xl font-bold text-center mb-12 gradient-text">
              Breaking Through Limits
            </h2>
            
            <ProgressiveReveal delay={0} stagger={0.5}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  className="bg-gradient-to-br from-green-900/30 to-blue-900/30 rounded-lg p-6 border border-green-600/50"
                  whileHover={{ scale: 1.02 }}
                >
                  <h3 className="text-2xl font-bold mb-4 text-green-400">
                    Multi-Cluster Strategy
                  </h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Federate by business domain</li>
                    <li>• Geographic distribution</li>
                    <li>• Cluster mesh with MirrorMaker 2</li>
                    <li>• Independent scaling paths</li>
                  </ul>
                </motion.div>
                
                <motion.div
                  className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-lg p-6 border border-blue-600/50"
                  whileHover={{ scale: 1.02 }}
                >
                  <h3 className="text-2xl font-bold mb-4 text-blue-400">
                    Tiered Storage
                  </h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Offload cold data to object storage</li>
                    <li>• Reduce broker disk pressure</li>
                    <li>• Infinite retention capability</li>
                    <li>• Cost-effective scaling</li>
                  </ul>
                </motion.div>
                
                <motion.div
                  className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg p-6 border border-purple-600/50"
                  whileHover={{ scale: 1.02 }}
                >
                  <h3 className="text-2xl font-bold mb-4 text-purple-400">
                    KRaft Mode
                  </h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Remove ZooKeeper bottleneck</li>
                    <li>• Faster metadata operations</li>
                    <li>• Higher partition limits</li>
                    <li>• Simplified operations</li>
                  </ul>
                </motion.div>
                
                <motion.div
                  className="bg-gradient-to-br from-pink-900/30 to-orange-900/30 rounded-lg p-6 border border-pink-600/50"
                  whileHover={{ scale: 1.02 }}
                >
                  <h3 className="text-2xl font-bold mb-4 text-pink-400">
                    Cloud-Native Solutions
                  </h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Managed Kafka services</li>
                    <li>• Elastic scaling</li>
                    <li>• Serverless streaming</li>
                    <li>• Pay-per-use models</li>
                  </ul>
                </motion.div>
              </div>
            </ProgressiveReveal>
          </motion.div>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
        <motion.div
          className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"
          style={{ width: `${(time / duration) * 100}%` }}
        />
      </div>
    </div>
  )
}

export default LimitsDeepDiveScene