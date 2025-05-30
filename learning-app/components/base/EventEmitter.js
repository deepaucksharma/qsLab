/**
 * EventEmitter Class
 * Provides event handling capabilities for components
 */
export class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  /**
   * Subscribe to an event
   */
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Subscribe to an event once
   */
  once(event, callback) {
    const onceWrapper = (...args) => {
      callback(...args);
      this.off(event, onceWrapper);
    };
    return this.on(event, onceWrapper);
  }

  /**
   * Unsubscribe from an event
   */
  off(event, callback) {
    if (!this.events.has(event)) return;
    
    const callbacks = this.events.get(event);
    const index = callbacks.indexOf(callback);
    
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
    
    if (callbacks.length === 0) {
      this.events.delete(event);
    }
  }

  /**
   * Emit an event
   */
  emit(event, ...args) {
    if (!this.events.has(event)) return;
    
    const callbacks = this.events.get(event);
    callbacks.forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}