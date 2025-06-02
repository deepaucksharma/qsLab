# Bug Report: BUG002 - Dual Voice-Over Systems Conflict

**Date:** 2025-01-06  
**Reporter:** Manual Test Automation  
**Test Case:** TC002 - Episode Playback  
**Severity:** High (P1)  
**Priority:** Urgent  
**Status:** Open  
**Component:** Audio System / Episode Player  

## Summary
TechFlix has two conflicting voice-over systems running simultaneously, causing potential double audio playback, state management conflicts, and resource issues.

## Environment
- **Affected Episodes:** All episodes, specifically tested on S2E1
- **Components:** NetflixEpisodePlayer.jsx, Scene Components
- **Audio Systems:** audioManager (old) and audioManagerV2 (new)

## Steps to Reproduce
1. Navigate to any episode (e.g., S2E1 - Kafka Share Groups)
2. Start episode playback
3. Monitor network requests for audio files
4. Listen for audio playback issues
5. Check console for audio-related errors

## Expected Behavior
- Single voice-over plays per scene
- Clean audio transitions between scenes
- Consistent volume control
- No duplicate audio file requests

## Actual Behavior
- NetflixEpisodePlayer uses old voice-over system: `audioManager.playVoiceOver(episodeId, sceneId)`
- Scene components use new system: `audioManager.playEpisodeVoiceoverSegment()`
- Both systems may attempt to play audio simultaneously
- Potential for overlapping voice-overs
- Conflicting audio state management

## Code Evidence
```javascript
// NetflixEpisodePlayer.jsx (line ~146)
const handleSceneChange = useCallback((newScene) => {
  if (voiceOverEnabled && episode) {
    audioManager.playVoiceOver(episode.id, newScene.id);
  }
}, [voiceOverEnabled, episode]);

// EvolutionTimelineSceneV2.jsx (line ~78)
useEffect(() => {
  if (progress < 5 && !hasPlayedIntro) {
    audioManager.playEpisodeVoiceoverSegment('evolution-intro', (subtitle) => {
      setCurrentSubtitle(subtitle);
    });
    setHasPlayedIntro(true);
  }
}, [progress, hasPlayedIntro]);
```

## Impact Analysis
- **User Impact:** Confusing audio experience with potential overlapping narration
- **Performance Impact:** Double resource usage for audio playback
- **Development Impact:** Maintaining two systems increases complexity
- **Quality Impact:** Unpredictable audio behavior affects overall experience

## Root Cause
Migration from old to new audio system was not completed. Both systems remain active, creating architectural conflict.

## Recommended Fix
1. **Short-term:** Disable old voice-over system in NetflixEpisodePlayer
2. **Long-term:** Complete migration to new episode audio system
3. Remove all references to old `playVoiceOver` method
4. Update all episodes to use consistent audio system

## Workaround
Users can disable voice-overs entirely to avoid conflicts, but this removes a key feature.

## Related Files
- `/src/components/NetflixEpisodePlayer.jsx`
- `/src/utils/audioManager.js`
- `/src/utils/audioManagerV2.js`
- `/src/hooks/useVoiceOver.js`
- All scene components in `/src/components/scenes/`

## Test Coverage
- No automated tests exist for audio system interaction
- Manual testing required to verify audio playback
- Need integration tests for audio state management

---
**Assignment:** Audio System Team  
**Fix Version:** Target 2.1.0