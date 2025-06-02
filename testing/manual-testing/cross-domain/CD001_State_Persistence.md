# Cross-Domain Test: CD001 - State Persistence & Data Flow
**Test Track:** Cross-Domain Integration  
**Priority:** High  
**Last Updated:** 2025-01-06

## Test Objective
Verify that application state persists correctly across components, pages, and browser sessions. Test data flow between different parts of the application.

## Integration Points
- Zustand store (global state)
- LocalStorage persistence
- Component state synchronization
- Cross-episode data retention
- Settings propagation

## Test Scenarios

### Scenario 1: Episode Progress Tracking

#### Test Steps
1. **Start Episode Journey**
   - Clear all browser data
   - Navigate to home page
   - Start "Kafka Share Groups" (S2E1)
   - Watch until 30% complete
   - Note exact timestamp/scene

2. **Verify Progress Storage**
   - Open DevTools > Application > LocalStorage
   - Look for progress keys
   - Document stored values
   - Take screenshot of storage

3. **Navigate Away and Return**
   - Click back to home
   - Verify episode shows progress indicator
   - Click same episode again
   - Verify resumes from saved position

4. **Cross-Episode Progress**
   - Start different episode
   - Progress to 50%
   - Return to home
   - Verify both episodes show progress

5. **Browser Refresh Test**
   - While in episode, refresh page
   - Check if progress maintained
   - Check if settings preserved

**Expected Results:**
- [ ] Progress saves automatically
- [ ] LocalStorage contains progress data
- [ ] Home page shows progress bars
- [ ] Resume works correctly
- [ ] Multiple episode progress tracked
- [ ] Refresh maintains state

**Pass/Fail:** [ ]

### Scenario 2: Audio Settings Persistence

#### Test Steps
1. **Configure Audio Settings**
   - Set volume to 30%
   - Turn VoiceOver OFF
   - Take screenshot of settings

2. **Test Across Episodes**
   - Navigate to Episode 1
   - Verify volume is 30%
   - Verify VoiceOver is OFF
   - Navigate to Episode 2
   - Check settings maintained

3. **Page Refresh Persistence**
   - Refresh browser (F5)
   - Check volume still 30%
   - Check VoiceOver still OFF

4. **New Session Test**
   - Close browser completely
   - Reopen and navigate to app
   - Check if settings restored

**Expected Results:**
- [ ] Volume persists across episodes
- [ ] VoiceOver state maintained
- [ ] Settings survive refresh
- [ ] Settings restore in new session
- [ ] UI reflects saved state

**Pass/Fail:** [ ]

### Scenario 3: Quiz/Interaction State

#### Test Steps
1. **Complete Partial Quiz**
   - Navigate to episode with quiz
   - Answer first question
   - Don't complete quiz
   - Navigate away

2. **Return to Quiz**
   - Go back to same episode
   - Navigate to quiz scene
   - Check if answer remembered

3. **Complete Different Path**
   - Take different decision branch
   - Complete that path
   - Check state consistency

4. **Mixed State Test**
   - Have quiz answered in Ep1
   - Have quiz unanswered in Ep2
   - Verify independent tracking

**Expected Results:**
- [ ] Quiz answers persist
- [ ] Can resume incomplete quiz
- [ ] Branch decisions remembered
- [ ] Independent episode states
- [ ] No state contamination

**Pass/Fail:** [ ]

### Scenario 4: Global State Synchronization

#### Test Steps
1. **Multi-Component State**
   - Open debug panel
   - Inspect global state
   - Change episode in player
   - Verify state updates everywhere

2. **State Update Propagation**
   - Complete an episode
   - Check home page updates
   - Check continue watching
   - Verify all components sync

3. **Concurrent Updates**
   - Open app in two tabs
   - Make changes in tab 1
   - Switch to tab 2
   - Check for conflicts

**Expected Results:**
- [ ] State updates propagate
- [ ] Components stay in sync
- [ ] No stale data shown
- [ ] Multi-tab handling works
- [ ] State conflicts resolved

**Pass/Fail:** [ ]

### Scenario 5: Error Recovery & State

#### Test Steps
1. **Simulate State Corruption**
   - Manually edit localStorage
   - Add invalid data
   - Reload application
   - Check error handling

2. **Partial State Loss**
   - Delete some localStorage keys
   - Keep others intact
   - Reload and verify behavior

3. **State Migration**
   - If app version changes
   - Check old state compatibility
   - Verify migration logic

**Expected Results:**
- [ ] App handles corrupt state
- [ ] Partial state recovered
- [ ] No crashes on bad data
- [ ] Graceful degradation
- [ ] User notified if needed

**Pass/Fail:** [ ]

## Integration Test Matrix

| Component | Writes State | Reads State | Storage Key | Sync Required |
|-----------|--------------|-------------|-------------|---------------|
| Episode Player | Progress, Quiz | Progress | episode_progress | Yes |
| Audio Controls | Volume, VO | Volume, VO | audio_settings | Yes |
| Home Page | - | Progress | episode_progress | Yes |
| Debug Panel | - | All | * | Read-only |

## State Inspection Checklist

### LocalStorage Keys
- [ ] episode_progress_*
- [ ] audio_settings
- [ ] user_preferences
- [ ] debug_enabled
- [ ] last_watched

### Zustand Store
- [ ] currentEpisode
- [ ] currentScene  
- [ ] playbackState
- [ ] userProgress
- [ ] globalSettings

### Data Validation
- [ ] JSON properly formatted
- [ ] No undefined values
- [ ] Timestamps valid
- [ ] Arrays/objects intact
- [ ] No memory leaks

## Performance Considerations
- [ ] State updates don't lag UI
- [ ] Storage writes are batched
- [ ] No excessive re-renders
- [ ] Memory usage stable
- [ ] Quick state restoration

## Test Evidence
- [ ] LocalStorage screenshots
- [ ] State tree snapshots
- [ ] Progress tracking proof
- [ ] Settings persistence demo
- [ ] Error handling examples

## Common Integration Issues
- [ ] State not persisting
- [ ] Stale data displayed
- [ ] Race conditions
- [ ] Storage quota exceeded
- [ ] Cross-tab conflicts
- [ ] Migration failures

## Notes
_Document any state management issues, suggestions for improvement, or edge cases discovered_

_______________

## Test Result Summary
**Overall Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Tester Name:** _________________  
**Date Tested:** _________________  
**Build Version:** _________________

**Integration Issues Found:**
- Issue #: _________________
- Issue #: _________________

**State Management Quality:**
- Persistence: _____ / 10
- Synchronization: _____ / 10
- Error Handling: _____ / 10