import { useState, useEffect } from 'react'
import { Play, Pause, Volume2, Download, Mic, Star, Clock, FileAudio } from 'lucide-react'
import logger from '@utils/logger'

const AudioComparisonPage = () => {
  const [selectedSegment, setSelectedSegment] = useState('evolution-intro')
  const [playingAudio, setPlayingAudio] = useState(null)
  const [audioRefs] = useState({})
  const [loadedAudios, setLoadedAudios] = useState({})
  const [audioStats, setAudioStats] = useState({})

  // Available TTS methods/voices
  const ttsMethods = [
    {
      id: 'edge-guy',
      name: 'Edge TTS - Guy',
      voice: 'en-US-GuyNeural',
      description: 'Microsoft Edge neural voice',
      path: '/audio/voiceovers/s2e1/',
      format: 'mp3',
      quality: 'High',
      cost: 'Free'
    },
    {
      id: 'edge-jenny',
      name: 'Edge TTS - Jenny',
      voice: 'en-US-JennyNeural',
      description: 'Microsoft Edge female voice',
      path: '/audio/voiceovers/s2e1-jenny/',
      format: 'mp3',
      quality: 'High',
      cost: 'Free'
    },
    {
      id: 'edge-aria',
      name: 'Edge TTS - Aria',
      voice: 'en-US-AriaNeural',
      description: 'Microsoft Edge expressive voice',
      path: '/audio/voiceovers/s2e1-aria/',
      format: 'mp3',
      quality: 'High',
      cost: 'Free'
    },
    {
      id: 'gtts',
      name: 'Google TTS',
      voice: 'en-US-Standard-A',
      description: 'Google Cloud Text-to-Speech',
      path: '/audio/voiceovers/s2e1-gtts/',
      format: 'mp3',
      quality: 'Medium',
      cost: 'Pay-per-use'
    },
    {
      id: 'elevenlabs',
      name: 'ElevenLabs',
      voice: 'Aria',
      description: 'AI voice synthesis',
      path: '/audio/voiceovers/elevenlabs-samples/',
      format: 'mp3',
      quality: 'Very High',
      cost: 'Subscription',
      available: true
    },
    {
      id: 'azure',
      name: 'Azure Speech',
      voice: 'en-US-JasonNeural',
      description: 'Azure Cognitive Services',
      path: '/audio/voiceovers/s2e1-azure/',
      format: 'mp3',
      quality: 'High',
      cost: 'Pay-per-use'
    }
  ]

  // Available segments
  const segments = [
    { id: 'evolution-intro', name: 'Evolution Intro', duration: '8s' },
    { id: 'evolution-birth', name: 'Birth of Kafka', duration: '12s' },
    { id: 'evolution-early-days', name: 'Early Days', duration: '15s' },
    { id: 'evolution-growth', name: 'Growth Phase', duration: '10s' },
    { id: 'evolution-transformation', name: 'Transformation', duration: '11s' },
    { id: 'bottleneck-intro', name: 'Bottleneck Intro', duration: '9s' },
    { id: 'bottleneck-cost', name: 'The Cost', duration: '8s' },
    { id: 'bottleneck-real-world', name: 'Real World Impact', duration: '14s' },
    { id: 'share-groups-revelation', name: 'Share Groups', duration: '13s' },
    { id: 'impact-intro', name: 'Impact Intro', duration: '7s' },
    { id: 'impact-metrics', name: 'Impact Metrics', duration: '16s' }
  ]

  // Load audio metadata
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const response = await fetch('/audio/voiceovers/s2e1/metadata.json')
        if (response.ok) {
          const data = await response.json()
          logger.info('Loaded voiceover metadata', { segments: data.segments?.length })
        }
      } catch (error) {
        logger.error('Failed to load metadata', { error })
      }
    }
    loadMetadata()
  }, [])

  // Handle audio playback
  const playAudio = async (methodId, segmentId) => {
    const key = `${methodId}-${segmentId}`
    
    // Stop currently playing audio
    if (playingAudio && audioRefs[playingAudio]) {
      audioRefs[playingAudio].pause()
      audioRefs[playingAudio].currentTime = 0
    }

    if (playingAudio === key) {
      setPlayingAudio(null)
      return
    }

    // Create or get audio element
    if (!audioRefs[key]) {
      const method = ttsMethods.find(m => m.id === methodId)
      const audioUrl = `${method.path}${segmentId}.mp3`
      
      const audio = new Audio(audioUrl)
      audioRefs[key] = audio
      
      audio.addEventListener('loadedmetadata', () => {
        setAudioStats(prev => ({
          ...prev,
          [key]: {
            duration: audio.duration,
            size: null // Would need server support to get file size
          }
        }))
      })

      audio.addEventListener('ended', () => {
        setPlayingAudio(null)
      })

      audio.addEventListener('error', (e) => {
        logger.error('Audio load error', { key, error: e })
        setLoadedAudios(prev => ({ ...prev, [key]: false }))
      })

      audio.addEventListener('canplaythrough', () => {
        setLoadedAudios(prev => ({ ...prev, [key]: true }))
      })
    }

    try {
      await audioRefs[key].play()
      setPlayingAudio(key)
      logger.info('Playing audio', { method: methodId, segment: segmentId })
    } catch (error) {
      logger.error('Playback error', { error })
    }
  }

  // Download audio file
  const downloadAudio = (methodId, segmentId) => {
    const method = ttsMethods.find(m => m.id === methodId)
    const audioUrl = `${method.path}${segmentId}.mp3`
    const link = document.createElement('a')
    link.href = audioUrl
    link.download = `${methodId}-${segmentId}.mp3`
    link.click()
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Audio Comparison Tool</h1>
        <p className="text-gray-400 mb-8">Compare TTS outputs from different providers and voices</p>

        {/* Segment Selector */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Voiceover Segment</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {segments.map(segment => (
              <button
                key={segment.id}
                onClick={() => setSelectedSegment(segment.id)}
                className={`p-3 rounded-lg transition-all ${
                  selectedSegment === segment.id
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <div className="font-medium">{segment.name}</div>
                <div className="text-sm text-gray-400 flex items-center justify-center mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  {segment.duration}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* TTS Methods Comparison */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">TTS Providers</h2>
          
          {ttsMethods.map(method => {
            const key = `${method.id}-${selectedSegment}`
            const isPlaying = playingAudio === key
            const isLoaded = loadedAudios[key]
            const stats = audioStats[key]
            
            return (
              <div
                key={method.id}
                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Mic className="w-5 h-5 text-blue-400" />
                      {method.name}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">{method.description}</p>
                    
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        Quality: {method.quality}
                      </span>
                      <span className="text-gray-500">Voice: {method.voice}</span>
                      <span className="text-gray-500">Cost: {method.cost}</span>
                      {stats && (
                        <span className="text-gray-500">
                          Duration: {stats.duration?.toFixed(1)}s
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => playAudio(method.id, selectedSegment)}
                      className={`p-3 rounded-full transition-all ${
                        isPlaying
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => downloadAudio(method.id, selectedSegment)}
                      className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Loading indicator */}
                {!isLoaded && key in loadedAudios && (
                  <div className="mt-3 text-sm text-red-400">
                    <FileAudio className="w-4 h-4 inline mr-1" />
                    Audio file not available for this method
                  </div>
                )}

                {/* Audio waveform placeholder */}
                {isPlaying && (
                  <div className="mt-4 h-16 bg-gray-900 rounded flex items-center justify-center">
                    <div className="flex items-center gap-1">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-red-500 rounded-full animate-pulse"
                          style={{
                            height: `${20 + Math.random() * 30}px`,
                            animationDelay: `${i * 0.05}s`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-900/20 border border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-blue-400" />
            Available Audio Files
          </h3>
          <p className="text-gray-300">
            Currently showing pre-generated audio from <strong>Edge TTS (Guy)</strong> voice. 
            Other providers shown for comparison purposes. To generate audio with other providers:
          </p>
          <ul className="list-disc list-inside mt-2 text-sm text-gray-400">
            <li>Edge TTS: Run <code className="bg-gray-800 px-2 py-1 rounded">python scripts/generate-voiceovers-s2e1.py</code></li>
            <li>Google TTS: Requires API key, run <code className="bg-gray-800 px-2 py-1 rounded">npm run generate:voiceovers:gtts</code></li>
            <li>ElevenLabs: Requires subscription and API key</li>
            <li>Azure: Requires Azure account and Speech Services key</li>
          </ul>
        </div>

        {/* Script Preview */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Script Preview</h3>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-300 italic">
              {selectedSegment === 'evolution-intro' && 
                "In 2011, LinkedIn faced a crisis. Their monolithic architecture was crumbling under the weight of 175 million users. They needed something revolutionary."}
              {selectedSegment === 'evolution-birth' && 
                "Enter Apache Kafka. Named after the author Franz Kafka, it promised to untangle the complexities of distributed data streaming. But the journey from version 0.7 to today's 4.0 would be nothing short of transformative."}
              {selectedSegment === 'evolution-early-days' && 
                "The early days were humble. Version 0.8 brought replication. Version 0.9 introduced the new consumer API. Each release solved problems, but also revealed new limitations. The most persistent? The rigid coupling between partitions and consumers."}
              {selectedSegment === 'evolution-growth' && 
                "As Kafka grew from handling millions to trillions of messages daily, this limitation became a bottleneck. Companies like Uber, Netflix, and Airbnb pushed Kafka to its limits, exposing the need for a fundamental rethink."}
              {selectedSegment === 'evolution-transformation' && 
                "By 2019, Kafka processed over 7 trillion messages per day at LinkedIn alone. The platform that started as a simple message queue had become the nervous system of the modern internet."}
              {selectedSegment === 'bottleneck-intro' && 
                "But success brought challenges. The partition-consumer coupling that once provided simplicity now created complexity at scale."}
              {selectedSegment === 'bottleneck-cost' && 
                "Rebalancing became a nightmare. A single consumer failure could trigger cascading rebalances, causing service disruptions lasting minutes or even hours."}
              {selectedSegment === 'bottleneck-real-world' && 
                "At Uber, during peak hours, a rebalancing event in their payment processing system could delay thousands of transactions. The cost wasn't just technical—it was measured in lost revenue and user trust."}
              {selectedSegment === 'share-groups-revelation' && 
                "Then came the revelation: What if consumers could share partitions dynamically? No ownership. No rebalancing. Just pure, efficient message distribution. This was the genesis of Share Groups."}
              {selectedSegment === 'impact-intro' && 
                "The impact was immediate and profound. Early adopters reported 90% reduction in rebalancing events."}
              {selectedSegment === 'impact-metrics' && 
                "Processing latency dropped from seconds to milliseconds. Systems that struggled with 10,000 messages per second now handled 100,000 with ease. Share Groups didn't just solve the problem—they redefined what was possible."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AudioComparisonPage