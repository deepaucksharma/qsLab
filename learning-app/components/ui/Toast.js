import { Component } from '../base/Component.js';
import { EventEmitter } from '../base/EventEmitter.js';

/**
 * Toast Notification Component
 */
export class Toast extends Component {
  constructor(props) {
    super(props);
    this.state = {
      entering: true,
      exiting: false
    };
  }

  render() {
    const { message, type = 'info' } = this.props;
    
    return this.createElement('div', {
      className: `toast toast--${type} ${this.state.entering ? 'toast--entering' : ''} ${this.state.exiting ? 'toast--exiting' : ''}`,
      role: 'alert',
      'aria-live': 'polite'
    }, [
      this.createElement('div', { className: 'toast__icon' }, [
        this.createElement('i', { className: `fas fa-${this.getIcon(type)}` })
      ]),
      this.createElement('div', { className: 'toast__content' }, [
        this.createElement('p', { className: 'toast__message' }, [message])
      ]),
      this.createElement('button', {
        className: 'toast__close',
        onClick: () => this.dismiss(),
        'aria-label': 'Close notification'
      }, [
        this.createElement('i', { className: 'fas fa-times' })
      ])
    ]);
  }

  afterMount() {
    // Trigger enter animation
    requestAnimationFrame(() => {
      this.setState({ entering: false });
    });

    // Auto dismiss if duration is set
    if (this.props.duration > 0) {
      this.dismissTimer = setTimeout(() => this.dismiss(), this.props.duration);
    }
  }

  beforeUnmount() {
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
    }
  }

  dismiss() {
    this.setState({ exiting: true });
    
    // Wait for exit animation
    setTimeout(() => {
      this.props.onDismiss?.(this.props.id);
    }, 300);
  }

  getIcon(type) {
    const icons = {
      success: 'check-circle',
      error: 'exclamation-circle',
      warning: 'exclamation-triangle',
      info: 'info-circle'
    };
    return icons[type] || icons.info;
  }
}

/**
 * Toast Manager - Singleton for managing toasts
 */
export class ToastManager extends EventEmitter {
  constructor() {
    super();
    this.container = null;
    this.toasts = new Map();
    this.initialize();
  }

  initialize() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.createContainer());
    } else {
      this.createContainer();
    }
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    this.container.setAttribute('aria-live', 'polite');
    this.container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(this.container);
  }

  show(message, type = 'info', duration = 5000) {
    const id = Date.now() + Math.random();
    
    const toast = new Toast({
      id,
      message,
      type,
      duration,
      onDismiss: (toastId) => this.remove(toastId)
    });

    const toastWrapper = document.createElement('div');
    this.container.appendChild(toastWrapper);
    toast.mount(toastWrapper);

    this.toasts.set(id, { toast, wrapper: toastWrapper });
    this.emit('show', { id, message, type });

    return id;
  }

  remove(id) {
    const toastData = this.toasts.get(id);
    if (!toastData) return;

    toastData.toast.unmount();
    toastData.wrapper.remove();
    this.toasts.delete(id);
    this.emit('remove', { id });
  }

  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  error(message, duration) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration) {
    return this.show(message, 'info', duration);
  }

  clear() {
    this.toasts.forEach((_, id) => this.remove(id));
  }
}

// Create singleton instance
export const toast = new ToastManager();