import { useRef, useCallback, useEffect } from 'react';

/**
 * Hook for precise timing in episode playback
 * Uses performance.now() for accurate timing and handles edge cases
 */
export const usePreciseTiming = () => {
  const startTimeRef = useRef(null);
  const lastUpdateRef = useRef(null);
  const accumulatedTimeRef = useRef(0);

  // Start or resume timing
  const startTiming = useCallback(() => {
    startTimeRef.current = performance.now();
    lastUpdateRef.current = startTimeRef.current;
  }, []);

  // Pause timing and accumulate elapsed time
  const pauseTiming = useCallback(() => {
    if (startTimeRef.current !== null) {
      const now = performance.now();
      const elapsed = (now - startTimeRef.current) / 1000; // Convert to seconds
      accumulatedTimeRef.current += elapsed;
      startTimeRef.current = null;
    }
  }, []);

  // Get current elapsed time in seconds
  const getElapsedTime = useCallback(() => {
    if (startTimeRef.current === null) {
      return accumulatedTimeRef.current;
    }
    const now = performance.now();
    const currentElapsed = (now - startTimeRef.current) / 1000;
    return accumulatedTimeRef.current + currentElapsed;
  }, []);

  // Reset timing
  const resetTiming = useCallback(() => {
    startTimeRef.current = null;
    lastUpdateRef.current = null;
    accumulatedTimeRef.current = 0;
  }, []);

  // Set time directly (for seeking)
  const setTime = useCallback((time) => {
    accumulatedTimeRef.current = time;
    if (startTimeRef.current !== null) {
      startTimeRef.current = performance.now();
      lastUpdateRef.current = startTimeRef.current;
    }
  }, []);

  // Check if timing is active
  const isActive = useCallback(() => {
    return startTimeRef.current !== null;
  }, []);

  // Get time since last update (for frame-based animations)
  const getTimeSinceLastUpdate = useCallback(() => {
    if (lastUpdateRef.current === null) return 0;
    const now = performance.now();
    const delta = (now - lastUpdateRef.current) / 1000;
    lastUpdateRef.current = now;
    return delta;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      startTimeRef.current = null;
      lastUpdateRef.current = null;
    };
  }, []);

  return {
    startTiming,
    pauseTiming,
    getElapsedTime,
    resetTiming,
    setTime,
    isActive,
    getTimeSinceLastUpdate
  };
};