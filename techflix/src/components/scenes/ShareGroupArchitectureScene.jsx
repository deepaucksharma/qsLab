import React, { useState, useEffect } from 'react';

const ShareGroupArchitectureScene = ({ time, duration }) => {
  const [messageCount, setMessageCount] = useState(0);
  const [activeMessages, setActiveMessages] = useState([]);
  const progress = (time / duration) * 100;

  // Generate flowing messages
  useEffect(() => {
    if (time > 3 && time < 25) {
      const interval = setInterval(() => {
        const newMessage = {
          id: Date.now(),
          startX: 50,
          startY: 25,
          endY: 75,
          color: ['#e50914', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][Math.floor(Math.random() * 5)],
          consumer: Math.floor(Math.random() * 5) + 1
        };
        setActiveMessages(prev => [...prev, newMessage]);
        setMessageCount(prev => Math.min(prev + 1, 25));
        
        // Remove old messages
        setTimeout(() => {
          setActiveMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
        }, 3000);
      }, 200);
      
      return () => clearInterval(interval);
    }
  }, [time]);

  const getElementOpacity = (delay) => time > delay ? 1 : 0;
  const getElementScale = (delay) => {
    if (time <= delay) return 0.3;
    const elapsed = time - delay;
    if (elapsed < 0.5) return 0.3 + (elapsed / 0.5) * 0.7;
    return 1;
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-black to-purple-900 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 49px, #4338ca 49px, #4338ca 50px), repeating-linear-gradient(90deg, transparent, transparent 49px, #4338ca 49px, #4338ca 50px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="w-full max-w-7xl relative z-10">
        {/* Title */}
        <div className="text-center mb-12" style={{ opacity: Math.min(time * 0.5, 1) }}>
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Share Groups: The Breakthrough
          </h1>
          <p className="text-2xl text-gray-300">Concurrent Processing Within Partitions</p>
        </div>

        {/* Architecture Visualization */}
        <div className="relative h-[600px]">
          {/* Kafka Cluster */}
          <div 
            className="absolute top-0 left-1/2 transform -translate-x-1/2 flex gap-6"
            style={{
              opacity: getElementOpacity(1),
              transform: `translateX(-50%) scale(${getElementScale(1)})`
            }}
          >
            {[1, 2, 3].map((broker) => (
              <div 
                key={broker}
                className="bg-blue-600/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-600/50 shadow-2xl hover:scale-105 transition-transform"
              >
                <div className="text-center">
                  <span className="text-3xl">🖥️</span>
                  <p className="mt-2 font-semibold">Broker {broker}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Topic with Partitions */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              opacity: getElementOpacity(2),
              transform: `translate(-50%, -50%) scale(${getElementScale(2)})`
            }}
          >
            <div className="text-center mb-8">
              <div className="flex items-center justify-center">
                <span className="text-2xl mr-3">📊</span>
                <h3 className="text-2xl font-bold text-purple-400">Orders Topic</h3>
              </div>
            </div>
            
            <div className="flex gap-8 justify-center">
              {[1, 2, 3].map((partition) => (
                <div 
                  key={partition}
                  className="bg-purple-600/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-600/50 shadow-2xl hover:scale-105 transition-transform"
                  style={{
                    animationDelay: `${partition * 0.2}s`
                  }}
                >
                  <div className="text-center">
                    <span className="text-3xl">📂</span>
                    <p className="mt-2 font-semibold">Partition {partition}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Share Group Consumers */}
          <div 
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-6"
            style={{
              opacity: getElementOpacity(3),
              transform: `translateX(-50%) scale(${getElementScale(3)})`
            }}
          >
            {[1, 2, 3, 4, 5].map((consumer) => (
              <div 
                key={consumer}
                className="bg-green-600/20 backdrop-blur-lg rounded-xl p-4 border border-green-600/50 shadow-2xl hover:scale-110 transition-transform"
                style={{
                  animationDelay: `${consumer * 0.1}s`
                }}
              >
                <div className="text-center">
                  <span className="text-2xl">🔧</span>
                  <p className="text-sm font-semibold mt-1">C{consumer}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Flowing Messages */}
          {activeMessages.map((message) => (
            <div
              key={message.id}
              className="absolute w-4 h-4 rounded-full animate-pulse"
              style={{
                backgroundColor: message.color,
                boxShadow: `0 0 20px ${message.color}`,
                left: `${message.startX}%`,
                top: `${message.startY}%`,
                transform: 'translate(-50%, -50%)',
                animation: 'messageFlow 3s linear forwards'
              }}
            />
          ))}

          {/* Status Indicators */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between">
            <div 
              className="bg-black/60 backdrop-blur-lg rounded-2xl p-4 border border-green-600/30"
              style={{
                opacity: getElementOpacity(4),
                transform: `scale(${getElementScale(4)})`
              }}
            >
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse" />
                <div>
                  <div className="font-bold text-green-400">Share Group Active</div>
                  <div className="text-xs text-gray-400">Concurrent processing enabled</div>
                </div>
              </div>
            </div>

            <div 
              className="bg-black/60 backdrop-blur-lg rounded-2xl p-4 border border-blue-600/30"
              style={{
                opacity: getElementOpacity(4),
                transform: `scale(${getElementScale(4)})`
              }}
            >
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse" />
                <div>
                  <div className="font-bold text-blue-400">{messageCount} Messages</div>
                  <div className="text-xs text-gray-400">In flight</div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features */}
          {time > 8 && (
            <div className="absolute top-0 right-0 space-y-4">
              <div 
                className="bg-black/60 backdrop-blur-lg rounded-2xl p-4 border-l-4 border-purple-600 max-w-xs"
                style={{
                  opacity: Math.min((time - 8) * 0.5, 1),
                  transform: `translateX(${Math.max(0, 50 - (time - 8) * 25)}px)`
                }}
              >
                <div className="flex items-center mb-2">
                  <span className="text-xl mr-2">☁️</span>
                  <div className="font-bold">Kafka Cluster</div>
                </div>
                <p className="text-xs text-gray-300">
                  Distributed brokers managing partitions with built-in replication
                </p>
              </div>

              <div 
                className="bg-black/60 backdrop-blur-lg rounded-2xl p-4 border-l-4 border-green-600 max-w-xs"
                style={{
                  opacity: Math.min((time - 10) * 0.5, 1),
                  transform: `translateX(${Math.max(0, 50 - (time - 10) * 25)}px)`
                }}
              >
                <div className="flex items-center mb-2">
                  <span className="text-xl mr-2">🔄</span>
                  <div className="font-bold">Share Group Magic</div>
                </div>
                <p className="text-xs text-gray-300">
                  Multiple consumers processing the same partition concurrently
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-96">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-green-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes messageFlow {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) translateY(0);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) translateY(400px);
          }
        }
      `}</style>
    </div>
  );
};

export default ShareGroupArchitectureScene;