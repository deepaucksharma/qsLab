import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, BarChart3, TrendingUp, Zap, Database } from 'lucide-react';
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

const MetricsVisualizerScene = ({ time, duration }) => {
  // Scene phases
  const phases = {
    intro: { start: 0, duration: 3 },
    dashboard: { start: 3, duration: 5 },
    alerts: { start: 8, duration: 4 },
    insights: { start: 12, duration: 4 },
    conclusion: { start: 16, duration: 4 }
  };
  
  const progress = (time / duration) * 100;
  const [metrics, setMetrics] = useState({
    recordsUnacked: 0,
    oldestMessageAge: 0,
    shareGroupCount: 0,
    messagesPerSec: 0
  });
  const [alertActive, setAlertActive] = useState(false);
  const [dataFlowActive, setDataFlowActive] = useState(false);

  // Update states based on time
  useEffect(() => {
    if (time >= phases.dashboard.start) {
      const baseProgress = Math.min((time - phases.dashboard.start) / 10, 1);
      setMetrics({
        recordsUnacked: Math.floor(250 * baseProgress + Math.sin(time) * 20),
        oldestMessageAge: Math.floor(3000 * baseProgress + Math.cos(time * 0.5) * 500),
        shareGroupCount: Math.floor(12 * baseProgress),
        messagesPerSec: Math.floor(50000 * baseProgress + Math.sin(time * 2) * 5000)
      });
      setDataFlowActive(true);
    }
    
    if (time >= phases.alerts.start && metrics.recordsUnacked > 200) {
      setAlertActive(true);
    }
  }, [time, metrics.recordsUnacked, phases]);
  
  // Camera movements
  const cameraMovements = [
    { start: 0, end: 3, fromX: 0, toX: 0, fromY: -30, toY: 0, fromScale: 0.9, toScale: 1 },
    { start: 8, end: 10, fromX: 0, toX: 0, fromY: 0, toY: 0, fromScale: 1, toScale: 1.1 },
    { start: 12, end: 14, fromX: 0, toX: 0, fromY: 0, toY: 0, fromScale: 1.1, toScale: 1 }
  ];
  
  const cameraTransform = getCameraTransform(time, cameraMovements);

  const metricCards = [
    {
      name: 'RecordsUnacked',
      value: metrics.recordsUnacked,
      unit: 'records',
      icon: Database,
      color: 'from-orange-500 to-red-500',
      description: 'Unprocessed messages across all Share Groups',
      threshold: 100,
      critical: metrics.recordsUnacked > 200
    },
    {
      name: 'OldestUnackedMessageAgeMs',
      value: metrics.oldestMessageAge,
      unit: 'ms',
      icon: Activity,
      color: 'from-blue-500 to-purple-500',
      description: 'Age of the oldest unprocessed message',
      threshold: 5000,
      critical: metrics.oldestMessageAge > 2500
    },
    {
      name: 'ShareGroupCount',
      value: metrics.shareGroupCount,
      unit: 'groups',
      icon: BarChart3,
      color: 'from-green-500 to-teal-500',
      description: 'Active Share Groups in the cluster',
      threshold: 20,
      critical: false
    },
    {
      name: 'MessagesInPerSec',
      value: metrics.messagesPerSec.toLocaleString(),
      unit: 'msg/s',
      icon: Zap,
      color: 'from-purple-500 to-pink-500',
      description: 'Incoming message rate',
      threshold: 100000,
      critical: false
    }
  ];

  // Metric Card Component
  const MetricCard = ({ metric, index, isActive }) => {
    const Icon = metric.icon;
    
    return (
      <motion.div
        className={`relative bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border transition-all duration-300 ${
          metric.critical ? 'border-red-500/50 animate-pulse-border' : 'border-gray-700/50'
        }`}
        initial={{ y: 50, opacity: 0, scale: 0.9 }}
        animate={{ 
          y: isActive ? 0 : 50,
          opacity: isActive ? 1 : 0,
          scale: isActive ? 1 : 0.9
        }}
        transition={{ 
          delay: index * 0.2,
          type: "spring",
          damping: 20
        }}
        whileHover={{ 
          scale: 1.05,
          borderColor: metric.critical ? 'rgb(239 68 68 / 0.8)' : 'rgb(139 92 246 / 0.5)'
        }}
      >
        {/* Glow effect */}
        {metric.critical && (
          <motion.div
            className="absolute inset-0 rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: `radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.3) 0%, transparent 70%)`,
              filter: 'blur(20px)'
            }}
          />
        )}
        
        <div className="relative z-10">
          {/* Metric Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <motion.div 
                className={`w-14 h-14 rounded-xl bg-gradient-to-r ${metric.color} flex items-center justify-center mb-3`}
                animate={metric.critical ? { rotate: [0, -5, 5, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Icon className="w-7 h-7 text-white" />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-300">{metric.name}</h3>
              <p className="text-sm text-gray-500">{metric.description}</p>
            </div>
            {metric.critical && (
              <motion.span 
                className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full font-bold"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                CRITICAL
              </motion.span>
            )}
          </div>
          
          {/* Metric Value */}
          <motion.div 
            className={`text-4xl font-black mb-4 bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}
            animate={isActive ? { opacity: [0.7, 1, 0.7] } : {}}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {metric.value}
            <span className="text-xl ml-2 text-gray-400">{metric.unit}</span>
          </motion.div>
          
          {/* Progress Bar */}
          <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full bg-gradient-to-r ${metric.color} rounded-full`}
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min((metric.value / metric.threshold) * 100, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            {/* Threshold marker */}
            <div className="absolute top-0 right-0 w-px h-full bg-gray-600" />
          </div>
          
          {/* Live indicator */}
          <div className="mt-4 flex items-center">
            <motion.div 
              className="w-2 h-2 bg-green-500 rounded-full mr-2"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs text-gray-500">Live</span>
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
          background: alertActive ?
            'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.3) 0%, transparent 50%)' :
            'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)'
        }}
        transition={{ duration: 2 }}
      />
      
      {/* Data Flow Visualization */}
      <AnimatePresence>
        {dataFlowActive && (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 bg-gradient-to-b from-blue-500/20 to-transparent"
                initial={{ y: -100, opacity: 0 }}
                animate={{ 
                  y: window.innerHeight + 100,
                  opacity: [0, 0.3, 0.3, 0]
                }}
                transition={{
                  duration: 5 + Math.random() * 5,
                  delay: Math.random() * 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  height: `${50 + Math.random() * 50}%`
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
      
      {/* Particles */}
      <ParticleBackground 
        particleCount={50} 
        colors={alertActive ? ['#ef4444', '#f97316', '#fbbf24'] : ['#3b82f6', '#8b5cf6', '#06b6d4']} 
      />
      
      {/* Content with camera transform */}
      <div 
        className="relative z-10 h-full flex items-center justify-center p-8"
        style={{ transform: cameraTransform }}
      >
        <div className="w-full max-w-7xl">
          
          {/* Phase 1: Introduction */}
          <SceneTransition isActive={time >= phases.intro.start && time < phases.dashboard.start}>
            <CinematicTitle
              title="Real-Time Metrics Dashboard"
              subtitle="Share Groups Performance at a Glance"
              time={time}
              startTime={phases.intro.start}
            />
          </SceneTransition>
          
          {/* Phase 2: Dashboard */}
          <SceneTransition isActive={time >= phases.dashboard.start && time < phases.alerts.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center mb-12"
                style={getTextRevealStyle(time, phases.dashboard.start, 1)}
              >
                Live Performance Metrics
              </motion.h2>
              
              <div className="grid grid-cols-2 gap-6">
                {metricCards.map((metric, idx) => (
                  <MetricCard
                    key={metric.name}
                    metric={metric}
                    index={idx}
                    isActive={time >= phases.dashboard.start + idx * 0.5}
                  />
                ))}
              </div>
            </div>
          </SceneTransition>
          
          {/* Phase 3: Alerts */}
          <SceneTransition isActive={time >= phases.alerts.start && time < phases.insights.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center mb-8 text-red-400"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 10 }}
              >
                Critical Performance Alert
              </motion.h2>
              
              {metrics.recordsUnacked > 200 && (
                <motion.div 
                  className="max-w-4xl mx-auto p-8 bg-red-900/20 border border-red-500/50 rounded-2xl backdrop-blur-lg"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start gap-6">
                    <motion.div
                      animate={{ 
                        rotate: [0, -10, 10, -10, 0]
                      }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <AlertTriangle className="w-16 h-16 text-red-400 flex-shrink-0" />
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-bold text-red-400 mb-3">Performance Degradation Detected</h3>
                      <p className="text-lg text-gray-300 mb-4">
                        High unacked records indicate consumer processing is lagging behind production rate.
                      </p>
                      
                      {/* Alert details */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-black/30 rounded-lg p-4">
                          <div className="text-red-400 font-bold mb-1">Unacked Records</div>
                          <div className="text-2xl font-mono">{metrics.recordsUnacked}</div>
                        </div>
                        <div className="bg-black/30 rounded-lg p-4">
                          <div className="text-orange-400 font-bold mb-1">Message Age</div>
                          <div className="text-2xl font-mono">{metrics.oldestMessageAge}ms</div>
                        </div>
                      </div>
                      
                      <motion.div
                        className="flex items-center gap-2 text-yellow-400"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Activity className="w-5 h-5" />
                        <span className="font-semibold">Immediate action required</span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Additional metrics grid */}
              <div className="grid grid-cols-2 gap-6">
                {metricCards.map((metric, idx) => (
                  <MetricCard
                    key={metric.name}
                    metric={metric}
                    index={idx}
                    isActive={true}
                  />
                ))}
              </div>
            </div>
          </SceneTransition>
          
          {/* Phase 4: Insights */}
          <SceneTransition isActive={time >= phases.insights.start && time < phases.conclusion.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center mb-12"
                style={getTextRevealStyle(time, phases.insights.start, 1)}
              >
                Actionable Insights
              </motion.h2>
              
              <div className="grid grid-cols-3 gap-6">
                {[
                  { 
                    icon: TrendingUp, 
                    title: 'Scale Consumers',
                    text: 'Add more consumer instances to reduce unacked records',
                    color: 'from-green-500 to-emerald-500'
                  },
                  { 
                    icon: Zap, 
                    title: 'Optimize Processing',
                    text: 'Improve processing logic for better throughput',
                    color: 'from-yellow-500 to-orange-500'
                  },
                  { 
                    icon: BarChart3, 
                    title: 'Monitor Trends',
                    text: 'Track metrics over time to prevent bottlenecks',
                    color: 'from-purple-500 to-pink-500'
                  }
                ].map((insight, idx) => {
                  const Icon = insight.icon;
                  
                  return (
                    <motion.div
                      key={insight.title}
                      className="bg-gray-900/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50"
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ 
                        delay: getStaggeredDelay(idx, 0.2),
                        type: "spring",
                        damping: 20
                      }}
                      whileHover={{ 
                        scale: 1.05,
                        borderColor: 'rgb(139 92 246 / 0.5)'
                      }}
                    >
                      <motion.div
                        className={`w-16 h-16 rounded-xl bg-gradient-to-r ${insight.color} flex items-center justify-center mb-4`}
                        whileHover={{ rotate: 360 }}
                        transition={{ type: "spring", damping: 10 }}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </motion.div>
                      
                      <h3 className="text-xl font-bold mb-2">{insight.title}</h3>
                      <p className="text-gray-400">{insight.text}</p>
                    </motion.div>
                  );
                })}
              </div>
              
              {/* Real-time monitoring emphasis */}
              <motion.div
                className="mt-8 p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl border border-purple-500/20 text-center"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <p className="text-xl text-purple-300">
                  <Activity className="inline w-6 h-6 mr-2" />
                  Real-time monitoring enables proactive performance management
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
              <h2 className="text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Metrics That Matter
              </h2>
              <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
                Real-time visibility into Share Groups performance drives operational excellence
              </p>
              
              <motion.div
                className="inline-block"
                animate={{ 
                  y: [0, -10, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg px-8 py-4">
                  <span className="text-xl font-bold text-white flex items-center gap-3">
                    <Activity className="w-6 h-6" />
                    Monitor • Alert • Optimize
                  </span>
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
          style={{ 
            width: `${progress}%`,
            background: alertActive ? 'linear-gradient(to right, #ef4444, #f97316)' : undefined
          }}
        />
      </div>
      
      <style>{`
        @keyframes pulse-border {
          0%, 100% {
            border-color: rgba(239, 68, 68, 0.5);
          }
          50% {
            border-color: rgba(239, 68, 68, 0.8);
          }
        }
      `}</style>
    </div>
  );
};

export default MetricsVisualizerScene;