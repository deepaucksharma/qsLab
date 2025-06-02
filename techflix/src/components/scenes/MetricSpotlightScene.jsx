import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Clock, AlertTriangle, TrendingUp, Activity, Gauge } from 'lucide-react';
import '../../styles/techflix-cinematic-v2.css';

const MetricSpotlightSceneV2 = ({ time, duration }) => {
  const [recordsUnacked, setRecordsUnacked] = useState(0);
  const [oldestUnackedAge, setOldestUnackedAge] = useState(0);
  const progress = (time / duration) * 100;

  // 5-phase storytelling structure
  const phase = useMemo(() => {
    if (time < 2) return 'intro';
    if (time < 5) return 'phase2';
    if (time < 8) return 'phase3';
    if (time < 11) return 'phase4';
    return 'conclusion';
  }, [time]);

  const metrics = [
    {
      name: 'RecordsUnacked',
      icon: <BarChart3 className="w-12 h-12" />,
      target: 120,
      unit: 'records',
      description: 'Messages awaiting acknowledgment',
      color: 'from-orange-600 to-red-600',
      criticalThreshold: 100
    },
    {
      name: 'OldestUnackedMessageAgeMs',
      icon: <Clock className="w-12 h-12" />,
      target: 5000,
      unit: 'ms',
      description: 'Time since oldest unprocessed message',
      color: 'from-blue-600 to-purple-600',
      criticalThreshold: 4000
    }
  ];

  // Animate metric values with phase-based easing
  useEffect(() => {
    if (phase === 'phase2' || phase === 'phase3' || phase === 'phase4' || phase === 'conclusion') {
      const animationProgress = Math.min((time - 2) / 6, 1);
      const easeProgress = 1 - Math.pow(1 - animationProgress, 3);
      
      // Add some variation to simulate real-time data
      const variation = phase === 'phase4' ? Math.sin(time * 2) * 5 : 0;
      
      setRecordsUnacked(Math.floor(metrics[0].target * easeProgress + variation));
      setOldestUnackedAge(Math.floor(metrics[1].target * easeProgress + variation * 50));
    }
  }, [time, phase]);

  const currentValues = [recordsUnacked, oldestUnackedAge];

  // Check if metrics are in critical state
  const isCritical = currentValues.some((value, index) => value > metrics[index].criticalThreshold);

  return (
    <div className="scene-container-v2">
      <div className="scene-content">
        <div className="flex flex-col items-center justify-center min-h-full py-12">
          {/* Title with simple animation */}
          <AnimatePresence>
            {phase === 'intro' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <h1 className="scene-title">Critical Share Groups Metrics</h1>
                <p className="scene-subtitle">Monitor What Matters Most</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Metrics Grid */}
          <AnimatePresence>
            {(phase === 'phase2' || phase === 'phase3' || phase === 'phase4' || phase === 'conclusion') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full"
              >
                {metrics.map((metric, index) => {
                  const value = currentValues[index];
                  const isCriticalMetric = value > metric.criticalThreshold;
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0
                      }}
                      transition={{ 
                        delay: index * 0.3, 
                        duration: 0.8
                      }}
                      className="relative"
                    >
                      {/* Metric Card */}
                      <div className="metric-card-v2 p-8">
                        {/* Icon */}
                        <div className={`mb-4 ${isCriticalMetric ? 'text-red-400' : 'text-gray-400'}`}>
                          {metric.icon}
                        </div>
                        
                        {/* Metric Name */}
                        <h3 className="text-xl font-bold mb-2 text-gray-200">{metric.name}</h3>
                        
                        {/* Description */}
                        <p className="text-gray-400 mb-6 text-sm">{metric.description}</p>
                        
                        {/* Value Display */}
                        <div className="metric-value text-5xl mb-4">
                          {value.toLocaleString()}
                          <span className="text-2xl ml-2 text-gray-400">{metric.unit}</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div 
                            className={`h-full bg-gradient-to-r ${metric.color} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(value / metric.target) * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                          {/* Critical threshold marker */}
                          <div 
                            className="absolute top-0 h-full w-0.5 bg-yellow-400/50"
                            style={{ left: `${(metric.criticalThreshold / metric.target) * 100}%` }}
                          />
                        </div>
                        
                        {/* Threshold Indicator */}
                        <div className="mt-4 flex items-center justify-between text-sm">
                          <span className="text-gray-500">0</span>
                          <div className="flex items-center gap-2">
                            <Gauge className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-400">{metric.criticalThreshold}</span>
                          </div>
                          <span className="text-gray-400">{metric.target}</span>
                        </div>

                        {/* Status indicator */}
                        {isCriticalMetric && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 flex items-center gap-2 text-red-400"
                          >
                            <AlertTriangle className="w-5 h-5" />
                            <span className="text-sm font-medium">Critical Threshold Exceeded</span>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Alert Message */}
          <AnimatePresence>
            {phase === 'phase4' && isCritical && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mt-12 relative max-w-3xl mx-auto w-full"
              >
                <div className="alert-box p-6">
                  <div className="flex items-center justify-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
                    <p className="text-lg text-center text-red-300">
                      High unacked records indicate consumer processing bottlenecks
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Conclusion insights */}
          <AnimatePresence>
            {phase === 'conclusion' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto w-full"
              >
                {[
                  { icon: <Activity className="w-6 h-6" />, label: "Monitor Continuously" },
                  { icon: <TrendingUp className="w-6 h-6" />, label: "Set Alert Thresholds" },
                  { icon: <Gauge className="w-6 h-6" />, label: "Track Trends" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="metric-card-v2 p-4 flex items-center gap-3"
                  >
                    <div className="text-blue-400">{item.icon}</div>
                    <span className="text-gray-300">{item.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MetricSpotlightSceneV2;