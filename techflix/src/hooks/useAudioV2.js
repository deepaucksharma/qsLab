/**
 * React hook for audio effects in TechFlix - V2 Streamlined
 */

import { useEffect, useCallback, useRef, useState } from 'react'
import audioManager from '@utils/audioManagerV2'
import logger from '@utils/logger'

/**
 * Main hook for audio functionality
 */
export const useAudio = () => {
  // Ensure audio manager is initialized
  useEffect(() => {
    audioManager.init()
  }, [])

  // System sounds
  const playTaDum = useCallback(async () => {
    await audioManager.playTaDum()
  }, [])

  const playEpisodeStart = useCallback(async () => {
    await audioManager.playEpisodeStart()
  }, [])

  const playClick = useCallback(async () => {
    await audioManager.playClick()
  }, [])

  const playHover = useCallback(async () => {
    await audioManager.playHover()
  }, [])

  const playTransition = useCallback(async () => {
    await audioManager.playTransition()
  }, [])

  const playSceneChange = useCallback(async () => {
    await audioManager.playSceneChange()
  }, [])

  const playSuccess = useCallback(async () => {
    await audioManager.playSuccess()
  }, [])

  const playError = useCallback(async () => {
    await audioManager.playError()
  }, [])

  // Generic play function
  const play = useCallback(async (soundName, options) => {
    await audioManager.playSystemSound(soundName, options)
  }, [])

  // System sound controls
  const setEnabled = useCallback((enabled) => {
    audioManager.setSystemSoundsEnabled(enabled)
  }, [])

  const toggle = useCallback(() => {
    return audioManager.toggleSystemSounds()
  }, [])

  const setVolume = useCallback((volume) => {
    audioManager.setSystemVolume(volume)
  }, [])

  // Get current state
  const state = audioManager.getState()

  return {
    // Sound effects
    playTaDum,
    playEpisodeStart,
    playClick,
    playHover,
    playTransition,
    playSceneChange,
    playSuccess,
    playError,
    play,
    
    // Controls
    setEnabled,
    toggle,
    setVolume,
    
    // State
    enabled: state.systemSounds.enabled,
    volume: state.systemSounds.volume
  }
}

/**
 * Hook for click sound effects
 */
export const useClickSound = () => {
  const { playClick } = useAudio()
  
  return useCallback((handler) => {
    return async (...args) => {
      await playClick()
      if (handler) {
        return handler(...args)
      }
    }
  }, [playClick])
}

/**
 * Hook for hover sound effects
 */
export const useHoverSound = () => {
  const { playHover } = useAudio()
  
  const onMouseEnter = useCallback(async () => {
    await playHover()
  }, [playHover])
  
  return { onMouseEnter }
}

/**
 * Hook for episode loading sound
 */
export const useEpisodeLoadSound = (isLoading) => {
  const { playEpisodeStart } = useAudio()
  const hasPlayed = useRef(false)
  
  useEffect(() => {
    if (isLoading && !hasPlayed.current) {
      hasPlayed.current = true
      const timer = setTimeout(() => {
        playEpisodeStart()
      }, 100) // Small delay for dramatic effect
      
      return () => clearTimeout(timer)
    }
    
    if (!isLoading) {
      hasPlayed.current = false
    }
  }, [isLoading, playEpisodeStart])
}

/**
 * Hook for scene transition sound
 */
export const useSceneTransitionSound = (sceneId) => {
  const { playSceneChange } = useAudio()
  const previousSceneRef = useRef(sceneId)
  
  useEffect(() => {
    if (previousSceneRef.current && previousSceneRef.current !== sceneId) {
      playSceneChange()
    }
    previousSceneRef.current = sceneId
  }, [sceneId, playSceneChange])
}

/**
 * Hook for episode audio management
 */
export const useEpisodeAudio = (episodeId) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Load episode audio
  useEffect(() => {
    if (!episodeId) return
    
    setIsLoading(true)
    setError(null)
    
    audioManager.loadEpisodeAudio(episodeId)
      .then((success) => {
        setIsLoaded(success)
        if (!success) {
          setError('Failed to load episode audio')
        }
      })
      .catch((err) => {
        setError(err.message)
        setIsLoaded(false)
      })
      .finally(() => {
        setIsLoading(false)
      })
    
    return () => {
      audioManager.cleanupEpisodeAudio()
    }
  }, [episodeId])
  
  // Play voiceover
  const playVoiceover = useCallback(async (segmentId, options) => {
    if (!isLoaded) {
      logger.warn('Episode audio not loaded')
      return
    }
    
    await audioManager.playVoiceover(segmentId, options)
  }, [isLoaded])
  
  // Play effect
  const playEffect = useCallback(async (effectName, options) => {
    await audioManager.playEffect(effectName, options)
  }, [])
  
  // Play ambient
  const playAmbient = useCallback(async (ambientName, options) => {
    await audioManager.playAmbient(ambientName, options)
  }, [])
  
  // Stop all effects
  const stopAllEffects = useCallback(() => {
    audioManager.stopAllEffects()
  }, [])
  
  // Set subtitle callback
  const setSubtitleCallback = useCallback((callback) => {
    audioManager.setSubtitleCallback(callback)
  }, [])
  
  return {
    isLoaded,
    isLoading,
    error,
    playVoiceover,
    playEffect,
    playAmbient,
    stopAllEffects,
    setSubtitleCallback
  }
}

/**
 * Hook for voiceover controls
 */
export const useVoiceoverControls = () => {
  const [enabled, setEnabledState] = useState(audioManager.voiceoverEnabled)
  const [volume, setVolumeState] = useState(audioManager.voiceoverVolume)
  
  const setEnabled = useCallback((value) => {
    audioManager.setVoiceoverEnabled(value)
    setEnabledState(value)
  }, [])
  
  const setVolume = useCallback((value) => {
    audioManager.setVoiceoverVolume(value)
    setVolumeState(value)
  }, [])
  
  const toggle = useCallback(() => {
    const newState = audioManager.toggleVoiceover()
    setEnabledState(newState)
    return newState
  }, [])
  
  return {
    enabled,
    volume,
    setEnabled,
    setVolume,
    toggle
  }
}