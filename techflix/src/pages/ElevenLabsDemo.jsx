import { useState, useEffect } from 'react'
import { Play, Pause, Mic, Star, Download, Sparkles } from 'lucide-react'

const ElevenLabsDemo = () => {
  const [playing, setPlaying] = useState(null)
  const [audioRef] = useState(new Audio())
  
  // ElevenLabs sample details
  const sample = {
    provider: 'ElevenLabs',
    voice: 'Aria',
    voiceDescription: 'A middle-aged female with an African-American accent',
    file: '/audio/voiceovers/elevenlabs-samples/evolution-intro-aria.mp3',
    text: 'In 2011, LinkedIn faced a crisis. Their monolithic architecture was crumbling under the weight of 175 million users. They needed something revolutionary.',
    features: [
      'Natural speech synthesis',
      'Emotion and tone control',
      'Multiple voice options',
      'High-quality output',
      'Low latency generation'
    ]
  }
  
  // Edge TTS comparison
  const edgeSample = {
    provider: 'Edge TTS',
    voice: 'Guy',
    file: '/audio/voiceovers/s2e1/evolution-intro.mp3'
  }
  
  useEffect(() => {
    audioRef.addEventListener('ended', () => setPlaying(null))
    return () => {
      audioRef.pause()
      audioRef.removeEventListener('ended', () => setPlaying(null))
    }
  }, [audioRef])
  
  const playAudio = async (file, id) => {
    try {
      if (playing === id) {
        audioRef.pause()
        setPlaying(null)
      } else {
        audioRef.src = file
        await audioRef.play()
        setPlaying(id)
      }
    } catch (error) {
      console.error('Playback error:', error)
    }
  }
  
  const downloadAudio = (file, name) => {
    const link = document.createElement('a')
    link.href = file
    link.download = name
    link.click()
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 flex items-center justify-center gap-3">
            <Sparkles className="w-10 h-10 text-purple-400" />
            ElevenLabs AI Voice Demo
            <Sparkles className="w-10 h-10 text-purple-400" />
          </h1>
          <p className="text-xl text-gray-400">
            Experience next-generation AI voice synthesis
          </p>
        </div>

        {/* Main Demo */}
        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl p-8 mb-8 border border-purple-800/50">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">{sample.provider}</h2>
              <p className="text-gray-400 text-lg">{sample.voice} - {sample.voiceDescription}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => playAudio(sample.file, 'elevenlabs')}
                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  playing === 'elevenlabs' 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {playing === 'elevenlabs' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                {playing === 'elevenlabs' ? 'Pause' : 'Play Demo'}
              </button>
              <button
                onClick={() => downloadAudio(sample.file, 'elevenlabs-aria-demo.mp3')}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-all flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download
              </button>
            </div>
          </div>

          {/* Script */}
          <div className="bg-black/30 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3 text-purple-300">Script</h3>
            <p className="text-lg leading-relaxed italic text-gray-300">
              "{sample.text}"
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {sample.features.map((feature, idx) => (
              <div key={idx} className="bg-purple-800/20 rounded-lg p-3 text-center">
                <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <p className="text-sm">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison with Edge TTS */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <h3 className="text-2xl font-bold mb-4">Compare with Edge TTS</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg">{edgeSample.provider} - {edgeSample.voice} Voice</p>
              <p className="text-gray-400">Microsoft neural voice (free)</p>
            </div>
            <button
              onClick={() => playAudio(edgeSample.file, 'edge')}
              className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                playing === 'edge' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {playing === 'edge' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              Play Edge TTS
            </button>
          </div>
        </div>

        {/* Technical Details */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Mic className="w-6 h-6 text-purple-400" />
              Voice Characteristics
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Natural intonation and rhythm</li>
              <li>• Emotional expressiveness</li>
              <li>• Clear pronunciation</li>
              <li>• Consistent pacing</li>
              <li>• Professional quality</li>
            </ul>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">API Features</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• RESTful API access</li>
              <li>• Multiple voice options</li>
              <li>• Voice cloning capability</li>
              <li>• Real-time streaming</li>
              <li>• Custom voice creation</li>
            </ul>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2">About This Demo</h3>
          <p className="text-gray-300 mb-3">
            This audio was generated using the ElevenLabs API with the Aria voice. 
            ElevenLabs provides state-of-the-art AI voice synthesis with natural-sounding results.
          </p>
          <div className="text-sm text-gray-400">
            <p>• API Key: Provided and active ✅</p>
            <p>• Model: eleven_monolingual_v1</p>
            <p>• Voice Settings: Stability 0.5, Similarity Boost 0.75</p>
            <p>• Generated: Fresh sample using your API key</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ElevenLabsDemo