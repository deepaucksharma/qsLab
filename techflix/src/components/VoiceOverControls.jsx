import { Volume2, VolumeX, SkipBack, Pause, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import audioManager from '@utils/audioManager';

const VoiceOverControls = ({ 
  voiceOver,
  className = '',
  minimal = false
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [volume, setVolume] = useState(() => audioManager.voiceOverVolume);
  
  const {
    isPlaying,
    isLoading,
    hasVoiceOver,
    currentTime,
    duration,
    progress,
    play,
    pause,
    toggle,
    restart,
    error
  } = voiceOver || {};
  
  // Don't render if no voice-over available
  if (!hasVoiceOver && !isLoading) {
    return null;
  }
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (minimal) {
    return (
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`vo-control-minimal ${className}`}
        onClick={toggle}
        title={isPlaying ? 'Pause narration' : 'Play narration'}
      >
        {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </motion.button>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`voice-over-controls ${className}`}
    >
      {/* Main container */}
      <div className="vo-controls-container">
        {/* Play/Pause button */}
        <button
          className="vo-play-button"
          onClick={toggle}
          disabled={isLoading || error}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
        
        {/* Progress bar */}
        <div className="vo-progress-container">
          <div className="vo-time">{formatTime(currentTime)}</div>
          <div className="vo-progress-bar">
            <motion.div 
              className="vo-progress-fill"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="vo-time">{formatTime(duration)}</div>
        </div>
        
        {/* Restart button */}
        <button
          className="vo-restart-button"
          onClick={restart}
          disabled={isLoading || error}
          title="Restart narration"
        >
          <SkipBack size={16} />
        </button>
        
        {/* Volume control */}
        <div className="vo-volume-container">
          <button
            className="vo-volume-button"
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            title="Adjust volume"
          >
            <Volume2 size={18} />
          </button>
          
          <AnimatePresence>
            {showVolumeSlider && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="vo-volume-slider"
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => {
                    const newVolume = parseFloat(e.target.value);
                    setVolume(newVolume);
                    audioManager.setVoiceOverVolume(newVolume);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Status indicator */}
        <div className="vo-status">
          {isLoading && <span className="vo-loading">Loading...</span>}
          {error && <span className="vo-error">No audio</span>}
          {hasVoiceOver && !isLoading && !error && (
            <Mic size={16} className="vo-available" />
          )}
        </div>
      </div>
      
      <style jsx>{`
        .voice-over-controls {
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          padding: 12px 16px;
          margin: 16px 0;
        }
        
        .vo-controls-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .vo-play-button,
        .vo-restart-button,
        .vo-volume-button {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 4px;
          padding: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .vo-play-button:hover,
        .vo-restart-button:hover,
        .vo-volume-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .vo-play-button:disabled,
        .vo-restart-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .vo-progress-container {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .vo-time {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          font-family: monospace;
          min-width: 40px;
        }
        
        .vo-progress-bar {
          flex: 1;
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          overflow: hidden;
          cursor: pointer;
        }
        
        .vo-progress-fill {
          height: 100%;
          background: #e50914;
          transition: width 0.1s linear;
        }
        
        .vo-volume-container {
          position: relative;
        }
        
        .vo-volume-slider {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.9);
          padding: 8px;
          border-radius: 4px;
          margin-bottom: 8px;
        }
        
        .vo-volume-slider input {
          width: 100px;
          height: 4px;
          -webkit-appearance: none;
          appearance: none;
          background: rgba(255, 255, 255, 0.2);
          outline: none;
          cursor: pointer;
        }
        
        .vo-volume-slider input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          background: #e50914;
          border-radius: 50%;
          cursor: pointer;
        }
        
        .vo-status {
          display: flex;
          align-items: center;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
        }
        
        .vo-loading {
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        .vo-error {
          color: #ff6b6b;
        }
        
        .vo-available {
          color: #4ecdc4;
        }
        
        /* Minimal version */
        .vo-control-minimal {
          background: rgba(0, 0, 0, 0.7);
          border: none;
          border-radius: 50%;
          padding: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .vo-control-minimal:hover {
          background: rgba(0, 0, 0, 0.9);
          transform: scale(1.1);
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </motion.div>
  );
};

export default VoiceOverControls;