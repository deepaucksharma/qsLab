import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Network, Activity, Lock, BarChart3, CircuitBoard, Zap } from 'lucide-react';
import {
  CinematicTitle,
  SceneTransition,
  ParticleBackground,
  ArchitectureDiagram
} from '../StorytellingComponents';
import {
  getTextRevealStyle,
  getTimeBasedValue,
  getCameraTransform
} from '../../utils/animationHelpers';
import { getStaggeredDelay } from '../../utils/storytellingHelpers';

const ServiceMeshScene = ({ time, duration }) => {
  // Scene phases
  const phases = {
    intro: { start: 0, duration: 3 },
    architecture: { start: 3, duration: 5 },
    traffic: { start: 8, duration: 5 },
    features: { start: 13, duration: 4 },
    conclusion: { start: 17, duration: 3 }
  };
  
  const [activeConnections, setActiveConnections] = useState([]);
  const [trafficFlows, setTrafficFlows] = useState([]);
  const [sidecarsActive, setSidecarsActive] = useState(false);
  const progress = (time / duration) * 100;
  
  // Services data with positions
  const services = [
    { 
      id: 'api-gateway', 
      name: 'API Gateway', 
      icon: '🚪', 
      position: { x: 50, y: 15 },
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      id: 'user-service', 
      name: 'User Service', 
      icon: '👤', 
      position: { x: 20, y: 40 },
      color: 'from-purple-500 to-pink-500'
    },
    { 
      id: 'order-service', 
      name: 'Order Service', 
      icon: '📦', 
      position: { x: 50, y: 40 },
      color: 'from-green-500 to-emerald-500'
    },
    { 
      id: 'payment-service', 
      name: 'Payment Service', 
      icon: '💳', 
      position: { x: 80, y: 40 },
      color: 'from-orange-500 to-red-500'
    },
    { 
      id: 'inventory-service', 
      name: 'Inventory', 
      icon: '📊', 
      position: { x: 35, y: 65 },
      color: 'from-yellow-500 to-amber-500'
    },
    { 
      id: 'notification-service', 
      name: 'Notifications', 
      icon: '🔔', 
      position: { x: 65, y: 65 },
      color: 'from-indigo-500 to-purple-500'
    }
  ];
  
  // Service connections
  const connections = [
    { from: 'api-gateway', to: 'user-service' },
    { from: 'api-gateway', to: 'order-service' },
    { from: 'order-service', to: 'payment-service' },
    { from: 'order-service', to: 'inventory-service' },
    { from: 'payment-service', to: 'notification-service' },
    { from: 'user-service', to: 'notification-service' }
  ];
  
  // Update states based on time
  useEffect(() => {
    if (time >= phases.architecture.start) {
      const activeCount = Math.min(
        connections.length,
        Math.floor((time - phases.architecture.start) / 0.8)
      );
      setActiveConnections(connections.slice(0, activeCount));
    }
    
    if (time >= phases.traffic.start) {
      setSidecarsActive(true);
      // Generate traffic flows
      const flowInterval = setInterval(() => {
        const randomConnection = connections[Math.floor(Math.random() * connections.length)];
        const flowId = Date.now();
        setTrafficFlows(prev => [...prev, { ...randomConnection, id: flowId }]);
        
        setTimeout(() => {
          setTrafficFlows(prev => prev.filter(flow => flow.id !== flowId));
        }, 2000);
      }, 500);
      
      return () => clearInterval(flowInterval);
    }
  }, [time, phases]);
  
  // Camera movements
  const cameraMovements = [
    { start: 0, end: 3, fromX: 0, toX: 0, fromY: -30, toY: 0, fromScale: 0.9, toScale: 1 },
    { start: 8, end: 10, fromX: 0, toX: 0, fromY: 0, toY: 0, fromScale: 1, toScale: 1.1 },
    { start: 13, end: 15, fromX: 0, toX: 0, fromY: 0, toY: 0, fromScale: 1.1, toScale: 1 }
  ];
  
  const cameraTransform = getCameraTransform(time, cameraMovements);
  
  // Service Node Component
  const ServiceNode = ({ service, index }) => {
    const isActive = time >= phases.architecture.start + index * 0.3;
    
    return (
      <motion.div
        className="absolute"
        style={{
          left: `${service.position.x}%`,
          top: `${service.position.y}%`,
          transform: 'translate(-50%, -50%)'
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: isActive ? 1 : 0,
          opacity: isActive ? 1 : 0
        }}
        transition={{ 
          delay: index * 0.3,
          type: "spring",
          damping: 10
        }}
      >
        <div className="relative group">
          {/* Main service container */}
          <motion.div
            className={`relative bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border-2 bg-gradient-to-br ${service.color}`}
            whileHover={{ scale: 1.1 }}
            animate={isActive ? {
              boxShadow: [
                '0 0 20px rgba(139, 92, 246, 0.3)',
                '0 0 40px rgba(139, 92, 246, 0.5)',
                '0 0 20px rgba(139, 92, 246, 0.3)'
              ]
            } : {}}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="text-4xl mb-2 text-center">{service.icon}</div>
            <p className="text-xs font-bold text-white text-center whitespace-nowrap">
              {service.name}
            </p>
            
            {/* Service mesh metrics */}
            {sidecarsActive && (
              <motion.div
                className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="bg-black/80 rounded px-2 py-1 text-xs text-green-400">
                  {Math.floor(Math.random() * 100 + 50)}ms • {Math.floor(Math.random() * 50 + 950)}/s
                </div>
              </motion.div>
            )}
          </motion.div>
          
          {/* Sidecar Proxy */}
          {sidecarsActive && (
            <motion.div
              className="absolute -right-3 -bottom-3 bg-purple-600 rounded-xl p-3 border-2 border-purple-400"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: 0.5 + index * 0.1,
                type: "spring",
                damping: 10
              }}
            >
              <Shield className="w-4 h-4 text-white" />
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };
  
  // Connection Lines Component
  const ConnectionLines = () => (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      <defs>
        <linearGradient id="mesh-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#ec4899" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      
      {/* Static connections */}
      {activeConnections.map((conn, i) => {
        const from = services.find(s => s.id === conn.from);
        const to = services.find(s => s.id === conn.to);
        if (!from || !to) return null;
        
        return (
          <motion.line
            key={`${conn.from}-${conn.to}`}
            x1={`${from.position.x}%`}
            y1={`${from.position.y}%`}
            x2={`${to.position.x}%`}
            y2={`${to.position.y}%`}
            stroke="url(#mesh-gradient)"
            strokeWidth="2"
            strokeDasharray="5,5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 1, delay: i * 0.2 }}
          />
        );
      })}
      
      {/* Traffic flow particles */}
      <AnimatePresence>
        {trafficFlows.map(flow => {
          const from = services.find(s => s.id === flow.from);
          const to = services.find(s => s.id === flow.to);
          if (!from || !to) return null;
          
          return (
            <motion.circle
              key={flow.id}
              r="6"
              fill="#a855f7"
              initial={{
                cx: `${from.position.x}%`,
                cy: `${from.position.y}%`,
                opacity: 0
              }}
              animate={{
                cx: `${to.position.x}%`,
                cy: `${to.position.y}%`,
                opacity: [0, 1, 1, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            >
              <animate
                attributeName="r"
                values="6;8;6"
                dur="0.5s"
                repeatCount="indefinite"
              />
            </motion.circle>
          );
        })}
      </AnimatePresence>
    </svg>
  );
  
  // Mesh Features
  const meshFeatures = [
    {
      icon: Lock,
      title: 'mTLS Everywhere',
      description: 'Automatic encryption between services',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Activity,
      title: 'Smart Load Balancing',
      description: 'Intelligent traffic distribution',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: CircuitBoard,
      title: 'Circuit Breaking',
      description: 'Automatic fault tolerance',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: BarChart3,
      title: 'Deep Observability',
      description: 'Distributed tracing & metrics',
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
            'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
      />
      
      {/* Tech mesh pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(139, 92, 246, 0.1) 50px, rgba(139, 92, 246, 0.1) 51px),
            repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(236, 72, 153, 0.1) 50px, rgba(236, 72, 153, 0.1) 51px)
          `
        }} />
      </div>
      
      {/* Particles */}
      <ParticleBackground 
        particleCount={80} 
        colors={['#8b5cf6', '#ec4899', '#3b82f6', '#a855f7']} 
      />
      
      {/* Content with camera transform */}
      <div 
        className="relative z-10 h-full flex items-center justify-center p-8"
        style={{ transform: cameraTransform }}
      >
        <div className="w-full max-w-7xl">
          
          {/* Phase 1: Introduction */}
          <SceneTransition isActive={time >= phases.intro.start && time < phases.architecture.start}>
            <CinematicTitle
              title="Service Mesh Architecture"
              subtitle="Intelligent Service-to-Service Communication"
              time={time}
              startTime={phases.intro.start}
            />
          </SceneTransition>
          
          {/* Phase 2: Architecture */}
          <SceneTransition isActive={time >= phases.architecture.start && time < phases.traffic.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center mb-8"
                style={getTextRevealStyle(time, phases.architecture.start, 1)}
              >
                Building the Service Mesh
              </motion.h2>
              
              <div className="relative h-[500px] bg-gray-900/20 backdrop-blur-sm rounded-3xl border border-purple-500/30">
                <ConnectionLines />
                
                {/* Service nodes */}
                {services.map((service, i) => (
                  <ServiceNode key={service.id} service={service} index={i} />
                ))}
                
                {/* Control Plane indicator */}
                <motion.div
                  className="absolute top-4 left-4 bg-purple-900/60 backdrop-blur-lg rounded-xl px-4 py-2 border border-purple-500/50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2 }}
                >
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-purple-300">Istio Control Plane</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </SceneTransition>
          
          {/* Phase 3: Live Traffic */}
          <SceneTransition isActive={time >= phases.traffic.start && time < phases.features.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 10 }}
              >
                Live Traffic Management
              </motion.h2>
              
              <div className="relative h-[500px] bg-gray-900/20 backdrop-blur-sm rounded-3xl border border-purple-500/30">
                <ConnectionLines />
                
                {/* Service nodes with sidecars */}
                {services.map((service, i) => (
                  <ServiceNode key={service.id} service={service} index={i} />
                ))}
                
                {/* Sidecar proxy legend */}
                <motion.div
                  className="absolute bottom-4 right-4 bg-purple-600/20 backdrop-blur-lg rounded-xl p-4 border border-purple-500/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-600 rounded-lg p-2 border-2 border-purple-400">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-purple-300">Envoy Sidecar Proxy</p>
                      <p className="text-xs text-gray-400">Handles all network traffic</p>
                    </div>
                  </div>
                </motion.div>
                
                {/* Traffic metrics */}
                <motion.div
                  className="absolute top-4 right-4 bg-black/60 backdrop-blur-lg rounded-xl p-4 space-y-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="text-sm">
                    <span className="text-gray-400">Requests/sec:</span>
                    <span className="text-green-400 font-mono ml-2">
                      {Math.floor(getTimeBasedValue(time, phases.traffic.start, 3, 1000, 5000))}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-400">P99 Latency:</span>
                    <span className="text-yellow-400 font-mono ml-2">45ms</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-400">Success Rate:</span>
                    <span className="text-green-400 font-mono ml-2">99.9%</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </SceneTransition>
          
          {/* Phase 4: Features */}
          <SceneTransition isActive={time >= phases.features.start && time < phases.conclusion.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center mb-12"
                style={getTextRevealStyle(time, phases.features.start, 1)}
              >
                Service Mesh Superpowers
              </motion.h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {meshFeatures.map((feature, i) => {
                  const Icon = feature.icon;
                  
                  return (
                    <motion.div
                      key={feature.title}
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
                        className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}
                        whileHover={{ rotate: 360 }}
                        transition={{ type: "spring", damping: 10 }}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </motion.div>
                      
                      <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-400">{feature.description}</p>
                    </motion.div>
                  );
                })}
              </div>
              
              {/* Architecture benefit */}
              <motion.div
                className="mt-8 p-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/20 text-center"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <p className="text-xl text-purple-300">
                  <Zap className="inline w-6 h-6 mr-2" />
                  All networking concerns handled at the infrastructure layer
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
              <h2 className="text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Service Mesh Magic
              </h2>
              <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
                Zero-trust networking, infinite observability, bulletproof reliability
              </p>
              
              <motion.div
                className="inline-block"
                animate={{ 
                  y: [0, -10, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg px-8 py-4">
                  <span className="text-xl font-bold text-white">
                    Ready for Production-Grade Microservices
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
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ServiceMeshScene;