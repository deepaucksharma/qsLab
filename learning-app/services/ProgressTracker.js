import { EventEmitter } from '../components/base/EventEmitter.js';

/**
 * Progress Tracker Service
 * Manages learning progress, achievements, and statistics
 */
export class ProgressTracker extends EventEmitter {
  constructor() {
    super();
    this.storage = window.localStorage;
    this.state = this.loadState();
    this.autoSaveInterval = null;
    this.startAutoSave();
  }

  /**
   * Load saved state from localStorage
   */
  loadState() {
    try {
      const saved = this.storage.getItem('learningProgress');
      return saved ? JSON.parse(saved) : this.getInitialState();
    } catch (error) {
      console.error('Failed to load progress:', error);
      return this.getInitialState();
    }
  }

  /**
   * Get initial state structure
   */
  getInitialState() {
    return {
      user: {
        id: this.generateUserId(),
        startDate: new Date().toISOString(),
        lastActive: new Date().toISOString()
      },
      modules: {
        foundation: this.createModuleState(),
        week1: this.createModuleState(),
        week2: this.createModuleState(),
        week3: this.createModuleState(),
        week4: this.createModuleState(),
        week5: this.createModuleState()
      },
      achievements: [],
      skills: {
        kafkaBasics: 0,
        monitoring: 0,
        integration: 0,
        troubleshooting: 0,
        architecture: 0
      },
      statistics: {
        totalTime: 0,
        sessionsCount: 1,
        exercisesCompleted: 0,
        quizzesPassed: 0,
        codeExecutions: 0,
        commandsRun: 0
      },
      preferences: {
        theme: 'light',
        fontSize: 'medium',
        autoSave: true
      }
    };
  }

  /**
   * Create initial module state
   */
  createModuleState() {
    return {
      progress: 0,
      completed: false,
      startedAt: null,
      completedAt: null,
      exercises: {},
      quizzes: {},
      timeSpent: 0,
      lastAccessed: null
    };
  }

  /**
   * Generate unique user ID
   */
  generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Update module progress
   */
  updateModuleProgress(moduleId, progress) {
    const module = this.state.modules[moduleId];
    if (!module) return;

    module.progress = Math.min(100, Math.max(0, progress));
    module.lastAccessed = new Date().toISOString();

    if (!module.startedAt && progress > 0) {
      module.startedAt = new Date().toISOString();
    }

    if (progress === 100 && !module.completed) {
      module.completed = true;
      module.completedAt = new Date().toISOString();
      this.checkModuleAchievements(moduleId);
    }

    this.save();
    this.emit('moduleProgress', { moduleId, progress });
  }

  /**
   * Complete an exercise
   */
  completeExercise(moduleId, exerciseId, data = {}) {
    const module = this.state.modules[moduleId];
    if (!module) return;

    if (!module.exercises[exerciseId]) {
      module.exercises[exerciseId] = {
        completed: true,
        completedAt: new Date().toISOString(),
        attempts: 1,
        score: data.score || 100,
        timeSpent: data.timeSpent || 0,
        ...data
      };

      this.state.statistics.exercisesCompleted++;
      this.updateSkills(this.getExerciseSkills(exerciseId));
      this.recalculateModuleProgress(moduleId);
      
      this.emit('exerciseCompleted', { moduleId, exerciseId, data });
    } else {
      // Update existing exercise data
      module.exercises[exerciseId].attempts++;
      if (data.score > module.exercises[exerciseId].score) {
        module.exercises[exerciseId].score = data.score;
      }
    }

    this.save();
  }

  /**
   * Complete a quiz
   */
  completeQuiz(moduleId, quizId, score, answers) {
    const module = this.state.modules[moduleId];
    if (!module) return;

    const isPassed = score >= 70; // 70% passing score

    module.quizzes[quizId] = {
      completed: isPassed,
      score,
      answers,
      attempts: (module.quizzes[quizId]?.attempts || 0) + 1,
      completedAt: isPassed ? new Date().toISOString() : null
    };

    if (isPassed) {
      this.state.statistics.quizzesPassed++;
      this.updateSkills(this.getQuizSkills(quizId));
      this.recalculateModuleProgress(moduleId);
    }

    this.emit('quizCompleted', { moduleId, quizId, score, passed: isPassed });
    this.save();
  }

