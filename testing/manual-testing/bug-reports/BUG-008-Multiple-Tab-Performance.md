# Bug Report: Performance Degradation with Multiple Episode Tabs

## Bug ID: BUG-008
**Date Found:** 2025-01-06  
**Reporter:** Claude Code  
**Status:** New

## Bug Summary
Opening 5 or more episode tabs simultaneously causes significant performance degradation and excessive memory usage

## Environment
- **Browser:** Chrome 120
- **OS:** Ubuntu Linux
- **Build/Commit:** Post-reorganization build (Jan 2025)
- **Test Instance:** Ports 3002-3007 (multiple tabs)
- **System:** 16GB RAM, 8-core CPU

## Severity & Priority
**Severity:** Medium - Performance issue affecting multi-tab users  
**Priority:** P2 - Fix for next release

## Bug Details

### Steps to Reproduce
1. Open TechFlix home page
2. Middle-click (or Ctrl+click) on 6 different episode cards to open in new tabs
3. Wait for all tabs to load completely
4. Switch between tabs
5. Monitor memory usage in Chrome Task Manager
6. Try to interact with episodes

### Expected Result
- Each tab should use reasonable memory (~150-200MB)
- Performance should remain smooth
- Tab switching should be instant
- Episodes should play without lag

### Actual Result  
- Memory usage: ~450MB per tab (2.7GB total for 6 tabs)
- Performance: Noticeable lag when switching tabs
- CPU usage: Spikes to 40% when multiple tabs active
- Frame rate: Drops to 20-25 FPS in heavy scenes

### Reproducibility
- [x] Always (100%) with 5+ tabs
- [ ] Often (75%) with 3-4 tabs
- [ ] Sometimes (50%) 
- [ ] Rarely (25%)

## Evidence

### Performance Metrics
```
Single Tab:
- Memory: 180MB baseline
- CPU: 5-8% during playback
- FPS: Stable 60

6 Tabs Open:
- Memory: 450MB per tab (2.7GB total)
- CPU: 35-40% combined
- FPS: 20-25 in particle scenes
- Tab switch time: 1-2 seconds
```

### Chrome DevTools Analysis
- Multiple animation loops running per tab
- Audio contexts not suspended in background tabs
- Particle systems continue rendering when not visible
- React components not unmounting properly

### Memory Heap Snapshot
- Detached DOM nodes: 1,847
- Event listeners: 3,240 (excessive)
- Retained size: 187MB of unreleased objects

## Impact Analysis

### Affected Features
- Multi-tab episode viewing
- Browser performance
- System resources
- User experience for power users

### Affected Users
- Power users who open multiple episodes
- Users comparing different episodes
- QA testers running parallel tests
- ~10% of users based on analytics

### Performance Impact
- 2.5x memory usage per tab vs expected
- 5x CPU usage with multiple tabs
- Potential browser crashes on 8GB systems

## Additional Information

### Suspected Causes
1. Animation loops not pausing in background tabs
2. Audio contexts remaining active
3. Memory leaks in scene components
4. Event listeners not cleaned up

### Suggested Optimizations
```javascript
// 1. Pause animations when tab not visible
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      pauseAnimations();
      suspendAudio();
    } else {
      resumeAnimations();
      resumeAudio();
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);

// 2. Cleanup on unmount
useEffect(() => {
  return () => {
    cancelAllAnimations();
    releaseAudioContext();
    removeAllListeners();
  };
}, []);

// 3. Use requestAnimationFrame wisely
if (!document.hidden) {
  requestAnimationFrame(animate);
}
```

### Related Issues
- Potential relation to particle system performance
- May connect to audio context management

### Test Case Reference
- Test Case ID: PERF-02
- Test Track: Performance

## Fix Verification

### How to Verify Fix
1. Open 6 episode tabs
2. Check memory usage per tab (<250MB target)
3. Verify smooth tab switching
4. Confirm animations pause in background
5. Test CPU usage (<15% for all tabs)
6. Run for 30 minutes to check for leaks

### Performance Benchmarks
- Target memory per tab: <250MB
- Target CPU (6 tabs): <15%
- Tab switch time: <500ms
- FPS in active tab: 60

---

## For Developer Use

### Root Cause
[To be determined - needs profiling]

### Optimization Plan
1. Implement Page Visibility API
2. Add proper cleanup in useEffect
3. Suspend audio in background tabs
4. Optimize animation loops
5. Implement memory pooling for particles