/**
 * Audio Manager for TechFlix sound effects
 * Handles Netflix-style sound effects throughout the application
 */

import logger from './logger'
import soundGenerator from './soundGenerator'

class AudioManager {
  constructor() {
    this.sounds = {}
    this.voiceOvers = {}
    this.currentVoiceOver = null
    this.enabled = this.loadPreference()
    this.voiceOverEnabled = this.loadVoiceOverPreference()
    this.volume = 0.7
    this.voiceOverVolume = 0.8
    this.initialized = false
    this.voiceOverListeners = new Set()
  }

  /**
   * Initialize audio manager and preload sounds
   */
  async init() {
    if (this.initialized) return
    
    try {
      // Define sound effects
      const soundFiles = {
        'ta-dum': '/sounds/netflix-tadum.mp3',
        'whoosh': '/sounds/whoosh.mp3',
        'click': '/sounds/click.mp3',
        'hover': '/sounds/hover.mp3',
        'success': '/sounds/success.mp3',
        'error': '/sounds/error.mp3',
        'transition': '/sounds/transition.mp3',
        'episode-start': '/sounds/episode-start.mp3',
        'scene-change': '/sounds/scene-change.mp3'
      }

      // Preload all sounds
      await Promise.all(
        Object.entries(soundFiles).map(([name, path]) => 
          this.loadSound(name, path)
        )
      )

      this.initialized = true
      logger.info('Audio manager initialized', { 
        soundsLoaded: Object.keys(this.sounds).length 
      })
    } catch (error) {
      logger.error('Failed to initialize audio manager', { error })
    }
  }

