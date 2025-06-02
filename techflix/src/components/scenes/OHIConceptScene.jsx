import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, BarChart3, Rocket, Zap, Target, TrendingUp, ArrowRight, Cpu, Cloud, Server } from 'lucide-react';
import { ParticleBackground, SceneTransition, CinematicTitle } from '../StorytellingComponents';

const OHIConceptScene = ({ time, duration }) => {
  const progress = (time / duration) * 100;
  
  // 5-phase storytelling structure
  const phase = useMemo(() => {
    if (time < 2) return 'intro';
    if (time < 4) return 'phase2'; // Definition
    if (time < 7) return 'phase3'; // Architecture
    if (time < 9) return 'phase4'; // Benefits
    return 'conclusion';
  }, [time]);

  // Camera movement based on phase
  const getCameraTransform = () => {
    switch (phase) {
      case 'intro':
        return 'scale(0.95) translateY(-20px)';
      case 'phase2':
        return 'scale(1) translateY(0)';
      case 'phase3':
        return 'scale(1.02) translateZ(50px)';
      case 'phase4':
        return 'scale(1) translateY(10px)';
      case 'conclusion':
        return 'scale(0.98) translateY(0)';
      default:
        return 'scale(1)';
    }
  };

  // Architecture components
  const architectureFlow = [
    { 
      id: 'app',
      icon: <Server className="w-8 h-8" />,
      title: 'Your App',
      subtitle: 'Kafka + JMX',
      color: 'from-cyan-500 to-blue-500',
      glow: 'rgba(6, 182, 212, 0.5)'
    },
    { 
      id: 'ohi',
      icon: <Cpu className="w-8 h-8" />,
      title: 'Your OHI',
      subtitle: 'Go Binary',
      color: 'from-teal-500 to-green-500',
      glow: 'rgba(20, 184, 166, 0.5)'
    },
    { 
      id: 'agent',
      icon: <Server className="w-8 h-8" />,
      title: 'Infra Agent',
      subtitle: 'New Relic',
      color: 'from-green-500 to-emerald-500',
      glow: 'rgba(16, 185, 129, 0.5)'
    },
    { 
      id: 'cloud',
      icon: <Cloud className="w-8 h-8" />,
      title: 'New Relic',
      subtitle: 'Platform',
      color: 'from-purple-500 to-pink-500',
      glow: 'rgba(168, 85, 247, 0.5)'
    }
  ];

  // Benefits data
  const benefits = [
    { 
      icon: <Zap className="w-8 h-8" />,
      title: 'Performance', 
      desc: 'Lightweight & efficient data collection',
      color: 'from-yellow-500 to-orange-500',
      gradient: 'from-yellow-600/20 to-orange-600/20'
    },
    { 
      icon: <Target className="w-8 h-8" />,
      title: 'Customizable', 
      desc: 'Tailored to your specific metrics',
      color: 'from-teal-500 to-cyan-500',
      gradient: 'from-teal-600/20 to-cyan-600/20'
    },
    { 
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Integrated', 
      desc: 'First-class New Relic UI support',
      color: 'from-purple-500 to-pink-500',
      gradient: 'from-purple-600/20 to-pink-600/20'
    }
  ];

  return (
    <SceneTransition
      className="w-full h-full"
      effect="fade"
      duration={0.8}
    >
      <div className="relative w-full h-full overflow-hidden">
        {/* Dynamic gradient background */}
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: phase === 'phase3' 
              ? 'radial-gradient(ellipse at center, rgba(20, 184, 166, 0.15) 0%, rgba(0, 0, 0, 0.95) 100%)'
              : 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.1) 0%, rgba(0, 0, 0, 0.98) 100%)'
          }}
          transition={{ duration: 2 }}
        />

        {/* Circuit Pattern Background with animation */}
        <motion.div 
          className="absolute inset-0 opacity-20"
          animate={{
            opacity: phase === 'phase3' ? 0.3 : 0.2
          }}
        >
          <svg className="w-full h-full">
            <defs>
              <pattern id="tech-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                <motion.circle 
                  cx="0" cy="0" r="3" 
                  fill="currentColor" 
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.circle 
                  cx="60" cy="0" r="3" 
                  fill="currentColor" 
                  animate={{ opacity: [0.7, 0.3, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.circle 
                  cx="0" cy="60" r="3" 
                  fill="currentColor" 
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.circle 
                  cx="60" cy="60" r="3" 
                  fill="currentColor" 
                  animate={{ opacity: [0.8, 0.5, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <circle cx="30" cy="30" r="4" fill="currentColor"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#tech-grid)" className="text-teal-500"/>
          </svg>
        </motion.div>

        {/* Particle effects */}
        <ParticleBackground
          count={50}
          size={1.5}
          speed={0.2}
          color="rgba(20, 184, 166, 0.4)"
        />

        {/* Camera container */}
        <motion.div
          className="relative w-full h-full flex items-center justify-center p-8"
          animate={{
            transform: getCameraTransform(),
          }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        >
          <div className="relative z-10 max-w-6xl w-full">
            {/* Title with cinematic animation */}
            <AnimatePresence mode="wait">
              {phase === 'intro' && (
                <motion.div
                  initial={{ opacity: 0, y: -50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8 }}
                  className="text-center mb-12"
                >
                  <CinematicTitle
                    text="On-Host Integrations (OHI)"
                    subtitle="Custom Metrics Collection for New Relic"
                    gradient="from-teal-400 to-cyan-400"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Definition with glassmorphism */}
            <AnimatePresence>
              {phase === 'phase2' && (
                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                  className="mb-12"
                >
                  <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 blur-2xl rounded-2xl" />
                    
                    {/* Content */}
                    <div className="relative bg-gray-900/30 backdrop-blur-xl rounded-2xl p-8 border border-teal-500/30">
                      <h3 className="text-2xl font-bold text-teal-300 mb-4">What is an OHI?</h3>
                      <p className="text-lg text-gray-300 leading-relaxed mb-6">
                        An On-Host Integration is a lightweight program that runs alongside the New Relic 
                        Infrastructure agent, collecting custom metrics from your applications and services, 
                        then sending them to New Relic in a structured format.
                      </p>
                      
                      <div className="grid grid-cols-3 gap-6">
                        {[
                          { icon: <Wrench className="w-6 h-6" />, label: 'Custom Built' },
                          { icon: <BarChart3 className="w-6 h-6" />, label: 'Metrics Collector' },
                          { icon: <Rocket className="w-6 h-6" />, label: 'Production Ready' }
                        ].map((item, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + idx * 0.2 }}
                            whileHover={{ scale: 1.05 }}
                            className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 text-center border border-gray-700/30"
                          >
                            <div className="text-teal-400 mb-2 flex justify-center">{item.icon}</div>
                            <span className="text-sm text-gray-300">{item.label}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Architecture Flow with advanced animations */}
            <AnimatePresence>
              {phase === 'phase3' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="mb-12"
                >
                  <motion.h3 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold text-gray-300 mb-8 text-center"
                  >
                    OHI Architecture
                  </motion.h3>
                  
                  <div className="flex items-center justify-between">
                    {architectureFlow.map((component, idx) => (
                      <React.Fragment key={component.id}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                          animate={{ 
                            opacity: 1, 
                            scale: 1, 
                            rotate: 0,
                            y: phase === 'phase3' ? [0, -10, 0] : 0
                          }}
                          transition={{ 
                            delay: idx * 0.3,
                            duration: 0.8,
                            y: { duration: 2, repeat: Infinity, delay: idx * 0.5 }
                          }}
                          whileHover={{ scale: 1.1 }}
                          className="relative group"
                        >
                          {/* Glow effect */}
                          <motion.div
                            className="absolute inset-0 rounded-xl blur-xl"
                            style={{ background: component.glow }}
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          
                          {/* Card */}
                          <div className="relative bg-gray-900/60 backdrop-blur-lg rounded-xl p-6 border border-gray-700/30 group-hover:border-gray-600/50 transition-all duration-300">
                            <div className={`mb-3 bg-gradient-to-r ${component.color} bg-clip-text text-transparent flex justify-center`}>
                              {component.icon}
                            </div>
                            <h4 className="font-semibold text-gray-200">{component.title}</h4>
                            <p className="text-xs text-gray-400 mt-1">{component.subtitle}</p>
                          </div>
                        </motion.div>
                        
                        {/* Animated Arrow */}
                        {idx < architectureFlow.length - 1 && (
                          <motion.div
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{ delay: idx * 0.3 + 0.5, duration: 0.5 }}
                            className="flex items-center"
                          >
                            <div className="relative w-16">
                              <motion.div
                                className="absolute inset-0 flex items-center"
                                animate={{ x: [-10, 10, -10] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <ArrowRight className={`w-6 h-6 bg-gradient-to-r ${architectureFlow[idx].color} bg-clip-text text-transparent`} />
                              </motion.div>
                              <svg className="w-full h-2" viewBox="0 0 60 8">
                                <motion.line 
                                  x1="0" y1="4" x2="50" y2="4" 
                                  stroke="url(#gradient)" 
                                  strokeWidth="2"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ delay: idx * 0.3 + 0.5, duration: 0.5 }}
                                />
                                <defs>
                                  <linearGradient id="gradient">
                                    <stop offset="0%" stopColor="#14b8a6" />
                                    <stop offset="100%" stopColor="#06b6d4" />
                                  </linearGradient>
                                </defs>
                              </svg>
                            </div>
                          </motion.div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Benefits Grid with staggered animations */}
            <AnimatePresence>
              {(phase === 'phase4' || phase === 'conclusion') && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-3 gap-6"
                >
                  {benefits.map((benefit, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 50, rotateX: -90 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0, 
                        rotateX: 0,
                        scale: phase === 'conclusion' ? [1, 1.02, 1] : 1
                      }}
                      transition={{ 
                        delay: idx * 0.2,
                        duration: 0.8,
                        scale: { duration: 2, repeat: Infinity }
                      }}
                      whileHover={{ scale: 1.05, rotateY: 5 }}
                      className="relative group"
                      style={{ perspective: '1000px' }}
                    >
                      {/* Glow effect */}
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-r ${benefit.gradient} blur-xl rounded-xl`}
                        animate={{
                          opacity: phase === 'conclusion' ? [0.3, 0.6, 0.3] : 0.3
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      
                      {/* Card */}
                      <div className="relative bg-gray-900/40 backdrop-blur-xl rounded-xl p-6 border border-gray-700/30 group-hover:border-gray-600/50 transition-all duration-300">
                        <motion.div 
                          className={`mb-4 bg-gradient-to-r ${benefit.color} bg-clip-text text-transparent flex justify-center`}
                          animate={{ rotate: phase === 'conclusion' ? 360 : 0 }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                          {benefit.icon}
                        </motion.div>
                        <h4 className={`text-lg font-semibold mb-2 bg-gradient-to-r ${benefit.color} bg-clip-text text-transparent`}>
                          {benefit.title}
                        </h4>
                        <p className="text-sm text-gray-400">{benefit.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Conclusion CTA */}
            <AnimatePresence>
              {phase === 'conclusion' && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="mt-12 text-center"
                >
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-block"
                  >
                    <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 backdrop-blur-sm rounded-lg px-6 py-3 border border-teal-500/30">
                      <span className="text-teal-300 font-semibold">Ready to build your custom metrics pipeline</span>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="w-96 h-1 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div 
              className="h-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      </div>
    </SceneTransition>
  );
};

export default OHIConceptScene;