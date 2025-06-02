/**
 * Episode Audio Manager
 * Handles voice-overs, sound effects, and synchronization for episodes
 */

import logger from './logger'
import audioManager from './audioManager'

class EpisodeAudioManager {
  constructor() {
    this.voiceovers = new Map()
    this.effects = new Map()
    this.currentVoiceover = null
    this.currentEffects = []
    this.metadata = null
    this.subtitles = []
    this.onSubtitleUpdate = null
  }

  /**
   * Load audio assets for an episode
   */
  async loadEpisode(episodeId) {
    try {
      // Load voice-over metadata
      const voResponse = await fetch(`/sounds/voiceovers/${episodeId}/metadata.json`)
      const voiceoverMeta = await voResponse.json()
      
      // Load sound effects library
      const fxResponse = await fetch(`/sounds/effects/${episodeId}/sound-library.json`)
      const effectsLibrary = await fxResponse.json()
      
      this.metadata = {
        voiceovers: voiceoverMeta,
        effects: effectsLibrary
      }
      
      // Preload voice-overs
      await this.preloadVoiceovers(episodeId, voiceoverMeta.segments)
      
      // Preload sound effects
      await this.preloadEffects(episodeId, effectsLibrary.effects)
      
      logger.info('Episode audio loaded', { 
        episodeId,
        voiceovers: this.voiceovers.size,
        effects: this.effects.size
      })
      
      return true
    } catch (error) {
      logger.error('Failed to load episode audio', { episodeId, error })
      return false
    }
  }

  /**
   * Preload voice-over files
   */
  async preloadVoiceovers(episodeId, segments) {
    const promises = segments.map(async (segment) => {
      try {
        const audio = new Audio(`/sounds/voiceovers/${episodeId}/${segment.file}`)
        audio.preload = 'auto'
        
        await new Promise((resolve, reject) => {
          audio.addEventListener('canplaythrough', resolve, { once: true })
          audio.addEventListener('error', reject, { once: true })
          audio.load()
        })
        
        this.voiceovers.set(segment.id, {
          audio,
          ...segment
        })
      } catch (error) {
        logger.warn('Failed to load voiceover', { id: segment.id, error })
      }
    })
    
    await Promise.all(promises)
  }

  /**
   * Preload sound effect files
   */
  async preloadEffects(episodeId, effectsData) {
    const promises = []
    
    Object.entries(effectsData).forEach(([category, effects]) => {
      Object.entries(effects).forEach(([name, effect]) => {
        promises.push(this.loadEffect(episodeId, name, effect))
      })
    })
    
    await Promise.all(promises)
  }

  async loadEffect(episodeId, name, effectData) {
    try {
      const audio = new Audio(`/sounds/effects/${episodeId}/${effectData.file}`)
      audio.preload = 'auto'
      audio.volume = effectData.volume || 0.5
      audio.loop = effectData.loop || false
      
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve, { once: true })
        audio.addEventListener('error', reject, { once: true })
        audio.load()
      })
      
      this.effects.set(name, {
        audio,
        ...effectData
      })
    } catch (error) {
      logger.warn('Failed to load effect', { name, error })
    }
  }

  /**
   * Play voice-over segment
   */
  async playVoiceover(segmentId, options = {}) {
    // Stop current voiceover if playing
    if (this.currentVoiceover) {
      this.stopVoiceover()
    }
    
    const voiceover = this.voiceovers.get(segmentId)
    if (!voiceover) {
      logger.warn('Voiceover not found', { segmentId })
      return
    }
    
    try {
      const { audio, text } = voiceover
      
      // Reset and play
      audio.currentTime = 0
      audio.volume = options.volume || 0.8
      
      // Update subtitles
      if (this.onSubtitleUpdate) {
        this.onSubtitleUpdate(text)
      }
      
      await audio.play()
      this.currentVoiceover = audio
      
      // Clear subtitles when done
      audio.addEventListener('ended', () => {
        if (this.onSubtitleUpdate) {
          this.onSubtitleUpdate('')
        }
        this.currentVoiceover = null
      }, { once: true })
      
      logger.debug('Playing voiceover', { segmentId })
    } catch (error) {
      logger.error('Failed to play voiceover', { segmentId, error })
    }
  }

  /**
   * Stop current voiceover
   */
  stopVoiceover() {
    if (this.currentVoiceover) {
      this.currentVoiceover.pause()
      this.currentVoiceover = null
      
      if (this.onSubtitleUpdate) {
        this.onSubtitleUpdate('')
      }
    }
  }

  /**
   * Play sound effect
   */
  async playEffect(effectName, options = {}) {
    const effect = this.effects.get(effectName)
    if (!effect) {
      // Fallback to general audio manager
      return audioManager.play(effectName, options)
    }
    
    try {
      const { audio } = effect
      
      // Clone for concurrent playback
      const audioClone = audio.cloneNode()
      audioClone.volume = options.volume || effect.volume || 0.5
      
      if (options.loop !== undefined) {
        audioClone.loop = options.loop
      }
      
      await audioClone.play()
      
      // Track for cleanup
      this.currentEffects.push(audioClone)
      
      audioClone.addEventListener('ended', () => {
        const index = this.currentEffects.indexOf(audioClone)
        if (index > -1) {
          this.currentEffects.splice(index, 1)
        }
      })
      
      logger.debug('Playing effect', { effectName })
      
      return audioClone
    } catch (error) {
      logger.error('Failed to play effect', { effectName, error })
    }
  }

  /**
   * Play ambient sound
   */
  async playAmbient(ambientName, options = {}) {
    const audio = await this.playEffect(ambientName, { 
      ...options, 
      loop: true,
      volume: options.volume || 0.2
    })
    
    return audio
  }

  /**
   * Stop all effects
   */
  stopAllEffects() {
    this.currentEffects.forEach(audio => {
      audio.pause()
    })
    this.currentEffects = []
  }

  /**
   * Play scene audio (voiceover + effects)
   */
  async playSceneAudio(sceneId, time) {
    if (!this.metadata) return
    
    const sceneData = this.metadata.effects.scenes[sceneId]
    if (!sceneData) return
    
    // Find voiceover for current time
    const voiceoverSegments = this.metadata.voiceovers.segments.filter(
      seg => sceneData.voiceovers.includes(seg.id)
    )
    
    // Play appropriate voiceover based on time
    // This is a simplified version - you'd want more sophisticated timing
    for (const segment of voiceoverSegments) {
      if (time >= segment.startTime && time < segment.startTime + segment.duration) {
        if (this.currentVoiceover?.src !== segment.file) {
          await this.playVoiceover(segment.id)
        }
        break
      }
    }
  }

  /**
   * Set subtitle callback
   */
  setSubtitleCallback(callback) {
    this.onSubtitleUpdate = callback
  }

  /**
   * Get current state
   */
  getState() {
    return {
      loaded: this.metadata !== null,
      voiceovers: this.voiceovers.size,
      effects: this.effects.size,
      playing: {
        voiceover: this.currentVoiceover !== null,
        effects: this.currentEffects.length
      }
    }
  }

  /**
   * Cleanup
   */
  cleanup() {
    this.stopVoiceover()
    this.stopAllEffects()
    this.voiceovers.clear()
    this.effects.clear()
    this.metadata = null
  }
}

// Create singleton instance
const episodeAudioManager = new EpisodeAudioManager()

export default episodeAudioManager