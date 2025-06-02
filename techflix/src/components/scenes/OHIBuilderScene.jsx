import React, { useState, useEffect } from 'react';

const OHIBuilderScene = ({ time, duration }) => {
  const progress = (time / duration) * 100;
  const [currentLine, setCurrentLine] = useState(0);
  const [showFileTree, setShowFileTree] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState([]);

  // Code content
  const codeLines = [
    'package main',
    '',
    'import (',
    '    "context"',
    '    "fmt"',
    '    "log"',
    '    ',
    '    "github.com/newrelic/infra-integrations-sdk/v4/integration"',
    '    "github.com/prometheus/client_golang/api"',
    '    v1 "github.com/prometheus/client_golang/api/prometheus/v1"',
    ')',
    '',
    'const (',
    '    integrationName    = "com.newrelic.kafka.sharegroups"',
    '    integrationVersion = "1.0.0"',
    ')',
    '',
    'func main() {',
    '    // Create New Relic integration',
    '    i, err := integration.New(integrationName, integrationVersion)',
    '    if err != nil {',
    '        log.Fatal(err)',
    '    }',
    '',
    '    // Connect to Prometheus endpoint',
    '    client, err := api.NewClient(api.Config{',
    '        Address: "http://localhost:9404",',
    '    })',
    '',
    '    // Query Share Group metrics',
    '    metrics, err := queryShareGroupMetrics(client)',
    '',
    '    // Create QueueSample events',
    '    for _, metric := range metrics {',
    '        entity := i.Entity("kafka-sharegroup", metric.QueueName)',
    '        event := entity.NewEvent("QueueSample")',
    '        ',
    '        // Set required attributes',
    '        event.SetAttribute("provider", "kafka-sharegroup")',
    '        event.SetAttribute("queue.name", metric.QueueName)',
    '        event.SetAttribute("queue.depth", metric.RecordsUnacked)',
    '    }',
    '',
    '    // Publish to New Relic',
    '    i.Publish()',
    '}'
  ];

  // File tree structure
  const fileTree = [
    { name: 'nri-kafka-sharegroups/', type: 'folder', expanded: true },
    { name: '  main.go', type: 'file', active: true },
    { name: '  config.yml', type: 'file' },
    { name: '  Makefile', type: 'file' },
    { name: '  go.mod', type: 'file' },
    { name: '  test/', type: 'folder' },
    { name: '    main_test.go', type: 'file' },
    { name: '  README.md', type: 'file' }
  ];

  // Progressive code reveal
  useEffect(() => {
    if (time > 2) {
      const linesPerSecond = 5;
      const visibleLines = Math.floor((time - 2) * linesPerSecond);
      setCurrentLine(Math.min(visibleLines, codeLines.length));
    }
    
    if (time > 3) setShowFileTree(true);
    if (time > 10) setShowTerminal(true);
    
    // Terminal output simulation
    if (time > 11) setTerminalOutput(['$ make build']);
    if (time > 12) setTerminalOutput(prev => [...prev, '✓ Building nri-kafka-sharegroups...', '✓ Binary created at ./bin/nri-kafka-sharegroups']);
    if (time > 14) setTerminalOutput(prev => [...prev, '', '$ make test']);
    if (time > 15) setTerminalOutput(prev => [...prev, 'Running tests...', 'PASS: TestQueryMetrics', 'PASS: TestCreateEntity', 'PASS: TestPublishEvents', '✓ All tests passed (15/15)']);
    if (time > 17) setTerminalOutput(prev => [...prev, '', '$ sudo make install']);
    if (time > 18) setTerminalOutput(prev => [...prev, '✓ Installed to /var/db/newrelic-infra/custom-integrations/']);
  }, [time]);

  const showIDE = time > 1;
  const showSuccess = time > 19;

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-indigo-900 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Code Rain Background */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-green-500 font-mono text-xs"
            style={{
              left: `${Math.random() * 100}%`,
              animation: `code-fall ${10 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          >
            {Array(20).fill(null).map((_, j) => (
              <div key={j}>{Math.random() > 0.5 ? '1' : '0'}</div>
            ))}
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-7xl">
        {/* Title */}
        <div className="text-center mb-8" style={{ opacity: Math.min(time * 0.5, 1) }}>
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Building Your Custom OHI
          </h1>
          <p className="text-2xl text-gray-300">Go Development in Action</p>
        </div>

        {/* IDE Container */}
        {showIDE && (
          <div 
            className="bg-gray-900/90 backdrop-blur-lg rounded-2xl overflow-hidden border border-indigo-500/30"
            style={{
              opacity: Math.min((time - 1) * 0.5, 1),
              transform: `scale(${Math.min(1, 0.95 + (time - 1) * 0.025)})`,
              transition: 'all 0.5s ease-out'
            }}
          >
            {/* IDE Header */}
            <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-sm text-gray-400">nri-kafka-sharegroups - Visual Studio Code</span>
            </div>

            <div className="flex" style={{ height: '500px' }}>
              {/* File Tree */}
              {showFileTree && (
                <div className="w-64 bg-gray-850 border-r border-gray-700 p-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Explorer</h3>
                  {fileTree.map((item, idx) => (
                    <div
                      key={idx}
                      className={`py-1 px-2 text-sm cursor-pointer hover:bg-gray-700 rounded ${
                        item.active ? 'bg-gray-700 text-white' : 'text-gray-400'
                      }`}
                      style={{
                        opacity: Math.min((time - 3 - idx * 0.1) * 2, 1),
                        transform: `translateX(${Math.max(0, -10 + (time - 3 - idx * 0.1) * 10)}px)`
                      }}
                    >
                      <span className="mr-2">
                        {item.type === 'folder' ? '📁' : '📄'}
                      </span>
                      {item.name}
                    </div>
                  ))}
                </div>
              )}

              {/* Code Editor */}
              <div className="flex-1 bg-gray-900 p-6 overflow-auto">
                <div className="font-mono text-sm">
                  {codeLines.slice(0, currentLine).map((line, idx) => {
                    const isImport = line.includes('import') || (idx > 2 && idx < 11);
                    const isComment = line.trim().startsWith('//');
                    const isString = line.includes('"');
                    const isKeyword = ['package', 'import', 'const', 'func', 'if', 'for', 'return'].some(k => line.includes(k));
                    
                    return (
                      <div key={idx} className="leading-relaxed">
                        <span className="text-gray-600 mr-4 select-none">{String(idx + 1).padStart(2, ' ')}</span>
                        <span className={
                          isComment ? 'text-gray-500' :
                          isImport ? 'text-blue-400' :
                          isKeyword ? 'text-purple-400' :
                          isString ? 'text-green-400' :
                          'text-gray-300'
                        }>
                          {line || '\u00A0'}
                        </span>
                      </div>
                    );
                  })}
                  {currentLine < codeLines.length && (
                    <span className="text-gray-400 animate-pulse">|</span>
                  )}
                </div>
              </div>
            </div>

            {/* Terminal */}
            {showTerminal && (
              <div className="bg-black border-t border-gray-700 p-4 font-mono text-sm">
                <div className="text-gray-400 mb-2">TERMINAL</div>
                {terminalOutput.map((line, idx) => (
                  <div 
                    key={idx} 
                    className={line.includes('✓') ? 'text-green-400' : line.startsWith('$') ? 'text-blue-400' : 'text-gray-300'}
                    style={{
                      opacity: Math.min((time - 11 - idx * 0.5) * 2, 1)
                    }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Success Overlay */}
        {showSuccess && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            style={{
              opacity: Math.min((time - 19) * 0.5, 1)
            }}
          >
            <div className="bg-gray-900/90 rounded-2xl p-8 border border-green-500/50 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-green-400 mb-4">OHI Successfully Built!</h2>
              <p className="text-xl text-gray-300">Ready to collect Share Groups metrics</p>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-96">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes code-fall {
          0% {
            transform: translateY(-100vh);
          }
          100% {
            transform: translateY(100vh);
          }
        }
      `}</style>
    </div>
  );
};

export default OHIBuilderScene;