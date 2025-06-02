import React from 'react';

const TradeOffsScene = ({ time, duration }) => {
  const progress = (time / duration) * 100;
  
  const tradeoffs = [
    {
      aspect: 'Parallelism',
      shareGroups: 'Beyond partition limits',
      traditional: 'Limited to partition count',
      highlight: false
    },
    {
      aspect: 'Ordering',
      shareGroups: 'Flexible per-key ordering',
      traditional: 'Strict partition ordering',
      highlight: true
    },
    {
      aspect: 'Scalability',
      shareGroups: 'Linear scaling with consumers',
      traditional: 'Plateau at partition count',
      highlight: false
    },
    {
      aspect: 'Complexity',
      shareGroups: 'New monitoring paradigms',
      traditional: 'Well-understood patterns',
      highlight: false
    }
  ];

  const getRowOpacity = (index) => {
    const delay = index * 1.5;
    return time > delay ? 1 : 0;
  };

  const getRowTransform = (index) => {
    const delay = index * 1.5;
    if (time <= delay) return 'translateX(-50px)';
    const elapsed = time - delay;
    if (elapsed < 0.5) return `translateX(${-50 + (elapsed / 0.5) * 50}px)`;
    return 'translateX(0)';
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        {/* Title */}
        <div className="text-center mb-12" style={{ opacity: Math.min(time * 0.5, 1) }}>
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Share Groups vs Traditional Kafka
          </h1>
          <p className="text-2xl text-gray-300">Understanding the Trade-offs</p>
        </div>

        {/* Comparison Table */}
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50">
          <table className="w-full">
            <thead>
              <tr className="text-gray-400 text-sm uppercase tracking-wider border-b border-gray-700">
                <th className="text-left py-4">Aspect</th>
                <th className="text-center py-4">Share Groups</th>
                <th className="text-center py-4">Traditional</th>
              </tr>
            </thead>
            <tbody>
              {tradeoffs.map((tradeoff, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-800 transition-all duration-500 ${
                    tradeoff.highlight && time > 3 ? 'bg-purple-900/20' : ''
                  }`}
                  style={{
                    opacity: getRowOpacity(index),
                    transform: getRowTransform(index),
                    transition: 'all 0.5s ease-out'
                  }}
                >
                  <td className="py-6 text-lg font-semibold text-gray-200">
                    {tradeoff.aspect}
                  </td>
                  <td className="py-6 text-center text-green-400">
                    {tradeoff.shareGroups}
                  </td>
                  <td className="py-6 text-center text-orange-400">
                    {tradeoff.traditional}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Key Insight */}
        {time > 7 && (
          <div 
            className="mt-8 p-6 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl border border-purple-500/30"
            style={{
              opacity: Math.min((time - 7) * 0.5, 1),
              transform: `translateY(${Math.max(0, 20 - (time - 7) * 10)}px)`
            }}
          >
            <p className="text-xl text-center text-gray-200">
              <span className="text-2xl mr-2">💡</span>
              Share Groups trade strict ordering for massive scalability gains
            </p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-96">
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

export default TradeOffsScene;