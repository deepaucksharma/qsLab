import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CinematicTitle,
  ArchitectureDiagram,
  CodeDemo,
  ParticleBackground,
  SceneTransition
} from '../StorytellingComponents';
import {
  getTextRevealStyle,
  getTimeBasedValue,
  getCameraTransform
} from '../../utils/animationHelpers';
import { getStaggeredDelay } from '../../utils/storytellingHelpers';

const PrometheusArchitectureScene = ({ time, duration }) => {
  // Scene phases
  const phases = {
    intro: { start: 0, duration: 3 },
    architecture: { start: 3, duration: 8 },
    dataFlow: { start: 11, duration: 10 },
    integration: { start: 21, duration: 6 },
    conclusion: { start: 27, duration: 3 }
  };
  
  const [activeDataFlows, setActiveDataFlows] = useState([]);
  const progress = (time / duration) * 100;
  
  // Simulate data flow animations
  useEffect(() => {
    if (time > phases.dataFlow.start && time < phases.dataFlow.start + phases.dataFlow.duration) {
      const interval = setInterval(() => {
        const flowId = Date.now();
        const flowType = ['metrics', 'alerts', 'queries'][Math.floor(Math.random() * 3)];
        
        setActiveDataFlows(prev => [...prev, { id: flowId, type: flowType }]);
        
        setTimeout(() => {
          setActiveDataFlows(prev => prev.filter(flow => flow.id !== flowId));
        }, 3000);
      }, 800);
      
      return () => clearInterval(interval);
    }
  }, [time, phases.dataFlow]);
  
  // Architecture nodes
  const architectureNodes = [
    // Exporters
    { id: 'app1', label: 'Application', icon: '📱', x: 10, y: 30, className: 'border-blue-500' },
    { id: 'db1', label: 'Database', icon: '🗄️', x: 10, y: 50, className: 'border-blue-500' },
    { id: 'kafka1', label: 'Kafka', icon: '📊', x: 10, y: 70, className: 'border-blue-500' },
    
    // Prometheus Server
    { id: 'prometheus', label: 'Prometheus Server', icon: '🔥', x: 50, y: 50, className: 'border-orange-500 scale-150' },
    
    // Storage
    { id: 'tsdb', label: 'Time Series DB', icon: '💾', x: 50, y: 80, className: 'border-purple-500' },
    
    // Consumers
    { id: 'grafana', label: 'Grafana', icon: '📊', x: 85, y: 30, className: 'border-green-500' },
    { id: 'alertmanager', label: 'AlertManager', icon: '🚨', x: 85, y: 50, className: 'border-red-500' },
    { id: 'api', label: 'HTTP API', icon: '🌐', x: 85, y: 70, className: 'border-cyan-500' }
  ];
  
  const connections = [
    // Exporters to Prometheus
    { x1: '20%', y1: '30%', x2: '40%', y2: '45%' },
    { x1: '20%', y1: '50%', x2: '40%', y2: '50%' },
    { x1: '20%', y1: '70%', x2: '40%', y2: '55%' },
    
    // Prometheus to Storage
    { x1: '50%', y1: '60%', x2: '50%', y2: '75%' },
    
    // Prometheus to Consumers
    { x1: '60%', y1: '45%', x2: '75%', y2: '30%' },
    { x1: '60%', y1: '50%', x2: '75%', y2: '50%' },
    { x1: '60%', y1: '55%', x2: '75%', y2: '70%' }
  ];
  
  // Prometheus configuration example
  const prometheusConfig = `# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'kafka'
    static_configs:
      - targets: ['kafka1:9090', 'kafka2:9090', 'kafka3:9090']
    
  - job_name: 'applications'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

rule_files:
  - 'alerts/*.yml'`;
  
  // Data Flow Visualization Component
  const DataFlowParticle = ({ flow }) => {
    const paths = {
      metrics: { startX: 20, startY: 50, endX: 85, endY: 30 },
      alerts: { startX: 50, startY: 50, endX: 85, endY: 50 },
      queries: { startX: 85, startY: 70, endX: 50, endY: 50 }
    };
    
    const path = paths[flow.type];
    const color = {
      metrics: '#10b981',
      alerts: '#ef4444',
      queries: '#3b82f6'
    }[flow.type];
    
    return (
      <motion.div
        className="absolute w-4 h-4 rounded-full"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 20px ${color}`,
          left: `${path.startX}%`,
          top: `${path.startY}%`
        }}
        animate={{
          left: `${path.endX}%`,
          top: `${path.endY}%`,
          opacity: [0, 1, 1, 0]
        }}
        transition={{ duration: 2, ease: "linear" }}
      />
    );
  };
  
  // Camera movements for dramatic effect
  const cameraMovements = [
    { start: 0, end: 3, fromX: 0, toX: 0, fromY: 0, toY: 0, fromScale: 0.8, toScale: 1 },
    { start: 11, end: 13, fromX: 0, toX: -100, fromY: 0, toY: -50, fromScale: 1, toScale: 1.3 },
    { start: 21, end: 23, fromX: -100, toX: 0, fromY: -50, toY: 0, fromScale: 1.3, toScale: 1 }
  ];
  
  const cameraTransform = getCameraTransform(time, cameraMovements);
  
  return (
    <div className="scene-container">
      {/* Multi-layered Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900 via-black to-purple-900" />
      <div className="absolute inset-0 bg-tech-grid opacity-15" />
      <ParticleBackground 
        particleCount={30} 
        colors={['#f97316', '#8b5cf6', '#ef4444']} 
      />
      
      {/* Content with camera transform */}
      <div 
        className="relative z-10 h-full flex items-center justify-center p-8"
        style={{ transform: cameraTransform }}
      >
        <div className="w-full max-w-7xl">
          
          {/* Phase 1: Introduction */}
          <SceneTransition isActive={time >= phases.intro.start && time < phases.architecture.start}>
            <div className="text-center">
              <CinematicTitle
                title="Prometheus Architecture"
                subtitle="Time-Series Monitoring at Scale"
                time={time}
                startTime={phases.intro.start}
              />
              
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: time > 1.5 ? 1 : 0, y: time > 1.5 ? 0 : 20 }}
                transition={{ duration: 0.8 }}
              >
                <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
                  Discover how Prometheus revolutionizes monitoring with its pull-based model
                  and powerful query language
                </p>
              </motion.div>
            </div>
          </SceneTransition>
          
          {/* Phase 2: Architecture Overview */}
          <SceneTransition isActive={time >= phases.architecture.start && time < phases.dataFlow.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center mb-8"
                style={getTextRevealStyle(time, phases.architecture.start, 1)}
              >
                Pull-Based Monitoring Architecture
              </motion.h2>
              
              <div className="h-[600px] relative">
                <ArchitectureDiagram
                  nodes={architectureNodes}
                  connections={connections}
                  time={time}
                  startTime={phases.architecture.start}
                />
                
                {/* Architecture Labels */}
                <motion.div
                  className="absolute top-4 left-4 bg-black/60 backdrop-blur-lg rounded-lg px-4 py-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: time > phases.architecture.start + 2 ? 1 : 0 }}
                >
                  <div className="text-sm text-gray-400">Exporters</div>
                </motion.div>
                
                <motion.div
                  className="absolute top-4 right-4 bg-black/60 backdrop-blur-lg rounded-lg px-4 py-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: time > phases.architecture.start + 3 ? 1 : 0 }}
                >
                  <div className="text-sm text-gray-400">Visualization</div>
                </motion.div>
              </div>
            </div>
          </SceneTransition>
          
          {/* Phase 3: Live Data Flow */}
          <SceneTransition isActive={time >= phases.dataFlow.start && time < phases.integration.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 10 }}
              >
                Real-Time Metrics Flow
              </motion.h2>
              
              {/* Architecture with Live Data */}
              <div className="relative h-[600px]">
                <div className="opacity-30">
                  <ArchitectureDiagram
                    nodes={architectureNodes}
                    connections={connections}
                    time={30}
                    startTime={0}
                  />
                </div>
                
                {/* Animated Data Flows */}
                <AnimatePresence>
                  {activeDataFlows.map(flow => (
                    <DataFlowParticle key={flow.id} flow={flow} />
                  ))}
                </AnimatePresence>
                
                {/* Metrics Counter */}
                <motion.div
                  className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-lg rounded-2xl p-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10 }}
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400">
                      {Math.floor(getTimeBasedValue(time, phases.dataFlow.start, 5, 0, 2500000))}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Metrics/Second</div>
                  </div>
                </motion.div>
                
                {/* Flow Type Legend */}
                <motion.div
                  className="absolute top-4 left-4 bg-black/60 backdrop-blur-lg rounded-lg p-4 space-y-2"
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm">Metrics Collection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm">Alert Evaluation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm">Query Execution</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </SceneTransition>
          
          {/* Phase 4: Configuration & Integration */}
          <SceneTransition isActive={time >= phases.integration.start && time < phases.conclusion.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Simple Yet Powerful Configuration
              </motion.h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configuration Example */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <h3 className="text-xl font-semibold mb-4 text-orange-400">prometheus.yml</h3>
                  <CodeDemo
                    code={prometheusConfig}
                    language="yaml"
                    time={time}
                    startTime={phases.integration.start}
                    highlights={[
                      { start: phases.integration.start + 2, end: phases.integration.start + 4, lines: [7, 8, 9] }
                    ]}
                  />
                </motion.div>
                
                {/* Key Features */}
                <motion.div
                  className="space-y-4"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <h3 className="text-xl font-semibold mb-4 text-orange-400">Key Features</h3>
                  
                  {['Service Discovery', 'PromQL Query Language', 'Multi-dimensional Data', 'Reliable Storage', 'Alerting Rules'].map((feature, i) => (
                    <motion.div
                      key={feature}
                      className="bg-gray-900/60 backdrop-blur-lg rounded-lg p-4 border border-orange-600/30"
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: getStaggeredDelay(i, 0.1) + 0.5 }}
                      whileHover={{ scale: 1.05, borderColor: 'rgb(251 146 60 / 0.6)' }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {['🔍', '📝', '📊', '💾', '🚨'][i]}
                        </span>
                        <span className="font-medium">{feature}</span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
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
              <h2 className="text-5xl font-black bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Monitor Everything, Miss Nothing
              </h2>
              <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
                Prometheus: The foundation of modern observability stacks
              </p>
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

export default PrometheusArchitectureScene;