import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, TrendingDown, AlertCircle, Activity } from 'lucide-react';
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

const ZeroLagFallacyScene = ({ time, duration }) => {
  // Scene phases
  const phases = {
    intro: { start: 0, duration: 3 },
    traditional: { start: 3, duration: 4 },
    sharegroups: { start: 7, duration: 4 },
    reveal: { start: 11, duration: 5 },
    conclusion: { start: 16, duration: 4 }
  };
  
  const [metricValues, setMetricValues] = useState({
    lag: 0,
    unacked: 0,
    processing: 0
  });
  
  const [showDanger, setShowDanger] = useState(false);
  const progress = (time / duration) * 100;
  
  // Update metrics based on time
  useEffect(() => {
    if (time >= phases.traditional.start) {
      setMetricValues(prev => ({
        ...prev,
        lag: Math.floor(getTimeBasedValue(time, phases.traditional.start, 2, 1000, 0, 'easeOutExpo'))
      }));
    }
    
    if (time >= phases.sharegroups.start) {
      setMetricValues(prev => ({
        ...prev,
        unacked: Math.floor(getTimeBasedValue(time, phases.sharegroups.start, 3, 0, 500)),
        processing: Math.floor(getTimeBasedValue(time, phases.sharegroups.start, 3, 100, 20))
      }));
    }
    
    if (time >= phases.reveal.start) {
      setShowDanger(true);
    }
  }, [time, phases]);
  
  // Camera movements
  const cameraMovements = [
    { start: 0, end: 3, fromX: 0, toX: 0, fromY: -20, toY: 0, fromScale: 0.9, toScale: 1 },
    { start: 11, end: 13, fromX: 0, toX: 0, fromY: 0, toY: 0, fromScale: 1, toScale: 1.1 },
    { start: 16, end: 18, fromX: 0, toX: 0, fromY: 0, toY: -10, fromScale: 1.1, toScale: 1 }
  ];
  
  const cameraTransform = getCameraTransform(time, cameraMovements);
  
  // Comparison visualization
  const ComparisonVisualization = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Traditional Metrics */}
      <motion.div
        className={`relative overflow-hidden ${showDanger ? 'opacity-50' : ''}`}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="bg-gray-900/60 backdrop-blur-lg rounded-3xl p-8 border border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-300">Traditional View</h3>
            <motion.div
              animate={metricValues.lag === 0 ? {
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <TrendingUp className="w-8 h-8 text-green-400" />
            </motion.div>
          </div>
          
          {/* Lag Metric */}
          <div className="text-center mb-8">
            <div className="text-lg text-gray-400 mb-2">Consumer Lag</div>
            <motion.div 
              className="text-7xl font-black"
              animate={{ 
                color: metricValues.lag === 0 ? '#10b981' : '#f59e0b'
              }}
              transition={{ duration: 1 }}
            >
              {metricValues.lag}
            </motion.div>
            <div className="text-sm text-gray-500 mt-2">messages behind</div>
          </div>
          
          {/* Status Indicator */}
          <motion.div 
            className="flex items-center justify-center p-4 rounded-xl"
            animate={{
              backgroundColor: metricValues.lag === 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'
            }}
          >
            <Activity className={`w-5 h-5 mr-2 ${metricValues.lag === 0 ? 'text-green-400' : 'text-yellow-400'}`} />
            <span className={`font-semibold ${metricValues.lag === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
              {metricValues.lag === 0 ? 'Perfect Performance!' : 'Catching Up...'}
            </span>
          </motion.div>
          
          {/* Misleading indicator */}
          {metricValues.lag === 0 && (
            <motion.div
              className="absolute top-4 right-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
            >
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                ALL GOOD! ✓
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
      
      {/* Share Groups Reality */}
      <motion.div
        className="relative"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.div 
          className={`bg-gray-900/60 backdrop-blur-lg rounded-3xl p-8 border transition-all duration-500 ${
            showDanger ? 'border-red-500 shadow-2xl' : 'border-gray-700/50'
          }`}
          animate={showDanger ? {
            borderColor: ['#ef4444', '#dc2626', '#ef4444'],
            boxShadow: [
              '0 0 20px rgba(239, 68, 68, 0.3)',
              '0 0 40px rgba(239, 68, 68, 0.6)',
              '0 0 20px rgba(239, 68, 68, 0.3)'
            ]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-300">Share Groups Reality</h3>
            <motion.div
              animate={showDanger ? {
                rotate: [0, -10, 10, -10, 0]
              } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </motion.div>
          </div>
          
          {/* Unacked Metric */}
          <div className="text-center mb-8">
            <div className="text-lg text-gray-400 mb-2">RecordsUnacked</div>
            <motion.div 
              className="text-7xl font-black text-red-500"
              animate={metricValues.unacked > 0 ? {
                scale: [1, 1.05, 1]
              } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {metricValues.unacked}
            </motion.div>
            <div className="text-sm text-gray-500 mt-2">messages unprocessed</div>
          </div>
          
          {/* Processing Rate */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Processing Rate</span>
              <span className="text-sm font-bold text-orange-400">{metricValues.processing}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                initial={{ width: '0%' }}
                animate={{ width: `${metricValues.processing}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          
          {/* Alert */}
          <motion.div 
            className="flex items-center justify-center p-4 rounded-xl bg-red-900/20"
            animate={showDanger ? {
              backgroundColor: ['rgba(127, 29, 29, 0.2)', 'rgba(127, 29, 29, 0.4)', 'rgba(127, 29, 29, 0.2)']
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AlertCircle className="w-5 h-5 mr-2 text-red-400" />
            <span className="font-semibold text-red-400">
              Critical Performance Issues!
            </span>
          </motion.div>
          
          {/* Danger badge */}
          {showDanger && (
            <motion.div
              className="absolute top-4 right-4"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10 }}
            >
              <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                HIDDEN DANGER!
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
  
  return (
    <div className="scene-container">
      {/* Dynamic Background */}
      <motion.div 
        className="absolute inset-0"
        animate={{ 
          background: showDanger ? 
            'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.3) 0%, transparent 50%)' :
            'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)'
        }}
        transition={{ duration: 2 }}
      />
      
      {/* Danger pattern overlay */}
      <AnimatePresence>
        {showDanger && (
          <motion.div
            className="absolute inset-0 opacity-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            exit={{ opacity: 0 }}
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 35px,
                rgba(239, 68, 68, 0.5) 35px,
                rgba(239, 68, 68, 0.5) 70px
              )`
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Particles */}
      <ParticleBackground 
        particleCount={40} 
        colors={showDanger ? ['#ef4444', '#dc2626', '#f97316'] : ['#4338ca', '#8b5cf6', '#3b82f6']} 
      />
      
      {/* Content with camera transform */}
      <div 
        className="relative z-10 h-full flex items-center justify-center p-8"
        style={{ transform: cameraTransform }}
      >
        <div className="w-full max-w-7xl">
          
          {/* Phase 1: Introduction */}
          <SceneTransition isActive={time >= phases.intro.start && time < phases.traditional.start}>
            <CinematicTitle
              title="The Zero Lag Fallacy"
              subtitle="When Good Metrics Hide Bad Problems"
              time={time}
              startTime={phases.intro.start}
            />
          </SceneTransition>
          
          {/* Phase 2-3: Metrics Comparison */}
          <SceneTransition isActive={time >= phases.traditional.start && time < phases.reveal.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center mb-12"
                style={getTextRevealStyle(time, phases.traditional.start, 1)}
              >
                Traditional Metrics vs Reality
              </motion.h2>
              
              <ComparisonVisualization />
            </div>
          </SceneTransition>
          
          {/* Phase 4: The Reveal */}
          <SceneTransition isActive={time >= phases.reveal.start && time < phases.conclusion.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-5xl font-bold text-center mb-8 text-red-400"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 10 }}
              >
                The Hidden Truth
              </motion.h2>
              
              {/* Warning message */}
              <motion.div
                className="max-w-4xl mx-auto bg-red-900/30 border border-red-500/50 rounded-2xl p-8 backdrop-blur-lg"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-start gap-6">
                  <motion.div
                    animate={{ 
                      rotate: [0, -5, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <AlertTriangle className="w-16 h-16 text-red-400 flex-shrink-0" />
                  </motion.div>
                  
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-red-300 mb-4">Critical Insight</h3>
                    <p className="text-xl text-gray-300 leading-relaxed mb-6">
                      Share Groups can show <span className="text-green-400 font-bold">zero lag</span> because messages are 
                      immediately assigned to consumers. But <span className="text-red-400 font-bold">500 unacked records</span> reveal 
                      the real story: consumers are struggling to process messages!
                    </p>
                    
                    {/* Visual explanation */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-black/30 rounded-lg p-4">
                        <div className="text-green-400 font-bold mb-2">Lag = 0</div>
                        <div className="text-sm text-gray-400">Messages assigned instantly</div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-4">
                        <div className="text-red-400 font-bold mb-2">Unacked = 500</div>
                        <div className="text-sm text-gray-400">Processing bottleneck</div>
                      </div>
                    </div>
                    
                    <motion.div
                      className="p-4 bg-black/40 rounded-lg border border-purple-500/30"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                    >
                      <p className="text-lg text-purple-300 italic">
                        &quot;Traditional lag metrics become meaningless with Share Groups. 
                        Focus on unacked messages to understand true consumer health.&quot;
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
              
              {/* Metrics to watch */}
              <motion.div
                className="grid grid-cols-3 gap-6 max-w-4xl mx-auto"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {[
                  { label: 'RecordsUnacked', icon: AlertCircle, color: 'text-red-400' },
                  { label: 'Processing Rate', icon: Activity, color: 'text-orange-400' },
                  { label: 'Consumer Health', icon: TrendingDown, color: 'text-yellow-400' }
                ].map((metric, i) => {
                  const Icon = metric.icon;
                  
                  return (
                    <motion.div
                      key={metric.label}
                      className="bg-gray-900/60 backdrop-blur-lg rounded-xl p-6 text-center border border-gray-700/50"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 + i * 0.2, type: "spring", damping: 10 }}
                      whileHover={{ scale: 1.05, borderColor: 'rgb(239 68 68 / 0.5)' }}
                    >
                      <Icon className={`w-12 h-12 mx-auto mb-3 ${metric.color}`} />
                      <div className="font-bold">{metric.label}</div>
                    </motion.div>
                  );
                })}
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
              <h2 className="text-6xl font-black bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Monitor What Matters
              </h2>
              <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
                Don&apos;t be fooled by vanity metrics. Track unacked records for true visibility.
              </p>
              
              {/* Key takeaway */}
              <motion.div
                className="inline-block bg-gradient-to-r from-red-600 to-orange-600 rounded-lg px-8 py-4"
                animate={{ 
                  boxShadow: [
                    "0 0 20px rgba(239, 68, 68, 0.5)",
                    "0 0 40px rgba(239, 68, 68, 0.7)",
                    "0 0 20px rgba(239, 68, 68, 0.5)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-xl font-bold text-white">RecordsUnacked &gt; Consumer Lag</span>
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
            background: showDanger ? 'linear-gradient(to right, #ef4444, #f97316)' : undefined
          }}
        />
      </div>
    </div>
  );
};

export default ZeroLagFallacyScene;