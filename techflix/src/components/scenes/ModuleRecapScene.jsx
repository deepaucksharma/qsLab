import React from 'react';

const ModuleRecapScene = ({ time, duration }) => {
  const progress = (time / duration) * 100;
  
  const takeaways = [
    {
      icon: '🔄',
      title: 'Trade-offs Matter',
      description: 'Share Groups offer massive scalability but require new monitoring approaches',
      color: 'from-purple-500 to-blue-500'
    },
    {
      icon: '📊',
      title: 'Monitor RecordsUnacked',
      description: 'The most critical metric for understanding Share Groups consumer health',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: '⏱️',
      title: 'Track Message Age',
      description: 'OldestUnackedMessageAgeMs reveals processing bottlenecks early',
      color: 'from-blue-500 to-purple-500'
    },
    {
      icon: '🚨',
      title: 'Beware Zero Lag',
      description: 'Traditional lag metrics can hide serious processing issues with Share Groups',
      color: 'from-red-500 to-pink-500'
    }
  ];

  const getItemOpacity = (index) => {
    const delay = 1.5 + index * 1.2;
    return time > delay ? 1 : 0;
  };

  const getItemTransform = (index) => {
    const delay = 1.5 + index * 1.2;
    if (time <= delay) return 'translateY(30px) scale(0.9)';
    const elapsed = time - delay;
    if (elapsed < 0.5) {
      const progress = elapsed / 0.5;
      return `translateY(${30 - 30 * progress}px) scale(${0.9 + 0.1 * progress})`;
    }
    return 'translateY(0) scale(1)';
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-purple-900/20 to-black flex items-center justify-center p-8 relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(147, 51, 234, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(147, 51, 234, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }} />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-up ${10 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.3
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl w-full">
        {/* Title */}
        <div className="text-center mb-12" style={{ opacity: Math.min(time * 0.5, 1) }}>
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Module Recap
          </h1>
          <p className="text-2xl text-gray-300">Key Takeaways for Share Groups Monitoring</p>
        </div>

        {/* Takeaways Grid */}
        <div className="grid grid-cols-2 gap-6">
          {takeaways.map((takeaway, index) => (
            <div
              key={index}
              className="relative group"
              style={{
                opacity: getItemOpacity(index),
                transform: getItemTransform(index),
                transition: 'all 0.5s ease-out'
              }}
            >
              {/* Card Glow */}
              <div className={`absolute inset-0 bg-gradient-to-r ${takeaway.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`} />
              
              {/* Card Content */}
              <div className="relative bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/70 transition-all duration-300">
                <div className="flex items-start">
                  {/* Icon */}
                  <div className="text-4xl mr-4 flex-shrink-0">{takeaway.icon}</div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-2 bg-gradient-to-r ${takeaway.color} bg-clip-text text-transparent`}>
                      {takeaway.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {takeaway.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Final Message */}
        {time > 7 && (
          <div 
            className="mt-12 text-center"
            style={{
              opacity: Math.min((time - 7) * 0.5, 1),
              transform: `translateY(${Math.max(0, 20 - (time - 7) * 10)}px)`
            }}
          >
            <div className="inline-block p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl border border-purple-500/30">
              <p className="text-xl text-gray-200">
                <span className="text-2xl mr-2">🎯</span>
                Master these metrics to unlock Share Groups&apos; full potential
              </p>
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

      <style>{`
        @keyframes grid-move {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }
        
        @keyframes float-up {
          0% {
            transform: translateY(100vh) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100vh) translateX(20px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ModuleRecapScene;