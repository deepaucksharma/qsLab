import { useState, useEffect, useCallback } from 'react'
import { Play, Volume2, Loader, CheckCircle, AlertCircle, Music } from 'lucide-react'
import audioManager from '@utils/audioManager'
import logger from '@utils/logger'

const AudioTestPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [episodeLoaded, setEpisodeLoaded] = useState(false)
  const [error, setError] = useState(null)
  const [currentSubtitle, setCurrentSubtitle] = useState('')
  const [activityLog, setActivityLog] = useState([])
  const [audioState, setAudioState] = useState({})

  // System sounds
  const systemSounds = [
    { id: 'ta-dum', name: 'Ta-dum', icon: '🎬' },
    { id: 'click', name: 'Click', icon: '🖱️' },
    { id: 'hover', name: 'Hover', icon: '👆' },
    { id: 'transition', name: 'Transition', icon: '↔️' },
    { id: 'scene-change', name: 'Scene Change', icon: '🎭' },
    { id: 'episode-start', name: 'Episode Start', icon: '▶️' },
    { id: 'success', name: 'Success', icon: '✅' },
    { id: 'error', name: 'Error', icon: '❌' }
  ]

  // Voice-over segments
  const voiceoverSegments = [
    { id: 'evolution-intro', name: 'Evolution Intro' },
    { id: 'evolution-birth', name: 'Birth of Kafka' },
    { id: 'evolution-early-days', name: 'Early Days' },
    { id: 'evolution-growth', name: 'Growth' },
    { id: 'evolution-transformation', name: 'Transformation' },
    { id: 'bottleneck-intro', name: 'Bottleneck Intro' },
    { id: 'bottleneck-cost', name: 'The Cost' },
    { id: 'bottleneck-real-world', name: 'Real World' },
    { id: 'bottleneck-attempts', name: 'Previous Attempts' },
    { id: 'share-groups-revelation', name: 'Share Groups' },
    { id: 'share-groups-architecture', name: 'Architecture' },
    { id: 'impact-intro', name: 'Impact Intro' },
    { id: 'impact-metrics', name: 'Impact Metrics' }
  ]

  // Sound effects
  const soundEffects = [
    { id: 'tech-atmosphere', name: 'Tech Atmosphere', type: 'ambient' },
    { id: 'data-flow', name: 'Data Flow', type: 'effect' },
    { id: 'scene-transition', name: 'Scene Transition', type: 'effect' },
    { id: 'timeline-whoosh', name: 'Timeline Whoosh', type: 'effect' },
    { id: 'reveal', name: 'Reveal', type: 'effect' },
    { id: 'partition-appear', name: 'Partition Appear', type: 'effect' },
    { id: 'consumer-connect', name: 'Consumer Connect', type: 'effect' },
    { id: 'breakthrough', name: 'Breakthrough', type: 'effect' },
    { id: 'impact-boom', name: 'Impact Boom', type: 'effect' }
  ]

  // Add to activity log
  const addLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setActivityLog(prev => [...prev, { timestamp, message, type }].slice(-10))
  }, [])

  // Update audio state
  const updateAudioState = useCallback(() => {
    const state = audioManager.getState()
    setAudioState(state)
  }, [])

  // Initialize
  useEffect(() => {
    audioManager.init()
    audioManager.setSubtitleCallback(setCurrentSubtitle)
    updateAudioState()
    addLog('Audio system initialized', 'success')
  }, [])

  // Initialize audio on user interaction
  const initializeAudio = async () => {
    try {
      await audioManager.init()
      updateAudioState()
      addLog('Audio initialized via user interaction', 'success')
    } catch (error) {
      addLog(`Initialization error: ${error.message}`, 'error')
    }
  }

  // Load episode audio
  const loadEpisodeAudio = async () => {
    setIsLoading(true)
    setError(null)
    addLog('Loading S2E1 audio...', 'info')
    
    try {
      const success = await audioManager.loadEpisodeAudio('s2e1')
      if (success) {
        setEpisodeLoaded(true)
        updateAudioState()
        addLog('Episode audio loaded successfully', 'success')
      } else {
        throw new Error('Failed to load episode audio')
      }
    } catch (err) {
      setError(err.message)
      addLog(`Load error: ${err.message}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Play system sound
  const playSystemSound = async (soundId, soundName) => {
    try {
      await audioManager.playSystemSound(soundId)
      addLog(`Played: ${soundName}`, 'success')
      updateAudioState()
    } catch (error) {
      addLog(`Error playing ${soundName}: ${error.message}`, 'error')
    }
  }

  // Play voiceover
  const playVoiceover = async (segmentId, segmentName) => {
    try {
      await audioManager.playVoiceover(segmentId)
      addLog(`Playing voiceover: ${segmentName}`, 'success')
      updateAudioState()
    } catch (error) {
      addLog(`Error playing voiceover: ${error.message}`, 'error')
    }
  }

  // Play effect
  const playEffect = async (effectId, effectName, isAmbient = false) => {
    try {
      if (isAmbient) {
        await audioManager.playAmbient(effectId)
        addLog(`Playing ambient: ${effectName}`, 'success')
      } else {
        await audioManager.playEffect(effectId)
        addLog(`Playing effect: ${effectName}`, 'success')
      }
      updateAudioState()
    } catch (error) {
      addLog(`Error playing effect: ${error.message}`, 'error')
    }
  }

  // Toggle sounds
  const toggleSounds = () => {
    const newState = audioManager.toggleSystemSounds()
    updateAudioState()
    addLog(`System sounds ${newState ? 'enabled' : 'disabled'}`, 'info')
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Audio System Test Page</h1>

        {/* Initialize Button */}
        <div className="mb-8 bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Initialize Audio</h2>
          <button
            onClick={initializeAudio}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Initialize Audio (Click First!)
          </button>
          <p className="text-gray-400 text-sm mt-2">
            Click this button to enable audio playback (browser requirement)
          </p>
        </div>

        {/* System Sounds */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">System Sounds</h2>
            <button
              onClick={toggleSounds}
              className={`px-4 py-2 rounded-lg transition-colors ${
                audioState.systemSounds?.enabled 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {audioState.systemSounds?.enabled ? 'Sounds ON' : 'Sounds OFF'}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {systemSounds.map(sound => (
              <button
                key={sound.id}
                onClick={() => playSystemSound(sound.id, sound.name)}
                className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex flex-col items-center"
              >
                <span className="text-2xl mb-2">{sound.icon}</span>
                <span className="text-sm">{sound.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Episode Audio */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Episode Audio - S2E1</h2>
          
          {!episodeLoaded ? (
            <button
              onClick={loadEpisodeAudio}
              disabled={isLoading}
              className="w-full p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Loading Episode Audio...
                </>
              ) : (
                <>
                  <Music className="w-5 h-5 mr-2" />
                  Load S2E1 Audio
                </>
              )}
            </button>
          ) : (
            <>
              {/* Voice-overs */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Voice-overs</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {voiceoverSegments.map(segment => (
                    <button
                      key={segment.id}
                      onClick={() => playVoiceover(segment.id, segment.name)}
                      className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                    >
                      {segment.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound Effects */}
              <div>
                <h3 className="text-lg font-medium mb-3">Sound Effects</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {soundEffects.map(effect => (
                    <button
                      key={effect.id}
                      onClick={() => playEffect(effect.id, effect.name, effect.type === 'ambient')}
                      className={`p-3 rounded-lg transition-colors text-sm ${
                        effect.type === 'ambient' 
                          ? 'bg-purple-900 hover:bg-purple-800' 
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      {effect.name}
                      {effect.type === 'ambient' && ' 🔁'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-800 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}
        </div>

        {/* Subtitle Display */}
        {currentSubtitle && (
          <div className="mb-8 p-6 bg-gray-900 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Current Subtitle</h3>
            <p className="text-xl text-yellow-400 italic">{currentSubtitle}</p>
          </div>
        )}

        {/* Activity Log */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Activity Log</h2>
          <div className="bg-gray-900 rounded-lg p-4 h-48 overflow-y-auto">
            {activityLog.length === 0 ? (
              <p className="text-gray-500">No activity yet...</p>
            ) : (
              activityLog.map((log, index) => (
                <div
                  key={index}
                  className={`mb-2 text-sm ${
                    log.type === 'error' ? 'text-red-400' :
                    log.type === 'success' ? 'text-green-400' :
                    'text-gray-300'
                  }`}
                >
                  <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Audio State */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Audio System State</h2>
          <div className="bg-gray-900 rounded-lg p-4">
            <pre className="text-xs text-gray-400 overflow-auto">
              {JSON.stringify(audioState, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AudioTestPage