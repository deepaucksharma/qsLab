import { useEffect, useCallback } from 'react';
import logger from '../utils/logger';

/**
 * Hook to handle page visibility changes and optimize performance
 * Pauses animations, audio, and other resource-intensive operations when tab is not visible
 */
export const usePageVisibility = ({
  onVisible,
  onHidden,
  pauseAnimations = true,
  suspendAudio = true,
  throttleTimers = true
}) => {
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      logger.info('Page visibility: hidden', {
        timestamp: Date.now(),
        visibilityState: document.visibilityState
      });
      
      // Execute hidden callback
      if (onHidden) {
        onHidden();
      }
      
      // Suspend resource-intensive operations
      if (pauseAnimations) {
        // Pause all CSS animations
        document.body.classList.add('animations-paused');
      }
      
      if (suspendAudio && window.audioContext) {
        // Suspend Web Audio API context
        window.audioContext.suspend();
      }
      
      if (throttleTimers) {
        // Store original requestAnimationFrame
        window._originalRAF = window.requestAnimationFrame;
        // Replace with throttled version
        window.requestAnimationFrame = (callback) => {
          return setTimeout(callback, 1000); // Throttle to 1 FPS
        };
      }
    } else {
      logger.info('Page visibility: visible', {
        timestamp: Date.now(),
        visibilityState: document.visibilityState
      });
      
      // Execute visible callback
      if (onVisible) {
        onVisible();
      }
      
      // Resume operations
      if (pauseAnimations) {
        document.body.classList.remove('animations-paused');
      }
      
      if (suspendAudio && window.audioContext) {
        window.audioContext.resume();
      }
      
      if (throttleTimers && window._originalRAF) {
        // Restore original requestAnimationFrame
        window.requestAnimationFrame = window._originalRAF;
        delete window._originalRAF;
      }
    }
  }, [onVisible, onHidden, pauseAnimations, suspendAudio, throttleTimers]);

  useEffect(() => {
    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Check initial visibility state
    if (document.hidden) {
      handleVisibilityChange();
    }
    
    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Ensure we restore everything on unmount
      document.body.classList.remove('animations-paused');
      if (window._originalRAF) {
        window.requestAnimationFrame = window._originalRAF;
        delete window._originalRAF;
      }
    };
  }, [handleVisibilityChange]);
  
  return {
    isVisible: !document.hidden,
    visibilityState: document.visibilityState
  };
};

// CSS to pause animations when page is hidden
const style = document.createElement('style');
style.textContent = `
  .animations-paused,
  .animations-paused * {
    animation-play-state: paused !important;
    transition: none !important;
  }
`;
document.head.appendChild(style);