/**
 * Audio Manager V2 - Streamlined and Unified
 * Handles all audio functionality for TechFlix
 */

import logger from './logger'
import soundGenerator from './soundGenerator'

class AudioManager {
  constructor() {
    // System sounds
    this.systemSounds = {}
    this.systemSoundsEnabled = this.loadPreference('techflix-sound-enabled', true)
    this.systemVolume = 0.7
    
    // Episode audio
    this.episodeData = {
      metadata: null,
      voiceovers: new Map(),
      effects: new Map(),
      currentVoiceover: null,
      currentEffects: [],
      voiceoverListeners: null,
      voiceoverCallbacks: null
    }
    
    // Episode settings
    this.voiceoverEnabled = this.loadPreference('techflix-voiceover-enabled', true)
    this.voiceoverVolume = 0.8
    this.subtitleCallback = null
    
    // Initialization
    this.initialized = false
  }

  /**
   * Initialize audio manager and preload system sounds
   */
  async init() {
    if (this.initialized) return
    
    try {
      // System sound files - all in /audio/system/
      const systemSoundFiles = {
        'ta-dum': '/audio/system/netflix-tadum.mp3',
        'whoosh': '/audio/system/whoosh.mp3',
        'click': '/audio/system/click.mp3',
        'hover': '/audio/system/hover.mp3',
        'success': '/audio/system/success.mp3',
        'error': '/audio/system/error.mp3',
        'transition': '/audio/system/transition.mp3',
        'episode-start': '/audio/system/episode-start.mp3',
        'scene-change': '/audio/system/scene-change.mp3'
      }
      
      await Promise.all(
        Object.entries(systemSoundFiles).map(([name, path]) => 
          this.loadSystemSound(name, path)
        )
      )
      
      this.initialized = true
      logger.info('Audio manager initialized', { 
        systemSoundsLoaded: Object.keys(this.systemSounds).length 
      })
    } catch (error) {
      logger.error('Failed to initialize audio manager', { error })
    }
  }

