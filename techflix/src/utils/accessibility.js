// Accessibility utilities for TechFlix

// Announce message to screen readers
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  
  announcement.textContent = message;
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Trap focus within a modal or dialog
export const trapFocus = (element) => {
  const focusableElements = element.querySelectorAll(
    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusableElement = focusableElements[0];
  const lastFocusableElement = focusableElements[focusableElements.length - 1];
  
  const handleTabKey = (e) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstFocusableElement) {
        lastFocusableElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusableElement) {
        firstFocusableElement.focus();
        e.preventDefault();
      }
    }
  };
  
  element.addEventListener('keydown', handleTabKey);
  firstFocusableElement?.focus();
  
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

// Check if user prefers reduced motion
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Get appropriate animation duration based on user preference
export const getAnimationDuration = (normalDuration) => {
  return prefersReducedMotion() ? 0 : normalDuration;
};

// Skip to content link handler
export const skipToContent = (contentId = 'main-content') => {
  const content = document.getElementById(contentId);
  if (content) {
    content.tabIndex = -1;
    content.focus();
    content.scrollIntoView();
  }
};

// Keyboard navigation helpers
export const KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  TAB: 'Tab'
};

// Handle common keyboard interactions
export const handleKeyboardClick = (event, callback) => {
  if (event.key === KEYS.ENTER || event.key === KEYS.SPACE) {
    event.preventDefault();
    callback(event);
  }
};

// ARIA labels for common UI elements
export const ARIA_LABELS = {
  PLAY: 'Play episode',
  PAUSE: 'Pause episode',
  NEXT: 'Next episode',
  PREVIOUS: 'Previous episode',
  VOLUME: 'Volume control',
  FULLSCREEN: 'Toggle fullscreen',
  CLOSE: 'Close dialog',
  MENU: 'Open menu',
  SEARCH: 'Search episodes',
  LOADING: 'Loading content'
};

// Check color contrast ratio
export const checkColorContrast = (foreground, background) => {
  // Convert hex to RGB
  const getRGB = (hex) => {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    return { r, g, b };
  };
  
  // Calculate relative luminance
  const getLuminance = (rgb) => {
    const { r, g, b } = rgb;
    const sRGB = [r, g, b].map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };
  
  const fg = getRGB(foreground);
  const bg = getRGB(background);
  
  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  return {
    ratio: ratio.toFixed(2),
    passes: {
      normal: ratio >= 4.5,
      large: ratio >= 3,
      enhanced: ratio >= 7
    }
  };
};