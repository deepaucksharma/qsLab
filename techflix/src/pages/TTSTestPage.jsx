import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Download, RefreshCw, Volume2, Settings, Mic, X, BarChart3, Package } from 'lucide-react';
import logger from '../utils/logger';
import TTSComparisonTable from '../components/TTSComparisonTable';
import TTSConfigurationPanel from '../components/TTSConfigurationPanel';

const TTSTestPage = () => {
  const [selectedProvider, setSelectedProvider] = useState('edge-tts');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [testText, setTestText] = useState(
    "Welcome to TechFlix. Today we explore Kafka Share Groups, a revolutionary approach to message consumption that breaks traditional partition barriers."
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudios, setGeneratedAudios] = useState([]);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showConfiguration, setShowConfiguration] = useState(false);
  const audioRefs = useRef({});

  // TTS Provider configurations
  const providers = {
    'edge-tts': {
      name: 'Microsoft Edge TTS',
      voices: {
        'en-US-JennyNeural': { name: 'Jenny (US)', gender: 'female', style: 'neutral' },
        'en-US-GuyNeural': { name: 'Guy (US)', gender: 'male', style: 'neutral' },
        'en-US-AriaNeural': { name: 'Aria (US)', gender: 'female', style: 'friendly' },
        'en-US-ChristopherNeural': { name: 'Christopher (US)', gender: 'male', style: 'professional' },
        'en-GB-SoniaNeural': { name: 'Sonia (UK)', gender: 'female', style: 'neutral' },
        'en-GB-RyanNeural': { name: 'Ryan (UK)', gender: 'male', style: 'neutral' }
      },
      options: {
        rate: { min: -50, max: 50, default: 0, label: 'Speed' },
        pitch: { min: -50, max: 50, default: 0, label: 'Pitch' }
      }
    },
    'gtts': {
      name: 'Google TTS',
      voices: {
        'en-us': { name: 'English (US)', gender: 'neutral', style: 'standard' },
        'en-uk': { name: 'English (UK)', gender: 'neutral', style: 'standard' },
        'en-au': { name: 'English (AU)', gender: 'neutral', style: 'standard' },
        'en-in': { name: 'English (IN)', gender: 'neutral', style: 'standard' }
      },
      options: {
        slow: { type: 'boolean', default: false, label: 'Slow Mode' }
      }
    },
    'amazon-polly': {
      name: 'Amazon Polly',
      voices: {
        'Joanna': { name: 'Joanna', gender: 'female', style: 'neural' },
        'Matthew': { name: 'Matthew', gender: 'male', style: 'neural' },
        'Amy': { name: 'Amy (UK)', gender: 'female', style: 'neural' },
        'Brian': { name: 'Brian (UK)', gender: 'male', style: 'neural' },
        'Ivy': { name: 'Ivy (Child)', gender: 'female', style: 'neural' },
        'Kevin': { name: 'Kevin', gender: 'male', style: 'neural' }
      },
      options: {
        engine: { type: 'select', options: ['neural', 'standard'], default: 'neural', label: 'Engine' }
      }
    },
    'elevenlabs': {
      name: 'ElevenLabs',
      voices: {
        'rachel': { name: 'Rachel', gender: 'female', style: 'conversational' },
        'clyde': { name: 'Clyde', gender: 'male', style: 'war_veteran' },
        'domi': { name: 'Domi', gender: 'female', style: 'strong' },
        'bella': { name: 'Bella', gender: 'female', style: 'soft' },
        'antoni': { name: 'Antoni', gender: 'male', style: 'well_rounded' },
        'josh': { name: 'Josh', gender: 'male', style: 'young' }
      },
      options: {
        stability: { min: 0, max: 100, default: 50, label: 'Stability' },
        similarity_boost: { min: 0, max: 100, default: 50, label: 'Clarity' }
      }
    },
    'coqui-tts': {
      name: 'Coqui TTS',
      voices: {
        'tts_models/en/ljspeech/tacotron2-DDC': { name: 'LJSpeech Tacotron2', gender: 'female', style: 'neutral' },
        'tts_models/en/vctk/vits': { name: 'VCTK Multi-speaker', gender: 'multi', style: 'varied' },
        'tts_models/en/ek1/tacotron2': { name: 'EK1 Tacotron2', gender: 'male', style: 'neutral' }
      },
      options: {
        speaker_id: { type: 'text', default: 'p225', label: 'Speaker ID (VCTK)' }
      }
    },
    'pyttsx3': {
      name: 'System TTS (Offline)',
      voices: {
        'system_default': { name: 'System Default', gender: 'varies', style: 'system' },
        'system_male': { name: 'System Male', gender: 'male', style: 'system' },
        'system_female': { name: 'System Female', gender: 'female', style: 'system' }
      },
      options: {
        rate: { min: 50, max: 300, default: 150, label: 'Words/Min' },
        volume: { min: 0, max: 100, default: 100, label: 'Volume' }
      }
    }
  };

  // Sample texts for testing
  const sampleTexts = [
    {
      name: 'Technical',
      text: "Share Groups revolutionize Kafka consumption by allowing multiple consumers to process the same partition simultaneously, breaking traditional scaling barriers."
    },
    {
      name: 'Narrative',
      text: "In the world of distributed systems, every millisecond counts. Today, we'll discover how modern architectures push the boundaries of what's possible."
    },
    {
      name: 'Instructional',
      text: "First, configure your consumer with the share group ID. Next, implement the new acknowledgment pattern. Finally, monitor the critical metrics we discussed."
    },
    {
      name: 'Dramatic',
      text: "The old ways are crumbling. A new paradigm emerges from the chaos. This is not evolution—it's revolution. Welcome to the future of streaming."
    }
  ];

  const handleGenerate = async () => {
    if (!selectedVoice || !testText.trim()) {
      logger.warn('TTS generation attempted without voice or text');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Check if running mock API (development)
      const API_URL = import.meta.env.MODE === 'development' 
        ? 'http://localhost:3333/api/tts/generate'
        : '/api/tts/generate';
      
      // Try real API first
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            provider: selectedProvider,
            voice: selectedVoice,
            text: testText,
            options: {} // Could add provider-specific options here
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const newAudio = {
              id: Date.now(),
              provider: selectedProvider,
              voice: selectedVoice,
              voiceInfo: providers[selectedProvider].voices[selectedVoice],
              text: testText,
              url: data.url,
              timestamp: data.generated,
              duration: Math.round(testText.split(' ').length / 2.5) // Estimate
            };
            
            setGeneratedAudios(prev => [newAudio, ...prev]);
            logger.info('TTS audio generated via API', { provider: selectedProvider, voice: selectedVoice });
            return;
          }
        }
      } catch (apiError) {
        logger.warn('TTS API not available, using mock', { error: apiError.message });
      }
      
      // Fallback to mock for demo
      const mockAudioUrl = `/audio/voiceovers/s1e1/problem-viz.mp3`; // Use existing audio as mock
      
      const newAudio = {
        id: Date.now(),
        provider: selectedProvider,
        voice: selectedVoice,
        voiceInfo: providers[selectedProvider].voices[selectedVoice],
        text: testText,
        url: mockAudioUrl,
        timestamp: new Date().toISOString(),
        duration: Math.round(testText.split(' ').length / 2.5),
        isMock: true
      };
      
      setGeneratedAudios(prev => [newAudio, ...prev]);
      logger.info('TTS audio generated (mock)', { provider: selectedProvider, voice: selectedVoice });
      
    } catch (error) {
      logger.error('TTS generation failed', { error, provider: selectedProvider });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlay = (index) => {
    // Stop all other audios
    Object.values(audioRefs.current).forEach((audio, i) => {
      if (audio && i !== index) {
        audio.pause();
      }
    });

    const audio = audioRefs.current[index];
    if (audio) {
      if (playingIndex === index) {
        audio.pause();
        setPlayingIndex(null);
      } else {
        audio.play();
        setPlayingIndex(index);
      }
    }
  };

  const handleDownload = (audio) => {
    // In real implementation, this would download the actual audio file
    logger.info('Audio download requested', { provider: audio.provider, voice: audio.voice });
  };

  const getProviderColor = (provider) => {
    const colors = {
      'edge-tts': 'from-blue-600 to-cyan-600',
      'gtts': 'from-green-600 to-emerald-600',
      'amazon-polly': 'from-orange-600 to-amber-600',
      'elevenlabs': 'from-purple-600 to-pink-600',
      'coqui-tts': 'from-red-600 to-rose-600',
      'pyttsx3': 'from-gray-600 to-slate-600'
    };
    return colors[provider] || 'from-gray-600 to-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">TTS Voice Testing Lab</h1>
          <p className="text-gray-400 text-lg">
            Compare different Text-to-Speech providers and voices for TechFlix narration
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Provider Selection */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                TTS Provider
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(providers).map(([key, provider]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedProvider(key);
                      setSelectedVoice('');
                    }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedProvider === key
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-sm font-medium">{provider.name}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {Object.keys(provider.voices).length} voices
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Selection */}
            {selectedProvider && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-lg p-6"
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Voice Selection
                </h2>
                <div className="space-y-2">
                  {Object.entries(providers[selectedProvider].voices).map(([key, voice]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedVoice(key)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedVoice === key
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{voice.name}</div>
                          <div className="text-xs text-gray-400">
                            {voice.gender} • {voice.style}
                          </div>
                        </div>
                        {selectedVoice === key && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Test Text */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Test Text</h2>
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="w-full h-32 bg-gray-900 rounded-lg p-4 text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter text to convert to speech..."
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {sampleTexts.map((sample) => (
                  <button
                    key={sample.name}
                    onClick={() => setTestText(sample.text)}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-sm transition-colors"
                  >
                    {sample.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!selectedVoice || !testText.trim() || isGenerating}
              className={`w-full py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                selectedVoice && testText.trim() && !isGenerating
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  : 'bg-gray-700 cursor-not-allowed opacity-50'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5" />
                  Generate Voice-Over
                </>
              )}
            </button>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Generated Voice-Overs</h2>
              
              {generatedAudios.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Volume2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No voice-overs generated yet</p>
                  <p className="text-sm mt-2">Select a provider and voice to get started</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  <AnimatePresence>
                    {generatedAudios.map((audio, index) => (
                      <motion.div
                        key={audio.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-gray-900 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getProviderColor(audio.provider)} text-white`}>
                                {providers[audio.provider].name}
                              </span>
                              <span className="text-sm text-gray-400">
                                {audio.voiceInfo.name}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 line-clamp-2">
                              "{audio.text}"
                            </p>
                            {audio.isMock && (
                              <span className="text-xs text-yellow-500 mt-1">
                                ⚠️ Mock audio (API not available)
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleDownload(audio)}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Audio Player */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handlePlay(index)}
                            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                          >
                            {playingIndex === index ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>
                          <div className="flex-1 bg-gray-800 rounded-full h-2 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-20" />
                            <audio
                              ref={(el) => audioRefs.current[index] = el}
                              src={audio.url}
                              onEnded={() => setPlayingIndex(null)}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            ~{audio.duration}s
                          </span>
                        </div>
                        
                        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                          <span>{new Date(audio.timestamp).toLocaleTimeString()}</span>
                          <span>{audio.voiceInfo.gender} • {audio.voiceInfo.style}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Comparison Tips */}
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-6 border border-blue-800/50">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Voice Selection Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• <strong>Edge TTS:</strong> Best quality-to-cost ratio, neural voices</li>
                <li>• <strong>Google TTS:</strong> Simple, reliable, limited customization</li>
                <li>• <strong>Amazon Polly:</strong> Professional quality, SSML support</li>
                <li>• <strong>ElevenLabs:</strong> Most natural, premium option</li>
                <li>• <strong>Coqui TTS:</strong> Open source, customizable</li>
                <li>• <strong>System TTS:</strong> Offline, varies by OS</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Toggle Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            {showComparison ? 'Hide' : 'Show'} Provider Comparison
          </button>
          <button
            onClick={() => setShowConfiguration(!showConfiguration)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Package className="w-5 h-5" />
            {showConfiguration ? 'Hide' : 'Show'} Configurations
          </button>
        </div>

        {/* Comparison Table */}
        <AnimatePresence>
          {showComparison && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8"
            >
              <TTSComparisonTable />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Configuration Panel */}
        <AnimatePresence>
          {showConfiguration && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8"
            >
              <TTSConfigurationPanel 
                providers={providers}
                onApplyConfig={(config) => {
                  logger.info('Configuration applied from panel', { config });
                  // Handle applying the configuration
                  // This could set multiple voices at once
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Batch Testing Section */}
        <div className="mt-12 bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Batch Voice Testing</h2>
          <p className="text-gray-400 mb-6">
            Test the same text across multiple providers and voices simultaneously
          </p>
          
          <BatchTesting 
            providers={providers}
            testText={testText}
            onGenerate={(results) => setGeneratedAudios(prev => [...results, ...prev])}
          />
        </div>
      </div>
    </div>
  );
};

// Batch Testing Component
const BatchTesting = ({ providers, testText, onGenerate }) => {
  const [selectedBatch, setSelectedBatch] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleBatchSelection = (provider, voice) => {
    const key = `${provider}-${voice}`;
    setSelectedBatch(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const handleBatchGenerate = async () => {
    if (selectedBatch.length === 0 || !testText.trim()) return;
    
    setIsGenerating(true);
    const results = [];
    
    // Simulate batch generation
    for (const selection of selectedBatch) {
      const [provider, voice] = selection.split('-');
      const voiceInfo = providers[provider]?.voices[voice];
      
      if (voiceInfo) {
        // In real implementation, this would call the API
        const mockResult = {
          id: Date.now() + Math.random(),
          provider,
          voice,
          voiceInfo,
          text: testText,
          url: `/audio/voiceovers/s1e1/problem-viz.mp3`,
          timestamp: new Date().toISOString(),
          duration: Math.round(testText.split(' ').length / 2.5),
          isMock: true,
          batchGenerated: true
        };
        results.push(mockResult);
        
        // Small delay between generations
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    onGenerate(results);
    setSelectedBatch([]);
    setIsGenerating(false);
    
    logger.info('Batch TTS generation completed', { count: results.length });
  };

  return (
    <div>
      {/* Quick Select Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => {
            // Select all neural voices
            const neuralVoices = [];
            Object.entries(providers).forEach(([provider, config]) => {
              Object.entries(config.voices).forEach(([voice, info]) => {
                if (info.style === 'neural' || provider === 'edge-tts') {
                  neuralVoices.push(`${provider}-${voice}`);
                }
              });
            });
            setSelectedBatch(neuralVoices);
          }}
          className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg text-sm transition-colors"
        >
          Select All Neural
        </button>
        <button
          onClick={() => {
            // Select one from each provider
            const oneEach = [];
            Object.entries(providers).forEach(([provider, config]) => {
              const firstVoice = Object.keys(config.voices)[0];
              if (firstVoice) {
                oneEach.push(`${provider}-${firstVoice}`);
              }
            });
            setSelectedBatch(oneEach);
          }}
          className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg text-sm transition-colors"
        >
          One Per Provider
        </button>
        <button
          onClick={() => setSelectedBatch([])}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
        >
          Clear Selection
        </button>
      </div>

      {/* Provider Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Object.entries(providers).map(([provider, config]) => (
          <div key={provider} className="bg-gray-900 rounded-lg p-4">
            <h4 className="font-medium mb-3">{config.name}</h4>
            <div className="space-y-2">
              {Object.entries(config.voices).slice(0, 3).map(([voice, info]) => {
                const key = `${provider}-${voice}`;
                const isSelected = selectedBatch.includes(key);
                
                return (
                  <label
                    key={voice}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-600/20' : 'hover:bg-gray-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleBatchSelection(provider, voice)}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm">{info.name}</span>
                    <span className="text-xs text-gray-500">({info.gender})</span>
                  </label>
                );
              })}
              {Object.keys(config.voices).length > 3 && (
                <p className="text-xs text-gray-500 pl-6">
                  +{Object.keys(config.voices).length - 3} more voices
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Generate Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {selectedBatch.length} voice{selectedBatch.length !== 1 ? 's' : ''} selected
        </p>
        <button
          onClick={handleBatchGenerate}
          disabled={selectedBatch.length === 0 || !testText.trim() || isGenerating}
          className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            selectedBatch.length > 0 && testText.trim() && !isGenerating
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
              : 'bg-gray-700 cursor-not-allowed opacity-50'
          }`}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Generating {selectedBatch.length} voices...
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5" />
              Generate Batch
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TTSTestPage;