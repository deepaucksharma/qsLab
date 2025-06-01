import React, { useState, useEffect } from 'react';

const JMXExplorerScene = ({ time, duration }) => {
  const [showCommand, setShowCommand] = useState(false);

  useEffect(() => {
    if (time > 10) setShowCommand(true);
  }, [time]);

  return (
    <div className="p-8 text-gray-200">
      <h2 className="text-3xl font-bold mb-4">JMX Metrics Explorer</h2>
      <p className="mb-4">Connect to Kafka's JMX port to inspect runtime metrics.</p>
      {showCommand && (
        <pre className="bg-gray-900 p-4 rounded">
          jconsole localhost:9999
        </pre>
      )}
    </div>
  );
};

export default JMXExplorerScene;
