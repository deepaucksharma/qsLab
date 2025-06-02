/**
 * React hook for audio effects in TechFlix
 */

import { useEffect, useCallback, useRef } from 'react'
import audioManager from '@utils/audioManager'
import logger from '@utils/logger'

/**
 * Hook for playing sound effects
 */
export const useAudio = () => {
  // Ensure audio manager is initialized
  useEffect(() => {
    audioManager.init()
  }, [])

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

  const play = useCallback(async (soundName, options) => {
    await audioManager.play(soundName, options)
  }, [])

  const setEnabled = useCallback((enabled) => {
    audioManager.setEnabled(enabled)
  }, [])

  const toggle = useCallback(() => {
    return audioManager.toggle()
  }, [])

  const setVolume = useCallback((volume) => {
    audioManager.setVolume(volume)
  }, [])

  return {
    playTaDum,
    playEpisodeStart,
    playClick,
    playHover,
    playTransition,
    playSceneChange,
    playSuccess,
    playError,
    play,
    setEnabled,
    toggle,
    setVolume,
    enabled: audioManager.enabled,
    volume: audioManager.volume
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
  
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        playEpisodeStart()
      }, 100) // Small delay for dramatic effect
      
      return () => clearTimeout(timer)
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