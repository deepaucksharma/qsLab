import { useEffect, useCallback } from 'react';

/**
 * Hook for keyboard navigation in the episode player
 * Implements standard media player keyboard shortcuts
 */
export const useKeyboardNavigation = ({
  isPlaying,
  onPlayPause,
  onSeekForward,
  onSeekBackward,
  onVolumeUp,
  onVolumeDown,
  onToggleFullscreen,
  onToggleCaptions,
  enabled = true
}) => {
  const handleKeyPress = useCallback((event) => {
    if (!enabled) return;
    
    // Ignore if user is typing in an input field
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    switch (event.key) {
      case ' ':
      case 'k':
        // Space or K - Play/Pause
        event.preventDefault();
        onPlayPause?.();
        break;
        
      case 'ArrowLeft':
        // Left arrow - Seek backward 10s
        event.preventDefault();
        onSeekBackward?.();
        break;
        
      case 'ArrowRight':
        // Right arrow - Seek forward 10s
        event.preventDefault();
        onSeekForward?.();
        break;
        
      case 'ArrowUp':
        // Up arrow - Volume up
        event.preventDefault();
        onVolumeUp?.();
        break;
        
      case 'ArrowDown':
        // Down arrow - Volume down
        event.preventDefault();
        onVolumeDown?.();
        break;
        
      case 'f':
        // F - Toggle fullscreen
        event.preventDefault();
        onToggleFullscreen?.();
        break;
        
      case 'c':
        // C - Toggle captions
        event.preventDefault();
        onToggleCaptions?.();
        break;
        
      case 'Home':
        // Home - Go to beginning
        event.preventDefault();
        onSeekBackward?.(Infinity);
        break;
        
      case 'End':
        // End - Go to end
        event.preventDefault();
        onSeekForward?.(Infinity);
        break;
        
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        // Number keys - Seek to percentage
        event.preventDefault();
        const percentage = parseInt(event.key) * 10;
        // This would need a seekToPercentage callback
        break;
        
      default:
        break;
    }
  }, [enabled, onPlayPause, onSeekForward, onSeekBackward, onVolumeUp, onVolumeDown, onToggleFullscreen, onToggleCaptions]);

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyPress);
      return () => {
        window.removeEventListener('keydown', handleKeyPress);
      };
    }
  }, [enabled, handleKeyPress]);

  return {
    handleKeyPress
  };
};