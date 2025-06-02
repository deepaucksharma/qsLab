import React, { useState, useEffect } from 'react';

const PrometheusVerificationScene = ({ time, duration }) => {
  const progress = (time / duration) * 100;
  const [metrics, setMetrics] = useState([]);
  const [queryResult, setQueryResult] = useState('');
  
  // Simulated metrics endpoint output
  const metricsOutput = [
    '# HELP kafka_sharegroup_records_unacked Number of unacknowledged records in share group',
    '# TYPE kafka_sharegroup_records_unacked gauge',
    'kafka_sharegroup_records_unacked{group="payment-processors"} 142.0',
    'kafka_sharegroup_records_unacked{group="fraud-detection"} 89.0',
    'kafka_sharegroup_records_unacked{group="analytics-pipeline"} 256.0',
    '',
    '# HELP kafka_sharegroup_oldest_unacked_ms Age of oldest unacknowledged message',
    '# TYPE kafka_sharegroup_oldest_unacked_ms gauge',
    'kafka_sharegroup_oldest_unacked_ms{group="payment-processors"} 3421.0',
    'kafka_sharegroup_oldest_unacked_ms{group="fraud-detection"} 1890.0',
    'kafka_sharegroup_oldest_unacked_ms{group="analytics-pipeline"} 5234.0'
  ];

  // Progressive reveal of metrics
  useEffect(() => {
    if (time > 2) {
      const visibleLines = Math.floor(((time - 2) / 4) * metricsOutput.length);
      setMetrics(metricsOutput.slice(0, visibleLines));
    }
    
    if (time > 7) {
      setQueryResult('kafka_sharegroup_records_unacked > 200');
    }
  }, [time]);

  const showTitle = time > 0.5;
  const showCurlCommand = time > 1;
  const showMetrics = time > 2;
  const showPromQL = time > 6;
  const showSuccess = time > 9;

  return (
    <div className="w-full h-full bg-gradient-to-br from-green-900 via-black to-blue-900 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Success Particles */}
      <div className="absolute inset-0">
        {showSuccess && [...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-green-400 rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl w-full">
        {/* Title */}
        <div 
          className="text-center mb-8"
          style={{
            opacity: showTitle ? 1 : 0,
            transform: `translateY(${showTitle ? 0 : 20}px)`,
            transition: 'all 0.8s ease-out'
          }}
        >
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Verification & Success
          </h1>
          <p className="text-2xl text-gray-300">
            Confirming Metrics Are Flowing
          </p>
        </div>

        {/* Curl Command */}
        {showCurlCommand && (
          <div 
            className="mb-8 bg-gray-900/80 backdrop-blur-lg rounded-xl p-6 border border-green-500/30"
            style={{
              opacity: Math.min((time - 1) * 0.5, 1),
              transform: `translateX(${Math.max(0, -30 + (time - 1) * 15)}px)`,
              transition: 'all 0.5s ease-out'
            }}
          >
            <p className="text-sm text-gray-400 mb-3">Check metrics endpoint:</p>
            <div className="bg-black rounded-lg p-4 font-mono text-sm">
              <span className="text-gray-500">$</span>
              <span className="text-green-400"> curl localhost:9404/metrics | grep sharegroup</span>
            </div>
          </div>
        )}

        {/* Metrics Output */}
        {showMetrics && metrics.length > 0 && (
          <div 
            className="mb-8 bg-gray-900/80 backdrop-blur-lg rounded-xl border border-blue-500/30 overflow-hidden"
            style={{
              opacity: Math.min((time - 2) * 0.5, 1),
              transform: `scale(${Math.min(1, 0.95 + (time - 2) * 0.025)})`,
              transition: 'all 0.5s ease-out'
            }}
          >
            <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
              <span className="text-sm text-gray-400 font-mono">Metrics Output</span>
            </div>
            <div className="p-4 font-mono text-xs overflow-auto max-h-[300px]">
              {metrics.map((line, idx) => (
                <div 
                  key={idx}
                  className="leading-relaxed"
                  style={{
                    opacity: Math.min((time - 2 - idx * 0.1) * 2, 1)
                  }}
                >
                  <span className={
                    line.startsWith('#') ? 'text-gray-500' :
                    line.includes('{') ? 'text-blue-400' :
                    'text-gray-300'
                  }>
                    {line || '\u00A0'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PromQL Query */}
        {showPromQL && (
          <div 
            className="mb-8"
            style={{
              opacity: Math.min((time - 6) * 0.5, 1),
              transform: `translateY(${Math.max(0, 20 - (time - 6) * 10)}px)`
            }}
          >
            <h3 className="text-xl font-semibold text-gray-300 mb-4">Query in Prometheus:</h3>
            <div className="bg-gray-900/80 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
              <div className="font-mono text-lg text-purple-400 mb-4">
                {queryResult}
              </div>
              <div className="text-sm text-gray-400">
                Returns: <span className="text-yellow-400">analytics-pipeline{'{'}group=&quot;analytics-pipeline&quot;{'}'} 256</span>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div 
            className="text-center"
            style={{
              opacity: Math.min((time - 9) * 0.5, 1),
              transform: `scale(${Math.min(1, 0.9 + (time - 9) * 0.05)})`,
              transition: 'all 0.5s ease-out'
            }}
          >
            <div className="inline-block p-8 bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-2xl border border-green-500/30">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-3xl font-bold text-green-400 mb-4">
                Pipeline Operational!
              </h2>
              <p className="text-xl text-gray-300">
                Share Groups metrics are now flowing to Prometheus
              </p>
              <div className="mt-6 flex justify-center space-x-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">15s</div>
                  <div className="text-sm text-gray-500">Scrape Interval</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">30d</div>
                  <div className="text-sm text-gray-500">Retention</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">∞</div>
                  <div className="text-sm text-gray-500">Insights</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-96">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-600 to-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }
      `}</style>
    </div>
  );
};

export default PrometheusVerificationScene;