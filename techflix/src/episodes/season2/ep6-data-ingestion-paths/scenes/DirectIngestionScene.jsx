import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CinematicTitle,
  CodeDemo,
  MetricDisplay,
  ComparisonView,
  ParticleBackground
} from '../../../../components/StorytellingComponents'
import { getSceneState, getStaggeredDelay } from '../../../../utils/animationHelpers'
import AnimatedMetricCounter from '../../../../components/AnimatedMetricCounter'
import ProgressiveReveal from '../../../../components/ProgressiveReveal'

const DirectIngestionScene = ({ time = 0, duration = 15 }) => {
  const phases = {
    basics: { start: 0, duration: 5 },
    advanced: { start: 5, duration: 7 },
    optimization: { start: 12, duration: 3 }
  }
  
  const { phase, progress, localTime } = getSceneState(time, phases)
  const [activeConfig, setActiveConfig] = useState('basic')
  
  useEffect(() => {
    if (phase === 'advanced' && localTime > 2) {
      setActiveConfig('optimized')
    }
  }, [phase, localTime])
  
  const producerConfigs = {
    basic: {
      title: 'Basic Configuration',
      code: `// Simple Kafka Producer
Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("key.serializer", 
  "org.apache.kafka.common.serialization.StringSerializer");
props.put("value.serializer", 
  "org.apache.kafka.common.serialization.StringSerializer");

KafkaProducer<String, String> producer = 
  new KafkaProducer<>(props);

// Send message
ProducerRecord<String, String> record = 
  new ProducerRecord<>("events", key, value);
producer.send(record);`,
      metrics: {
        throughput: 10000,
        latency: 5,
        reliability: 95
      }
    },
    optimized: {
      title: 'Optimized Configuration',
      code: `// High-Performance Producer
Properties props = new Properties();
props.put("bootstrap.servers", "broker1:9092,broker2:9092,broker3:9092");
props.put("key.serializer", StringSerializer.class.getName());
props.put("value.serializer", AvroSerializer.class.getName());

// Performance tuning
props.put("acks", "1"); // Leader acknowledgment
props.put("retries", 3);
props.put("batch.size", 32768); // 32KB batches
props.put("linger.ms", 10); // Wait up to 10ms
props.put("compression.type", "lz4");
props.put("buffer.memory", 67108864); // 64MB

// Idempotence for exactly-once
props.put("enable.idempotence", true);
props.put("max.in.flight.requests.per.connection", 5);

KafkaProducer<String, Event> producer = 
  new KafkaProducer<>(props);`,
      metrics: {
        throughput: 100000,
        latency: 2,
        reliability: 99.9
      }
    }
  }
  
  const currentConfig = producerConfigs[activeConfig]
  
  return (
    <div className="scene-container relative bg-black">
      {/* Technical Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-purple-900/20" />
        <ParticleBackground 
          particleCount={30}
          colors={['#6366f1', '#8b5cf6']}
          behavior="network"
        />
      </div>
      
      <div className="relative z-10 h-full p-8 overflow-hidden">
        
        {/* Basics Phase */}
        <AnimatePresence>
          {phase === 'basics' && (
            <motion.div
              className="max-w-7xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CinematicTitle
                title="Direct Producer API"
                subtitle="The foundation of data ingestion"
                time={localTime}
                startTime={0}
              />
              
              <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-2xl font-bold mb-4 text-indigo-400">
                    Key Concepts
                  </h3>
                  <ProgressiveReveal delay={1} stagger={0.3}>
                    <div className="bg-gray-900/50 backdrop-blur-lg rounded-lg p-4 mb-3 border border-indigo-600/30">
                      <h4 className="font-bold text-lg mb-2">🔄 Asynchronous Send</h4>
                      <p className="text-gray-300">Non-blocking with callbacks for result handling</p>
                    </div>
                    <div className="bg-gray-900/50 backdrop-blur-lg rounded-lg p-4 mb-3 border border-indigo-600/30">
                      <h4 className="font-bold text-lg mb-2">📦 Batching</h4>
                      <p className="text-gray-300">Automatic message batching for efficiency</p>
                    </div>
                    <div className="bg-gray-900/50 backdrop-blur-lg rounded-lg p-4 mb-3 border border-indigo-600/30">
                      <h4 className="font-bold text-lg mb-2">🔐 Partitioning</h4>
                      <p className="text-gray-300">Key-based or custom partition assignment</p>
                    </div>
                    <div className="bg-gray-900/50 backdrop-blur-lg rounded-lg p-4 border border-indigo-600/30">
                      <h4 className="font-bold text-lg mb-2">🛡️ Reliability</h4>
                      <p className="text-gray-300">Configurable acknowledgment levels</p>
                    </div>
                  </ProgressiveReveal>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <h3 className="text-2xl font-bold mb-4 text-purple-400">
                    {currentConfig.title}
                  </h3>
                  <CodeDemo
                    code={currentConfig.code}
                    language="java"
                    time={localTime}
                    startTime={1}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Advanced Phase */}
        {phase === 'advanced' && (
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-8">
              Advanced Producer Patterns
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Configuration Comparison */}
              <ComparisonView
                before={{
                  label: 'Basic Setup',
                  content: (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Throughput:</span>
                        <AnimatedMetricCounter 
                          value={10000} 
                          suffix="/s"
                          className="text-xl font-mono text-yellow-400"
                        />
                      </div>
                      <div className="flex justify-between">
                        <span>Latency:</span>
                        <AnimatedMetricCounter 
                          value={5} 
                          suffix="ms"
                          className="text-xl font-mono text-orange-400"
                        />
                      </div>
                      <div className="flex justify-between">
                        <span>Reliability:</span>
                        <AnimatedMetricCounter 
                          value={95} 
                          suffix="%"
                          className="text-xl font-mono text-red-400"
                        />
                      </div>
                    </div>
                  )
                }}
                after={{
                  label: 'Optimized Setup',
                  content: (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Throughput:</span>
                        <AnimatedMetricCounter 
                          value={100000} 
                          suffix="/s"
                          className="text-xl font-mono text-green-400"
                        />
                      </div>
                      <div className="flex justify-between">
                        <span>Latency:</span>
                        <AnimatedMetricCounter 
                          value={2} 
                          suffix="ms"
                          className="text-xl font-mono text-blue-400"
                        />
                      </div>
                      <div className="flex justify-between">
                        <span>Reliability:</span>
                        <AnimatedMetricCounter 
                          value={99.9} 
                          suffix="%"
                          decimals={1}
                          className="text-xl font-mono text-green-400"
                        />
                      </div>
                    </div>
                  )
                }}
                time={localTime}
                startTime={0}
              />
              
              {/* Advanced Features */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <h3 className="text-2xl font-bold text-purple-400">
                  Production Features
                </h3>
                
                <ProgressiveReveal delay={1.5} stagger={0.4}>
                  <motion.div
                    className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg p-6 border border-purple-600/50"
                    whileHover={{ scale: 1.02 }}
                  >
                    <h4 className="text-xl font-bold mb-2">Idempotent Producer</h4>
                    <p className="text-gray-300 mb-3">Exactly-once delivery semantics</p>
                    <CodeDemo
                      code={`props.put("enable.idempotence", true);
props.put("acks", "all");
props.put("retries", Integer.MAX_VALUE);`}
                      language="java"
                      time={localTime}
                      startTime={2}
                    />
                  </motion.div>
                  
                  <motion.div
                    className="bg-gradient-to-r from-indigo-900/30 to-blue-900/30 rounded-lg p-6 border border-indigo-600/50"
                    whileHover={{ scale: 1.02 }}
                  >
                    <h4 className="text-xl font-bold mb-2">Transactional Producer</h4>
                    <p className="text-gray-300 mb-3">Atomic multi-partition writes</p>
                    <CodeDemo
                      code={`props.put("transactional.id", "my-tx-producer");
producer.initTransactions();

producer.beginTransaction();
producer.send(record1);
producer.send(record2);
producer.commitTransaction();`}
                      language="java"
                      time={localTime}
                      startTime={3}
                    />
                  </motion.div>
                </ProgressiveReveal>
              </motion.div>
            </div>
          </div>
        )}
        
        {/* Optimization Phase */}
        {phase === 'optimization' && (
          <motion.div
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-5xl font-bold text-center mb-12 gradient-text">
              Performance Optimization
            </h2>
            
            <MetricDisplay
              metrics={[
                { 
                  label: 'Batch Size',
                  value: 32,
                  suffix: 'KB',
                  prefix: '',
                  change: 60
                },
                {
                  label: 'Compression',
                  value: 'LZ4',
                  suffix: '',
                  prefix: '',
                  change: null
                },
                {
                  label: 'Buffer Memory',
                  value: 64,
                  suffix: 'MB',
                  prefix: '',
                  change: 100
                },
                {
                  label: 'Throughput Gain',
                  value: 10,
                  suffix: 'x',
                  prefix: '',
                  change: 900
                }
              ]}
              time={localTime}
              startTime={0}
            />
            
            <motion.div
              className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 text-center"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <h3 className="text-3xl font-bold mb-4">Golden Rules</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div>
                  <span className="text-2xl">🎯</span>
                  <p className="mt-2">Batch for throughput, flush for latency</p>
                </div>
                <div>
                  <span className="text-2xl">🔄</span>
                  <p className="mt-2">Use async send with proper error handling</p>
                </div>
                <div>
                  <span className="text-2xl">📊</span>
                  <p className="mt-2">Monitor producer metrics continuously</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
          style={{ width: `${(time / duration) * 100}%` }}
        />
      </div>
    </div>
  )
}

export default DirectIngestionScene