  /**
   * Load a sound file
   */
  async loadSound(name, path) {
    try {
      const audio = new Audio(path)
      audio.volume = this.volume
      
      // Preload the audio
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve, { once: true })
        audio.addEventListener('error', reject, { once: true })
        audio.load()
      })

      this.sounds[name] = audio
      logger.debug('Sound loaded', { name, path })
    } catch (error) {
      logger.warn('Failed to load sound', { name, path, error })
      // Create a fallback that uses Web Audio API
      this.sounds[name] = { 
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
   * Play a sound effect
   */
  async play(soundName, options = {}) {
    if (!this.enabled) return

    const sound = this.sounds[soundName]
    if (!sound) {
      logger.warn('Sound not found', { soundName })
      return
    }

    try {
      // Reset the sound to start
      sound.currentTime = 0
      
      // Apply options
      if (options.volume !== undefined) {
        sound.volume = Math.min(1, Math.max(0, options.volume))
      } else {
        sound.volume = this.volume
      }

      // Play the sound
      await sound.play()
      
      logger.debug('Sound played', { soundName, options })
    } catch (error) {
      // Ignore errors from user not interacting with page yet
      if (error.name !== 'NotAllowedError') {
        logger.error('Failed to play sound', { soundName, error })
      }
    }
  }

  /**
   * Play the Netflix ta-dum sound
   */
  async playTaDum() {
    await this.play('ta-dum', { volume: 0.8 })
  }

  /**
   * Play episode start sound
   */
  async playEpisodeStart() {
    // Play ta-dum followed by episode start
    await this.playTaDum()
    setTimeout(() => {
      this.play('episode-start', { volume: 0.5 })
    }, 2000)
  }

  /**
   * Play UI interaction sounds
   */
  async playClick() {
    await this.play('click', { volume: 0.3 })
  }

  async playHover() {
    await this.play('hover', { volume: 0.2 })
  }

  async playTransition() {
    await this.play('transition', { volume: 0.4 })
  }

  async playSceneChange() {
    await this.play('scene-change', { volume: 0.5 })
  }

  async playSuccess() {
    await this.play('success', { volume: 0.5 })
  }

  async playError() {
    await this.play('error', { volume: 0.5 })
  }

  /**
   * Enable/disable sound effects
   */
  setEnabled(enabled) {
    this.enabled = enabled
    this.savePreference(enabled)
    logger.info('Sound effects', { enabled })
  }

  /**
   * Set master volume
   */
  setVolume(volume) {
    this.volume = Math.min(1, Math.max(0, volume))
    
    // Update volume for all loaded sounds
    Object.values(this.sounds).forEach(sound => {
      if (sound.volume !== undefined) {
        sound.volume = this.volume
      }
    })
    
    logger.debug('Volume set', { volume: this.volume })
  }

  /**
   * Toggle sound effects
   */
  toggle() {
    this.setEnabled(!this.enabled)
    return this.enabled
  }

  /**
   * Load preference from localStorage
   */
  loadPreference() {
    try {
      const saved = localStorage.getItem('techflix-sound-enabled')
      return saved === null ? true : saved === 'true'
    } catch {
      return true
    }
  }

  /**
   * Save preference to localStorage
   */
  savePreference(enabled) {
    try {
      localStorage.setItem('techflix-sound-enabled', String(enabled))
    } catch (error) {
      logger.error('Failed to save sound preference', { error })
    }
  }

  /**
   * Get current state
   */
  getState() {
    return {
      enabled: this.enabled,
      volume: this.volume,
      initialized: this.initialized,
      soundsLoaded: Object.keys(this.sounds).length,
      voiceOverEnabled: this.voiceOverEnabled,
      voiceOverVolume: this.voiceOverVolume,
      currentVoiceOver: this.currentVoiceOver
    }
  }

  // Voice-over methods

  /**
   * Load voice-over for a specific episode and scene
   */
  async loadVoiceOver(episodeId, sceneId) {
    const key = `${episodeId}/${sceneId}`
    
    // Check if already loaded
    if (this.voiceOvers[key]) {
      return this.voiceOvers[key]
    }

    try {
      const audioPath = `/audio/voiceovers/${episodeId}/${sceneId}.mp3`
      const metadataPath = `/audio/voiceovers/${episodeId}/${sceneId}.json`
      
      // Load metadata first
      const metadataResponse = await fetch(metadataPath)
      if (!metadataResponse.ok) {
        logger.debug('No voice-over metadata found', { episodeId, sceneId })
        return null
      }
      
      const metadata = await metadataResponse.json()
      
      // Create audio element
      const audio = new Audio(audioPath)
      audio.volume = this.voiceOverVolume
      
      // Preload the audio
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve, { once: true })
        audio.addEventListener('error', reject, { once: true })
        audio.load()
      })

      const voiceOverData = {
        audio,
        metadata,
        key,
        episodeId,
        sceneId
      }

      this.voiceOvers[key] = voiceOverData
      logger.info('Voice-over loaded', { episodeId, sceneId, duration: metadata.duration })
      
      return voiceOverData
    } catch (error) {
      logger.warn('Failed to load voice-over', { episodeId, sceneId, error })
      return null
    }
  }

  /**
   * Play voice-over for a specific episode and scene
   */
  async playVoiceOver(episodeId, sceneId) {
    if (!this.voiceOverEnabled) return null

    // Stop current voice-over if playing
    if (this.currentVoiceOver) {
      await this.stopVoiceOver()
    }

    const voiceOver = await this.loadVoiceOver(episodeId, sceneId)
    if (!voiceOver) return null

    try {
      const { audio, metadata } = voiceOver
      
      // Reset to start
      audio.currentTime = 0
      audio.volume = this.voiceOverVolume
      
      // Set up event listeners
      const updateProgress = () => {
        this.notifyVoiceOverListeners({
          type: 'progress',
          currentTime: audio.currentTime,
          duration: audio.duration || metadata.duration,
          episodeId,
          sceneId
        })
      }

      const handleEnded = () => {
        this.currentVoiceOver = null
        this.notifyVoiceOverListeners({
          type: 'ended',
          episodeId,
          sceneId
        })
        cleanup()
      }

      const handleError = (error) => {
        logger.error('Voice-over playback error', { episodeId, sceneId, error })
        this.currentVoiceOver = null
        this.notifyVoiceOverListeners({
          type: 'error',
          episodeId,
          sceneId,
          error
        })
        cleanup()
      }

      const cleanup = () => {
        audio.removeEventListener('timeupdate', updateProgress)
        audio.removeEventListener('ended', handleEnded)
        audio.removeEventListener('error', handleError)
      }

      audio.addEventListener('timeupdate', updateProgress)
      audio.addEventListener('ended', handleEnded)
      audio.addEventListener('error', handleError)

      // Play the audio
      await audio.play()
      
      this.currentVoiceOver = {
        ...voiceOver,
        cleanup
      }

      this.notifyVoiceOverListeners({
        type: 'started',
        episodeId,
        sceneId,
        duration: audio.duration || metadata.duration
      })

      logger.info('Voice-over started', { episodeId, sceneId })
      return voiceOver
      
    } catch (error) {
      if (error.name !== 'NotAllowedError') {
        logger.error('Failed to play voice-over', { episodeId, sceneId, error })
      }
      return null
    }
  }

  /**
   * Pause current voice-over
   */
  pauseVoiceOver() {
    if (this.currentVoiceOver?.audio) {
      this.currentVoiceOver.audio.pause()
      this.notifyVoiceOverListeners({
        type: 'paused',
        episodeId: this.currentVoiceOver.episodeId,
        sceneId: this.currentVoiceOver.sceneId
      })
      logger.debug('Voice-over paused')
    }
  }

  /**
   * Resume current voice-over
   */
  async resumeVoiceOver() {
    if (this.currentVoiceOver?.audio) {
      try {
        await this.currentVoiceOver.audio.play()
        this.notifyVoiceOverListeners({
          type: 'resumed',
          episodeId: this.currentVoiceOver.episodeId,
          sceneId: this.currentVoiceOver.sceneId
        })
        logger.debug('Voice-over resumed')
      } catch (error) {
        logger.error('Failed to resume voice-over', { error })
      }
    }
  }

  /**
   * Stop current voice-over
   */
  async stopVoiceOver() {
    if (this.currentVoiceOver) {
      const { audio, cleanup, episodeId, sceneId } = this.currentVoiceOver
      
      audio.pause()
      audio.currentTime = 0
      
      if (cleanup) {
        cleanup()
      }
      
      this.currentVoiceOver = null
      
      this.notifyVoiceOverListeners({
        type: 'stopped',
        episodeId,
        sceneId
      })
      
      logger.debug('Voice-over stopped', { episodeId, sceneId })
    }
  }

  /**
   * Set voice-over volume
   */
  setVoiceOverVolume(volume) {
    this.voiceOverVolume = Math.min(1, Math.max(0, volume))
    
    // Update current voice-over volume
    if (this.currentVoiceOver?.audio) {
      this.currentVoiceOver.audio.volume = this.voiceOverVolume
    }
    
    // Update all loaded voice-overs
    Object.values(this.voiceOvers).forEach(voiceOver => {
      if (voiceOver.audio) {
        voiceOver.audio.volume = this.voiceOverVolume
      }
    })
    
    logger.debug('Voice-over volume set', { volume: this.voiceOverVolume })
  }

  /**
   * Enable/disable voice-overs
   */
  setVoiceOverEnabled(enabled) {
    this.voiceOverEnabled = enabled
    this.saveVoiceOverPreference(enabled)
    
    // Stop current voice-over if disabling
    if (!enabled && this.currentVoiceOver) {
      this.stopVoiceOver()
    }
    
    logger.info('Voice-overs', { enabled })
  }

  /**
   * Toggle voice-overs
   */
  toggleVoiceOver() {
    this.setVoiceOverEnabled(!this.voiceOverEnabled)
    return this.voiceOverEnabled
  }

  /**
   * Add voice-over event listener
   */
  addVoiceOverListener(listener) {
    this.voiceOverListeners.add(listener)
  }

  /**
   * Remove voice-over event listener
   */
  removeVoiceOverListener(listener) {
    this.voiceOverListeners.delete(listener)
  }

  /**
   * Notify voice-over listeners
   */
  notifyVoiceOverListeners(event) {
    this.voiceOverListeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        logger.error('Voice-over listener error', { error })
      }
    })
  }

  /**
   * Get current voice-over state
   */
  getVoiceOverState() {
    if (!this.currentVoiceOver) {
      return {
        isPlaying: false,
        episodeId: null,
        sceneId: null,
        currentTime: 0,
        duration: 0,
        isPaused: false
      }
    }

    const { audio, episodeId, sceneId, metadata } = this.currentVoiceOver
    
    return {
      isPlaying: !audio.paused,
      episodeId,
      sceneId,
      currentTime: audio.currentTime,
      duration: audio.duration || metadata.duration,
      isPaused: audio.paused && audio.currentTime > 0
    }
  }

  /**
   * Load voice-over preference from localStorage
   */
  loadVoiceOverPreference() {
    try {
      const saved = localStorage.getItem('techflix-voiceover-enabled')
      return saved === null ? true : saved === 'true'
    } catch {
      return true
    }
  }

  /**
   * Save voice-over preference to localStorage
   */
  saveVoiceOverPreference(enabled) {
    try {
      localStorage.setItem('techflix-voiceover-enabled', String(enabled))
    } catch (error) {
      logger.error('Failed to save voice-over preference', { error })
    }
  }
}

// Create singleton instance
const audioManager = new AudioManager()

// Initialize on first import
if (typeof window !== 'undefined') {
  // Wait for user interaction before initializing
  const initOnInteraction = () => {
    audioManager.init()
    // Remove listeners after first interaction
    ['click', 'touchstart', 'keydown'].forEach(event => {
      document.removeEventListener(event, initOnInteraction)
    })
  }
  
  // Add listeners for user interaction
  ['click', 'touchstart', 'keydown'].forEach(event => {
    document.addEventListener(event, initOnInteraction, { once: true })
  })
}

export default audioManager