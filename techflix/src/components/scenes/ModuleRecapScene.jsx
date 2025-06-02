import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, BarChart3, Clock, AlertTriangle, Target, CheckCircle, BookOpen, ArrowRight } from 'lucide-react';
import '../../styles/techflix-cinematic-v2.css';

const ModuleRecapScene = ({ time, duration }) => {
  const progress = (time / duration) * 100;
  
  // 5-phase storytelling structure
  const phase = useMemo(() => {
    if (time < 2) return 'intro';
    if (time < 4.5) return 'phase2';
    if (time < 7) return 'phase3';
    if (time < 9.5) return 'phase4';
    return 'conclusion';
  }, [time]);

  const takeaways = [
    {
      icon: <RefreshCw className="w-8 h-8" />,
      title: 'Trade-offs Matter',
      description: 'Share Groups offer massive scalability but require new monitoring approaches',
      color: 'text-purple-400',
      delay: 0
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Monitor RecordsUnacked',
      description: 'The most critical metric for understanding Share Groups consumer health',
      color: 'text-orange-400',
      delay: 0.3
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Track Message Age',
      description: 'OldestUnackedMessageAgeMs reveals processing bottlenecks early',
      color: 'text-blue-400',
      delay: 0.6
    },
    {
      icon: <AlertTriangle className="w-8 h-8" />,
      title: 'Beware Zero Lag',
      description: 'Traditional lag metrics can hide serious processing issues with Share Groups',
      color: 'text-red-400',
      delay: 0.9
    }
  ];

  const shouldShowTakeaway = (index) => {
    return time > 2 + (index * 0.5);
  };

  return (
    <div className="scene-container-v2">
      <div className="scene-content">
        <div className="flex flex-col items-center justify-center min-h-full py-12">
          {/* Title */}
          <AnimatePresence>
            {phase === 'intro' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <h1 className="scene-title">Module Recap</h1>
                <p className="scene-subtitle">Key Takeaways from Critical Metrics</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Takeaways Grid */}
          <AnimatePresence>
            {(phase === 'phase2' || phase === 'phase3' || phase === 'phase4' || phase === 'conclusion') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto w-full"
              >
                {takeaways.map((takeaway, index) => (
                  shouldShowTakeaway(index) && (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.8,
                        delay: takeaway.delay
                      }}
                      className="metric-card-v2 p-6"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`${takeaway.color} flex-shrink-0`}>
                          {takeaway.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold mb-2 text-gray-200">
                            {takeaway.title}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {takeaway.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Module Progress */}
          <AnimatePresence>
            {phase === 'phase4' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8 }}
                className="mt-12 max-w-3xl mx-auto w-full"
              >
                <div className="metric-card-v2 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-200">Module Progress</h3>
                    <Target className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Trade-offs Understanding', progress: 100 },
                      { label: 'Critical Metrics Knowledge', progress: 100 },
                      { label: 'Zero Lag Fallacy Awareness', progress: 100 }
                    ].map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">{item.label}</span>
                          <span className="text-green-400">{item.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                            transition={{ duration: 1, delay: index * 0.2 }}
                            className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next Steps */}
          <AnimatePresence>
            {phase === 'conclusion' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="mt-12 max-w-4xl mx-auto w-full text-center"
              >
                <div className="alert-box p-8">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-4 text-gray-200">
                    Ready for Production Monitoring
                  </h2>
                  <p className="text-gray-300 mb-6">
                    You now understand the critical metrics that matter for Share Groups monitoring. 
                    Apply these insights to build robust observability for your Kafka 4.0 deployments.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <div className="flex items-center gap-2 text-blue-400">
                      <BookOpen className="w-5 h-5" />
                      <span>Continue Learning</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                    <div className="text-gray-300">
                      Next: Advanced Share Groups Patterns
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ModuleRecapScene;