  /**
   * Recalculate module progress based on completed items
   */
  recalculateModuleProgress(moduleId) {
    const moduleConfig = this.getModuleConfig(moduleId);
    if (!moduleConfig) return;

    const module = this.state.modules[moduleId];
    const totalItems = moduleConfig.exercises.length + moduleConfig.quizzes.length;
    const completedExercises = Object.keys(module.exercises).length;
    const passedQuizzes = Object.values(module.quizzes).filter(q => q.completed).length;
    const completedItems = completedExercises + passedQuizzes;

    const progress = Math.round((completedItems / totalItems) * 100);
    this.updateModuleProgress(moduleId, progress);
  }

  /**
   * Update skill levels
   */
  updateSkills(skills) {
    Object.entries(skills).forEach(([skill, points]) => {
      this.state.skills[skill] = Math.min(100, this.state.skills[skill] + points);
    });

    this.checkSkillAchievements();
    this.emit('skillsUpdated', this.state.skills);
  }

  /**
   * Track command execution
   */
  trackCommand(command, moduleId) {
    this.state.statistics.commandsRun++;
    this.emit('commandExecuted', { command, moduleId });
    this.save();
  }

  /**
   * Track code execution
   */
  trackCodeExecution(code, result, moduleId) {
    this.state.statistics.codeExecutions++;
    this.emit('codeExecuted', { code, result, moduleId });
    this.save();
  }

  /**
   * Update time spent
   */
  updateTimeSpent(moduleId, minutes) {
    if (this.state.modules[moduleId]) {
      this.state.modules[moduleId].timeSpent += minutes;
      this.state.statistics.totalTime += minutes;
      this.save();
    }
  }

  /**
   * Check and award achievements
   */
  checkModuleAchievements(moduleId) {
    const achievements = [];

    // Module completion achievement
    if (!this.hasAchievement(`complete_${moduleId}`)) {
      achievements.push({
        id: `complete_${moduleId}`,
        type: 'module_completion',
        title: this.getModuleTitle(moduleId) + ' Complete',
        description: `Completed the ${this.getModuleTitle(moduleId)} module`,
        icon: 'trophy',
        earnedAt: new Date().toISOString(),
        xp: 500
      });
    }

    // Check for all modules completion
    const allModulesCompleted = Object.values(this.state.modules)
      .every(module => module.completed);
    
    if (allModulesCompleted && !this.hasAchievement('all_modules_complete')) {
      achievements.push({
        id: 'all_modules_complete',
        type: 'special',
        title: 'Kafka Master',
        description: 'Completed all learning modules',
        icon: 'crown',
        earnedAt: new Date().toISOString(),
        xp: 2000
      });
    }

    // Add achievements
    achievements.forEach(achievement => {
      this.addAchievement(achievement);
    });
  }

  /**
   * Check skill-based achievements
   */
  checkSkillAchievements() {
    const achievements = [];

    // Check for skill mastery
    Object.entries(this.state.skills).forEach(([skill, level]) => {
      if (level >= 100 && !this.hasAchievement(`master_${skill}`)) {
        achievements.push({
          id: `master_${skill}`,
          type: 'skill_mastery',
          title: `${this.formatSkillName(skill)} Master`,
          description: `Achieved mastery in ${this.formatSkillName(skill)}`,
          icon: 'star',
          earnedAt: new Date().toISOString(),
          xp: 1000
        });
      }
    });

    // All skills high achievement
    const allSkillsHigh = Object.values(this.state.skills).every(level => level >= 80);
    if (allSkillsHigh && !this.hasAchievement('well_rounded')) {
      achievements.push({
        id: 'well_rounded',
        type: 'special',
        title: 'Well-Rounded Expert',
        description: 'Achieved 80% or higher in all skills',
        icon: 'gem',
        earnedAt: new Date().toISOString(),
        xp: 1500
      });
    }

    achievements.forEach(achievement => {
      this.addAchievement(achievement);
    });
  }

  /**
   * Add an achievement
   */
  addAchievement(achievement) {
    this.state.achievements.push(achievement);
    this.emit('achievementUnlocked', achievement);
    this.save();
  }

  /**
   * Check if user has achievement
   */
  hasAchievement(achievementId) {
    return this.state.achievements.some(a => a.id === achievementId);
  }

  /**
   * Get overall progress percentage
   */
  getOverallProgress() {
    const modules = Object.values(this.state.modules);
    const totalProgress = modules.reduce((sum, module) => sum + module.progress, 0);
    return Math.round(totalProgress / modules.length);
  }

