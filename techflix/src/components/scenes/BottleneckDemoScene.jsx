import { motion } from 'framer-motion';
import {
  CinematicTitle,
  ParticleBackground,
  SceneTransition
} from '../StorytellingComponents';
import { 
  getTimeBasedValue,
  getTextRevealStyle 
} from '../../utils/animationHelpers';
import { getStaggeredDelay } from '../../utils/storytellingHelpers';

const BottleneckDemoScene = ({ time, duration }) => {
  // Scene phases
  const phases = {
    intro: { start: 0, duration: 3 },
    problem: { start: 3, duration: 5 },
    solution: { start: 8, duration: 6 },
    comparison: { start: 14, duration: 6 }
  };
  
  const progress = (time / duration) * 100;
  
  // Calculate dynamic values
  const bottleneckScale = getTimeBasedValue(time, 5, 2, 0.8, 1.1, 'easeSpring');
  const consumersActive = Math.min(Math.floor(Math.max(0, time - 8) / 1.5), 4);
  
  // Consumer Group Visualization Component
  const TraditionalConsumerGroup = () => (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      {/* Partition */}
      <div className="bg-blue-600/20 rounded-2xl p-6 border border-blue-600/50 mb-8">
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
      <div className="bg-gray-700/50 rounded-2xl p-6 border border-gray-600 mb-8">
        <div className="text-center">
          <span className="text-4xl">👤</span>
          <p className="mt-2 font-semibold text-xl">Consumer 1</p>
          <p className="text-gray-400 mt-1">Processing all messages sequentially</p>
        </div>
      </div>
      
      {/* Bottleneck Alert */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: time > 5 ? bottleneckScale : 0, 
          opacity: time > 5 ? 1 : 0 
        }}
        transition={{ type: "spring", damping: 10 }}
        className="bg-red-900/20 rounded-2xl p-6 border-2 border-red-600/50"
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
      <div className="bg-blue-600/20 rounded-2xl p-6 border border-blue-600/50 mb-8">
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
              delay: getStaggeredDelay(num - 1, 0.3),
              type: "spring",
              damping: 10
            }}
            whileHover={{ scale: consumersActive >= num ? 1.1 : 0.8 }}
            className="bg-green-600/20 rounded-xl p-5 border-2 border-green-600/50"
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
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ 
          y: consumersActive > 0 ? 0 : 20,
          opacity: consumersActive > 0 ? 1 : 0
        }}
        transition={{ duration: 0.5 }}
        className="bg-green-900/20 rounded-2xl p-6 border-2 border-green-600/50"
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
    </motion.div>
  );
  
  return (
    <div className="scene-container">
      {/* Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-purple-900" />
      <div className="absolute inset-0 bg-tech-grid opacity-10" />
      <ParticleBackground 
        particleCount={30} 
        colors={['#ef4444', '#10b981', '#3b82f6']} 
      />
      
      {/* Content Container */}
      <div className="relative z-10 h-full flex items-center justify-center p-8">
        <div className="w-full max-w-7xl">
          
          {/* Introduction Phase */}
          <SceneTransition isActive={time >= phases.intro.start && time < phases.problem.start}>
            <div className="text-center">
              <CinematicTitle
                title="The Scalability Challenge"
                subtitle="When Traditional Patterns Hit Their Limits"
                time={time}
                startTime={phases.intro.start}
              />
            </div>
          </SceneTransition>
          
          {/* Problem & Solution Comparison */}
          <SceneTransition isActive={time >= phases.problem.start}>
            <div className="space-y-12">
              {/* Section Title */}
              <motion.div 
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: time > phases.problem.start ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 
                  className="text-4xl font-bold mb-4"
                  style={getTextRevealStyle(time, phases.problem.start, 1)}
                >
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
                    animate={{ scale: time > phases.problem.start ? 1 : 0 }}
                    transition={{ type: "spring", damping: 10 }}
                  >
                    Traditional Approach
                  </motion.div>
                  <div className="bg-gray-900/60 backdrop-blur-lg rounded-3xl p-8 pt-12 border-2 border-red-600/30">
                    <TraditionalConsumerGroup />
                  </div>
                </div>
                
                {/* Share Groups Solution */}
                <div className="relative">
                  <motion.div
                    className="absolute -top-6 right-0 bg-green-600 text-white px-6 py-2 rounded-lg font-bold text-xl z-10"
                    initial={{ scale: 0 }}
                    animate={{ scale: time > phases.solution.start ? 1 : 0 }}
                    transition={{ type: "spring", damping: 10, delay: 0.3 }}
                  >
                    Share Groups Solution
                  </motion.div>
                  <div className="bg-gray-900/60 backdrop-blur-lg rounded-3xl p-8 pt-12 border-2 border-green-600/30">
                    <ShareGroupsSolution />
                  </div>
                </div>
              </div>
              
              {/* Key Insights */}
              <SceneTransition isActive={time >= phases.comparison.start}>
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <motion.div 
                    className="bg-black/60 backdrop-blur-lg rounded-2xl p-8 border-l-4 border-red-600"
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
                    className="bg-black/60 backdrop-blur-lg rounded-2xl p-8 border-l-4 border-green-600"
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
              </SceneTransition>
            </div>
          </SceneTransition>
        </div>
      </div>
      
      {/* Progress Indicator */}
      <div className="progress-story">
        <motion.div 
          className="progress-story-fill"
          style={{ width: `${progress}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
};

export default BottleneckDemoScene;