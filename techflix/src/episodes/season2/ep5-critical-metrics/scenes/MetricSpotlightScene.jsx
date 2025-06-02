import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MetricDisplay,
  CodeDemo,
  Timeline,
  ParticleBackground
} from '../../../../components/StorytellingComponents'
import { getSceneState, lerp, easings } from '../../../../utils/animationHelpers'
import AnimatedMetricCounter from '../../../../components/AnimatedMetricCounter'

const MetricSpotlightScene = ({ time = 0, duration = 15 }) => {
  const phases = {
    intro: { start: 0, duration: 2 },
    deepDive: { start: 2, duration: 8 },
    comparison: { start: 10, duration: 3 },
    revelation: { start: 13, duration: 2 }
  }
  
  const { phase, progress, localTime } = getSceneState(time, phases)
  const [activeMetric, setActiveMetric] = useState(0)
  
  useEffect(() => {
    if (phase === 'deepDive') {
      const metricIndex = Math.floor(localTime / 2) % 4
      setActiveMetric(metricIndex)
    }
  }, [phase, localTime])
  
  const shareGroupMetrics = [
    {
      name: 'records-unacknowledged-age-ms',
      description: 'Age of oldest unacknowledged record',
      importance: 'Critical for SLA monitoring',
      value: 250,
      unit: 'ms',
      trend: -15
    },
    {
      name: 'redelivery-count',
      description: 'Number of message redeliveries',
      importance: 'Indicates processing failures',
      value: 42,
      unit: 'count',
      trend: 8
    },
    {
      name: 'max-lock-duration-ms',
      description: 'Maximum time a record is locked',
      importance: 'Shows processing bottlenecks',
      value: 1800,
      unit: 'ms',
      trend: -5
    },
    {
      name: 'partition-load-distribution',
      description: 'Balance across consumers',
      importance: 'Ensures even processing',
      value: 94,
      unit: '%',
      trend: 3
    }
  ]
  
  const currentMetric = shareGroupMetrics[activeMetric]
  
  return (
    <div className="scene-container relative bg-black">
      {/* Tech Grid Background */}
      <div className="absolute inset-0 bg-tech-grid opacity-20" />
      <ParticleBackground 
        particleCount={20}
        colors={['#3b82f6', '#10b981']}
        behavior="orbit"
      />
      
      <div className="relative z-10 h-full p-8 overflow-hidden">
        
        {/* Intro Phase */}
        <AnimatePresence>
          {phase === 'intro' && (
            <motion.div
              className="flex items-center justify-center h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center">
                <motion.div
                  className="text-8xl font-black mb-4"
                  animate={{
                    backgroundImage: [
                      'linear-gradient(45deg, #3b82f6 0%, #10b981 100%)',
                      'linear-gradient(45deg, #10b981 0%, #f59e0b 100%)',
                      'linear-gradient(45deg, #f59e0b 0%, #3b82f6 100%)'
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  METRICS SPOTLIGHT
                </motion.div>
                <p className="text-2xl text-gray-400">
                  Deep dive into Share Group observability
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Deep Dive Phase */}
        {phase === 'deepDive' && (
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 text-center">
              Share Group Metric Deep Dive
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Metric Carousel */}
              <div className="space-y-6">
                {shareGroupMetrics.map((metric, index) => (
                  <motion.div
                    key={metric.name}
                    className={`metric-card cursor-pointer ${
                      activeMetric === index ? 'border-blue-500' : 'border-gray-700'
                    }`}
                    animate={{
                      scale: activeMetric === index ? 1.02 : 1,
                      borderWidth: activeMetric === index ? 2 : 1
                    }}
                    onClick={() => setActiveMetric(index)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-mono text-blue-400">
                          {metric.name}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {metric.description}
                        </p>
                      </div>
                      <AnimatedMetricCounter
                        value={activeMetric === index ? metric.value : 0}
                        suffix={metric.unit}
                        className="text-3xl font-bold text-white"
                        duration={1000}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {metric.importance}
                      </span>
                      <span className={`text-sm font-bold ${
                        metric.trend > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {metric.trend > 0 ? '↑' : '↓'} {Math.abs(metric.trend)}%
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Visualization Panel */}
              <div className="space-y-6">
                <motion.div
                  className="bg-gray-900/50 rounded-lg p-6 border border-gray-700"
                  key={activeMetric}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h4 className="text-lg font-bold mb-4 text-gray-300">
                    Monitoring {shareGroupMetrics[activeMetric].name}
                  </h4>
                  
                  <CodeDemo
                    code={`// JMX MBean Query
ObjectName: kafka.consumer:type=share-group-coordinator-metrics,
            share-group-id=my-share-group

// Prometheus Query
kafka_consumer_share_group_${shareGroupMetrics[activeMetric].name.replace(/-/g, '_')}
{share_group_id="my-share-group"}

// Alert Rule
alert: HighProcessingLatency
expr: ${shareGroupMetrics[activeMetric].name} > ${shareGroupMetrics[activeMetric].value * 2}
for: 5m
labels:
  severity: warning`}
                  />
                </motion.div>
                
                {/* Real-time Graph Simulation */}
                <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
                  <h4 className="text-lg font-bold mb-4 text-gray-300">
                    Real-time Trend
                  </h4>
                  <div className="h-32 relative">
                    {Array.from({ length: 20 }).map((_, i) => {
                      const height = 30 + Math.sin((localTime + i) * 0.5) * 20 + Math.random() * 10
                      return (
                        <motion.div
                          key={i}
                          className="absolute bottom-0 bg-blue-500"
                          style={{
                            left: `${i * 5}%`,
                            width: '4%',
                            height: `${height}%`
                          }}
                          animate={{ opacity: [0.3, 0.8, 0.3] }}
                          transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Comparison Phase */}
        {phase === 'comparison' && (
          <motion.div
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-5xl font-bold text-center mb-12 gradient-text">
              Traditional vs Modern Metrics
            </h2>
            
            <MetricDisplay
              metrics={[
                { label: 'Consumer Lag', value: 50000, suffix: ' msgs', change: -20 },
                { label: 'Unacked Age', value: 250, suffix: 'ms', change: -40 },
                { label: 'Redelivery Rate', value: 0.3, suffix: '%', change: -60 },
                { label: 'Lock Efficiency', value: 98.5, suffix: '%', change: 15 }
              ]}
            />
            
            <motion.div
              className="mt-12 text-center"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <p className="text-2xl text-gray-300">
                Share Groups provide <span className="text-green-400 font-bold">10x</span> more granular insights
              </p>
            </motion.div>
          </motion.div>
        )}
        
        {/* Revelation Phase */}
        {phase === 'revelation' && (
          <motion.div
            className="flex items-center justify-center h-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <div className="text-center max-w-4xl">
              <motion.h2
                className="text-7xl font-black mb-8"
                animate={{
                  color: ['#3b82f6', '#10b981', '#f59e0b', '#3b82f6']
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Metrics That Matter
              </motion.h2>
              <p className="text-3xl text-gray-300 leading-relaxed">
                Stop measuring what's easy.<br />
                Start measuring what's <span className="text-green-400 font-bold">important</span>.
              </p>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Scene Progress */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-green-500"
          style={{ width: `${(time / duration) * 100}%` }}
        />
      </div>
    </div>
  )
}

export default MetricSpotlightScene