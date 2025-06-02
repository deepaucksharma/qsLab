import { useState, useEffect, useCallback } from 'react';
import logger from '@utils/logger';

// Hook to track and persist episode progress
export const useEpisodeProgress = () => {
  const STORAGE_KEY = 'techflix_episode_progress';
  
  // Load progress from localStorage
  const loadProgress = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      logger.error('Failed to load episode progress', error);
      return {};
    }
  };

  const [progress, setProgress] = useState(loadProgress);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      logger.error('Failed to save episode progress', error);
    }
  }, [progress]);

  // Update progress for a specific episode
  const updateProgress = useCallback((episodeId, progressData) => {
    setProgress(prev => ({
      ...prev,
      [episodeId]: {
        ...prev[episodeId],
        ...progressData,
        lastUpdated: new Date().toISOString()
      }
    }));
    
    logger.info('Episode progress updated', { episodeId, progressData });
  }, []);

  // Get progress for a specific episode
  const getProgress = useCallback((episodeId) => {
    return progress[episodeId] || {
      watchedSeconds: 0,
      totalSeconds: 0,
      percentage: 0,
      completed: false,
      lastWatched: null
    };
  }, [progress]);

  // Mark episode as completed
  const markCompleted = useCallback((episodeId) => {
    updateProgress(episodeId, {
      completed: true,
      percentage: 100,
      completedAt: new Date().toISOString()
    });
  }, [updateProgress]);

  // Get continue watching list
  const getContinueWatching = useCallback(() => {
    return Object.entries(progress)
      .filter(([_, data]) => !data.completed && data.percentage > 0)
      .sort((a, b) => new Date(b[1].lastUpdated) - new Date(a[1].lastUpdated))
      .map(([episodeId, data]) => ({
        episodeId,
        ...data
      }));
  }, [progress]);

  // Get completed episodes
  const getCompletedEpisodes = useCallback(() => {
    return Object.entries(progress)
      .filter(([_, data]) => data.completed)
      .map(([episodeId]) => episodeId);
  }, [progress]);

  // Clear all progress
  const clearProgress = useCallback(() => {
    setProgress({});
    localStorage.removeItem(STORAGE_KEY);
    logger.info('All episode progress cleared');
  }, []);

  // Calculate total watch time
  const getTotalWatchTime = useCallback(() => {
    return Object.values(progress).reduce((total, ep) => {
      return total + (ep.watchedSeconds || 0);
    }, 0);
  }, [progress]);

  return {
    progress,
    updateProgress,
    getProgress,
    markCompleted,
    getContinueWatching,
    getCompletedEpisodes,
    clearProgress,
    getTotalWatchTime
  };
};