import { onCLS, onFCP, onFID, onLCP, onTTFB, onINP } from 'web-vitals';
import logger from './logger';

const vitalsUrl = import.meta.env.VITE_ANALYTICS_URL;

// Send analytics data to your analytics endpoint
function sendToAnalytics(metric) {
  const body = JSON.stringify({
    id: metric.id,
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    navigationType: metric.navigationType,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent
  });

  // Log the metric
  logger.info(`Web Vital: ${metric.name}`, {
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta
  });

  // Send to analytics endpoint if configured
  if (vitalsUrl) {
    fetch(vitalsUrl, {
      body,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      keepalive: true
    }).catch(error => {
      logger.error('Failed to send analytics', error);
    });
  }

  // Also send to console in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vital] ${metric.name}:`, metric.value, metric.rating);
  }
}

// Report all web vitals
export function reportWebVitals() {
  onCLS(sendToAnalytics);
  onFCP(sendToAnalytics);
  onFID(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
  onINP(sendToAnalytics);
}

// Get current performance metrics
export function getPerformanceMetrics() {
  const navigation = performance.getEntriesByType('navigation')[0];
  const paint = performance.getEntriesByType('paint');
  
  const metrics = {
    // Navigation timing
    domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
    loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
    
    // Paint timing
    firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime,
    firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
    
    // Resource timing
    resources: performance.getEntriesByType('resource').length,
    
    // Memory usage (if available)
    memory: performance.memory ? {
      usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1048576),
      totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1048576),
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
    } : null
  };

  return metrics;
}

// Performance observer for long tasks
export function observeLongTasks(callback) {
  if (!('PerformanceObserver' in window)) {
    return;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Tasks longer than 50ms
          logger.warn('Long task detected', {
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name
          });
          
          if (callback) {
            callback(entry);
          }
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
    
    return () => observer.disconnect();
  } catch (error) {
    logger.error('Failed to observe long tasks', error);
  }
}