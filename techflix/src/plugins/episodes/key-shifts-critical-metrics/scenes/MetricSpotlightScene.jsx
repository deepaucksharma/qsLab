import React, { useState, useEffect } from 'react';

const MetricSpotlightScene = ({ time, duration }) => {
  const progress = (time / duration) * 100;
  const targets = [120, 5000];
  const [values, setValues] = useState([0, 0]);

  const metrics = [
    { label: 'RecordsUnacked', icon: '📊' },
    { label: 'OldestUnackedMessageAgeMs', icon: '⏱️' }
  ];

  useEffect(() => {
    const eased = 1 - Math.pow(1 - Math.min(time / duration, 1), 4);
    setValues(targets.map(t => Math.floor(t * eased)));
  }, [time, duration]);

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-8">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-4xl font-black mb-8 text-white" style={{ opacity: Math.min(time * 0.5, 1) }}>
          Metric Spotlight
        </h1>
        <div className="grid grid-cols-2 gap-8">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700"
            >
              <div className="text-3xl mb-4">{metric.icon}</div>
              <div className="text-5xl font-bold text-green-400 mb-2">
                {values[idx]}
              </div>
              <div className="text-sm text-gray-300">{metric.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricSpotlightScene;
