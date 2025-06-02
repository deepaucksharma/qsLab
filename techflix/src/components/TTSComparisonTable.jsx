import React from 'react';
import { Check, X, AlertCircle, DollarSign, Wifi, WifiOff, Cpu, Volume2 } from 'lucide-react';

const TTSComparisonTable = () => {
  const providers = [
    {
      name: 'Microsoft Edge TTS',
      quality: 5,
      cost: 'Free',
      offline: false,
      setup: 'npm install -g edge-tts',
      voices: '300+',
      languages: '40+',
      features: ['Neural voices', 'SSML support', 'Voice styles', 'Pitch/rate control'],
      pros: ['High quality', 'Many voices', 'Free', 'Easy setup'],
      cons: ['Requires internet', 'Microsoft dependency'],
      bestFor: 'Production use, variety of voices'
    },
    {
      name: 'Google TTS (gTTS)',
      quality: 3,
      cost: 'Free',
      offline: false,
      setup: 'pip install gtts',
      voices: '1 per language',
      languages: '30+',
      features: ['Simple API', 'Multiple languages', 'Slow mode'],
      pros: ['Very simple', 'Reliable', 'Free'],
      cons: ['Limited customization', 'One voice per language', 'Requires internet'],
      bestFor: 'Quick prototypes, simple needs'
    },
    {
      name: 'Amazon Polly',
      quality: 5,
      cost: '$4 per 1M chars',
      offline: false,
      setup: 'AWS account + SDK',
      voices: '60+',
      languages: '30+',
      features: ['Neural voices', 'SSML support', 'Lexicons', 'Speech marks'],
      pros: ['Professional quality', 'Scalable', 'Many features', 'SLA'],
      cons: ['Costs money', 'AWS complexity', 'Setup required'],
      bestFor: 'Enterprise production'
    },
    {
      name: 'ElevenLabs',
      quality: 5,
      cost: '$5/month starter',
      offline: false,
      setup: 'API key required',
      voices: '120+',
      languages: '29',
      features: ['Voice cloning', 'Emotion control', 'Ultra realistic', 'Voice design'],
      pros: ['Most natural', 'Voice cloning', 'Emotion control'],
      cons: ['Expensive', 'Limited free tier', 'API limits'],
      bestFor: 'Premium content, voice acting'
    },
    {
      name: 'Coqui TTS',
      quality: 4,
      cost: 'Free (OSS)',
      offline: true,
      setup: 'pip install TTS',
      voices: 'Model dependent',
      languages: '20+',
      features: ['Open source', 'Voice cloning', 'Custom training', 'Many models'],
      pros: ['Fully offline', 'Customizable', 'Free', 'Privacy'],
      cons: ['Large models', 'Setup complexity', 'Resource heavy'],
      bestFor: 'Offline use, customization'
    },
    {
      name: 'System TTS (pyttsx3)',
      quality: 2,
      cost: 'Free',
      offline: true,
      setup: 'pip install pyttsx3',
      voices: 'OS dependent',
      languages: 'OS dependent',
      features: ['Offline', 'System voices', 'Rate/volume control'],
      pros: ['Works offline', 'No API needed', 'Lightweight'],
      cons: ['Basic quality', 'OS dependent', 'Limited voices'],
      bestFor: 'Offline fallback, testing'
    }
  ];

  const getQualityStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-600'}>
        ★
      </span>
    ));
  };

  const getFeatureIcon = (feature) => {
    if (feature.includes('offline')) return <WifiOff className="w-4 h-4" />;
    if (feature.includes('Neural') || feature.includes('quality')) return <Cpu className="w-4 h-4" />;
    if (feature.includes('Voice') || feature.includes('voices')) return <Volume2 className="w-4 h-4" />;
    if (feature.includes('Free') || feature.includes('cost')) return <DollarSign className="w-4 h-4" />;
    return <Check className="w-4 h-4" />;
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">TTS Provider Comparison</h2>
        
        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4">Provider</th>
                <th className="text-center py-3 px-4">Quality</th>
                <th className="text-center py-3 px-4">Cost</th>
                <th className="text-center py-3 px-4">Offline</th>
                <th className="text-center py-3 px-4">Voices</th>
                <th className="text-center py-3 px-4">Languages</th>
                <th className="text-left py-3 px-4">Best For</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((provider, index) => (
                <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-medium">{provider.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{provider.setup}</div>
                  </td>
                  <td className="text-center py-4 px-4">
                    <div className="flex justify-center">
                      {getQualityStars(provider.quality)}
                    </div>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className={`text-sm ${provider.cost === 'Free' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {provider.cost}
                    </span>
                  </td>
                  <td className="text-center py-4 px-4">
                    {provider.offline ? (
                      <WifiOff className="w-5 h-5 text-green-400 mx-auto" />
                    ) : (
                      <Wifi className="w-5 h-5 text-blue-400 mx-auto" />
                    )}
                  </td>
                  <td className="text-center py-4 px-4">{provider.voices}</td>
                  <td className="text-center py-4 px-4">{provider.languages}</td>
                  <td className="py-4 px-4 text-sm text-gray-300">{provider.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detailed Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {providers.map((provider, index) => (
            <div key={index} className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{provider.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getQualityStars(provider.quality)}
                    <span className="text-sm text-gray-400">({provider.quality}/5)</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  provider.cost === 'Free' ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'
                }`}>
                  {provider.cost}
                </span>
              </div>

              {/* Features */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Features</h4>
                <div className="flex flex-wrap gap-2">
                  {provider.features.map((feature, idx) => (
                    <span key={idx} className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded text-xs">
                      {getFeatureIcon(feature)}
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-green-400 mb-2">Pros</h4>
                  <ul className="space-y-1">
                    {provider.pros.map((pro, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                        <Check className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-red-400 mb-2">Cons</h4>
                  <ul className="space-y-1">
                    {provider.cons.map((con, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                        <X className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Setup */}
              <div className="pt-4 border-t border-gray-800">
                <code className="text-xs bg-gray-800 px-2 py-1 rounded">
                  {provider.setup}
                </code>
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-800/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Recommendations
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="font-medium text-blue-400">For TechFlix:</span>
              <span className="text-gray-300">
                Continue using <strong>Edge TTS</strong> for the best balance of quality, features, and cost.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-medium text-green-400">For Offline:</span>
              <span className="text-gray-300">
                Use <strong>Coqui TTS</strong> for high-quality offline generation with customization options.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-medium text-purple-400">For Premium:</span>
              <span className="text-gray-300">
                Consider <strong>ElevenLabs</strong> for the most natural-sounding voices with emotion control.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-medium text-yellow-400">For Scale:</span>
              <span className="text-gray-300">
                Use <strong>Amazon Polly</strong> for enterprise-grade reliability and SLA guarantees.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TTSComparisonTable;