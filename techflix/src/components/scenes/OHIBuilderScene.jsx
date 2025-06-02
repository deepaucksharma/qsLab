import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, FolderOpen, FileCode, Terminal, CheckCircle, Package, Zap, GitBranch } from 'lucide-react';
import '../../styles/techflix-cinematic-v2.css';

const OHIBuilderScene = ({ time, duration }) => {
  const progress = (time / duration) * 100;
  const [currentLine, setCurrentLine] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState([]);

  // 5-phase storytelling structure
  const phase = useMemo(() => {
    if (time < 2) return 'intro';
    if (time < 6) return 'phase2'; // File tree and code setup
    if (time < 12) return 'phase3'; // Code writing
    if (time < 17) return 'phase4'; // Build and test
    return 'conclusion';
  }, [time]);

  // Code content with syntax highlighting info
  const codeLines = [
    { text: 'package main', type: 'keyword' },
    { text: '', type: 'normal' },
    { text: 'import (', type: 'keyword' },
    { text: '    "context"', type: 'string' },
    { text: '    "fmt"', type: 'string' },
    { text: '    "log"', type: 'string' },
    { text: '    ', type: 'normal' },
    { text: '    "github.com/newrelic/infra-integrations-sdk/v4/integration"', type: 'string' },
    { text: '    "github.com/prometheus/client_golang/api"', type: 'string' },
    { text: '    v1 "github.com/prometheus/client_golang/api/prometheus/v1"', type: 'string' },
    { text: ')', type: 'keyword' },
    { text: '', type: 'normal' },
    { text: 'const (', type: 'keyword' },
    { text: '    integrationName    = "com.newrelic.kafka.sharegroups"', type: 'const' },
    { text: '    integrationVersion = "1.0.0"', type: 'const' },
    { text: ')', type: 'keyword' },
    { text: '', type: 'normal' },
    { text: 'func main() {', type: 'function' },
    { text: '    // Create New Relic integration', type: 'comment' },
    { text: '    i, err := integration.New(integrationName, integrationVersion)', type: 'normal' },
    { text: '    if err != nil {', type: 'keyword' },
    { text: '        log.Fatal(err)', type: 'normal' },
    { text: '    }', type: 'keyword' },
    { text: '', type: 'normal' },
    { text: '    // Connect to Prometheus endpoint', type: 'comment' },
    { text: '    client, err := api.NewClient(api.Config{', type: 'normal' },
    { text: '        Address: "http://localhost:9404",', type: 'string' },
    { text: '    })', type: 'normal' },
    { text: '', type: 'normal' },
    { text: '    // Query Share Group metrics', type: 'comment' },
    { text: '    metrics, err := queryShareGroupMetrics(client)', type: 'normal' },
    { text: '', type: 'normal' },
    { text: '    // Create QueueSample events', type: 'comment' },
    { text: '    for _, metric := range metrics {', type: 'keyword' },
    { text: '        entity := i.Entity("kafka-sharegroup", metric.QueueName)', type: 'normal' },
    { text: '        event := entity.NewEvent("QueueSample")', type: 'normal' },
    { text: '        ', type: 'normal' },
    { text: '        // Set required attributes', type: 'comment' },
    { text: '        event.SetAttribute("provider", "kafka-sharegroup")', type: 'normal' },
    { text: '        event.SetAttribute("queue.name", metric.QueueName)', type: 'normal' },
    { text: '        event.SetAttribute("queue.depth", metric.RecordsUnacked)', type: 'normal' },
    { text: '    }', type: 'keyword' },
    { text: '', type: 'normal' },
    { text: '    // Publish to New Relic', type: 'comment' },
    { text: '    i.Publish()', type: 'normal' },
    { text: '}', type: 'function' }
  ];

  // File tree structure
  const fileTree = [
    { name: 'nri-kafka-sharegroups/', type: 'folder', icon: <FolderOpen className="w-4 h-4" />, expanded: true },
    { name: '  main.go', type: 'file', icon: <FileCode className="w-4 h-4" />, active: true },
    { name: '  config.yml', type: 'file', icon: <FileCode className="w-4 h-4" /> },
    { name: '  Makefile', type: 'file', icon: <FileCode className="w-4 h-4" /> },
    { name: '  go.mod', type: 'file', icon: <FileCode className="w-4 h-4" /> },
    { name: '  test/', type: 'folder', icon: <FolderOpen className="w-4 h-4" /> },
    { name: '    main_test.go', type: 'file', icon: <FileCode className="w-4 h-4" /> },
    { name: '  README.md', type: 'file', icon: <FileCode className="w-4 h-4" /> }
  ];

  // Progressive code reveal
  useEffect(() => {
    if (phase === 'phase3') {
      const linesPerSecond = 4;
      const targetLine = Math.min(Math.floor((time - 6) * linesPerSecond), codeLines.length);
      setCurrentLine(targetLine);
    }
  }, [time, phase]);

  // Terminal output animation
  useEffect(() => {
    if (phase === 'phase4') {
      const outputs = [
        { time: 13, text: '$ make build', type: 'command' },
        { time: 13.5, text: 'Building OHI integration...', type: 'info' },
        { time: 14, text: '✓ Dependencies resolved', type: 'success' },
        { time: 14.5, text: '✓ Compiled successfully', type: 'success' },
        { time: 15, text: '$ make test', type: 'command' },
        { time: 15.5, text: 'Running tests...', type: 'info' },
        { time: 16, text: '✓ All tests passed (4/4)', type: 'success' },
        { time: 16.5, text: '✓ Integration ready for deployment', type: 'success' }
      ];
      
      const currentOutputs = outputs.filter(o => time >= o.time);
      setTerminalOutput(currentOutputs);
    }
  }, [time, phase]);

  // Get syntax highlighting color
  const getSyntaxColor = (type) => {
    switch (type) {
      case 'keyword': return 'text-purple-400';
      case 'string': return 'text-green-400';
      case 'comment': return 'text-gray-500';
      case 'function': return 'text-blue-400';
      case 'const': return 'text-orange-400';
      default: return 'text-gray-300';
    }
  };

  // Get terminal output color
  const getTerminalColor = (type) => {
    switch (type) {
      case 'command': return 'text-blue-400';
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'info': return 'text-gray-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="scene-container-v2">
      <div className="scene-content">
        <div className="flex flex-col items-center justify-center min-h-full py-12">
          {/* Title */}
          <AnimatePresence>
            {phase === 'intro' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <h1 className="scene-title">Building Custom OHI</h1>
                <p className="scene-subtitle">New Relic Integration for Share Groups</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* IDE Layout */}
          <AnimatePresence>
            {(phase === 'phase2' || phase === 'phase3') && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-7xl"
              >
                <div className="metric-card-v2 p-0 overflow-hidden">
                  {/* IDE Header */}
                  <div className="bg-gray-900 p-3 border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-blue-400" />
                      <span className="text-sm text-gray-300">OHI Development Environment</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                  </div>

                  {/* IDE Content */}
                  <div className="flex h-[600px]">
                    {/* File Tree */}
                    <div className="w-64 bg-gray-900/50 border-r border-gray-800 p-4">
                      <div className="space-y-1">
                        {fileTree.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center gap-2 py-1 px-2 rounded ${
                              item.active ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800/50'
                            }`}
                          >
                            {item.icon}
                            <span className="text-sm">{item.name}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Code Editor */}
                    <div className="flex-1 bg-gray-900/30 p-6 overflow-auto">
                      <pre className="font-mono text-sm">
                        {codeLines.map((line, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ 
                              opacity: index <= currentLine ? 1 : 0.1
                            }}
                            transition={{ duration: 0.3 }}
                            className="leading-relaxed"
                          >
                            <span className="text-gray-600 select-none mr-4">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <span className={getSyntaxColor(line.type)}>
                              {line.text}
                            </span>
                          </motion.div>
                        ))}
                      </pre>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Terminal Output */}
          <AnimatePresence>
            {phase === 'phase4' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-5xl mt-8"
              >
                <div className="metric-card-v2 p-0 overflow-hidden">
                  {/* Terminal Header */}
                  <div className="bg-gray-900 p-3 border-b border-gray-800 flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-gray-300">Terminal - Build & Test</span>
                  </div>

                  {/* Terminal Content */}
                  <div className="bg-black/50 p-6 font-mono text-sm h-64 overflow-auto">
                    {terminalOutput.map((output, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`mb-2 ${getTerminalColor(output.type)}`}
                      >
                        {output.text}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success State */}
          <AnimatePresence>
            {phase === 'conclusion' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="mb-8"
                >
                  <CheckCircle className="w-24 h-24 text-green-400 mx-auto" />
                </motion.div>
                
                <h2 className="text-3xl font-bold mb-4 text-gray-200">
                  OHI Integration Complete!
                </h2>
                
                <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                  Your custom integration now bridges Kafka Share Groups metrics to New Relic's 
                  Queues UI, providing native observability for your streaming infrastructure.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  {[
                    { icon: <Package className="w-8 h-8" />, label: 'Ready to Deploy' },
                    { icon: <Zap className="w-8 h-8" />, label: 'Real-time Metrics' },
                    { icon: <GitBranch className="w-8 h-8" />, label: 'Version Controlled' }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="metric-card-v2 p-4"
                    >
                      <div className="text-blue-400 mb-2">{item.icon}</div>
                      <div className="text-gray-300">{item.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default OHIBuilderScene;