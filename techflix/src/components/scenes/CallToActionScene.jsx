import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, BookOpen, Users, Code, ArrowRight, Star, CheckCircle2 } from 'lucide-react';
import {
  CinematicTitle,
  SceneTransition,
  ParticleBackground
} from '../StorytellingComponents';
import {
  getTextRevealStyle,
  getTimeBasedValue,
  getCameraTransform
} from '../../utils/animationHelpers';
import { getStaggeredDelay } from '../../utils/storytellingHelpers';

const CallToActionScene = ({ time, duration }) => {
  // Scene phases
  const phases = {
    intro: { start: 0, duration: 3 },
    success: { start: 3, duration: 4 },
    resources: { start: 7, duration: 5 },
    cta: { start: 12, duration: 4 },
    celebration: { start: 16, duration: 4 }
  };
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [achievementScore, setAchievementScore] = useState(0);
  const progress = (time / duration) * 100;
  
  // Resources data
  const resources = [
    { 
      icon: BookOpen, 
      title: 'Documentation & Guides',
      description: 'Deep dive into advanced patterns',
      color: 'from-blue-500 to-cyan-500',
      link: 'docs.newrelic.com/kafka-sg'
    },
    { 
      icon: Users, 
      title: 'Community Forums',
      description: 'Connect with experts worldwide',
      color: 'from-purple-500 to-pink-500',
      link: 'discuss.newrelic.com'
    },
    { 
      icon: Code, 
      title: 'Code Examples',
      description: 'Production-ready implementations',
      color: 'from-green-500 to-emerald-500',
      link: 'github.com/newrelic/kafka-examples'
    },
    { 
      icon: Rocket, 
      title: 'Dashboard Templates',
      description: 'Pre-built observability solutions',
      color: 'from-orange-500 to-red-500',
      link: 'nr.com/kafka-templates'
    }
  ];
  
  // Update achievement score
  useEffect(() => {
    if (time >= phases.success.start) {
      const targetScore = 98;
      const currentScore = Math.floor(
        getTimeBasedValue(time, phases.success.start, 3, 0, targetScore, 'easeOutExpo')
      );
      setAchievementScore(currentScore);
    }
  }, [time, phases.success.start]);
  
  // Trigger confetti
  useEffect(() => {
    if (time >= phases.celebration.start && !showConfetti) {
      setShowConfetti(true);
    }
  }, [time, phases.celebration.start, showConfetti]);
  
  // Camera movements
  const cameraMovements = [
    { start: 0, end: 3, fromX: 0, toX: 0, fromY: 50, toY: 0, fromScale: 0.8, toScale: 1 },
    { start: 12, end: 14, fromX: 0, toX: 0, fromY: 0, toY: 0, fromScale: 1, toScale: 1.1 },
    { start: 16, end: 18, fromX: 0, toX: 0, fromY: 0, toY: 0, fromScale: 1.1, toScale: 1 }
  ];
  
  const cameraTransform = getCameraTransform(time, cameraMovements);
  
  // Confetti component
  const Confetti = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => {
        const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
        const color = colors[i % colors.length];
        const size = 8 + Math.random() * 8;
        const delay = Math.random() * 2;
        const duration = 3 + Math.random() * 2;
        const x = Math.random() * 100;
        
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${x}%`,
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
            }}
            initial={{ y: -20, opacity: 0, rotate: 0 }}
            animate={{
              y: window.innerHeight + 100,
              opacity: [0, 1, 1, 0],
              rotate: 720 * (Math.random() > 0.5 ? 1 : -1),
              x: Math.sin(i) * 50
            }}
            transition={{
              duration,
              delay,
              ease: "linear",
              repeat: Infinity
            }}
          />
        );
      })}
    </div>
  );
  
  return (
    <div className="scene-container">
      {/* Dynamic Background */}
      <motion.div 
        className="absolute inset-0"
        animate={{ 
          background: [
            'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 30% 70%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 70% 30%, rgba(245, 158, 11, 0.3) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
      />
      
      {/* Success rings animation */}
      <div className="absolute inset-0">
        {time >= phases.success.start && [...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
            style={{
              width: 200 + i * 150,
              height: 200 + i * 150,
              borderColor: `rgba(16, 185, 129, ${0.3 - i * 0.05})`
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.2, 1],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 3,
              delay: i * 0.3,
              repeat: Infinity,
              repeatDelay: 2
            }}
          />
        ))}
      </div>
      
      {/* Particles */}
      <ParticleBackground 
        particleCount={80} 
        colors={['#10b981', '#8b5cf6', '#f59e0b', '#ec4899']} 
      />
      
      {/* Confetti overlay */}
      <AnimatePresence>
        {showConfetti && <Confetti />}
      </AnimatePresence>
      
      {/* Content with camera transform */}
      <div 
        className="relative z-10 h-full flex items-center justify-center p-8"
        style={{ transform: cameraTransform }}
      >
        <div className="w-full max-w-7xl">
          
          {/* Phase 1: Introduction */}
          <SceneTransition isActive={time >= phases.intro.start && time < phases.success.start}>
            <CinematicTitle
              title="Mission Accomplished!"
              subtitle="Your Kafka Share Groups Journey"
              time={time}
              startTime={phases.intro.start}
            />
          </SceneTransition>
          
          {/* Phase 2: Success Message */}
          <SceneTransition isActive={time >= phases.success.start && time < phases.resources.start}>
            <div className="text-center space-y-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
              >
                <div className="inline-block relative">
                  <motion.div
                    className="text-9xl"
                    animate={{ rotate: [0, -5, 5, -5, 0] }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    🎉
                  </motion.div>
                  
                  {/* Achievement score */}
                  <motion.div
                    className="absolute -bottom-4 -right-4 bg-green-500 text-white rounded-full w-20 h-20 flex items-center justify-center font-bold text-2xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, type: "spring", damping: 10 }}
                  >
                    {achievementScore}%
                  </motion.div>
                </div>
              </motion.div>
              
              <motion.h2 
                className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
                style={getTextRevealStyle(time, phases.success.start + 1, 1)}
              >
                Observability Excellence Achieved!
              </motion.h2>
              
              <motion.p
                className="text-2xl text-gray-300 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                You&apos;ve mastered the complete journey from understanding Kafka Share Groups 
                to implementing production-grade observability with New Relic.
              </motion.p>
              
              {/* Skills acquired */}
              <motion.div
                className="flex justify-center gap-4 flex-wrap max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {['Share Groups Mastery', 'JMX Expertise', 'Custom OHI', 'Production Ready'].map((skill, i) => (
                  <motion.div
                    key={skill}
                    className="bg-gray-900/60 backdrop-blur-lg rounded-full px-4 py-2 border border-green-500/30 flex items-center gap-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.2 + i * 0.1, type: "spring", damping: 10 }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-sm">{skill}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </SceneTransition>
          
          {/* Phase 3: Resources */}
          <SceneTransition isActive={time >= phases.resources.start && time < phases.cta.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center mb-12"
                style={getTextRevealStyle(time, phases.resources.start, 1)}
              >
                Continue Your Journey
              </motion.h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {resources.map((resource, i) => {
                  const Icon = resource.icon;
                  
                  return (
                    <motion.div
                      key={resource.title}
                      className="group relative"
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ 
                        delay: getStaggeredDelay(i, 0.2),
                        type: "spring",
                        damping: 20
                      }}
                    >
                      <motion.div
                        className="bg-gray-900/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 h-full hover:border-purple-500/50 transition-all duration-300"
                        whileHover={{ scale: 1.05, y: -5 }}
                      >
                        {/* Icon with gradient background */}
                        <motion.div
                          className={`w-16 h-16 rounded-xl bg-gradient-to-r ${resource.color} flex items-center justify-center mb-4`}
                          whileHover={{ rotate: 360 }}
                          transition={{ type: "spring", damping: 10 }}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </motion.div>
                        
                        <h3 className="font-bold mb-2">{resource.title}</h3>
                        <p className="text-sm text-gray-400 mb-3">{resource.description}</p>
                        
                        <motion.div
                          className="text-xs text-purple-400 flex items-center gap-1"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                        >
                          <span>{resource.link}</span>
                          <ArrowRight className="w-3 h-3" />
                        </motion.div>
                      </motion.div>
                      
                      {/* Hover glow */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        style={{
                          background: `radial-gradient(circle at 50% 50%, ${resource.color.split(' ')[1].split('-')[1]}-500/20 0%, transparent 70%)`
                        }}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </SceneTransition>
          
          {/* Phase 4: Call to Action */}
          <SceneTransition isActive={time >= phases.cta.start && time < phases.celebration.start}>
            <motion.div 
              className="text-center space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-5xl font-bold mb-6">Ready to Implement?</h2>
              
              <p className="text-2xl text-purple-300 max-w-3xl mx-auto mb-8">
                Join thousands of engineers building the future of event streaming
                with production-grade observability
              </p>
              
              {/* Main CTA button */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
              >
                <motion.a
                  href="#"
                  className="inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full text-xl font-bold text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(147, 51, 234, 0.3)",
                      "0 0 40px rgba(147, 51, 234, 0.5)",
                      "0 0 20px rgba(147, 51, 234, 0.3)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span>Explore nr.com/kafka-sg-observe</span>
                  <ArrowRight className="w-6 h-6" />
                </motion.a>
              </motion.div>
              
              {/* Additional resources */}
              <motion.div
                className="mt-12 p-8 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-2xl border border-purple-500/20 max-w-2xl mx-auto"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold">4.9/5</div>
                    <div className="text-sm text-gray-400">Developer Rating</div>
                  </div>
                  <div className="text-center">
                    <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold">50K+</div>
                    <div className="text-sm text-gray-400">Active Users</div>
                  </div>
                  <div className="text-center">
                    <Rocket className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold">99.9%</div>
                    <div className="text-sm text-gray-400">Uptime SLA</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </SceneTransition>
          
          {/* Phase 5: Final Celebration */}
          <SceneTransition isActive={time >= phases.celebration.start}>
            <motion.div 
              className="text-center space-y-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 10 }}
            >
              <motion.h2 
                className="text-7xl font-black bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{ backgroundSize: "200% 200%" }}
              >
                Thank You for Watching!
              </motion.h2>
              
              <motion.p
                className="text-3xl text-gray-300"
                animate={{
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                See you in the next episode! 🚀
              </motion.p>
              
              {/* Floating stars */}
              <div className="relative h-20">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${20 + i * 15}%`,
                      top: '50%'
                    }}
                    animate={{
                      y: [-10, 10, -10],
                      rotate: [0, 180, 360]
                    }}
                    transition={{
                      duration: 3,
                      delay: i * 0.2,
                      repeat: Infinity
                    }}
                  >
                    <Star className="w-8 h-8 text-yellow-400 fill-current" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </SceneTransition>
        </div>
      </div>
      
      {/* Progress Indicator */}
      <div className="progress-story">
        <motion.div 
          className="progress-story-fill bg-gradient-to-r from-green-500 to-emerald-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default CallToActionScene;