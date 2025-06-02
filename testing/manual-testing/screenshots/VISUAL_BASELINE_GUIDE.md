# Visual Testing Baseline Screenshot Guidelines

**Version:** 1.0  
**Last Updated:** 2025-01-06

## Overview

This guide defines standards for capturing, organizing, and maintaining baseline screenshots for visual regression testing of TechFlix. Consistent baselines enable reliable visual comparisons across releases.

## Screenshot Standards

### Technical Requirements

#### Resolution and Display
- **Primary Resolution:** 1920x1080 (Full HD)
- **DPI:** 96 (standard web)
- **Color Profile:** sRGB
- **Browser Zoom:** 100% (no zoom)
- **OS Zoom:** 100% (no scaling)

#### Browser Configuration
```
Chrome Settings for Baseline:
- Version: Latest stable (document version)
- Window Mode: Maximized (not fullscreen)
- Extensions: All disabled
- Bookmarks Bar: Hidden
- Dev Tools: Closed
- Download Bar: Hidden
- Autofill: Disabled
- Notifications: Blocked
```

### Capture Settings

#### Screenshot Tool Configuration
```bash
# Using Chrome DevTools (Recommended)
1. Open DevTools (F12)
2. Ctrl+Shift+P → "Capture screenshot"
3. Select "Capture full size screenshot"

# Alternative: Browser Extension
- Full Page Screen Capture
- FireShot
- Awesome Screenshot
```

#### Timing Considerations
- Wait for all animations to complete
- Ensure all images/fonts loaded
- Allow 2-3 seconds after page load
- Capture at consistent animation states

## Baseline Categories

### 1. Static Page Baselines

#### Home Page
```
Filename: home-page-1920x1080-[date].png
Elements to verify loaded:
- [ ] Header fully rendered
- [ ] All episode cards visible
- [ ] Images loaded (no placeholders)
- [ ] Correct font rendering
```

#### Episode List Views
```
Filename: episode-list-[season]-1920x1080-[date].png
Variations needed:
- Each season expanded
- Different scroll positions
- Hover states captured separately
```

### 2. Interactive State Baselines

#### Player Controls
```
Filename: player-controls-[state]-[date].png
States to capture:
- controls-visible
- controls-hidden
- controls-hover
- controls-fullscreen
```

#### Quiz/Interaction Overlays
```
Filename: quiz-[type]-[state]-[date].png
States needed:
- quiz-initial
- quiz-answered-correct
- quiz-answered-incorrect
- quiz-completed
```

### 3. Component Baselines

#### Individual Components
```
Directory: /components/
- button-primary-default.png
- button-primary-hover.png
- button-primary-active.png
- button-primary-disabled.png
- card-episode-default.png
- card-episode-hover.png
- input-text-empty.png
- input-text-filled.png
- input-text-error.png
```

### 4. Responsive Baselines

#### Breakpoint Captures
```
Directory: /responsive/
- home-1920x1080.png (Desktop Full)
- home-1440x900.png (Desktop Standard)
- home-1280x720.png (Desktop Small)
- home-1024x768.png (Desktop Minimum)
```

## File Naming Convention

### Standard Format
```
[page/component]-[state]-[resolution]-[date].png

Examples:
- home-page-default-1920x1080-20250106.png
- player-scene2-playing-1920x1080-20250106.png
- button-primary-hover-component-20250106.png
```

### Version Control
```
/baseline/
  /v1.0.0/
    /pages/
    /components/
    /states/
  /v1.1.0/
    /pages/
    /components/
    /states/
```

## Capture Checklist

### Pre-Capture Setup
- [ ] Clear browser cache
- [ ] Reset localStorage
- [ ] Use fresh browser profile
- [ ] Disable all extensions
- [ ] Set correct resolution
- [ ] Verify zoom at 100%
- [ ] Close all other tabs
- [ ] Disable system notifications

### During Capture
- [ ] Wait for full page load
- [ ] Verify no loading spinners
- [ ] Check console for errors
- [ ] Ensure consistent data
- [ ] Capture at same time in animations
- [ ] Document any variations

### Post-Capture
- [ ] Verify image quality
- [ ] Check file size (optimize if >2MB)
- [ ] Rename according to convention
- [ ] Move to correct directory
- [ ] Update baseline registry
- [ ] Commit to version control

## Baseline Registry

### Metadata Template
```json
{
  "baseline_id": "home-page-001",
  "filename": "home-page-default-1920x1080-20250106.png",
  "page": "home",
  "state": "default",
  "resolution": "1920x1080",
  "captured_date": "2025-01-06",
  "captured_by": "tester_name",
  "browser": "Chrome 120.0.6099.129",
  "os": "Windows 11",
  "notes": "Initial baseline after redesign",
  "checksum": "md5:a3f5c9d8e7b1a2c4d6e8f0a2b4c6d8e0"
}
```

## Visual Comparison Process

### Manual Comparison Steps
1. Open baseline in one window
2. Open current screenshot in another
3. Use image diff tool or overlay
4. Document any differences
5. Categorize changes:
   - Intentional (feature change)
   - Regression (unintended change)
   - Environmental (font rendering, etc.)

### Automated Tools
```bash
# Using ImageMagick
compare baseline.png current.png diff.png

# Using Node.js tools
npm install -g reg-cli
reg-cli baseline.png current.png diff.png

# Python tools
python -m pytest --screenshot-baseline
```

## Maintenance Guidelines

### When to Update Baselines

#### Required Updates
- After intentional UI changes
- New features added
- Design system updates
- Major refactoring

#### Review Schedule
- Weekly: Check for outdated baselines
- Monthly: Full baseline audit
- Quarterly: Cleanup unused baselines

### Baseline Approval Process
1. Developer makes UI change
2. Tester captures new baseline
3. Designer reviews and approves
4. Old baseline archived
5. New baseline committed
6. Team notified of change

## Common Issues and Solutions

### Issue: Font Rendering Differences
**Solution:**
- Use web fonts (not system)
- Include font files in repo
- Set explicit font smoothing
- Document acceptable variations

### Issue: Animation Timing
**Solution:**
- Disable animations for baseline
- Or capture at specific keyframe
- Use CSS to pause animations
- Document animation states

### Issue: Dynamic Content
**Solution:**
- Use consistent test data
- Mock time-dependent content
- Seed random elements
- Document dynamic areas

### Issue: Color Profile Variations
**Solution:**
- Standardize on sRGB
- Calibrate monitors
- Use color profile tools
- Allow minor variations (±5%)

## Storage and Organization

### Directory Structure
```
/testing/visual-baselines/
├── /current/               # Active baselines
│   ├── /pages/
│   ├── /components/
│   └── /states/
├── /archive/               # Previous versions
│   ├── /2025-01/
│   └── /2024-12/
├── /diff/                  # Comparison results
├── /temp/                  # Working directory
└── baseline-registry.json  # Metadata
```

### Git LFS Setup
```bash
# Large files (screenshots) in Git LFS
git lfs track "*.png"
git lfs track "*.jpg"
git add .gitattributes
git commit -m "Configure Git LFS for screenshots"
```

## Quick Reference Card

### Capture Commands
```bash
# Full page screenshot (Chrome DevTools)
Ctrl+Shift+P → "Capture full size screenshot"

# Specific element (Chrome DevTools)
Right-click element → Inspect → Ctrl+Shift+P → "Capture node screenshot"

# Using Puppeteer
await page.screenshot({path: 'baseline.png', fullPage: true});

# Using Playwright  
await page.screenshot({path: 'baseline.png', fullPage: true});
```

### Comparison Commands
```bash
# Quick visual diff
compare -compose src baseline.png current.png diff.png

# Perceptual diff
perceptualdiff baseline.png current.png -output diff.png

# Generate HTML report
reg-suit compare
```

## Best Practices

1. **Consistency is Key**
   - Same environment every time
   - Document any deviations
   - Use automation where possible

2. **Version Everything**
   - Baselines in version control
   - Tag baseline updates
   - Link to feature changes

3. **Review Regularly**
   - Don't let baselines get stale
   - Archive unused baselines
   - Keep registry updated

4. **Communicate Changes**
   - Notify team of updates
   - Document why changed
   - Include in release notes

## Notes
_Space for team-specific guidelines and lessons learned_

_______________