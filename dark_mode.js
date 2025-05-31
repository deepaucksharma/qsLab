/**
 * Dark Mode Manager for Neural Learn
 * Track 4: Platform Polish & User Experience
 * Handles theme switching with system preference detection
 */

class DarkModeManager {
    constructor() {
        this.STORAGE_KEY = 'neural-learn-theme';
        this.THEMES = {
            LIGHT: 'light',
            DARK: 'dark',
            AUTO: 'auto'
        };
        
        this.currentTheme = this.THEMES.AUTO;
        this.activeTheme = this.THEMES.LIGHT;
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        this.init();
    }
    
    init() {
        // Load saved preference
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved && Object.values(this.THEMES).includes(saved)) {
            this.currentTheme = saved;
        }
        
        // Apply initial theme
        this.applyTheme();
        
        // Listen for system theme changes
        this.mediaQuery.addEventListener('change', () => {
            if (this.currentTheme === this.THEMES.AUTO) {
                this.applyTheme();
            }
        });
        
        // Create theme toggle button
        this.createToggleButton();
    }
    
    applyTheme() {
        const isDark = this.shouldUseDarkTheme();
        this.activeTheme = isDark ? this.THEMES.DARK : this.THEMES.LIGHT;
        
        document.documentElement.setAttribute('data-theme', this.activeTheme);
        
        // Update meta theme color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.content = isDark ? '#1a1a1a' : '#ffffff';
        }
        
        // Update Prism theme
        this.updateCodeTheme(isDark);
        
        // Emit event
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: this.activeTheme, isDark } 
        }));
    }
    
    shouldUseDarkTheme() {
        if (this.currentTheme === this.THEMES.DARK) return true;
        if (this.currentTheme === this.THEMES.LIGHT) return false;
        return this.mediaQuery.matches;
    }
    
    setTheme(theme) {
        if (!Object.values(this.THEMES).includes(theme)) return;
        
        this.currentTheme = theme;
        localStorage.setItem(this.STORAGE_KEY, theme);
        this.applyTheme();
        this.updateToggleButton();
    }
    
    toggle() {
        const themes = [this.THEMES.LIGHT, this.THEMES.DARK, this.THEMES.AUTO];
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.setTheme(themes[nextIndex]);
    }
    
    updateCodeTheme(isDark) {
        const prismTheme = document.getElementById('prism-theme');
        if (prismTheme) {
            prismTheme.href = isDark 
                ? 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css'
                : 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css';
        }
    }
    
    createToggleButton() {
        const button = document.createElement('button');
        button.className = 'theme-toggle-btn';
        button.setAttribute('aria-label', 'Toggle theme');
        button.innerHTML = this.getToggleIcon();
        
        button.addEventListener('click', () => this.toggle());
        
        // Add to header if it exists
        const header = document.querySelector('.app-header .header-right');
        if (header) {
            header.insertBefore(button, header.firstChild);
        }
        
        this.toggleButton = button;
        this.updateToggleButton();
    }
    
    updateToggleButton() {
        if (this.toggleButton) {
            this.toggleButton.innerHTML = this.getToggleIcon();
            this.toggleButton.title = this.getToggleTooltip();
        }
    }
    
    getToggleIcon() {
        const icons = {
            [this.THEMES.LIGHT]: '<i class="fas fa-moon"></i>',
            [this.THEMES.DARK]: '<i class="fas fa-sun"></i>',
            [this.THEMES.AUTO]: '<i class="fas fa-adjust"></i>'
        };
        return icons[this.currentTheme] || icons[this.THEMES.AUTO];
    }
    
    getToggleTooltip() {
        const tooltips = {
            [this.THEMES.LIGHT]: 'Switch to dark mode',
            [this.THEMES.DARK]: 'Switch to auto mode',
            [this.THEMES.AUTO]: 'Switch to light mode'
        };
        return tooltips[this.currentTheme] || 'Toggle theme';
    }
    
    // Public API
    isDark() {
        return this.activeTheme === this.THEMES.DARK;
    }
    
    getTheme() {
        return this.currentTheme;
    }
    
    getActiveTheme() {
        return this.activeTheme;
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.darkModeManager = new DarkModeManager();
    });
} else {
    window.darkModeManager = new DarkModeManager();
}

// Add dark mode styles
const darkModeStyles = `
<style id="dark-mode-styles">
/* Dark Mode Variables */
[data-theme="dark"] {
    --bg-primary: #0a0a0a;
    --bg-secondary: #1a1a1a;
    --bg-tertiary: #2a2a2a;
    --surface-bg: rgba(255, 255, 255, 0.05);
    --glass-bg: rgba(255, 255, 255, 0.03);
    --glass-border: rgba(255, 255, 255, 0.1);
    --text-primary: #e0e0e0;
    --text-secondary: #a0a0a0;
    --text-tertiary: #707070;
    --shadow-color: rgba(0, 0, 0, 0.5);
    --code-bg: #1e1e1e;
    --input-bg: rgba(255, 255, 255, 0.08);
    --hover-bg: rgba(255, 255, 255, 0.1);
}

/* Dark mode specific adjustments */
[data-theme="dark"] .animated-bg {
    opacity: 0.3;
}

[data-theme="dark"] .glass-effect {
    background: var(--glass-bg);
    border-color: var(--glass-border);
}

[data-theme="dark"] .course-card {
    background: var(--surface-bg);
    border: 1px solid var(--glass-border);
}

[data-theme="dark"] .course-card:hover {
    background: var(--hover-bg);
    border-color: rgba(102, 126, 234, 0.5);
}

[data-theme="dark"] .segment {
    background: var(--surface-bg);
    border-color: var(--glass-border);
}

[data-theme="dark"] .code-segment,
[data-theme="dark"] .code-block-container {
    background: var(--code-bg);
    border-color: var(--glass-border);
}

[data-theme="dark"] input,
[data-theme="dark"] textarea,
[data-theme="dark"] select {
    background: var(--input-bg);
    border-color: var(--glass-border);
    color: var(--text-primary);
}

[data-theme="dark"] .loading-spinner {
    border-color: rgba(255, 255, 255, 0.1);
    border-top-color: var(--primary-color);
}

[data-theme="dark"] .toast {
    background: var(--bg-secondary);
    border-color: var(--glass-border);
    color: var(--text-primary);
}

/* Theme toggle button */
.theme-toggle-btn {
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-size: 1.2em;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.theme-toggle-btn:hover {
    background: var(--hover-bg);
    transform: rotate(180deg);
}

/* Smooth theme transitions */
* {
    transition: background-color 0.3s ease, 
                border-color 0.3s ease,
                color 0.3s ease;
}

/* Prevent transition on page load */
.no-transitions * {
    transition: none !important;
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', darkModeStyles);

// Prevent transitions on initial load
document.body.classList.add('no-transitions');
setTimeout(() => document.body.classList.remove('no-transitions'), 100);