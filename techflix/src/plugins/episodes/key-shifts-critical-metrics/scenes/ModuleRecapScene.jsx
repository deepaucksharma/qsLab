import React from 'react';

const ModuleRecapScene = ({ time, duration }) => {
  const progress = (time / duration) * 100;
  const points = [
    'Share Groups enable cooperative consumption',
    'ACK/RELEASE/REJECT provide fine control',
    'Watch RecordsUnacked & OldestUnackedMs',
    'Traditional lag can mislead'
  ];

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-8">
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-4xl font-black mb-6 text-white" style={{ opacity: Math.min(time * 0.5, 1) }}>
          Module 1 Recap
        </h1>
        <ul className="text-left text-gray-200 list-disc list-inside space-y-2">
          {points.map((p, idx) => {
            const visible = time > idx * 1.2;
            return (
              <li
                key={idx}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.3s ease-out'
                }}
              >
                {p}
              </li>
            );
          })}
        </ul>
        <div className="mt-10">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleRecapScene;
