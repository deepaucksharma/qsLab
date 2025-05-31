/**
 * Performance Optimizations for Neural Learn
 * Track 4: Platform Polish & User Experience
 * Intelligent asset loading and memory management
 */

// Asset loading with Web Workers
class OptimizedAssetManager {
    constructor() {
        this.assetCache = new Map();
        this.preloadQueue = [];
        this.loadingPriority = new Map();
        this.audioBufferCache = new Map();
        this.imageCache = new Map();
        this.workerPool = this.initWorkerPool();
        this.prefetchDistance = 3; // Prefetch next 3 segments
        
        this.setupIntersectionObserver();
        this.initServiceWorker();
    }
    
    initWorkerPool() {
        const workerCount = navigator.hardwareConcurrency || 4;
        const workers = [];
        
        // Create worker script inline
        const workerScript = `
            self.addEventListener('message', async (e) => {
                const { type, url, id } = e.data;
                
                try {
                    if (type === 'fetch') {
                        const response = await fetch(url);
                        const blob = await response.blob();
                        const objectURL = URL.createObjectURL(blob);
                        
                        self.postMessage({
                            id,
                            success: true,
                            objectURL,
                            size: blob.size,
                            type: blob.type
                        });
                    }
                } catch (error) {
                    self.postMessage({
                        id,
                        success: false,
                        error: error.message
                    });
                }
            });
        `;
        
        const blob = new Blob([workerScript], { type: 'application/javascript' });
        const workerURL = URL.createObjectURL(blob);
        
        for (let i = 0; i < workerCount; i++) {
            workers.push(new Worker(workerURL));
        }
        
        return workers;
    }
    
    setupIntersectionObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    if (element.dataset.assetUrl && !element.dataset.loaded) {
                        this.loadAsset(element.dataset.assetUrl, 'high');
                    }
                }
            });
        }, {
            rootMargin: '50px'
        });
    }
    
    async loadAsset(url, priority = 'normal') {
        // Check cache first
        if (this.assetCache.has(url)) {
            const cached = this.assetCache.get(url);
            cached.hitCount++;
            return cached.data;
        }
        
        // Set loading priority
        this.loadingPriority.set(url, priority);
        
        // Use worker for loading
        const worker = this.getAvailableWorker();
        const loadId = `load_${Date.now()}_${Math.random()}`;
        
        return new Promise((resolve, reject) => {
            const startTime = performance.now();
            
            const handleMessage = (e) => {
                if (e.data.id === loadId) {
                    worker.removeEventListener('message', handleMessage);
                    
                    if (e.data.success) {
                        const loadTime = performance.now() - startTime;
                        
                        // Cache the result
                        this.assetCache.set(url, {
                            data: e.data.objectURL,
                            size: e.data.size,
                            type: e.data.type,
                            loadTime,
                            timestamp: Date.now(),
                            hitCount: 0
                        });
                        
                        // Track performance
                        this.trackPerformance('asset_load', {
                            url,
                            loadTime,
                            size: e.data.size,
                            priority
                        });
                        
                        resolve(e.data.objectURL);
                    } else {
                        reject(new Error(e.data.error));
                    }
                }
            };
            
            worker.addEventListener('message', handleMessage);
            worker.postMessage({ type: 'fetch', url, id: loadId });
        });
    }
    
    getAvailableWorker() {
        // Simple round-robin selection
        if (!this.currentWorkerIndex) {
            this.currentWorkerIndex = 0;
        }
        
        const worker = this.workerPool[this.currentWorkerIndex];
        this.currentWorkerIndex = (this.currentWorkerIndex + 1) % this.workerPool.length;
        
        return worker;
    }
    
    prefetchSegmentAssets(segments, currentIndex) {
        const startIndex = Math.max(0, currentIndex - 1);
        const endIndex = Math.min(segments.length, currentIndex + this.prefetchDistance);
        
        for (let i = startIndex; i < endIndex; i++) {
            const segment = segments[i];
            const priority = i === currentIndex ? 'high' : 'low';
            
            // Prefetch visual assets
            if (segment.visualIds) {
                segment.visualIds.forEach(visualId => {
                    const url = `/api/visual-assets/${visualId}`;
                    this.loadAsset(url, priority);
                });
            }
            
            // Prefetch audio
            if (segment.audioUrl) {
                this.preloadAudio(segment.audioUrl, priority);
            }
        }
    }
    
    async preloadAudio(url, priority = 'normal') {
        if (this.audioBufferCache.has(url)) {
            return this.audioBufferCache.get(url);
        }
        
        try {
            const arrayBuffer = await this.loadAsset(url, priority);
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            this.audioBufferCache.set(url, audioBuffer);
            return audioBuffer;
        } catch (error) {
            console.error('Failed to preload audio:', error);
            return null;
        }
    }
    
    clearOldCache() {
        const maxAge = 30 * 60 * 1000; // 30 minutes
        const now = Date.now();
        
        this.assetCache.forEach((value, key) => {
            if (now - value.timestamp > maxAge && value.hitCount < 2) {
                URL.revokeObjectURL(value.data);
                this.assetCache.delete(key);
            }
        });
    }
    
    trackPerformance(event, data) {
        if (!this.performanceMetrics) {
            this.performanceMetrics = {
                assetLoads: [],
                cacheHits: 0,
                cacheMisses: 0
            };
        }
        
        if (event === 'asset_load') {
            this.performanceMetrics.assetLoads.push(data);
            this.performanceMetrics.cacheMisses++;
        } else if (event === 'cache_hit') {
            this.performanceMetrics.cacheHits++;
        }
        
        // Report metrics periodically
        if (window.analytics) {
            window.analytics.trackEvent('performance_metrics', {
                ...this.getPerformanceSnapshot()
            });
        }
    }
    
    getPerformanceSnapshot() {
        const loads = this.performanceMetrics?.assetLoads || [];
        const avgLoadTime = loads.length > 0 
            ? loads.reduce((sum, l) => sum + l.loadTime, 0) / loads.length 
            : 0;
        
        return {
            averageLoadTime: Math.round(avgLoadTime) + 'ms',
            cacheHitRate: this.getCacheHitRate() + '%',
            totalLoads: loads.length,
            cacheSize: this.assetCache.size,
            audioBuffers: this.audioBufferCache.size
        };
    }
    
    getCacheHitRate() {
        const hits = this.performanceMetrics?.cacheHits || 0;
        const misses = this.performanceMetrics?.cacheMisses || 0;
        const total = hits + misses;
        
        return total > 0 ? Math.round((hits / total) * 100) : 0;
    }
    
    async initServiceWorker() {
        if ('serviceWorker' in navigator && window.FEATURES?.OFFLINE_SUPPORT) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', registration);
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }
    
    destroy() {
        // Clean up workers
        this.workerPool.forEach(worker => worker.terminate());
        
        // Clear caches
        this.assetCache.forEach(value => {
            if (value.data && typeof value.data === 'string' && value.data.startsWith('blob:')) {
                URL.revokeObjectURL(value.data);
            }
        });
        
        this.assetCache.clear();
        this.audioBufferCache.clear();
        this.imageCache.clear();
        
        // Disconnect observer
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

// Loading states manager
class LoadingStateManager {
    constructor() {
        this.skeletonTemplates = {
            courseCard: `
                <div class="skeleton-card">
                    <div class="skeleton skeleton-icon"></div>
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text" style="width: 80%"></div>
                </div>
            `,
            segment: `
                <div class="skeleton-segment">
                    <div class="skeleton skeleton-header"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text" style="width: 60%"></div>
                </div>
            `,
            episodeList: `
                <div class="skeleton-list">
                    ${Array(3).fill('<div class="skeleton skeleton-item"></div>').join('')}
                </div>
            `
        };
    }
    
    showSkeleton(container, type = 'segment', count = 1) {
        const template = this.skeletonTemplates[type] || this.skeletonTemplates.segment;
        const skeletons = Array(count).fill(template).join('');
        
        container.innerHTML = `<div class="skeleton-container">${skeletons}</div>`;
        container.classList.add('loading');
    }
    
    hideSkeleton(container) {
        container.classList.remove('loading');
        const skeletonContainer = container.querySelector('.skeleton-container');
        if (skeletonContainer) {
            skeletonContainer.remove();
        }
    }
    
    showPartialContent(container, content, percentage = 50) {
        // Show partial content while loading rest
        const words = content.split(' ');
        const partialLength = Math.floor(words.length * (percentage / 100));
        const partialContent = words.slice(0, partialLength).join(' ');
        
        container.innerHTML = `
            <div class="partial-content">
                ${partialContent}
                <span class="loading-indicator">...</span>
            </div>
        `;
    }
}

// Memory leak prevention
class MemoryManager {
    constructor() {
        this.listeners = new WeakMap();
        this.timers = new Set();
        this.observers = new Set();
        
        this.startMonitoring();
    }
    
    addEventListener(element, event, handler, options) {
        element.addEventListener(event, handler, options);
        
        if (!this.listeners.has(element)) {
            this.listeners.set(element, []);
        }
        
        this.listeners.get(element).push({ event, handler, options });
    }
    
    removeEventListeners(element) {
        const elementListeners = this.listeners.get(element);
        if (elementListeners) {
            elementListeners.forEach(({ event, handler, options }) => {
                element.removeEventListener(event, handler, options);
            });
            this.listeners.delete(element);
        }
    }
    
    setTimeout(callback, delay) {
        const timer = setTimeout(() => {
            this.timers.delete(timer);
            callback();
        }, delay);
        
        this.timers.add(timer);
        return timer;
    }
    
    clearTimeout(timer) {
        if (this.timers.has(timer)) {
            clearTimeout(timer);
            this.timers.delete(timer);
        }
    }
    
    createObserver(type, callback, options) {
        let observer;
        
        switch (type) {
            case 'intersection':
                observer = new IntersectionObserver(callback, options);
                break;
            case 'mutation':
                observer = new MutationObserver(callback);
                break;
            case 'resize':
                observer = new ResizeObserver(callback);
                break;
        }
        
        if (observer) {
            this.observers.add(observer);
        }
        
        return observer;
    }
    
    disconnectObserver(observer) {
        if (this.observers.has(observer)) {
            observer.disconnect();
            this.observers.delete(observer);
        }
    }
    
    cleanup() {
        // Clear all timers
        this.timers.forEach(timer => clearTimeout(timer));
        this.timers.clear();
        
        // Disconnect all observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
    }
    
    startMonitoring() {
        // Monitor memory usage periodically
        setInterval(() => {
            if (performance.memory) {
                const usage = {
                    used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                    total: Math.round(performance.memory.totalJSHeapSize / 1048576),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
                };
                
                // Warn if memory usage is high
                if (usage.used / usage.total > 0.9) {
                    console.warn('High memory usage detected:', usage);
                    this.performCleanup();
                }
            }
        }, 30000); // Check every 30 seconds
    }
    
    performCleanup() {
        // Trigger garbage collection if available
        if (window.gc) {
            window.gc();
        }
        
        // Clear old cache entries
        if (window.assetManager) {
            window.assetManager.clearOldCache();
        }
        
        // Dispatch cleanup event
        window.dispatchEvent(new Event('memoryCleanup'));
    }
}

// Initialize performance optimizations
window.assetManager = new OptimizedAssetManager();
window.loadingManager = new LoadingStateManager();
window.memoryManager = new MemoryManager();

// Export performance API
window.getAssetPerformance = () => window.assetManager.getPerformanceSnapshot();

// Add performance styles
const performanceStyles = `
<style>
/* Skeleton loading styles */
.skeleton {
    background: linear-gradient(90deg, 
        var(--skeleton-base) 25%, 
        var(--skeleton-shine) 50%, 
        var(--skeleton-base) 75%
    );
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s ease-in-out infinite;
    border-radius: 4px;
}

@keyframes skeleton-loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

.skeleton-card {
    padding: 24px;
    background: var(--surface-bg);
    border-radius: 12px;
}

.skeleton-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    margin-bottom: 16px;
}

.skeleton-title {
    height: 24px;
    margin-bottom: 12px;
}

.skeleton-text {
    height: 16px;
    margin-bottom: 8px;
}

.skeleton-segment {
    padding: 32px;
}

.skeleton-header {
    height: 32px;
    width: 60%;
    margin-bottom: 16px;
}

.skeleton-item {
    height: 48px;
    margin-bottom: 8px;
    border-radius: 8px;
}

/* Loading states */
.loading {
    position: relative;
    min-height: 200px;
}

.loading-indicator {
    display: inline-block;
    animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

/* Partial content */
.partial-content {
    opacity: 0.7;
    transition: opacity 0.3s ease;
}

/* Performance optimizations */
.will-change-transform {
    will-change: transform;
}

.gpu-accelerated {
    transform: translateZ(0);
    backface-visibility: hidden;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', performanceStyles);