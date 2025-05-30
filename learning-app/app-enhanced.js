// Import new modules
import { Component } from './components/base/Component.js';
import { toast } from './components/ui/Toast.js';
import { ModuleCard } from './components/learning/ModuleCard.js';
import { progressTracker } from './services/ProgressTracker.js';

// Enhanced Global State with Progress Tracker
const state = {
    currentSection: 'overview',
    terminals: {},
    moduleCards: new Map(),
    progressTracker: progressTracker,
    jmxCommands: {
        'help': 'Available commands: open, domains, domain, beans, bean, info, get, quit',
        'open localhost:9999': 'Connected to localhost:9999',
        'domains': 'kafka.server\nkafka.network\nkafka.log\nkafka.controller\njava.lang',
        'domain kafka.server': 'Domain kafka.server selected',
        'beans': 'kafka.server:name=MessagesInPerSec,type=BrokerTopicMetrics\nkafka.server:name=BytesInPerSec,type=BrokerTopicMetrics\nkafka.server:name=BytesOutPerSec,type=BrokerTopicMetrics',
        'bean kafka.server:name=MessagesInPerSec,type=BrokerTopicMetrics': 'Bean selected',
        'info': 'Attributes:\n  Count (long): Total number of messages\n  OneMinuteRate (double): Messages per second (1 minute average)\n  FiveMinuteRate (double): Messages per second (5 minute average)',
        'get Count': 'Count = 15823',
        'get OneMinuteRate': 'OneMinuteRate = 1024.5'
    }
};

// Module configurations
const moduleConfigs = [
    {
        moduleId: 'foundation',
        title: 'Foundation',
        subtitle: 'Core concepts and mental models',
        objectives: [
            'Understand Kafka observability fundamentals',
            'Learn key metrics and their importance',
            'Master mental models for monitoring'
        ],
        exercises: [
            { id: 'intro-kafka', name: 'Introduction to Kafka Monitoring', completed: false },
            { id: 'mental-models', name: 'Mental Models Workshop', completed: false },
            { id: 'architecture-overview', name: 'Architecture Deep Dive', completed: false }
        ]
    },
    {
        moduleId: 'week1',
        title: 'Week 1: X-Ray Vision',
        subtitle: 'See through the data flow',
        objectives: [
            'Trace metrics from source to destination',
            'Master JMX exploration techniques',
            'Understand data transformation pipeline'
        ],
        exercises: [
            { id: 'metric-xray', name: 'Metric X-Ray Exercise', completed: false },
            { id: 'jmx-deep-dive', name: 'JMX Deep Dive', completed: false },
            { id: 'data-flow-trace', name: 'Data Flow Tracing', completed: false }
        ]
    },
    {
        moduleId: 'week2',
        title: 'Week 2: The Builder',
        subtitle: 'Create custom integrations',
        objectives: [
            'Build custom OHI integrations',
            'Master New Relic Flex',
            'Compare integration approaches'
        ],
        exercises: [
            { id: 'build-integration', name: 'Build Tombstone Monitor', completed: false },
            { id: 'flex-config', name: 'Flex Configuration', completed: false },
            { id: 'comparison', name: 'Integration Comparison', completed: false }
        ]
    },
    {
        moduleId: 'week3',
        title: 'Week 3: The Optimizer',
        subtitle: 'Performance tuning mastery',
        objectives: [
            'Identify performance bottlenecks',
            'Optimize Kafka configurations',
            'Scale monitoring infrastructure'
        ],
        exercises: [
            { id: 'performance-baseline', name: 'Performance Baseline', completed: false },
            { id: 'bottleneck-hunt', name: 'Bottleneck Hunt', completed: false },
            { id: 'optimization', name: 'Optimization Challenge', completed: false }
        ]
    },
    {
        moduleId: 'week4',
        title: 'Week 4: The Detective',
        subtitle: 'Troubleshooting expertise',
        objectives: [
            'Master troubleshooting techniques',
            'Debug complex metric issues',
            'Perform root cause analysis'
        ],
        exercises: [
            { id: 'troubleshoot-lag', name: 'Troubleshoot Consumer Lag', completed: false },
            { id: 'debug-metrics', name: 'Debug Missing Metrics', completed: false },
            { id: 'root-cause', name: 'Root Cause Analysis', completed: false }
        ]
    },
    {
        moduleId: 'week5',
        title: 'Week 5: The Architect',
        subtitle: 'Design complete solutions',
        objectives: [
            'Design observability architecture',
            'Plan integration strategies',
            'Create monitoring blueprints'
        ],
        exercises: [
            { id: 'design-system', name: 'Design Monitoring System', completed: false },
            { id: 'architecture-review', name: 'Architecture Review', completed: false },
            { id: 'capstone', name: 'Capstone Project', completed: false }
        ]
    }
];

