# Audio System Comprehensive Refactoring Plan

## Current State Analysis

### File Structure Issues
1. **Mixed Paths**: 
   - Voiceovers in `/public/audio/voiceovers/`
   - Effects in `/public/sounds/effects/`
   - README in `/public/sounds/`

2. **Code Issues**:
   - `audioManager.js` has both old (deprecated) and new voiceover systems
   - Path references are inconsistent
   - Some components may still use old methods

3. **Script Issues**:
   - Scripts generate files to `/sounds/` instead of `/audio/`
   - Documentation references old paths

## Refactoring Steps

### Step 1: Consolidate File Structure
```
public/
└── audio/
    ├── README.md (moved from sounds/)
    ├── system/ (general system sounds)
    │   ├── netflix-tadum.mp3
    │   ├── click.mp3
    │   ├── hover.mp3
    │   ├── whoosh.mp3
    │   ├── success.mp3
    │   ├── error.mp3
    │   ├── transition.mp3
    │   ├── episode-start.mp3
    │   └── scene-change.mp3
    ├── voiceovers/
    │   ├── index.json
    │   ├── s1e1/
    │   ├── s1e2/
    │   ├── s2e1/
    │   └── s3e3/
    └── effects/
        └── s2e1/
            ├── sound-library.json
            ├── tech-atmosphere.mp3
            ├── data-flow.mp3
            └── ... (other effects)
```

### Step 2: Update Code References

#### audioManager.js Updates
1. Remove all deprecated methods (old voiceover system)
2. Update all paths to use `/audio/`
3. Simplify the API

#### Component Updates
1. Ensure all components use new methods:
   - `loadEpisodeAudio()`
   - `playEpisodeVoiceoverSegment()`
   - `playEpisodeEffect()`

### Step 3: Update Scripts
1. `generate-voiceovers-s2e1.py` - output to `/audio/voiceovers/`
2. `setup-s2e1-audio.sh` - create directories under `/audio/`
3. `generate-sound-effects.html` - reference `/audio/effects/`

### Step 4: Clean API Surface

#### Simplified audioManager API:
```javascript
// System sounds
audioManager.playTaDum()
audioManager.playClick()
audioManager.playHover()
// ... etc

// Episode audio
audioManager.loadEpisodeAudio(episodeId)
audioManager.playVoiceover(segmentId, options)
audioManager.playEffect(effectName, options)
audioManager.playAmbient(ambientName, options)
audioManager.stopAllEffects()
audioManager.cleanup()

// Controls
audioManager.setEnabled(enabled)
audioManager.setVolume(volume)
audioManager.setVoiceoverEnabled(enabled)
audioManager.setSubtitleCallback(callback)
```

## Implementation Order

1. **Move files** to consolidated structure
2. **Update audioManager.js** - remove deprecated code, fix paths
3. **Update all components** using audio
4. **Update scripts** for new paths
5. **Update documentation**
6. **Test everything**

## Benefits

1. **Cleaner Structure**: Single `/audio/` directory for all audio assets
2. **Simpler API**: No confusion between old/new methods
3. **Consistent Paths**: Everything uses `/audio/`
4. **Better Maintenance**: Easier to understand and modify
5. **Performance**: Less code, cleaner execution paths