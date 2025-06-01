import React from 'react';

const MetricsVisualizerScene = ({ time }) => {
  const metrics = {
    RecordsUnacked: 245,
    OldestUnackedMessageAgeMs: 15234
  };

  return (
    <div className="p-8 text-gray-200">
      <h2 className="text-3xl font-bold mb-4">Metrics Extraction</h2>
      <p className="mb-2">RecordsUnacked: {metrics.RecordsUnacked}</p>
      <p>OldestUnackedMessageAgeMs: {metrics.OldestUnackedMessageAgeMs}</p>
    </div>
  );
};

export default MetricsVisualizerScene;
