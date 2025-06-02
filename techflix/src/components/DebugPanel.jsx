import { useState, useEffect, useRef } from 'react'
import { Bug, X, Download, Trash2, Clock, AlertCircle, Info } from 'lucide-react'
import logger from '../utils/logger'

const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const logsEndRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    // Check if debug mode is enabled via URL param
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debug') === 'true') {
      setIsOpen(true);
    }

    // Subscribe to logger updates
    const unsubscribe = logger.subscribe((newLog) => {
      setLogs(prevLogs => [...prevLogs.slice(-199), newLog]);
    });

    // Load initial logs
    setLogs(logger.getRecentLogs(200));

    // Keyboard shortcut to toggle debug panel
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      unsubscribe();
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.level !== filter) return false;
    if (searchQuery && !JSON.stringify(log).toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getLevelIcon = (level) => {
    switch (level) {
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warn': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'error': return 'bg-red-900/20 border-red-700';
      case 'warn': return 'bg-yellow-900/20 border-yellow-700';
      case 'info': return 'bg-blue-900/20 border-blue-700';
      default: return 'bg-gray-900/20 border-gray-700';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors z-50"
        title="Open Debug Panel (Ctrl+Shift+D)"
      >
        <Bug className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-gray-800 text-white z-[9999] transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bug className="w-5 h-5" />
            Debug Console
          </h3>
          
          {/* Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-sm ${filter === 'all' ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
            >
              All ({logs.length})
            </button>
            <button
              onClick={() => setFilter('error')}
              className={`px-3 py-1 rounded text-sm ${filter === 'error' ? 'bg-red-700' : 'bg-gray-800 hover:bg-gray-700'}`}
            >
              Errors ({logs.filter(l => l.level === 'error').length})
            </button>
            <button
              onClick={() => setFilter('warn')}
              className={`px-3 py-1 rounded text-sm ${filter === 'warn' ? 'bg-yellow-700' : 'bg-gray-800 hover:bg-gray-700'}`}
            >
              Warnings ({logs.filter(l => l.level === 'warn').length})
            </button>
            <button
              onClick={() => setFilter('info')}
              className={`px-3 py-1 rounded text-sm ${filter === 'info' ? 'bg-blue-700' : 'bg-gray-800 hover:bg-gray-700'}`}
            >
              Info ({logs.filter(l => l.level === 'info').length})
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1 bg-gray-800 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-600"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-scroll toggle */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded"
            />
            Auto-scroll
          </label>

          {/* Actions */}
          <button
            onClick={() => logger.clearLogs()}
            className="p-2 hover:bg-gray-800 rounded"
            title="Clear logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => logger.exportLogs()}
            className="p-2 hover:bg-gray-800 rounded"
            title="Export logs"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-800 rounded"
            title="Close (Ctrl+Shift+D)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Log Level Selector */}
      <div className="px-3 py-2 border-b border-gray-800 flex items-center gap-4">
        <span className="text-sm text-gray-400">Log Level:</span>
        <select
          value={logger.logLevel}
          onChange={(e) => logger.setLogLevel(e.target.value)}
          className="bg-gray-800 text-sm px-2 py-1 rounded"
        >
          <option value="debug">Debug</option>
          <option value="info">Info</option>
          <option value="warn">Warn</option>
          <option value="error">Error</option>
        </select>
      </div>

      {/* Logs */}
      <div className="h-64 overflow-y-auto p-3 space-y-1 font-mono text-sm">
        {filteredLogs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No logs to display
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <div
              key={index}
              className={`p-2 rounded border ${getLevelColor(log.level)} flex items-start gap-2`}
            >
              {getLevelIcon(log.level)}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span className="font-semibold">{log.message}</span>
                </div>
                {Object.keys(log.data).length > 0 && (
                  <pre className="text-xs text-gray-400 mt-1 overflow-x-auto">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Performance Stats */}
      <div className="px-3 py-2 border-t border-gray-800 text-xs text-gray-400 flex items-center justify-between">
        <div>
          Total Logs: {logs.length} | Filtered: {filteredLogs.length}
        </div>
        <div>
          Press Ctrl+Shift+D to toggle debug panel
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;