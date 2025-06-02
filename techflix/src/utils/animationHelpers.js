// Animation Helper Functions for Cinematic Storytelling

export const getTimeBasedValue = (currentTime, startTime, duration, startValue, endValue, easing = 'linear') => {
  const endTime = startTime + duration;
  if (currentTime < startTime) return startValue
  if (currentTime > endTime) return endValue
  
  const progress = (currentTime - startTime) / (endTime - startTime);
  let easedProgress = progress;
  
  if (easing && easings[easing]) {
    easedProgress = easings[easing](progress);
  }
  
  return startValue + (endValue - startValue) * easedProgress;
}

export const getSceneState = (time, sceneStart, sceneDuration) => {
  const sceneEnd = sceneStart + sceneDuration;
  const fadeInDuration = 0.5;
  const fadeOutDuration = 0.5;
  
  if (time < sceneStart) return 'hidden';
  if (time < sceneStart + fadeInDuration) return 'entering';
  if (time < sceneEnd - fadeOutDuration) return 'active';
  if (time < sceneEnd) return 'exiting';
  return 'hidden';
};

export const getScenePhaseState = (time, phases) => {
  for (const [name, phase] of Object.entries(phases)) {
    if (time >= phase.start && time < phase.start + phase.duration) {
      return {
        phase: name,
        progress: (time - phase.start) / phase.duration,
        localTime: time - phase.start
      }
    }
  }
  return { phase: 'end', progress: 1, localTime: 0 }
}

export const getTextRevealStyle = (time, startTime, duration = 1) => {
  const progress = Math.max(0, Math.min(1, (time - startTime) / duration))
  
  return {
    opacity: progress,
    transform: `translateY(${(1 - progress) * 30}px)`,
    filter: `blur(${(1 - progress) * 10}px)`
  }
}

export const getCameraTransform = (time, movements) => {
  let transform = ''
  
  for (const move of movements) {
    if (time >= move.start && time <= move.end) {
      const progress = (time - move.start) / (move.end - move.start)
      const x = move.fromX + (move.toX - move.fromX) * progress
      const scale = move.fromScale + (move.toScale - move.fromScale) * progress
      transform = `translateX(${x}px) scale(${scale})`
      break
    }
  }
  
  return transform
}

// Animation Orchestrator for complex scene animations
export class AnimationOrchestrator {
  constructor(duration) {
    this.duration = duration
    this.animations = []
  }

  add(startTime, endTime, onUpdate) {
    this.animations.push({ startTime, endTime, onUpdate })
    return this
  }

  update(time) {
    this.animations.forEach(anim => {
      if (time >= anim.startTime && time <= anim.endTime) {
        const localProgress = (time - anim.startTime) / (anim.endTime - anim.startTime)
        anim.onUpdate(localProgress, time)
      }
    })
  }
}

// Easing functions
export const easings = {
  linear: t => t,
  easeInQuad: t => t * t,
  easeOutQuad: t => t * (2 - t),
  easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: t => t * t * t,
  easeOutCubic: t => (--t) * t * t + 1,
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: t => t * t * t * t,
  easeOutQuart: t => 1 - (--t) * t * t * t,
  easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
  easeInQuint: t => t * t * t * t * t,
  easeOutQuint: t => 1 + (--t) * t * t * t * t,
  easeInOutQuint: t => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
  easeInExpo: t => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: t => {
    if (t === 0 || t === 1) return t
    if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2
    return (2 - Math.pow(2, -20 * t + 10)) / 2
  },
  easeInCirc: t => 1 - Math.sqrt(1 - Math.pow(t, 2)),
  easeOutCirc: t => Math.sqrt(1 - Math.pow(t - 1, 2)),
  easeInOutCirc: t => {
    if (t < 0.5) return (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
    return (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2
  },
  easeInBack: t => 2.70158 * t * t * t - 1.70158 * t * t,
  easeOutBack: t => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
  easeInOutBack: t => {
    const c1 = 1.70158
    const c2 = c1 * 1.525
    if (t < 0.5) return (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    return (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2
  },
  easeInElastic: t => {
    if (t === 0 || t === 1) return t
    return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * (2 * Math.PI) / 3)
  },
  easeOutElastic: t => {
    if (t === 0 || t === 1) return t
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1
  },
  easeInOutElastic: t => {
    if (t === 0 || t === 1) return t
    if (t < 0.5) return -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * (2 * Math.PI) / 4.5)) / 2
    return (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * (2 * Math.PI) / 4.5)) / 2 + 1
  },
  easeInBounce: t => 1 - easings.easeOutBounce(1 - t),
  easeOutBounce: t => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
    }
  },
  easeInOutBounce: t => {
    if (t < 0.5) return easings.easeInBounce(t * 2) / 2
    return easings.easeOutBounce(t * 2 - 1) / 2 + 0.5
  }
}

// Interpolation helpers
export const lerp = (start, end, progress) => start + (end - start) * progress

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

export const map = (value, inMin, inMax, outMin, outMax) => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}

// Scene transition helpers
export const fadeTransition = (progress, direction = 'in') => {
  if (direction === 'in') return easings.easeOutQuad(progress)
  return easings.easeInQuad(1 - progress)
}

export const slideTransition = (progress, direction = 'up', distance = 100) => {
  const ease = easings.easeOutExpo(progress)
  const offset = (1 - ease) * distance
  
  switch (direction) {
    case 'up': return { y: offset, opacity: ease }
    case 'down': return { y: -offset, opacity: ease }
    case 'left': return { x: offset, opacity: ease }
    case 'right': return { x: -offset, opacity: ease }
    default: return { opacity: ease }
  }
}

export const scaleTransition = (progress, startScale = 0, endScale = 1) => {
  const ease = easings.easeOutBack(progress)
  return lerp(startScale, endScale, ease)
}

// Staggered animation helper
export const getStaggeredDelay = (index, baseDelay = 0.1, maxDelay = 2) => {
  return Math.min(index * baseDelay, maxDelay);
};

// Counter animation helper
export const getCounterValue = (currentTime, startTime, duration, endValue, startValue = 0) => {
  if (currentTime < startTime) return startValue;
  if (currentTime > startTime + duration) return endValue;
  
  const progress = (currentTime - startTime) / duration;
  const easedProgress = easings.easeOutExpo(progress);
  
  return Math.floor(startValue + (endValue - startValue) * easedProgress);
};

// Typewriter text animation
export const getTypewriterText = (fullText, currentTime, startTime, charsPerSecond = 30) => {
  if (currentTime < startTime) return '';
  
  const elapsed = currentTime - startTime;
  const charsToShow = Math.floor(elapsed * charsPerSecond);
  
  return fullText.substring(0, charsToShow);
};

// Particle system generator
export const generateParticles = (count = 50, colors = ['#3b82f6', '#8b5cf6', '#10b981']) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5
  }));
};