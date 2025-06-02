import { motion } from 'framer-motion';
import {
  CinematicTitle,
  ParticleBackground,
  SceneTransition
} from '../StorytellingComponents';
import {
  getTextRevealStyle,
  getTimeBasedValue
} from '../../utils/animationHelpers';

const CinematicOpeningScene = ({ time, duration }) => {
  // Scene phases
  const phases = {
    intro: { start: 0, duration: 3 },
    title: { start: 3, duration: 4 },
    tagline: { start: 7, duration: 3 },
    transition: { start: 10, duration: 2 }
  };
  
  const progress = (time / duration) * 100;
  
  // Calculate dynamic effects
  const glowIntensity = getTimeBasedValue(time, phases.title.start, 3, 0, 1, 'easeOutExpo');
  const scaleEffect = getTimeBasedValue(time, phases.intro.start, phases.intro.duration, 0.8, 1, 'easeOutBack');
  
  return (
    <div className="scene-container">
      {/* Dynamic Background */}
      <motion.div 
        className="absolute inset-0"
        animate={{ 
          background: [
            'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 30% 70%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
      />
      
      {/* Tech Grid Background */}
      <div className="absolute inset-0 bg-tech-grid opacity-20" />
      
      {/* Particles */}
      <ParticleBackground 
        particleCount={60} 
        colors={['#4338ca', '#8b5cf6', '#3b82f6', '#10b981']} 
      />
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center p-8">
        <div className="text-center max-w-5xl">
          
          {/* Phase 1: Opening Animation */}
          <SceneTransition isActive={time >= phases.intro.start && time < phases.title.start}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: scaleEffect }}
              transition={{ type: "spring", damping: 10 }}
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
          </SceneTransition>
          
          {/* Phase 2: Main Title */}
          <SceneTransition isActive={time >= phases.title.start && time < phases.tagline.start}>
            <div>
              <CinematicTitle
                title="Kafka Share Groups"
                subtitle="A Technical Revolution"
                time={time}
                startTime={phases.title.start}
              />
              
              {/* Glow Effect */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 50%, rgba(99, 102, 241, ${glowIntensity * 0.4}) 0%, transparent 70%)`,
                  filter: `blur(${glowIntensity * 40}px)`
                }}
              />
            </div>
          </SceneTransition>
          
          {/* Phase 3: Tagline */}
          <SceneTransition isActive={time >= phases.tagline.start && time < phases.transition.start}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.h2 
                className="text-4xl md:text-5xl font-bold mb-8"
                style={getTextRevealStyle(time, phases.tagline.start, 1)}
              >
                Breaking the Partition Barrier
              </motion.h2>
              
              <motion.div
                className="space-y-4 max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: time > phases.tagline.start + 1 ? 1 : 0 }}
                transition={{ duration: 0.8 }}
              >
                <p className="text-xl text-gray-300">
                  Discover how Kafka 4.0 revolutionizes stream processing
                  with concurrent consumption within partitions
                </p>
                
                <motion.div
                  className="flex justify-center gap-8 mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: time > phases.tagline.start + 2 ? 1 : 0 }}
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
          </SceneTransition>
          
          {/* Phase 4: Transition Out */}
          <SceneTransition isActive={time >= phases.transition.start}>
            <motion.div
              initial={{ scale: 1, opacity: 1 }}
              animate={{ 
                scale: 1.5,
                opacity: 0
              }}
              transition={{ duration: 1, ease: "easeInOut" }}
            >
              <div className="text-6xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Let&apos;s Begin...
              </div>
            </motion.div>
          </SceneTransition>
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
      
      {/* Progress Indicator */}
      <div className="progress-story">
        <motion.div 
          className="progress-story-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default CinematicOpeningScene;