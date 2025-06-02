# Sound Effects Guide

TechFlix includes Netflix-style sound effects for an immersive viewing experience.

## Features

### 1. Netflix "Ta-Dum" Sound
Plays when episodes load, creating the iconic Netflix experience.

### 2. UI Sound Effects
- **Click sounds** - Subtle feedback for button clicks
- **Hover sounds** - Gentle audio cue when hovering over interactive elements
- **Transition sounds** - Smooth whoosh effects for scene changes
- **Success/Error sounds** - Audio feedback for quiz interactions

### 3. Sound Control
- Mute/unmute button in the header
- Preferences saved to localStorage
- Respects user's audio preferences

## Implementation

### Using Sound Effects in Components

```javascript
import { useAudio } from '@hooks/useAudio'

const MyComponent = () => {
  const { playClick, playHover, playTaDum } = useAudio()
  
  return (
    <button 
      onClick={async () => {
        await playClick()
        // Your action here
      }}
      onMouseEnter={playHover}
    >
      Click Me
    </button>
  )
}
```

### Available Hooks

#### `useAudio()`
Main hook providing all sound functions:
- `playTaDum()` - Netflix ta-dum sound
- `playClick()` - Button click sound
- `playHover()` - Hover sound
- `playTransition()` - Page/scene transition
- `playSuccess()` - Success feedback
- `playError()` - Error feedback
- `setEnabled(boolean)` - Enable/disable sounds
- `setVolume(0-1)` - Set master volume

#### `useClickSound()`
Wrapper for click handlers:
```javascript
const withClickSound = useClickSound()
<button onClick={withClickSound(handleClick)}>Click</button>
```

#### `useHoverSound()`
Returns hover props:
```javascript
const hoverProps = useHoverSound()
<div {...hoverProps}>Hover me</div>
```

#### `useEpisodeLoadSound(isLoading)`
Automatically plays ta-dum when episode loads:
```javascript
useEpisodeLoadSound(isEpisodeLoading)
```

## Sound Files

Place sound files in `/public/sounds/`:

### Required Files
- `netflix-tadum.mp3` - The iconic "ta-dum" (2-3 seconds)
- `click.mp3` - Button click (< 0.5 seconds)
- `hover.mp3` - Hover effect (< 0.2 seconds)
- `whoosh.mp3` - Transition sound (1-2 seconds)
- `episode-start.mp3` - Episode start fanfare
- `success.mp3` - Success/correct sound
- `error.mp3` - Error/incorrect sound
- `transition.mp3` - Scene transition
- `scene-change.mp3` - Scene change notification

### Fallback System
If sound files are missing, the app uses Web Audio API to generate placeholder sounds:
- Synthesized ta-dum using two notes (D3 → A2)
- Simple sine wave clicks and hovers
- White noise whoosh effects
- Major chord for success, dissonant interval for errors

## Technical Details

### Audio Manager (`/src/utils/audioManager.js`)
- Singleton pattern for global audio control
- Preloads all sounds on first user interaction
- Handles browser autoplay policies
- Saves user preferences to localStorage

### Sound Generator (`/src/utils/soundGenerator.js`)
- Web Audio API fallback system
- Generates placeholder sounds programmatically
- No external dependencies required

### Browser Compatibility
- Uses Web Audio API (supported in all modern browsers)
- Graceful degradation if audio not supported
- Respects browser autoplay policies

## Best Practices

1. **Performance**: Sounds are preloaded and cached
2. **User Experience**: Sounds are subtle and non-intrusive
3. **Accessibility**: All sounds can be disabled
4. **Mobile**: Works with touch events
5. **Loading**: Waits for user interaction before initializing

## Customization

### Volume Levels
Default volumes are set for each sound type:
- Ta-dum: 80%
- Clicks: 30%
- Hovers: 20%
- Transitions: 40%

### Creating Custom Sounds
1. Keep files small (< 100KB each)
2. Use MP3 format for compatibility
3. Normalize audio to -12dB
4. Fade in/out to prevent pops

## Troubleshooting

### No Sound Playing
1. Check if sounds are enabled (sound icon in header)
2. Ensure browser allows audio playback
3. Check console for loading errors
4. Verify sound files exist in `/public/sounds/`

### Delayed Sound
- First sound may be delayed due to audio context initialization
- Subsequent sounds should play instantly

### Mobile Issues
- Some mobile browsers require user interaction before playing audio
- The system waits for first tap/click before initializing