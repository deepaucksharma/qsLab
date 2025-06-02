import React, { useState, useEffect } from 'react';

const MetricSpotlightScene = ({ time, duration }) => {
  const [recordsUnacked, setRecordsUnacked] = useState(0);
  const [oldestUnackedAge, setOldestUnackedAge] = useState(0);
  const progress = (time / duration) * 100;

  const metrics = [
    {
      name: 'RecordsUnacked',
      icon: '📊',
      target: 120,
      unit: 'records',
      description: 'Messages awaiting acknowledgment',
      color: 'from-orange-600 to-red-600',
      bgGlow: 'rgba(251, 146, 60, 0.3)'
    },
    {
      name: 'OldestUnackedMessageAgeMs',
      icon: '⏱️',
      target: 5000,
      unit: 'ms',
      description: 'Time since oldest unprocessed message',
      color: 'from-blue-600 to-purple-600',
      bgGlow: 'rgba(147, 51, 234, 0.3)'
    }
  ];

  // Animate metric values
  useEffect(() => {
    if (time > 2) {
      const animationProgress = Math.min((time - 2) / 4, 1);
      const easeProgress = 1 - Math.pow(1 - animationProgress, 3);
      
      setRecordsUnacked(Math.floor(metrics[0].target * easeProgress));
      setOldestUnackedAge(Math.floor(metrics[1].target * easeProgress));
    }
  }, [time]);

  const getCardOpacity = (index) => {
    const delay = 1 + index * 1.5;
    return time > delay ? 1 : 0;
  };

  const getCardScale = (index) => {
    const delay = 1 + index * 1.5;
    if (time <= delay) return 0.8;
    const elapsed = time - delay;
    if (elapsed < 0.5) return 0.8 + (elapsed / 0.5) * 0.2;
    return 1;
  };

  const currentValues = [recordsUnacked, oldestUnackedAge];

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-purple-900 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full blur-3xl opacity-20"
            style={{
              width: `${300 + i * 100}px`,
              height: `${300 + i * 100}px`,
              background: `radial-gradient(circle, ${i % 2 ? '#9333ea' : '#f97316'} 0%, transparent 70%)`,
              left: `${20 + i * 30}%`,
              top: `${10 + i * 20}%`,
              animation: `float ${15 + i * 5}s ease-in-out infinite`,
              animationDelay: `${i * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl w-full">
        {/* Title */}
        <div className="text-center mb-16" style={{ opacity: Math.min(time * 0.5, 1) }}>
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
            Critical Share Groups Metrics
          </h1>
          <p className="text-2xl text-gray-300">Monitor What Matters Most</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-8">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="relative"
              style={{
                opacity: getCardOpacity(index),
                transform: `scale(${getCardScale(index)})`,
                transition: 'all 0.5s ease-out'
              }}
            >
              {/* Glow Effect */}
              <div
                className="absolute inset-0 rounded-3xl blur-2xl"
                style={{ background: metric.bgGlow }}
              />
              
              {/* Card */}
              <div className="relative bg-gray-900/90 backdrop-blur-lg rounded-3xl p-10 border border-gray-700/50 hover:border-gray-600 transition-all duration-300">
                {/* Icon */}
                <div className="text-6xl mb-6">{metric.icon}</div>
                
                {/* Metric Name */}
                <h3 className="text-2xl font-bold mb-2 text-gray-200">{metric.name}</h3>
                
                {/* Description */}
                <p className="text-gray-400 mb-6">{metric.description}</p>
                
                {/* Value Display */}
                <div className={`text-6xl font-black mb-4 bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
                  {currentValues[index].toLocaleString()}
                  <span className="text-3xl ml-2 text-gray-400">{metric.unit}</span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${metric.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${(currentValues[index] / metric.target) * 100}%` }}
                  />
                </div>
                
                {/* Threshold Indicator */}
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-gray-500">0</span>
                  <span className="text-gray-400">Target: {metric.target}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Alert Message */}
        {time > 8 && (
          <div 
            className="mt-12 p-6 bg-red-900/20 border border-red-500/30 rounded-xl backdrop-blur-lg"
            style={{
              opacity: Math.min((time - 8) * 0.5, 1),
              transform: `translateY(${Math.max(0, 30 - (time - 8) * 15)}px)`
            }}
          >
            <p className="text-xl text-center text-red-300">
              <span className="text-2xl mr-2">⚠️</span>
              High unacked records indicate consumer processing bottlenecks
            </p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-96">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-600 to-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(10px) translateX(-5px);
          }
          75% {
            transform: translateY(-10px) translateX(-10px);
          }
        }
      `}</style>
    </div>
  );
};

export default MetricSpotlightScene;