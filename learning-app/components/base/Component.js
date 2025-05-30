/**
 * Base Component Class
 * Provides a reusable component architecture for the learning app
 */
export class Component {
  constructor(props = {}) {
    this.props = props;
    this.state = {};
    this.element = null;
    this.children = new Map();
    this._mounted = false;
  }

  /**
   * Update component state and trigger re-render
   */
  setState(newState) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...newState };
    
    if (this._mounted && this.shouldUpdate(this.props, prevState)) {
      this.update();
    }
  }

  /**
   * Mount component to DOM
   */
  mount(container) {
    this.element = this.render();
    container.appendChild(this.element);
    this._mounted = true;
    this.afterMount();
  }

  /**
   * Update component in place
   */
  update() {
    const newElement = this.render();
    if (this.element && this.element.parentNode) {
      this.element.replaceWith(newElement);
      this.element = newElement;
      this.afterUpdate();
    }
  }

  /**
   * Remove component from DOM
   */
  unmount() {
    this.beforeUnmount();
    this.children.forEach(child => child.unmount());
    this.element?.remove();
    this._mounted = false;
  }

  /**
   * Render component - must be implemented by subclasses
   */
  render() {
    throw new Error('Component must implement render method');
  }

  /**
   * Lifecycle methods
   */
  shouldUpdate(nextProps, prevState) {
    return true;
  }

  afterMount() {
    // Override in subclasses
  }

  afterUpdate() {
    // Override in subclasses
  }

  beforeUnmount() {
    // Override in subclasses
  }

  /**
   * Helper method to create DOM elements
   */
  createElement(tag, attrs = {}, children = []) {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else if (key.startsWith('on')) {
        const event = key.slice(2).toLowerCase();
        element.addEventListener(event, value);
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else {
        element.setAttribute(key, value);
      }
    });
    
    // Add children
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Component) {
        const childContainer = document.createElement('div');
        element.appendChild(childContainer);
        child.mount(childContainer);
        this.children.set(child.props.id || Math.random(), child);
      } else if (child instanceof Element) {
        element.appendChild(child);
      }
    });
    
    return element;
  }
}