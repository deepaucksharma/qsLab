/**
 * Integration Script for Track 1 Enhancements
 * This script integrates the new components into the existing app
 * without breaking current functionality
 */

// Dynamic imports for ES modules support
const loadEnhancements = async () => {
    try {
        // Check if browser supports ES modules
        const supportsModules = 'noModule' in HTMLScriptElement.prototype;
        
        if (!supportsModules) {
            console.warn('Browser does not support ES modules. Loading polyfills...');
            await loadModulePolyfill();
        }

        // Load CSS enhancements
        loadEnhancedStyles();
        
        // Load component system
        await loadComponentSystem();
        
        // Initialize enhancements
        initializeEnhancements();
        
        console.log('✅ Track 1 enhancements loaded successfully');
        
    } catch (error) {
        console.error('Failed to load enhancements:', error);
        // Fall back to original functionality
    }
};

// Load enhanced stylesheets
function loadEnhancedStyles() {
    const styles = [
        'styles/design-system.css',
        'styles/components/toast.css',
        'styles/components/module-card.css'
    ];
    
    styles.forEach(href => {
        if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
        }
    });
}

// Load component system dynamically
async function loadComponentSystem() {
    // Create a module loader for older browsers
    window.moduleLoader = {
        Component: null,
        toast: null,
        ModuleCard: null,
        progressTracker: null
    };
    
    // Load modules using dynamic imports or script tags
    if (window.Promise && window.fetch) {
        // Modern browser - use dynamic imports
        const modules = await Promise.all([
            import('./components/base/Component.js'),
            import('./components/ui/Toast.js'),
            import('./components/learning/ModuleCard.js'),
            import('./services/ProgressTracker.js')
        ]);
        
        window.moduleLoader.Component = modules[0].Component;
        window.moduleLoader.toast = modules[1].toast;
        window.moduleLoader.ModuleCard = modules[2].ModuleCard;
        window.moduleLoader.progressTracker = modules[3].progressTracker;
    } else {
        // Fallback for older browsers
        await loadScriptsSequentially([
            'components/base/Component.js',
            'components/ui/Toast.js',
            'components/learning/ModuleCard.js',
            'services/ProgressTracker.js'
        ]);
    }
}

// Initialize enhancements
function initializeEnhancements() {
    const { toast, ModuleCard, progressTracker } = window.moduleLoader;
    
    // 1. Enhance existing state with progress tracker
    if (window.state && progressTracker) {
        window.state.progressTracker = progressTracker;
        
        // Migrate existing progress to new tracker
        migrateExistingProgress();
    }
    
    // 2. Add module cards to overview section
    if (ModuleCard) {
        addModuleCards();
    }
    
    // 3. Setup achievement system
    setupAchievementSystem();
    
    // 4. Enhance navigation with better progress indicators
    enhanceNavigation();
    
    // 5. Add dashboard button
    addProgressDashboard();
    
    // 6. Setup event tracking
    setupEventTracking();
    
    // 7. Show welcome message
    if (toast) {
        setTimeout(() => {
            toast.success('Enhanced learning experience loaded! 🚀', 3000);
        }, 1000);
    }
}

// Migrate existing progress to new tracker
function migrateExistingProgress() {
    const { progressTracker } = window.moduleLoader;
    
    // Get existing checkbox states
    const checkboxStates = {};
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        if (checkbox.id && checkbox.checked) {
            checkboxStates[checkbox.id] = true;
        }
    });
    
    // Map to new exercise format
    const exerciseMap = {
        'w1-1': { module: 'week1', exercise: 'metric-xray' },
        'w1-2': { module: 'week1', exercise: 'jmx-deep-dive' },
        'w1-3': { module: 'week1', exercise: 'data-flow-trace' },
        'w2-1': { module: 'week2', exercise: 'build-integration' },
        'w2-2': { module: 'week2', exercise: 'flex-config' },
        'w2-3': { module: 'week2', exercise: 'comparison' }
        // Add more mappings as needed
    };
    
    // Update progress tracker
    Object.entries(checkboxStates).forEach(([checkboxId, checked]) => {
        if (checked && exerciseMap[checkboxId]) {
            const { module, exercise } = exerciseMap[checkboxId];
            progressTracker.completeExercise(module, exercise);
        }
    });
}

