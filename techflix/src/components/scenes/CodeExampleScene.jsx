import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, GitBranch, Code2, Sparkles } from 'lucide-react';
import {
  CinematicTitle,
  CodeDemo,
  SceneTransition,
  ParticleBackground
} from '../StorytellingComponents';
import {
  getTextRevealStyle,
  getTimeBasedValue,
  getCameraTransform
} from '../../utils/animationHelpers';
import { getStaggeredDelay } from '../../utils/storytellingHelpers';

const CodeExampleScene = ({ time, duration }) => {
  // Scene phases
  const phases = {
    intro: { start: 0, duration: 3 },
    problem: { start: 3, duration: 6 },
    solution: { start: 9, duration: 8 },
    benefits: { start: 17, duration: 6 },
    conclusion: { start: 23, duration: 3 }
  };
  
  const [activeHighlight, setActiveHighlight] = useState(null);
  const progress = (time / duration) * 100;
  
  // Traditional consumer group code
  const traditionalCode = `// Traditional Consumer Group
const consumer = kafka.consumer({ 
    groupId: 'payment-processors' 
});

// Limited to partition count!
// 10 partitions = max 10 consumers
await consumer.subscribe({ topic: 'payments' });

await consumer.run({
    eachMessage: async ({ message, partition }) => {
        // Process message from assigned partition
        await processPayment(message);
        // Commit happens automatically
    }
});`;
  
  // Share group code
  const shareGroupCode = `// Share Group Consumer (Kafka 4.0)
const shareConsumer = kafka.shareConsumer({ 
    groupId: 'share:payment-processors' 
});

// Scale to 100s of consumers!
// Each message individually tracked
await shareConsumer.subscribe({ topic: 'payments' });

await shareConsumer.run({
    eachMessage: async ({ message }) => {
        try {
            await processPayment(message);
            await shareConsumer.acknowledge(message);
        } catch (error) {
            if (isRetryable(error)) {
                await shareConsumer.release(message);
            } else {
                await shareConsumer.reject(message);
            }
        }
    }
});`;
  
  // Highlight specific lines based on time
  useEffect(() => {
    if (time >= phases.problem.start && time < phases.solution.start) {
      setActiveHighlight('traditional-limitation');
    } else if (time >= phases.solution.start && time < phases.benefits.start) {
      setActiveHighlight('share-group-power');
    } else if (time >= phases.benefits.start) {
      setActiveHighlight('error-handling');
    } else {
      setActiveHighlight(null);
    }
  }, [time, phases]);
  
  // Camera movements
  const cameraMovements = [
    { start: 0, end: 3, fromX: 0, toX: 0, fromY: -20, toY: 0, fromScale: 0.9, toScale: 1 },
    { start: 9, end: 11, fromX: 0, toX: 0, fromY: 0, toY: 0, fromScale: 1, toScale: 1.1 },
    { start: 17, end: 19, fromX: 0, toX: 0, fromY: 0, toY: 0, fromScale: 1.1, toScale: 1 }
  ];
  
  const cameraTransform = getCameraTransform(time, cameraMovements);
  
  // Benefits data
  const benefits = [
    {
      icon: '⚡',
      title: 'Infinite Scaling',
      description: 'Add consumers without partition limits',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '🎯',
      title: 'Fine-grained ACKs',
      description: 'Individual message acknowledgment',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '🔄',
      title: 'Smart Retries',
      description: 'Release messages for reprocessing',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: '🚀',
      title: 'Better Throughput',
      description: 'Optimal work distribution',
      color: 'from-orange-500 to-red-500'
    }
  ];
  
  return (
    <div className="scene-container">
      {/* Dynamic Background */}
      <motion.div 
        className="absolute inset-0"
        animate={{ 
          background: [
            'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 12, repeat: Infinity, repeatType: "reverse" }}
      />
      
      {/* Tech particles */}
      <ParticleBackground 
        particleCount={40} 
        colors={['#4338ca', '#8b5cf6', '#3b82f6', '#10b981']} 
      />
      
      {/* Content with camera transform */}
      <div 
        className="relative z-10 h-full flex items-center justify-center p-8"
        style={{ transform: cameraTransform }}
      >
        <div className="w-full max-w-7xl">
          
          {/* Phase 1: Introduction */}
          <SceneTransition isActive={time >= phases.intro.start && time < phases.problem.start}>
            <CinematicTitle
              title="Code Revolution"
              subtitle="From Traditional to Share Groups"
              time={time}
              startTime={phases.intro.start}
            />
          </SceneTransition>
          
          {/* Phase 2: Problem - Traditional Approach */}
          <SceneTransition isActive={time >= phases.problem.start && time < phases.solution.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center mb-8"
                style={getTextRevealStyle(time, phases.problem.start, 1)}
              >
                The Traditional Limitation
              </motion.h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Code Example */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <CodeDemo
                    code={traditionalCode}
                    language="javascript"
                    time={time}
                    startTime={phases.problem.start}
                    highlights={activeHighlight === 'traditional-limitation' ? [
                      { start: phases.problem.start + 2, end: phases.problem.start + 5, lines: [5, 6, 7] }
                    ] : []}
                  />
                </motion.div>
                
                {/* Visualization */}
                <motion.div
                  className="flex items-center justify-center"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <div className="relative">
                    {/* Partition visualization */}
                    <div className="grid grid-cols-5 gap-2">
                      {[...Array(10)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-16 h-16 bg-gray-800 rounded-lg border-2 border-gray-600 flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: getStaggeredDelay(i, 0.1) + 0.5 }}
                        >
                          <span className="text-xs">P{i}</span>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Limitation indicator */}
                    <motion.div
                      className="absolute -bottom-16 left-0 right-0 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: time > phases.problem.start + 3 ? 1 : 0 }}
                    >
                      <p className="text-red-400 font-semibold">
                        ⚠️ Max 10 Consumers
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </SceneTransition>
          
          {/* Phase 3: Solution - Share Groups */}
          <SceneTransition isActive={time >= phases.solution.start && time < phases.benefits.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 10 }}
              >
                Enter Share Groups
              </motion.h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Share Group Code */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <CodeDemo
                    code={shareGroupCode}
                    language="javascript"
                    time={time}
                    startTime={phases.solution.start}
                    highlights={activeHighlight === 'share-group-power' ? [
                      { start: phases.solution.start + 2, end: phases.solution.start + 5, lines: [5, 6] }
                    ] : []}
                  />
                </motion.div>
                
                {/* Dynamic Consumer Visualization */}
                <motion.div
                  className="flex items-center justify-center"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <div className="relative">
                    {/* Infinite consumers animation */}
                    <div className="relative w-64 h-64">
                      {[...Array(20)].map((_, i) => {
                        const angle = (i / 20) * 360;
                        const radius = 80 + (i % 3) * 20;
                        const x = Math.cos(angle * Math.PI / 180) * radius;
                        const y = Math.sin(angle * Math.PI / 180) * radius;
                        
                        return (
                          <motion.div
                            key={i}
                            className="absolute w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{
                              left: '50%',
                              top: '50%',
                              transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`
                            }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ 
                              scale: [0, 1, 1],
                              opacity: [0, 1, 0.8]
                            }}
                            transition={{ 
                              delay: getStaggeredDelay(i, 0.1) + 0.5,
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 1
                            }}
                          >
                            C{i}
                          </motion.div>
                        );
                      })}
                      
                      {/* Center hub */}
                      <motion.div
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      >
                        <GitBranch className="w-10 h-10 text-white" />
                      </motion.div>
                    </div>
                    
                    {/* Success indicator */}
                    <motion.div
                      className="absolute -bottom-16 left-0 right-0 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: time > phases.solution.start + 3 ? 1 : 0 }}
                    >
                      <p className="text-green-400 font-semibold">
                        ✅ Unlimited Consumers
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </SceneTransition>
          
          {/* Phase 4: Benefits Showcase */}
          <SceneTransition isActive={time >= phases.benefits.start && time < phases.conclusion.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Game-Changing Features
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {benefits.map((benefit, i) => (
                  <motion.div
                    key={benefit.title}
                    className="relative group"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      delay: getStaggeredDelay(i, 0.2),
                      type: "spring",
                      damping: 10
                    }}
                  >
                    <div className="bg-gray-900/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 h-full hover:border-purple-500 transition-all duration-300">
                      {/* Icon with gradient background */}
                      <motion.div 
                        className={`w-16 h-16 rounded-full bg-gradient-to-r ${benefit.color} flex items-center justify-center mb-4`}
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ type: "spring", damping: 10 }}
                      >
                        <span className="text-3xl">{benefit.icon}</span>
                      </motion.div>
                      
                      <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                      <p className="text-gray-400">{benefit.description}</p>
                      
                      {/* Hover effect */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        style={{
                          background: `radial-gradient(circle at 50% 50%, ${benefit.color.split(' ')[1].split('-')[1]}-500/20 0%, transparent 70%)`
                        }}
                      />
                    </div>
                    
                    {/* Floating particles */}
                    <AnimatePresence>
                      {i === 0 && time > phases.benefits.start + 2 && (
                        <motion.div
                          className="absolute -top-2 -right-2"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Sparkles className="w-6 h-6 text-yellow-400" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
              
              {/* Error handling highlight */}
              {activeHighlight === 'error-handling' && (
                <motion.div
                  className="mt-8 bg-gray-900/60 backdrop-blur-lg rounded-2xl p-6 border border-purple-500"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-2xl font-bold mb-4 text-purple-400">
                    Smart Error Handling
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <Code2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
                      <p className="font-medium">acknowledge()</p>
                      <p className="text-sm text-gray-400">Success</p>
                    </div>
                    <div>
                      <Code2 className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                      <p className="font-medium">release()</p>
                      <p className="text-sm text-gray-400">Retry</p>
                    </div>
                    <div>
                      <Code2 className="w-8 h-8 mx-auto mb-2 text-red-400" />
                      <p className="font-medium">reject()</p>
                      <p className="text-sm text-gray-400">Failed</p>
                    </div>
                  </div>
                </motion.div>
              )}
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
              <h2 className="text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Write Better Code
              </h2>
              <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
                Share Groups: Simpler API, Infinite Possibilities
              </p>
              
              {/* Final code snippet */}
              <motion.div
                className="inline-block bg-gray-900 rounded-lg px-6 py-3 font-mono"
                animate={{ 
                  boxShadow: [
                    "0 0 20px rgba(99, 102, 241, 0.5)",
                    "0 0 40px rgba(139, 92, 246, 0.5)",
                    "0 0 20px rgba(99, 102, 241, 0.5)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-purple-400">groupId:</span>{' '}
                <span className="text-green-400">'share:next-gen'</span>
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

export default CodeExampleScene;