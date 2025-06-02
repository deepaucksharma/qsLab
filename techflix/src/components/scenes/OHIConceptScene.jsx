import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, BarChart3, Rocket, Zap, Target, TrendingUp, ArrowRight, Cpu, Cloud, Server } from 'lucide-react';
import '../../styles/techflix-cinematic-v2.css';

const OHIConceptScene = ({ time, duration }) => {
  const progress = (time / duration) * 100;
  
  // 5-phase storytelling structure
  const phase = useMemo(() => {
    if (time < 2) return 'intro';
    if (time < 4) return 'phase2'; // Definition
    if (time < 7) return 'phase3'; // Architecture
    if (time < 9) return 'phase4'; // Benefits
    return 'conclusion';
  }, [time]);

  // Architecture components
  const architectureFlow = [
    { 
      id: 'app',
      icon: <Server className="w-8 h-8" />,
      title: 'Your App',
      subtitle: 'Kafka + JMX',
      color: 'text-cyan-400'
    },
    { 
      id: 'ohi',
      icon: <Cpu className="w-8 h-8" />,
      title: 'Your OHI',
      subtitle: 'Go Binary',
      color: 'text-teal-400'
    },
    { 
      id: 'agent',
      icon: <Server className="w-8 h-8" />,
      title: 'Infra Agent',
      subtitle: 'New Relic',
      color: 'text-green-400'
    },
    { 
      id: 'cloud',
      icon: <Cloud className="w-8 h-8" />,
      title: 'New Relic',
      subtitle: 'Platform',
      color: 'text-purple-400'
    }
  ];

  // Benefits data
  const benefits = [
    { 
      icon: <Zap className="w-8 h-8" />,
      title: 'Performance', 
      desc: 'Lightweight & efficient data collection',
      color: 'text-yellow-400'
    },
    { 
      icon: <Target className="w-8 h-8" />,
      title: 'Customizable', 
      desc: 'Tailored to your specific metrics',
      color: 'text-cyan-400'
    },
    { 
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Integrated', 
      desc: 'First-class New Relic UI support',
      color: 'text-purple-400'
    }
  ];

  const shouldShowArchitecture = (index) => {
    if (phase !== 'phase3') return false;
    const delay = (time - 4) - (index * 0.5);
    return delay > 0;
  };

  return (
    <div className="scene-container-v2">
      <div className="scene-content">
        <div className="flex flex-col items-center justify-center min-h-full py-12">
          {/* Title */}
          <AnimatePresence mode="wait">
            {phase === 'intro' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <h1 className="scene-title">On Host Integration (OHI)</h1>
                <p className="scene-subtitle">Custom Metrics Pipeline for New Relic</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Definition Phase */}
          <AnimatePresence>
            {phase === 'phase2' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl mx-auto text-center"
              >
                <div className="metric-card-v2 p-8">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <Wrench className="w-10 h-10 text-blue-400" />
                    <h2 className="text-3xl font-bold text-gray-200">What is OHI?</h2>
                  </div>
                  <p className="text-xl text-gray-300 leading-relaxed">
                    On Host Integration (OHI) is New Relic's framework for creating custom 
                    monitoring integrations that run alongside the Infrastructure agent, 
                    collecting and reporting specialized metrics from any source.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Architecture Flow */}
          <AnimatePresence>
            {phase === 'phase3' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-6xl"
              >
                <h2 className="text-2xl font-bold text-center mb-12 text-gray-200">
                  Data Flow Architecture
                </h2>
                
                <div className="flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
                  {architectureFlow.map((component, index) => (
                    <div key={component.id}>
                      {shouldShowArchitecture(index) && (
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6 }}
                          className="flex flex-col items-center"
                        >
                          <div className="metric-card-v2 p-6 mb-4">
                            <div className={`${component.color} mb-4`}>
                              {component.icon}
                            </div>
                            <h3 className="text-lg font-bold text-gray-200">
                              {component.title}
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">
                              {component.subtitle}
                            </p>
                          </div>
                        </motion.div>
                      )}
                      
                      {index < architectureFlow.length - 1 && shouldShowArchitecture(index) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, delay: 0.3 }}
                        >
                          <ArrowRight className="w-8 h-8 text-gray-600" />
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>

                {shouldShowArchitecture(3) && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-gray-400 mt-8"
                  >
                    Your OHI collects metrics → Infra agent forwards → New Relic processes → You visualize
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Benefits Grid */}
          <AnimatePresence>
            {phase === 'phase4' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-5xl"
              >
                <h2 className="text-2xl font-bold text-center mb-12 text-gray-200">
                  Why Build an OHI?
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="metric-card-v2 p-6 text-center"
                    >
                      <div className={`${benefit.color} mb-4 flex justify-center`}>
                        {benefit.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-gray-200">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-400">
                        {benefit.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Conclusion */}
          <AnimatePresence>
            {phase === 'conclusion' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="text-center max-w-4xl mx-auto"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="mb-8"
                >
                  <Rocket className="w-20 h-20 text-green-400 mx-auto" />
                </motion.div>
                
                <h2 className="text-3xl font-bold mb-4 text-gray-200">
                  Ready to Build Your OHI
                </h2>
                
                <p className="text-xl text-gray-300 mb-8">
                  Transform your Kafka Share Groups metrics into actionable insights 
                  with a custom New Relic integration that speaks your language.
                </p>

                <div className="flex items-center justify-center gap-2 text-blue-400">
                  <BarChart3 className="w-6 h-6" />
                  <span className="text-lg">Let's dive into the implementation</span>
                  <ArrowRight className="w-6 h-6" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default OHIConceptScene;