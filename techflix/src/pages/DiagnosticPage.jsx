import { useState, useEffect } from 'react'
import audioManager from '@utils/audioManager'

const DiagnosticPage = () => {
  const [diagnostics, setDiagnostics] = useState({
    audioContext: null,
    permissions: null,
    files: {
      system: [],
      voiceovers: [],
      effects: []
    },
    errors: []
  })

  useEffect(() => {
    const runDiagnostics = async () => {
      const results = {
        audioContext: null,
        permissions: null,
        files: {
          system: [],
          voiceovers: [],
          effects: []
        },
        errors: []
      }

      // Check Web Audio API
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        if (AudioContext) {
          const ctx = new AudioContext()
          results.audioContext = {
            state: ctx.state,
            sampleRate: ctx.sampleRate,
            baseLatency: ctx.baseLatency
          }
          ctx.close()
        }
      } catch (e) {
        results.errors.push(`AudioContext error: ${e.message}`)
      }

      // Check for audio permissions (if available)
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const micPermission = await navigator.permissions.query({ name: 'microphone' }).catch(() => null)
          results.permissions = {
            microphone: micPermission?.state || 'not-required'
          }
        } catch (e) {
          results.permissions = { error: e.message }
        }
      }

      // Test loading audio files
      const testFiles = [
        { path: '/audio/system/click.wav', type: 'system' },
        { path: '/audio/system/netflix-tadum.wav', type: 'system' },
        { path: '/audio/voiceovers/s2e1/metadata.json', type: 'voiceovers' },
        { path: '/audio/effects/s2e1/sound-library.json', type: 'effects' }
      ]

      for (const file of testFiles) {
        try {
          const response = await fetch(file.path)
          results.files[file.type].push({
            path: file.path,
            status: response.status,
            ok: response.ok,
            contentType: response.headers.get('content-type')
          })
        } catch (e) {
          results.errors.push(`Failed to load ${file.path}: ${e.message}`)
        }
      }

      // Test audio manager
      try {
        results.audioManager = {
          systemSoundsEnabled: audioManager.enabled,
          systemVolume: audioManager.volume,
          voiceOverEnabled: audioManager.episodeVoiceOverEnabled,
          voiceOverVolume: audioManager.voiceOverVolume,
          initialized: audioManager.initialized
        }
      } catch (e) {
        results.errors.push(`AudioManager error: ${e.message}`)
      }

      setDiagnostics(results)
    }

    runDiagnostics()
  }, [])

  const testSound = async (soundName) => {
    try {
      await audioManager.playSystemSound(soundName)
      alert(`Playing: ${soundName}`)
    } catch (e) {
      alert(`Error playing ${soundName}: ${e.message}`)
    }
  }

  const initializeAudio = async () => {
    try {
      await audioManager.init()
      alert('Audio initialized successfully!')
      window.location.reload()
    } catch (e) {
      alert(`Initialization error: ${e.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Audio System Diagnostics</h1>

      {/* Audio Context */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Web Audio API</h2>
        <div className="bg-gray-800 p-4 rounded">
          {diagnostics.audioContext ? (
            <div>
              <p>✅ AudioContext available</p>
              <p>State: {diagnostics.audioContext.state}</p>
              <p>Sample Rate: {diagnostics.audioContext.sampleRate} Hz</p>
            </div>
          ) : (
            <p>❌ AudioContext not available</p>
          )}
        </div>
      </section>

      {/* File Loading */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">File Access</h2>
        <div className="bg-gray-800 p-4 rounded space-y-2">
          {Object.entries(diagnostics.files).map(([type, files]) => (
            <div key={type}>
              <h3 className="font-medium">{type}:</h3>
              {files.map((file, i) => (
                <div key={i} className="ml-4">
                  <span className={file.ok ? 'text-green-400' : 'text-red-400'}>
                    {file.ok ? '✅' : '❌'} {file.path}
                  </span>
                  <span className="text-gray-400 ml-2">
                    (Status: {file.status}, Type: {file.contentType})
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Audio Manager State */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Audio Manager</h2>
        <div className="bg-gray-800 p-4 rounded">
          {diagnostics.audioManager ? (
            <div className="space-y-1">
              <p>Initialized: {diagnostics.audioManager.initialized ? '✅ Yes' : '❌ No'}</p>
              <p>System Sounds: {diagnostics.audioManager.systemSoundsEnabled ? '✅ Enabled' : '❌ Disabled'}</p>
              <p>System Volume: {(diagnostics.audioManager.systemVolume * 100).toFixed(0)}%</p>
              <p>Voice-over: {diagnostics.audioManager.voiceOverEnabled ? '✅ Enabled' : '❌ Disabled'}</p>
              <p>Voice-over Volume: {(diagnostics.audioManager.voiceOverVolume * 100).toFixed(0)}%</p>
            </div>
          ) : (
            <p>⏳ Loading...</p>
          )}
        </div>
      </section>

      {/* Test Sounds */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Sounds</h2>
        <div className="flex gap-4">
          <button
            onClick={initializeAudio}
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
          >
            Initialize Audio
          </button>
          <button
            onClick={() => testSound('click')}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Test Click
          </button>
          <button
            onClick={() => testSound('ta-dum')}
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
          >
            Test Ta-dum
          </button>
        </div>
      </section>

      {/* Errors */}
      {diagnostics.errors.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Errors</h2>
          <div className="bg-red-900 p-4 rounded">
            {diagnostics.errors.map((error, i) => (
              <p key={i} className="text-red-200">{error}</p>
            ))}
          </div>
        </section>
      )}

      {/* Browser Info */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Browser Info</h2>
        <div className="bg-gray-800 p-4 rounded">
          <p>User Agent: {navigator.userAgent}</p>
          <p>Audio Formats:</p>
          <ul className="ml-4">
            <li>MP3: {new Audio().canPlayType('audio/mpeg') || '❌'}</li>
            <li>WAV: {new Audio().canPlayType('audio/wav') || '❌'}</li>
            <li>OGG: {new Audio().canPlayType('audio/ogg') || '❌'}</li>
          </ul>
        </div>
      </section>
    </div>
  )
}

export default DiagnosticPage