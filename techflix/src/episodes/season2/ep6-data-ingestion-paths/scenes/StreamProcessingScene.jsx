import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CinematicTitle,
  CodeDemo,
  ArchitectureDiagram,
  Timeline,
  ParticleBackground
} from '../../../../components/StorytellingComponents'
import { getSceneState, getStaggeredDelay } from '../../../../utils/animationHelpers'
import ProgressiveReveal from '../../../../components/ProgressiveReveal'

const StreamProcessingScene = ({ time = 0, duration = 15 }) => {
  const phases = {
    concepts: { start: 0, duration: 4 },
    implementation: { start: 4, duration: 8 },
    patterns: { start: 12, duration: 3 }
  }
  
  const { phase, progress, localTime } = getSceneState(time, phases)
  const [activePattern, setActivePattern] = useState(0)
  
  useEffect(() => {
    if (phase === 'implementation') {
      const patternIndex = Math.floor(localTime / 2) % 4
      setActivePattern(patternIndex)
    }
  }, [phase, localTime])
  
  // Stream processing architecture
  const streamNodes = [
    { id: 'source', label: 'Source Topic', icon: '📥', x: 20, y: 50, description: 'Raw events' },
    { id: 'stream1', label: 'Filter', icon: '🔍', x: 40, y: 30, description: 'Remove noise' },
    { id: 'stream2', label: 'Transform', icon: '🔄', x: 40, y: 70, description: 'Enrich data' },
    { id: 'stream3', label: 'Aggregate', icon: '📊', x: 60, y: 50, description: 'Time windows' },
    { id: 'sink', label: 'Sink Topic', icon: '📤', x: 80, y: 50, description: 'Processed' }
  ]
  
  const streamConnections = [
    { x1: '25%', y1: '50%', x2: '35%', y2: '30%' },
    { x1: '25%', y1: '50%', x2: '35%', y2: '70%' },
    { x1: '45%', y1: '30%', x2: '55%', y2: '50%' },
    { x1: '45%', y1: '70%', x2: '55%', y2: '50%' },
    { x1: '65%', y1: '50%', x2: '75%', y2: '50%' }
  ]
  
  const processingPatterns = [
    {
      name: 'Stateless Transformation',
      description: 'Simple event mapping and filtering',
      code: `// Kafka Streams - Stateless Processing
KStream<String, Order> orders = builder.stream("orders");

KStream<String, Order> highValueOrders = orders
  .filter((key, order) -> order.getAmount() > 1000)
  .mapValues(order -> {
    order.setPriority("HIGH");
    return order;
  });

highValueOrders.to("high-value-orders");`
    },
    {
      name: 'Stateful Aggregation',
      description: 'Time-windowed analytics',
      code: `// Windowed Aggregation
KStream<String, Transaction> transactions = 
  builder.stream("transactions");

KTable<Windowed<String>, Long> hourlyCount = transactions
  .groupByKey()
  .windowedBy(TimeWindows.of(Duration.ofHours(1)))
  .count()
  .suppress(Suppressed.untilWindowCloses(
    Suppressed.BufferConfig.unbounded()
  ));

hourlyCount.toStream().to("hourly-stats");`
    },
    {
      name: 'Stream Joins',
      description: 'Correlate multiple streams',
      code: `// Stream-Stream Join
KStream<String, Click> clicks = builder.stream("clicks");
KStream<String, Impression> impressions = 
  builder.stream("impressions");

KStream<String, ClickThrough> clickThroughs = clicks
  .join(impressions,
    (click, impression) -> 
      new ClickThrough(click, impression),
    JoinWindows.of(Duration.ofMinutes(5))
  );

clickThroughs.to("click-through-rate");`
    },
    {
      name: 'Pattern Detection',
      description: 'Complex event processing',
      code: `// Fraud Detection Pattern
KStream<String, Payment> payments = 
  builder.stream("payments");

payments
  .groupByKey()
  .windowedBy(SessionWindows.with(Duration.ofMinutes(5)))
  .aggregate(
    FraudDetector::new,
    (key, payment, detector) -> 
      detector.addPayment(payment),
    Materialized.with(Serdes.String(), 
      fraudDetectorSerde)
  )
  .filter((window, detector) -> detector.isSuspicious())
  .toStream()
  .to("fraud-alerts");`
    }
  ]
  
  const currentPattern = processingPatterns[activePattern]
  
  return (
    <div className="scene-container relative bg-black">
      {/* Stream Flow Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-black to-teal-900/20" />
        <ParticleBackground 
          particleCount={40}
          colors={['#10b981', '#14b8a6', '#06b6d4']}
          behavior="stream"
        />
      </div>
      
      <div className="relative z-10 h-full p-8 overflow-hidden">
        
        {/* Concepts Phase */}
        <AnimatePresence>
          {phase === 'concepts' && (
            <motion.div
              className="max-w-6xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CinematicTitle
                title="Stream Processing"
                subtitle="Transform data in motion"
                time={localTime}
                startTime={0}
              />
              
              <motion.div
                className="mt-12 relative h-64"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <ArchitectureDiagram
                  nodes={streamNodes}
                  connections={streamConnections}
                  time={localTime}
                  startTime={1}
                />
                
                {/* Data flow visualization */}
                {localTime > 2 && (
                  <div className="absolute inset-0 pointer-events-none">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute w-4 h-4 bg-green-400 rounded-full"
                        initial={{ left: '20%', top: '50%', opacity: 0 }}
                        animate={{
                          left: '80%',
                          opacity: [0, 1, 1, 0]
                        }}
                        transition={{
                          duration: 3,
                          delay: i * 0.5,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
              
              <motion.div
                className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: localTime > 2.5 ? 1 : 0, y: localTime > 2.5 ? 0 : 50 }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">⚡</div>
                  <h3 className="text-xl font-bold text-green-400">Real-time</h3>
                  <p className="text-gray-400">Process as data arrives</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">🔄</div>
                  <h3 className="text-xl font-bold text-teal-400">Stateful</h3>
                  <p className="text-gray-400">Maintain processing state</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">📈</div>
                  <h3 className="text-xl font-bold text-cyan-400">Scalable</h3>
                  <p className="text-gray-400">Elastic processing power</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Implementation Phase */}
        {phase === 'implementation' && (
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-8">
              Stream Processing Patterns
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pattern Selector */}
              <div className="lg:col-span-1">
                <h3 className="text-2xl font-bold mb-4 text-green-400">
                  Pattern Library
                </h3>
                <div className="space-y-3">
                  {processingPatterns.map((pattern, index) => (
                    <motion.button
                      key={index}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        activePattern === index
                          ? 'bg-green-600/30 border-2 border-green-500'
                          : 'bg-gray-900/50 border border-gray-700 hover:border-gray-600'
                      }`}
                      onClick={() => setActivePattern(index)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <h4 className="font-bold mb-1">{pattern.name}</h4>
                      <p className="text-sm text-gray-400">{pattern.description}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
              
              {/* Code Display */}
              <motion.div
                className="lg:col-span-2"
                key={activePattern}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-2xl font-bold mb-4 text-teal-400">
                  {currentPattern.name} Implementation
                </h3>
                <CodeDemo
                  code={currentPattern.code}
                  language="java"
                  time={localTime}
                  startTime={0}
                  highlights={[
                    { start: 1, end: 3, lines: [3, 4, 5] },
                    { start: 3, end: 5, lines: [7, 8, 9] }
                  ]}
                />
                
                {/* Pattern Benefits */}
                <motion.div
                  className="mt-6 grid grid-cols-2 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-green-600/30">
                    <h4 className="font-bold text-green-400 mb-2">Use Cases</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Real-time analytics</li>
                      <li>• Data enrichment</li>
                      <li>• Event correlation</li>
                    </ul>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-teal-600/30">
                    <h4 className="font-bold text-teal-400 mb-2">Benefits</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Low latency processing</li>
                      <li>• Exactly-once semantics</li>
                      <li>• Fault tolerance</li>
                    </ul>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        )}
        
        {/* Patterns Phase */}
        {phase === 'patterns' && (
          <motion.div
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-5xl font-bold text-center mb-12 gradient-text">
              Choose Your Pattern
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ProgressiveReveal delay={0} stagger={0.3}>
                <motion.div
                  className="bg-gradient-to-br from-green-900/30 to-teal-900/30 rounded-lg p-6 border border-green-600/50"
                  whileHover={{ scale: 1.05 }}
                >
                  <h3 className="text-2xl font-bold mb-4 text-green-400">
                    When to Use Stream Processing
                  </h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>✓ Need real-time data transformation</li>
                    <li>✓ Complex event processing required</li>
                    <li>✓ Stateful computations across events</li>
                    <li>✓ Low-latency analytics</li>
                  </ul>
                </motion.div>
                
                <motion.div
                  className="bg-gradient-to-br from-teal-900/30 to-cyan-900/30 rounded-lg p-6 border border-teal-600/50"
                  whileHover={{ scale: 1.05 }}
                >
                  <h3 className="text-2xl font-bold mb-4 text-teal-400">
                    Best Practices
                  </h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>⚡ Design for idempotency</li>
                    <li>🔄 Handle late-arriving data</li>
                    <li>💾 Manage state carefully</li>
                    <li>📊 Monitor processing lag</li>
                  </ul>
                </motion.div>
              </ProgressiveReveal>
            </div>
            
            <motion.div
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <p className="text-2xl text-gray-300">
                Stream processing: Where <span className="text-green-400 font-bold">data meets logic</span> in real-time
              </p>
            </motion.div>
          </motion.div>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
        <motion.div
          className="h-full bg-gradient-to-r from-green-500 to-teal-500"
          style={{ width: `${(time / duration) * 100}%` }}
        />
      </div>
    </div>
  )
}

export default StreamProcessingScene