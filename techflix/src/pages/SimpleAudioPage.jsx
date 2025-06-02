import { useState } from 'react'

const SimpleAudioPage = () => {
  const [playing, setPlaying] = useState(null)
  const [error, setError] = useState(null)

  const segments = [
    'evolution-intro',
    'evolution-birth', 
    'evolution-early-days',
    'evolution-growth',
    'evolution-transformation',
    'bottleneck-intro',
    'bottleneck-cost',
    'bottleneck-real-world',
    'share-groups-revelation',
    'impact-intro',
    'impact-metrics'
  ]

  const playAudio = async (segment) => {
    try {
      setError(null)
      if (playing) {
        playing.pause()
      }
      
      const audio = new Audio(`/audio/voiceovers/s2e1/${segment}.mp3`)
      audio.play()
      setPlaying(audio)
      
      audio.addEventListener('ended', () => {
        setPlaying(null)
      })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Simple Audio Player</h1>
      
      <div className="grid grid-cols-2 gap-4 max-w-4xl">
        {segments.map(segment => (
          <button
            key={segment}
            onClick={() => playAudio(segment)}
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-left"
          >
            <div className="font-medium">{segment.replace(/-/g, ' ').toUpperCase()}</div>
            <div className="text-sm text-gray-400 mt-1">Click to play</div>
          </button>
        ))}
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-900 rounded">
          Error: {error}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-blue-900 rounded">
        <p>Audio files location: /audio/voiceovers/s2e1/</p>
        <p>Available files: {segments.length} segments</p>
      </div>
    </div>
  )
}

export default SimpleAudioPage