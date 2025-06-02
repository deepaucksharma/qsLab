import React, { useState, useEffect } from 'react';

const MBeanNavigatorScene = ({ time, duration }) => {
  const progress = (time / duration) * 100;
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  
  // Auto-expand nodes based on time
  useEffect(() => {
    if (time > 3) setExpandedNodes(prev => new Set([...prev, 'kafka.server']));
    if (time > 5) setExpandedNodes(prev => new Set([...prev, 'kafka.server:type=sharegroup']));
    if (time > 8) setExpandedNodes(prev => new Set([...prev, 'kafka.network']));
  }, [time]);

  const mbeanTree = {
    'kafka.server': {
      icon: '📊',
      children: {
        'type=BrokerTopicMetrics': {
          icon: '📈',
          metrics: ['MessagesInPerSec', 'BytesInPerSec', 'BytesOutPerSec']
        },
        'type=sharegroup': {
          icon: '🔄',
          metrics: ['RecordsUnacked', 'OldestUnackedMessageAgeMs', 'ShareGroupCount'],
          highlight: true
        },
        'type=KafkaRequestHandlerPool': {
          icon: '⚙️',
          metrics: ['RequestHandlerAvgIdlePercent']
        }
      }
    },
    'kafka.network': {
      icon: '🌐',
      children: {
        'type=RequestMetrics': {
          icon: '📡',
          metrics: ['RequestsPerSec', 'TotalTimeMs', 'ResponseQueueTimeMs']
        }
      }
    },
    'kafka.controller': {
      icon: '🎛️',
      children: {
        'type=KafkaController': {
          icon: '👑',
          metrics: ['ActiveControllerCount', 'OfflinePartitionsCount']
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

  const renderTree = (node, path = '', level = 0) => {
    const isExpanded = expandedNodes.has(path);
    const showNode = time > level * 2;
    
    if (!showNode) return null;

    return Object.entries(node).map(([key, value]) => {
      const currentPath = path ? `${path}:${key}` : key;
      const hasChildren = value.children && Object.keys(value.children).length > 0;
      
      return (
        <div key={currentPath} className="mb-2">
          <div
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 ${
              value.highlight ? 'bg-purple-900/30 border border-purple-500/50' : 'bg-gray-900/40 hover:bg-gray-900/60'
            }`}
            style={{
              marginLeft: `${level * 24}px`,
              opacity: Math.min((time - level * 2) * 0.5, 1),
              transform: `translateX(${Math.max(0, -20 + (time - level * 2) * 10)}px)`
            }}
            onClick={() => hasChildren && toggleNode(currentPath)}
          >
            {hasChildren && (
              <span className="mr-2 text-gray-400">
                {isExpanded ? '▼' : '▶'}
              </span>
            )}
            <span className="text-2xl mr-3">{value.icon}</span>
            <span className="font-mono text-sm text-gray-300">{key}</span>
            {value.highlight && (
              <span className="ml-auto px-2 py-1 bg-purple-600 text-xs rounded-full">
                NEW
              </span>
            )}
          </div>
          
          {value.metrics && isExpanded && (
            <div className="mt-2" style={{ marginLeft: `${(level + 1) * 24}px` }}>
              {value.metrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="flex items-center p-2 mb-1 bg-black/30 rounded-lg"
                  style={{
                    opacity: Math.min((time - level * 2 - 2 - idx * 0.3) * 0.5, 1),
                    transform: `translateX(${Math.max(0, -10 + (time - level * 2 - 2 - idx * 0.3) * 5)}px)`
                  }}
                >
                  <span className="text-blue-400 mr-2">→</span>
                  <span className="font-mono text-xs text-gray-400">{metric}</span>
                </div>
              ))}
            </div>
          )}
          
          {hasChildren && isExpanded && renderTree(value.children, currentPath, level + 1)}
        </div>
      );
    });
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-purple-900/20 to-black flex items-center justify-center p-8 relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(147, 51, 234, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(147, 51, 234, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }} />
      </div>

      <div className="relative z-10 max-w-6xl w-full">
        {/* Title */}
        <div className="text-center mb-12" style={{ opacity: Math.min(time * 0.5, 1) }}>
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            MBean Tree Explorer
          </h1>
          <p className="text-2xl text-gray-300">Click to expand and discover metrics</p>
        </div>

        {/* MBean Tree Container */}
        <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 max-h-[600px] overflow-y-auto">
          {renderTree(mbeanTree)}
        </div>

        {/* Tip */}
        {time > 10 && (
          <div 
            className="mt-8 p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-500/30"
            style={{
              opacity: Math.min((time - 10) * 0.5, 1),
              transform: `translateY(${Math.max(0, 20 - (time - 10) * 10)}px)`
            }}
          >
            <p className="text-lg text-center text-gray-200">
              <span className="text-2xl mr-2">💡</span>
              Share Group metrics are the key to understanding Kafka 4.0&apos;s new consumer model
            </p>
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

export default MBeanNavigatorScene;