// Add module cards to overview
function addModuleCards() {
    const { ModuleCard } = window.moduleLoader;
    const overviewSection = document.querySelector('#overview .content-wrapper');
    
    if (!overviewSection) return;
    
    // Create modules grid
    const modulesGrid = document.createElement('div');
    modulesGrid.className = 'modules-grid enhanced';
    modulesGrid.innerHTML = '<h2>Your Learning Modules</h2>';
    
    // Module configurations
    const modules = [
        {
            moduleId: 'week1',
            title: 'Week 1: X-Ray Vision',
            subtitle: 'See through the data flow',
            objectives: ['Trace metrics end-to-end', 'Master JMX exploration', 'Understand data pipeline'],
            exercises: []
        },
        {
            moduleId: 'week2',
            title: 'Week 2: The Builder',
            subtitle: 'Create custom integrations',
            objectives: ['Build OHI integrations', 'Master Flex configuration', 'Compare approaches'],
            exercises: []
        },
        {
            moduleId: 'week3',
            title: 'Week 3: The Optimizer',
            subtitle: 'Performance tuning mastery',
            objectives: ['Identify bottlenecks', 'Optimize configurations', 'Scale monitoring'],
            exercises: []
        },
        {
            moduleId: 'week4',
            title: 'Week 4: The Detective',
            subtitle: 'Troubleshooting expertise',
            objectives: ['Debug metric issues', 'Root cause analysis', 'Solve complex problems'],
            exercises: []
        },
        {
            moduleId: 'week5',
            title: 'Week 5: The Architect',
            subtitle: 'Design complete solutions',
            objectives: ['Design architecture', 'Plan integrations', 'Create blueprints'],
            exercises: []
        }
    ];
    
    // Create cards container
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'module-cards-container stagger-animation';
    
    modules.forEach((moduleConfig, index) => {
        const progress = window.state?.progress?.[moduleConfig.moduleId] || 0;
        const card = new ModuleCard({
            ...moduleConfig,
            progress,
            isLocked: index > 0 && window.state?.progress?.[modules[index - 1].moduleId] < 80,
            onStart: (moduleId) => {
                // Navigate to module
                const link = document.querySelector(`a[href="#${moduleId}"]`);
                if (link) link.click();
            }
        });
        
        const cardWrapper = document.createElement('div');
        cardsContainer.appendChild(cardWrapper);
        card.mount(cardWrapper);
    });
    
    modulesGrid.appendChild(cardsContainer);
    
    // Insert after welcome message
    const welcomeContent = overviewSection.querySelector('.welcome-content');
    if (welcomeContent) {
        welcomeContent.parentNode.insertBefore(modulesGrid, welcomeContent.nextSibling);
    }
}

// Setup achievement system
function setupAchievementSystem() {
    const { progressTracker, toast } = window.moduleLoader;
    
    if (!progressTracker) return;
    
    // Listen for achievements
    progressTracker.on('achievementUnlocked', (achievement) => {
        showAchievementNotification(achievement);
        
        // Update UI
        updateAchievementDisplay();
        
        // Show toast
        if (toast) {
            toast.success(`Achievement Unlocked: ${achievement.title}`, 5000);
        }
    });
}