// Initialize the enhanced app
document.addEventListener('DOMContentLoaded', () => {
    // Load existing progress
    loadEnhancedProgress();
    
    // Setup enhanced UI
    setupEnhancedUI();
    
    // Initialize components
    initializeModuleCards();
    
    // Setup event listeners
    setupEnhancedEventListeners();
    
    // Track progress changes
    progressTracker.on('moduleProgress', handleModuleProgress);
    progressTracker.on('achievementUnlocked', handleAchievementUnlocked);
    progressTracker.on('exerciseCompleted', handleExerciseCompleted);
    
    // Initialize terminals and other features
    initializeTerminals();
    initializeAnimations();
    
    // Show welcome toast
    toast.success('Welcome to Kafka Observability Lab! 🚀', 3000);
    
    // Mark app as loaded
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// Setup enhanced UI
function setupEnhancedUI() {
    // Add design system CSS
    const designSystemLink = document.createElement('link');
    designSystemLink.rel = 'stylesheet';
    designSystemLink.href = 'styles/design-system.css';
    document.head.appendChild(designSystemLink);
    
    // Add component CSS files
    const componentStyles = [
        'styles/components/toast.css',
        'styles/components/module-card.css'
    ];
    
    componentStyles.forEach(style => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = style;
        document.head.appendChild(link);
    });
    
    // Add progress dashboard button
    const dashboardBtn = document.createElement('button');
    dashboardBtn.className = 'dashboard-toggle';
    dashboardBtn.innerHTML = '<i class="fas fa-chart-line"></i> Progress';
    dashboardBtn.onclick = toggleProgressDashboard;
    document.querySelector('.header').appendChild(dashboardBtn);
}

// Initialize module cards
function initializeModuleCards() {
    const modulesContainer = document.querySelector('.modules-grid');
    if (!modulesContainer) {
        // Create modules grid if it doesn't exist
        const grid = document.createElement('div');
        grid.className = 'modules-grid stagger-animation';
        
        const overviewSection = document.getElementById('overview');
        if (overviewSection) {
            const welcomeContent = overviewSection.querySelector('.welcome-content');
            if (welcomeContent) {
                welcomeContent.appendChild(grid);
            }
        }
    }
    
    // Create module cards
    moduleConfigs.forEach(config => {
        const progress = progressTracker.state.modules[config.moduleId].progress;
        const isLocked = config.moduleId !== 'foundation' && 
                        !isModuleUnlocked(config.moduleId);
        
        const card = new ModuleCard({
            ...config,
            progress,
            isLocked,
            onStart: (moduleId) => startModule(moduleId)
        });
        
        // Store reference
        state.moduleCards.set(config.moduleId, card);
        
        // Mount to DOM
        const container = document.createElement('div');
        container.className = 'module-card-container';
        document.querySelector('.modules-grid')?.appendChild(container);
        card.mount(container);
    });
}

// Check if module is unlocked
function isModuleUnlocked(moduleId) {
    const moduleOrder = ['foundation', 'week1', 'week2', 'week3', 'week4', 'week5'];
    const currentIndex = moduleOrder.indexOf(moduleId);
    
    if (currentIndex === 0) return true;
    
    // Check if previous module is completed
    const previousModule = moduleOrder[currentIndex - 1];
    return progressTracker.state.modules[previousModule].completed;
}

// Start a module
function startModule(moduleId) {
    // Show the module section
    showSection(moduleId);
    
    // Update nav
    const navLink = document.querySelector(`a[href="#${moduleId}"]`);
    if (navLink) {
        updateActiveNav(navLink);
    }
    
    // Track module access
    progressTracker.updateTimeSpent(moduleId, 0);
    
    // Show toast
    toast.info(`Starting ${moduleConfigs.find(m => m.moduleId === moduleId).title}`);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Enhanced event listeners
function setupEnhancedEventListeners() {
    // Original event listeners
    setupEventListeners();
    
    // Exercise completion tracking
    document.addEventListener('change', (e) => {
        if (e.target.matches('.exercise-checkbox')) {
            const exerciseId = e.target.dataset.exerciseId;
            const moduleId = e.target.dataset.moduleId;
            
            if (e.target.checked) {
                progressTracker.completeExercise(moduleId, exerciseId, {
                    timeSpent: Math.floor(Math.random() * 30) + 10 // Simulated time
                });
            }
        }
    });
    
    // Terminal command tracking
    document.addEventListener('terminalCommand', (e) => {
        progressTracker.trackCommand(e.detail.command, state.currentSection);
    });
    
    // Code execution tracking
    document.addEventListener('codeExecuted', (e) => {
        progressTracker.trackCodeExecution(e.detail.code, e.detail.result, state.currentSection);
    });
}

// Handle module progress updates
function handleModuleProgress({ moduleId, progress }) {
    // Update module card
    const card = state.moduleCards.get(moduleId);
    if (card) {
        card.updateProgress(progress);
    }
    
    // Update nav badge
    const badge = document.querySelector(`a[href="#${moduleId}"] .progress-badge`);
    if (badge) {
        badge.textContent = `${Math.round(progress)}%`;
        if (progress === 100) {
            badge.classList.add('complete');
            confetti(badge);
        }
    }
    
    // Check for newly unlocked modules
    checkUnlockedModules();
    
    // Update overall progress
    updateOverallProgress();
}

// Handle achievement unlocked
function handleAchievementUnlocked(achievement) {
    // Show achievement notification
    showAchievementNotification(achievement);
    
    // Add to achievements display
    addAchievementToDisplay(achievement);
    
    // Play celebration animation
    celebrateAchievement();
}

// Show achievement notification
function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification animate-scale-in';
    notification.innerHTML = `
        <div class="achievement-icon">
            <i class="fas fa-${achievement.icon}"></i>
        </div>
        <div class="achievement-content">
            <h4>Achievement Unlocked!</h4>
            <p class="achievement-title">${achievement.title}</p>
            <p class="achievement-description">${achievement.description}</p>
            <p class="achievement-xp">+${achievement.xp} XP</p>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after animation
    setTimeout(() => {
        notification.classList.add('animate-fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

// Handle exercise completed
function handleExerciseCompleted({ moduleId, exerciseId }) {
    // Update module card exercises
    const card = state.moduleCards.get(moduleId);
    if (card) {
        const exercise = card.props.exercises.find(e => e.id === exerciseId);
        if (exercise) {
            exercise.completed = true;
            card.update();
        }
    }
    
    // Show completion toast
    toast.success('Exercise completed! Great job! 🎉');
}

// Check for newly unlocked modules
function checkUnlockedModules() {
    state.moduleCards.forEach((card, moduleId) => {
        if (card.props.isLocked && isModuleUnlocked(moduleId)) {
            card.props.isLocked = false;
            card.update();
            toast.info(`${card.props.title} is now unlocked!`);
        }
    });
}

// Update overall progress
function updateOverallProgress() {
    const overall = progressTracker.getOverallProgress();
    
    // Update progress bar
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    if (progressFill && progressText) {
        progressFill.style.width = `${overall}%`;
        progressText.textContent = `${overall}% Complete`;
    }
    
    // Check for completion
    if (overall === 100 && !progressTracker.hasAchievement('all_complete')) {
        showCompletionCertificate();
    }
}

// Toggle progress dashboard
function toggleProgressDashboard() {
    const dashboard = document.getElementById('progress-dashboard');
    if (!dashboard) {
        createProgressDashboard();
    } else {
        dashboard.classList.toggle('show');
    }
}

// Create progress dashboard
function createProgressDashboard() {
    const dashboard = document.createElement('div');
    dashboard.id = 'progress-dashboard';
    dashboard.className = 'progress-dashboard-overlay';
    dashboard.innerHTML = `
        <div class="progress-dashboard-content">
            <button class="close-dashboard" onclick="toggleProgressDashboard()">
                <i class="fas fa-times"></i>
            </button>
            <h2>Your Learning Journey</h2>
            <div id="dashboard-container"></div>
        </div>
    `;
    
    document.body.appendChild(dashboard);
    
    // Import and mount dashboard component
    import('./components/dashboard/ProgressDashboard.js').then(module => {
        const ProgressDashboard = module.ProgressDashboard;
        const dashboardComponent = new ProgressDashboard({
            progressTracker: progressTracker
        });
        dashboardComponent.mount(document.getElementById('dashboard-container'));
    });
    
    setTimeout(() => dashboard.classList.add('show'), 10);
}

// Enhanced animations
function celebrateAchievement() {
    // Create particle effects
    for (let i = 0; i < 50; i++) {
        createCelebrationParticle();
    }
}

function createCelebrationParticle() {
    const particle = document.createElement('div');
    particle.className = 'celebration-particle';
    particle.style.left = Math.random() * window.innerWidth + 'px';
    particle.style.backgroundColor = ['#FFD700', '#FF69B4', '#00CED1', '#98FB98'][Math.floor(Math.random() * 4)];
    particle.style.animationDelay = Math.random() * 0.5 + 's';
    document.body.appendChild(particle);
    
    setTimeout(() => particle.remove(), 3000);
}

// Load enhanced progress
function loadEnhancedProgress() {
    // Progress tracker handles its own loading
    // Update UI based on loaded state
    const progress = progressTracker.state;
    
    // Update theme preference
    if (progress.preferences.theme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    }
}

// Initialize terminals with enhanced features
function initializeTerminals() {
    // Terminal initialization code from original app.js
    const playgroundObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.id === 'playground' && !state.terminals['playground-main']) {
                state.terminals['playground-main'] = initializeTerminal('playground-main-terminal', {
                    serverUrl: 'ws://localhost:3001',
                    theme: 'dark',
                    onCommand: (command) => {
                        document.dispatchEvent(new CustomEvent('terminalCommand', {
                            detail: { command }
                        }));
                    }
                });
            }
        });
    });
    
    const playgroundSection = document.getElementById('playground');
    if (playgroundSection) {
        playgroundObserver.observe(playgroundSection);
    }
}

// Export enhanced functions for use in other modules
window.enhancedApp = {
    state,
    progressTracker,
    toast,
    showSection,
    updateActiveNav
};