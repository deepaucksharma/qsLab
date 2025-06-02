/**
 * Audio Manager for TechFlix sound effects
 * Handles Netflix-style sound effects throughout the application
 */

import logger from './logger'
import soundGenerator from './soundGenerator'

class AudioManager {
  constructor() {
    this.sounds = {}
    this.voiceOvers = {} // DEPRECATED: Part of the old voiceover system.
    this.currentVoiceOver = null // DEPRECATED: Part of the old voiceover system.
    this.enabled = this.loadPreference('techflix-sound-enabled', true) // Global sound effects enabled
    this.voiceOverEnabled = this.loadPreference('techflix-voiceover-enabled', true) // DEPRECATED: Old system VO enabled.
    this.episodeVoiceOverEnabled = this.loadPreference('techflix-episode-vo-enabled', true); // New system for episode VOs.
    this.volume = 0.7
    this.voiceOverVolume = 0.8 // Used by new episode VO system as default, and by old system.
    this.initialized = false
    this.voiceOverListeners = new Set() // DEPRECATED: Part of the old voiceover system.

    // Properties for Episode Audio Management
    this.episodeAudioData = {
      metadata: null,
      voiceovers: new Map(),
      effects: new Map(),
      currentEpisodeVoiceover: null,
      currentEpisodeEffects: [],
      currentEpisodeVoiceoverListeners: null, // To store listeners for the active VO
      currentEpisodeVoiceoverCallbacks: null  // To store callbacks for the active VO
    };
    this.onEpisodeSubtitleUpdate = null;
  }

  /**
   * Initialize audio manager and preload sounds
   */
  async init() {
    if (this.initialized) return
    
    try {
      const soundFiles = {
        'ta-dum': '/audio/netflix-tadum.mp3',
        'whoosh': '/audio/whoosh.mp3',
        'click': '/audio/click.mp3',
        'hover': '/audio/hover.mp3',
        'success': '/audio/success.mp3',
        'error': '/audio/error.mp3',
        'transition': '/audio/transition.mp3',
        'episode-start': '/audio/episode-start.mp3',
        'scene-change': '/audio/scene-change.mp3'
      }
      await Promise.all(
        Object.entries(soundFiles).map(([name, path]) => 
          this.loadSound(name, path)
        )
      )
      this.initialized = true
      logger.info('Audio manager initialized', { soundsLoaded: Object.keys(this.sounds).length })
    } catch (error) {
      logger.error('Failed to initialize audio manager', { error })
    }
  }