  /**
   * Get module configuration
   */
  getModuleConfig(moduleId) {
    // This would typically come from a config file
    const configs = {
      foundation: {
        exercises: ['intro-kafka', 'mental-models', 'architecture-overview'],
        quizzes: ['foundation-quiz']
      },
      week1: {
        exercises: ['metric-xray', 'jmx-deep-dive', 'data-flow-trace'],
        quizzes: ['week1-quiz']
      },
      week2: {
        exercises: ['build-integration', 'flex-config', 'comparison'],
        quizzes: ['week2-quiz']
      },
      week3: {
        exercises: ['performance-baseline', 'bottleneck-hunt', 'optimization'],
        quizzes: ['week3-quiz']
      },
      week4: {
        exercises: ['troubleshoot-lag', 'debug-metrics', 'root-cause'],
        quizzes: ['week4-quiz']
      },
      week5: {
        exercises: ['design-system', 'architecture-review', 'capstone'],
        quizzes: ['week5-quiz']
      }
    };
    return configs[moduleId];
  }

  /**
   * Get exercise skills mapping
   */
  getExerciseSkills(exerciseId) {
    const skillMap = {
      'intro-kafka': { kafkaBasics: 5 },
      'mental-models': { kafkaBasics: 10 },
      'architecture-overview': { architecture: 10, kafkaBasics: 5 },
      'metric-xray': { monitoring: 10, kafkaBasics: 5 },
      'jmx-deep-dive': { monitoring: 15, troubleshooting: 5 },
      'data-flow-trace': { monitoring: 10, architecture: 5 },
      'build-integration': { integration: 20, architecture: 10 },
      'flex-config': { integration: 15, monitoring: 5 },
      'comparison': { integration: 10, architecture: 5 },
      'performance-baseline': { monitoring: 10, troubleshooting: 10 },
      'bottleneck-hunt': { troubleshooting: 20, monitoring: 5 },
      'optimization': { troubleshooting: 15, architecture: 10 },
      'troubleshoot-lag': { troubleshooting: 15, monitoring: 10 },
      'debug-metrics': { troubleshooting: 20, monitoring: 5 },
      'root-cause': { troubleshooting: 15, architecture: 5 },
      'design-system': { architecture: 25, integration: 10 },
      'architecture-review': { architecture: 20, monitoring: 5 },
      'capstone': { architecture: 20, integration: 15, monitoring: 10 }
    };
    return skillMap[exerciseId] || {};
  }

  /**
   * Get quiz skills mapping
   */
  getQuizSkills(quizId) {
    const skillMap = {
      'foundation-quiz': { kafkaBasics: 20 },
      'week1-quiz': { monitoring: 20, kafkaBasics: 10 },
      'week2-quiz': { integration: 20, architecture: 10 },
      'week3-quiz': { troubleshooting: 20, monitoring: 10 },
      'week4-quiz': { troubleshooting: 25, monitoring: 5 },
      'week5-quiz': { architecture: 25, integration: 15 }
    };
    return skillMap[quizId] || {};
  }

  /**
   * Format skill name for display
   */
  formatSkillName(skill) {
    const names = {
      kafkaBasics: 'Kafka Basics',
      monitoring: 'Monitoring',
      integration: 'Integration',
      troubleshooting: 'Troubleshooting',
      architecture: 'Architecture'
    };
    return names[skill] || skill;
  }

  /**
   * Get module title
   */
  getModuleTitle(moduleId) {
    const titles = {
      foundation: 'Foundation',
      week1: 'Week 1: X-Ray Vision',
      week2: 'Week 2: The Builder',
      week3: 'Week 3: The Optimizer',
      week4: 'Week 4: The Detective',
      week5: 'Week 5: The Architect'
    };
    return titles[moduleId] || moduleId;
  }

  /**
   * Save state to localStorage
   */
  save() {
    try {
      this.state.user.lastActive = new Date().toISOString();
      this.storage.setItem('learningProgress', JSON.stringify(this.state));
      this.emit('progressSaved');
    } catch (error) {
      console.error('Failed to save progress:', error);
      this.emit('saveFailed', error);
    }
  }

  /**
   * Start auto-save timer
   */
  startAutoSave() {
    if (this.state.preferences.autoSave) {
      this.autoSaveInterval = setInterval(() => {
        this.save();
      }, 30000); // Save every 30 seconds
    }
  }

  /**
   * Stop auto-save timer
   */
  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  /**
   * Reset progress (with confirmation)
   */
  resetProgress() {
    this.state = this.getInitialState();
    this.save();
    this.emit('progressReset');
  }

  /**
   * Export progress data
   */
  exportProgress() {
    return {
      ...this.state,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  /**
   * Import progress data
   */
  importProgress(data) {
    if (data && data.version === '1.0.0') {
      this.state = { ...data };
      delete this.state.exportedAt;
      delete this.state.version;
      this.save();
      this.emit('progressImported');
      return true;
    }
    return false;
  }
}

// Create singleton instance
export const progressTracker = new ProgressTracker();