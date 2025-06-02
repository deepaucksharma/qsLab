import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CinematicTitle,
  MetricDisplay,
  ArchitectureDiagram,
  CodeDemo,
  ParticleBackground
} from '../../../../components/StorytellingComponents'
import { getSceneState } from '../../../../utils/animationHelpers'
import AnimatedMetricCounter from '../../../../components/AnimatedMetricCounter'
import ProgressiveReveal from '../../../../components/ProgressiveReveal'

const ScalingChallengesScene = ({ time = 0, duration = 15 }) => {
  const phases = {
    currentState: { start: 0, duration: 5 },
    challenges: { start: 5, duration: 7 },
    solutions: { start: 12, duration: 3 }
  }
  
  const { phase, progress, localTime } = getSceneState(time, phases)
  const [activeChallenge, setActiveChallenge] = useState(0)
  
  // Scaling architecture visualization
  const scalingNodes = [
    // Current cluster
    { id: 'broker1', label: 'Broker 1', icon: '🖥️', x: 30, y: 30, description: '95% CPU' },
    { id: 'broker2', label: 'Broker 2', icon: '🖥️', x: 30, y: 50, description: '92% CPU' },
    { id: 'broker3', label: 'Broker 3', icon: '🖥️', x: 30, y: 70, description: '98% CPU' },
    // Scaled cluster
    { id: 'newbroker1', label: 'Broker 4', icon: '✨', x: 70, y: 20, description: 'New' },
    { id: 'newbroker2', label: 'Broker 5', icon: '✨', x: 70, y: 40, description: 'New' },
    { id: 'newbroker3', label: 'Broker 6', icon: '✨', x: 70, y: 60, description: 'New' },
    { id: 'newbroker4', label: 'Broker 7', icon: '✨', x: 70, y: 80, description: 'New' }
  ]
  
  const scalingChallenges = [
    {
      name: 'Data Rebalancing',
      description: 'Moving petabytes during expansion',
      impact: 'Hours of degraded performance',
      solution: 'Cruise Control for automated balancing',
      code: `// Rebalancing Impact
Before: 3 brokers, 300 partitions each
After: 7 brokers, need to move 471 partitions

Estimated time: 6-12 hours
Network impact: 500 MB/s sustained
Client impact: Increased latency`
    },
    {
      name: 'State Management',
      description: 'Coordinator overhead explosion',
      impact: 'Rebalancing storms, memory pressure',
      solution: 'Incremental cooperative rebalancing',
      code: `// Consumer Group Coordination
Active groups: 1,500
Consumers per group: 50
Total state entries: 75,000

Rebalance triggers: 150/hour
Average rebalance time: 45 seconds
Downtime per day: 1.875 hours`
    },
    {
      name: 'Network Topology',
      description: 'Cross-AZ bandwidth costs',
      impact: '$10K+ monthly in transfer fees',
      solution: 'Rack-aware replica placement',
      code: `// Network Topology Configuration
broker.rack=us-east-1a
replica.selector.class=RackAwareReplicaSelector

# Follower fetching from same AZ
replica.lag.time.max.ms=30000
replica.fetch.min.bytes=1048576`
    }
  ]
  
  const currentChallenge = scalingChallenges[activeChallenge]
  
  return (
    <div className="scene-container relative bg-black">
      {/* Scaling Visualization Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-black to-blue-900/20" />
        <ParticleBackground 
          particleCount={50}
          colors={['#06b6d4', '#3b82f6', '#6366f1']}
          behavior="expand"
        />
      </div>
      
      <div className="relative z-10 h-full p-8 overflow-hidden">
        
        {/* Current State Phase */}
        <AnimatePresence>
          {phase === 'currentState' && (
            <motion.div
              className="max-w-7xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CinematicTitle
                title="Scaling Kafka"
                subtitle="When growth meets architecture"
                time={localTime}
                startTime={0}
              />
              
              <motion.div
                className="mt-12 relative h-96"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <ArchitectureDiagram
                  nodes={scalingNodes.slice(0, 3)}
                  connections={[]}
                  time={localTime}
                  startTime={1}
                />
                
                {/* Stress indicators */}
                {localTime > 2 && (
                  <motion.div
                    className="absolute top-10 left-1/2 transform -translate-x-1/2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="bg-red-900/50 backdrop-blur-lg rounded-lg p-4 border border-red-600">
                      <h3 className="text-xl font-bold text-red-400 mb-2">
                        ⚠️ Cluster Under Stress
                      </h3>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">CPU:</span>
                          <AnimatedMetricCounter
                            value={95}
                            suffix="%"
                            className="text-lg font-mono text-red-400"
                          />
                        </div>
                        <div>
                          <span className="text-gray-400">Network:</span>
                          <AnimatedMetricCounter
                            value={8.5}
                            suffix=" Gb/s"
                            decimals={1}
                            className="text-lg font-mono text-orange-400"
                          />
                        </div>
                        <div>
                          <span className="text-gray-400">Disk I/O:</span>
                          <AnimatedMetricCounter
                            value={85}
                            suffix="%"
                            className="text-lg font-mono text-yellow-400"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
              
              <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: localTime > 3 ? 1 : 0, y: localTime > 3 ? 0 : 20 }}
              >
                <p className="text-2xl text-gray-300">
                  Your cluster is at <span className="text-red-400 font-bold">95% capacity</span>
                </p>
                <p className="text-xl text-gray-400 mt-2">
                  Time to scale... but at what cost?
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Challenges Phase */}
        {phase === 'challenges' && (
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-8">
              The Scaling Gauntlet
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Challenge Selector */}
              <div className="lg:col-span-1 space-y-3">
                {scalingChallenges.map((challenge, index) => (
                  <motion.button
                    key={index}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      activeChallenge === index
                        ? 'bg-cyan-600/30 border-2 border-cyan-500'
                        : 'bg-gray-900/50 border border-gray-700 hover:border-cyan-600'
                    }`}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ 
                      opacity: localTime > index * 0.5 ? 1 : 0,
                      x: localTime > index * 0.5 ? 0 : -50
                    }}
                    onClick={() => setActiveChallenge(index)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <h3 className="font-bold text-lg text-cyan-400 mb-1">
                      {challenge.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {challenge.description}
                    </p>
                  </motion.button>
                ))}
              </div>
              
              {/* Challenge Details */}
              <motion.div
                className="lg:col-span-2 space-y-6"
                key={activeChallenge}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="bg-gray-900/50 backdrop-blur-lg rounded-lg p-6 border border-cyan-600/50">
                  <h3 className="text-2xl font-bold mb-4 text-cyan-400">
                    {currentChallenge.name}
                  </h3>
                  
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-red-400 mb-2">
                      Impact
                    </h4>
                    <p className="text-gray-300">{currentChallenge.impact}</p>
                  </div>
                  
                  <CodeDemo
                    code={currentChallenge.code}
                    language="yaml"
                    time={localTime}
                    startTime={0}
                  />
                  
                  <div className="mt-4 p-4 bg-green-900/30 rounded-lg border border-green-600/50">
                    <h4 className="text-lg font-semibold text-green-400 mb-2">
                      Solution
                    </h4>
                    <p className="text-gray-300">{currentChallenge.solution}</p>
                  </div>
                </div>
                
                {/* Visual representation of scaling */}
                {localTime > 3 && (
                  <motion.div
                    className="relative h-64"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <ArchitectureDiagram
                      nodes={scalingNodes}
                      connections={[
                        { x1: '35%', y1: '50%', x2: '65%', y2: '50%' }
                      ]}
                      time={localTime}
                      startTime={3}
                    />
                    
                    <motion.div
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-4xl">⚡</span>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        )}
        
        {/* Solutions Phase */}
        {phase === 'solutions' && (
          <motion.div
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-5xl font-bold text-center mb-12 gradient-text">
              Scaling Strategies
            </h2>
            
            <MetricDisplay
              metrics={[
                {
                  label: 'Horizontal Scale',
                  value: '10x',
                  suffix: ' capacity',
                  prefix: '',
                  change: 900
                },
                {
                  label: 'Rebalance Time',
                  value: 90,
                  suffix: '% faster',
                  prefix: '',
                  change: null
                },
                {
                  label: 'Cost Efficiency',
                  value: 40,
                  suffix: '% savings',
                  prefix: '',
                  change: null
                },
                {
                  label: 'Availability',
                  value: 99.99,
                  suffix: '%',
                  prefix: '',
                  change: 0.9
                }
              ]}
              time={localTime}
              startTime={0}
            />
            
            <motion.div
              className="mt-12 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg p-8"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <h3 className="text-3xl font-bold mb-6 text-center">
                Modern Scaling Playbook
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xl font-bold mb-3">Immediate Actions</h4>
                  <ul className="space-y-2">
                    <li>✓ Enable Cruise Control</li>
                    <li>✓ Implement rack awareness</li>
                    <li>✓ Optimize batch sizes</li>
                    <li>✓ Use compression (LZ4/Zstd)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-3">Long-term Strategy</h4>
                  <ul className="space-y-2">
                    <li>✓ Multi-region deployment</li>
                    <li>✓ Tiered storage adoption</li>
                    <li>✓ KRaft migration</li>
                    <li>✓ Cloud-native transition</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
          style={{ width: `${(time / duration) * 100}%` }}
        />
      </div>
    </div>
  )
}

export default ScalingChallengesScene