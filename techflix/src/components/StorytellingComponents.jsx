import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTextRevealStyle } from '../utils/animationHelpers';

// Cinematic Title Component - For dramatic scene introductions
export const CinematicTitle = ({ title, subtitle, time, startTime = 0 }) => {
  const titleStyle = getTextRevealStyle(time, startTime, 1);
  const subtitleStyle = getTextRevealStyle(time, startTime + 0.5, 1);
  
  return (
    <div className="text-center">
      <h1 
        className="text-6xl md:text-8xl font-black mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
        style={titleStyle}
      >
        {title}
      </h1>
      {subtitle && (
        <p 
          className="text-2xl md:text-3xl text-gray-300"
          style={subtitleStyle}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

// Code Demo Component - For showing code with animations
export const CodeDemo = ({ code, language = 'javascript', time, startTime = 0, highlights = [] }) => {
  const getTypewriterText = (fullText, currentTime, startTime, charsPerSecond = 30) => {
    if (currentTime < startTime) return '';
    const elapsed = currentTime - startTime;
    const charsToShow = Math.floor(elapsed * charsPerSecond);
    return fullText.substring(0, charsToShow);
  };
  
  const typedCode = getTypewriterText(code, time, startTime, 40);
  const currentHighlights = highlights.filter(h => time >= h.start && time <= h.end);
  
  return (
    <div className="code-block relative">
      <div className="absolute top-2 right-2 text-sm text-gray-500">{language}</div>
      <pre className="overflow-x-auto">
        <code className="text-sm md:text-base">
          {typedCode.split('\n').map((line, index) => {
            const isHighlighted = currentHighlights.some(h => h.lines.includes(index + 1));
            return (
              <div
                key={index}
                className={`transition-all duration-300 ${
                  isHighlighted ? 'bg-yellow-500/20 -mx-6 px-6' : ''
                }`}
              >
                {line}
              </div>
            );
          })}
        </code>
      </pre>
    </div>
  );
};

// Architecture Diagram Component - For technical system visualization
export const ArchitectureDiagram = ({ nodes, connections, time, startTime = 0 }) => {
  const getStaggeredDelay = (index, baseDelay = 0.1) => index * baseDelay;
  
  return (
    <div className="relative w-full h-full">
      <svg className="absolute inset-0 w-full h-full">
        {connections.map((connection, i) => (
          <motion.line
            key={i}
            x1={connection.x1}
            y1={connection.y1}
            x2={connection.x2}
            y2={connection.y2}
            className="data-flow-line"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: time > startTime + i * 0.2 ? 1 : 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        ))}
      </svg>
      
      {nodes.map((node, i) => (
        <motion.div
          key={node.id}
          className={`architecture-node absolute ${node.className || ''}`}
          style={{ 
            left: `${node.x}%`, 
            top: `${node.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: time > startTime + getStaggeredDelay(i) ? 1 : 0,
            opacity: time > startTime + getStaggeredDelay(i) ? 1 : 0
          }}
          transition={{ duration: 0.5, ease: "backOut" }}
        >
          <div className="text-lg font-bold">{node.icon} {node.label}</div>
          {node.description && (
            <div className="text-sm text-gray-400 mt-1">{node.description}</div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

// Metric Display Component - For showing impressive numbers
export const MetricDisplay = ({ metrics, time, startTime = 0 }) => {
  const getStaggeredDelay = (index, baseDelay = 0.1) => index * baseDelay;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, i) => (
        <motion.div
          key={i}
          className="metric-card"
          initial={{ y: 50, opacity: 0 }}
          animate={{ 
            y: time > startTime + getStaggeredDelay(i, 0.2) ? 0 : 50,
            opacity: time > startTime + getStaggeredDelay(i, 0.2) ? 1 : 0
          }}
        >
          <div className="text-sm text-gray-400 mb-2">{metric.label}</div>
          <div className="metric-value">
            {metric.prefix}{metric.value}{metric.suffix}
          </div>
          {metric.change && (
            <div className={`text-sm mt-2 ${metric.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {metric.change > 0 ? '↑' : '↓'} {Math.abs(metric.change)}%
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

// Timeline Component - For showing evolution/history
export const Timeline = ({ events, time, startTime = 0 }) => {
  return (
    <div className="relative">
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-blue-500" />
      
      {events.map((event, i) => {
        const eventTime = startTime + i * 0.5;
        const isActive = time >= eventTime;
        
        return (
          <motion.div
            key={i}
            className="relative flex items-center mb-12"
            initial={{ x: -50, opacity: 0 }}
            animate={{ 
              x: isActive ? 0 : -50,
              opacity: isActive ? 1 : 0
            }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div 
              className={`absolute left-4 w-8 h-8 rounded-full border-4 transition-all duration-300 ${
                isActive 
                  ? 'bg-purple-500 border-purple-500 scale-125' 
                  : 'bg-gray-800 border-gray-600'
              }`}
            />
            
            <div className="ml-20">
              <div className="text-sm text-gray-400">{event.date}</div>
              <div className="text-xl font-bold mb-1">{event.title}</div>
              <div className="text-gray-300">{event.description}</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// Comparison Component - For before/after or A/B comparisons
export const ComparisonView = ({ before, after, time, startTime = 0 }) => {
  const [showAfter, setShowAfter] = useState(false);
  
  useEffect(() => {
    if (time > startTime + 2) {
      setShowAfter(true);
    }
  }, [time, startTime]);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <motion.div
        className="relative"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute -top-4 -left-4 bg-red-600 text-white px-4 py-2 rounded font-bold">
          {before.label}
        </div>
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-lg p-6 border border-red-600/50">
          {before.content}
        </div>
      </motion.div>
      
      <AnimatePresence>
        {showAfter && (
          <motion.div
            className="relative"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute -top-4 -right-4 bg-green-600 text-white px-4 py-2 rounded font-bold">
              {after.label}
            </div>
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-lg p-6 border border-green-600/50">
              {after.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Interactive Quiz Component - For knowledge checks
export const InteractiveQuiz = ({ question, options, correctAnswer, onComplete }) => {
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  
  const handleSelect = (index) => {
    setSelected(index);
    setShowResult(true);
    
    setTimeout(() => {
      onComplete(index === correctAnswer);
    }, 2000);
  };
  
  return (
    <motion.div
      className="bg-gray-900/80 backdrop-blur-lg rounded-lg p-8"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <h3 className="text-2xl font-bold mb-6">{question}</h3>
      
      <div className="space-y-4">
        {options.map((option, i) => (
          <motion.button
            key={i}
            className={`w-full text-left p-4 rounded-lg transition-all ${
              selected === i
                ? i === correctAnswer
                  ? 'bg-green-600 text-white'
                  : 'bg-red-600 text-white'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
            onClick={() => handleSelect(i)}
            disabled={selected !== null}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
            {option}
          </motion.button>
        ))}
      </div>
      
      {showResult && (
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {selected === correctAnswer ? (
            <div className="text-green-500 text-xl">✓ Correct!</div>
          ) : (
            <div className="text-red-500 text-xl">✗ Try again next time!</div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

// Particle Background Component - For ambient visual effects
export const ParticleBackground = ({ particleCount = 50, colors }) => {
  const generateParticles = (count = 50, colors = ['#3b82f6', '#8b5cf6', '#10b981']) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5
    }));
  };
  
  const [particles] = useState(() => generateParticles(particleCount, colors));
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            animation: `floatParticle ${particle.duration}s ${particle.delay}s infinite linear`
          }}
        />
      ))}
    </div>
  );
};

// Scene Transition Component - For smooth scene changes
export const SceneTransition = ({ children, isActive }) => {
  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

