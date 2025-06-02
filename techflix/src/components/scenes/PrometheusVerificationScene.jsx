import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, CheckCircle, Search, TrendingUp, Clock, Database, Sparkles } from 'lucide-react';
import { ParticleBackground, SceneTransition, CinematicTitle } from '../StorytellingComponents';

const PrometheusVerificationScene = ({ time, duration }) => {
  const progress = (time / duration) * 100;
  const [metrics, setMetrics] = useState([]);
  const [queryResult, setQueryResult] = useState('');
  const [typingQuery, setTypingQuery] = useState('');
  
  // 5-phase storytelling structure
  const phase = useMemo(() => {
    if (time < 2) return 'intro';
    if (time < 4) return 'phase2'; // Curl command
    if (time < 7) return 'phase3'; // Metrics output
    if (time < 9) return 'phase4'; // PromQL query
    return 'conclusion';
  }, [time]);

  // Camera movement based on phase
  const getCameraTransform = () => {
    switch (phase) {
      case 'intro':
        return 'scale(0.95) translateY(20px)';
      case 'phase2':
        return 'scale(1) translateY(0)';
      case 'phase3':
        return 'scale(1.02) translateX(-10px)';
      case 'phase4':
        return 'scale(1.02) translateX(10px)';
      case 'conclusion':
        return 'scale(0.98) translateY(0)';
      default:
        return 'scale(1)';
    }
  };

  // Simulated metrics endpoint output
  const metricsOutput = [
    { text: '# HELP kafka_sharegroup_records_unacked Number of unacknowledged records in share group', type: 'comment' },
    { text: '# TYPE kafka_sharegroup_records_unacked gauge', type: 'comment' },
    { text: 'kafka_sharegroup_records_unacked{group="payment-processors"} 142.0', type: 'metric' },
    { text: 'kafka_sharegroup_records_unacked{group="fraud-detection"} 89.0', type: 'metric' },
    { text: 'kafka_sharegroup_records_unacked{group="analytics-pipeline"} 256.0', type: 'metric', highlight: true },
    { text: '', type: 'blank' },
    { text: '# HELP kafka_sharegroup_oldest_unacked_ms Age of oldest unacknowledged message', type: 'comment' },
    { text: '# TYPE kafka_sharegroup_oldest_unacked_ms gauge', type: 'comment' },
    { text: 'kafka_sharegroup_oldest_unacked_ms{group="payment-processors"} 3421.0', type: 'metric' },
    { text: 'kafka_sharegroup_oldest_unacked_ms{group="fraud-detection"} 1890.0', type: 'metric' },
    { text: 'kafka_sharegroup_oldest_unacked_ms{group="analytics-pipeline"} 5234.0', type: 'metric', highlight: true }
  ];

  const fullQuery = 'kafka_sharegroup_records_unacked > 200';

  // Progressive reveal of metrics
  useEffect(() => {
    if (phase === 'phase3') {
      const visibleLines = Math.floor(((time - 4) / 3) * metricsOutput.length);
      setMetrics(metricsOutput.slice(0, visibleLines));
    }
    
    if (phase === 'phase4') {
      const charCount = Math.floor((time - 7) * 15);
      setTypingQuery(fullQuery.slice(0, charCount));
      if (charCount >= fullQuery.length) {
        setQueryResult('analytics-pipeline{group="analytics-pipeline"} 256');
      }
    }
  }, [time, phase]);

  return (
    <SceneTransition
      className="w-full h-full"
      effect="fade"
      duration={0.8}
    >
      <div className="relative w-full h-full overflow-hidden">
        {/* Dynamic gradient background */}
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: phase === 'conclusion' 
              ? 'radial-gradient(ellipse at center, rgba(34, 197, 94, 0.15) 0%, rgba(0, 0, 0, 0.95) 100%)'
              : 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.1) 0%, rgba(0, 0, 0, 0.98) 100%)'
          }}
          transition={{ duration: 2 }}
        />

        {/* Success Particles */}
        <AnimatePresence>
          {phase === 'conclusion' && (
            <>
              <ParticleBackground
                count={60}
                size={2}
                speed={0.5}
                color="rgba(34, 197, 94, 0.6)"
              />
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  className="absolute"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`
                  }}
                >
                  <Sparkles className="w-6 h-6 text-green-400" />
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Camera container */}
        <motion.div
          className="relative w-full h-full flex items-center justify-center p-8"
          animate={{
            transform: getCameraTransform(),
          }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        >
          <div className="relative z-10 max-w-6xl w-full">
            {/* Title with cinematic animation */}
            <AnimatePresence mode="wait">
              {phase === 'intro' && (
                <motion.div
                  initial={{ opacity: 0, y: -50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8 }}
                  className="text-center mb-8"
                >
                  <CinematicTitle
                    text="Verification & Success"
                    subtitle="Confirming Metrics Are Flowing"
                    gradient="from-green-400 to-blue-400"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Curl Command */}
            <AnimatePresence>
              {(phase === 'phase2' || phase === 'phase3' || phase === 'phase4' || phase === 'conclusion') && (
                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                  className="mb-8"
                >
                  <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 blur-2xl rounded-xl" />
                    
                    {/* Terminal */}
                    <div className="relative bg-gray-900/40 backdrop-blur-xl rounded-xl border border-green-500/30 overflow-hidden">
                      <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700/50 flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-400">Terminal</span>
                      </div>
                      <div className="p-6">
                        <p className="text-sm text-gray-400 mb-3">Check metrics endpoint:</p>
                        <motion.div 
                          className="bg-black/50 rounded-lg p-4 font-mono text-sm"
                          whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
                        >
                          <span className="text-gray-500">$</span>
                          <motion.span 
                            className="text-green-400"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            {' curl localhost:9404/metrics | grep sharegroup'}
                          </motion.span>
                          <motion.span
                            className="inline-block ml-1 text-green-400"
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            _
                          </motion.span>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Metrics Output */}
            <AnimatePresence>
              {phase === 'phase3' && metrics.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8 }}
                  className="mb-8"
                >
                  <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-2xl rounded-xl" />
                    
                    {/* Metrics window */}
                    <div className="relative bg-gray-900/40 backdrop-blur-xl rounded-xl border border-blue-500/30 overflow-hidden">
                      <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700/50 flex items-center justify-between">
                        <span className="text-sm text-gray-400 font-mono">Metrics Output</span>
                        <div className="flex items-center gap-2">
                          <motion.div
                            className="w-2 h-2 rounded-full bg-green-400"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <span className="text-xs text-gray-500">Live</span>
                        </div>
                      </div>
                      <motion.div 
                        className="p-4 font-mono text-xs overflow-auto max-h-[300px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <AnimatePresence>
                          {metrics.map((line, idx) => (
                            <motion.div 
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ 
                                opacity: 1, 
                                x: 0,
                                backgroundColor: line.highlight ? 'rgba(34, 197, 94, 0.1)' : 'transparent'
                              }}
                              transition={{ duration: 0.3, delay: idx * 0.05 }}
                              className="leading-relaxed px-2 py-0.5 rounded"
                            >
                              <span className={
                                line.type === 'comment' ? 'text-gray-500' :
                                line.type === 'metric' ? (line.highlight ? 'text-green-400' : 'text-blue-400') :
                                'text-gray-300'
                              }>
                                {line.text || '\u00A0'}
                              </span>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PromQL Query */}
            <AnimatePresence>
              {phase === 'phase4' && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.8 }}
                  className="mb-8"
                >
                  <motion.h3 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xl font-semibold text-gray-300 mb-4 flex items-center gap-2"
                  >
                    <Search className="w-5 h-5 text-purple-400" />
                    Query in Prometheus:
                  </motion.h3>
                  
                  <div className="relative">
                    {/* Glow effect */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-2xl rounded-xl"
                      animate={{ opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    
                    {/* Query box */}
                    <div className="relative bg-gray-900/40 backdrop-blur-xl rounded-xl p-6 border border-purple-500/30">
                      <div className="font-mono text-lg text-purple-400 mb-4">
                        {typingQuery}
                        <motion.span
                          className="inline-block ml-0.5 w-0.5 h-5 bg-purple-400"
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                        />
                      </div>
                      
                      <AnimatePresence>
                        {queryResult && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm"
                          >
                            <span className="text-gray-400">Returns: </span>
                            <span className="text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                              {queryResult}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
              {phase === 'conclusion' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                  className="text-center"
                >
                  <motion.div
                    className="relative inline-block"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-green-500/30 blur-3xl rounded-2xl" />
                    
                    {/* Success card */}
                    <div className="relative p-8 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-2xl border border-green-500/30 backdrop-blur-xl">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, ease: "linear" }}
                        className="inline-block mb-4"
                      >
                        <CheckCircle className="w-16 h-16 text-green-400" />
                      </motion.div>
                      
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
                        Pipeline Operational!
                      </h2>
                      <p className="text-xl text-gray-300 mb-8">
                        Share Groups metrics are now flowing to Prometheus
                      </p>
                      
                      <div className="grid grid-cols-3 gap-6">
                        {[
                          { icon: <Clock className="w-6 h-6" />, value: '15s', label: 'Scrape Interval' },
                          { icon: <Database className="w-6 h-6" />, value: '30d', label: 'Retention' },
                          { icon: <TrendingUp className="w-6 h-6" />, value: '∞', label: 'Insights' }
                        ].map((stat, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + idx * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4"
                          >
                            <div className="text-blue-400 mb-2 flex justify-center">{stat.icon}</div>
                            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                              {stat.value}
                            </div>
                            <div className="text-sm text-gray-500">{stat.label}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="w-96 h-1 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div 
              className="h-full bg-gradient-to-r from-green-600 to-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      </div>
    </SceneTransition>
  );
};

export default PrometheusVerificationScene;