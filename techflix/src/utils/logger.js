// Logger utility with different log levels and debug features
class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 500;
    this.logLevel = this.getLogLevel();
    this.enableConsole = true;
    this.enableStorage = true;
    this.listeners = new Set();
    
    // Performance tracking
    this.performanceMarks = new Map();
    
    // Initialize
    this.info('Logger initialized', { 
      level: this.logLevel,
      timestamp: new Date().toISOString() 
    });
  }

  getLogLevel() {
    // Check URL params first
    const urlParams = new URLSearchParams(window.location.search);
    const debugParam = urlParams.get('debug');
    if (debugParam !== null) {
      return debugParam === 'true' ? 'debug' : 'info';
    }
    
    // Check localStorage
    const stored = localStorage.getItem('techflix_debug_level');
    if (stored) return stored;
    
    // Default based on environment
    return import.meta.env.DEV ? 'debug' : 'info';
  }

  setLogLevel(level) {
    this.logLevel = level;
    localStorage.setItem('techflix_debug_level', level);
    this.info('Log level changed', { newLevel: level });
  }

  shouldLog(level) {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level] >= levels[this.logLevel];
  }

  formatMessage(level, message, data) {
    const timestamp = new Date().toISOString();
    const formatted = {
      timestamp,
      level,
      message,
      data,
      stackTrace: level === 'error' ? new Error().stack : undefined
    };
    return formatted;
  }

  log(level, message, data = {}) {
    if (!this.shouldLog(level)) return;
    
    const logEntry = this.formatMessage(level, message, data);
    
    // Add to internal storage
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    // Console output
    if (this.enableConsole) {
      const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      const style = this.getConsoleStyle(level);
      console[consoleMethod](
        `%c[${level.toUpperCase()}] ${message}`,
        style,
        data
      );
    }
    
    // Store critical logs
    if (this.enableStorage && (level === 'error' || level === 'warn')) {
      this.storeLog(logEntry);
    }
    
    // Notify listeners
    this.notifyListeners(logEntry);
  }

  getConsoleStyle(level) {
    const styles = {
      debug: 'color: #6B7280; font-weight: normal;',
      info: 'color: #3B82F6; font-weight: normal;',
      warn: 'color: #F59E0B; font-weight: bold;',
      error: 'color: #EF4444; font-weight: bold;'
    };
    return styles[level] || styles.info;
  }

  debug(message, data) {
    this.log('debug', message, data);
  }

  info(message, data) {
    this.log('info', message, data);
  }

  warn(message, data) {
    this.log('warn', message, data);
  }

  error(message, data) {
    this.log('error', message, data);
  }

  // Performance tracking
  startTimer(label) {
    this.performanceMarks.set(label, performance.now());
    this.debug(`Timer started: ${label}`);
  }

  endTimer(label, metadata = {}) {
    const startTime = this.performanceMarks.get(label);
    if (!startTime) {
      this.warn(`Timer not found: ${label}`);
      return;
    }
    
    const duration = performance.now() - startTime;
    this.performanceMarks.delete(label);
    
    this.info(`Timer completed: ${label}`, {
      duration: `${duration.toFixed(2)}ms`,
      ...metadata
    });
    
    return duration;
  }

  // Episode-specific logging
  logEpisodeEvent(event, episodeData = {}) {
    const events = {
      EPISODE_LOAD_START: 'Episode loading started',
      EPISODE_LOAD_COMPLETE: 'Episode loaded successfully',
      EPISODE_LOAD_ERROR: 'Episode loading failed',
      EPISODE_PLAY: 'Episode playback started',
      EPISODE_PAUSE: 'Episode playback paused',
      EPISODE_COMPLETE: 'Episode completed',
      SCENE_TRANSITION: 'Scene transition',
      INTERACTIVE_START: 'Interactive element started',
      INTERACTIVE_COMPLETE: 'Interactive element completed'
    };
    
    const message = events[event] || event;
    const level = event.includes('ERROR') ? 'error' : 'info';
    
    this.log(level, message, {
      event,
      ...episodeData,
      timestamp: Date.now()
    });
  }

  // Scene logging
  logSceneTransition(fromScene, toScene, episodeId) {
    this.info('Scene transition', {
      from: fromScene?.id || 'start',
      to: toScene.id,
      episodeId,
      sceneTitle: toScene.title,
      sceneDuration: toScene.duration
    });
  }

  // Storage for persistent logs
  storeLog(logEntry) {
    try {
      const stored = localStorage.getItem('techflix_error_logs') || '[]';
      const logs = JSON.parse(stored);
      logs.push(logEntry);
      
      // Keep only last 100 error logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('techflix_error_logs', JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to store log:', e);
    }
  }

  // Get stored error logs
  getStoredLogs() {
    try {
      const stored = localStorage.getItem('techflix_error_logs') || '[]';
      return JSON.parse(stored);
    } catch (e) {
      return [];
    }
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    localStorage.removeItem('techflix_error_logs');
    this.info('Logs cleared');
  }

  // Subscribe to log updates
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(logEntry) {
    this.listeners.forEach(callback => {
      try {
        callback(logEntry);
      } catch (e) {
        console.error('Logger listener error:', e);
      }
    });
  }

  // Export logs
  exportLogs() {
    const data = {
      logs: this.logs,
      storedErrors: this.getStoredLogs(),
      metadata: {
        exportTime: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        logLevel: this.logLevel
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `techflix-logs-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.info('Logs exported');
  }

  // Get recent logs
  getRecentLogs(count = 50) {
    return this.logs.slice(-count);
  }

  // Search logs
  searchLogs(query) {
    const lowercaseQuery = query.toLowerCase();
    return this.logs.filter(log => 
      log.message.toLowerCase().includes(lowercaseQuery) ||
      JSON.stringify(log.data).toLowerCase().includes(lowercaseQuery)
    );
  }
}

// Create singleton instance
const logger = new Logger();

// Export for use in other modules
export default logger;

// Also attach to window for debugging
if (typeof window !== 'undefined') {
  window.techflixLogger = logger;
}