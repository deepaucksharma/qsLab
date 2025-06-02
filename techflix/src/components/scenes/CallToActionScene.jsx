import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, BookOpen, Users, Code, ArrowRight, Star, CheckCircle2 } from 'lucide-react';
import '../../styles/techflix-cinematic-v2.css';

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
      const elapsed = time - phases.success.start;
      const progress = Math.min(elapsed / 3, 1);
      const currentScore = Math.floor(progress * targetScore);
      setAchievementScore(currentScore);
    }
  }, [time, phases.success.start]);
  
  // Trigger confetti
  useEffect(() => {
    if (time >= phases.celebration.start && !showConfetti) {
      setShowConfetti(true);
    }
  }, [time, phases.celebration.start, showConfetti]);
  
  // Determine current phase
  const currentPhase = Object.entries(phases).find(([_, phase]) => 
    time >= phase.start && time < phase.start + phase.duration
  )?.[0] || 'celebration';
  
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
    <div className="scene-container-v2">
      <div className="scene-content">
        <div className="flex flex-col items-center justify-center min-h-full py-12">
          
          {/* Confetti overlay */}
          <AnimatePresence>
            {showConfetti && <Confetti />}
          </AnimatePresence>
          
          {/* Phase 1: Introduction */}
          <AnimatePresence>
            {currentPhase === 'intro' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                <h1 className="scene-title">Mission Accomplished!</h1>
                <p className="scene-subtitle">Your Kafka Share Groups Journey</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Phase 2: Success Message */}
          <AnimatePresence>
            {currentPhase === 'success' && (
              <motion.div 
                className="text-center space-y-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
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
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Phase 3: Resources */}
          <AnimatePresence>
            {currentPhase === 'resources' && (
              <motion.div 
                className="space-y-8 w-full max-w-6xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.h2 
                  className="scene-title text-center mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
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
                          delay: i * 0.2,
                          type: "spring",
                          damping: 20
                        }}
                      >
                        <motion.div
                          className="metric-card-v2 p-6 h-full hover:border-purple-500/50 transition-all duration-300"
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
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Phase 4: Call to Action */}
          <AnimatePresence>
            {currentPhase === 'cta' && (
              <motion.div 
                className="text-center space-y-8 w-full max-w-4xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              >
                <h2 className="scene-title mb-6">Ready to Implement?</h2>
                
                <p className="scene-subtitle mb-8">
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
                  className="mt-12 metric-card-v2 p-8 max-w-2xl mx-auto"
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
            )}
          </AnimatePresence>
          
          {/* Phase 5: Final Celebration */}
          <AnimatePresence>
            {currentPhase === 'celebration' && (
              <motion.div 
                className="text-center space-y-6"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
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
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CallToActionScene;