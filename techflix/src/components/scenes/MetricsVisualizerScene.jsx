import React, { useState, useEffect } from 'react';

const MetricsVisualizerScene = ({ time, duration }) => {
  const progress = (time / duration) * 100;
  const [metrics, setMetrics] = useState({
    recordsUnacked: 0,
    oldestMessageAge: 0,
    shareGroupCount: 0,
    messagesPerSec: 0
  });

  // Simulate real-time metric updates
  useEffect(() => {
    if (time > 2) {
      const baseProgress = Math.min((time - 2) / 10, 1);
      setMetrics({
        recordsUnacked: Math.floor(250 * baseProgress + Math.sin(time) * 20),
        oldestMessageAge: Math.floor(3000 * baseProgress + Math.cos(time * 0.5) * 500),
        shareGroupCount: Math.floor(12 * baseProgress),
        messagesPerSec: Math.floor(50000 * baseProgress + Math.sin(time * 2) * 5000)
      });
    }
  }, [time]);

  const metricCards = [
    {
      name: 'RecordsUnacked',
      value: metrics.recordsUnacked,
      unit: 'records',
      icon: '📊',
      color: 'from-orange-500 to-red-500',
      description: 'Unprocessed messages across all Share Groups',
      threshold: 100,
      critical: metrics.recordsUnacked > 200
    },
    {
      name: 'OldestUnackedMessageAgeMs',
      value: metrics.oldestMessageAge,
      unit: 'ms',
      icon: '⏱️',
      color: 'from-blue-500 to-purple-500',
      description: 'Age of the oldest unprocessed message',
      threshold: 5000,
      critical: metrics.oldestMessageAge > 2500
    },
    {
      name: 'ShareGroupCount',
      value: metrics.shareGroupCount,
      unit: 'groups',
      icon: '👥',
      color: 'from-green-500 to-teal-500',
      description: 'Active Share Groups in the cluster',
      threshold: 20,
      critical: false
    },
    {
      name: 'MessagesInPerSec',
      value: metrics.messagesPerSec.toLocaleString(),
      unit: 'msg/s',
      icon: '⚡',
      color: 'from-purple-500 to-pink-500',
      description: 'Incoming message rate',
      threshold: 100000,
      critical: false
    }
  ];

  const showDashboard = time > 1;
  const showAlerts = time > 8;
  const showInsights = time > 12;

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-blue-900 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Animated Data Flow Background */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 bg-gradient-to-b from-blue-500/20 to-transparent"
            style={{
              left: `${Math.random() * 100}%`,
              height: `${50 + Math.random() * 50}%`,
              animation: `flow-down ${5 + Math.random() * 5}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl w-full">
        {/* Title */}
        <div className="text-center mb-12" style={{ opacity: Math.min(time * 0.5, 1) }}>
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Real-Time Metrics Dashboard
          </h1>
          <p className="text-2xl text-gray-300">Share Groups Performance at a Glance</p>
        </div>

        {/* Metrics Grid */}
        {showDashboard && (
          <div className="grid grid-cols-2 gap-6 mb-12">
            {metricCards.map((metric, idx) => (
              <div
                key={idx}
                className={`relative bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border transition-all duration-300 ${
                  metric.critical ? 'border-red-500/50 animate-pulse-border' : 'border-gray-700/50'
                }`}
                style={{
                  opacity: Math.min((time - 1 - idx * 0.5) * 0.5, 1),
                  transform: `translateY(${Math.max(0, 30 - (time - 1 - idx * 0.5) * 15)}px)`
                }}
              >
                {/* Metric Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-3xl mb-2">{metric.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-300">{metric.name}</h3>
                    <p className="text-sm text-gray-500">{metric.description}</p>
                  </div>
                  {metric.critical && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full animate-pulse">
                      CRITICAL
                    </span>
                  )}
                </div>

                {/* Metric Value */}
                <div className={`text-4xl font-black mb-4 bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
                  {metric.value}
                  <span className="text-xl ml-2 text-gray-400">{metric.unit}</span>
                </div>

                {/* Progress Bar */}
                <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${metric.color} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min((metric.value / metric.threshold) * 100, 100)}%` }}
                  />
                  {/* Threshold marker */}
                  <div className="absolute top-0 right-0 w-px h-full bg-gray-600" />
                </div>

                {/* Live indicator */}
                <div className="mt-4 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                  <span className="text-xs text-gray-500">Live</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alerts Section */}
        {showAlerts && metrics.recordsUnacked > 200 && (
          <div 
            className="mb-8 p-6 bg-red-900/20 border border-red-500/50 rounded-xl backdrop-blur-lg"
            style={{
              opacity: Math.min((time - 8) * 0.5, 1),
              transform: `translateY(${Math.max(0, 20 - (time - 8) * 10)}px)`
            }}
          >
            <div className="flex items-center">
              <span className="text-3xl mr-4">🚨</span>
              <div>
                <h3 className="text-xl font-bold text-red-400 mb-1">Performance Alert</h3>
                <p className="text-gray-300">
                  High unacked records detected. Consumer processing may be lagging behind production rate.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Insights */}
        {showInsights && (
          <div 
            className="grid grid-cols-3 gap-4"
            style={{
              opacity: Math.min((time - 12) * 0.5, 1),
              transform: `translateY(${Math.max(0, 20 - (time - 12) * 10)}px)`
            }}
          >
            {[
              { icon: '💡', text: 'Scale consumers to reduce unacked records' },
              { icon: '⚡', text: 'Optimize processing logic for better throughput' },
              { icon: '📈', text: 'Monitor trends to prevent bottlenecks' }
            ].map((insight, idx) => (
              <div
                key={idx}
                className="bg-gray-900/60 rounded-lg p-4 border border-gray-700/50"
                style={{
                  opacity: Math.min((time - 12 - idx * 0.3) * 0.5, 1),
                  transform: `scale(${Math.min(1, 0.9 + (time - 12 - idx * 0.3) * 0.05)})`
                }}
              >
                <span className="text-2xl mr-2">{insight.icon}</span>
                <span className="text-sm text-gray-300">{insight.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Progress Bar */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-96">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes flow-down {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
        
        @keyframes pulse-border {
          0%, 100% {
            border-color: rgba(239, 68, 68, 0.5);
          }
          50% {
            border-color: rgba(239, 68, 68, 0.8);
          }
        }
      `}</style>
    </div>
  );
};

export default MetricsVisualizerScene;