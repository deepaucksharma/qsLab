# Bug Report: BUG003 - Scene Audio Cleanup Affects All Scenes

**Date:** 2025-01-06  
**Reporter:** Manual Test Automation  
**Test Case:** TC002 - Episode Playback  
**Severity:** High (P1)  
**Priority:** High  
**Status:** Open  
**Component:** Audio System / Scene Components  

## Summary
Scene components incorrectly clear ALL episode audio on unmount instead of just their own audio, causing audio to stop during scene transitions and breaking the playback experience.

## Environment
- **Affected Components:** All scene components using audioManagerV2
- **Specific Example:** EvolutionTimelineSceneV2.jsx
- **Impact:** All episodes with scene transitions

## Steps to Reproduce
1. Start episode S2E1 playback
2. Let first scene play with voice-over
3. Wait for automatic transition to second scene
4. Observe that all audio stops, including background music
5. Check console for audio cleanup logs

## Expected Behavior
- Scene transitions should be seamless
- Only scene-specific audio should be cleaned up
- Background music and next scene's audio should continue
- No audio interruption during transitions

## Actual Behavior
- When a scene unmounts, it calls `audioManager.cleanupEpisodeAudio()`
- This clears ALL loaded episode audio, not just the current scene
- Next scene's audio fails to play or must reload
- Creates jarring audio gaps during transitions

## Code Evidence
```javascript
// EvolutionTimelineSceneV2.jsx (line ~129)
useEffect(() => {
  // Load episode audio on mount
  const loadAudio = async () => {
    try {
      await audioManager.loadEpisodeAudio('s2e1');
    } catch (error) {
      console.error('Failed to load episode audio:', error);
    }
  };
  
  loadAudio();
  
  // Cleanup on unmount - THIS IS THE PROBLEM
  return () => {
    audioManager.cleanupEpisodeAudio();
  };
}, []);
```

## Impact Analysis
- **User Impact:** Broken audio experience with gaps between scenes
- **Quality Impact:** Professional presentation compromised
- **Performance Impact:** Audio may need to reload multiple times
- **Engagement Impact:** Audio interruptions break immersion

## Root Cause
The audio cleanup logic doesn't differentiate between scene-specific audio and episode-wide audio. The `cleanupEpisodeAudio()` method is too broad.

## Recommended Fix
1. Implement scene-specific audio cleanup:
   ```javascript
   audioManager.cleanupSceneAudio(sceneId);
   ```
2. Track audio resources by scene
3. Only cleanup audio specific to the unmounting scene
4. Keep episode-wide audio (like background music) active

## Alternative Solutions
1. Move audio lifecycle management to NetflixEpisodePlayer
2. Implement reference counting for audio resources
3. Use audio pools that persist across scenes

## Workaround
None available - this is a core architectural issue.

## Related Issues
- BUG002: Dual Voice-Over Systems (compounds this issue)
- May affect subtitle synchronization
- Could impact memory management

## Test Scenarios
1. Scene transition during voice-over playback
2. Quick scene navigation (jumping between scenes)
3. Episode with background music across scenes
4. Memory usage during long episodes

## Regression Risk
High - fixing this requires changes to core audio architecture

---
**Assignment:** Audio System Team  
**Fix Version:** Target 2.1.0  
**Dependencies:** Should be fixed alongside BUG002