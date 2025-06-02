import React, { useEffect, useRef } from 'react';
import logger from '../utils/logger';

/**
 * Wrapper component for scenes that ensures proper cleanup
 * Helps prevent memory leaks by cleaning up animations, timers, and event listeners
 */
const SceneWrapper = ({ component: SceneComponent, time, duration, sceneId, ...props }) => {
  const animationFrames = useRef([]);
  const timers = useRef([]);
  const eventListeners = useRef([]);
  const isMounted = useRef(true);

  // Override global functions to track resources
  useEffect(() => {
    // Store original functions
    const originalRAF = window.requestAnimationFrame;
    const originalSetTimeout = window.setTimeout;
    const originalSetInterval = window.setInterval;
    const originalAddEventListener = EventTarget.prototype.addEventListener;

    // Override requestAnimationFrame
    window.requestAnimationFrame = function(callback) {
      if (isMounted.current) {
        const id = originalRAF.call(window, (...args) => {
          if (isMounted.current) {
            callback(...args);
          }
        });
        animationFrames.current.push(id);
        return id;
      }
      return 0;
    };

    // Override setTimeout
    window.setTimeout = function(callback, delay, ...args) {
      if (isMounted.current) {
        const id = originalSetTimeout.call(window, (...timerArgs) => {
          if (isMounted.current) {
            callback(...timerArgs);
          }
        }, delay, ...args);
        timers.current.push(id);
        return id;
      }
      return 0;
    };

    // Override setInterval
    window.setInterval = function(callback, delay, ...args) {
      if (isMounted.current) {
        const id = originalSetInterval.call(window, (...timerArgs) => {
          if (isMounted.current) {
            callback(...timerArgs);
          }
        }, delay, ...args);
        timers.current.push(id);
        return id;
      }
      return 0;
    };

    // Override addEventListener to track listeners
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (isMounted.current) {
        eventListeners.current.push({ target: this, type, listener, options });
        originalAddEventListener.call(this, type, listener, options);
      }
    };

    // Cleanup function
    return () => {
      isMounted.current = false;

      // Restore original functions
      window.requestAnimationFrame = originalRAF;
      window.setTimeout = originalSetTimeout;
      window.setInterval = originalSetInterval;
      EventTarget.prototype.addEventListener = originalAddEventListener;

      // Cancel all animation frames
      animationFrames.current.forEach(id => {
        window.cancelAnimationFrame(id);
      });

      // Clear all timers
      timers.current.forEach(id => {
        window.clearTimeout(id);
        window.clearInterval(id);
      });

      // Remove all event listeners
      eventListeners.current.forEach(({ target, type, listener, options }) => {
        try {
          target.removeEventListener(type, listener, options);
        } catch (e) {
          // Target might be gone
        }
      });

      // Clear arrays
      animationFrames.current = [];
      timers.current = [];
      eventListeners.current = [];

      logger.debug('Scene cleanup complete', { sceneId });
    };
  }, [sceneId]);

  // Additional cleanup on unmount
  useEffect(() => {
    return () => {
      // Force garbage collection hints
      if (window.gc) {
        window.gc();
      }
    };
  }, []);

  if (!SceneComponent) {
    return null;
  }

  return (
    <SceneComponent
      time={time}
      duration={duration}
      {...props}
    />
  );
};

export default SceneWrapper;