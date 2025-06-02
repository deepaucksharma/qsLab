import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderTree, ChevronRight, ChevronDown, Database, Activity, Settings, Crown, Network } from 'lucide-react';
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

const MBeanNavigatorScene = ({ time, duration }) => {
  // Scene phases
  const phases = {
    intro: { start: 0, duration: 3 },
    exploration: { start: 3, duration: 5 },
    sharegroups: { start: 8, duration: 4 },
    insights: { start: 12, duration: 4 },
    conclusion: { start: 16, duration: 4 }
  };
  
  const progress = (time / duration) * 100;
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState(null);
  
  // Auto-expand nodes based on time
  useEffect(() => {
    if (time >= phases.exploration.start) {
      setExpandedNodes(prev => new Set([...prev, 'kafka.server']));
    }
    if (time >= phases.sharegroups.start) {
      setExpandedNodes(prev => new Set([...prev, 'kafka.server:type=sharegroup']));
    }
    if (time >= phases.sharegroups.start + 2) {
      setExpandedNodes(prev => new Set([...prev, 'kafka.network']));
    }
  }, [time, phases]);
  
  // Camera movements
  const cameraMovements = [
    { start: 0, end: 3, fromX: 0, toX: 0, fromY: -30, toY: 0, fromScale: 0.9, toScale: 1 },
    { start: 8, end: 10, fromX: 0, toX: 0, fromY: 0, toY: 0, fromScale: 1, toScale: 1.15 },
    { start: 12, end: 14, fromX: 0, toX: 0, fromY: 0, toY: 0, fromScale: 1.15, toScale: 1 }
  ];
  
  const cameraTransform = getCameraTransform(time, cameraMovements);
  
  // MBean tree structure
  const mbeanTree = {
    'kafka.server': {
      icon: Database,
      color: 'from-blue-500 to-cyan-500',
      children: {
        'type=BrokerTopicMetrics': {
          icon: Activity,
          color: 'from-green-500 to-emerald-500',
          metrics: [
            { name: 'MessagesInPerSec', value: '125,450', unit: 'msg/s' },
            { name: 'BytesInPerSec', value: '1.2GB', unit: '/s' },
            { name: 'BytesOutPerSec', value: '1.1GB', unit: '/s' }
          ]
        },
        'type=sharegroup': {
          icon: Network,
          color: 'from-purple-500 to-pink-500',
          metrics: [
            { name: 'RecordsUnacked', value: '245', unit: 'records', critical: true },
            { name: 'OldestUnackedMessageAgeMs', value: '2,156', unit: 'ms' },
            { name: 'ShareGroupCount', value: '12', unit: 'groups' }
          ],
          highlight: true,
          new: true
        },
        'type=KafkaRequestHandlerPool': {
          icon: Settings,
          color: 'from-orange-500 to-red-500',
          metrics: [
            { name: 'RequestHandlerAvgIdlePercent', value: '87.5', unit: '%' }
          ]
        }
      }
    },
    'kafka.network': {
      icon: Network,
      color: 'from-indigo-500 to-purple-500',
      children: {
        'type=RequestMetrics': {
          icon: Activity,
          color: 'from-yellow-500 to-orange-500',
          metrics: [
            { name: 'RequestsPerSec', value: '45,200', unit: 'req/s' },
            { name: 'TotalTimeMs', value: '12.4', unit: 'ms' },
            { name: 'ResponseQueueTimeMs', value: '0.8', unit: 'ms' }
          ]
        }
      }
    },
    'kafka.controller': {
      icon: Crown,
      color: 'from-pink-500 to-rose-500',
      children: {
        'type=KafkaController': {
          icon: Settings,
          color: 'from-amber-500 to-yellow-500',
          metrics: [
            { name: 'ActiveControllerCount', value: '1', unit: '' },
            { name: 'OfflinePartitionsCount', value: '0', unit: '' }
          ]
        }
      }
    }
  };
  
  const toggleNode = (nodePath) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodePath)) {
      newExpanded.delete(nodePath);
    } else {
      newExpanded.add(nodePath);
    }
    setExpandedNodes(newExpanded);
  };
  
  // Tree Node Component
  const TreeNode = ({ nodeKey, nodeData, path = '', level = 0, index = 0 }) => {
    const currentPath = path ? `${path}:${nodeKey}` : nodeKey;
    const isExpanded = expandedNodes.has(currentPath);
    const hasChildren = nodeData.children && Object.keys(nodeData.children).length > 0;
    const Icon = nodeData.icon;
    const isVisible = time >= phases.exploration.start + level * 1.5 + index * 0.3;
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ 
          opacity: isVisible ? 1 : 0,
          x: isVisible ? 0 : -50
        }}
        transition={{ duration: 0.5, delay: level * 0.2 + index * 0.1 }}
      >
        <motion.div
          className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300 ${
            nodeData.highlight ? 'bg-purple-900/30 border-2 border-purple-500/50' : 'bg-gray-900/40 border border-gray-700/30'
          }`}
          style={{ marginLeft: `${level * 32}px` }}
          onClick={() => hasChildren && toggleNode(currentPath)}
          onMouseEnter={() => setHoveredNode(currentPath)}
          onMouseLeave={() => setHoveredNode(null)}
          whileHover={{ scale: 1.02, borderColor: nodeData.highlight ? 'rgb(168 85 247 / 0.8)' : 'rgb(107 114 128 / 0.5)' }}
          animate={hoveredNode === currentPath ? {
            boxShadow: '0 0 30px rgba(168, 85, 247, 0.3)'
          } : {}}
        >
          {/* Expand/Collapse Arrow */}
          {hasChildren && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.3 }}
              className="mr-3"
            >
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </motion.div>
          )}
          
          {/* Icon */}
          <motion.div
            className={`w-10 h-10 rounded-lg bg-gradient-to-r ${nodeData.color} flex items-center justify-center mr-4`}
            animate={nodeData.highlight ? { rotate: [0, -5, 5, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Icon className="w-5 h-5 text-white" />
          </motion.div>
          
          {/* Node Name */}
          <span className="font-mono text-sm text-gray-300 flex-1">{nodeKey}</span>
          
          {/* Badges */}
          {nodeData.new && (
            <motion.span 
              className="ml-2 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-xs rounded-full font-bold text-white"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              NEW IN 4.0
            </motion.span>
          )}
          
          {/* Live Indicator */}
          {isExpanded && (
            <motion.div
              className="ml-3 w-2 h-2 bg-green-500 rounded-full"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>
        
        {/* Metrics */}
        <AnimatePresence>
          {nodeData.metrics && isExpanded && (
            <motion.div
              className="mt-3 space-y-2"
              style={{ marginLeft: `${(level + 1) * 32}px` }}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {nodeData.metrics.map((metric, idx) => (
                <motion.div
                  key={metric.name}
                  className={`flex items-center justify-between p-3 bg-black/30 rounded-lg border ${
                    metric.critical ? 'border-red-500/50' : 'border-gray-700/30'
                  }`}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedMetric(metric)}
                  whileHover={{ 
                    scale: 1.02,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    borderColor: metric.critical ? 'rgb(239 68 68 / 0.8)' : 'rgb(99 102 241 / 0.5)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      className={`w-2 h-2 rounded-full ${metric.critical ? 'bg-red-500' : 'bg-blue-500'}`}
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className="font-mono text-xs text-gray-400">{metric.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.span 
                      className={`font-mono text-sm font-bold ${
                        metric.critical ? 'text-red-400' : 'text-green-400'
                      }`}
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {metric.value}
                    </motion.span>
                    <span className="text-xs text-gray-500">{metric.unit}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-3">
            {Object.entries(nodeData.children).map(([childKey, childData], childIdx) => (
              <TreeNode
                key={childKey}
                nodeKey={childKey}
                nodeData={childData}
                path={currentPath}
                level={level + 1}
                index={childIdx}
              />
            ))}
          </div>
        )}
      </motion.div>
    );
  };
  
  return (
    <div className="scene-container">
      {/* Dynamic Background */}
      <motion.div 
        className="absolute inset-0"
        animate={{ 
          background: [
            'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 80%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
      />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(168, 85, 247, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 85, 247, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      {/* Particles */}
      <ParticleBackground 
        particleCount={50} 
        colors={['#a855f7', '#ec4899', '#6366f1', '#f59e0b']} 
      />
      
      {/* Content with camera transform */}
      <div 
        className="relative z-10 h-full flex items-center justify-center p-8"
        style={{ transform: cameraTransform }}
      >
        <div className="w-full max-w-7xl">
          
          {/* Phase 1: Introduction */}
          <SceneTransition isActive={time >= phases.intro.start && time < phases.exploration.start}>
            <CinematicTitle
              title="MBean Tree Explorer"
              subtitle="Navigate Kafka's Metrics Hierarchy"
              time={time}
              startTime={phases.intro.start}
            />
          </SceneTransition>
          
          {/* Phase 2: Exploration */}
          <SceneTransition isActive={time >= phases.exploration.start && time < phases.sharegroups.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center mb-8"
                style={getTextRevealStyle(time, phases.exploration.start, 1)}
              >
                Discovering the MBean Forest
              </motion.h2>
              
              {/* Tree Container */}
              <motion.div
                className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 max-h-[600px] overflow-y-auto"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                {Object.entries(mbeanTree).map(([key, data], idx) => (
                  <TreeNode
                    key={key}
                    nodeKey={key}
                    nodeData={data}
                    index={idx}
                  />
                ))}
              </motion.div>
            </div>
          </SceneTransition>
          
          {/* Phase 3: Share Groups Focus */}
          <SceneTransition isActive={time >= phases.sharegroups.start && time < phases.insights.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 10 }}
              >
                Share Groups: The Game Changer
              </motion.h2>
              
              {/* Focused Tree View */}
              <motion.div
                className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 border-2 border-purple-500/50 max-h-[600px] overflow-y-auto"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                whileHover={{ borderColor: 'rgb(168 85 247 / 0.8)' }}
              >
                {Object.entries(mbeanTree).map(([key, data], idx) => (
                  <TreeNode
                    key={key}
                    nodeKey={key}
                    nodeData={data}
                    index={idx}
                  />
                ))}
              </motion.div>
              
              {/* Spotlight on Share Groups */}
              <motion.div
                className="mt-6 p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl border border-purple-500/30"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-xl text-purple-300 text-center">
                  <span className="font-bold">RecordsUnacked</span> is your new north star metric for consumer health
                </p>
              </motion.div>
            </div>
          </SceneTransition>
          
          {/* Phase 4: Insights */}
          <SceneTransition isActive={time >= phases.insights.start && time < phases.conclusion.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center mb-12"
                style={getTextRevealStyle(time, phases.insights.start, 1)}
              >
                Key Navigation Insights
              </motion.h2>
              
              <div className="grid grid-cols-3 gap-6">
                {[
                  { 
                    icon: FolderTree, 
                    title: 'Hierarchical Structure',
                    description: 'MBeans organized by domain and type for easy discovery',
                    color: 'from-blue-500 to-cyan-500'
                  },
                  { 
                    icon: Activity, 
                    title: 'Real-time Values',
                    description: 'Live metrics update as your cluster operates',
                    color: 'from-green-500 to-emerald-500'
                  },
                  { 
                    icon: Database, 
                    title: 'Comprehensive Coverage',
                    description: 'Every aspect of Kafka exposed through JMX',
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
                        borderColor: 'rgb(168 85 247 / 0.5)'
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
                      <p className="text-gray-400">{insight.description}</p>
                    </motion.div>
                  );
                })}
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
              <h2 className="text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                Master Your Metrics
              </h2>
              <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
                Navigate the MBean tree to unlock deep insights into your Kafka cluster
              </p>
              
              <motion.div
                className="inline-flex items-center gap-3"
                animate={{ 
                  y: [0, -10, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FolderTree className="w-8 h-8 text-purple-400" />
                <span className="text-3xl font-bold text-purple-400">Explore → Monitor → Optimize</span>
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

export default MBeanNavigatorScene;