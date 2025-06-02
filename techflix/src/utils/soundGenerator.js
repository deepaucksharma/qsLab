/**
 * Sound Generator using Web Audio API
 * Creates placeholder sounds when audio files are not available
 */

class SoundGenerator {
  constructor() {
    this.audioContext = null
    this.initialized = false
  }

  init() {
    if (this.initialized) return
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      this.initialized = true
    } catch (error) {
      console.error('Web Audio API not supported:', error)
    }
  }

  /**
   * Generate Netflix-style "ta-dum" sound
   */
  generateTaDum() {
    if (!this.audioContext) return
    
    const now = this.audioContext.currentTime
    
    // First "TA" note (D3)
    this.playNote(146.83, now, 0.8, 0.6)
    
    // Second "DUM" note (A2, lower and longer)
    this.playNote(110, now + 0.6, 1.2, 0.8)
    
    // Add some reverb-like effect
    this.playNote(146.83, now + 0.05, 0.4, 0.2) // Echo of first note
    this.playNote(110, now + 0.65, 0.8, 0.3) // Echo of second note
  }

  /**
   * Generate click sound
   */
  generateClick() {
    if (!this.audioContext) return
    
    const now = this.audioContext.currentTime
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.frequency.value = 1000
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
    
    oscillator.start(now)
    oscillator.stop(now + 0.1)
  }

  /**
   * Generate hover sound
   */
  generateHover() {
    if (!this.audioContext) return
    
    const now = this.audioContext.currentTime
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.frequency.setValueAtTime(800, now)
    oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.05)
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.1, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05)
    
    oscillator.start(now)
    oscillator.stop(now + 0.05)
  }

  /**
   * Generate whoosh/transition sound
   */
  generateWhoosh() {
    if (!this.audioContext) return
    
    const now = this.audioContext.currentTime
    const noise = this.createNoiseBuffer()
    const source = this.audioContext.createBufferSource()
    const filter = this.audioContext.createBiquadFilter()
    const gainNode = this.audioContext.createGain()
    
    source.buffer = noise
    source.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(100, now)
    filter.frequency.exponentialRampToValueAtTime(3000, now + 0.2)
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.4)
    
    gainNode.gain.setValueAtTime(0.3, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4)
    
    source.start(now)
    source.stop(now + 0.4)
  }

  /**
   * Generate success sound
   */
  generateSuccess() {
    if (!this.audioContext) return
    
    const now = this.audioContext.currentTime
    
    // Play a major chord arpeggio
    this.playNote(523.25, now, 0.1, 0.3) // C5
    this.playNote(659.25, now + 0.1, 0.1, 0.3) // E5
    this.playNote(783.99, now + 0.2, 0.2, 0.3) // G5
  }

  /**
   * Generate error sound
   */
  generateError() {
    if (!this.audioContext) return
    
    const now = this.audioContext.currentTime
    
    // Play a dissonant interval
    this.playNote(440, now, 0.2, 0.4) // A4
    this.playNote(466.16, now, 0.2, 0.4) // A#4 (dissonant)
  }

  /**
   * Helper function to play a single note
   */
  playNote(frequency, startTime, duration, volume) {
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.frequency.value = frequency
    oscillator.type = 'sine'
    
    // Envelope
    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)
    
    oscillator.start(startTime)
    oscillator.stop(startTime + duration)
  }

  /**
   * Create white noise buffer
   */
  createNoiseBuffer() {
    const bufferSize = this.audioContext.sampleRate * 0.5
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
    const output = buffer.getChannelData(0)
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1
    }
    
    return buffer
  }

  /**
   * Generate a sound by name
   */
  generate(soundName) {
    if (!this.initialized) {
      this.init()
    }
    
    switch (soundName) {
      case 'ta-dum':
        this.generateTaDum()
        break
      case 'click':
        this.generateClick()
        break
      case 'hover':
        this.generateHover()
        break
      case 'whoosh':
      case 'transition':
      case 'scene-change':
        this.generateWhoosh()
        break
      case 'success':
        this.generateSuccess()
        break
      case 'error':
        this.generateError()
        break
      default:
        // Default to a simple beep
        this.playNote(800, this.audioContext.currentTime, 0.1, 0.2)
    }
  }
}

// Create singleton instance
const soundGenerator = new SoundGenerator()

export default soundGenerator