// Show achievement notification
function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification animate-scale-in';
    notification.innerHTML = `
        <div class="achievement-icon">
            <i class="fas fa-${achievement.icon || 'trophy'}"></i>
        </div>
        <div class="achievement-content">
            <h4>Achievement Unlocked!</h4>
            <p class="achievement-title">${achievement.title}</p>
            <p class="achievement-description">${achievement.description}</p>
            ${achievement.xp ? `<p class="achievement-xp">+${achievement.xp} XP</p>` : ''}
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

// Enhance navigation with better indicators
function enhanceNavigation() {
    const { progressTracker } = window.moduleLoader;
    
    if (!progressTracker) return;
    
    // Update progress badges with animations
    progressTracker.on('moduleProgress', ({ moduleId, progress }) => {
        const badge = document.querySelector(`a[href="#${moduleId}"] .progress-badge`);
        if (badge) {
            badge.classList.add('updating');
            setTimeout(() => {
                badge.textContent = `${Math.round(progress)}%`;
                badge.classList.remove('updating');
                
                if (progress === 100) {
                    badge.classList.add('complete');
                    // Celebration effect
                    createConfetti(badge);
                }
            }, 300);
        }
    });
}

// Add progress dashboard button
function addProgressDashboard() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    const dashboardBtn = document.createElement('button');
    dashboardBtn.className = 'btn btn--secondary dashboard-toggle';
    dashboardBtn.innerHTML = '<i class="fas fa-chart-line"></i> Progress Dashboard';
    dashboardBtn.onclick = toggleProgressDashboard;
    
    header.appendChild(dashboardBtn);
}

// Toggle progress dashboard
function toggleProgressDashboard() {
    let dashboard = document.getElementById('progress-dashboard-modal');
    
    if (!dashboard) {
        dashboard = createProgressDashboard();
    }
    
    dashboard.classList.toggle('show');
}

// Create progress dashboard
function createProgressDashboard() {
    const { progressTracker } = window.moduleLoader;
    
    const modal = document.createElement('div');
    modal.id = 'progress-dashboard-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content progress-dashboard">
            <button class="modal-close" onclick="toggleProgressDashboard()">
                <i class="fas fa-times"></i>
            </button>
            <h2>Your Learning Progress</h2>
            <div class="dashboard-stats">
                <div class="stat-card">
                    <i class="fas fa-percentage"></i>
                    <div class="stat-value">${progressTracker?.getOverallProgress() || 0}%</div>
                    <div class="stat-label">Overall Progress</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-trophy"></i>
                    <div class="stat-value">${progressTracker?.state.achievements.length || 0}</div>
                    <div class="stat-label">Achievements</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-tasks"></i>
                    <div class="stat-value">${progressTracker?.state.statistics.exercisesCompleted || 0}</div>
                    <div class="stat-label">Exercises Done</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-clock"></i>
                    <div class="stat-value">${formatTime(progressTracker?.state.statistics.totalTime || 0)}</div>
                    <div class="stat-label">Time Invested</div>
                </div>
            </div>
            <div class="skills-section">
                <h3>Skill Development</h3>
                <div class="skills-grid">
                    ${renderSkills(progressTracker?.state.skills || {})}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
}

// Render skills
function renderSkills(skills) {
    const skillNames = {
        kafkaBasics: 'Kafka Basics',
        monitoring: 'Monitoring',
        integration: 'Integration',
        troubleshooting: 'Troubleshooting',
        architecture: 'Architecture'
    };
    
    return Object.entries(skills).map(([skill, level]) => `
        <div class="skill-item">
            <div class="skill-header">
                <span class="skill-name">${skillNames[skill] || skill}</span>
                <span class="skill-level">${level}%</span>
            </div>
            <div class="skill-bar">
                <div class="skill-fill" style="width: ${level}%"></div>
            </div>
        </div>
    `).join('');
}

// Format time helper
function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

// Setup event tracking
function setupEventTracking() {
    const { progressTracker } = window.moduleLoader;
    
    if (!progressTracker) return;
    
    // Track exercise completions
    document.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox' && e.target.id && e.target.checked) {
            // Map checkbox to exercise
            const exerciseMap = {
                'w1-1': { module: 'week1', exercise: 'metric-xray' },
                'w1-2': { module: 'week1', exercise: 'jmx-deep-dive' },
                'w1-3': { module: 'week1', exercise: 'data-flow-trace' }
                // Add more mappings
            };
            
            const mapping = exerciseMap[e.target.id];
            if (mapping) {
                progressTracker.completeExercise(mapping.module, mapping.exercise);
            }
        }
    });
    
    // Track terminal commands
    if (window.terminal) {
        const originalExecute = window.terminal.executeCommand;
        window.terminal.executeCommand = function() {
            const command = this.elements.input.value;
            if (command) {
                progressTracker.trackCommand(command, window.state?.currentSection);
            }
            return originalExecute.apply(this, arguments);
        };
    }
}

// Confetti effect
function createConfetti(element) {
    const colors = ['#FFD700', '#FF69B4', '#00CED1', '#98FB98', '#DDA0DD'];
    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'confetti-particle';
        particle.style.left = rect.left + rect.width / 2 + 'px';
        particle.style.top = rect.top + rect.height / 2 + 'px';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.animation = `confetti-fall ${1 + Math.random()}s ease-out forwards`;
        particle.style.setProperty('--x-offset', (Math.random() - 0.5) * 200 + 'px');
        
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 2000);
    }
}

// Add required styles
const enhancementStyles = `
/* Module Cards Grid */
.modules-grid.enhanced {
    margin: 2rem 0;
    padding: 2rem;
    background: var(--color-surface-variant, #f5f5f5);
    border-radius: 12px;
}

.module-cards-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
}

/* Achievement Notification */
.achievement-notification {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    padding: 1.5rem 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    z-index: 10000;
    max-width: 400px;
}

.achievement-icon {
    font-size: 3rem;
    color: #FFD700;
}

.achievement-content h4 {
    margin: 0 0 0.5rem 0;
    color: #333;
}

.achievement-title {
    font-weight: bold;
    color: #2196f3;
    margin: 0.25rem 0;
}

.achievement-description {
    color: #666;
    font-size: 0.9rem;
    margin: 0;
}

.achievement-xp {
    color: #4CAF50;
    font-weight: bold;
    margin-top: 0.5rem;
}

/* Progress Dashboard Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.modal-overlay.show {
    opacity: 1;
    visibility: visible;
}

.modal-content {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    max-width: 800px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    transform: scale(0.9);
    transition: transform 0.3s ease;
}

.modal-overlay.show .modal-content {
    transform: scale(1);
}

.modal-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #666;
    cursor: pointer;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.modal-close:hover {
    background: #f0f0f0;
    color: #333;
}

/* Dashboard Stats */
.dashboard-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin: 2rem 0;
}

.stat-card {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 12px;
    text-align: center;
}

.stat-card i {
    font-size: 2rem;
    color: #2196f3;
    margin-bottom: 0.5rem;
}

.stat-value {
    font-size: 2rem;
    font-weight: bold;
    color: #333;
    margin: 0.5rem 0;
}

.stat-label {
    color: #666;
    font-size: 0.9rem;
}

/* Skills Section */
.skills-section {
    margin-top: 2rem;
}

.skills-grid {
    display: grid;
    gap: 1rem;
    margin-top: 1rem;
}

.skill-item {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
}

.skill-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
}

.skill-name {
    font-weight: 500;
    color: #333;
}

.skill-level {
    color: #2196f3;
    font-weight: bold;
}

.skill-bar {
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
}

.skill-fill {
    height: 100%;
    background: linear-gradient(90deg, #2196f3, #4CAF50);
    border-radius: 4px;
    transition: width 0.5s ease;
}

/* Dashboard Toggle Button */
.dashboard-toggle {
    margin-left: auto;
}

/* Animations */
@keyframes confetti-fall {
    0% {
        transform: translateY(0) translateX(0) rotate(0deg);
        opacity: 1;
    }
    100% {
        transform: translateY(300px) translateX(var(--x-offset)) rotate(720deg);
        opacity: 0;
    }
}

.animate-scale-in {
    animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
    from {
        transform: scale(0.8) translateX(-50%);
        opacity: 0;
    }
    to {
        transform: scale(1) translateX(-50%);
        opacity: 1;
    }
}

.fade-out {
    animation: fadeOut 0.5s ease-out forwards;
}

@keyframes fadeOut {
    to {
        opacity: 0;
        transform: scale(0.9) translateX(-50%);
    }
}

/* Progress Badge Animation */
.progress-badge.updating {
    animation: pulse 0.3s ease;
}

.progress-badge.complete {
    background-color: #4CAF50 !important;
    color: white !important;
}

/* Responsive */
@media (max-width: 768px) {
    .module-cards-container {
        grid-template-columns: 1fr;
    }
    
    .dashboard-stats {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .achievement-notification {
        width: 90%;
        max-width: none;
    }
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = enhancementStyles;
document.head.appendChild(styleSheet);

// Load module polyfill for older browsers
async function loadModulePolyfill() {
    // Simple module loader for browsers without ES module support
    window.exports = {};
    window.module = { exports: {} };
}

// Sequential script loader for fallback
async function loadScriptsSequentially(scripts) {
    for (const src of scripts) {
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadEnhancements);
} else {
    loadEnhancements();
}

// Export for manual initialization
window.loadKafkaLabEnhancements = loadEnhancements;