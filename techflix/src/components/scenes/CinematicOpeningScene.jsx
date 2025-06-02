import { motion } from 'framer-motion';
import '../../styles/techflix-cinematic-v2.css';

const CinematicOpeningScene = ({ time, duration }) => {
  // Scene phases
  const phases = {
    intro: { start: 0, duration: 3 },
    title: { start: 3, duration: 4 },
    tagline: { start: 7, duration: 3 },
    transition: { start: 10, duration: 2 }
  };
  
  // Determine current phase
  const currentPhase = Object.entries(phases).find(([_, phase]) => 
    time >= phase.start && time < phase.start + phase.duration
  )?.[0] || 'transition';
  
  return (
    <div className="scene-container-v2">
      <div className="scene-content">
        <div className="flex flex-col items-center justify-center min-h-full py-12">
          
          {/* Phase 1: Opening Animation */}
          {currentPhase === 'intro' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
              className="text-center"
            >
              <motion.div
                className="w-32 h-32 mx-auto mb-8"
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                  <span className="text-6xl">🎬</span>
                </div>
              </motion.div>
              
              <motion.p 
                className="text-2xl text-gray-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                TechFlix Presents
              </motion.p>
            </motion.div>
          )}
          
          {/* Phase 2: Main Title */}
          {currentPhase === 'title' && (
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1 
                className="scene-title text-6xl md:text-8xl mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                Kafka Share Groups
              </motion.h1>
              <motion.p 
                className="scene-subtitle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                A Technical Revolution
              </motion.p>
            </motion.div>
          )}
          
          {/* Phase 3: Tagline */}
          {currentPhase === 'tagline' && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-center max-w-4xl"
            >
              <motion.h2 
                className="scene-title text-4xl md:text-5xl mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                Breaking the Partition Barrier
              </motion.h2>
              
              <motion.div
                className="space-y-4 max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <p className="text-xl text-gray-300">
                  Discover how Kafka 4.0 revolutionizes stream processing
                  with concurrent consumption within partitions
                </p>
                
                <motion.div
                  className="flex justify-center gap-8 mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">10x</div>
                    <div className="text-sm text-gray-400">Throughput</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">0</div>
                    <div className="text-sm text-gray-400">Bottlenecks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">∞</div>
                    <div className="text-sm text-gray-400">Scale</div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
          
          {/* Phase 4: Transition Out */}
          {currentPhase === 'transition' && (
            <motion.div
              initial={{ scale: 1, opacity: 1 }}
              animate={{ 
                scale: 1.5,
                opacity: 0
              }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="text-center"
            >
              <div className="text-6xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Let&apos;s Begin...
              </div>
            </motion.div>
          )}
          
        </div>
      </div>
      
      {/* Cinematic Bars (top and bottom) */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-24 bg-black"
        initial={{ y: -100 }}
        animate={{ y: time > phases.transition.start ? 0 : -100 }}
        transition={{ duration: 0.5 }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-24 bg-black"
        initial={{ y: 100 }}
        animate={{ y: time > phases.transition.start ? 0 : 100 }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
};

export default CinematicOpeningScene;