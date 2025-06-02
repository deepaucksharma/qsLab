import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, AlertCircle, Activity, TrendingDown, Zap } from 'lucide-react';
import '../../styles/techflix-cinematic-v2.css';

const ProblemVisualizationScene = ({ time, duration }) => {
  // Scene phases
  const phases = {
    intro: { start: 0, duration: 3 },
    scaling: { start: 3, duration: 5 },
    blocking: { start: 8, duration: 5 },
    solution: { start: 13, duration: 4 },
    conclusion: { start: 17, duration: 3 }
  };
  
  const [activeSection, setActiveSection] = useState('intro');
  const [animatedValues, setAnimatedValues] = useState({
    consumers: 0,
    latency: 0,
    efficiency: 0
  });
  
  const progress = (time / duration) * 100;
  
  // Determine current phase based on time
  const currentPhase = Object.entries(phases).find(([_, phase]) => 
    time >= phase.start && time < phase.start + phase.duration
  )?.[0] || 'conclusion';
  
  // Update active section based on time
  useEffect(() => {
    if (time >= phases.solution.start) setActiveSection('solution');
    else if (time >= phases.blocking.start) setActiveSection('blocking');
    else if (time >= phases.scaling.start) setActiveSection('scaling');
    else setActiveSection('intro');
  }, [time, phases]);
  
  // Animate metric values
  useEffect(() => {
    if (time >= phases.scaling.start) {
      const scalingProgress = Math.min(1, (time - phases.scaling.start) / 3);
      setAnimatedValues(prev => ({
        ...prev,
        consumers: Math.min(10, Math.floor(scalingProgress * 10))
      }));
    }
    if (time >= phases.blocking.start) {
      const blockingProgress = Math.min(1, (time - phases.blocking.start) / 3);
      setAnimatedValues(prev => ({
        ...prev,
        latency: Math.floor(blockingProgress * 850)
      }));
    }
    if (time >= phases.solution.start) {
      const solutionProgress = Math.min(1, (time - phases.solution.start) / 2);
      setAnimatedValues(prev => ({
        ...prev,
        efficiency: Math.floor(solutionProgress * 95)
      }));
    }
  }, [time, phases]);
  
  // Problem cards data
  const problems = [
    {
      id: 'scaling',
      title: 'The Scaling Ceiling',
      description: 'Traditional consumer groups hit a wall',
      icon: Lock,
      color: 'red',
      metrics: [
        { label: 'Max Consumers', value: animatedValues.consumers, suffix: '/10' },
        { label: 'Waste', value: 60, suffix: '%' }
      ],
      visual: 'partitions'
    },
    {
      id: 'blocking',
      title: 'Head-of-Line Blocking',
      description: 'One slow message blocks entire partition',
      icon: AlertCircle,
      color: 'orange',
      metrics: [
        { label: 'Latency Spike', value: animatedValues.latency, suffix: 'ms' },
        { label: 'Impact', value: 'Critical', isText: true }
      ],
      visual: 'blocking'
    },
    {
      id: 'solution',
      title: 'Share Groups Solution',
      description: 'Breaking through the barriers',
      icon: Unlock,
      color: 'green',
      metrics: [
        { label: 'Max Consumers', value: '∞', isText: true },
        { label: 'Efficiency', value: animatedValues.efficiency, suffix: '%' }
      ],
      visual: 'sharegroups'
    }
  ];
  
  
  // Visual components
  const PartitionVisual = ({ isActive }) => (
    <div className="grid grid-cols-5 gap-2">
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold ${
            i < animatedValues.consumers 
              ? 'bg-red-900/40 border-red-500 text-red-400' 
              : 'bg-gray-800 border-gray-600 text-gray-500'
          }`}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ 
            scale: isActive ? 1 : 0.8,
            rotate: isActive ? 0 : -180,
            borderColor: i >= animatedValues.consumers && isActive ? '#ef4444' : undefined
          }}
          transition={{ 
            delay: i * 0.1,
            type: "spring",
            damping: 10
          }}
        >
          P{i}
        </motion.div>
      ))}
      {isActive && animatedValues.consumers >= 10 && (
        <motion.div
          className="col-span-5 text-center mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <span className="text-red-400 text-lg font-bold">⚠️ LIMIT REACHED!</span>
        </motion.div>
      )}
    </div>
  );
  
  const BlockingVisual = ({ isActive }) => {
    const messages = ['Fast', 'Fast', 'SLOW', 'Blocked', 'Blocked'];
    
    return (
      <div className="space-y-3">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            className={`relative flex items-center gap-3 ${
              msg === 'SLOW' ? 'text-orange-400' : 
              msg === 'Blocked' ? 'text-red-400' : 'text-green-400'
            }`}
            initial={{ x: -50, opacity: 0 }}
            animate={{ 
              x: isActive ? 0 : -50,
              opacity: isActive ? 1 : 0
            }}
            transition={{ 
              delay: i * 0.2,
              duration: 0.5
            }}
          >
            <motion.div
              className={`w-20 h-8 rounded flex items-center justify-center text-xs font-bold ${
                msg === 'SLOW' ? 'bg-orange-900/40 border border-orange-500' :
                msg === 'Blocked' ? 'bg-red-900/40 border border-red-500' :
                'bg-green-900/40 border border-green-500'
              }`}
              animate={msg === 'SLOW' && isActive ? {
                scale: [1, 1.1, 1],
                borderColor: ['#f97316', '#ef4444', '#f97316']
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {msg}
            </motion.div>
            
            {/* Progress indicator */}
            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${
                  msg === 'SLOW' ? 'bg-orange-500' :
                  msg === 'Blocked' ? 'bg-red-500' :
                  'bg-green-500'
                }`}
                initial={{ width: '0%' }}
                animate={{ 
                  width: msg === 'Blocked' ? '0%' : 
                         msg === 'SLOW' ? '20%' : '100%'
                }}
                transition={{ 
                  duration: msg === 'SLOW' ? 3 : 1,
                  delay: i * 0.3
                }}
              />
            </div>
            
            {msg === 'SLOW' && isActive && (
              <motion.div
                className="absolute -right-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <Activity className="w-5 h-5 text-orange-400 animate-pulse" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    );
  };
  
  const ShareGroupsVisual = ({ isActive }) => (
    <motion.div
      className="relative w-64 h-64 mx-auto"
      initial={{ scale: 0 }}
      animate={{ scale: isActive ? 1 : 0 }}
      transition={{ type: "spring", damping: 10 }}
    >
      {/* Central hub */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <Zap className="w-12 h-12 text-white" />
      </motion.div>
      
      {/* Orbiting consumers */}
      {isActive && [...Array(12)].map((_, i) => {
        const angle = (i / 12) * 360;
        const radius = 80;
        const x = Math.cos(angle * Math.PI / 180) * radius;
        const y = Math.sin(angle * Math.PI / 180) * radius;
        
        return (
          <motion.div
            key={i}
            className="absolute w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.2, 1],
              opacity: 1
            }}
            transition={{ 
              delay: i * 0.1,
              type: "spring",
              damping: 10
            }}
          >
            C{i}
          </motion.div>
        );
      })}
      
      {/* Efficiency ring */}
      <motion.svg
        className="absolute inset-0 w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ delay: 1 }}
      >
        <motion.circle
          cx="128"
          cy="128"
          r="100"
          fill="none"
          stroke="url(#efficiency-gradient)"
          strokeWidth="2"
          strokeDasharray="628"
          strokeDashoffset={628 - (628 * animatedValues.efficiency) / 100}
          transition={{ duration: 2 }}
        />
        <defs>
          <linearGradient id="efficiency-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
      </motion.svg>
    </motion.div>
  );
  
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
                className="text-center space-y-4"
              >
                <h1 className="scene-title">The Problems We Face</h1>
                <p className="scene-subtitle">Why Kafka Needs Evolution</p>
              </motion.div>
            )}
          
            {/* Phase 2-4: Problem Cards */}
            {(currentPhase === 'scaling' || currentPhase === 'blocking' || currentPhase === 'solution') && (
              <motion.div
                key="problems"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-7xl space-y-8"
              >
                <h2 className="text-4xl font-bold text-center mb-12">
                  Traditional Consumer Groups Hit Their Limits
                </h2>
              
              <div className="grid lg:grid-cols-3 gap-8">
                {problems.map((problem, idx) => {
                  const isActive = activeSection === problem.id || 
                                 (activeSection === 'solution' && problem.id === 'solution');
                  const Icon = problem.icon;
                  
                  return (
                    <motion.div
                      key={problem.id}
                      className="metric-card-v2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: time >= phases[problem.id]?.start || 0 ? 1 : 0.3,
                        y: 0
                      }}
                      transition={{ delay: idx * 0.1, duration: 0.5 }}
                    >
                      <div className="relative">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                          <motion.div 
                            className={`p-3 rounded-xl ${
                              problem.color === 'red' ? 'bg-red-600/20' :
                              problem.color === 'orange' ? 'bg-orange-600/20' :
                              'bg-green-600/20'
                            }`}
                          >
                            <Icon size={32} className={
                              problem.color === 'red' ? 'text-red-500' :
                              problem.color === 'orange' ? 'text-orange-500' :
                              'text-green-500'
                            } />
                          </motion.div>
                          
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                problem.color === 'red' ? 'bg-red-500 text-white' :
                                problem.color === 'orange' ? 'bg-orange-500 text-white' :
                                'bg-green-500 text-white'
                              }`}
                            >
                              ACTIVE
                            </motion.div>
                          )}
                        </div>
                        
                        {/* Content */}
                        <h3 className="text-2xl font-bold mb-2">{problem.title}</h3>
                        <p className="text-gray-400 mb-6">{problem.description}</p>
                        
                        {/* Visual */}
                        <div className="mb-6 h-32 flex items-center justify-center">
                          {problem.visual === 'partitions' && <PartitionVisual isActive={isActive} />}
                          {problem.visual === 'blocking' && <BlockingVisual isActive={isActive} />}
                          {problem.visual === 'sharegroups' && <ShareGroupsVisual isActive={isActive} />}
                        </div>
                        
                        {/* Metrics */}
                        <div className="flex gap-4 pt-4 border-t border-gray-700">
                          {problem.metrics.map((metric, i) => (
                            <motion.div 
                              key={metric.label}
                              className="flex-1 text-center"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: isActive ? 1 : 0.5, y: 0 }}
                              transition={{ delay: i * 0.2 }}
                            >
                              <div className={`text-2xl font-bold ${
                                problem.color === 'red' ? 'text-red-400' :
                                problem.color === 'orange' ? 'text-orange-400' :
                                'text-green-400'
                              }`}>
                                {metric.isText ? metric.value : (
                                  <span>
                                    <motion.span
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ duration: 0.5 }}
                                    >
                                      {metric.value}
                                    </motion.span>
                                    {metric.suffix}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">{metric.label}</div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              </motion.div>
            )}
          
            {/* Phase 5: Conclusion */}
            {currentPhase === 'conclusion' && (
              <motion.div
                key="conclusion"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-6"
              >
              <h2 className="text-5xl font-black bg-gradient-to-r from-red-400 via-orange-400 to-green-400 bg-clip-text text-transparent">
                It&apos;s Time for a Revolution
              </h2>
              <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
                Share Groups: The answer to every limitation
              </p>
              
              {/* Transformation arrow */}
              <motion.div
                className="flex items-center justify-center gap-4 mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <TrendingDown className="w-8 h-8 text-red-400" />
                <motion.div
                  className="w-20 h-1 bg-gradient-to-r from-red-400 to-green-400"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 0.8 }}
                />
                <Zap className="w-8 h-8 text-green-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProblemVisualizationScene;