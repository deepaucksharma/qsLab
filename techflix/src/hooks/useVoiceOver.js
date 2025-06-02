import { useState, useEffect, useCallback } from 'react';
import audioManager from '../utils/audioManager';
import logger from '@utils/logger';

export function useVoiceOver(episodeId, sceneId, options = {}) {
  const {
    autoPlay = true,
    volume = 0.8,
    onEnd = () => {},
    onError = () => {},
    enabled = true
  } = options;
  
  const [state, setState] = useState({
    isPlaying: false,
    isLoading: false,
    error: null,
    duration: 0,
    currentTime: 0,
    hasVoiceOver: false,
    isPaused: false
  });
  
  // Handle voice-over events from audioManager
  useEffect(() => {
    if (!enabled || !episodeId || !sceneId) return;

    const handleVoiceOverEvent = (event) => {
      // Only handle events for this specific episode/scene
      if (event.episodeId !== episodeId || event.sceneId !== sceneId) return;

      switch (event.type) {
        case 'started':
          setState(prev => ({
            ...prev,
            isPlaying: true,
            isLoading: false,
            duration: event.duration,
            error: null,
            isPaused: false,
            hasVoiceOver: true
          }));
          break;

        case 'progress':
          setState(prev => ({
            ...prev,
            currentTime: event.currentTime
          }));
          break;

        case 'paused':
          setState(prev => ({
            ...prev,
            isPlaying: false,
            isPaused: true
          }));
          break;

        case 'resumed':
          setState(prev => ({
            ...prev,
            isPlaying: true,
            isPaused: false
          }));
          break;

        case 'ended':
          setState(prev => ({
            ...prev,
            isPlaying: false,
            currentTime: prev.duration,
            isPaused: false
          }));
          onEnd();
          break;

        case 'stopped':
          setState(prev => ({
            ...prev,
            isPlaying: false,
            currentTime: 0,
            isPaused: false
          }));
          break;

        case 'error':
          const errorMsg = event.error?.message || 'Voice-over not available';
          setState(prev => ({
            ...prev,
            isPlaying: false,
            isLoading: false,
            error: errorMsg,
            isPaused: false,
            hasVoiceOver: false
          }));
          onError(event.error);
          break;
      }
    };

    // Add listener
    audioManager.addVoiceOverListener(handleVoiceOverEvent);

    // Set volume if different
    if (volume !== audioManager.voiceOverVolume) {
      audioManager.setVoiceOverVolume(volume);
    }

    // Enable voice-overs if not already enabled
    if (!audioManager.voiceOverEnabled) {
      audioManager.setVoiceOverEnabled(true);
    }

    // Auto-play if enabled
    if (autoPlay) {
      setState(prev => ({ ...prev, isLoading: true }));
      audioManager.playVoiceOver(episodeId, sceneId).then(voiceOver => {
        if (!voiceOver) {
          // No voice-over available
          setState(prev => ({
            ...prev,
            isLoading: false,
            hasVoiceOver: false
          }));
        }
      });
    }

    // Cleanup
    return () => {
      audioManager.removeVoiceOverListener(handleVoiceOverEvent);
      // Check if we need to stop the current voice-over
      const currentState = audioManager.getVoiceOverState();
      if (currentState.episodeId === episodeId && currentState.sceneId === sceneId) {
        audioManager.stopVoiceOver();
      }
    };
  }, [episodeId, sceneId, enabled, autoPlay]);
  
  // Update volume when it changes
  useEffect(() => {
    if (audioManager.voiceOverVolume !== volume) {
      audioManager.setVoiceOverVolume(volume);
    }
  }, [volume]);
  
  // Control methods using audioManager
  const play = useCallback(() => {
    const currentState = audioManager.getVoiceOverState();
    if (currentState.isPaused && 
        currentState.episodeId === episodeId && 
        currentState.sceneId === sceneId) {
      audioManager.resumeVoiceOver();
    } else {
      audioManager.playVoiceOver(episodeId, sceneId);
    }
  }, [episodeId, sceneId]);
  
  const pause = useCallback(() => {
    audioManager.pauseVoiceOver();
  }, []);
  
  const toggle = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);
  
  const seek = useCallback((time) => {
    // Seeking requires direct audio element access, which we'll handle through audioManager
    // For now, we'll stop and restart at the desired position
    logger.warn('Voice-over seeking not yet implemented in audioManager');
  }, []);
  
  const restart = useCallback(() => {
    audioManager.stopVoiceOver();
    audioManager.playVoiceOver(episodeId, sceneId);
  }, [episodeId, sceneId]);
  
  return {
    // State
    isPlaying: state.isPlaying,
    isLoading: state.isLoading,
    error: state.error,
    duration: state.duration,
    currentTime: state.currentTime,
    progress: state.duration > 0 ? state.currentTime / state.duration : 0,
    hasVoiceOver: state.hasVoiceOver,
    isPaused: state.isPaused,
    
    // Controls
    play,
    pause,
    toggle,
    seek,
    restart
  };
}

// Hook for managing voice-overs across an entire episode
export function useEpisodeVoiceOvers(episodeId, scenes = []) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [voiceOversEnabled, setVoiceOversEnabled] = useState(() => audioManager.voiceOverEnabled);
  const [globalVolume, setGlobalVolume] = useState(() => audioManager.voiceOverVolume);
  
  const currentScene = scenes[currentSceneIndex];
  const currentSceneId = currentScene?.id;
  
  const voiceOver = useVoiceOver(episodeId, currentSceneId, {
    enabled: voiceOversEnabled,
    volume: globalVolume,
    onEnd: () => {
      logger.info('Scene voice-over completed', { 
        episodeId, 
        sceneId: currentSceneId,
        sceneIndex: currentSceneIndex 
      });
    }
  });
  
  // Methods
  const nextScene = useCallback(() => {
    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneIndex(currentSceneIndex + 1);
    }
  }, [currentSceneIndex, scenes.length]);
  
  const previousScene = useCallback(() => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex(currentSceneIndex - 1);
    }
  }, [currentSceneIndex]);
  
  const goToScene = useCallback((index) => {
    if (index >= 0 && index < scenes.length) {
      setCurrentSceneIndex(index);
    }
  }, [scenes.length]);
  
  const toggleVoiceOvers = useCallback(() => {
    const newEnabled = audioManager.toggleVoiceOver();
    setVoiceOversEnabled(newEnabled);
  }, []);
  
  const updateGlobalVolume = useCallback((volume) => {
    audioManager.setVoiceOverVolume(volume);
    setGlobalVolume(volume);
  }, []);
  
  return {
    // Current voice-over
    ...voiceOver,
    
    // Episode-level state
    currentSceneIndex,
    totalScenes: scenes.length,
    voiceOversEnabled,
    globalVolume,
    
    // Episode-level controls
    nextScene,
    previousScene,
    goToScene,
    toggleVoiceOvers,
    setGlobalVolume: updateGlobalVolume
  };
}