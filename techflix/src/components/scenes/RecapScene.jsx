import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Award, TrendingUp, Sparkles } from 'lucide-react';
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

const RecapScene = ({ time, duration }) => {
  // Scene phases
  const phases = {
    intro: { start: 0, duration: 3 },
    journey: { start: 3, duration: 10 },
    achievements: { start: 13, duration: 5 },
    motivation: { start: 18, duration: 4 },
    conclusion: { start: 22, duration: 3 }
  };
  
  const [completedAchievements, setCompletedAchievements] = useState([]);
  const progress = (time / duration) * 100;
  
  // Journey milestones
  const journeyMilestones = [
    {
      id: 'fundamentals',
      icon: '🎯',
      title: 'Kafka Share Groups Fundamentals',
      description: 'Mastered the revolutionary consumer model breaking partition limits',
      color: 'from-purple-500 to-blue-500',
      stats: { concepts: 12, exercises: 5 }
    },
    {
      id: 'metrics',
      icon: '📊',
      title: 'Critical Metrics & JMX Exploration',
      description: 'Learned to monitor RecordsUnacked and navigate MBean trees',
      color: 'from-blue-500 to-cyan-500',
      stats: { metrics: 25, dashboards: 3 }
    },
    {
      id: 'development',
      icon: '🔧',
      title: 'Custom OHI Development',
      description: 'Built custom integrations for QueueSample metrics',
      color: 'from-cyan-500 to-green-500',
      stats: { integrations: 8, apis: 15 }
    },
    {
      id: 'visualization',
      icon: '🎨',
      title: 'Queues & Streams UI Integration',
      description: "Visualized Share Groups in New Relic's powerful interface",
      color: 'from-green-500 to-yellow-500',
      stats: { charts: 10, insights: 20 }
    },
    {
      id: 'excellence',
      icon: '🚀',
      title: 'Operational Best Practices',
      description: 'Applied real-world strategies for production excellence',
      color: 'from-yellow-500 to-orange-500',
      stats: { practices: 15, optimizations: 7 }
    }
  ];
  
  // Update completed achievements based on time
  useEffect(() => {
    if (time >= phases.journey.start) {
      const numCompleted = Math.min(
        journeyMilestones.length,
        Math.floor((time - phases.journey.start) / 2)
      );
      setCompletedAchievements(journeyMilestones.slice(0, numCompleted).map(m => m.id));
    }
  }, [time, phases.journey.start]);
  
  // Camera movements
  const cameraMovements = [
    { start: 0, end: 3, fromX: 0, toX: 0, fromY: -30, toY: 0, fromScale: 0.9, toScale: 1 },
    { start: 13, end: 15, fromX: 0, toX: 0, fromY: 0, toY: 0, fromScale: 1, toScale: 1.1 },
    { start: 18, end: 20, fromX: 0, toX: 0, fromY: 0, toY: 0, fromScale: 1.1, toScale: 1 }
  ];
  
  const cameraTransform = getCameraTransform(time, cameraMovements);
  
  // Statistics calculation
  const totalStats = journeyMilestones.reduce((acc, milestone) => {
    if (completedAchievements.includes(milestone.id)) {
      Object.entries(milestone.stats).forEach(([key, value]) => {
        acc[key] = (acc[key] || 0) + value;
      });
    }
    return acc;
  }, {});
  
  // Achievement visualization
  const AchievementVisual = ({ milestone, isCompleted, index }) => {
    const isActive = completedAchievements[completedAchievements.length - 1] === milestone.id;
    
    return (
      <motion.div
        className="relative"
        initial={{ x: -100, opacity: 0 }}
        animate={{ 
          x: isCompleted ? 0 : -100,
          opacity: isCompleted ? 1 : 0
        }}
        transition={{ 
          delay: getStaggeredDelay(index, 0.3),
          type: "spring",
          damping: 20
        }}
      >
        {/* Connection line to next */}
        {index < journeyMilestones.length - 1 && isCompleted && (
          <motion.div
            className="absolute top-1/2 left-full w-full h-0.5 bg-gradient-to-r from-gray-600 to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{ transformOrigin: 'left' }}
          />
        )}
        
        {/* Achievement card */}
        <motion.div
          className={`relative bg-gray-900/60 backdrop-blur-lg rounded-2xl p-6 border-2 transition-all duration-300 ${
            isActive ? 'border-purple-500 shadow-2xl' : 'border-gray-700/50'
          }`}
          whileHover={{ scale: 1.05, borderColor: 'rgb(139 92 246)' }}
        >
          {/* Active glow */}
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: `radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 70%)`,
                filter: 'blur(20px)'
              }}
            />
          )}
          
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <motion.div 
                className="text-5xl"
                animate={isActive ? { 
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1.1, 1.1, 1]
                } : {}}
                transition={{ duration: 0.5 }}
              >
                {milestone.icon}
              </motion.div>
              
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: isCompleted ? 1 : 0, rotate: 0 }}
                transition={{ type: "spring", damping: 10 }}
              >
                <CheckCircle className="w-8 h-8 text-green-400" />
              </motion.div>
            </div>
            
            {/* Content */}
            <h3 className={`text-xl font-bold mb-2 bg-gradient-to-r ${milestone.color} bg-clip-text text-transparent`}>
              {milestone.title}
            </h3>
            <p className="text-gray-400 mb-4">{milestone.description}</p>
            
            {/* Stats */}
            <div className="flex gap-4">
              {Object.entries(milestone.stats).map(([key, value]) => (
                <div key={key} className="text-center">
                  <motion.div 
                    className="text-2xl font-bold text-purple-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: isCompleted ? 1 : 0 }}
                    transition={{ type: "spring", damping: 10, delay: 0.2 }}
                  >
                    {value}
                  </motion.div>
                  <div className="text-xs text-gray-500 capitalize">{key}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };
  
  return (
    <div className="scene-container">
      {/* Dynamic Background */}
      <motion.div 
        className="absolute inset-0"
        animate={{ 
          background: [
            'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 80%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
      />
      
      {/* Celebration particles */}
      <ParticleBackground 
        particleCount={60} 
        colors={['#8b5cf6', '#3b82f6', '#ec4899', '#f59e0b']} 
      />
      
      {/* Floating achievement badges */}
      <AnimatePresence>
        {time >= phases.achievements.start && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 100
                }}
                animate={{ 
                  x: Math.random() * window.innerWidth,
                  y: -100
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 10 + Math.random() * 5,
                  delay: i * 0.5,
                  repeat: Infinity
                }}
              >
                <Award className="w-8 h-8 text-yellow-400 opacity-60" />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
      
      {/* Content with camera transform */}
      <div 
        className="relative z-10 h-full flex items-center justify-center p-8"
        style={{ transform: cameraTransform }}
      >
        <div className="w-full max-w-7xl">
          
          {/* Phase 1: Introduction */}
          <SceneTransition isActive={time >= phases.intro.start && time < phases.journey.start}>
            <CinematicTitle
              title="Your Journey So Far"
              subtitle="From Fundamentals to Production Excellence"
              time={time}
              startTime={phases.intro.start}
            />
          </SceneTransition>
          
          {/* Phase 2: Journey Timeline */}
          <SceneTransition isActive={time >= phases.journey.start && time < phases.achievements.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center mb-12"
                style={getTextRevealStyle(time, phases.journey.start, 1)}
              >
                Milestones Achieved
              </motion.h2>
              
              <div className="grid gap-6">
                {journeyMilestones.map((milestone, index) => (
                  <AchievementVisual
                    key={milestone.id}
                    milestone={milestone}
                    isCompleted={completedAchievements.includes(milestone.id)}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </SceneTransition>
          
          {/* Phase 3: Achievement Summary */}
          <SceneTransition isActive={time >= phases.achievements.start && time < phases.motivation.start}>
            <div className="text-center space-y-8">
              <motion.h2 
                className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 10 }}
              >
                Outstanding Progress!
              </motion.h2>
              
              {/* Stats grid */}
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {Object.entries(totalStats).map(([key, value], i) => (
                  <motion.div
                    key={key}
                    className="bg-gray-900/60 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      delay: getStaggeredDelay(i, 0.2) + 0.8,
                      type: "spring",
                      damping: 10
                    }}
                  >
                    <motion.div 
                      className="text-4xl font-bold text-purple-400"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        color: ['#8b5cf6', '#ec4899', '#8b5cf6']
                      }}
                      transition={{ 
                        duration: 2,
                        delay: 1 + i * 0.2,
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                    >
                      {value}+
                    </motion.div>
                    <div className="text-sm text-gray-400 capitalize mt-2">{key} Mastered</div>
                  </motion.div>
                ))}
              </motion.div>
              
              {/* Achievement level */}
              <motion.div
                className="inline-block"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.5, type: "spring", damping: 10 }}
              >
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full px-8 py-4 flex items-center gap-3">
                  <Award className="w-8 h-8 text-white" />
                  <span className="text-2xl font-bold text-white">Expert Level Achieved!</span>
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </motion.div>
            </div>
          </SceneTransition>
          
          {/* Phase 4: Motivation */}
          <SceneTransition isActive={time >= phases.motivation.start && time < phases.conclusion.start}>
            <motion.div 
              className="text-center space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-5xl font-bold mb-6">Ready for What&apos;s Next?</h2>
              
              <motion.div
                className="max-w-3xl mx-auto space-y-6"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-2xl text-gray-300">
                  You&apos;ve conquered complex concepts, built powerful integrations, 
                  and mastered cutting-edge technologies.
                </p>
                
                <motion.div
                  className="flex items-center justify-center gap-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: "spring", damping: 10 }}
                >
                  <TrendingUp className="w-12 h-12 text-green-400" />
                  <span className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    Your Growth Trajectory
                  </span>
                </motion.div>
                
                {/* Growth visualization */}
                <motion.svg
                  viewBox="0 0 400 200"
                  className="w-full max-w-md mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  <motion.path
                    d="M 50 150 Q 150 120 200 80 T 350 20"
                    fill="none"
                    stroke="url(#growth-gradient)"
                    strokeWidth="4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 2 }}
                  />
                  <defs>
                    <linearGradient id="growth-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </motion.svg>
              </motion.div>
            </motion.div>
          </SceneTransition>
          
          {/* Phase 5: Conclusion */}
          <SceneTransition isActive={time >= phases.conclusion.start}>
            <motion.div 
              className="text-center space-y-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 10 }}
            >
              <h2 className="text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                The Journey Continues...
              </h2>
              <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
                Next stop: Advanced architectural patterns and enterprise solutions
              </p>
              
              {/* Call to action */}
              <motion.div
                className="inline-block"
                animate={{ 
                  y: [0, -10, 0],
                  boxShadow: [
                    "0 0 20px rgba(139, 92, 246, 0.5)",
                    "0 0 40px rgba(236, 72, 153, 0.5)",
                    "0 0 20px rgba(139, 92, 246, 0.5)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg px-8 py-4">
                  <span className="text-xl font-bold text-white">Continue to Next Episode →</span>
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
        />
      </div>
    </div>
  );
};

export default RecapScene;