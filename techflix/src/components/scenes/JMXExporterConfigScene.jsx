import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, FileCode, Gauge, Terminal, Settings, GitBranch } from 'lucide-react';
import {
  CinematicTitle,
  SceneTransition,
  ParticleBackground,
  CodeDemo
} from '../StorytellingComponents';
import {
  getTextRevealStyle,
  getTimeBasedValue,
  getCameraTransform
} from '../../utils/animationHelpers';
import { getStaggeredDelay } from '../../utils/storytellingHelpers';

const JMXExporterConfigScene = ({ time, duration }) => {
  // Scene phases
  const phases = {
    intro: { start: 0, duration: 3 },
    config: { start: 3, duration: 6 },
    explanation: { start: 9, duration: 4 },
    deployment: { start: 13, duration: 4 },
    conclusion: { start: 17, duration: 3 }
  };
  
  const progress = (time / duration) * 100;
  const [typedLines, setTypedLines] = useState(0);
  const [highlightedSection, setHighlightedSection] = useState(null);
  
  const fullConfig = `---
hostPort: localhost:9999
lowercaseOutputName: true

rules:
  # Share Groups Metrics - The New Frontier
  - pattern: "kafka.server<type=sharegroup,(.+)><>RecordsUnacked"
    name: kafka_sharegroup_records_unacked
    labels:
      group: "$1"
    help: "Number of unacknowledged records in share group"
    type: GAUGE

  - pattern: "kafka.server<type=sharegroup,(.+)><>OldestUnackedMessageAgeMs"
    name: kafka_sharegroup_oldest_unacked_ms
    labels:
      group: "$1"
    help: "Age of oldest unacknowledged message in milliseconds"
    type: GAUGE

  # Traditional Topic Metrics
  - pattern: "kafka.server<type=BrokerTopicMetrics,topic=(.+)><>MessagesInPerSec"
    name: kafka_topic_messages_in_rate
    labels:
      topic: "$1"
    help: "Incoming message rate per topic"
    type: GAUGE`;
  
  // Update typed lines based on time
  useEffect(() => {
    if (time >= phases.config.start) {
      const totalLines = fullConfig.split('\n').length;
      const visibleLines = Math.floor((time - phases.config.start) / 5 * totalLines);
      setTypedLines(Math.min(visibleLines, totalLines));
    }
  }, [time, phases.config.start]);
  
  // Highlight sections based on time
  useEffect(() => {
    if (time >= phases.explanation.start && time < phases.explanation.start + 2) {
      setHighlightedSection('sharegroup');
    } else if (time >= phases.explanation.start + 2 && time < phases.explanation.start + 4) {
      setHighlightedSection('pattern');
    } else {
      setHighlightedSection(null);
    }
  }, [time, phases.explanation.start]);
  
  // Camera movements
  const cameraMovements = [
    { start: 0, end: 3, fromX: 0, toX: 0, fromY: -20, toY: 0, fromScale: 0.9, toScale: 1 },
    { start: 9, end: 11, fromX: 0, toX: 0, fromY: 0, toY: 0, fromScale: 1, toScale: 1.1 },
    { start: 13, end: 15, fromX: 0, toX: 0, fromY: 0, toY: 0, fromScale: 1.1, toScale: 1 }
  ];
  
  const cameraTransform = getCameraTransform(time, cameraMovements);
  
  // Pattern explanation cards
  const patternExplanations = [
    {
      icon: GitBranch,
      title: 'Pattern Matching',
      description: 'JMX ObjectName patterns capture metric dimensions as labels',
      example: 'type=sharegroup,group=payments-processor',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Gauge,
      title: 'Metric Types',
      description: 'GAUGE for current values, COUNTER for cumulative metrics',
      example: 'RecordsUnacked: GAUGE (can go up/down)',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Settings,
      title: 'Label Extraction',
      description: 'Capture groups ($1, $2) become Prometheus labels',
      example: 'group: "$1" → {group="payments-processor"}',
      color: 'from-green-500 to-emerald-500'
    }
  ];
  
  // Deployment command
  const deploymentCommand = `# Start Kafka with JMX Exporter
java -javaagent:./jmx_prometheus_javaagent-0.19.0.jar=9404:jmx_exporter.yml \
     -Dcom.sun.management.jmxremote \
     -Dcom.sun.management.jmxremote.port=9999 \
     -jar kafka.jar`;
  
  return (
    <div className="scene-container">
      {/* Dynamic Background */}
      <motion.div 
        className="absolute inset-0"
        animate={{ 
          background: [
            'radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(251, 146, 60, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 80%, rgba(249, 115, 22, 0.3) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
      />
      
      {/* Code Matrix Background */}
      <div className="absolute inset-0 opacity-5 overflow-hidden">
        <motion.div 
          className="font-mono text-xs text-yellow-500 leading-relaxed whitespace-pre"
          animate={{ y: [-100, -2000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {Array(100).fill(null).map((_, i) => (
            <div key={i}>{'kafka.server<type=sharegroup,group=sg-' + i + '><>RecordsUnacked: ' + Math.floor(Math.random() * 1000)}</div>
          ))}
        </motion.div>
      </div>
      
      {/* Particles */}
      <ParticleBackground 
        particleCount={40} 
        colors={['#fbbf24', '#fb923c', '#f97316', '#ea580c']} 
      />
      
      {/* Content with camera transform */}
      <div 
        className="relative z-10 h-full flex items-center justify-center p-8"
        style={{ transform: cameraTransform }}
      >
        <div className="w-full max-w-7xl">
          
          {/* Phase 1: Introduction */}
          <SceneTransition isActive={time >= phases.intro.start && time < phases.config.start}>
            <CinematicTitle
              title="JMX Exporter Configuration"
              subtitle="Bridging JMX to Prometheus"
              time={time}
              startTime={phases.intro.start}
            />
          </SceneTransition>
          
          {/* Phase 2: Configuration */}
          <SceneTransition isActive={time >= phases.config.start && time < phases.explanation.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center mb-8"
                style={getTextRevealStyle(time, phases.config.start, 1)}
              >
                Mapping Share Group Metrics
              </motion.h2>
              
              {/* Code Editor */}
              <motion.div
                className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border border-yellow-500/30 overflow-hidden"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                whileHover={{ borderColor: 'rgb(251 191 36 / 0.5)' }}
              >
                {/* Editor Header */}
                <div className="bg-gray-800 px-6 py-3 flex items-center justify-between border-b border-gray-700">
                  <div className="flex items-center space-x-2">
                    <motion.div 
                      className="w-3 h-3 rounded-full bg-red-500"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-400 font-mono">jmx_exporter.yml</span>
                  </div>
                </div>
                
                {/* Editor Content */}
                <div className="p-6 font-mono text-sm overflow-auto max-h-[500px]">
                  {fullConfig.split('\n').map((line, idx) => {
                    const isVisible = idx < typedLines;
                    const isComment = line.trim().startsWith('#');
                    const isShareGroup = line.includes('sharegroup');
                    const isHighlighted = 
                      (highlightedSection === 'sharegroup' && isShareGroup) ||
                      (highlightedSection === 'pattern' && line.includes('pattern:'));
                    
                    return (
                      <motion.div 
                        key={idx} 
                        className={`leading-relaxed ${isHighlighted ? 'bg-yellow-500/20 -mx-2 px-2 rounded' : ''}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ 
                          opacity: isVisible ? 1 : 0,
                          x: isVisible ? 0 : -20
                        }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                      >
                        <span className={
                          isComment ? 'text-gray-500 italic' :
                          line.includes('pattern:') ? 'text-purple-400 font-bold' :
                          line.includes('name:') ? 'text-blue-400 font-bold' :
                          line.includes('type:') ? 'text-green-400 font-bold' :
                          line.includes('"') ? 'text-yellow-300' :
                          isShareGroup ? 'text-orange-400' :
                          'text-gray-300'
                        }>
                          {line || '\u00A0'}
                        </span>
                      </motion.div>
                    );
                  })}
                  {typedLines < fullConfig.split('\n').length && (
                    <motion.span 
                      className="text-yellow-500"
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      |
                    </motion.span>
                  )}
                </div>
              </motion.div>
            </div>
          </SceneTransition>
          
          {/* Phase 3: Explanation */}
          <SceneTransition isActive={time >= phases.explanation.start && time < phases.deployment.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center mb-12"
                style={getTextRevealStyle(time, phases.explanation.start, 1)}
              >
                Understanding the Magic
              </motion.h2>
              
              <div className="grid grid-cols-3 gap-6">
                {patternExplanations.map((item, idx) => {
                  const Icon = item.icon;
                  
                  return (
                    <motion.div
                      key={item.title}
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
                        borderColor: 'rgb(251 191 36 / 0.5)'
                      }}
                    >
                      <motion.div
                        className={`w-16 h-16 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center mb-4`}
                        whileHover={{ rotate: 360 }}
                        transition={{ type: "spring", damping: 10 }}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </motion.div>
                      
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-gray-400 mb-4">{item.description}</p>
                      
                      <motion.div
                        className="bg-black/40 rounded-lg p-3 font-mono text-xs"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                      >
                        <span className="text-yellow-400">{item.example}</span>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
              
              {/* Visual flow diagram */}
              <motion.div
                className="mt-8 p-6 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-2xl border border-yellow-500/20"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center justify-center gap-4 text-lg">
                  <span className="font-mono text-orange-300">JMX MBean</span>
                  <motion.span 
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                  <span className="font-mono text-yellow-300">Pattern Match</span>
                  <motion.span 
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  >
                    →
                  </motion.span>
                  <span className="font-mono text-green-300">Prometheus Metric</span>
                </div>
              </motion.div>
            </div>
          </SceneTransition>
          
          {/* Phase 4: Deployment */}
          <SceneTransition isActive={time >= phases.deployment.start && time < phases.conclusion.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center mb-8"
                style={getTextRevealStyle(time, phases.deployment.start, 1)}
              >
                Deploy with Confidence
              </motion.h2>
              
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                <CodeDemo
                  code={deploymentCommand}
                  language="bash"
                  time={time}
                  startTime={phases.deployment.start}
                />
              </motion.div>
              
              {/* Deployment steps */}
              <div className="grid grid-cols-2 gap-6 mt-8">
                <motion.div
                  className="bg-gray-900/60 backdrop-blur-lg rounded-xl p-6 border border-green-500/30"
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02, borderColor: 'rgb(34 197 94 / 0.5)' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Terminal className="w-5 h-5 text-green-400" />
                    </div>
                    <h3 className="text-lg font-bold text-green-400">Port 9404</h3>
                  </div>
                  <p className="text-gray-400">JMX Exporter exposes Prometheus metrics here</p>
                </motion.div>
                
                <motion.div
                  className="bg-gray-900/60 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.02, borderColor: 'rgb(59 130 246 / 0.5)' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Code2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-blue-400">Port 9999</h3>
                  </div>
                  <p className="text-gray-400">JMX Remote connection for debugging</p>
                </motion.div>
              </div>
              
              {/* Success indicator */}
              <motion.div
                className="text-center mt-8"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring", damping: 10 }}
              >
                <div className="inline-flex items-center gap-3 bg-green-500/20 rounded-full px-6 py-3 border border-green-500/30">
                  <motion.div
                    className="w-2 h-2 bg-green-500 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-green-400 font-semibold">Metrics now available at localhost:9404/metrics</span>
                </div>
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
              <h2 className="text-6xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Configuration Complete!
              </h2>
              <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
                Your Share Group metrics are now ready for Prometheus collection
              </p>
              
              <motion.div
                className="inline-flex items-center gap-3"
                animate={{ 
                  y: [0, -10, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FileCode className="w-8 h-8 text-yellow-400" />
                <span className="text-3xl font-bold text-yellow-400">JMX → Prometheus Pipeline Active</span>
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
            background: 'linear-gradient(to right, #fbbf24, #f97316)'
          }}
        />
      </div>
    </div>
  );
};

export default JMXExporterConfigScene;