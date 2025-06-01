import React, { useEffect, useState } from 'react';

const EvolutionTimelineScene = ({ time, duration }) => {
  const [timelineProgress, setTimelineProgress] = useState(0);
  const progress = (time / duration) * 100;
  
  const milestones = [
    { year: '2011', version: 'Kafka 0.1', desc: 'Initial Release', color: 'bg-blue-600', icon: '🚀' },
    { year: '2014', version: 'Kafka 0.8', desc: 'Consumer Groups', color: 'bg-green-600', icon: '👥' },
    { year: '2018', version: 'Kafka 2.0', desc: 'Exactly-once', color: 'bg-purple-600', icon: '🛡️' },
    { year: '2023', version: 'Kafka 3.4', desc: 'KRaft Mode', color: 'bg-yellow-600', icon: '⚙️' },
    { year: '2025', version: 'Kafka 4.0', desc: 'Share Groups', color: 'bg-red-600', icon: '⭐' }
  ];

  // Animate timeline progress
  useEffect(() => {
    if (time > 2) {
      const targetProgress = Math.min(((time - 2) / 5) * 100, 100);
      setTimelineProgress(targetProgress);
    }
  }, [time]);

  const getMilestoneVisibility = (index) => {
    const delay = index * 1.5;
    return time > delay ? 1 : 0;
  };

  const getMilestoneScale = (index) => {
    const delay = index * 1.5;
    if (time <= delay) return 0.3;
    const elapsed = time - delay;
    if (elapsed < 0.5) {
      return 0.3 + (elapsed / 0.5) * 0.7;
    }
    return 1;
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-8">
      <div className="w-full max-w-7xl">
        {/* Title */}
        <div className="text-center mb-16" style={{ opacity: Math.min(time * 0.5, 1) }}>
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            The Evolution of Apache Kafka
          </h1>
          <p className="text-2xl text-gray-400">From Consumer Groups to Share Groups Revolution</p>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Timeline Bar */}
          <div className="h-1 bg-gray-700 rounded-full mb-24 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: `${timelineProgress}%`,
                boxShadow: '0 0 20px rgba(229, 9, 20, 0.6)'
              }}
            />
          </div>

          {/* Milestones */}
          <div className="grid grid-cols-5 gap-8">
            {milestones.map((milestone, index) => (
              <div 
                key={index} 
                className="text-center"
                style={{
                  opacity: getMilestoneVisibility(index),
                  transform: `scale(${getMilestoneScale(index)})`,
                  transition: 'all 0.5s ease-out'
                }}
              >
                {/* Node */}
                <div className={`w-24 h-24 ${milestone.color} rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform`}>
                  <span className="text-3xl">{milestone.icon}</span>
                </div>
                
                {/* Info */}
                <div className="space-y-1">
                  <div className="text-lg font-bold text-white">{milestone.year}</div>
                  <div className="text-xl font-black text-gray-200">{milestone.version}</div>
                  <div className="text-sm text-gray-500">{milestone.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Breakthrough Callout */}
          {time > 8 && (
            <div 
              className="absolute top-0 right-0 bg-black/80 backdrop-blur-lg rounded-2xl p-6 border border-red-600/30 max-w-xs"
              style={{
                opacity: Math.min((time - 8) * 0.5, 1),
                transform: `translateY(${Math.max(0, 10 - (time - 8) * 5)}px)`
              }}
            >
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">💡</span>
                <div className="font-bold text-red-500">Game Changer</div>
              </div>
              <p className="text-sm text-gray-300">
                Share Groups solve the fundamental scalability constraint that has limited Kafka for over a decade.
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-96">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-600 to-orange-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Scene Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvolutionTimelineScene;