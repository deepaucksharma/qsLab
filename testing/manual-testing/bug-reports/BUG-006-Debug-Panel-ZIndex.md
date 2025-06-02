# Bug Report: Debug Panel Z-Index Overlap

## Bug ID: BUG-006
**Date Found:** 2025-01-06  
**Reporter:** Claude Code  
**Status:** New

## Bug Summary
Debug panel overlaps with episode player controls when both are visible simultaneously

## Environment
- **Browser:** Chrome 120
- **OS:** Ubuntu Linux
- **Build/Commit:** Post-reorganization build (Jan 2025)
- **Test Instance:** Port 3002
- **User State:** Playing episode with debug panel open

## Severity & Priority
**Severity:** Low - Minor visual issue, doesn't block functionality  
**Priority:** P3 - Fix when possible

## Bug Details

### Steps to Reproduce
1. Navigate to any episode (e.g., /episode/s2e1-kafka-share-groups)
2. Start episode playback
3. Move mouse to show player controls
4. Press Ctrl+Shift+D to open debug panel
5. Observe overlap in bottom-right corner

### Expected Result
Debug panel should appear above player controls without overlap, or player controls should adjust position

### Actual Result  
Debug panel partially covers the fullscreen button and volume controls

### Reproducibility
- [x] Always (100%)

## Evidence

### Visual Description
- Debug panel renders at z-index: 9999
- Player controls render at z-index: 1000
- Overlap occurs in bottom 80px of screen
- Affects rightmost player controls

### CSS Analysis
```css
/* Current implementation */
.debug-panel {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 9999;
}

.player-controls {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}
```

## Impact Analysis

### Affected Features
- Debug panel visibility
- Player control accessibility
- Developer experience

### Affected Users
- Developers using debug panel
- QA testers
- ~5% of power users who discover debug mode

### Workaround
Close debug panel when needing to access player controls, or use keyboard shortcuts

## Additional Information

### Suggested Fix
```css
/* Option 1: Adjust debug panel position */
.debug-panel {
  bottom: 100px; /* Above player controls */
}

/* Option 2: Smart positioning */
.debug-panel.player-active {
  bottom: 100px;
}
```

### Related Issues
- None identified

### Test Case Reference
- Test Case ID: DV002
- Test Track: Visual/Design

## Fix Verification

### How to Verify Fix
1. Open episode with debug panel
2. Show player controls
3. Verify no overlap
4. Test panel drag/resize if implemented

---

## For Developer Use

### Root Cause
Both components use fixed positioning without awareness of each other

### Fix Description
[To be filled by developer]