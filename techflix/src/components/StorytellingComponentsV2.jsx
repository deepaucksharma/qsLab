import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Clean Title Component - No distracting gradients
export const CinematicTitle = ({ title, subtitle, delay = 0 }) => {
  return (
    <motion.div 
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
    >
      <h1 className="scene-title mb-4">
        {title}
      </h1>
      {subtitle && (
        <p className="scene-subtitle">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

// Clean Code Display - No typewriter effects
export const CodeDemo = ({ code, language = 'javascript', highlighted = [] }) => {
  return (
    <motion.div 
      className="code-block"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-sm text-gray-500 mb-2">{language}</div>
      <pre className="overflow-x-auto">
        <code className="text-sm md:text-base">
          {code.split('\n').map((line, index) => (
            <div
              key={index}
              className={highlighted.includes(index + 1) ? 'bg-yellow-500/20' : ''}
            >
              {line}
            </div>
          ))}
        </code>
      </pre>
    </motion.div>
  );
};

// Clean Architecture Node
export const ArchitectureNode = ({ 
  id, 
  label, 
  icon, 
  x, 
  y, 
  color = 'blue',
  delay = 0 
}) => {
  const colorClasses = {
    blue: 'border-blue-500 text-blue-400',
    green: 'border-green-500 text-green-400',
    purple: 'border-purple-500 text-purple-400',
    red: 'border-red-500 text-red-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className={`architecture-node ${colorClasses[color]}`}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {icon && <span className="text-2xl mb-1">{icon}</span>}
      <span className="font-medium">{label}</span>
    </motion.div>
  );
};

// Clean Metric Card
export const MetricCard = ({ label, value, suffix = '', change, delay = 0 }) => {
  const isPositive = change > 0;
  
  return (
    <motion.div
      className="metric-card-v2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="metric-value">
        {value}{suffix}
      </div>
      <div className="metric-label">
        {label}
      </div>
      {change !== undefined && (
        <div className={`text-sm mt-2 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '↑' : '↓'} {Math.abs(change)}%
        </div>
      )}
    </motion.div>
  );
};

// Scene Transition - Simple fade
export const SceneTransition = ({ children, isActive }) => {
  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Clean Data Flow Visualization
export const DataFlow = ({ 
  from, 
  to, 
  label, 
  color = '#3b82f6',
  duration = 2 
}) => {
  return (
    <motion.div
      className="data-packet"
      style={{ backgroundColor: color }}
      initial={{ 
        left: `${from.x}%`, 
        top: `${from.y}%`,
        opacity: 0 
      }}
      animate={{
        left: `${to.x}%`,
        top: `${to.y}%`,
        opacity: [0, 1, 1, 0]
      }}
      transition={{
        duration,
        ease: "linear",
        repeat: Infinity
      }}
    />
  );
};

// Progress Indicator - Clean and simple
export const ProgressIndicator = ({ progress, label }) => {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between text-sm text-gray-400 mb-2">
        <span>{label}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

// Clean Section Divider
export const SectionDivider = ({ delay = 0 }) => {
  return (
    <motion.div
      className="w-full max-w-2xl mx-auto my-12"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.8, delay }}
    >
      <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
    </motion.div>
  );
};

// Empty Background Component - For compatibility
export const ParticleBackground = () => null;

// Export all components
export default {
  CinematicTitle,
  CodeDemo,
  ArchitectureNode,
  MetricCard,
  SceneTransition,
  DataFlow,
  ProgressIndicator,
  SectionDivider,
  ParticleBackground
};