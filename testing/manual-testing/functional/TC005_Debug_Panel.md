# Test Case: TC005 - Debug Panel Functionality
**Test Track:** Functional  
**Priority:** Medium  
**Last Updated:** 2025-01-06

## Test Objective
Verify the Debug Panel functionality including activation, features, performance monitoring, log viewing, and state inspection capabilities.

## Prerequisites
- Know keyboard shortcut: Ctrl+Shift+D
- Understand debug URL parameter: ?debug=true
- Chrome DevTools available for comparison
- Test in non-production environment

## Test Steps

### Step 1: Keyboard Activation
**Action:**
1. Load any episode page
2. Press Ctrl+Shift+D
3. Observe panel appearance

**Expected Result:**
- Debug panel toggles open
- Overlays on top of content
- Semi-transparent or side panel
- Close button visible
- No impact on episode playback

**Pass/Fail:** [ ]

### Step 2: URL Parameter Activation
**Action:**
1. Navigate to: http://localhost:3000/episode?debug=true
2. Page loads with debug mode
3. Check if panel auto-opens

**Expected Result:**
- Debug panel opens automatically
- URL parameter recognized
- Same features as keyboard activation
- Parameter persists in navigation
- Works on all pages

**Pass/Fail:** [ ]

### Step 3: Log Streaming
**Action:**
1. With panel open, perform actions:
   - Navigate between scenes
   - Click buttons
   - Trigger animations
2. Watch log output in panel

**Expected Result:**
- Real-time log updates
- Timestamp for each entry
- Log level indicators (INFO, WARN, ERROR)
- Scrollable log area
- New logs appear at bottom

**Pass/Fail:** [ ]

### Step 4: Log Level Filtering
**Action:**
1. Locate filter controls
2. Filter by DEBUG level only
3. Filter by ERROR level only
4. Clear filters

**Expected Result:**
- Filters work immediately
- Only selected levels shown
- Can multi-select levels
- Clear shows all logs again
- Filter state persists

**Pass/Fail:** [ ]

### Step 5: Log Search
**Action:**
1. Type search term in search box
2. Search for "scene"
3. Search for specific error
4. Clear search

**Expected Result:**
- Real-time search filtering
- Highlights matching terms
- Case-insensitive search
- Shows match count
- Clear restores all logs

**Pass/Fail:** [ ]

### Step 6: Performance Metrics
**Action:**
1. Locate performance section
2. Note current metrics:
   - FPS
   - Memory usage
   - CPU usage
   - Render time
3. Trigger heavy animation

**Expected Result:**
- Metrics update live
- FPS shows actual rate
- Memory in MB/GB
- Graphs if available
- Performance impacts visible

**Pass/Fail:** [ ]

### Step 7: Scene Navigation Tools
**Action:**
1. Find scene jump controls
2. Jump to last scene
3. Jump to first scene
4. Jump to specific scene number

**Expected Result:**
- Instant scene navigation
- Episode state updates
- Progress bar reflects change
- No playback errors
- Audio syncs correctly

**Pass/Fail:** [ ]

### Step 8: State Inspector
**Action:**
1. Locate state/store viewer
2. Expand state tree
3. Look for:
   - Current episode
   - User progress
   - Settings
   - Audio state

**Expected Result:**
- Current state visible
- Tree view expandable
- Values are accurate
- Updates when state changes
- Can copy state values

**Pass/Fail:** [ ]

### Step 9: Export Functionality
**Action:**
1. Find export logs button
2. Click to export
3. Check downloaded file
4. Verify content

**Expected Result:**
- Downloads JSON/TXT file
- Contains all session logs
- Timestamp included
- Proper formatting
- Can reimport if supported

**Pass/Fail:** [ ]

### Step 10: Panel Interaction
**Action:**
1. Resize panel (if supported)
2. Minimize/maximize
3. Drag to reposition
4. Check transparency

**Expected Result:**
- Panel is interactive
- Maintains position
- Content remains visible
- Doesn't block key UI
- Settings persist

**Pass/Fail:** [ ]

### Step 11: Close and Reopen
**Action:**
1. Close panel with X button
2. Reopen with Ctrl+Shift+D
3. Check if state preserved

**Expected Result:**
- Closes completely
- Keyboard shortcut works again
- Previous filters/settings saved
- OR fresh state (by design)
- No residual overlay

**Pass/Fail:** [ ]

## Edge Cases

### Edge Case 1: Panel During Interactions
**Action:**
1. Open debug panel
2. Trigger a quiz
3. Try to answer with panel open

**Expected Result:**
- Can still interact with quiz
- Panel doesn't block inputs
- Can reposition if needed
- Both systems work together

**Pass/Fail:** [ ]

### Edge Case 2: Performance Under Load
**Action:**
1. Let logs accumulate (1000+ entries)
2. Check panel performance
3. Try searching/filtering

**Expected Result:**
- Panel remains responsive
- Scrolling stays smooth
- Maybe pagination/limit
- No browser lag

**Pass/Fail:** [ ]

### Edge Case 3: Multiple Instances
**Action:**
1. Try opening panel twice
2. Open in multiple tabs
3. Check for conflicts

**Expected Result:**
- Only one instance per tab
- Independent per tab
- No shared state issues
- Each works correctly

**Pass/Fail:** [ ]

## Security Considerations

### Access Control
- [ ] Only works in dev environment
- [ ] Not accessible in production
- [ ] No sensitive data exposed
- [ ] Can't modify critical state
- [ ] Read-only operations

### Data Exposure
- [ ] No user credentials shown
- [ ] No API keys visible
- [ ] No personal data
- [ ] Safe for screenshots
- [ ] Sanitized outputs

## Test Evidence
- [ ] Screenshot of open panel
- [ ] Screenshot of state inspector
- [ ] Exported log file
- [ ] Performance metrics capture
- [ ] Video of scene jumping

## Notes
_Document any security concerns, performance issues, or feature suggestions_

_______________

## Test Result Summary
**Overall Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Tester Name:** _________________  
**Date Tested:** _________________  
**Debug Build:** _________________

**Features Tested:**
- [ ] Keyboard activation
- [ ] URL parameter
- [ ] Log viewing
- [ ] Filtering/search
- [ ] Performance metrics
- [ ] Scene navigation
- [ ] State inspection
- [ ] Export function

**Issues Found:** 
- Issue #: _________________
- Issue #: _________________