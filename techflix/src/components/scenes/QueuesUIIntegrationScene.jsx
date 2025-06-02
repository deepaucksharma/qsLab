import React, { useState, useEffect } from 'react';

const QueuesUIIntegrationScene = ({ time, duration }) => {
  const progress = (time / duration) * 100;
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [metrics, setMetrics] = useState({
    depth: 0,
    oldestAge: 0,
    consumers: 0,
    rate: 0
  });

  // Queue data
  const queues = [
    {
      id: 'orders:share-processor',
      name: 'orders:share-processor',
      provider: 'kafka-sharegroup',
      depth: 342,
      oldestAge: 4.2,
      consumers: 8,
      rate: 1250,
      health: 'healthy'
    },
    {
      id: 'payments:share-validator',
      name: 'payments:share-validator',
      provider: 'kafka-sharegroup',
      depth: 789,
      oldestAge: 12.5,
      consumers: 5,
      rate: 890,
      health: 'warning'
    },
    {
      id: 'inventory:share-updater',
      name: 'inventory:share-updater',
      provider: 'kafka-sharegroup',
      depth: 156,
      oldestAge: 2.1,
      consumers: 12,
      rate: 2100,
      health: 'healthy'
    }
  ];

  // Animate metrics
  useEffect(() => {
    if (selectedQueue && time > 8) {
      const queue = queues.find(q => q.id === selectedQueue);
      if (queue) {
        const animProgress = Math.min((time - 8) / 3, 1);
        setMetrics({
          depth: Math.floor(queue.depth * animProgress),
          oldestAge: (queue.oldestAge * animProgress).toFixed(1),
          consumers: Math.floor(queue.consumers * animProgress),
          rate: Math.floor(queue.rate * animProgress)
        });
      }
    }
  }, [time, selectedQueue]);

  // Auto-select first queue
  useEffect(() => {
    if (time > 6 && !selectedQueue) {
      setSelectedQueue(queues[0].id);
    }
  }, [time, selectedQueue]);

  const showTitle = time > 0.5;
  const showDashboard = time > 2;
  const showQueues = time > 4;
  const showDetails = time > 6;
  const showChart = time > 10;
  const showAlerts = time > 14;

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-purple-900/20 to-black flex items-center justify-center p-8 relative overflow-hidden">
      {/* New Relic UI Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }} />
      </div>

      <div className="relative z-10 w-full max-w-7xl">
        {/* Title */}
        <div 
          className="text-center mb-8"
          style={{
            opacity: showTitle ? 1 : 0,
            transform: `translateY(${showTitle ? 0 : 20}px)`,
            transition: 'all 0.8s ease-out'
          }}
        >
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            New Relic Queues & Streams UI
          </h1>
          <p className="text-2xl text-gray-300">Your Share Groups in Production</p>
        </div>

        {/* Dashboard Container */}
        {showDashboard && (
          <div 
            className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border border-purple-500/30 overflow-hidden"
            style={{
              opacity: Math.min((time - 2) * 0.5, 1),
              transform: `scale(${Math.min(1, 0.98 + (time - 2) * 0.01)})`,
              transition: 'all 0.5s ease-out'
            }}
          >
            {/* Dashboard Header */}
            <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-semibold text-white">Queues & Streams</h2>
                  <span className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full">Live</span>
                </div>
                <div className="text-sm text-gray-400">Last updated: Just now</div>
              </div>
            </div>

            <div className="p-6">
              {/* Queue Cards Grid */}
              {showQueues && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {queues.map((queue, idx) => (
                    <div
                      key={queue.id}
                      className={`bg-gray-800/60 rounded-xl p-4 border cursor-pointer transition-all duration-300 ${
                        selectedQueue === queue.id 
                          ? 'border-purple-500 shadow-lg shadow-purple-500/20' 
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                      style={{
                        opacity: Math.min((time - 4 - idx * 0.3) * 0.5, 1),
                        transform: `translateY(${Math.max(0, 20 - (time - 4 - idx * 0.3) * 10)}px)`
                      }}
                      onClick={() => setSelectedQueue(queue.id)}
                    >
                      {/* Queue Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-white text-sm">{queue.name}</h3>
                          <span className="text-xs text-gray-400">{queue.provider}</span>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          queue.health === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'
                        }`} />
                      </div>

                      {/* Metrics */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Depth</span>
                          <span className="text-white font-mono">{queue.depth}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Oldest</span>
                          <span className="text-white font-mono">{queue.oldestAge}s</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Consumers</span>
                          <span className="text-white font-mono">{queue.consumers}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Queue Details */}
              {showDetails && selectedQueue && (
                <div className="bg-gray-800/60 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {queues.find(q => q.id === selectedQueue)?.name}
                  </h3>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-400">{metrics.depth}</div>
                      <div className="text-xs text-gray-400 mt-1">Queue Depth</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400">{metrics.oldestAge}s</div>
                      <div className="text-xs text-gray-400 mt-1">Oldest Message</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400">{metrics.consumers}</div>
                      <div className="text-xs text-gray-400 mt-1">Active Consumers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-400">{metrics.rate}</div>
                      <div className="text-xs text-gray-400 mt-1">Messages/sec</div>
                    </div>
                  </div>

                  {/* Chart Area */}
                  {showChart && (
                    <div 
                      className="bg-gray-900/60 rounded-lg p-4 h-40 flex items-center justify-center"
                      style={{
                        opacity: Math.min((time - 10) * 0.5, 1)
                      }}
                    >
                      <svg className="w-full h-full">
                        <defs>
                          <linearGradient id="depthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#9333ea" stopOpacity="0.8"/>
                            <stop offset="100%" stopColor="#9333ea" stopOpacity="0.1"/>
                          </linearGradient>
                        </defs>
                        {/* Simple area chart simulation */}
                        <path
                          d={`M 0 100 ${Array(20).fill(null).map((_, i) => {
                            const x = (i / 19) * 100;
                            const y = 50 + Math.sin(i * 0.5 + time * 0.1) * 30;
                            return `L ${x} ${y}`;
                          }).join(' ')} L 100 100 Z`}
                          fill="url(#depthGradient)"
                          transform="scale(6, 1)"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              )}

              {/* Alert Configuration */}
              {showAlerts && (
                <div 
                  className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-xl"
                  style={{
                    opacity: Math.min((time - 14) * 0.5, 1),
                    transform: `translateY(${Math.max(0, 20 - (time - 14) * 10)}px)`
                  }}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🚨</span>
                    <div>
                      <h4 className="font-semibold text-yellow-400">Alert Configured</h4>
                      <p className="text-sm text-gray-300">
                        Notify when queue depth exceeds 1000 for 5 minutes
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-96">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueuesUIIntegrationScene;