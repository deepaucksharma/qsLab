/**
 * Keyboard Shortcuts Manager for Neural Learn
 * Track 4: Platform Polish & User Experience
 * Comprehensive keyboard navigation and shortcuts system
 */

class KeyboardShortcutsManager {
    constructor() {
        this.shortcuts = new Map();
        this.contexts = ['global', 'course', 'episode', 'search'];
        this.currentContext = 'global';
        this.enabled = true;
        this.helpModal = null;
        
        this.init();
    }
    
    init() {
        this.defineShortcuts();
        this.setupEventListeners();
        this.createHelpModal();
    }
    
    defineShortcuts() {
        // Global shortcuts (always active)
        this.register('global', {
            '?': { 
                handler: () => this.toggleHelp(),
                description: 'Show keyboard shortcuts help',
                category: 'Navigation'
            },
            '/': { 
                handler: () => this.focusSearch(),
                description: 'Focus search box',
                category: 'Navigation'
            },
            'g h': { 
                handler: () => this.navigateTo('home'),
                description: 'Go to home',
                category: 'Navigation'
            },
            'g c': { 
                handler: () => this.navigateTo('courses'),
                description: 'Go to courses',
                category: 'Navigation'
            },
            'd': { 
                handler: () => window.darkModeManager?.toggle(),
                description: 'Toggle dark mode',
                category: 'Settings'
            },
            'm': { 
                handler: () => this.toggleMinimap(),
                description: 'Toggle course minimap',
                category: 'View'
            },
            'Escape': { 
                handler: () => this.handleEscape(),
                description: 'Close modal/overlay',
                category: 'Navigation'
            }
        });
        
        // Course navigation shortcuts
        this.register('course', {
            'j': { 
                handler: () => this.navigateSegment('next'),
                description: 'Next segment',
                category: 'Navigation'
            },
            'k': { 
                handler: () => this.navigateSegment('prev'),
                description: 'Previous segment',
                category: 'Navigation'
            },
            'ArrowRight': { 
                handler: () => this.navigateSegment('next'),
                description: 'Next segment',
                category: 'Navigation',
                preventDefault: true
            },
            'ArrowLeft': { 
                handler: () => this.navigateSegment('prev'),
                description: 'Previous segment',
                category: 'Navigation',
                preventDefault: true
            },
            'Space': { 
                handler: () => this.togglePlayPause(),
                description: 'Play/pause audio',
                category: 'Audio',
                preventDefault: true
            },
            '1': { 
                handler: () => this.changeSpeed(0.75),
                description: 'Audio speed 0.75x',
                category: 'Audio'
            },
            '2': { 
                handler: () => this.changeSpeed(1),
                description: 'Audio speed 1x',
                category: 'Audio'
            },
            '3': { 
                handler: () => this.changeSpeed(1.5),
                description: 'Audio speed 1.5x',
                category: 'Audio'
            },
            'f': { 
                handler: () => this.toggleFullscreen(),
                description: 'Toggle fullscreen',
                category: 'View'
            },
            'c': { 
                handler: () => this.toggleCaptions(),
                description: 'Toggle captions',
                category: 'View'
            }
        });
        
        // Episode shortcuts
        this.register('episode', {
            'n': { 
                handler: () => this.nextEpisode(),
                description: 'Next episode',
                category: 'Navigation'
            },
            'p': { 
                handler: () => this.previousEpisode(),
                description: 'Previous episode',
                category: 'Navigation'
            },
            'r': { 
                handler: () => this.restartEpisode(),
                description: 'Restart episode',
                category: 'Navigation'
            },
            'b': { 
                handler: () => this.toggleBookmark(),
                description: 'Bookmark current position',
                category: 'Actions'
            },
            'Enter': { 
                handler: () => this.submitInteraction(),
                description: 'Submit interaction',
                category: 'Actions'
            }
        });
    }
    
    register(context, shortcuts) {
        if (!this.shortcuts.has(context)) {
            this.shortcuts.set(context, new Map());
        }
        
        const contextShortcuts = this.shortcuts.get(context);
        Object.entries(shortcuts).forEach(([key, config]) => {
            contextShortcuts.set(this.normalizeKey(key), config);
        });
    }
    
    normalizeKey(key) {
        return key.toLowerCase().replace(/\s+/g, ' ');
    }
    
    setupEventListeners() {
        // Track key sequences for multi-key shortcuts
        this.keySequence = [];
        this.sequenceTimeout = null;
        
        document.addEventListener('keydown', (e) => {
            if (!this.enabled) return;
            
            // Ignore if typing in input fields
            if (this.isTyping(e)) return;
            
            const key = this.getKeyString(e);
            this.handleKeyPress(key, e);
        });
        
        // Clear sequence on click or focus change
        document.addEventListener('click', () => this.clearSequence());
        document.addEventListener('focusin', () => this.clearSequence());
    }
    
    isTyping(event) {
        const target = event.target;
        const tagName = target.tagName.toLowerCase();
        const isEditable = target.isContentEditable;
        const isInput = ['input', 'textarea', 'select'].includes(tagName);
        
        return isEditable || isInput;
    }
    
    getKeyString(event) {
        const parts = [];
        
        if (event.ctrlKey || event.metaKey) parts.push('Ctrl');
        if (event.altKey) parts.push('Alt');
        if (event.shiftKey) parts.push('Shift');
        
        let key = event.key;
        if (key === ' ') key = 'Space';
        if (key.length === 1) key = key.toLowerCase();
        
        parts.push(key);
        return parts.join('+');
    }
    
    handleKeyPress(key, event) {
        // Add to sequence
        this.keySequence.push(key);
        
        // Clear previous timeout
        if (this.sequenceTimeout) {
            clearTimeout(this.sequenceTimeout);
        }
        
        // Set new timeout to clear sequence
        this.sequenceTimeout = setTimeout(() => this.clearSequence(), 500);
        
        // Try to match shortcuts
        const matched = this.tryMatchShortcut(event);
        
        if (matched) {
            this.clearSequence();
        }
    }
    
    tryMatchShortcut(event) {
        const sequence = this.keySequence.join(' ');
        
        // Check current context first, then global
        const contexts = [this.currentContext, 'global'];
        
        for (const context of contexts) {
            const contextShortcuts = this.shortcuts.get(context);
            if (!contextShortcuts) continue;
            
            // Check exact match
            if (contextShortcuts.has(sequence)) {
                const shortcut = contextShortcuts.get(sequence);
                if (shortcut.preventDefault) {
                    event.preventDefault();
                }
                shortcut.handler();
                return true;
            }
            
            // Check if sequence is a prefix of any shortcut
            for (const [key, shortcut] of contextShortcuts) {
                if (key.startsWith(sequence) && key !== sequence) {
                    // Partial match, wait for more keys
                    return false;
                }
            }
        }
        
        return false;
    }
    
    clearSequence() {
        this.keySequence = [];
        if (this.sequenceTimeout) {
            clearTimeout(this.sequenceTimeout);
            this.sequenceTimeout = null;
        }
    }
    
    setContext(context) {
        if (this.contexts.includes(context)) {
            this.currentContext = context;
        }
    }
    
    // Shortcut handlers
    toggleHelp() {
        if (this.helpModal) {
            this.helpModal.classList.toggle('hidden');
        }
    }
    
    focusSearch() {
        const searchInput = document.querySelector('.search-input, #searchInput');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
    
    navigateTo(location) {
        switch (location) {
            case 'home':
                window.location.href = '/';
                break;
            case 'courses':
                document.getElementById('courseSelectionView')?.classList.add('active');
                document.getElementById('episodePlayerView')?.classList.remove('active');
                break;
        }
    }
    
    navigateSegment(direction) {
        if (window.episodePlayer) {
            if (direction === 'next') {
                episodePlayer.nextSegment();
            } else {
                episodePlayer.prevSegment();
            }
        }
    }
    
    togglePlayPause() {
        if (window.audioManager) {
            audioManager.togglePlayPause();
        }
    }
    
    changeSpeed(speed) {
        if (window.audioManager && audioManager.audioPlayer) {
            audioManager.audioPlayer.playbackRate = speed;
            audioManager.audioSpeedBtn.textContent = `${speed}x`;
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    toggleCaptions() {
        // Toggle caption display
        const captions = document.querySelector('.segment-captions');
        if (captions) {
            captions.classList.toggle('hidden');
        }
    }
    
    toggleMinimap() {
        const minimap = document.querySelector('.course-minimap');
        if (minimap) {
            minimap.classList.toggle('hidden');
        }
    }
    
    handleEscape() {
        // Close any open modals
        document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
            modal.classList.add('hidden');
        });
        
        // Close help if open
        if (this.helpModal && !this.helpModal.classList.contains('hidden')) {
            this.helpModal.classList.add('hidden');
        }
    }
    
    createHelpModal() {
        const modal = document.createElement('div');
        modal.className = 'keyboard-shortcuts-modal modal hidden';
        modal.innerHTML = `
            <div class="modal-content glass-effect">
                <div class="modal-header">
                    <h2>Keyboard Shortcuts</h2>
                    <button class="modal-close" onclick="window.keyboardShortcuts.toggleHelp()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${this.renderShortcutsList()}
                </div>
                <div class="modal-footer">
                    <p>Press <kbd>?</kbd> to toggle this help</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.helpModal = modal;
    }
    
    renderShortcutsList() {
        const categories = new Map();
        
        // Group shortcuts by category
        this.shortcuts.forEach((contextShortcuts, context) => {
            contextShortcuts.forEach((shortcut, key) => {
                const category = shortcut.category || 'Other';
                if (!categories.has(category)) {
                    categories.set(category, []);
                }
                categories.get(category).push({
                    key,
                    ...shortcut,
                    context
                });
            });
        });
        
        // Render categories
        let html = '';
        categories.forEach((shortcuts, category) => {
            html += `
                <div class="shortcuts-category">
                    <h3>${category}</h3>
                    <div class="shortcuts-list">
                        ${shortcuts.map(s => `
                            <div class="shortcut-item">
                                <kbd>${s.key}</kbd>
                                <span>${s.description}</span>
                                ${s.context !== 'global' ? `<span class="context-badge">${s.context}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        
        return html;
    }
}

// Initialize keyboard shortcuts
window.keyboardShortcuts = new KeyboardShortcutsManager();

// Add keyboard shortcut styles
const shortcutStyles = `
<style>
.keyboard-shortcuts-modal .modal-content {
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
}

.shortcuts-category {
    margin-bottom: 24px;
}

.shortcuts-category h3 {
    color: var(--primary-color);
    margin-bottom: 12px;
    font-size: 1.1em;
}

.shortcuts-list {
    display: grid;
    gap: 8px;
}

.shortcut-item {
    display: grid;
    grid-template-columns: 120px 1fr auto;
    align-items: center;
    padding: 8px 12px;
    background: var(--surface-bg);
    border-radius: 8px;
    font-size: 0.9em;
}

.shortcut-item kbd {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 4px 8px;
    font-family: monospace;
    font-size: 0.9em;
}

.context-badge {
    background: var(--primary-color);
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.8em;
}

/* Focus indicators */
*:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}

button:focus,
a:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}

/* Skip link */
.skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--primary-color);
    color: white;
    padding: 8px 16px;
    text-decoration: none;
    border-radius: 0 0 8px 0;
    z-index: 10000;
}

.skip-link:focus {
    top: 0;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', shortcutStyles);