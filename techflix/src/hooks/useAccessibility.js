import { useEffect, useRef, useCallback } from 'react';
import { 
  trapFocus, 
  announceToScreenReader, 
  handleKeyboardClick,
  KEYS 
} from '@utils/accessibility';

// Hook for managing focus trap
export const useFocusTrap = (isActive = true) => {
  const elementRef = useRef(null);
  
  useEffect(() => {
    if (!isActive || !elementRef.current) return;
    
    const cleanup = trapFocus(elementRef.current);
    return cleanup;
  }, [isActive]);
  
  return elementRef;
};

// Hook for screen reader announcements
export const useAnnouncement = () => {
  const announce = useCallback((message, priority = 'polite') => {
    announceToScreenReader(message, priority);
  }, []);
  
  return announce;
};

// Hook for keyboard navigation
export const useKeyboardNavigation = (items, options = {}) => {
  const {
    onSelect,
    orientation = 'vertical',
    loop = true,
    onEscape
  } = options;
  
  const currentIndexRef = useRef(0);
  
  const handleKeyDown = useCallback((event) => {
    const { key } = event;
    const itemCount = items.length;
    let newIndex = currentIndexRef.current;
    
    switch (key) {
      case KEYS.ARROW_UP:
      case KEYS.ARROW_LEFT:
        if (orientation === 'vertical' && key === KEYS.ARROW_LEFT) return;
        if (orientation === 'horizontal' && key === KEYS.ARROW_UP) return;
        
        event.preventDefault();
        newIndex = currentIndexRef.current - 1;
        if (newIndex < 0) {
          newIndex = loop ? itemCount - 1 : 0;
        }
        break;
        
      case KEYS.ARROW_DOWN:
      case KEYS.ARROW_RIGHT:
        if (orientation === 'vertical' && key === KEYS.ARROW_RIGHT) return;
        if (orientation === 'horizontal' && key === KEYS.ARROW_DOWN) return;
        
        event.preventDefault();
        newIndex = currentIndexRef.current + 1;
        if (newIndex >= itemCount) {
          newIndex = loop ? 0 : itemCount - 1;
        }
        break;
        
      case KEYS.HOME:
        event.preventDefault();
        newIndex = 0;
        break;
        
      case KEYS.END:
        event.preventDefault();
        newIndex = itemCount - 1;
        break;
        
      case KEYS.ENTER:
      case KEYS.SPACE:
        event.preventDefault();
        if (onSelect) {
          onSelect(items[currentIndexRef.current], currentIndexRef.current);
        }
        return;
        
      case KEYS.ESCAPE:
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        return;
        
      default:
        return;
    }
    
    currentIndexRef.current = newIndex;
    
    // Focus the new item
    const itemElements = event.currentTarget.querySelectorAll('[role="menuitem"], [role="option"], [tabindex]');
    itemElements[newIndex]?.focus();
  }, [items, orientation, loop, onSelect, onEscape]);
  
  return {
    handleKeyDown,
    currentIndex: currentIndexRef.current,
    setCurrentIndex: (index) => {
      currentIndexRef.current = index;
    }
  };
};

// Hook for managing ARIA live regions
export const useLiveRegion = (initialMessage = '') => {
  const liveRegionRef = useRef(null);
  
  const announce = useCallback((message, priority = 'polite') => {
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', priority);
      liveRegionRef.current.textContent = message;
    }
  }, []);
  
  const LiveRegion = useCallback(() => (
    <div
      ref={liveRegionRef}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {initialMessage}
    </div>
  ), [initialMessage]);
  
  return { announce, LiveRegion };
};

// Hook for skip navigation
export const useSkipNavigation = () => {
  const skipToMain = useCallback(() => {
    const main = document.querySelector('main') || document.getElementById('main-content');
    if (main) {
      main.tabIndex = -1;
      main.focus();
      main.scrollIntoView();
    }
  }, []);
  
  return { skipToMain };
};

// Hook for managing focus on route change
export const useFocusOnRouteChange = () => {
  useEffect(() => {
    // Focus the main content area on route change
    const main = document.querySelector('main') || document.getElementById('main-content');
    if (main) {
      main.tabIndex = -1;
      main.focus();
    }
  }, []);
};