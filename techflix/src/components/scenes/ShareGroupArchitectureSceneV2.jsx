import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/techflix-cinematic-v2.css';

const ShareGroupArchitectureSceneV2 = ({ time, duration }) => {
  const [messageCount, setMessageCount] = useState(0);
  const [activeConsumers, setActiveConsumers] = useState(0);
  
  // Scene phases - simplified
  const phase = time < 5 ? 'intro' : time < 15 ? 'architecture' : time < 25 ? 'metrics' : 'conclusion';
  
  // Gradual reveal of consumers
  useEffect(() => {
    if (phase === 'architecture') {
      const count = Math.min(5, Math.floor((time - 5) / 2));
      setActiveConsumers(count);
    }
  }, [time, phase]);
  
  // Message counter
  useEffect(() => {
    if (phase === 'metrics') {
      const interval = setInterval(() => {
        setMessageCount(prev => prev + Math.floor(Math.random() * 10) + 5);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [phase]);
  
  return (
    <div className="scene-container-v2">
      <div className="scene-content">
        
        {/* Phase 1: Introduction */}
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <h1 className="scene-title">
                Kafka Share Groups
              </h1>
              <p className="scene-subtitle">
                Break free from partition limitations
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Phase 2: Architecture Visualization */}
        {phase === 'architecture' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
          >
            <h2 className="scene-title text-3xl mb-8">
              Dynamic Consumer Architecture
            </h2>
            
            <div className="architecture-container">
              {/* Kafka Cluster */}
              <div className="flex justify-center mb-12">
                <div className="bg-blue-900/20 border-2 border-blue-500 rounded-lg p-6">
                  <div className="text-2xl font-bold text-blue-400 mb-2">Kafka Cluster</div>
                  <div className="flex gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="bg-blue-800/30 rounded p-3 text-sm">
                        Partition {i}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Share Group */}
              <div className="text-center mb-8">
                <div className="inline-block bg-purple-900/20 border-2 border-purple-500 rounded-lg px-8 py-4">
                  <div className="text-xl font-bold text-purple-400">Share Group</div>
                  <div className="text-sm text-gray-400 mt-1">Dynamic Assignment</div>
                </div>
              </div>
              
              {/* Consumers */}
              <div className="flex justify-center gap-4 flex-wrap">
                {[1, 2, 3, 4, 5].map(i => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: i <= activeConsumers ? 1 : 0.3,
                      y: 0,
                      scale: i <= activeConsumers ? 1 : 0.8
                    }}
                    transition={{ delay: i * 0.2 }}
                    className={`bg-green-900/20 border-2 ${
                      i <= activeConsumers ? 'border-green-500' : 'border-gray-600'
                    } rounded-lg p-4 text-center`}
                  >
                    <div className="text-sm font-medium">Consumer {i}</div>
                    <div className={`text-xs mt-1 ${
                      i <= activeConsumers ? 'text-green-400' : 'text-gray-500'
                    }`}>
                      {i <= activeConsumers ? 'Active' : 'Idle'}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Key Insight */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="mt-8 text-center"
              >
                <p className="text-lg text-gray-300">
                  Each consumer can process messages from <span className="text-purple-400 font-bold">any partition</span>
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
        
        {/* Phase 3: Performance Metrics */}
        {phase === 'metrics' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
          >
            <h2 className="scene-title text-3xl mb-8">
              Performance Impact
            </h2>
            
            <div className="metrics-grid">
              <div className="metric-card-v2">
                <div className="metric-value text-green-400">
                  {messageCount.toLocaleString()}
                </div>
                <div className="metric-label">Messages Processed</div>
              </div>
              
              <div className="metric-card-v2">
                <div className="metric-value text-blue-400">
                  5ms
                </div>
                <div className="metric-label">Average Latency</div>
              </div>
              
              <div className="metric-card-v2">
                <div className="metric-value text-purple-400">
                  {activeConsumers}x
                </div>
                <div className="metric-label">Scaling Factor</div>
              </div>
              
              <div className="metric-card-v2">
                <div className="metric-value text-yellow-400">
                  98%
                </div>
                <div className="metric-label">Resource Efficiency</div>
              </div>
            </div>
            
            {/* Key Benefits */}
            <div className="mt-12 space-y-4 max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 bg-green-900/20 border border-green-500/30 rounded-lg p-4"
              >
                <span className="text-2xl">✓</span>
                <span className="text-lg">No partition-consumer coupling</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4 bg-green-900/20 border border-green-500/30 rounded-lg p-4"
              >
                <span className="text-2xl">✓</span>
                <span className="text-lg">Dynamic scaling without rebalancing</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-4 bg-green-900/20 border border-green-500/30 rounded-lg p-4"
              >
                <span className="text-2xl">✓</span>
                <span className="text-lg">Automatic load distribution</span>
              </motion.div>
            </div>
          </motion.div>
        )}
        
        {/* Phase 4: Conclusion */}
        {phase === 'conclusion' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <h2 className="scene-title">
              The Future is Shared
            </h2>
            <p className="scene-subtitle">
              Kafka 4.0 redefines stream processing scalability
            </p>
          </motion.div>
        )}
        
      </div>
    </div>
  );
};

export default ShareGroupArchitectureSceneV2;