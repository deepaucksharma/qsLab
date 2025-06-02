import React from 'react';
import { motion } from 'framer-motion';

const ResiliencePatternScene = ({ time, duration }) => {
  const progress = time / duration;

  const patterns = [
    { name: 'Circuit Breaker', icon: '🔌', description: 'Prevents cascading failures' },
    { name: 'Retry & Backoff', icon: '🔄', description: 'Handles transient failures' },
    { name: 'Bulkhead', icon: '🛡️', description: 'Isolates critical resources' },
    { name: 'Timeout', icon: '⏱️', description: 'Prevents resource exhaustion' }
  ];

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="max-w-6xl w-full p-8">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: progress > 0.05 ? 1 : 0, y: progress > 0.05 ? 0 : -50 }}
          className="text-6xl font-bold text-white text-center mb-4"
        >
          Resilience Patterns
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: progress > 0.1 ? 1 : 0 }}
          className="text-xl text-gray-300 text-center mb-12"
        >
          Build fault-tolerant microservices that survive in production
        </motion.p>

        <div className="grid grid-cols-2 gap-8">
          {patterns.map((pattern, index) => (
            <motion.div
              key={pattern.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: progress > 0.2 + index * 0.15 ? 1 : 0,
                scale: progress > 0.2 + index * 0.15 ? 1 : 0.8
              }}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800 p-8 rounded-lg border border-gray-700 hover:border-[#e50914] transition-all"
            >
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-4">{pattern.icon}</span>
                <h3 className="text-2xl font-semibold text-white">{pattern.name}</h3>
              </div>
              <p className="text-gray-400 text-lg">{pattern.description}</p>
              
              {progress > 0.4 + index * 0.1 && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  className="mt-4 pt-4 border-t border-gray-700"
                >
                  <code className="text-sm text-green-400 font-mono">
                    {pattern.name === 'Circuit Breaker' && '@CircuitBreaker(failureThreshold = 0.5)'}
                    {pattern.name === 'Retry & Backoff' && '@Retry(maxAttempts = 3, backoff = @Backoff(delay = 1000))'}
                    {pattern.name === 'Bulkhead' && '@Bulkhead(maxConcurrentCalls = 10)'}
                    {pattern.name === 'Timeout' && '@Timeout(value = 5, unit = TimeUnit.SECONDS)'}
                  </code>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {progress > 0.8 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 text-center"
          >
            <p className="text-2xl text-[#e50914] font-semibold">
              "Failure is not an option, it's a certainty. Plan for it."
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ResiliencePatternScene;