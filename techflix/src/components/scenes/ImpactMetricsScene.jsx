import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CinematicTitle,
  MetricDisplay,
  Timeline,
  ParticleBackground,
  SceneTransition
} from '../StorytellingComponents';
import { 
  getTimeBasedValue,
  getTextRevealStyle,
  getCounterValue
} from '../../utils/animationHelpers';
import { getStaggeredDelay } from '../../utils/storytellingHelpers';

const ImpactMetricsScene = ({ time, duration }) => {
  // Scene phases for cinematic storytelling
  const phases = {
    intro: { start: 0, duration: 3 },
    metrics: { start: 3, duration: 7 },
    testimonials: { start: 10, duration: 8 },
    timeline: { start: 18, duration: 8 },
    conclusion: { start: 26, duration: 4 }
  };
  
  const progress = (time / duration) * 100;
  
  // Metric data with cinematic presentation
  const metrics = [
    { 
      label: 'Throughput', 
      value: getCounterValue(time, phases.metrics.start, 3, 300, 0),
      suffix: '%', 
      prefix: '+',
      change: 300,
      icon: '⚡'
    },
    { 
      label: 'Latency Reduction', 
      value: getCounterValue(time, phases.metrics.start + 0.5, 3, 87, 0),
      suffix: '%', 
      change: -87,
      icon: '📉'
    },
    { 
      label: 'Scale Efficiency', 
      value: getCounterValue(time, phases.metrics.start + 1, 3, 100, 0),
      suffix: '%', 
      change: 100,
      icon: '🔄'
    },
    { 
      label: 'Enterprise Adoption', 
      value: getCounterValue(time, phases.metrics.start + 1.5, 3, 250, 0),
      suffix: '+', 
      change: 250,
      icon: '🏢'
    }
  ];
  
  // Testimonial Component with animations
  const TestimonialCard = ({ testimonial, index }) => {
    const isVisible = time > phases.testimonials.start + index * 1.5;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 50, rotateX: -20 }}
        animate={{ 
          opacity: isVisible ? 1 : 0,
          y: isVisible ? 0 : 50,
          rotateX: isVisible ? 0 : -20
        }}
        transition={{ 
          duration: 0.8,
          type: "spring",
          damping: 20
        }}
        whileHover={{ 
          scale: 1.05,
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
        }}
        className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50"
        style={{ perspective: 1000 }}
      >
        <div className="flex items-start space-x-4">
          <motion.div 
            className="text-5xl"
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            {testimonial.icon}
          </motion.div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {testimonial.company}
            </h3>
            <p className="text-lg text-gray-300 italic">"{testimonial.quote}"</p>
            <div className="mt-4 flex items-center space-x-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                {testimonial.role ? testimonial.role.charAt(0) : 'CTO'}
              </div>
              <div>
                <p className="font-semibold">{testimonial.author || 'Engineering Lead'}</p>
                <p className="text-sm text-gray-400">{testimonial.role || 'Chief Technology Officer'}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };
  
  // Timeline events for Kafka evolution
  const timelineEvents = [
    { 
      date: '2020', 
      title: 'The Problem Emerges', 
      description: 'Traditional consumer groups hit scaling limits',
      icon: '🚧'
    },
    { 
      date: '2021', 
      title: 'Research & Design', 
      description: 'Share Groups concept introduced at Kafka Summit',
      icon: '🔬'
    },
    { 
      date: '2023', 
      title: 'Early Adoption', 
      description: 'Beta testing with enterprise partners',
      icon: '🚀'
    },
    { 
      date: '2024', 
      title: 'Production Ready', 
      description: 'Kafka 4.0 launches with Share Groups',
      icon: '🎉'
    },
    { 
      date: '2025', 
      title: 'Industry Standard', 
      description: 'Share Groups become the default for high-scale systems',
      icon: '👑'
    }
  ];
  
  // Testimonial data
  const testimonials = [
    { 
      company: 'Netflix', 
      icon: '🎬', 
      quote: 'Share Groups reduced our recommendation latency by 87% while handling 3x more traffic',
      author: 'Sarah Chen',
      role: 'Principal Engineer'
    },
    { 
      company: 'Uber', 
      icon: '🚗', 
      quote: 'We can now process surge pricing updates in real-time across all regions simultaneously',
      author: 'Marcus Johnson',
      role: 'VP of Engineering'
    },
    { 
      company: 'Amazon', 
      icon: '🛒', 
      quote: 'Order processing scalability improved by 250% with zero additional infrastructure',
      author: 'Priya Patel',
      role: 'Sr. Director, Infrastructure'
    }
  ];
  
  return (
    <div className="scene-container">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-black to-purple-900" />
      <motion.div 
        className="absolute inset-0"
        animate={{ 
          background: [
            'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.2) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
      />
      <ParticleBackground 
        particleCount={40} 
        colors={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b']} 
        behavior="float"
      />
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center p-8">
        <div className="w-full max-w-7xl">
          
          {/* Phase 1: Introduction */}
          <SceneTransition isActive={time >= phases.intro.start && time < phases.metrics.start}>
            <div className="text-center">
              <CinematicTitle
                title="Real-World Impact"
                subtitle="The Numbers That Matter"
                time={time}
                startTime={phases.intro.start}
              />
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: time > 1.5 ? 1 : 0,
                  scale: time > 1.5 ? 1 : 0.8
                }}
                transition={{ type: "spring", damping: 10 }}
              >
                <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
                  From Fortune 500 to startups, Share Groups are transforming how companies handle data at scale
                </p>
              </motion.div>
            </div>
          </SceneTransition>
          
          {/* Phase 2: Metrics Showcase */}
          <SceneTransition isActive={time >= phases.metrics.start && time < phases.testimonials.start}>
            <div className="space-y-12">
              <motion.h2 
                className="text-4xl font-bold text-center mb-8"
                style={getTextRevealStyle(time, phases.metrics.start, 1)}
              >
                Performance Breakthrough
              </motion.h2>
              
              {/* Animated Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {metrics.map((metric, i) => (
                  <motion.div
                    key={metric.label}
                    className="relative group"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ 
                      opacity: time > phases.metrics.start + i * 0.3 ? 1 : 0,
                      y: time > phases.metrics.start + i * 0.3 ? 0 : 50
                    }}
                    transition={{ duration: 0.8, type: "spring" }}
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                    
                    {/* Card content */}
                    <div className="relative bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 group-hover:border-gray-600/50 transition-all">
                      <motion.div 
                        className="text-5xl mb-4"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3
                        }}
                      >
                        {metric.icon}
                      </motion.div>
                      
                      <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">
                        {metric.label}
                      </div>
                      
                      <div className="text-5xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {metric.prefix}{metric.value}{metric.suffix}
                      </div>
                      
                      {metric.change && (
                        <motion.div 
                          className={`text-lg mt-2 font-semibold ${metric.change > 0 ? 'text-green-400' : 'text-red-400'}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          {metric.change > 0 ? '↑' : '↓'} {Math.abs(metric.change)}%
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </SceneTransition>
          
          {/* Phase 3: Testimonials */}
          <SceneTransition isActive={time >= phases.testimonials.start && time < phases.timeline.start}>
            <div className="space-y-12">
              <motion.h2 
                className="text-4xl font-bold text-center mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Industry Leaders Speak
              </motion.h2>
              
              <div className="space-y-8">
                {testimonials.map((testimonial, i) => (
                  <TestimonialCard key={i} testimonial={testimonial} index={i} />
                ))}
              </div>
            </div>
          </SceneTransition>
          
          {/* Phase 4: Evolution Timeline */}
          <SceneTransition isActive={time >= phases.timeline.start && time < phases.conclusion.start}>
            <div className="space-y-12">
              <motion.h2 
                className="text-4xl font-bold text-center mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                The Journey to Innovation
              </motion.h2>
              
              <div className="relative">
                {/* Timeline line */}
                <motion.div 
                  className="absolute left-16 top-0 w-1 bg-gradient-to-b from-blue-600 via-purple-600 to-green-600"
                  initial={{ height: 0 }}
                  animate={{ height: '100%' }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                />
                
                {/* Timeline events */}
                <div className="space-y-12">
                  {timelineEvents.map((event, i) => {
                    const eventTime = phases.timeline.start + i * 1.2;
                    const isActive = time >= eventTime;
                    
                    return (
                      <motion.div
                        key={i}
                        className="relative flex items-center"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ 
                          opacity: isActive ? 1 : 0.3,
                          x: isActive ? 0 : -50
                        }}
                        transition={{ duration: 0.8, type: "spring" }}
                      >
                        {/* Timeline dot */}
                        <motion.div 
                          className="absolute left-12 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-xl"
                          animate={isActive ? {
                            scale: [1, 1.2, 1],
                            boxShadow: ['0 0 0 0 rgba(59, 130, 246, 0)', '0 0 0 20px rgba(59, 130, 246, 0)', '0 0 0 0 rgba(59, 130, 246, 0)']
                          } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {event.icon}
                        </motion.div>
                        
                        {/* Event content */}
                        <div className="ml-24 bg-gray-900/60 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
                          <div className="text-sm text-gray-400 mb-1">{event.date}</div>
                          <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                          <p className="text-gray-300">{event.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </SceneTransition>
          
          {/* Phase 5: Conclusion */}
          <SceneTransition isActive={time >= phases.conclusion.start}>
            <motion.div 
              className="text-center space-y-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 10 }}
            >
              <h2 className="text-6xl font-black holographic">
                The Results Speak Louder
              </h2>
              <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
                Join the revolution. Transform your data pipeline with Kafka Share Groups.
              </p>
              <motion.div
                className="inline-block"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <button className="btn-interactive text-xl px-8 py-4">
                  Get Started Today →
                </button>
              </motion.div>
            </motion.div>
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

export default ImpactMetricsScene;