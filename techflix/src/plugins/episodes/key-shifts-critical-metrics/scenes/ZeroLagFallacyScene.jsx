import React from 'react';

const ZeroLagFallacyScene = ({ time, duration }) => {
  const progress = (time / duration) * 100;

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-8">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-4xl font-black mb-8 text-white" style={{ opacity: Math.min(time * 0.5, 1) }}>
          The Zero Lag Fallacy
        </h1>
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700">
            <div className="text-xl text-gray-300 mb-2">Traditional Lag</div>
            <div className="text-6xl font-bold text-green-500">0</div>
          </div>
          <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700 animate-pulse">
            <div className="text-xl text-gray-300 mb-2">RecordsUnacked</div>
            <div className="text-6xl font-bold text-red-500">500</div>
          </div>
        </div>
        <p
          className="text-yellow-400"
          style={{ opacity: Math.min((time - 2) * 0.5, 1) }}
        >
          Zero lag can hide problems. Watch the unacked metrics instead!
        </p>
        <div className="mt-10">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-yellow-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZeroLagFallacyScene;
