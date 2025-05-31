/**
 * Neural Learn - Analytics Client
 * Minimal analytics tracking for learning interactions
 */

window.AnalyticsClient = {
  // Session tracking
  sessionId: null,
  userId: null,
  
  // Initialize analytics
  init: function(userId) {
    this.sessionId = this.generateSessionId();
    this.userId = userId;
    this.startSession();
  },
  
  // Generate unique session ID
  generateSessionId: function() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
  
  // Start session
  startSession: function() {
    const sessionData = {
      sessionId: this.sessionId,
      userId: this.userId,
      startTime: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`
    };
    
    // Log session start
    this.logEvent('session_start', sessionData);
  },
  
  // Track page views
  trackPageView: function(page, metadata = {}) {
    this.logEvent('page_view', {
      page: page,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  },
  
  // Track interactions
  trackInteraction: function(action, target, metadata = {}) {
    this.logEvent('interaction', {
      action: action,
      target: target,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  },
  
  // Track learning events
  trackLearning: function(eventType, data = {}) {
    this.logEvent('learning', {
      eventType: eventType,
      timestamp: new Date().toISOString(),
      ...data
    });
  },
  
  // Track errors
  trackError: function(error, context = {}) {
    this.logEvent('error', {
      error: error.message || error,
      stack: error.stack,
      context: context,
      timestamp: new Date().toISOString()
    });
  },
  
  // Log event to server
  logEvent: function(category, data) {
    const event = {
      id: `${this.sessionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.userId,
      eventType: category,
      data: data,
      timestamp: Date.now(),
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    };
    
    // Send to server
    fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        events: [event],
        sessionId: this.sessionId
      })
    }).catch(err => {
      console.error('Analytics error:', err);
    });
  },
  
  // Batch events for performance
  batchEvents: [],
  batchTimeout: null,
  
  // Add event to batch
  addToBatch: function(event) {
    this.batchEvents.push(event);
    
    // Clear existing timeout
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }
    
    // Send batch after delay or when limit reached
    if (this.batchEvents.length >= 10) {
      this.sendBatch();
    } else {
      this.batchTimeout = setTimeout(() => this.sendBatch(), 5000);
    }
  },
  
  // Send batched events
  sendBatch: function() {
    if (this.batchEvents.length === 0) return;
    
    const events = [...this.batchEvents];
    this.batchEvents = [];
    
    fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        events: events,
        sessionId: this.sessionId
      })
    }).catch(err => {
      console.error('Analytics batch error:', err);
      // Re-add events to batch on failure
      this.batchEvents.unshift(...events);
    });
  }
};

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Get user ID from URL or default
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userId') || 'guest';
  
  AnalyticsClient.init(userId);
});

// Track page unload
window.addEventListener('beforeunload', () => {
  AnalyticsClient.logEvent('session_end', {
    duration: Date.now() - parseInt(AnalyticsClient.sessionId.split('_')[1])
  });
});