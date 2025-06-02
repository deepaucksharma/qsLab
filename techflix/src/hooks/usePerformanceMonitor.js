import { useEffect, useRef } from 'react';
import logger from '../utils/logger';

// Hook to monitor component performance
export const usePerformanceMonitor = (componentName, props = {}) => {
  const renderCount = useRef(0);
  const mountTime = useRef(null);
  const lastRenderTime = useRef(null);

  useEffect(() => {
    // Component mount
    mountTime.current = performance.now();
    logger.debug(`Component mounted: ${componentName}`, {
      props: Object.keys(props),
      timestamp: mountTime.current
    });

    // Component unmount
    return () => {
      const lifetime = performance.now() - mountTime.current;
      logger.debug(`Component unmounted: ${componentName}`, {
        lifetime: `${lifetime.toFixed(2)}ms`,
        totalRenders: renderCount.current
      });
    };
  }, [componentName]);

  useEffect(() => {
    // Track renders
    renderCount.current += 1;
    const now = performance.now();
    const timeSinceLastRender = lastRenderTime.current 
      ? now - lastRenderTime.current 
      : 0;
    
    lastRenderTime.current = now;

    if (renderCount.current > 1) {
      logger.debug(`Component re-rendered: ${componentName}`, {
        renderCount: renderCount.current,
        timeSinceLastRender: `${timeSinceLastRender.toFixed(2)}ms`,
        propsChanged: Object.keys(props)
      });
    }
  });
};

// Hook to measure specific operations
export const useOperationTimer = (operationName) => {
  const timerRef = useRef(null);

  const startTimer = () => {
    timerRef.current = performance.now();
    logger.startTimer(operationName);
  };

  const endTimer = (metadata = {}) => {
    if (timerRef.current) {
      const duration = performance.now() - timerRef.current;
      logger.endTimer(operationName, metadata);
      timerRef.current = null;
      return duration;
    }
    return null;
  };

  return { startTimer, endTimer };
};

// Hook to monitor network requests
export const useNetworkMonitor = () => {
  useEffect(() => {
    // Intercept fetch requests
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const [url, options] = args;
      
      logger.debug('Network request started', {
        url: typeof url === 'string' ? url : url.toString(),
        method: options?.method || 'GET'
      });

      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;
        
        logger.info('Network request completed', {
          url: typeof url === 'string' ? url : url.toString(),
          status: response.status,
          duration: `${duration.toFixed(2)}ms`,
          ok: response.ok
        });

        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        
        logger.error('Network request failed', {
          url: typeof url === 'string' ? url : url.toString(),
          error: error.message,
          duration: `${duration.toFixed(2)}ms`
        });

        throw error;
      }
    };

    // Cleanup
    return () => {
      window.fetch = originalFetch;
    };
  }, []);
};

// Hook to monitor memory usage
export const useMemoryMonitor = (intervalMs = 10000) => {
  useEffect(() => {
    if (!performance.memory) {
      logger.debug('Memory monitoring not available in this browser');
      return;
    }

    const checkMemory = () => {
      const memory = performance.memory;
      const usedMB = (memory.usedJSHeapSize / 1048576).toFixed(2);
      const totalMB = (memory.totalJSHeapSize / 1048576).toFixed(2);
      const limitMB = (memory.jsHeapSizeLimit / 1048576).toFixed(2);

      logger.debug('Memory usage', {
        usedMB,
        totalMB,
        limitMB,
        percentUsed: `${((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2)  }%`
      });

      // Warn if memory usage is high
      if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.9) {
        logger.warn('High memory usage detected', {
          usedMB,
          limitMB,
          percentUsed: `${((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2)  }%`
        });
      }
    };

    const interval = setInterval(checkMemory, intervalMs);
    checkMemory(); // Initial check

    return () => clearInterval(interval);
  }, [intervalMs]);
};