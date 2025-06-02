import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CinematicTitle,
  Timeline,
  ParticleBackground,
  SceneTransition
} from '../StorytellingComponents';
import {
  getTextRevealStyle,
  getTimeBasedValue
} from '../../utils/animationHelpers';
import { getStaggeredDelay } from '../../utils/storytellingHelpers';

const EvolutionTimelineScene = ({ time, duration }) => {
  // Scene phases for storytelling
  const phases = {
    intro: { start: 0, duration: 3 },
    timeline: { start: 3, duration: 20 },
    conclusion: { start: 23, duration: 7 }
  };
  
  const progress = (time / duration) * 100;
  
  // Kafka evolution milestones with enhanced storytelling
  const milestones = [
    {
      date: '2011',
      title: 'The Beginning',
      description: 'LinkedIn creates Kafka to handle 1 billion events/day',
      icon: '🌱',
      version: '0.6',
      impact: 'Birth of distributed streaming',
      color: 'from-blue-600 to-blue-400'
    },
    {
      date: '2014',
      title: 'Going Mainstream',
      description: 'Kafka becomes Apache top-level project',
      icon: '🚀',
      version: '0.8',
      impact: 'Enterprise adoption begins',
      color: 'from-purple-600 to-purple-400'
    },
    {
      date: '2017',
      title: 'Streaming Revolution',
      description: 'Kafka Streams and exactly-once semantics',
      icon: '⚡',
      version: '1.0',
      impact: 'Real-time processing unleashed',
      color: 'from-green-600 to-green-400'
    },
    {
      date: '2022',
      title: 'Cloud Native Era',
      description: 'KRaft consensus protocol replaces ZooKeeper',
      icon: '☁️',
      version: '3.0',
      impact: 'Simplified operations at scale',
      color: 'from-orange-600 to-orange-400'
    },
    {
      date: '2025',
      title: 'Share Groups Launch',
      description: 'Revolutionary concurrent consumption within partitions',
      icon: '🎯',
      version: '4.0',
      impact: 'The future of streaming is here',
      color: 'from-red-600 to-pink-400'
    }
  ];
  
  // Calculate active milestone based on time
  const activeMilestoneIndex = Math.floor(
    getTimeBasedValue(time, phases.timeline.start, phases.timeline.duration, 0, milestones.length)
  );
  
  // Milestone Card Component
  const MilestoneCard = ({ milestone, index, isActive, isPast }) => {
    const cardDelay = phases.timeline.start + index * 3;
    const isVisible = time >= cardDelay;
    
    return (
      <motion.div
        className="relative"
        initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
        animate={{ 
          opacity: isVisible ? 1 : 0,
          x: isVisible ? 0 : (index % 2 === 0 ? -100 : 100)
        }}
        transition={{ duration: 0.8, type: "spring", damping: 20 }}
      >
        {/* Connection Line */}
        {index < milestones.length - 1 && (
          <motion.div
            className="absolute top-1/2 left-1/2 w-full h-0.5 -translate-y-1/2"
            style={{ left: index % 2 === 0 ? '50%' : 'auto', right: index % 2 === 1 ? '50%' : 'auto' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isPast || isActive ? 1 : 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div className={`h-full bg-gradient-to-r ${milestone.color}`} />
          </motion.div>
        )}
        
        {/* Milestone Node */}
        <motion.div
          className={`relative z-10 bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 border-2 transition-all duration-500 ${
            isActive ? 'border-white scale-105' : isPast ? 'border-gray-600' : 'border-gray-800'
          }`}
          whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
        >
          {/* Year Badge */}
          <motion.div
            className={`absolute -top-4 ${index % 2 === 0 ? '-left-4' : '-right-4'} px-4 py-2 rounded-full bg-gradient-to-r ${milestone.color} text-white font-bold`}
            animate={isActive ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {milestone.date}
          </motion.div>
          
          {/* Content */}
          <div className="space-y-4">
            <motion.div 
              className="text-5xl"
              animate={isActive ? { rotate: [0, -10, 10, -10, 0] } : {}}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              {milestone.icon}
            </motion.div>
            
            <div>
              <h3 className="text-2xl font-bold mb-1">{milestone.title}</h3>
              <p className="text-gray-400 mb-2">{milestone.description}</p>
              
              <div className="flex items-center gap-4 mt-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${milestone.color} text-white`}>
                  v{milestone.version}
                </span>
                <span className="text-sm text-gray-500">{milestone.impact}</span>
              </div>
            </div>
          </div>
          
          {/* Active Indicator */}
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className={`w-full h-full rounded-2xl bg-gradient-to-r ${milestone.color}`} />
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    );
  };
  
  return (
    <div className="scene-container">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-black to-purple-900" />
      <div className="absolute inset-0 bg-tech-grid opacity-10" />
      <ParticleBackground 
        particleCount={40} 
        colors={['#4338ca', '#8b5cf6', '#3b82f6']} 
      />
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center p-8">
        <div className="w-full max-w-7xl">
          
          {/* Phase 1: Introduction */}
          <SceneTransition isActive={time >= phases.intro.start && time < phases.timeline.start}>
            <div className="text-center">
              <CinematicTitle
                title="The Evolution of Kafka"
                subtitle="From Message Queue to Streaming Platform"
                time={time}
                startTime={phases.intro.start}
              />
              
              <motion.div
                className="mt-8 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: time > 1.5 ? 1 : 0, y: time > 1.5 ? 0 : 20 }}
                transition={{ duration: 0.8 }}
              >
                <p className="text-xl text-gray-300">
                  Join us on a journey through time as we explore how Apache Kafka transformed
                  from a simple messaging system into the backbone of modern data infrastructure
                </p>
              </motion.div>
            </div>
          </SceneTransition>
          
          {/* Phase 2: Timeline Journey */}
          <SceneTransition isActive={time >= phases.timeline.start && time < phases.conclusion.start}>
            <div className="space-y-16">
              <motion.h2 
                className="text-4xl font-bold text-center mb-12"
                style={getTextRevealStyle(time, phases.timeline.start, 1)}
              >
                A Decade of Innovation
              </motion.h2>
              
              {/* Timeline Container */}
              <div className="relative">
                {/* Timeline Path */}
                <motion.div
                  className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 via-purple-600 to-red-600 -translate-x-1/2"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  style={{ transformOrigin: 'top' }}
                />
                
                {/* Milestones */}
                <div className="space-y-24">
                  {milestones.map((milestone, index) => (
                    <div
                      key={milestone.date}
                      className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className="w-5/12">
                        <MilestoneCard
                          milestone={milestone}
                          index={index}
                          isActive={index === activeMilestoneIndex}
                          isPast={index < activeMilestoneIndex}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SceneTransition>
          
          {/* Phase 3: Conclusion */}
          <SceneTransition isActive={time >= phases.conclusion.start}>
            <motion.div 
              className="text-center space-y-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 10 }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 1, -1, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <h2 className="text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-transparent">
                  14 Years of Excellence
                </h2>
              </motion.div>
              
              <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
                From handling billions to trillions of events, Kafka continues to push the boundaries
                of what's possible in distributed systems
              </p>
              
              <motion.div
                className="pt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="inline-flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-400">80%</div>
                    <div className="text-sm text-gray-400">Fortune 100</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-400">7T+</div>
                    <div className="text-sm text-gray-400">Messages/Day</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-red-400">∞</div>
                    <div className="text-sm text-gray-400">Possibilities</div>
                  </div>
                </div>
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

export default EvolutionTimelineScene;