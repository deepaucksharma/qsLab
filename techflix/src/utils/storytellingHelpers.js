// Helper functions for storytelling components

export const getStaggeredDelay = (index, baseDelay = 0.1, maxDelay = 2) => {
  return Math.min(index * baseDelay, maxDelay);
};

export const getCounterValue = (currentTime, startTime, duration, endValue, startValue = 0) => {
  if (currentTime < startTime) return startValue;
  if (currentTime > startTime + duration) return endValue;
  
  const progress = (currentTime - startTime) / duration;
  const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
  
  return Math.floor(startValue + (endValue - startValue) * easedProgress);
};