import React, { useState, useEffect } from 'react';

const BottleneckDemoScene = ({ time, duration }) => {
  const [showBottleneck, setShowBottleneck] = useState(false);
  const [consumersActive, setConsumersActive] = useState(0);
  const progress = (time / duration) * 100;

  useEffect(() => {
    if (time > 3) setShowBottleneck(true);
    if (time > 5) setConsumersActive(Math.min(Math.floor((time - 5) / 2), 4));
  }, [time]);

  const getCardOpacity = (delay) => time > delay ? 1 : 0;
  const getCardTransform = (delay) => time > delay ? 'translateX(0)' : 'translateX(-50px)';

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-850 to-black flex items-center justify-center p-8">
      <div className="w-full max-w-7xl">
        {/* Title */}
        <div className="text-center mb-12" style={{ opacity: Math.min(time * 0.5, 1) }}>
          <h1 className="text-5xl font-black mb-4 text-white">
            The Scalability Bottleneck
          </h1>
          <p className="text-2xl text-gray-400">When One-to-One Becomes a Limitation</p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-2 gap-16">
          {/* Traditional Consumer Groups */}
          <div 
            className="bg-gray-900/80 backdrop-blur-lg rounded-3xl p-8 border border-red-600/20"
            style={{
              opacity: getCardOpacity(1),
              transform: getCardTransform(1),
              transition: 'all 0.8s ease-out'
            }}
          >
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <span className="text-3xl mr-3">⚠️</span>
                <h3 className="text-2xl font-bold text-red-500">Traditional Consumer Groups</h3>
              </div>
            </div>

            {/* Partition visualization */}
            <div className="space-y-8">
              <div className="bg-blue-600/20 rounded-2xl p-6 border border-blue-600/50">
                <div className="text-center">
                  <span className="text-3xl">🗄️</span>
                  <p className="mt-2 font-semibold">Partition 1</p>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="text-4xl text-gray-600 animate-pulse">↓</div>
              </div>

              <div className="bg-gray-700/50 rounded-2xl p-6 border border-gray-600">
                <div className="text-center">
                  <span className="text-3xl">👤</span>
                  <p className="mt-2 font-semibold">Consumer 1</p>
                  <p className="text-sm text-gray-500 mt-1">Processing all messages</p>
                </div>
              </div>

              {/* Bottleneck Alert */}
              {showBottleneck && (
                <div 
                  className="bg-red-900/20 rounded-2xl p-6 border border-red-600/50"
                  style={{
                    opacity: Math.min((time - 3) * 0.5, 1),
                    transform: `scale(${Math.min(1, 0.8 + (time - 3) * 0.1)})`
                  }}
                >
                  <div className="flex items-center justify-center mb-3">
                    <span className="text-2xl mr-2">🚦</span>
                    <div className="font-bold text-red-400 text-xl">Bottleneck Detected!</div>
                  </div>
                  <div className="text-red-300 space-y-2 text-sm">
                    <p>• Fast messages wait behind slow ones</p>
                    <p>• Underutilized consumer resources</p>
                    <p>• Poor horizontal scaling</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Share Groups Solution */}
          <div 
            className="bg-gray-900/80 backdrop-blur-lg rounded-3xl p-8 border border-green-600/20"
            style={{
              opacity: getCardOpacity(2),
              transform: getCardTransform(2),
              transition: 'all 0.8s ease-out 0.3s'
            }}
          >
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <span className="text-3xl mr-3">🚀</span>
                <h3 className="text-2xl font-bold text-green-500">Share Groups Solution</h3>
              </div>
            </div>

            {/* Partition with multiple consumers */}
            <div className="space-y-8">
              <div className="bg-blue-600/20 rounded-2xl p-6 border border-blue-600/50">
                <div className="text-center">
                  <span className="text-3xl">🗄️</span>
                  <p className="mt-2 font-semibold">Partition 1</p>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="text-4xl text-green-500 animate-pulse">⬇️</div>
              </div>

              {/* Multiple Consumers */}
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((num) => (
                  <div 
                    key={num}
                    className="bg-green-600/20 rounded-xl p-4 border border-green-600/50 transform hover:scale-105 transition-transform"
                    style={{
                      opacity: consumersActive >= num ? 1 : 0.3,
                      transform: `scale(${consumersActive >= num ? 1 : 0.8})`,
                      transition: 'all 0.5s ease-out'
                    }}
                  >
                    <div className="text-center">
                      <span className="text-2xl">👤</span>
                      <p className="text-sm font-semibold mt-1">C{num}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Success Status */}
              <div className="bg-green-900/20 rounded-2xl p-6 border border-green-600/50">
                <div className="text-center">
                  <span className="text-2xl mr-2">⚡</span>
                  <span className="font-bold text-green-400 text-xl">Concurrent Processing Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        {time > 10 && (
          <div className="grid grid-cols-2 gap-8 mt-12">
            <div 
              className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border-l-4 border-red-600"
              style={{
                opacity: Math.min((time - 10) * 0.5, 1),
                transform: `translateY(${Math.max(0, 20 - (time - 10) * 10)}px)`
              }}
            >
              <div className="flex items-center mb-3">
                <span className="text-xl mr-3">❌</span>
                <div className="font-bold">The Problem</div>
              </div>
              <p className="text-sm text-gray-300">
                Head-of-line blocking causes cascading delays throughout the entire partition
              </p>
            </div>

            <div 
              className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border-l-4 border-green-600"
              style={{
                opacity: Math.min((time - 11) * 0.5, 1),
                transform: `translateY(${Math.max(0, 20 - (time - 11) * 10)}px)`
              }}
            >
              <div className="flex items-center mb-3">
                <span className="text-xl mr-3">✨</span>
                <div className="font-bold">The Solution</div>
              </div>
              <p className="text-sm text-gray-300">
                Multiple consumers process messages independently, eliminating bottlenecks
              </p>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-96">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-600 to-green-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottleneckDemoScene;