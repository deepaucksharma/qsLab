import React from 'react';

const TradeOffsScene = ({ time, duration }) => {
  const progress = (time / duration) * 100;
  const rows = [
    { label: 'Parallelism', share: 'High', traditional: 'Limited' },
    { label: 'Ordering', share: 'Flexible \u2194', traditional: 'Strict \u2192', highlight: true },
    { label: 'Scalability', share: 'Elastic', traditional: 'Partition-bound' },
    { label: 'Complexity', share: 'ACK/RELEASE logic', traditional: 'Offset commits' }
  ];

  const revealCount = Math.floor((time / duration) * rows.length);

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-8">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl font-black text-center mb-6 text-white" style={{ opacity: Math.min(time * 0.5, 1) }}>
          Share Groups vs. Traditional
        </h1>
        <table className="w-full text-sm text-left text-gray-200 border-collapse">
          <thead>
            <tr>
              <th className="p-3">Aspect</th>
              <th className="p-3 bg-green-900/40">Share Groups</th>
              <th className="p-3 bg-red-900/40">Traditional</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const visible = idx < revealCount;
              return (
                <tr
                  key={idx}
                  className={`border-t border-gray-700 ${row.highlight ? 'bg-yellow-800/20 animate-pulse' : ''}`}
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'all 0.3s ease-out'
                  }}
                >
                  <td className="p-3 font-semibold">{row.label}</td>
                  <td className="p-3">{row.share}</td>
                  <td className="p-3">{row.traditional}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mt-8">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-600 to-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeOffsScene;
