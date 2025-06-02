# Exploratory Testing Charters
**Last Updated:** 2025-01-06  
**Version:** 1.0

## Overview

Exploratory testing charters provide focused missions for time-boxed testing sessions. Each charter has a specific goal but allows testers freedom in how they explore. Sessions typically run 60-90 minutes.

## Charter Template

```
Charter: [Name]
Mission: [What to explore]
Areas: [Components/Features to focus on]
Duration: [Time limit]
Approach: [Testing techniques to use]
Risks: [What might break]
Notes: [Observations and findings]
```

## Multimedia Stress Testing Charters

### Charter: Audio Torture Test
**Mission:** Break the audio system through extreme usage  
**Duration:** 60 minutes  
**Areas:** Audio controls, VoiceOver, volume management  

**Test Ideas:**
- [ ] Rapidly toggle VoiceOver 50+ times
- [ ] Drag volume slider continuously for 30 seconds
- [ ] Mute/unmute during scene transitions
- [ ] Open multiple tabs with audio playing
- [ ] Change volume during different audio states
- [ ] Test with system volume at 0% and 100%
- [ ] Toggle audio during buffering
- [ ] Kill audio process (if possible) and recover

**Risk Areas:**
- Memory leaks from audio contexts
- Audio channel conflicts
- State synchronization issues
- Performance degradation

**Session Notes:**
_____________________________________

### Charter: Animation Performance Hunt
**Mission:** Find performance bottlenecks in animations  
**Duration:** 90 minutes  
**Areas:** Scene transitions, particle effects, UI animations  

**Test Ideas:**
- [ ] Open debug panel during heavy animations
- [ ] Trigger multiple animations simultaneously
- [ ] Test on CPU throttled to 4x slowdown
- [ ] Rapidly navigate between particle scenes
- [ ] Zoom browser to 200% during animations
- [ ] Test with hardware acceleration disabled
- [ ] Leave animations running for extended time
- [ ] Background the tab during animations

**Risk Areas:**
- FPS drops below 30
- Memory accumulation
- GPU process crashes
- Janky transitions

**Session Notes:**
_____________________________________

## Navigation Chaos Testing

### Charter: History Hacking
**Mission:** Break the app through unconventional navigation  
**Duration:** 60 minutes  
**Areas:** Browser history, routing, state management  

**Test Ideas:**
- [ ] Use browser dev tools to manipulate history
- [ ] Bookmark mid-episode URLs and revisit
- [ ] Navigate with keyboard shortcuts only
- [ ] Open 10+ episodes in tabs simultaneously
- [ ] Use browser's "Recently Closed" to reopen
- [ ] Test with browser history disabled
- [ ] Clear history while app is running
- [ ] Navigate during JavaScript errors

**Risk Areas:**
- Routing loops
- State corruption
- Memory exhaustion
- Lost user progress

**Session Notes:**
_____________________________________

### Charter: Speed Clicking Marathon
**Mission:** Test UI stability under rapid interaction  
**Duration:** 45 minutes  
**Areas:** All clickable elements  

**Test Ideas:**
- [ ] Click episode cards as fast as possible
- [ ] Double/triple click everything
- [ ] Click during loading states
- [ ] Spam keyboard shortcuts
- [ ] Click-drag across buttons
- [ ] Right-click on interactive elements
- [ ] Middle-click for new tabs
- [ ] Touch simulation rapid taps

**Risk Areas:**
- Race conditions
- Multiple navigations
- State inconsistency
- UI freezing

**Session Notes:**
_____________________________________

## Edge Case Exploration

### Charter: Storage Limit Explorer
**Mission:** Test behavior at storage boundaries  
**Duration:** 75 minutes  
**Areas:** LocalStorage, state persistence  

**Test Ideas:**
- [ ] Fill localStorage near quota
- [ ] Corrupt localStorage data manually
- [ ] Delete random storage keys
- [ ] Test with cookies/storage blocked
- [ ] Use incognito/private mode
- [ ] Clear storage during episode
- [ ] Test with storage full
- [ ] Simulate quota exceeded errors

**Risk Areas:**
- Data loss
- App initialization failures
- Persistent errors
- Poor error messages

**Session Notes:**
_____________________________________

### Charter: The Time Traveler
**Mission:** Test time-based features and long sessions  
**Duration:** 2 hours (checking periodically)  
**Areas:** Progress tracking, session management  

