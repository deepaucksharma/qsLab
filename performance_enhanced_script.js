/**
 * DOM Optimization Utilities for Neural Learn
 * Track 4: Platform Polish & User Experience
 * Efficient DOM manipulation and rendering
 */

class DOMOptimizer {
    constructor() {
        this.batchedUpdates = new Map();
        this.rafId = null;
        this.virtualScrollContainers = new Set();
        this.eventDelegation = new Map();
        
        this.init();
    }
    
    init() {
        this.setupEventDelegation();
        this.optimizeImages();
        this.setupScrollOptimization();
    }
    
    // Batch DOM updates using requestAnimationFrame
    batchUpdate(id, updateFn) {
        this.batchedUpdates.set(id, updateFn);
        
        if (!this.rafId) {
            this.rafId = requestAnimationFrame(() => {
                this.processBatchedUpdates();
            });
        }
    }
    
    processBatchedUpdates() {
        const updates = Array.from(this.batchedUpdates.values());
        this.batchedUpdates.clear();
        this.rafId = null;
        
        // Use DocumentFragment for multiple DOM insertions
        const fragment = document.createDocumentFragment();
        
        updates.forEach(update => {
            try {
                update(fragment);
            } catch (error) {
                console.error('Batch update failed:', error);
            }
        });
        
        // Single DOM update
        if (fragment.childNodes.length > 0) {
            document.body.appendChild(fragment);
        }
    }
    
    // Event delegation for better performance
    setupEventDelegation() {
        // Delegate click events
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Handle course card clicks
            if (target.closest('.course-card')) {
                const card = target.closest('.course-card');
                const courseId = card.dataset.courseId;
                if (courseId && window.courseNavigator) {
                    courseNavigator.selectCourse(courseId);
                }
                return;
            }
            
            // Handle episode item clicks
            if (target.closest('.episode-item')) {
                const item = target.closest('.episode-item');
                const episodeId = item.dataset.episodeId;
                if (episodeId && window.episodePlayer) {
                    episodePlayer.loadEpisode(episodeId);
                }
                return;
            }
            
            // Handle code copy buttons
            if (target.closest('.code-copy-btn')) {
                const button = target.closest('.code-copy-btn');
                if (window.copyCodeToClipboard) {
                    copyCodeToClipboard(button);
                }
                return;
            }
        });
    }
    
    // Optimize image loading
    optimizeImages() {
        // Add loading="lazy" to all images
        document.querySelectorAll('img:not([loading])').forEach(img => {
            img.loading = 'lazy';
            
            // Add error handling
            img.addEventListener('error', function() {
                this.src = '/static/placeholders/image-error.svg';
                this.alt = 'Image failed to load';
            }, { once: true });
        });
    }
    
    // Virtual scrolling for long lists
    setupVirtualScroll(container, items, itemHeight = 60) {
        const visibleItems = Math.ceil(container.clientHeight / itemHeight) + 2;
        const totalHeight = items.length * itemHeight;
        
        // Create spacer elements
        const topSpacer = document.createElement('div');
        const bottomSpacer = document.createElement('div');
        const content = document.createElement('div');
        
        container.innerHTML = '';
        container.appendChild(topSpacer);
        container.appendChild(content);
        container.appendChild(bottomSpacer);
        
        // Set total height
        container.style.height = `${totalHeight}px`;
        
        const updateVisibleItems = () => {
            const scrollTop = container.scrollTop;
            const startIndex = Math.floor(scrollTop / itemHeight);
            const endIndex = Math.min(startIndex + visibleItems, items.length);
            
            // Update spacers
            topSpacer.style.height = `${startIndex * itemHeight}px`;
            bottomSpacer.style.height = `${(items.length - endIndex) * itemHeight}px`;
            
            // Render visible items
            const visibleItemsHtml = items
                .slice(startIndex, endIndex)
                .map(item => this.renderItem(item))
                .join('');
            
            content.innerHTML = visibleItemsHtml;
        };
        
        // Debounced scroll handler
        let scrollTimeout;
        container.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(updateVisibleItems, 16);
        });
        
        // Initial render
        updateVisibleItems();
        
        this.virtualScrollContainers.add(container);
    }
    
    renderItem(item) {
        // Override in implementation
        return `<div class="virtual-item">${item.title || item}</div>`;
    }
    
    // Optimize scroll performance
    setupScrollOptimization() {
        let isScrolling = false;
        let scrollTimeout;
        
        document.addEventListener('scroll', () => {
            if (!isScrolling) {
                document.body.classList.add('is-scrolling');
                isScrolling = true;
            }
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                document.body.classList.remove('is-scrolling');
                isScrolling = false;
            }, 150);
        }, { passive: true });
    }
    
    // Efficient element creation
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else if (key.startsWith('data')) {
                element.dataset[key.slice(4).toLowerCase()] = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        
        // Add children
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Element) {
                element.appendChild(child);
            }
        });
        
        return element;
    }
    
    // Efficient class manipulation
    toggleClasses(element, add = [], remove = []) {
        // Use classList.add/remove with spread for better performance
        if (add.length > 0) {
            element.classList.add(...add);
        }
        if (remove.length > 0) {
            element.classList.remove(...remove);
        }
    }
    
    // Debounce function for performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Throttle function for performance
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Intersection Observer for lazy rendering
    observeElements(selector, callback, options = {}) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    callback(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, options);
        
        document.querySelectorAll(selector).forEach(el => {
            observer.observe(el);
        });
        
        return observer;
    }
    
    // Efficient list rendering
    renderList(container, items, renderFn, options = {}) {
        const {
            batchSize = 10,
            delay = 0,
            onComplete = () => {}
        } = options;
        
        container.innerHTML = '';
        let index = 0;
        
        const renderBatch = () => {
            const fragment = document.createDocumentFragment();
            const end = Math.min(index + batchSize, items.length);
            
            for (let i = index; i < end; i++) {
                const element = renderFn(items[i], i);
                fragment.appendChild(element);
            }
            
            container.appendChild(fragment);
            index = end;
            
            if (index < items.length) {
                setTimeout(renderBatch, delay);
            } else {
                onComplete();
            }
        };
        
        renderBatch();
    }
    
    // Cleanup
    destroy() {
        // Cancel pending RAF
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        
        // Clear virtual scroll containers
        this.virtualScrollContainers.clear();
        
        // Clear batched updates
        this.batchedUpdates.clear();
    }
}

// Enhanced animations with performance
class AnimationOptimizer {
    constructor() {
        this.runningAnimations = new Set();
        this.useGPU = true;
    }
    
    animate(element, keyframes, options = {}) {
        const defaultOptions = {
            duration: 300,
            easing: 'ease-out',
            fill: 'forwards'
        };
        
        const animationOptions = { ...defaultOptions, ...options };
        
        // Add GPU acceleration
        if (this.useGPU) {
            element.style.willChange = 'transform';
            element.style.transform = 'translateZ(0)';
        }
        
        const animation = element.animate(keyframes, animationOptions);
        this.runningAnimations.add(animation);
        
        animation.finished.then(() => {
            this.runningAnimations.delete(animation);
            if (this.useGPU) {
                element.style.willChange = 'auto';
            }
        });
        
        return animation;
    }
    
    fadeIn(element, duration = 300) {
        return this.animate(element, [
            { opacity: 0, transform: 'translateY(10px)' },
            { opacity: 1, transform: 'translateY(0)' }
        ], { duration });
    }
    
    fadeOut(element, duration = 300) {
        return this.animate(element, [
            { opacity: 1, transform: 'translateY(0)' },
            { opacity: 0, transform: 'translateY(-10px)' }
        ], { duration });
    }
    
    slideIn(element, direction = 'left', duration = 300) {
        const translations = {
            left: ['translateX(-100%)', 'translateX(0)'],
            right: ['translateX(100%)', 'translateX(0)'],
            top: ['translateY(-100%)', 'translateY(0)'],
            bottom: ['translateY(100%)', 'translateY(0)']
        };
        
        const [from, to] = translations[direction];
        
        return this.animate(element, [
            { transform: from, opacity: 0 },
            { transform: to, opacity: 1 }
        ], { duration });
    }
    
    cancelAll() {
        this.runningAnimations.forEach(animation => {
            animation.cancel();
        });
        this.runningAnimations.clear();
    }
}

// Initialize optimizers
window.domOptimizer = new DOMOptimizer();
window.animationOptimizer = new AnimationOptimizer();

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: [],
            renderTime: [],
            scriptTime: []
        };
        
        this.startMonitoring();
    }
    
    startMonitoring() {
        let lastTime = performance.now();
        let frames = 0;
        
        const measureFPS = () => {
            frames++;
            const currentTime = performance.now();
            
            if (currentTime >= lastTime + 1000) {
                const fps = Math.round((frames * 1000) / (currentTime - lastTime));
                this.metrics.fps.push(fps);
                
                // Keep only last 60 samples
                if (this.metrics.fps.length > 60) {
                    this.metrics.fps.shift();
                }
                
                frames = 0;
                lastTime = currentTime;
                
                // Log if FPS drops below 30
                if (fps < 30) {
                    console.warn('Low FPS detected:', fps);
                }
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
    }
    
    measureRender(name, fn) {
        const startTime = performance.now();
        const result = fn();
        const endTime = performance.now();
        
        const renderTime = endTime - startTime;
        this.metrics.renderTime.push({ name, time: renderTime });
        
        if (renderTime > 16) {
            console.warn(`Slow render detected for ${name}:`, renderTime + 'ms');
        }
        
        return result;
    }
    
    getAverageFPS() {
        if (this.metrics.fps.length === 0) return 60;
        return Math.round(
            this.metrics.fps.reduce((a, b) => a + b, 0) / this.metrics.fps.length
        );
    }
}

window.performanceMonitor = new PerformanceMonitor();

// Add performance CSS
const performanceCSS = `
<style>
/* Disable animations during scroll */
.is-scrolling * {
    animation-play-state: paused !important;
}

/* GPU acceleration hints */
.gpu-accelerated {
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
}

/* Efficient shadows */
.optimized-shadow {
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    will-change: box-shadow;
}

/* Virtual scroll container */
.virtual-scroll {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}

.virtual-item {
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid var(--border-color);
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', performanceCSS);