/**
 * Unified App Initializer
 * Brings together all 4 tracks into a cohesive application
 */

import { apiClient } from './api-client.js';
import { progressSyncAdapter } from './progress-sync-adapter.js';
import { progressTracker } from '../services/ProgressTracker.js';
import { toast } from '../components/ui/Toast.js';

class UnifiedApp {
  constructor() {
    this.initialized = false;
    this.config = {
      apiURL: window.API_URL || 'http://localhost:3001',
      features: {
        multiUser: true,
        serverSync: true,
        achievements: true,
        analytics: true
      }
    };
  }

  /**
   * Initialize the unified application
   */
  async initialize() {
    console.log('🚀 Initializing Kafka Learning Lab...');
    
    try {
      // Step 1: Check backend connectivity
      await this.checkBackendConnection();
      
      // Step 2: Initialize authentication
      await this.initializeAuth();
      
      // Step 3: Load user data and sync progress
      await this.loadUserData();
      
      // Step 4: Initialize lab infrastructure
      await this.initializeLabInfrastructure();
      
      // Step 5: Load dynamic content
      await this.loadDynamicContent();
      
      // Step 6: Setup real-time features
      this.setupRealtimeFeatures();
      
      // Step 7: Initialize UI enhancements
      this.initializeUI();
      
      this.initialized = true;
      console.log('✅ Kafka Learning Lab initialized successfully!');
      
      // Show welcome message
      this.showWelcomeMessage();
      
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.handleInitializationError(error);
    }
  }

  /**
   * Check backend connectivity
   */
  async checkBackendConnection() {
    try {
      const health = await fetch(`${this.config.apiURL}/health`);
      if (!health.ok) throw new Error('Backend not healthy');
      
      const data = await health.json();
      console.log('✅ Backend connected:', data);
      
      // Update API client base URL
      apiClient.baseURL = `${this.config.apiURL}/api`;
      
    } catch (error) {
      console.warn('⚠️ Backend not available, running in offline mode');
      this.config.features.serverSync = false;
    }
  }

  /**
   * Initialize authentication
   */
  async initializeAuth() {
    const token = localStorage.getItem('authToken');
    
    if (token && this.config.features.serverSync) {
      try {
        // Validate token
        const user = await apiClient.get('/auth/me');
        this.currentUser = user;
        console.log('✅ Authenticated as:', user.email);
      } catch (error) {
        // Token invalid, clear it
        localStorage.removeItem('authToken');
        apiClient.token = null;
      }
    }
  }

  /**
   * Load user data and sync progress
   */
  async loadUserData() {
    if (this.config.features.serverSync && this.currentUser) {
      try {
        // Get server progress
        const serverProgress = await apiClient.getProgress();
        
        // Merge with local progress
        progressSyncAdapter.mergeProgress(serverProgress);
        
        console.log('✅ Progress synced with server');
      } catch (error) {
        console.warn('Could not sync progress:', error);
      }
    }
    
    // Load local progress
    const progress = progressTracker.getOverallProgress();
    console.log(`📊 Overall progress: ${progress}%`);
  }

  /**
   * Initialize lab infrastructure
   */
  async initializeLabInfrastructure() {
    if (!this.config.features.multiUser || !this.currentUser) return;
    
    try {
      // Check lab status for current week
      const currentWeek = this.getCurrentWeek();
      const labStatus = await apiClient.getLabStatus(currentWeek);
      
      if (labStatus.status === 'running') {
        console.log(`✅ Lab ${currentWeek} is running`);
        this.currentLab = labStatus;
      }
    } catch (error) {
      console.log('No active lab session');
    }
  }

  /**
   * Load dynamic content
   */
  async loadDynamicContent() {
    if (!this.config.features.serverSync) return;
    
    try {
      // Pre-load content for current week
      const currentWeek = this.getCurrentWeek();
      const content = await apiClient.getWeekContent(currentWeek);
      
      // Cache content
      this.contentCache = {
        [currentWeek]: content
      };
      
      console.log(`✅ Loaded content for ${currentWeek}`);
    } catch (error) {
      console.log('Using embedded content');
    }
  }

  /**
   * Setup real-time features
   */
  setupRealtimeFeatures() {
    // Progress sync adapter already handles periodic sync
    progressTracker.on('achievementUnlocked', (achievement) => {
      this.showAchievement(achievement);
    });
    
    progressTracker.on('moduleProgress', ({ moduleId, progress }) => {
      if (progress === 100 && this.config.features.serverSync) {
        // Unlock next module on server
        this.unlockNextModule(moduleId);
      }
    });
  }

  /**
   * Initialize UI enhancements
   */
  initializeUI() {
    // Add sync status indicator
    this.addSyncStatusIndicator();
    
    // Add user menu if authenticated
    if (this.currentUser) {
      this.addUserMenu();
    }
    
    // Initialize enhanced components
    this.initializeEnhancedComponents();
  }

  /**
   * Add sync status indicator
   */
  addSyncStatusIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'sync-status';
    indicator.className = 'sync-status';
    indicator.innerHTML = `
      <i class="fas fa-sync"></i>
      <span class="sync-text">Synced</span>
    `;
    
    document.querySelector('.header')?.appendChild(indicator);
    
    // Update sync status
    progressTracker.on('syncComplete', () => {
      indicator.classList.remove('syncing', 'error');
      indicator.classList.add('synced');
      indicator.querySelector('.sync-text').textContent = 'Synced';
    });
    
    progressTracker.on('syncFailed', () => {
      indicator.classList.remove('syncing', 'synced');
      indicator.classList.add('error');
      indicator.querySelector('.sync-text').textContent = 'Offline';
    });
  }

  /**
   * Add user menu
   */
  addUserMenu() {
    const userMenu = document.createElement('div');
    userMenu.className = 'user-menu';
    userMenu.innerHTML = `
      <button class="user-menu-toggle">
        <i class="fas fa-user-circle"></i>
        <span>${this.currentUser.name || this.currentUser.email}</span>
      </button>
      <div class="user-menu-dropdown">
        <a href="#profile"><i class="fas fa-user"></i> Profile</a>
        <a href="#settings"><i class="fas fa-cog"></i> Settings</a>
        <hr>
        <a href="#" onclick="unifiedApp.logout()">
          <i class="fas fa-sign-out-alt"></i> Logout
        </a>
      </div>
    `;
    
    document.querySelector('.header')?.appendChild(userMenu);
  }

  /**
   * Initialize enhanced components
   */
  initializeEnhancedComponents() {
    // Dynamic quiz loading
    this.setupDynamicQuizzes();
    
    // Lab start buttons
    this.setupLabStartButtons();
    
    // Exercise tracking
    this.setupExerciseTracking();
  }

  /**
   * Setup dynamic quiz loading
   */
  setupDynamicQuizzes() {
    document.addEventListener('click', async (e) => {
      if (e.target.matches('[data-quiz-id]')) {
        e.preventDefault();
        const quizId = e.target.dataset.quizId;
        await this.loadAndLaunchQuiz(quizId);
      }
    });
  }

  /**
   * Load and launch quiz
   */
  async loadAndLaunchQuiz(quizId) {
    try {
      let quizData;
      
      if (this.config.features.serverSync) {
        // Load from server
        quizData = await apiClient.getQuiz(quizId);
      } else {
        // Use local quiz data
        quizData = window[`${quizId}Data`];
      }
      
      if (!quizData) throw new Error('Quiz not found');
      
      // Launch quiz using existing quiz system
      window.launchQuiz(quizData);
      
    } catch (error) {
      toast.error('Could not load quiz');
    }
  }

  /**
   * Setup lab start buttons
   */
  setupLabStartButtons() {
    document.addEventListener('click', async (e) => {
      if (e.target.matches('[data-start-lab]')) {
        e.preventDefault();
        const weekId = e.target.dataset.startLab;
        await this.startLab(weekId);
      }
    });
  }

  /**
   * Start a lab
   */
  async startLab(weekId) {
    if (!this.config.features.multiUser) {
      // Local mode - just show instructions
      toast.info('Start lab locally with docker-compose up -d');
      return;
    }
    
    try {
      toast.info('Starting lab environment...');
      
      const lab = await apiClient.startLab(weekId);
      this.currentLab = lab;
      
      toast.success('Lab environment ready!');
      
      // Initialize terminal for the lab
      this.initializeLabTerminal(lab);
      
    } catch (error) {
      toast.error('Could not start lab: ' + error.message);
    }
  }

  /**
   * Initialize lab terminal
   */
  initializeLabTerminal(lab) {
    const terminalId = `${lab.weekId}-terminal`;
    const terminal = window.terminals[terminalId];
    
    if (terminal && lab.containerId) {
      // Update terminal to use lab container
      terminal.containerId = lab.containerId;
      terminal.reconnect();
    }
  }

  /**
   * Setup exercise tracking
   */
  setupExerciseTracking() {
    // Enhanced checkbox tracking
    document.addEventListener('change', async (e) => {
      if (e.target.matches('.exercise-checkbox')) {
        const exerciseId = e.target.dataset.exerciseId;
        const moduleId = e.target.dataset.moduleId;
        
        if (e.target.checked) {
          // Track completion
          progressTracker.completeExercise(moduleId, exerciseId, {
            completedAt: new Date().toISOString()
          });
          
          // Show feedback
          const messages = [
            'Great job! 🎉',
            'Excellent work! 💪',
            'You\'re making progress! 🚀',
            'Keep it up! ⭐',
            'Fantastic! 🌟'
          ];
          
          toast.success(messages[Math.floor(Math.random() * messages.length)]);
        }
      }
    });
  }

  /**
   * Get current week based on progress
   */
  getCurrentWeek() {
    const modules = ['week1', 'week2', 'week3', 'week4', 'week5'];
    
    for (const module of modules) {
      const progress = progressTracker.state.modules[module].progress;
      if (progress < 100) return module;
    }
    
    return 'week5'; // All complete, return last week
  }

  /**
   * Show welcome message
   */
  showWelcomeMessage() {
    const hour = new Date().getHours();
    let greeting = 'Welcome';
    
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';
    
    if (this.currentUser) {
      greeting += `, ${this.currentUser.name || this.currentUser.email}`;
    }
    
    toast.success(`${greeting}! Ready to master Kafka observability? 🚀`);
  }

  /**
   * Show achievement notification
   */
  showAchievement(achievement) {
    // Use existing achievement notification system
    if (window.showAchievementNotification) {
      window.showAchievementNotification(achievement);
    }
  }

  /**
   * Unlock next module
   */
  async unlockNextModule(completedModuleId) {
    const modules = ['week1', 'week2', 'week3', 'week4', 'week5'];
    const currentIndex = modules.indexOf(completedModuleId);
    
    if (currentIndex < modules.length - 1) {
      const nextModule = modules[currentIndex + 1];
      
      // Update UI
      const card = window.state?.moduleCards?.get(nextModule);
      if (card) {
        card.props.isLocked = false;
        card.update();
      }
      
      toast.info(`${this.getModuleName(nextModule)} is now unlocked!`);
    }
  }

  /**
   * Get module display name
   */
  getModuleName(moduleId) {
    const names = {
      week1: 'Week 1: X-Ray Vision',
      week2: 'Week 2: The Builder',
      week3: 'Week 3: The Optimizer',
      week4: 'Week 4: The Detective',
      week5: 'Week 5: The Architect'
    };
    return names[moduleId] || moduleId;
  }

  /**
   * Handle initialization error
   */
  handleInitializationError(error) {
    console.error('Initialization error:', error);
    
    // Show user-friendly error
    const errorContainer = document.createElement('div');
    errorContainer.className = 'init-error';
    errorContainer.innerHTML = `
      <div class="error-content">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Initialization Error</h3>
        <p>The app is running in offline mode. Some features may be limited.</p>
        <button onclick="location.reload()" class="btn btn--primary">
          <i class="fas fa-redo"></i> Retry
        </button>
      </div>
    `;
    
    document.body.appendChild(errorContainer);
  }

  /**
   * Logout
   */
  async logout() {
    try {
      await apiClient.logout();
      this.currentUser = null;
      location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
}

// Create and initialize the unified app
const unifiedApp = new UnifiedApp();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => unifiedApp.initialize());
} else {
  unifiedApp.initialize();
}

// Export for global access
window.unifiedApp = unifiedApp;

export { unifiedApp };