import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/techflix-cinematic-v2.css';

const EvolutionTimelineScene = ({ time, duration }) => {
  // Scene phases for storytelling
  const phases = {
    intro: { start: 0, duration: 3 },
    timeline: { start: 3, duration: 20 },
    conclusion: { start: 23, duration: 7 }
  };
  
  const progress = (time / duration) * 100;
  
  // Determine current phase based on time
  const currentPhase = Object.entries(phases).find(([_, phase]) => 
    time >= phase.start && time < phase.start + phase.duration
  )?.[0] || 'conclusion';
  
  // Kafka evolution milestones
  const milestones = [
    {
      date: '2011',
      title: 'The Beginning',
      description: 'LinkedIn creates Kafka to handle 1 billion events/day',
      icon: '🌱',
      version: '0.6',
      impact: 'Birth of distributed streaming',
      color: 'text-blue-400'
    },
    {
      date: '2014',
      title: 'Going Mainstream',
      description: 'Kafka becomes Apache top-level project',
      icon: '🚀',
      version: '0.8',
      impact: 'Enterprise adoption begins',
      color: 'text-purple-400'
    },
    {
      date: '2017',
      title: 'Streaming Revolution',
      description: 'Kafka Streams and exactly-once semantics',
      icon: '⚡',
      version: '1.0',
      impact: 'Real-time processing unleashed',
      color: 'text-green-400'
    },
    {
      date: '2022',
      title: 'Cloud Native Era',
      description: 'KRaft consensus protocol replaces ZooKeeper',
      icon: '☁️',
      version: '3.0',
      impact: 'Simplified operations at scale',
      color: 'text-orange-400'
    },
    {
      date: '2025',
      title: 'Share Groups Launch',
      description: 'Revolutionary concurrent consumption within partitions',
      icon: '🎯',
      version: '4.0',
      impact: 'The future of streaming is here',
      color: 'text-red-400'
    }
  ];
  
  // Calculate active milestone based on time
  const timeInTimeline = time - phases.timeline.start;
  const milestoneProgress = Math.min(1, Math.max(0, timeInTimeline / phases.timeline.duration));
  const activeMilestoneIndex = Math.floor(milestoneProgress * milestones.length);
  
  // Milestone Card Component
  const MilestoneCard = ({ milestone, index, isActive, isPast }) => {
    const cardDelay = index * 0.2;
    const isVisible = currentPhase === 'timeline' && timeInTimeline >= index * 3;
    
    return (
      <motion.div
        className="relative"
        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
        animate={{ 
          opacity: isVisible ? 1 : 0,
          x: isVisible ? 0 : (index % 2 === 0 ? -50 : 50)
        }}
        transition={{ duration: 0.8, delay: cardDelay }}
      >
        {/* Milestone Card */}
        <div className={`metric-card-v2 ${isActive ? 'ring-2 ring-white' : ''}`}>
          {/* Year Badge */}
          <div className={`absolute -top-4 ${index % 2 === 0 ? '-left-4' : '-right-4'} px-4 py-2 rounded-full bg-gray-900 border border-gray-600 ${milestone.color} font-bold`}>
            {milestone.date}
          </div>
          
          {/* Content */}
          <div className="space-y-4">
            <motion.div 
              className="text-5xl"
              animate={isActive ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              {milestone.icon}
            </motion.div>
            
            <div>
              <h3 className="text-2xl font-bold mb-1">{milestone.title}</h3>
              <p className="text-gray-400 mb-2">{milestone.description}</p>
              
              <div className="flex items-center gap-4 mt-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-gray-800 ${milestone.color}`}>
                  v{milestone.version}
                </span>
                <span className="text-sm text-gray-500">{milestone.impact}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };
  
  return (
    <div className="scene-container-v2">
      <div className="scene-content">
        <div className="flex flex-col items-center justify-center min-h-full py-12">
          <AnimatePresence mode="wait">
            {/* Phase 1: Introduction */}
            {currentPhase === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-6"
              >
                <h1 className="scene-title">The Evolution of Kafka</h1>
                <p className="scene-subtitle">From Message Queue to Streaming Platform</p>
                
                <motion.p
                  className="text-xl text-gray-300 max-w-3xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  Join us on a journey through time as we explore how Apache Kafka transformed
                  from a simple messaging system into the backbone of modern data infrastructure
                </motion.p>
              </motion.div>
            )}
            
            {/* Phase 2: Timeline Journey */}
            {currentPhase === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-7xl space-y-12"
              >
                <h2 className="text-4xl font-bold text-center">
                  A Decade of Innovation
                </h2>
                
                {/* Timeline Container */}
                <div className="relative">
                  {/* Central Timeline Line */}
                  <motion.div
                    className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-purple-400 to-red-400 -translate-x-1/2"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    style={{ transformOrigin: 'top' }}
                  />
                  
                  {/* Milestones */}
                  <div className="space-y-16">
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
              </motion.div>
            )}
            
            {/* Phase 3: Conclusion */}
            {currentPhase === 'conclusion' && (
              <motion.div
                key="conclusion"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-8"
              >
                <h2 className="text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-transparent">
                  14 Years of Excellence
                </h2>
                
                <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
                  From handling billions to trillions of events, Kafka continues to push the boundaries
                  of what's possible in distributed systems
                </p>
                
                <motion.div
                  className="grid grid-cols-3 gap-8 pt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <div className="metric-card-v2 text-center">
                    <div className="text-4xl font-bold text-blue-400">80%</div>
                    <div className="text-sm text-gray-400 mt-2">Fortune 100</div>
                  </div>
                  <div className="metric-card-v2 text-center">
                    <div className="text-4xl font-bold text-purple-400">7T+</div>
                    <div className="text-sm text-gray-400 mt-2">Messages/Day</div>
                  </div>
                  <div className="metric-card-v2 text-center">
                    <div className="text-4xl font-bold text-red-400">∞</div>
                    <div className="text-sm text-gray-400 mt-2">Possibilities</div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default EvolutionTimelineScene;