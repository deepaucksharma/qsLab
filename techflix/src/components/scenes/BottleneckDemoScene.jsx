import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/techflix-cinematic-v2.css';

const BottleneckDemoScene = ({ time, duration }) => {
  const progress = (time / duration) * 100;
  
  // Scene phases
  const phase = time < 3 ? 'intro' : 
                time < 8 ? 'problem' : 
                time < 14 ? 'solution' : 'comparison';
  
  // Calculate dynamic values
  const bottleneckScale = phase === 'problem' && time > 5 ? 1 : 0;
  const consumersActive = phase === 'solution' ? Math.min(Math.floor((time - 8) / 1.5), 4) : 0;
  
  // Consumer Group Visualization Component
  const TraditionalConsumerGroup = () => (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      {/* Partition */}
      <div className="metric-card-v2 p-6 mb-8 bg-blue-600/10 border-blue-600/50">
        <div className="text-center">
          <span className="text-4xl">🗄️</span>
          <p className="mt-2 font-semibold text-xl">Partition 1</p>
        </div>
      </div>
      
      {/* Data Flow Arrow */}
      <div className="flex justify-center mb-8">
        <motion.div 
          className="text-5xl text-gray-600"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ↓
        </motion.div>
      </div>
      
      {/* Single Consumer */}
      <div className="metric-card-v2 p-6 mb-8">
        <div className="text-center">
          <span className="text-4xl">👤</span>
          <p className="mt-2 font-semibold text-xl">Consumer 1</p>
          <p className="text-gray-400 mt-1">Processing all messages sequentially</p>
        </div>
      </div>
      
      {/* Bottleneck Alert */}
      <AnimatePresence>
        {bottleneckScale > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 10 }}
            className="alert-box p-6 bg-red-900/20 border-red-600"
          >
            <div className="flex items-center justify-center mb-4">
              <motion.span 
                className="text-3xl mr-3"
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                🚦
              </motion.span>
              <div className="font-bold text-red-400 text-2xl">Bottleneck Detected!</div>
            </div>
            <div className="text-red-300 space-y-3 text-lg">
              <motion.p 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                • Fast messages stuck behind slow ones
              </motion.p>
              <motion.p 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                • Underutilized consumer resources
              </motion.p>
              <motion.p 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                • Poor horizontal scaling
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
  
  // Share Groups Visualization Component
  const ShareGroupsSolution = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative"
    >
      {/* Partition */}
      <div className="metric-card-v2 p-6 mb-8 bg-blue-600/10 border-blue-600/50">
        <div className="text-center">
          <span className="text-4xl">🗄️</span>
          <p className="mt-2 font-semibold text-xl">Partition 1</p>
        </div>
      </div>
      
      {/* Concurrent Data Flow */}
      <div className="flex justify-center mb-8">
        <motion.div 
          className="text-5xl text-green-500"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ⬇️
        </motion.div>
      </div>
      
      {/* Multiple Consumers Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[1, 2, 3, 4].map((num) => (
          <motion.div 
            key={num}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: consumersActive >= num ? 1 : 0.8,
              opacity: consumersActive >= num ? 1 : 0.3
            }}
            transition={{ 
              delay: (num - 1) * 0.3,
              type: "spring",
              damping: 10
            }}
            className="metric-card-v2 p-5 bg-green-600/10 border-green-600/50"
          >
            <div className="text-center">
              <span className="text-3xl">👤</span>
              <p className="font-semibold mt-1">Consumer {num}</p>
              {consumersActive >= num && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-1 bg-green-500 rounded-full mt-2"
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Success Status */}
      <AnimatePresence>
        {consumersActive > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="alert-box p-6 bg-green-900/20 border-green-600"
          >
            <div className="text-center">
              <motion.span 
                className="text-3xl mr-3 inline-block"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                ⚡
              </motion.span>
              <span className="font-bold text-green-400 text-2xl">Concurrent Processing Active</span>
            </div>
            <p className="text-center text-green-300 mt-2">
              {consumersActive} consumers processing in parallel
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
  
  return (
    <div className="scene-container-v2">
      <div className="scene-content">
        <div className="flex flex-col items-center justify-center min-h-full py-12">
          
          {/* Introduction Phase */}
          <AnimatePresence>
            {phase === 'intro' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <h1 className="scene-title">The Scalability Challenge</h1>
                <p className="scene-subtitle">When Traditional Patterns Hit Their Limits</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Problem & Solution Comparison */}
          <AnimatePresence>
            {(phase === 'problem' || phase === 'solution' || phase === 'comparison') && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full max-w-7xl space-y-12"
              >
                {/* Section Title */}
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="scene-title text-3xl md:text-4xl mb-4">
                    Traditional vs Modern: A Visual Comparison
                  </h2>
                </motion.div>
                
                {/* Comparison Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Traditional Consumer Groups */}
                  <div className="relative">
                    <motion.div
                      className="absolute -top-6 left-0 bg-red-600 text-white px-6 py-2 rounded-lg font-bold text-xl z-10"
                      initial={{ scale: 0 }}
                      animate={{ scale: phase !== 'intro' ? 1 : 0 }}
                      transition={{ type: "spring", damping: 10 }}
                    >
                      Traditional Approach
                    </motion.div>
                    <div className="metric-card-v2 p-8 pt-12">
                      <TraditionalConsumerGroup />
                    </div>
                  </div>
                  
                  {/* Share Groups Solution */}
                  <div className="relative">
                    <motion.div
                      className="absolute -top-6 right-0 bg-green-600 text-white px-6 py-2 rounded-lg font-bold text-xl z-10"
                      initial={{ scale: 0 }}
                      animate={{ scale: phase === 'solution' || phase === 'comparison' ? 1 : 0 }}
                      transition={{ type: "spring", damping: 10, delay: 0.3 }}
                    >
                      Share Groups Solution
                    </motion.div>
                    <div className="metric-card-v2 p-8 pt-12">
                      <ShareGroupsSolution />
                    </div>
                  </div>
                </div>
                
                {/* Key Insights */}
                <AnimatePresence>
                  {phase === 'comparison' && (
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16"
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -50, opacity: 0 }}
                      transition={{ duration: 0.8 }}
                    >
                      <motion.div 
                        className="metric-card-v2 p-8 border-l-4 border-red-600"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center mb-4">
                          <span className="text-3xl mr-4">❌</span>
                          <div className="text-2xl font-bold">The Problem</div>
                        </div>
                        <p className="text-lg text-gray-300">
                          Head-of-line blocking creates cascading delays, turning one slow message into a system-wide bottleneck
                        </p>
                      </motion.div>
                      
                      <motion.div 
                        className="metric-card-v2 p-8 border-l-4 border-green-600"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center mb-4">
                          <span className="text-3xl mr-4">✨</span>
                          <div className="text-2xl font-bold">The Solution</div>
                        </div>
                        <p className="text-lg text-gray-300">
                          Multiple consumers process messages independently, achieving true parallel processing at scale
                        </p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default BottleneckDemoScene;