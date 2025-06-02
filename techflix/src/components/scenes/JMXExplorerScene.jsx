import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Database, Activity, Terminal, Layers, Cpu } from 'lucide-react';
import {
  CinematicTitle,
  SceneTransition,
  ParticleBackground,
  CodeDemo
} from '../StorytellingComponents';
import {
  getTextRevealStyle,
  getTimeBasedValue,
  getCameraTransform
} from '../../utils/animationHelpers';
import { getStaggeredDelay } from '../../utils/storytellingHelpers';

const JMXExplorerScene = ({ time, duration }) => {
  // Scene phases
  const phases = {
    intro: { start: 0, duration: 3 },
    connection: { start: 3, duration: 4 },
    exploration: { start: 7, duration: 5 },
    mbeans: { start: 12, duration: 5 },
    conclusion: { start: 17, duration: 3 }
  };
  
  const [activeConnection, setActiveConnection] = useState(false);
  const [exploredMBeans, setExploredMBeans] = useState([]);
  const progress = (time / duration) * 100;
  
  // MBean categories data
  const mbeanCategories = [
    {
      name: 'kafka.server:type=BrokerTopicMetrics',
      icon: Database,
      metrics: ['MessagesInPerSec', 'BytesInPerSec', 'BytesOutPerSec'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'kafka.server:type=sharegroup',
      icon: Layers,
      metrics: ['RecordsUnacked', 'PartitionsPending', 'ConsumerGroups'],
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'kafka.server:type=KafkaRequestHandlerPool',
      icon: Cpu,
      metrics: ['RequestHandlerAvgIdlePercent', 'ActiveHandlers'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'kafka.network:type=RequestMetrics',
      icon: Activity,
      metrics: ['RequestsPerSec', 'TotalTimeMs', 'LocalTimeMs'],
      color: 'from-orange-500 to-red-500'
    }
  ];
  
  // Update connection state
  useEffect(() => {
    if (time >= phases.connection.start + 2) {
      setActiveConnection(true);
    }
  }, [time, phases.connection.start]);
  
  // Explore MBeans progressively
  useEffect(() => {
    if (time >= phases.mbeans.start) {
      const explored = Math.min(
        mbeanCategories.length,
        Math.floor((time - phases.mbeans.start) / 1.2)
      );
      setExploredMBeans(mbeanCategories.slice(0, explored));
    }
  }, [time, phases.mbeans.start]);
  
  // Camera movements
  const cameraMovements = [
    { start: 0, end: 3, fromX: 0, toX: 0, fromY: -30, toY: 0, fromScale: 0.9, toScale: 1 },
    { start: 7, end: 9, fromX: 0, toX: 0, fromY: 0, toY: 0, fromScale: 1, toScale: 1.1 },
    { start: 12, end: 14, fromX: 0, toX: 0, fromY: 0, toY: 0, fromScale: 1.1, toScale: 1 }
  ];
  
  const cameraTransform = getCameraTransform(time, cameraMovements);
  
  // JMX connection command
  const jmxCommand = `# Connect to Kafka JMX
$ jconsole localhost:9999

# Or use JMX over RMI
$ java -jar jmxterm.jar
> open localhost:9999
> domains
> beans`;
  
  // Circuit board pattern component
  const CircuitPattern = () => (
    <svg className="absolute inset-0 w-full h-full opacity-10">
      <defs>
        <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M10 10h80v80h-80z" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          <circle cx="10" cy="10" r="2" fill="currentColor"/>
          <circle cx="90" cy="10" r="2" fill="currentColor"/>
          <circle cx="10" cy="90" r="2" fill="currentColor"/>
          <circle cx="90" cy="90" r="2" fill="currentColor"/>
          <path d="M10 50h30 M60 50h30 M50 10v30 M50 60v30" stroke="currentColor" strokeWidth="0.5"/>
          <circle cx="50" cy="50" r="3" fill="currentColor"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#circuit)"/>
      
      {/* Animated data flow lines */}
      <motion.line
        x1="0" y1="50%" x2="100%" y2="50%"
        stroke="rgba(99, 102, 241, 0.3)"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </svg>
  );
  
  // MBean Explorer Visualization
  const MBeanExplorer = ({ category, isActive }) => {
    const Icon = category.icon;
    
    return (
      <motion.div
        className={`relative bg-gray-900/60 backdrop-blur-lg rounded-2xl p-6 border-2 transition-all duration-300 ${
          isActive ? 'border-purple-500 shadow-2xl' : 'border-gray-700/50'
        }`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ 
          scale: isActive ? 1.05 : 1,
          opacity: 1
        }}
        whileHover={{ scale: 1.1, borderColor: 'rgb(139 92 246)' }}
        transition={{ type: "spring", damping: 10 }}
      >
        {/* Glow effect when active */}
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
          <div className="flex items-center justify-between mb-4">
            <motion.div 
              className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center`}
              animate={isActive ? { rotate: 360 } : {}}
              transition={{ duration: 2, repeat: isActive ? Infinity : 0, ease: "linear" }}
            >
              <Icon className="w-6 h-6 text-white" />
            </motion.div>
            
            {isActive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-3 py-1 bg-green-500 rounded-full text-xs font-bold text-white"
              >
                LIVE
              </motion.div>
            )}
          </div>
          
          {/* MBean name */}
          <h4 className="font-mono text-sm text-purple-300 mb-3 break-all">
            {category.name}
          </h4>
          
          {/* Metrics */}
          <div className="space-y-2">
            {category.metrics.map((metric, i) => (
              <motion.div
                key={metric}
                className="flex items-center justify-between text-sm"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: isActive ? 1 : 0.5 }}
                transition={{ delay: i * 0.1 }}
              >
                <span className="text-gray-400">{metric}</span>
                {isActive && (
                  <motion.span
                    className="font-mono text-green-400"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {Math.floor(Math.random() * 1000)}
                  </motion.span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
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
            'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 12, repeat: Infinity, repeatType: "reverse" }}
      />
      
      {/* Circuit pattern */}
      <CircuitPattern />
      
      {/* Particles */}
      <ParticleBackground 
        particleCount={50} 
        colors={['#4338ca', '#8b5cf6', '#3b82f6', '#06b6d4']} 
      />
      
      {/* Content with camera transform */}
      <div 
        className="relative z-10 h-full flex items-center justify-center p-8"
        style={{ transform: cameraTransform }}
      >
        <div className="w-full max-w-7xl">
          
          {/* Phase 1: Introduction */}
          <SceneTransition isActive={time >= phases.intro.start && time < phases.connection.start}>
            <CinematicTitle
              title="JMX: Your Window into Kafka"
              subtitle="Java Management Extensions for Deep Observability"
              time={time}
              startTime={phases.intro.start}
            />
          </SceneTransition>
          
          {/* Phase 2: Connection */}
          <SceneTransition isActive={time >= phases.connection.start && time < phases.exploration.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center mb-8"
                style={getTextRevealStyle(time, phases.connection.start, 1)}
              >
                Connecting to Kafka&apos;s JMX Interface
              </motion.h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Command display */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <CodeDemo
                    code={jmxCommand}
                    language="bash"
                    time={time}
                    startTime={phases.connection.start}
                  />
                </motion.div>
                
                {/* Connection status */}
                <motion.div
                  className="flex items-center justify-center"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <div className="relative">
                    <motion.div
                      className={`w-48 h-48 rounded-full border-4 flex items-center justify-center ${
                        activeConnection ? 'border-green-500' : 'border-gray-600'
                      }`}
                      animate={activeConnection ? {
                        boxShadow: [
                          '0 0 20px rgba(16, 185, 129, 0.5)',
                          '0 0 40px rgba(16, 185, 129, 0.8)',
                          '0 0 20px rgba(16, 185, 129, 0.5)'
                        ]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Terminal className={`w-20 h-20 ${
                        activeConnection ? 'text-green-500' : 'text-gray-600'
                      }`} />
                    </motion.div>
                    
                    {/* Connection status text */}
                    <motion.div
                      className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2 }}
                    >
                      <span className={`font-bold ${
                        activeConnection ? 'text-green-400' : 'text-gray-400'
                      }`}>
                        {activeConnection ? 'Connected to localhost:9999' : 'Connecting...'}
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </SceneTransition>
          
          {/* Phase 3: Exploration Benefits */}
          <SceneTransition isActive={time >= phases.exploration.start && time < phases.mbeans.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center mb-12"
                style={getTextRevealStyle(time, phases.exploration.start, 1)}
              >
                Why JMX Matters
              </motion.h2>
              
              <div className="grid grid-cols-3 gap-6">
                {[
                  { 
                    icon: Search, 
                    title: 'Deep Discovery',
                    description: 'Explore all available MBeans and their attributes',
                    color: 'from-blue-500 to-cyan-500'
                  },
                  { 
                    icon: Activity, 
                    title: 'Real-time Monitoring',
                    description: 'Watch metrics update live as your system operates',
                    color: 'from-purple-500 to-pink-500'
                  },
                  { 
                    icon: Database, 
                    title: 'Debug & Optimize',
                    description: 'Identify bottlenecks and performance issues',
                    color: 'from-green-500 to-emerald-500'
                  }
                ].map((benefit, i) => {
                  const Icon = benefit.icon;
                  
                  return (
                    <motion.div
                      key={benefit.title}
                      className="bg-gray-900/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50"
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ 
                        delay: getStaggeredDelay(i, 0.2),
                        type: "spring",
                        damping: 20
                      }}
                      whileHover={{ 
                        scale: 1.05,
                        borderColor: 'rgb(139 92 246 / 0.5)'
                      }}
                    >
                      <motion.div
                        className={`w-16 h-16 rounded-xl bg-gradient-to-r ${benefit.color} flex items-center justify-center mb-4`}
                        whileHover={{ rotate: 360 }}
                        transition={{ type: "spring", damping: 10 }}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </motion.div>
                      
                      <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                      <p className="text-gray-400">{benefit.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </SceneTransition>
          
          {/* Phase 4: MBean Categories */}
          <SceneTransition isActive={time >= phases.mbeans.start && time < phases.conclusion.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 10 }}
              >
                Exploring the MBean Tree
              </motion.h2>
              
              <div className="grid grid-cols-2 gap-6">
                {mbeanCategories.map((category, i) => (
                  <MBeanExplorer
                    key={category.name}
                    category={category}
                    isActive={exploredMBeans.includes(category)}
                  />
                ))}
              </div>
              
              {/* Connection info */}
              <motion.div
                className="mt-8 p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-2xl border border-purple-500/20 text-center"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <p className="text-lg text-purple-300">
                  <span className="font-mono bg-black/30 px-3 py-1 rounded">Port 9999</span> is the default JMX port for Kafka brokers
                </p>
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
              <h2 className="text-6xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Ready to Explore?
              </h2>
              <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
                JMX opens up a world of insights into your Kafka cluster
              </p>
              
              <motion.div
                className="inline-flex items-center gap-3"
                animate={{ 
                  y: [0, -10, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Search className="w-8 h-8 text-purple-400" />
                <span className="text-3xl font-bold text-purple-400">Let&apos;s dive into the MBean tree!</span>
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

export default JMXExplorerScene;