  async loadSound(name, path) {
    try {
      const audio = new Audio(path)
      audio.volume = this.volume
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve, { once: true })
        audio.addEventListener('error', reject, { once: true })
        audio.load()
      })
      this.sounds[name] = audio
      logger.debug('Sound loaded', { name, path })
    } catch (error) {
      logger.warn('Failed to load sound', { name, path, error })
      this.sounds[name] = { 
        play: () => { soundGenerator.generate(name); return Promise.resolve(); },
        pause: () => {}, currentTime: 0, volume: 1
      }
    }
  }

  async play(soundName, options = {}) {
    if (!this.enabled) return
    const sound = this.sounds[soundName]
    if (!sound) {
      logger.warn('Sound not found', { soundName })
      return
    }
    try {
      sound.currentTime = 0
      sound.volume = options.volume !== undefined ? Math.min(1, Math.max(0, options.volume)) : this.volume
      await sound.play()
      logger.debug('Sound played', { soundName, options })
    } catch (error) {
      if (error.name !== 'NotAllowedError') {
        logger.error('Failed to play sound', { soundName, error })
      }
    }
  }

  async playTaDum() { await this.play('ta-dum', { volume: 0.8 }) }
  async playEpisodeStart() { await this.playTaDum(); setTimeout(() => { this.play('episode-start', { volume: 0.5 }) }, 2000); }
  async playClick() { await this.play('click', { volume: 0.3 }) }
  async playHover() { await this.play('hover', { volume: 0.2 }) }
  async playTransition() { await this.play('transition', { volume: 0.4 }) }
  async playSceneChange() { await this.play('scene-change', { volume: 0.5 }) }
  async playSuccess() { await this.play('success', { volume: 0.5 }) }
  async playError() { await this.play('error', { volume: 0.5 }) }

  setEnabled(enabled) {
    this.enabled = enabled
    this.savePreference('techflix-sound-enabled', enabled) // Use generic savePreference
    logger.info('Sound effects', { enabled })
  }

  setVolume(volume) {
    this.volume = Math.min(1, Math.max(0, volume))
    Object.values(this.sounds).forEach(sound => {
      if (sound.volume !== undefined) sound.volume = this.volume
    })
    logger.debug('Volume set', { volume: this.volume })
  }

  toggle() { this.setEnabled(!this.enabled); return this.enabled; }

  loadPreference(key, defaultValue) {
    try {
      const saved = localStorage.getItem(key);
      return saved === null ? defaultValue : saved === 'true';
    } catch (error) {
      logger.warn(`Failed to load preference for key "${key}", defaulting to ${defaultValue}`, { error });
      return defaultValue;
    }
  }

  savePreference(key, value) {
    try {
      localStorage.setItem(key, String(value));
    } catch (error) {
      logger.error('Failed to save preference', { key, value, error });
    }
  }

  getState() {
    return {
      enabled: this.enabled, volume: this.volume, initialized: this.initialized,
      soundsLoaded: Object.keys(this.sounds).length,
      voiceOverEnabled: this.voiceOverEnabled, // Old system state
      episodeVoiceOverEnabled: this.episodeVoiceOverEnabled, // New system state
      voiceOverVolume: this.voiceOverVolume,
      currentVoiceOver: this.currentVoiceOver // Old system state
    }
  }

  // --- Voice-over methods (Old System - To be Deprecated) ---
  /** @deprecated Use episode audio methods (loadEpisodeAudio, playEpisodeVoiceoverSegment) instead. */
  async loadVoiceOver(episodeId, sceneId) { /* ... (implementation as before) ... */
    const key = `${episodeId}/${sceneId}`;
    if (this.voiceOvers[key]) return this.voiceOvers[key];
    try {
      const audioPath = `/audio/voiceovers/${episodeId}/${sceneId}.mp3`;
      const metadataPath = `/audio/voiceovers/${episodeId}/${sceneId}.json`;
      const metadataResponse = await fetch(metadataPath);
      if (!metadataResponse.ok) { logger.debug('No voice-over metadata found', { episodeId, sceneId }); return null; }
      const metadata = await metadataResponse.json();
      const audio = new Audio(audioPath);
      audio.volume = this.voiceOverVolume;
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve, { once: true });
        audio.addEventListener('error', reject, { once: true });
        audio.load();
      });
      const voiceOverData = { audio, metadata, key, episodeId, sceneId };
      this.voiceOvers[key] = voiceOverData;
      logger.info('Voice-over loaded (old system)', { episodeId, sceneId, duration: metadata.duration });
      return voiceOverData;
    } catch (error) { logger.warn('Failed to load voice-over (old system)', { episodeId, sceneId, error }); return null; }
  }
  /** @deprecated Use episode audio methods (loadEpisodeAudio, playEpisodeVoiceoverSegment) instead. */
  async playVoiceOver(episodeId, sceneId) { /* ... (implementation as before, ensuring it uses this.currentVoiceOver) ... */
    if (!this.voiceOverEnabled) return null;
    if (this.currentVoiceOver) await this.stopVoiceOver();
    const voiceOver = await this.loadVoiceOver(episodeId, sceneId);
    if (!voiceOver) return null;
    try {
      const { audio, metadata } = voiceOver;
      audio.currentTime = 0; audio.volume = this.voiceOverVolume;
      const updateProgress = () => this.notifyVoiceOverListeners({ type: 'progress', currentTime: audio.currentTime, duration: audio.duration || metadata.duration, episodeId, sceneId });
      const handleEnded = () => { this.currentVoiceOver = null; this.notifyVoiceOverListeners({ type: 'ended', episodeId, sceneId }); cleanup(); };
      const handleError = (error) => { logger.error('Voice-over playback error (old system)', { episodeId, sceneId, error }); this.currentVoiceOver = null; this.notifyVoiceOverListeners({ type: 'error', episodeId, sceneId, error }); cleanup(); };
      const cleanup = () => { audio.removeEventListener('timeupdate', updateProgress); audio.removeEventListener('ended', handleEnded); audio.removeEventListener('error', handleError); };
      audio.addEventListener('timeupdate', updateProgress); audio.addEventListener('ended', handleEnded); audio.addEventListener('error', handleError);
      await audio.play();
      this.currentVoiceOver = { ...voiceOver, cleanup };
      this.notifyVoiceOverListeners({ type: 'started', episodeId, sceneId, duration: audio.duration || metadata.duration });
      logger.info('Voice-over started (old system)', { episodeId, sceneId });
      return voiceOver;
    } catch (error) { if (error.name !== 'NotAllowedError') logger.error('Failed to play voice-over (old system)', { episodeId, sceneId, error }); return null; }
  }
  /** @deprecated Use episode audio methods instead. */
  pauseVoiceOver() { if (this.currentVoiceOver?.audio) { this.currentVoiceOver.audio.pause(); this.notifyVoiceOverListeners({ type: 'paused', episodeId: this.currentVoiceOver.episodeId, sceneId: this.currentVoiceOver.sceneId }); logger.debug('Voice-over paused (old system)'); } }
  /** @deprecated Use episode audio methods instead. */
  async resumeVoiceOver() { if (this.currentVoiceOver?.audio) { try { await this.currentVoiceOver.audio.play(); this.notifyVoiceOverListeners({ type: 'resumed', episodeId: this.currentVoiceOver.episodeId, sceneId: this.currentVoiceOver.sceneId }); logger.debug('Voice-over resumed (old system)'); } catch (error) { logger.error('Failed to resume voice-over (old system)', { error }); } } }
  /** @deprecated Use stopEpisodeVoiceoverSegment() or cleanupEpisodeAudio() instead. */
  async stopVoiceOver() { if (this.currentVoiceOver) { const { audio, cleanup, episodeId, sceneId } = this.currentVoiceOver; audio.pause(); audio.currentTime = 0; if (cleanup) cleanup(); this.currentVoiceOver = null; this.notifyVoiceOverListeners({ type: 'stopped', episodeId, sceneId }); logger.debug('Voice-over stopped (old system)', { episodeId, sceneId }); } }

  setVoiceOverVolume(volume) {
    this.voiceOverVolume = Math.min(1, Math.max(0, volume));
    if (this.currentVoiceOver?.audio) this.currentVoiceOver.audio.volume = this.voiceOverVolume; // Old system
    Object.values(this.voiceOvers).forEach(vo => { if (vo.audio) vo.audio.volume = this.voiceOverVolume; }); // Old system
    if (this.episodeAudioData.currentEpisodeVoiceover) this.episodeAudioData.currentEpisodeVoiceover.volume = this.voiceOverVolume; // New system
    logger.debug('Global Voice-over volume set', { volume: this.voiceOverVolume });
  }

  setVoiceOverEnabled(enabled) { // This now primarily controls the new system
    this.episodeVoiceOverEnabled = enabled;
    this.savePreference('techflix-episode-vo-enabled', enabled);
    if (!enabled && this.episodeAudioData.currentEpisodeVoiceover) {
      this.stopEpisodeVoiceoverSegment();
    }
    logger.info('Episode Voice-overs (New System) toggled', { enabled });
    // Backward compatibility for old system
    this.voiceOverEnabled = enabled;
    this.savePreference('techflix-voiceover-enabled', enabled);
    if (!enabled && this.currentVoiceOver) { // Stop old system VO if disabling
        this.stopVoiceOver();
    }
  }

  toggleVoiceOver() { // Toggles the new system
    this.setVoiceOverEnabled(!this.episodeVoiceOverEnabled);
    return this.episodeVoiceOverEnabled;
  }

  /** @deprecated */ addVoiceOverListener(listener) { this.voiceOverListeners.add(listener); }
  /** @deprecated */ removeVoiceOverListener(listener) { this.voiceOverListeners.delete(listener); }
  /** @deprecated */ notifyVoiceOverListeners(event) { this.voiceOverListeners.forEach(listener => { try { listener(event); } catch (error) { logger.error('Voice-over listener error (old system)', { error }); } }); }
  /** @deprecated Use getEpisodeAudioState() instead. */ getVoiceOverState() { /* ... (implementation as before for old system) ... */
    if (!this.currentVoiceOver) return { isPlaying: false, episodeId: null, sceneId: null, currentTime: 0, duration: 0, isPaused: false };
    const { audio, episodeId, sceneId, metadata } = this.currentVoiceOver;
    return { isPlaying: !audio.paused, episodeId, sceneId, currentTime: audio.currentTime, duration: audio.duration || metadata.duration, isPaused: audio.paused && audio.currentTime > 0 };
  }
  /** @deprecated */ loadVoiceOverPreference() { return this.loadPreference('techflix-voiceover-enabled', true); }
  /** @deprecated */ saveVoiceOverPreference(enabled) { this.savePreference('techflix-voiceover-enabled', enabled); }

  // --- Start of Methods integrated from EpisodeAudioManager ---
  async loadEpisodeAudio(episodeId) {
    if (!episodeId) { logger.error('loadEpisodeAudio: episodeId is required'); return false; }
    try {
      logger.info('Loading episode audio', { episodeId });
      const voResponse = await fetch(`/audio/voiceovers/${episodeId}/metadata.json`);
      if (!voResponse.ok) throw new Error(`Failed to fetch voiceover metadata: ${voResponse.statusText}`);
      const voiceoverMeta = await voResponse.json();
      const fxResponse = await fetch(`/audio/effects/${episodeId}/sound-library.json`);
      if (!fxResponse.ok) throw new Error(`Failed to fetch sound effects library: ${fxResponse.statusText}`);
      const effectsLibrary = await fxResponse.json();
      this.episodeAudioData.metadata = { voiceovers: voiceoverMeta, effects: effectsLibrary };
      if (voiceoverMeta.segments) await this.preloadEpisodeVoiceovers(episodeId, voiceoverMeta.segments);
      if (effectsLibrary.effects) await this.preloadEpisodeEffects(episodeId, effectsLibrary.effects);
      logger.info('Episode audio loaded successfully', { episodeId, voiceoversLoaded: this.episodeAudioData.voiceovers.size, effectsLoaded: this.episodeAudioData.effects.size });
      return true;
    } catch (error) {
      logger.error('Failed to load episode audio', { episodeId, error: error.message, stack: error.stack });
      this.cleanupEpisodeAudio(); return false;
    }
  }

  async preloadEpisodeVoiceovers(episodeId, segments) {
    const promises = segments.map(async (segment) => {
      if (!segment.id || !segment.file) { logger.warn('Invalid segment data for preloadEpisodeVoiceovers', { segment }); return; }
      try {
        const audio = new Audio(`/audio/voiceovers/${episodeId}/${segment.file}`);
        audio.preload = 'auto';
        await new Promise((resolve, reject) => {
          audio.addEventListener('canplaythrough', resolve, { once: true });
          audio.addEventListener('error', (e) => reject(new Error(`Audio load error for ${segment.file}: ${e.type}`)), { once: true });
          audio.load();
        });
        this.episodeAudioData.voiceovers.set(segment.id, { audio, ...segment });
      } catch (error) { logger.warn('Failed to preload episode voiceover', { episodeId, segmentId: segment.id, error: error.message }); }
    });
    await Promise.all(promises);
  }

  async preloadEpisodeEffects(episodeId, effectsData) {
    const promises = [];
    Object.entries(effectsData).forEach(([category, effects]) => {
      Object.entries(effects).forEach(([name, effect]) => {
        promises.push(this.loadEpisodeEffect(episodeId, name, effect));
      });
    });
    await Promise.all(promises);
  }

  async loadEpisodeEffect(episodeId, name, effectData) {
    if (!effectData || !effectData.file) { logger.warn('Invalid effect data for loadEpisodeEffect', { name, effectData }); return; }
    try {
      const audio = new Audio(`/audio/effects/${episodeId}/${effectData.file}`);
      audio.preload = 'auto';
      audio.volume = effectData.volume !== undefined ? effectData.volume : 0.5;
      audio.loop = effectData.loop || false;
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve, { once: true });
        audio.addEventListener('error', (e) => reject(new Error(`Audio load error for ${effectData.file}: ${e.type}`)), { once: true });
        audio.load();
      });
      this.episodeAudioData.effects.set(name, { audio, ...effectData });
    } catch (error) { logger.warn('Failed to load episode effect', { episodeId, effectName: name, error: error.message }); }
  }

  setEpisodeSubtitleCallback(callback) { this.onEpisodeSubtitleUpdate = callback; logger.debug('Episode subtitle callback set'); }

  cleanupEpisodeAudio() {
    logger.info('Cleaning up episode audio data');
    if (this.episodeAudioData.currentEpisodeVoiceover) {
      this.stopEpisodeVoiceoverSegment(); // This will handle pause, cleanup listeners, etc.
    }
    this.episodeAudioData.currentEpisodeEffects.forEach(audio => { audio.pause(); audio.currentTime = 0; });
    this.episodeAudioData.currentEpisodeEffects = [];
    this.episodeAudioData.voiceovers.clear();
    this.episodeAudioData.effects.clear();
    this.episodeAudioData.metadata = null;
    if (this.onEpisodeSubtitleUpdate) this.onEpisodeSubtitleUpdate('');
    logger.debug('Episode audio data cleaned up');
  }

  getEpisodeAudioState() {
    return {
      loaded: this.episodeAudioData.metadata !== null,
      voiceoversCount: this.episodeAudioData.voiceovers.size,
      effectsCount: this.episodeAudioData.effects.size,
      isEpisodeVoiceoverPlaying: this.episodeAudioData.currentEpisodeVoiceover !== null,
      playingEpisodeEffectsCount: this.episodeAudioData.currentEpisodeEffects.length
    };
  }

  async playEpisodeVoiceoverSegment(segmentId, options = {}) {
    if (!this.episodeVoiceOverEnabled) {
      logger.info('playEpisodeVoiceoverSegment: Episode voiceovers are disabled.');
      options.callbacks?.onError?.(new Error('Episode voiceovers disabled')); return;
    }
    if (!this.episodeAudioData.voiceovers || !this.episodeAudioData.voiceovers.has(segmentId)) {
      logger.warn('playEpisodeVoiceoverSegment: Episode voiceovers not loaded or segment not found.', { segmentId });
      options.callbacks?.onError?.(new Error('Segment not found or voiceovers not loaded')); return;
    }
    if (this.episodeAudioData.currentEpisodeVoiceover) this.stopEpisodeVoiceoverSegment();
    
    const voiceover = this.episodeAudioData.voiceovers.get(segmentId);
    if (!voiceover || !voiceover.audio) {
      logger.error('Episode voiceover segment or audio object not found', { segmentId });
      options.callbacks?.onError?.(new Error('Segment audio object not found')); return;
    }
    
    const audio = voiceover.audio;
    const { text } = voiceover;
    const callbacks = options.callbacks || {};
    this.episodeAudioData.currentEpisodeVoiceoverCallbacks = callbacks;

    try {
      audio.currentTime = 0;
      audio.volume = options.volume !== undefined ? options.volume : (this.voiceOverVolume || 0.8);

      const eventListeners = {
        onPlay: () => { logger.debug('Episode VO onPlay', { segmentId }); callbacks.onPlay?.(); },
        onPause: () => { logger.debug('Episode VO onPause', { segmentId }); callbacks.onPause?.(); },
        onEnded: () => {
          logger.debug('Episode VO onEnded', { segmentId }); callbacks.onEnded?.();
          if (this.episodeAudioData.currentEpisodeVoiceover === audio) {
            if (this.onEpisodeSubtitleUpdate && text) this.onEpisodeSubtitleUpdate('');
            this.stopEpisodeVoiceoverSegment();
          }
        },
        onTimeUpdate: () => { callbacks.onTimeUpdate?.({ currentTime: audio.currentTime, duration: audio.duration }); },
        onError: (e) => {
          logger.error('Episode VO onError', { segmentId, error: e }); callbacks.onError?.(e);
          if (this.episodeAudioData.currentEpisodeVoiceover === audio) {
            if (this.onEpisodeSubtitleUpdate && text) this.onEpisodeSubtitleUpdate('');
            this.stopEpisodeVoiceoverSegment();
          }
        },
        onLoadedData: () => { logger.debug('Episode VO onLoadedData', { segmentId, duration: audio.duration }); callbacks.onLoadedData?.({ duration: audio.duration }); }
      };
      this.episodeAudioData.currentEpisodeVoiceoverListeners = eventListeners;

      Object.entries(eventListeners).forEach(([eventName, handler]) => {
        // Convert onPlay to 'play', onEnded to 'ended' etc.
        const nativeEventName = eventName.substring(2).toLowerCase();
        audio.addEventListener(nativeEventName, handler);
      });

      if (this.onEpisodeSubtitleUpdate && text) this.onEpisodeSubtitleUpdate(text);
      await audio.play();
      this.episodeAudioData.currentEpisodeVoiceover = audio;
      logger.debug('Playing episode voiceover segment', { segmentId, volume: audio.volume });
    } catch (error) {
      logger.error('Failed to play episode voiceover segment', { segmentId, error: error.message, stack: error.stack });
      callbacks.onError?.(error);
      if (this.onEpisodeSubtitleUpdate && voiceover.text) this.onEpisodeSubtitleUpdate('');
      this.stopEpisodeVoiceoverSegment();
    }
  }

  stopEpisodeVoiceoverSegment() {
    const audio = this.episodeAudioData.currentEpisodeVoiceover;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      const listeners = this.episodeAudioData.currentEpisodeVoiceoverListeners;
      if (listeners) {
        Object.entries(listeners).forEach(([eventName, handler]) => {
            const nativeEventName = eventName.substring(2).toLowerCase();
            audio.removeEventListener(nativeEventName, handler);
        });
        this.episodeAudioData.currentEpisodeVoiceoverListeners = null;
      }
      this.episodeAudioData.currentEpisodeVoiceover = null;
      this.episodeAudioData.currentEpisodeVoiceoverCallbacks = null;
      if (this.onEpisodeSubtitleUpdate) this.onEpisodeSubtitleUpdate('');
      logger.debug('Episode voiceover segment stopped and listeners cleaned up');
    }
  }

  pauseEpisodeVoiceoverSegment() {
    const audio = this.episodeAudioData.currentEpisodeVoiceover;
    if (audio && !audio.paused) {
      audio.pause(); // Triggers 'pause' event, then callbacks.onPause
      logger.debug('Episode voiceover segment paused via method.');
    } else {
      logger.debug('pauseEpisodeVoiceoverSegment called but no audio playing or already paused.');
    }
  }

  resumeEpisodeVoiceoverSegment() {
    const audio = this.episodeAudioData.currentEpisodeVoiceover;
    if (audio && audio.paused) {
      audio.play().catch(error => { // Triggers 'play' event, then callbacks.onPlay
        logger.error('Error resuming episode voiceover segment', { error });
        this.episodeAudioData.currentEpisodeVoiceoverCallbacks?.onError?.(error);
      });
      logger.debug('Episode voiceover segment resumed via method.');
    } else {
      logger.debug('resumeEpisodeVoiceoverSegment called but no audio paused or not loaded.');
    }
  }

  async playEpisodeEffect(effectName, options = {}) { /* ... (implementation as before) ... */
    if (!this.enabled) return;
    if (!this.episodeAudioData.effects) { logger.warn('playEpisodeEffect: Episode effects not loaded. Fallback.'); return this.play(effectName, options); }
    const effect = this.episodeAudioData.effects.get(effectName);
    if (!effect) { logger.warn('Episode effect not found, fallback to global.', { effectName }); return this.play(effectName, options); }
    try {
      const { audio } = effect;
      const audioClone = audio.cloneNode(true);
      audioClone.volume = options.volume !== undefined ? options.volume : (effect.volume !== undefined ? effect.volume : this.volume);
      audioClone.loop = options.loop !== undefined ? options.loop : (effect.loop || false);
      await audioClone.play();
      if (!audioClone.loop) {
        this.episodeAudioData.currentEpisodeEffects.push(audioClone);
        audioClone.addEventListener('ended', () => {
          const index = this.episodeAudioData.currentEpisodeEffects.indexOf(audioClone);
          if (index > -1) this.episodeAudioData.currentEpisodeEffects.splice(index, 1);
        }, { once: true });
      }
      logger.debug('Playing episode effect', { effectName, volume: audioClone.volume, loop: audioClone.loop });
      return audioClone;
    } catch (error) { logger.error('Failed to play episode effect', { effectName, error: error.message }); return null; }
  }
  async playEpisodeAmbient(ambientName, options = {}) { /* ... (implementation as before) ... */
    logger.debug('Attempting to play episode ambient sound', { ambientName, options });
    const ambientOptions = { loop: true, volume: options.volume !== undefined ? options.volume : 0.2, ...options };
    return this.playEpisodeEffect(ambientName, ambientOptions);
  }
  stopAllEpisodeEffects() { /* ... (implementation as before) ... */
    logger.debug('Stopping all current episode effects', { count: this.episodeAudioData.currentEpisodeEffects.length });
    this.episodeAudioData.currentEpisodeEffects.forEach(audio => { audio.pause(); audio.currentTime = 0; });
    this.episodeAudioData.currentEpisodeEffects = [];
  }
  async playSceneAudio(sceneId, time) { /* ... (implementation as before) ... */
    if (!this.episodeAudioData.metadata || !this.episodeAudioData.metadata.effects || !this.episodeAudioData.metadata.voiceovers) { logger.warn('playSceneAudio: Episode metadata not loaded.'); return; }
    const sceneData = this.episodeAudioData.metadata.effects.scenes?.[sceneId];
    if (!sceneData) { logger.warn('playSceneAudio: Scene data not found', { sceneId }); return; }
    const voiceoverSegments = this.episodeAudioData.metadata.voiceovers.segments || [];
    const relevantVoiceoverSegments = voiceoverSegments.filter(seg => sceneData.voiceovers?.includes(seg.id));
    logger.debug('Playing scene audio', { sceneId, time, voiceoverSegmentsCount: relevantVoiceoverSegments.length });
    for (const segment of relevantVoiceoverSegments) {
      const segmentStartTime = parseFloat(segment.startTime);
      const segmentDuration = parseFloat(segment.duration);
      if (!isNaN(segmentStartTime) && !isNaN(segmentDuration) && time >= segmentStartTime && time < (segmentStartTime + segmentDuration)) {
        const currentVoAudio = this.episodeAudioData.currentEpisodeVoiceover;
        const vo = this.episodeAudioData.voiceovers.get(segment.id);
        if (vo && vo.audio && currentVoAudio !== vo.audio) {
           logger.debug('Playing voiceover for scene based on time', { segmentId: segment.id, sceneId, time });
           await this.playEpisodeVoiceoverSegment(segment.id);
        } else if (!currentVoAudio && vo && vo.audio) {
          logger.debug('No current VO, playing voiceover for scene based on time', { segmentId: segment.id, sceneId, time });
          await this.playEpisodeVoiceoverSegment(segment.id);
        }
        break;
      }
    }
    logger.debug('Scene audio playback attempt finished', { sceneId });
  }
  // --- End of Methods integrated from EpisodeAudioManager ---
}

const audioManager = new AudioManager()

if (typeof window !== 'undefined') {
  const initOnInteraction = () => {
    audioManager.init().catch(error => logger.error("Error during initial init", error));
    ['click', 'touchstart', 'keydown'].forEach(event => {
      document.removeEventListener(event, initOnInteraction)
    })
  }
  ['click', 'touchstart', 'keydown'].forEach(event => {
    document.addEventListener(event, initOnInteraction, { once: true })
  })
}

export default audioManager