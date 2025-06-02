import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Package, CreditCard, Database, Bell, TrendingUp, Network, GitBranch } from 'lucide-react';
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

const MicroservicesOverviewScene = ({ time, duration }) => {
  // Scene phases
  const phases = {
    intro: { start: 0, duration: 3 },
    monolith: { start: 3, duration: 4 },
    breakdown: { start: 7, duration: 4 },
    microservices: { start: 11, duration: 5 },
    benefits: { start: 16, duration: 4 }
  };
  
  const [showConnections, setShowConnections] = useState(false);
  const [monolithCracking, setMonolithCracking] = useState(false);
  const [servicesActive, setServicesActive] = useState([]);
  const progress = (time / duration) * 100;
  
  // Microservices data
  const services = [
    { 
      id: 'user',
      name: 'User Service', 
      icon: Box, 
      color: 'from-blue-500 to-cyan-500',
      metrics: { requests: 1250, latency: 45 },
      position: { x: 20, y: 20 }
    },
    { 
      id: 'order',
      name: 'Order Service', 
      icon: Package, 
      color: 'from-green-500 to-emerald-500',
      metrics: { requests: 890, latency: 120 },
      position: { x: 50, y: 20 }
    },
    { 
      id: 'payment',
      name: 'Payment Service', 
      icon: CreditCard, 
      color: 'from-purple-500 to-pink-500',
      metrics: { requests: 450, latency: 200 },
      position: { x: 80, y: 20 }
    },
    { 
      id: 'inventory',
      name: 'Inventory Service', 
      icon: Database, 
      color: 'from-orange-500 to-red-500',
      metrics: { requests: 2100, latency: 35 },
      position: { x: 20, y: 60 }
    },
    { 
      id: 'notification',
      name: 'Notification Service', 
      icon: Bell, 
      color: 'from-yellow-500 to-amber-500',
      metrics: { requests: 3200, latency: 15 },
      position: { x: 50, y: 60 }
    },
    { 
      id: 'analytics',
      name: 'Analytics Service', 
      icon: TrendingUp, 
      color: 'from-indigo-500 to-purple-500',
      metrics: { requests: 500, latency: 150 },
      position: { x: 80, y: 60 }
    }
  ];
  
  // Service connections
  const connections = [
    { from: 'user', to: 'order' },
    { from: 'order', to: 'payment' },
    { from: 'order', to: 'inventory' },
    { from: 'payment', to: 'notification' },
    { from: 'inventory', to: 'analytics' },
    { from: 'user', to: 'notification' }
  ];
  
  // Update states based on time
  useEffect(() => {
    if (time >= phases.breakdown.start) {
      setMonolithCracking(true);
    }
    if (time >= phases.microservices.start) {
      const activeCount = Math.min(
        services.length,
        Math.floor((time - phases.microservices.start) / 0.8)
      );
      setServicesActive(services.slice(0, activeCount).map(s => s.id));
    }
    if (time >= phases.microservices.start + 3) {
      setShowConnections(true);
    }
  }, [time, phases]);
  
  // Camera movements
  const cameraMovements = [
    { start: 0, end: 3, fromX: 0, toX: 0, fromY: -30, toY: 0, fromScale: 0.9, toScale: 1 },
    { start: 7, end: 9, fromX: 0, toX: 0, fromY: 0, toY: 0, fromScale: 1, toScale: 1.2 },
    { start: 11, end: 13, fromX: 0, toX: 0, fromY: 0, toY: 0, fromScale: 1.2, toScale: 1 }
  ];
  
  const cameraTransform = getCameraTransform(time, cameraMovements);
  
  // Monolith component
  const Monolith = () => (
    <motion.div
      className="relative w-80 h-80"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", damping: 10 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl border-4 border-gray-600"
        animate={monolithCracking ? {
          scale: [1, 1.05, 1],
          rotate: [0, -1, 1, -1, 0]
        } : {}}
        transition={{ duration: 0.5, repeat: monolithCracking ? 3 : 0 }}
      >
        {/* Monolith content */}
        <div className="relative h-full flex flex-col items-center justify-center p-8">
          <motion.div
            className="text-8xl mb-4"
            animate={monolithCracking ? { scale: [1, 0.9, 1] } : {}}
            transition={{ duration: 0.3, repeat: monolithCracking ? 3 : 0 }}
          >
            🏢
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-300">Monolithic Architecture</h3>
          <p className="text-gray-500 mt-2 text-center">All services tightly coupled</p>
        </div>
        
        {/* Cracks */}
        {monolithCracking && (
          <>
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <svg className="w-full h-full">
                <motion.path
                  d="M 80 50 L 120 100 L 100 150 L 140 200"
                  stroke="#ef4444"
                  strokeWidth="3"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
                <motion.path
                  d="M 200 60 L 180 120 L 210 180"
                  stroke="#ef4444"
                  strokeWidth="3"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.8 }}
                />
              </svg>
            </motion.div>
            
            {/* Breaking effect */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.5, delay: 1.5 }}
            >
              <div className="text-6xl">💥</div>
            </motion.div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
  
  // Service card component
  const ServiceCard = ({ service, isActive, index }) => {
    const Icon = service.icon;
    
    return (
      <motion.div
        className="relative"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ 
          scale: isActive ? 1 : 0,
          rotate: isActive ? 0 : -180
        }}
        transition={{ 
          delay: index * 0.2,
          type: "spring",
          damping: 10
        }}
      >
        <motion.div
          className={`w-40 h-40 rounded-2xl border-2 bg-gradient-to-br ${service.color} p-4 backdrop-blur-lg ${
            isActive ? 'border-white/30 shadow-2xl' : 'border-gray-600'
          }`}
          whileHover={{ scale: 1.1, zIndex: 10 }}
          animate={isActive ? {
            boxShadow: [
              '0 0 20px rgba(255, 255, 255, 0.3)',
              '0 0 40px rgba(255, 255, 255, 0.5)',
              '0 0 20px rgba(255, 255, 255, 0.3)'
            ]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="h-full flex flex-col items-center justify-center text-white">
            <motion.div
              animate={isActive ? { rotate: 360 } : {}}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Icon className="w-12 h-12 mb-2" />
            </motion.div>
            <h4 className="text-sm font-bold text-center">{service.name}</h4>
            
            {/* Metrics */}
            {isActive && (
              <motion.div
                className="absolute -bottom-8 left-0 right-0 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="text-xs text-gray-400">
                  {service.metrics.requests} req/s • {service.metrics.latency}ms
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  };
  
  // Connection lines component
  const ConnectionLines = () => (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      <AnimatePresence>
        {showConnections && connections.map((conn, i) => {
          const fromService = services.find(s => s.id === conn.from);
          const toService = services.find(s => s.id === conn.to);
          
          if (!fromService || !toService) return null;
          
          return (
            <motion.line
              key={`${conn.from}-${conn.to}`}
              x1={`${fromService.position.x}%`}
              y1={`${fromService.position.y}%`}
              x2={`${toService.position.x}%`}
              y2={`${toService.position.y}%`}
              stroke="rgba(139, 92, 246, 0.3)"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ pathLength: 0, opacity: 0 }}
              transition={{ duration: 1, delay: i * 0.1 }}
            />
          );
        })}
      </AnimatePresence>
      
      {/* Data flow particles */}
      {showConnections && connections.map((conn, i) => {
        const fromService = services.find(s => s.id === conn.from);
        const toService = services.find(s => s.id === conn.to);
        
        if (!fromService || !toService) return null;
        
        return (
          <motion.circle
            key={`particle-${i}`}
            r="4"
            fill="#8b5cf6"
            initial={{
              cx: `${fromService.position.x}%`,
              cy: `${fromService.position.y}%`
            }}
            animate={{
              cx: [`${fromService.position.x}%`, `${toService.position.x}%`],
              cy: [`${fromService.position.y}%`, `${toService.position.y}%`]
            }}
            transition={{
              duration: 2,
              delay: i * 0.3,
              repeat: Infinity,
              repeatDelay: 1
            }}
          />
        );
      })}
    </svg>
  );
  
  return (
    <div className="scene-container">
      {/* Dynamic Background */}
      <motion.div 
        className="absolute inset-0"
        animate={{ 
          background: [
            'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 80%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
      />
      
      {/* Hexagon pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <defs>
          <pattern id="hex-pattern" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
            <polygon points="30,1 45,10 45,30 30,40 15,30 15,10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex-pattern)"/>
      </svg>
      
      {/* Particles */}
      <ParticleBackground 
        particleCount={60} 
        colors={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b']} 
      />
      
      {/* Content with camera transform */}
      <div 
        className="relative z-10 h-full flex items-center justify-center p-8"
        style={{ transform: cameraTransform }}
      >
        <div className="w-full max-w-7xl">
          
          {/* Phase 1: Introduction */}
          <SceneTransition isActive={time >= phases.intro.start && time < phases.monolith.start}>
            <CinematicTitle
              title="Microservices Architecture"
              subtitle="From Monolith to Distributed Excellence"
              time={time}
              startTime={phases.intro.start}
            />
          </SceneTransition>
          
          {/* Phase 2: Monolith */}
          <SceneTransition isActive={time >= phases.monolith.start && time < phases.breakdown.start}>
            <div className="flex flex-col items-center space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center"
                style={getTextRevealStyle(time, phases.monolith.start, 1)}
              >
                The Traditional Approach
              </motion.h2>
              
              <Monolith />
              
              <motion.div
                className="max-w-2xl text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <p className="text-xl text-gray-400">
                  All functionality packed into a single deployable unit
                </p>
              </motion.div>
            </div>
          </SceneTransition>
          
          {/* Phase 3: Breakdown */}
          <SceneTransition isActive={time >= phases.breakdown.start && time < phases.microservices.start}>
            <div className="flex items-center justify-center space-x-16">
              <Monolith />
              
              <motion.div
                className="text-6xl"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 10 }}
              >
                →
              </motion.div>
              
              <motion.div
                className="text-center"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Network className="w-24 h-24 text-purple-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold">Breaking Apart</h3>
                <p className="text-gray-400 mt-2">Into focused services</p>
              </motion.div>
            </div>
          </SceneTransition>
          
          {/* Phase 4: Microservices */}
          <SceneTransition isActive={time >= phases.microservices.start && time < phases.benefits.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-5xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 10 }}
              >
                Distributed Microservices
              </motion.h2>
              
              <div className="relative h-[500px]">
                <ConnectionLines />
                
                <div className="grid grid-cols-3 gap-8 relative">
                  {services.map((service, i) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      isActive={servicesActive.includes(service.id)}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            </div>
          </SceneTransition>
          
          {/* Phase 5: Benefits */}
          <SceneTransition isActive={time >= phases.benefits.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center mb-12"
                style={getTextRevealStyle(time, phases.benefits.start, 1)}
              >
                The Power of Microservices
              </motion.h2>
              
              <div className="grid grid-cols-4 gap-6">
                {[
                  { 
                    icon: '🚀', 
                    title: 'Independent Deployment',
                    description: 'Deploy services without affecting others',
                    color: 'from-blue-500 to-cyan-500'
                  },
                  { 
                    icon: '📈', 
                    title: 'Infinite Scalability',
                    description: 'Scale services based on demand',
                    color: 'from-green-500 to-emerald-500'
                  },
                  { 
                    icon: '🛡️', 
                    title: 'Fault Isolation',
                    description: 'Failures don\'t cascade',
                    color: 'from-purple-500 to-pink-500'
                  },
                  { 
                    icon: '🔧', 
                    title: 'Technology Diversity',
                    description: 'Choose the right tool for each job',
                    color: 'from-orange-500 to-red-500'
                  }
                ].map((benefit, i) => (
                  <motion.div
                    key={benefit.title}
                    className={`bg-gray-900/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50`}
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
                      className="text-4xl mb-4 text-center"
                      animate={{ rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    >
                      {benefit.icon}
                    </motion.div>
                    <h3 className={`text-lg font-bold mb-2 bg-gradient-to-r ${benefit.color} bg-clip-text text-transparent`}>
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-gray-400">{benefit.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
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

export default MicroservicesOverviewScene;