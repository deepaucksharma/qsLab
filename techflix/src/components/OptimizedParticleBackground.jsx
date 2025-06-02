import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * Optimized Particle Background Component
 * - Reduced particle count
 * - Uses CSS transforms instead of JS animations where possible
 * - Memoized particle generation
 * - GPU-accelerated animations
 */
const OptimizedParticleBackground = React.memo(({ 
  particleCount = 20, // Reduced from 40
  className = "",
  paused = false 
}) => {
  // Memoize particle generation to prevent recreation on every render
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 20,
      delay: Math.random() * 5
    }));
  }, [particleCount]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white/10"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            willChange: 'transform',
            transform: 'translateZ(0)', // Force GPU acceleration
          }}
          animate={paused ? {} : {
            y: [0, -100, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
});

OptimizedParticleBackground.displayName = 'OptimizedParticleBackground';

export default OptimizedParticleBackground;