**Test Ideas:**
- [ ] Change system clock during playback
- [ ] Leave episode paused for 1 hour
- [ ] Test after laptop sleep/wake
- [ ] Simulate daylight savings change
- [ ] Test with very slow playback
- [ ] Leave app open for 24 hours
- [ ] Test session timeout handling
- [ ] Check timestamp displays

**Risk Areas:**
- Progress calculation errors
- Session expiry issues
- Memory growth over time
- Sync problems

**Session Notes:**
_____________________________________

## User Persona Testing

### Charter: The Impatient User
**Mission:** Act like someone in a huge hurry  
**Duration:** 45 minutes  
**Areas:** All features  

**Test Ideas:**
- [ ] Skip through content rapidly
- [ ] Click next before things load
- [ ] Close videos immediately
- [ ] Answer quizzes without reading
- [ ] Navigate away during saves
- [ ] Refresh constantly
- [ ] Use all shortcuts
- [ ] Expect instant everything

**Risk Areas:**
- Incomplete operations
- Race conditions
- Poor loading states
- Confusing feedback

**Session Notes:**
_____________________________________

### Charter: The Confused Newcomer
**Mission:** Approach app with zero context  
**Duration:** 60 minutes  
**Areas:** Onboarding, UI clarity  

**Test Ideas:**
- [ ] Click unexpected things
- [ ] Ignore obvious paths
- [ ] Misinterpret UI elements
- [ ] Look for help everywhere
- [ ] Try to break out of flows
- [ ] Question every message
- [ ] Assume different mental models
- [ ] Get lost and try to recover

**Risk Areas:**
- Poor onboarding
- Unclear navigation
- Missing help text
- Confusing states

**Session Notes:**
_____________________________________

## Technical Deep Dives

### Charter: Console Error Detective
**Mission:** Trigger and catalog all possible errors  
**Duration:** 90 minutes  
**Areas:** All features with console open  

**Test Ideas:**
- [ ] Note all warnings/errors
- [ ] Try to trigger each error type
- [ ] Test error recovery
- [ ] Check error messages clarity
- [ ] Look for security warnings
- [ ] Find deprecation warnings
- [ ] Test with strict mode
- [ ] Enable all debug flags

**Risk Areas:**
- Unhandled exceptions
- Security vulnerabilities
- Poor error handling
- Memory leaks

**Session Notes:**
_____________________________________

### Charter: Mobile Viewport Simulator
**Mission:** Test desktop app at mobile sizes  
**Duration:** 60 minutes  
**Areas:** Responsive behavior  

**Test Ideas:**
- [ ] Shrink to 375px width
- [ ] Test portrait orientations
- [ ] Simulate touch events
- [ ] Test with touch + mouse
- [ ] Zoom to 300%
- [ ] Test virtual keyboard
- [ ] Check touch targets
- [ ] Test gesture support

**Risk Areas:**
- Layout breaks
- Unusable controls
- Hidden content
- Touch conflicts

**Session Notes:**
_____________________________________

## Session Reporting Template

### Session Summary
- **Charter:** _________________
- **Tester:** _________________
- **Date/Time:** _________________
- **Duration:** _________________

### Findings Summary
- **Bugs Found:** _____
- **Issues Logged:** _____
- **Observations:** _____
- **Questions Raised:** _____

### Top 3 Findings
1. _________________________________
2. _________________________________
3. _________________________________

### Areas Not Covered
- _________________________________
- _________________________________

### Follow-up Needed
- [ ] Additional testing in: __________
- [ ] Clarification on: ______________
- [ ] Deep dive into: _______________

## Exploratory Testing Best Practices

### Before the Session
1. Review recent changes
2. Check known issues
3. Prepare test environment
4. Clear distractions
5. Have note-taking ready

### During the Session
1. Stay focused on charter
2. Take screenshots liberally
3. Note everything unusual
4. Follow interesting paths
5. Think like target user

### After the Session
1. Log bugs immediately
2. Summarize findings
3. Share insights with team
4. Update test ideas
5. Plan follow-up sessions

### Tools and Helpers
- Browser DevTools
- Screen recorder
- Bug tracking tool
- Note-taking app
- Timer/stopwatch
- System monitoring

## Notes
_General observations and meta-learnings from exploratory testing sessions_

_______________