  /**
   * Load a system sound
   */
  async loadSystemSound(name, path) {
    try {
      const audio = new Audio(path)
      audio.volume = this.systemVolume
      
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve, { once: true })
        audio.addEventListener('error', reject, { once: true })
        audio.load()
      })
      
      this.systemSounds[name] = audio
      logger.debug('System sound loaded', { name, path })
    } catch (error) {
      logger.warn('Failed to load system sound', { name, path, error })
      
      // Fallback to sound generator
      this.systemSounds[name] = { 
        play: () => {
          soundGenerator.generate(name)
          return Promise.resolve()
        },
        pause: () => {},
        currentTime: 0,
        volume: 1
      }
    }
  }

  /**
   * Play a system sound
   */
  async playSystemSound(soundName, options = {}) {
    if (!this.systemSoundsEnabled) return
    
    const sound = this.systemSounds[soundName]
    if (!sound) {
      logger.warn('System sound not found', { soundName })
      return
    }
    
    try {
      sound.currentTime = 0
      sound.volume = options.volume !== undefined 
        ? Math.min(1, Math.max(0, options.volume)) 
        : this.systemVolume
      
      await sound.play()
      logger.debug('System sound played', { soundName, options })
    } catch (error) {
      if (error.name !== 'NotAllowedError') {
        logger.error('Failed to play system sound', { soundName, error })
      }
    }
  }

  // System sound shortcuts
  async playTaDum() { 
    await this.playSystemSound('ta-dum', { volume: 0.8 }) 
  }
  
  async playEpisodeStart() { 
    await this.playTaDum()
    setTimeout(() => {
      this.playSystemSound('episode-start', { volume: 0.5 })
    }, 2000)
  }
  
  async playClick() { 
    await this.playSystemSound('click', { volume: 0.3 }) 
  }
  
  async playHover() { 
    await this.playSystemSound('hover', { volume: 0.2 }) 
  }
  
  async playTransition() { 
    await this.playSystemSound('transition', { volume: 0.4 }) 
  }
  
  async playSceneChange() { 
    await this.playSystemSound('scene-change', { volume: 0.5 }) 
  }
  
  async playSuccess() { 
    await this.playSystemSound('success', { volume: 0.5 }) 
  }
  
  async playError() { 
    await this.playSystemSound('error', { volume: 0.5 }) 
  }

  /**
   * System sound controls
   */
  setSystemSoundsEnabled(enabled) {
    this.systemSoundsEnabled = enabled
    this.savePreference('techflix-sound-enabled', enabled)
    logger.info('System sounds', { enabled })
  }

  setSystemVolume(volume) {
    this.systemVolume = Math.min(1, Math.max(0, volume))
    
    Object.values(this.systemSounds).forEach(sound => {
      if (sound.volume !== undefined) {
        sound.volume = this.systemVolume
      }
    })
    
    logger.debug('System volume set', { volume: this.systemVolume })
  }

  toggleSystemSounds() {
    this.setSystemSoundsEnabled(!this.systemSoundsEnabled)
    return this.systemSoundsEnabled
  }

  /**
   * Load audio assets for an episode
   */
  async loadEpisodeAudio(episodeId) {
    if (!episodeId) {
      logger.error('loadEpisodeAudio: episodeId is required')
      return false
    }
    
    try {
      logger.info('Loading episode audio', { episodeId })
      
      // Load voiceover metadata
      const voResponse = await fetch(`/audio/voiceovers/${episodeId}/metadata.json`)
      if (!voResponse.ok) {
        throw new Error(`Failed to fetch voiceover metadata: ${voResponse.statusText}`)
      }
      const voiceoverMeta = await voResponse.json()
      
      // Load sound effects library
      const fxResponse = await fetch(`/audio/effects/${episodeId}/sound-library.json`)
      if (!fxResponse.ok) {
        throw new Error(`Failed to fetch sound effects library: ${fxResponse.statusText}`)
      }
      const effectsLibrary = await fxResponse.json()
      
      this.episodeData.metadata = {
        voiceovers: voiceoverMeta,
        effects: effectsLibrary
      }
      
      // Preload assets
      if (voiceoverMeta.segments) {
        await this.preloadVoiceovers(episodeId, voiceoverMeta.segments)
      }
      
      if (effectsLibrary.effects) {
        await this.preloadEffects(episodeId, effectsLibrary.effects)
      }
      
      logger.info('Episode audio loaded successfully', {
        episodeId,
        voiceoversLoaded: this.episodeData.voiceovers.size,
        effectsLoaded: this.episodeData.effects.size
      })
      
      return true
    } catch (error) {
      logger.error('Failed to load episode audio', {
        episodeId,
        error: error.message
      })
      this.cleanupEpisodeAudio()
      return false
    }
  }

  /**
   * Preload voiceovers for an episode
   */
  async preloadVoiceovers(episodeId, segments) {
    const promises = segments.map(async (segment) => {
      if (!segment.id || !segment.file) {
        logger.warn('Invalid voiceover segment data', { segment })
        return
      }
      
      try {
        const audio = new Audio(`/audio/voiceovers/${episodeId}/${segment.file}`)
        audio.preload = 'auto'
        
        await new Promise((resolve, reject) => {
          audio.addEventListener('canplaythrough', resolve, { once: true })
          audio.addEventListener('error', (e) => {
            reject(new Error(`Audio load error for ${segment.file}: ${e.type}`))
          }, { once: true })
          audio.load()
        })
        
        this.episodeData.voiceovers.set(segment.id, {
          audio,
          ...segment
        })
      } catch (error) {
        logger.warn('Failed to preload voiceover', {
          episodeId,
          segmentId: segment.id,
          error: error.message
        })
      }
    })
    
    await Promise.all(promises)
  }

  /**
   * Preload effects for an episode
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

  /**
   * Load a single effect
   */
  async loadEffect(episodeId, name, effectData) {
    if (!effectData || !effectData.file) {
      logger.warn('Invalid effect data', { name, effectData })
      return
    }
    
    try {
      const audio = new Audio(`/audio/effects/${episodeId}/${effectData.file}`)
      audio.preload = 'auto'
      audio.volume = effectData.volume !== undefined ? effectData.volume : 0.5
      audio.loop = effectData.loop || false
      
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve, { once: true })
        audio.addEventListener('error', (e) => {
          reject(new Error(`Audio load error for ${effectData.file}: ${e.type}`))
        }, { once: true })
        audio.load()
      })
      
      this.episodeData.effects.set(name, {
        audio,
        ...effectData
      })
    } catch (error) {
      logger.warn('Failed to load effect', {
        episodeId,
        effectName: name,
        error: error.message
      })
    }
  }

  /**
   * Play a voiceover segment
   */
  async playVoiceover(segmentId, options = {}) {
    if (!this.voiceoverEnabled) {
      logger.info('Voiceovers are disabled')
      options.callbacks?.onError?.(new Error('Voiceovers disabled'))
      return
    }
    
    if (!this.episodeData.voiceovers.has(segmentId)) {
      logger.warn('Voiceover segment not found', { segmentId })
      options.callbacks?.onError?.(new Error('Segment not found'))
      return
    }
    
    // Stop current voiceover
    if (this.episodeData.currentVoiceover) {
      this.stopVoiceover()
    }
    
    const voiceover = this.episodeData.voiceovers.get(segmentId)
    const audio = voiceover.audio
    const { text } = voiceover
    const callbacks = options.callbacks || {}
    
    this.episodeData.voiceoverCallbacks = callbacks
    
    try {
      audio.currentTime = 0
      audio.volume = options.volume !== undefined 
        ? options.volume 
        : this.voiceoverVolume
      
      // Set up event listeners
      const eventListeners = {
        onPlay: () => {
          logger.debug('Voiceover playing', { segmentId })
          callbacks.onPlay?.()
        },
        onPause: () => {
          logger.debug('Voiceover paused', { segmentId })
          callbacks.onPause?.()
        },
        onEnded: () => {
          logger.debug('Voiceover ended', { segmentId })
          callbacks.onEnded?.()
          
          if (this.episodeData.currentVoiceover === audio) {
            if (this.subtitleCallback && text) {
              this.subtitleCallback('')
            }
            this.stopVoiceover()
          }
        },
        onTimeUpdate: () => {
          callbacks.onTimeUpdate?.({
            currentTime: audio.currentTime,
            duration: audio.duration
          })
        },
        onError: (e) => {
          logger.error('Voiceover error', { segmentId, error: e })
          callbacks.onError?.(e)
          
          if (this.episodeData.currentVoiceover === audio) {
            if (this.subtitleCallback && text) {
              this.subtitleCallback('')
            }
            this.stopVoiceover()
          }
        }
      }
      
      this.episodeData.voiceoverListeners = eventListeners
      
      // Add listeners
      Object.entries(eventListeners).forEach(([eventName, handler]) => {
        const nativeEventName = eventName.substring(2).toLowerCase()
        audio.addEventListener(nativeEventName, handler)
      })
      
      // Update subtitles
      if (this.subtitleCallback && text) {
        this.subtitleCallback(text)
      }
      
      // Play
      await audio.play()
      this.episodeData.currentVoiceover = audio
      
      logger.debug('Playing voiceover', { segmentId, volume: audio.volume })
    } catch (error) {
      logger.error('Failed to play voiceover', {
        segmentId,
        error: error.message
      })
      callbacks.onError?.(error)
      
      if (this.subtitleCallback && text) {
        this.subtitleCallback('')
      }
      
      this.stopVoiceover()
    }
  }

  /**
   * Stop current voiceover
   */
  stopVoiceover() {
    const audio = this.episodeData.currentVoiceover
    if (!audio) return
    
    audio.pause()
    audio.currentTime = 0
    
    // Remove listeners
    const listeners = this.episodeData.voiceoverListeners
    if (listeners) {
      Object.entries(listeners).forEach(([eventName, handler]) => {
        const nativeEventName = eventName.substring(2).toLowerCase()
        audio.removeEventListener(nativeEventName, handler)
      })
      this.episodeData.voiceoverListeners = null
    }
    
    this.episodeData.currentVoiceover = null
    this.episodeData.voiceoverCallbacks = null
    
    if (this.subtitleCallback) {
      this.subtitleCallback('')
    }
    
    logger.debug('Voiceover stopped')
  }

  /**
   * Play an effect
   */
  async playEffect(effectName, options = {}) {
    if (!this.systemSoundsEnabled) return null
    
    // Try episode effects first
    if (this.episodeData.effects.has(effectName)) {
      const effect = this.episodeData.effects.get(effectName)
      
      try {
        const audio = effect.audio.cloneNode(true)
        audio.volume = options.volume !== undefined 
          ? options.volume 
          : (effect.volume !== undefined ? effect.volume : this.systemVolume)
        audio.loop = options.loop !== undefined 
          ? options.loop 
          : (effect.loop || false)
        
        await audio.play()
        
        if (!audio.loop) {
          this.episodeData.currentEffects.push(audio)
          
          audio.addEventListener('ended', () => {
            const index = this.episodeData.currentEffects.indexOf(audio)
            if (index > -1) {
              this.episodeData.currentEffects.splice(index, 1)
            }
          }, { once: true })
        }
        
        logger.debug('Playing effect', {
          effectName,
          volume: audio.volume,
          loop: audio.loop
        })
        
        return audio
      } catch (error) {
        logger.error('Failed to play effect', {
          effectName,
          error: error.message
        })
      }
    }
    
    // Fallback to system sounds
    return this.playSystemSound(effectName, options)
  }

  /**
   * Play ambient sound
   */
  async playAmbient(ambientName, options = {}) {
    const ambientOptions = {
      loop: true,
      volume: options.volume !== undefined ? options.volume : 0.2,
      ...options
    }
    
    return this.playEffect(ambientName, ambientOptions)
  }

  /**
   * Stop all effects
   */
  stopAllEffects() {
    logger.debug('Stopping all effects', {
      count: this.episodeData.currentEffects.length
    })
    
    this.episodeData.currentEffects.forEach(audio => {
      audio.pause()
      audio.currentTime = 0
    })
    
    this.episodeData.currentEffects = []
  }

  /**
   * Clean up episode audio
   */
  cleanupEpisodeAudio() {
    logger.info('Cleaning up episode audio')
    
    // Stop voiceover
    if (this.episodeData.currentVoiceover) {
      this.stopVoiceover()
    }
    
    // Stop effects
    this.stopAllEffects()
    
    // Clear data
    this.episodeData.voiceovers.clear()
    this.episodeData.effects.clear()
    this.episodeData.metadata = null
    
    if (this.subtitleCallback) {
      this.subtitleCallback('')
    }
    
    logger.debug('Episode audio cleaned up')
  }

  /**
   * Voiceover controls
   */
  setVoiceoverEnabled(enabled) {
    this.voiceoverEnabled = enabled
    this.savePreference('techflix-voiceover-enabled', enabled)
    
    if (!enabled && this.episodeData.currentVoiceover) {
      this.stopVoiceover()
    }
    
    logger.info('Voiceovers', { enabled })
  }

  setVoiceoverVolume(volume) {
    this.voiceoverVolume = Math.min(1, Math.max(0, volume))
    
    if (this.episodeData.currentVoiceover) {
      this.episodeData.currentVoiceover.volume = this.voiceoverVolume
    }
    
    logger.debug('Voiceover volume set', { volume: this.voiceoverVolume })
  }

  toggleVoiceover() {
    this.setVoiceoverEnabled(!this.voiceoverEnabled)
    return this.voiceoverEnabled
  }

  /**
   * Set subtitle callback
   */
  setSubtitleCallback(callback) {
    this.subtitleCallback = callback
    logger.debug('Subtitle callback set')
  }

  /**
   * Get current state
   */
  getState() {
    return {
      initialized: this.initialized,
      systemSounds: {
        enabled: this.systemSoundsEnabled,
        volume: this.systemVolume,
        loaded: Object.keys(this.systemSounds).length
      },
      voiceovers: {
        enabled: this.voiceoverEnabled,
        volume: this.voiceoverVolume,
        loaded: this.episodeData.voiceovers.size,
        playing: this.episodeData.currentVoiceover !== null
      },
      effects: {
        loaded: this.episodeData.effects.size,
        playing: this.episodeData.currentEffects.length
      },
      episode: {
        loaded: this.episodeData.metadata !== null
      }
    }
  }

  /**
   * Utility methods
   */
  loadPreference(key, defaultValue) {
    try {
      const saved = localStorage.getItem(key)
      return saved === null ? defaultValue : saved === 'true'
    } catch (error) {
      logger.warn(`Failed to load preference: ${key}`, { error })
      return defaultValue
    }
  }

  savePreference(key, value) {
    try {
      localStorage.setItem(key, String(value))
    } catch (error) {
      logger.error('Failed to save preference', { key, value, error })
    }
  }
}

// Create singleton instance
const audioManager = new AudioManager()

// Initialize on user interaction
if (typeof window !== 'undefined') {
  const initOnInteraction = () => {
    audioManager.init().catch(error => {
      logger.error('Error during audio initialization', error)
    })
  }
  
  ['click', 'touchstart', 'keydown'].forEach(event => {
    document.addEventListener(event, initOnInteraction, { once: true })
  })
}

export default audioManager