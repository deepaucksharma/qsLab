/**
 * Neural Learn - Minimal Design Enforcer
 * Ensures all dynamically created elements follow minimal design principles
 */

window.MinimalTheme = {
  // Color palette
  colors: {
    primary: '#1a73e8',
    secondary: '#5f6368',
    success: '#1e8e3e',
    warning: '#f9ab00',
    error: '#d93025',
    textPrimary: '#202124',
    textSecondary: '#5f6368',
    bgPrimary: '#ffffff',
    bgSecondary: '#f8f9fa',
    border: '#dadce0'
  },
  
  // Apply minimal styles to dynamic elements
  applyToElement: function(element) {
    if (!element) return;
    
    // Remove any gradient backgrounds
    if (element.style.backgroundImage && element.style.backgroundImage.includes('gradient')) {
      element.style.backgroundImage = 'none';
    }
    
    // Remove backdrop filters
    element.style.backdropFilter = 'none';
    element.style.webkitBackdropFilter = 'none';
    
    // Apply clean borders
    if (element.style.border) {
      element.style.border = `1px solid ${this.colors.border}`;
    }
    
    // Clean up shadows
    if (element.style.boxShadow) {
      element.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08)';
    }
  },
  
  // Watch for new elements
  observeChanges: function() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            this.applyToElement(node);
            // Apply to all children
            node.querySelectorAll('*').forEach(child => {
              this.applyToElement(child);
            });
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  },
  
  // Initialize
  init: function() {
    // Apply to all existing elements
    document.querySelectorAll('*').forEach(element => {
      this.applyToElement(element);
    });
    
    // Watch for new elements
    this.observeChanges();
    
    // Override common style functions
    this.overrideStyleFunctions();
  },
  
  // Override functions that might apply fancy styles
  overrideStyleFunctions: function() {
    // Store original createElement
    const originalCreateElement = document.createElement.bind(document);
    
    // Override createElement to apply minimal styles
    document.createElement = function(tagName) {
      const element = originalCreateElement(tagName);
      
      // Apply minimal styles based on element type
      setTimeout(() => {
        MinimalTheme.applyToElement(element);
      }, 0);
      
      return element;
    };
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => MinimalTheme.init());
} else {
  MinimalTheme.init();
}