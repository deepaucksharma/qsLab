import logger from './logger';

// Error tracking service abstraction
class ErrorTracker {
  constructor() {
    this.queue = [];
    this.isInitialized = false;
    this.config = {
      maxBreadcrumbs: 100,
      maxErrors: 50,
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_APP_VERSION || '1.0.0'
    };
    
    // Initialize error tracking
    this.init();
  }

  init() {
    // Set up global error handlers
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
    
    // Override console.error to capture errors
    const originalError = console.error;
    console.error = (...args) => {
      this.captureMessage('Console Error', { extra: { arguments: args } });
      originalError.apply(console, args);
    };
    
    this.isInitialized = true;
    logger.info('Error tracking initialized');
  }

  handleError(event) {
    const { error, message, source, lineno, colno } = event;
    
    this.captureException(error || new Error(message), {
      tags: {
        source: 'window.onerror'
      },
      extra: {
        source,
        lineno,
        colno
      }
    });
  }

  handlePromiseRejection(event) {
    this.captureException(new Error(event.reason), {
      tags: {
        source: 'unhandledrejection'
      },
      extra: {
        promise: event.promise,
        reason: event.reason
      }
    });
  }

  captureException(error, context = {}) {
    if (!error) return;
    
    const errorInfo = {
      name: error.name || 'Error',
      message: error.message || 'Unknown error',
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...context
    };
    
    // Add to queue
    this.queue.push({
      type: 'exception',
      data: errorInfo
    });
    
    // Log locally
    logger.error('Exception captured', errorInfo);
    
    // Process queue
    this.processQueue();
  }

  captureMessage(message, context = {}) {
    const messageInfo = {
      message,
      timestamp: new Date().toISOString(),
      level: context.level || 'info',
      ...context
    };
    
    this.queue.push({
      type: 'message',
      data: messageInfo
    });
    
    logger.info('Message captured', messageInfo);
    this.processQueue();
  }

  addBreadcrumb(breadcrumb) {
    const breadcrumbData = {
      timestamp: new Date().toISOString(),
      ...breadcrumb
    };
    
    // Store breadcrumbs in session storage
    const breadcrumbs = this.getBreadcrumbs();
    breadcrumbs.push(breadcrumbData);
    
    // Keep only last N breadcrumbs
    if (breadcrumbs.length > this.config.maxBreadcrumbs) {
      breadcrumbs.shift();
    }
    
    sessionStorage.setItem('errorTrackerBreadcrumbs', JSON.stringify(breadcrumbs));
  }

  getBreadcrumbs() {
    try {
      return JSON.parse(sessionStorage.getItem('errorTrackerBreadcrumbs') || '[]');
    } catch {
      return [];
    }
  }

  setUser(user) {
    this.user = user;
    logger.info('User context set', { userId: user.id });
  }

  setContext(key, value) {
    this.context = this.context || {};
    this.context[key] = value;
  }

  processQueue() {
    if (this.queue.length === 0) return;
    
    // In production, send to error tracking service
    if (import.meta.env.PROD && import.meta.env.VITE_ERROR_TRACKING_URL) {
      const errors = this.queue.splice(0, this.config.maxErrors);
      
      fetch(import.meta.env.VITE_ERROR_TRACKING_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          errors,
          breadcrumbs: this.getBreadcrumbs(),
          user: this.user,
          context: this.context,
          config: this.config
        })
      }).catch(err => {
        logger.error('Failed to send errors to tracking service', err);
      });
    } else {
      // In development, just clear the queue
      this.queue = [];
    }
  }

  // React Error Boundary integration
  captureComponentError(error, errorInfo) {
    this.captureException(error, {
      tags: {
        source: 'react-error-boundary'
      },
      extra: {
        componentStack: errorInfo.componentStack
      }
    });
  }

  // Performance tracking
  capturePerformance(metric) {
    this.addBreadcrumb({
      category: 'performance',
      message: `${metric.name}: ${metric.value}`,
      level: 'info',
      data: metric
    });
  }

  // User actions tracking
  captureUserAction(action, data = {}) {
    this.addBreadcrumb({
      category: 'user',
      message: action,
      level: 'info',
      data
    });
  }

  // Navigation tracking
  captureNavigation(from, to) {
    this.addBreadcrumb({
      category: 'navigation',
      message: `Navigated from ${from} to ${to}`,
      level: 'info',
      data: { from, to }
    });
  }

  // API errors tracking
  captureApiError(url, status, error) {
    this.captureException(error || new Error(`API Error: ${status}`), {
      tags: {
        source: 'api'
      },
      extra: {
        url,
        status,
        method: error?.config?.method
      }
    });
  }
}

// Create singleton instance
const errorTracker = new ErrorTracker();

// Export for global access
if (typeof window !== 'undefined') {
  window.errorTracker = errorTracker;
}

export default errorTracker;