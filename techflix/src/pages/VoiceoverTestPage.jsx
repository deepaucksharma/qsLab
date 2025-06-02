import React, { useState, useEffect } from 'react';
import audioManager from '../utils/audioManager';

const EPISODES = ['s1e1', 's1e2', 's2e1', 's2e2', 's2e3', 's2e4', 's3e3'];

function VoiceoverTestPage() {
  const [selectedEpisode, setSelectedEpisode] = useState('s2e1');
  const [episodeData, setEpisodeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(null);
  const [manifest, setManifest] = useState(null);

  // Load manifest on mount
  useEffect(() => {
    fetch('/audio/voiceovers/manifest.json')
      .then(res => res.json())
      .then(data => setManifest(data))
      .catch(err => console.error('Failed to load manifest:', err));
  }, []);

  // Load episode data when selected
  useEffect(() => {
    if (selectedEpisode) {
      setLoading(true);
      fetch(`/audio/voiceovers/${selectedEpisode}/metadata.json`)
        .then(res => res.json())
        .then(data => {
          setEpisodeData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load episode metadata:', err);
          setLoading(false);
        });
    }
  }, [selectedEpisode]);

  const playSegment = async (segmentId) => {
    try {
      // Load episode audio if not already loaded
      await audioManager.loadEpisodeAudio(selectedEpisode);
      
      // Play the segment
      audioManager.playEpisodeVoiceoverSegment(segmentId, {
        callbacks: {
          onPlay: () => setPlaying(segmentId),
          onEnded: () => setPlaying(null),
          onError: (err) => {
            console.error('Playback error:', err);
            setPlaying(null);
          }
        }
      });
    } catch (error) {
      console.error('Failed to play segment:', error);
    }
  };

  const stopPlayback = () => {
    audioManager.stopEpisodeVoiceoverSegment();
    setPlaying(null);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">TechFlix Voiceover Test Page</h1>
        
        {/* Manifest Info */}
        {manifest && (
          <div className="bg-gray-900 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Generation Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-400">Provider</p>
                <p className="text-xl">{manifest.provider}</p>
              </div>
              <div>
                <p className="text-gray-400">Total Segments</p>
                <p className="text-xl">{manifest.statistics.total_segments}</p>
              </div>
              <div>
                <p className="text-gray-400">Generated</p>
                <p className="text-xl text-green-400">{manifest.statistics.generated}</p>
              </div>
              <div>
                <p className="text-gray-400">Generation Time</p>
                <p className="text-xl">{manifest.statistics.duration}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-gray-400">Voices Used</p>
              <p className="text-sm">{manifest.voices_used.join(', ')}</p>
            </div>
          </div>
        )}

        {/* Episode Selector */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Select Episode</h2>
          <div className="flex flex-wrap gap-2">
            {EPISODES.map(ep => (
              <button
                key={ep}
                onClick={() => setSelectedEpisode(ep)}
                className={`px-6 py-3 rounded-lg transition-all ${
                  selectedEpisode === ep
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {ep.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Episode Content */}
        {loading && <p className="text-center py-8">Loading episode data...</p>}
        
        {episodeData && !loading && (
          <div>
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-2">{episodeData.title}</h2>
              <p className="text-gray-400">
                Episode ID: {episodeData.episode_id} | 
                Segments: {episodeData.segments.length} | 
                Generated: {episodeData.generated}
              </p>
            </div>

            <div className="space-y-4">
              {episodeData.segments.map((segment) => (
                <div
                  key={segment.id}
                  className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{segment.id}</h3>
                      <p className="text-sm text-gray-400 mb-2">
                        Voice: {segment.voice} | Rate: {segment.rate} | Pitch: {segment.pitch}
                      </p>
                    </div>
                    <button
                      onClick={() => playing === segment.id ? stopPlayback() : playSegment(segment.id)}
                      className={`px-6 py-2 rounded-lg font-medium transition-all ${
                        playing === segment.id
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {playing === segment.id ? 'Stop' : 'Play'}
                    </button>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{segment.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VoiceoverTestPage;