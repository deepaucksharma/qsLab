import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CinematicTitle,
  ArchitectureDiagram,
  MetricDisplay,
  ParticleBackground,
  SceneTransition
} from '../StorytellingComponents';
import { 
  getTimeBasedValue,
  getTextRevealStyle
} from '../../utils/animationHelpers';
import { getStaggeredDelay } from '../../utils/storytellingHelpers';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import logger from '../../utils/logger';

const ShareGroupArchitectureScene = ({ time, duration }) => {
  // Performance monitoring
  usePerformanceMonitor('ShareGroupArchitectureScene', { time, duration });
  
  // Scene phases for storytelling
  const phases = {
    intro: { start: 0, duration: 3 },
    architecture: { start: 3, duration: 7 },
    dataFlow: { start: 10, duration: 10 },
    metrics: { start: 20, duration: 8 },
    conclusion: { start: 28, duration: 2 }
  };
  
  const [activeMessages, setActiveMessages] = useState([]);
  const [processedCount, setProcessedCount] = useState(0);
  const progress = (time / duration) * 100;
  
  // Message flow simulation
  useEffect(() => {
    if (time > phases.dataFlow.start && time < phases.metrics.start) {
      const interval = setInterval(() => {
        const messageColors = ['#e50914', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
        const newMessage = {
          id: Date.now() + Math.random(),
          color: messageColors[Math.floor(Math.random() * messageColors.length)],
          path: Math.floor(Math.random() * 3), // 3 paths from brokers to consumers
          consumer: Math.floor(Math.random() * 5) + 1,
          speed: 2 + Math.random() * 2
        };
        
        setActiveMessages(prev => [...prev, newMessage]);
        setProcessedCount(prev => prev + 1);
        
        // Auto-remove after animation
        setTimeout(() => {
          setActiveMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
        }, 3000);
      }, 300);
      
      return () => clearInterval(interval);
    }
  }, [time, phases.dataFlow.start, phases.metrics.start]);
  
  // Log scene events
  useEffect(() => {
    logger.info('ShareGroupArchitectureScene phase transition', {
      time,
      processedMessages: processedCount
    });
  }, [Math.floor(time / 5)]);
  
  // Message Flow Component
  const MessageFlow = ({ message }) => {
    const pathVariants = {
      0: { x: -200, y: -100 },
      1: { x: 0, y: -100 },
      2: { x: 200, y: -100 }
    };
    
    return (
      <motion.div
        key={message.id}
        className="absolute w-4 h-4 rounded-full"
        style={{ 
          backgroundColor: message.color,
          boxShadow: `0 0 20px ${message.color}`,
          left: '50%',
          top: '40%'
        }}
        initial={pathVariants[message.path]}
        animate={{
          x: (message.consumer - 3) * 120,
          y: 200,
          opacity: [0, 1, 1, 0]
        }}
        transition={{
          duration: message.speed,
          ease: "linear"
        }}
      />
    );
  };
  
  // Architecture nodes for diagram
  const architectureNodes = [
    // Brokers
    { id: 'broker1', label: 'Broker 1', icon: '🖥️', x: 20, y: 20, className: 'border-blue-500' },
    { id: 'broker2', label: 'Broker 2', icon: '🖥️', x: 50, y: 20, className: 'border-blue-500' },
    { id: 'broker3', label: 'Broker 3', icon: '🖥️', x: 80, y: 20, className: 'border-blue-500' },
    
    // Topic
    { id: 'topic', label: 'Events Topic', icon: '📊', x: 50, y: 45, className: 'border-purple-500 scale-125' },
    
    // Share Group Consumers
    { id: 'consumer1', label: 'Consumer 1', icon: '👤', x: 10, y: 75, className: 'border-green-500' },
    { id: 'consumer2', label: 'Consumer 2', icon: '👤', x: 30, y: 75, className: 'border-green-500' },
    { id: 'consumer3', label: 'Consumer 3', icon: '👤', x: 50, y: 75, className: 'border-green-500' },
    { id: 'consumer4', label: 'Consumer 4', icon: '👤', x: 70, y: 75, className: 'border-green-500' },
    { id: 'consumer5', label: 'Consumer 5', icon: '👤', x: 90, y: 75, className: 'border-green-500' }
  ];
  
  const connections = [
    // Brokers to Topic
    { x1: '20%', y1: '25%', x2: '45%', y2: '40%' },
    { x1: '50%', y1: '25%', x2: '50%', y2: '40%' },
    { x1: '80%', y1: '25%', x2: '55%', y2: '40%' },
    
    // Topic to Consumers
    { x1: '40%', y1: '50%', x2: '10%', y2: '70%' },
    { x1: '45%', y1: '50%', x2: '30%', y2: '70%' },
    { x1: '50%', y1: '50%', x2: '50%', y2: '70%' },
    { x1: '55%', y1: '50%', x2: '70%', y2: '70%' },
    { x1: '60%', y1: '50%', x2: '90%', y2: '70%' }
  ];
  
  // Performance metrics
  const metrics = [
    { 
      label: 'Messages/Second', 
      value: getTimeBasedValue(time, phases.metrics.start, 2, 0, 10000, 'easeOutExpo'),
      suffix: '', 
      change: 500 
    },
    { 
      label: 'Latency', 
      value: getTimeBasedValue(time, phases.metrics.start + 1, 2, 100, 5, 'easeOutExpo'),
      suffix: 'ms', 
      change: -95 
    },
    { 
      label: 'Parallel Consumers', 
      value: getTimeBasedValue(time, phases.metrics.start + 2, 1, 0, 5, 'easeOutExpo'),
      suffix: '', 
      change: 400 
    },
    { 
      label: 'CPU Efficiency', 
      value: getTimeBasedValue(time, phases.metrics.start + 3, 2, 0, 98, 'easeOutExpo'),
      suffix: '%', 
      change: 85 
    }
  ];
  
  return (
    <div className="scene-container">
      {/* Multi-layered Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-black to-purple-900" />
      <div className="absolute inset-0 bg-tech-grid opacity-20" />
      <motion.div 
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 2 }}
      >
        <ParticleBackground 
          particleCount={50} 
          colors={['#4338ca', '#8b5cf6', '#3b82f6']} 
        />
      </motion.div>
      
      {/* Content Container */}
      <div className="relative z-10 h-full flex items-center justify-center p-8">
        <div className="w-full max-w-7xl">
          
          {/* Phase 1: Introduction */}
          <SceneTransition isActive={time >= phases.intro.start && time < phases.architecture.start}>
            <div className="text-center">
              <CinematicTitle
                title="Share Groups Architecture"
                subtitle="The Revolution in Stream Processing"
                time={time}
                startTime={phases.intro.start}
              />
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: time > 1.5 ? 1 : 0, y: time > 1.5 ? 0 : 20 }}
                transition={{ duration: 0.8 }}
              >
                <p className="text-2xl text-gray-300">
                  Witness the power of concurrent message processing
                </p>
              </motion.div>
            </div>
          </SceneTransition>
          
          {/* Phase 2: Architecture Overview */}
          <SceneTransition isActive={time >= phases.architecture.start && time < phases.dataFlow.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={getTextRevealStyle(time, phases.architecture.start, 1)}
              >
                The Architecture That Changes Everything
              </motion.h2>
              
              <div className="h-[500px] relative">
                <ArchitectureDiagram
                  nodes={architectureNodes}
                  connections={connections}
                  time={time}
                  startTime={phases.architecture.start}
                />
              </div>
              
              <motion.div
                className="text-center mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: time > phases.architecture.start + 3 ? 1 : 0 }}
              >
                <p className="text-xl text-gray-300">
                  Multiple consumers can now process messages from the same partition
                </p>
              </motion.div>
            </div>
          </SceneTransition>
          
          {/* Phase 3: Live Data Flow */}
          <SceneTransition isActive={time >= phases.dataFlow.start && time < phases.metrics.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 10 }}
              >
                Real-Time Message Processing
              </motion.h2>
              
              {/* Animated Architecture with Message Flow */}
              <div className="relative h-[500px]">
                {/* Static Architecture */}
                <div className="h-full opacity-30">
                  <ArchitectureDiagram
                    nodes={architectureNodes}
                    connections={connections}
                    time={30}
                    startTime={0}
                  />
                </div>
                
                {/* Animated Messages */}
                <AnimatePresence>
                  {activeMessages.map(message => (
                    <MessageFlow key={message.id} message={message} />
                  ))}
                </AnimatePresence>
                
                {/* Message Counter */}
                <motion.div
                  className="absolute top-4 right-4 bg-black/60 backdrop-blur-lg rounded-2xl p-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10 }}
                >
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-400">{processedCount}</div>
                    <div className="text-sm text-gray-400 mt-1">Messages Processed</div>
                  </div>
                </motion.div>
              </div>
              
              {/* Key Features */}
              <div className="grid grid-cols-3 gap-6 mt-8">
                {['No Blocking', 'Auto-Balance', 'Fault Tolerant'].map((feature, i) => (
                  <motion.div
                    key={feature}
                    className="bg-gray-900/60 backdrop-blur-lg rounded-xl p-6 text-center border border-green-600/30"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: getStaggeredDelay(i, 0.2) }}
                    whileHover={{ scale: 1.05, borderColor: 'rgb(34 197 94 / 0.6)' }}
                  >
                    <div className="text-3xl mb-2">
                      {['⚡', '⚖️', '🛡️'][i]}
                    </div>
                    <div className="font-semibold text-lg">{feature}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </SceneTransition>
          
          {/* Phase 4: Performance Metrics */}
          <SceneTransition isActive={time >= phases.metrics.start && time < phases.conclusion.start}>
            <div className="space-y-12">
              <motion.h2 
                className="text-4xl font-bold text-center mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                The Numbers Speak for Themselves
              </motion.h2>
              
              <MetricDisplay
                metrics={metrics}
                time={time}
                startTime={phases.metrics.start}
              />
              
              <motion.div
                className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-3xl p-8 border border-green-600/30"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-2xl font-bold mb-4 text-center">
                  Why This Matters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">🚀</span>
                    <div>
                      <h4 className="font-semibold mb-1">Unlimited Scale</h4>
                      <p className="text-gray-400">Add consumers without partition limits</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <h4 className="font-semibold mb-1">Zero Bottlenecks</h4>
                      <p className="text-gray-400">Messages processed independently</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </SceneTransition>
          
          {/* Phase 5: Conclusion */}
          <SceneTransition isActive={time >= phases.conclusion.start}>
            <motion.div 
              className="text-center space-y-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 10 }}
            >
              <h2 className="text-5xl font-black holographic">
                The Future is Concurrent
              </h2>
              <p className="text-2xl text-gray-300">
                Kafka Share Groups: Now Available in Kafka 4.0
              </p>
            </motion.div>
          </SceneTransition>
        </div>
      </div>
      
      {/* Progress Indicator */}
      <div className="progress-story">
        <div 
          className="progress-story-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ShareGroupArchitectureScene;