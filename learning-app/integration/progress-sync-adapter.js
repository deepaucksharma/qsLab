/**
 * Progress Sync Adapter
 * Integrates Track 1's ProgressTracker with Track 2's Backend
 * Maintains backward compatibility while adding server persistence
 */

import { progressTracker } from '../services/ProgressTracker.js';
import { apiClient } from './api-client.js';

class ProgressSyncAdapter {
  constructor() {
    this.syncQueue = [];
    this.isSyncing = false;
    this.lastSyncTime = null;
    this.syncInterval = 30000; // 30 seconds
    this.offlineMode = false;
    
    this.initialize();
  }

  /**
   * Initialize the adapter
   */
  initialize() {
    // Intercept ProgressTracker save method
    this.wrapProgressTrackerMethods();
    
    // Setup periodic sync
    this.startPeriodicSync();
    
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Initial sync
    this.syncProgress();
  }

  /**
   * Wrap ProgressTracker methods to add server sync
   */
  wrapProgressTrackerMethods() {
    const originalSave = progressTracker.save.bind(progressTracker);
    const originalCompleteExercise = progressTracker.completeExercise.bind(progressTracker);
    const originalCompleteQuiz = progressTracker.completeQuiz.bind(progressTracker);
    
    // Override save method
    progressTracker.save = () => {
      originalSave();
      this.queueSync('save', progressTracker.state);
    };
    
    // Override completeExercise
    progressTracker.completeExercise = (moduleId, exerciseId, data) => {
      originalCompleteExercise(moduleId, exerciseId, data);
      this.queueSync('exercise', { moduleId, exerciseId, data });
    };
    
    // Override completeQuiz
    progressTracker.completeQuiz = (moduleId, quizId, score, answers) => {
      originalCompleteQuiz(moduleId, quizId, score, answers);
      this.queueSync('quiz', { moduleId, quizId, score, answers });
    };
  }

  /**
   * Queue a sync operation
   */
  queueSync(type, data) {
    this.syncQueue.push({
      type,
      data,
      timestamp: new Date().toISOString()
    });
    
    // Trigger immediate sync if online
    if (!this.offlineMode) {
      this.syncProgress();
    }
  }

  /**
   * Sync progress with server
   */
  async syncProgress() {
    if (this.isSyncing || this.offlineMode) return;
    
    this.isSyncing = true;
    
    try {
      // Process sync queue
      while (this.syncQueue.length > 0) {
        const item = this.syncQueue.shift();
        await this.processSyncItem(item);
      }
      
      // Full state sync
      const serverProgress = await apiClient.syncProgress(progressTracker.state);
      
      // Merge server state with local state
      this.mergeProgress(serverProgress);
      
      this.lastSyncTime = new Date();
      progressTracker.emit('syncComplete', { time: this.lastSyncTime });
      
    } catch (error) {
      console.error('Progress sync failed:', error);
      
      // Put failed items back in queue
      if (this.syncQueue.length === 0 && error.status !== 401) {
        this.syncQueue.unshift({
          type: 'save',
          data: progressTracker.state,
          timestamp: new Date().toISOString()
        });
      }
      
      progressTracker.emit('syncFailed', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Process individual sync item
   */
  async processSyncItem(item) {
    switch (item.type) {
      case 'exercise':
        await apiClient.completeExercise(
          item.data.moduleId,
          item.data.exerciseId,
          item.data.data
        );
        break;
        
      case 'quiz':
        await apiClient.submitQuiz(
          `${item.data.moduleId}-quiz`,
          item.data.answers
        );
        break;
        
      case 'save':
        // Full sync handled separately
        break;
    }
  }

  /**
   * Merge server progress with local progress
   */
  mergeProgress(serverProgress) {
    if (!serverProgress) return;
    
    // Merge modules
    Object.entries(serverProgress.modules || {}).forEach(([moduleId, serverModule]) => {
      const localModule = progressTracker.state.modules[moduleId];
      
      // Use higher progress value
      if (serverModule.progress > localModule.progress) {
        localModule.progress = serverModule.progress;
        localModule.completed = serverModule.completed;
        localModule.completedAt = serverModule.completedAt;
      }
      
      // Merge exercises
      Object.assign(localModule.exercises, serverModule.exercises || {});
      
      // Merge quizzes
      Object.assign(localModule.quizzes, serverModule.quizzes || {});
    });
    
    // Merge achievements (union)
    const localAchievementIds = new Set(
      progressTracker.state.achievements.map(a => a.id)
    );
    
    serverProgress.achievements?.forEach(achievement => {
      if (!localAchievementIds.has(achievement.id)) {
        progressTracker.state.achievements.push(achievement);
      }
    });
    
    // Merge statistics (max values)
    Object.entries(serverProgress.statistics || {}).forEach(([key, value]) => {
      if (typeof value === 'number') {
        progressTracker.state.statistics[key] = Math.max(
          progressTracker.state.statistics[key] || 0,
          value
        );
      }
    });
    
    // Save merged state locally
    progressTracker.save();
  }

  /**
   * Start periodic sync
   */
  startPeriodicSync() {
    setInterval(() => {
      if (!this.offlineMode) {
        this.syncProgress();
      }
    }, this.syncInterval);
  }

  /**
   * Handle online event
   */
  handleOnline() {
    this.offlineMode = false;
    console.log('Back online - syncing progress...');
    this.syncProgress();
    
    if (window.moduleLoader?.toast) {
      window.moduleLoader.toast.success('Back online! Progress synced.');
    }
  }

  /**
   * Handle offline event
   */
  handleOffline() {
    this.offlineMode = true;
    console.log('Offline mode - progress will sync when reconnected');
    
    if (window.moduleLoader?.toast) {
      window.moduleLoader.toast.warning('Offline - progress saved locally');
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      isOnline: !this.offlineMode,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      queueLength: this.syncQueue.length
    };
  }
}

// Create and export singleton
export const progressSyncAdapter = new ProgressSyncAdapter();

// Add to window for debugging
window.progressSync = progressSyncAdapter;