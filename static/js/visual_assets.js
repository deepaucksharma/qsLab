/**
 * Visual Asset System for Neural Learn Course Platform
 * Handles image display, lazy loading, zoom/pan, and visual asset management
 */

class VisualAssetManager {
    constructor() {
        this.loadedAssets = new Map();
        this.loadingAssets = new Set();
        this.assetObserver = null;
        this.zoomLevel = 1;
        this.panPosition = { x: 0, y: 0 };
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        
        this.initializeObserver();
    }
    
    /**
     * Initialize Intersection Observer for lazy loading
     */
    initializeObserver() {
        const options = {
            root: null,
            rootMargin: '100px',
            threshold: 0.01
        };
        
        this.assetObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const assetElement = entry.target;
                    const assetId = assetElement.dataset.assetId;
                    
                    if (assetId && !this.loadedAssets.has(assetId) && !this.loadingAssets.has(assetId)) {
                        this.loadAsset(assetElement, assetId);
                    }
                }
            });
        }, options);
    }
    
    /**
     * Load a visual asset
     */
    async loadAsset(element, assetId) {
        this.loadingAssets.add(assetId);
        
        try {
            // Fetch asset metadata from API
            const assetData = await this.fetchAssetData(assetId);
            
            if (assetData) {
                // Create image element
                const img = new Image();
                img.onload = () => {
                    this.onAssetLoaded(element, img, assetData);
                    this.loadedAssets.set(assetId, assetData);
                    this.loadingAssets.delete(assetId);
                };
                
                img.onerror = () => {
                    this.onAssetError(element, assetId);
                    this.loadingAssets.delete(assetId);
                };
                
                // Start loading
                img.src = assetData.url;
            } else {
                this.onAssetError(element, assetId);
                this.loadingAssets.delete(assetId);
            }
        } catch (error) {
            console.error('Failed to load asset:', error);
            this.onAssetError(element, assetId);
            this.loadingAssets.delete(assetId);
        }
    }
    
    /**
     * Fetch asset data from API
     */
    async fetchAssetData(assetId) {
        try {
            const response = await fetch(`/api/visual-assets/${assetId}`);
            if (!response.ok) throw new Error('Asset not found');
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch asset data:', error);
            return null;
        }
    }
    
    /**
     * Handle successful asset load
     */
    onAssetLoaded(element, img, assetData) {
        // Remove loading state
        element.classList.remove('loading');
        
        // Clear placeholder content
        element.innerHTML = '';
        
        // Create asset container
        const container = document.createElement('div');
        container.className = 'visual-asset-container';
        
        // Add image
        const imgElement = img.cloneNode();
        imgElement.className = 'visual-asset-image';
        imgElement.alt = assetData.title || 'Visual asset';
        container.appendChild(imgElement);
        
        // Add caption if available
        if (assetData.caption) {
            const caption = document.createElement('div');
            caption.className = 'visual-asset-caption';
            caption.textContent = assetData.caption;
            container.appendChild(caption);
        }
        
        // Add zoom controls for diagrams
        if (assetData.assetType === 'diagram' || assetData.enableZoom) {
            this.addZoomControls(container, imgElement);
        }
        
        element.appendChild(container);
        
        // Stop observing this element
        this.assetObserver.unobserve(element);
    }
    
    /**
     * Handle asset load error
     */
    onAssetError(element, assetId) {
        element.classList.remove('loading');
        element.classList.add('error');
        
        element.innerHTML = `
            <div class="visual-asset-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load visual asset</p>
                <button class="retry-btn" onclick="visualAssetManager.retryAsset('${assetId}', this)">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
    
    /**
     * Add zoom and pan controls to an image
     */
    addZoomControls(container, img) {
        // Create zoom controls
        const controls = document.createElement('div');
        controls.className = 'zoom-controls';
        controls.innerHTML = `
            <button class="zoom-btn" data-action="zoom-in">
                <i class="fas fa-search-plus"></i>
            </button>
            <button class="zoom-btn" data-action="zoom-out">
                <i class="fas fa-search-minus"></i>
            </button>
            <button class="zoom-btn" data-action="reset">
                <i class="fas fa-compress"></i>
            </button>
            <button class="zoom-btn" data-action="fullscreen">
                <i class="fas fa-expand"></i>
            </button>
        `;
        
        container.appendChild(controls);
        
        // Make image zoomable
        img.classList.add('zoomable');
        
        // Initialize zoom state
        const state = {
            zoom: 1,
            panX: 0,
            panY: 0
        };
        
        // Add event listeners
        controls.addEventListener('click', (e) => {
            const btn = e.target.closest('.zoom-btn');
            if (!btn) return;
            
            const action = btn.dataset.action;
            this.handleZoomAction(action, img, state);
        });
        
        // Enable pan on drag
        this.enablePan(img, state);
        
        // Enable wheel zoom
        img.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            this.updateZoom(img, state, state.zoom * delta);
        });
    }
    
    /**
     * Handle zoom control actions
     */
    handleZoomAction(action, img, state) {
        switch (action) {
            case 'zoom-in':
                this.updateZoom(img, state, state.zoom * 1.2);
                break;
            case 'zoom-out':
                this.updateZoom(img, state, state.zoom * 0.8);
                break;
            case 'reset':
                this.updateZoom(img, state, 1);
                state.panX = 0;
                state.panY = 0;
                this.updateTransform(img, state);
                break;
            case 'fullscreen':
                this.toggleFullscreen(img.closest('.visual-asset-container'));
                break;
        }
    }
    
    /**
     * Update zoom level
     */
    updateZoom(img, state, newZoom) {
        // Clamp zoom level
        state.zoom = Math.max(0.5, Math.min(5, newZoom));
        this.updateTransform(img, state);
    }
    
    /**
     * Update image transform
     */
    updateTransform(img, state) {
        img.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
    }
    
    /**
     * Enable pan functionality
     */
    enablePan(img, state) {
        let isDragging = false;
        let dragStart = { x: 0, y: 0 };
        let initialPan = { x: 0, y: 0 };
        
        img.addEventListener('mousedown', (e) => {
            if (state.zoom > 1) {
                isDragging = true;
                dragStart = { x: e.clientX, y: e.clientY };
                initialPan = { x: state.panX, y: state.panY };
                img.style.cursor = 'grabbing';
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                state.panX = initialPan.x + (e.clientX - dragStart.x);
                state.panY = initialPan.y + (e.clientY - dragStart.y);
                this.updateTransform(img, state);
            }
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
            img.style.cursor = state.zoom > 1 ? 'grab' : 'default';
        });
    }
    
    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen(container) {
        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => {
                console.error('Failed to enter fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    /**
     * Retry loading a failed asset
     */
    retryAsset(assetId, button) {
        const element = button.closest('.visual-asset-placeholder');
        if (element) {
            element.classList.remove('error');
            element.classList.add('loading');
            element.innerHTML = '<div class="asset-loader"></div>';
            this.loadAsset(element, assetId);
        }
    }
    
    /**
     * Observe an element for lazy loading
     */
    observe(element) {
        if (this.assetObserver) {
            this.assetObserver.observe(element);
        }
    }
    
    /**
     * Create a visual asset placeholder
     */
    createPlaceholder(assetId, options = {}) {
        const placeholder = document.createElement('div');
        placeholder.className = 'visual-asset-placeholder loading';
        placeholder.dataset.assetId = assetId;
        
        // Set dimensions if provided
        if (options.width) placeholder.style.width = options.width;
        if (options.height) placeholder.style.height = options.height;
        
        // Add loading indicator
        placeholder.innerHTML = '<div class="asset-loader"></div>';
        
        // Start observing for lazy load
        this.observe(placeholder);
        
        return placeholder;
    }
    
    /**
     * Preload multiple assets
     */
    async preloadAssets(assetIds) {
        const promises = assetIds.map(async (assetId) => {
            if (!this.loadedAssets.has(assetId)) {
                const assetData = await this.fetchAssetData(assetId);
                if (assetData) {
                    return new Promise((resolve) => {
                        const img = new Image();
                        img.onload = () => {
                            this.loadedAssets.set(assetId, assetData);
                            resolve();
                        };
                        img.onerror = resolve;
                        img.src = assetData.url;
                    });
                }
            }
        });
        
        await Promise.all(promises);
    }
    
    /**
     * Clear asset cache
     */
    clearCache() {
        this.loadedAssets.clear();
        this.loadingAssets.clear();
    }
    
    /**
     * Render visual assets for a segment
     */
    renderSegmentVisuals(segment) {
        const visuals = [];
        
        // Check for visual references
        if (segment.mediaRefs && segment.mediaRefs.visualIds) {
            segment.mediaRefs.visualIds.forEach(visualId => {
                const placeholder = this.createPlaceholder(visualId, {
                    width: '100%',
                    height: '400px'
                });
                visuals.push(placeholder.outerHTML);
            });
        }
        
        // Check for inline diagrams
        if (segment.diagram) {
            const placeholder = this.createPlaceholder(segment.diagram.id || 'inline-diagram', {
                width: '100%',
                height: segment.diagram.height || '300px'
            });
            visuals.push(placeholder.outerHTML);
        }
        
        return visuals.join('\n');
    }
}

// Create global instance
const visualAssetManager = new VisualAssetManager();

// Make it globally available
window.visualAssetManager = visualAssetManager;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisualAssetManager;
}