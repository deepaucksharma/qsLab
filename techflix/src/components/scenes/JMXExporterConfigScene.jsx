import React, { useState, useEffect } from 'react';

const JMXExporterConfigScene = ({ time, duration }) => {
  const progress = (time / duration) * 100;
  const [configLines, setConfigLines] = useState([]);
  
  const fullConfig = [
    '---',
    'hostPort: localhost:9999',
    'lowercaseOutputName: true',
    '',
    'rules:',
    '  # Share Groups Metrics',
    '  - pattern: "kafka.server<type=sharegroup,(.+)><>RecordsUnacked"',
    '    name: kafka_sharegroup_records_unacked',
    '    labels:',
    '      group: "$1"',
    '    help: "Number of unacknowledged records in share group"',
    '    type: GAUGE',
    '',
    '  - pattern: "kafka.server<type=sharegroup,(.+)><>OldestUnackedMessageAgeMs"',
    '    name: kafka_sharegroup_oldest_unacked_ms',
    '    labels:',
    '      group: "$1"',
    '    help: "Age of oldest unacknowledged message in milliseconds"',
    '    type: GAUGE',
    '',
    '  # Topic Metrics',
    '  - pattern: "kafka.server<type=BrokerTopicMetrics,topic=(.+)><>MessagesInPerSec"',
    '    name: kafka_topic_messages_in_rate',
    '    labels:',
    '      topic: "$1"',
    '    help: "Incoming message rate per topic"',
    '    type: GAUGE'
  ];

  // Progressively reveal config lines
  useEffect(() => {
    const visibleLines = Math.floor((time / 15) * fullConfig.length);
    setConfigLines(fullConfig.slice(0, visibleLines));
  }, [time]);

  const showTitle = time > 0.5;
  const showEditor = time > 2;
  const showExplanation = time > 10;
  const showCommand = time > 12;

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-yellow-900 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Code Pattern Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="font-mono text-xs text-yellow-500 leading-relaxed whitespace-pre overflow-hidden">
          {Array(50).fill(null).map((_, i) => (
            <div key={i}>{'{ metric: "kafka_sharegroup_records_unacked", value: Math.random() * 1000 }'}</div>
          ))}
        </div>
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
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            JMX Exporter Configuration
          </h1>
          <p className="text-2xl text-gray-300">
            Mapping JMX MBeans to Prometheus Metrics
          </p>
        </div>

        {/* Configuration Editor */}
        {showEditor && (
          <div 
            className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border border-yellow-500/30 overflow-hidden"
            style={{
              opacity: Math.min((time - 2) * 0.5, 1),
              transform: `scale(${Math.min(1, 0.95 + (time - 2) * 0.025)})`,
              transition: 'all 0.5s ease-out'
            }}
          >
            {/* Editor Header */}
            <div className="bg-gray-800 px-6 py-3 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-sm text-gray-400 font-mono">jmx_exporter.yml</span>
            </div>
            
            {/* Editor Content */}
            <div className="p-6 font-mono text-sm overflow-auto max-h-[400px]">
              {configLines.map((line, idx) => {
                const isComment = line.trim().startsWith('#');
                const isKey = line.includes(':') && !isComment;
                const isPattern = line.trim().startsWith('- pattern:');
                
                return (
                  <div 
                    key={idx} 
                    className="leading-relaxed"
                    style={{
                      opacity: Math.min((time - 2 - idx * 0.1) * 2, 1),
                      transform: `translateX(${Math.max(0, -10 + (time - 2 - idx * 0.1) * 10)}px)`
                    }}
                  >
                    <span className={
                      isComment ? 'text-gray-500' :
                      isKey ? 'text-blue-400' :
                      isPattern ? 'text-purple-400' :
                      line.includes('"') ? 'text-green-400' :
                      'text-gray-300'
                    }>
                      {line || '\u00A0'}
                    </span>
                  </div>
                );
              })}
              {configLines.length < fullConfig.length && (
                <span className="text-yellow-500 animate-pulse">|</span>
              )}
            </div>
          </div>
        )}

        {/* Explanation */}
        {showExplanation && (
          <div 
            className="mt-8 grid grid-cols-2 gap-6"
            style={{
              opacity: Math.min((time - 10) * 0.5, 1),
              transform: `translateY(${Math.max(0, 20 - (time - 10) * 10)}px)`
            }}
          >
            <div className="bg-gray-900/60 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-yellow-300 mb-3">Pattern Matching</h3>
              <p className="text-sm text-gray-400">
                JMX MBean names are matched using regex patterns and transformed into Prometheus metric names with labels.
              </p>
            </div>
            <div className="bg-gray-900/60 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-orange-300 mb-3">Metric Types</h3>
              <p className="text-sm text-gray-400">
                GAUGE for values that can go up or down, COUNTER for cumulative metrics.
              </p>
            </div>
          </div>
        )}

        {/* Run Command */}
        {showCommand && (
          <div 
            className="mt-8 bg-black/60 rounded-xl p-6 border border-yellow-500/30"
            style={{
              opacity: Math.min((time - 12) * 0.5, 1),
              transform: `translateY(${Math.max(0, 20 - (time - 12) * 10)}px)`
            }}
          >
            <p className="text-sm text-gray-400 mb-3">Start the JMX Exporter:</p>
            <code className="text-green-400 font-mono">
              java -javaagent:jmx_prometheus_javaagent.jar=9404:jmx_exporter.yml
            </code>
          </div>
        )}

        {/* Progress Bar */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-96">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JMXExporterConfigScene;