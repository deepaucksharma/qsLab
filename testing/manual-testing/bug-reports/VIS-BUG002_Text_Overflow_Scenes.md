# Bug Report: VIS-BUG002 - Text Overflow in Scene Components

**Date:** 2025-01-06  
**Reporter:** Visual Testing System  
**Test Type:** Visual Design Testing  
**Severity:** High (P1)  
**Priority:** High  
**Status:** Open  
**Component:** Scene Components (Evolution Timeline)  

## Summary
Text content in evolution timeline scenes clips or overflows containers, especially on smaller viewports, making content unreadable and breaking the visual hierarchy.

## Environment
- **Affected Components:** EvolutionTimelineSceneV2, EvolutionTimelineSceneV3
- **Browsers:** All browsers
- **Viewports:** Most severe on < 1366px width

## Visual Evidence Required
- Screenshot of text overflow on laptop (1366x768)
- Screenshot of clipped text on mobile (375x667)
- Video showing text breaking layout during animations

## Expected Behavior
- Text should scale responsively using clamp() values
- Long text should wrap properly within containers
- Text containers should respect scene boundaries
- Maintain readability at all viewport sizes

## Actual Behavior
- Fixed font sizes cause text to overflow containers
- Text phases animate outside visible area
- Mobile view cuts off critical information
- No text truncation or responsive sizing

## Code Analysis
```css
/* Current problematic styles */
.evolution-text {
  font-size: 48px; /* Fixed size */
  white-space: nowrap; /* Prevents wrapping */
}

/* Should use design system */
.evolution-text {
  font-size: var(--text-title);
  /* or */
  font-size: clamp(1.5rem, 3vw, 3rem);
}
```

## Impact Analysis
- **User Impact:** Content becomes unreadable, especially educational text
- **Mobile Impact:** 100% of mobile users affected
- **Learning Impact:** Critical information lost
- **Brand Impact:** Unprofessional appearance

## Root Cause
Scene components were developed with fixed desktop dimensions in mind, not following the responsive design system properly.

## Recommended Fix

### Immediate (for affected scenes):
```jsx
// Replace fixed sizes with responsive values
<motion.h2 
  className="text-4xl md:text-5xl lg:text-6xl" // Responsive Tailwind
  style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }} // Or CSS clamp
>

// Add text wrapping
<p className="max-w-prose break-words">
```

### Long-term:
1. Create text component library with responsive variants
2. Enforce design system usage in code reviews
3. Add visual regression tests for different viewports

## Testing Requirements
- Test on all defined breakpoints (375px, 768px, 1366px, 1920px)
- Verify text remains readable during animations
- Check text contrast remains WCAG compliant
- Test with browser zoom 50%-200%

## Related Issues
- VIS-BUG003: Mobile navigation overlap (compounds readability)
- General mobile optimization needed

---
**Assignment:** UI/UX Team  
**Fix Version:** 2.1.0  
**Design System:** Update required