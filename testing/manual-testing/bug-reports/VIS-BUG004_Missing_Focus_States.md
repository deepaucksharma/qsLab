# Bug Report: VIS-BUG004 - Inconsistent Focus States

**Date:** 2025-01-06  
**Reporter:** Visual Testing System  
**Test Type:** Visual Design & Accessibility Testing  
**Severity:** High (P1) - Accessibility Blocker  
**Priority:** Urgent  
**Status:** Open  
**Component:** Various Interactive Elements  

## Summary
Many custom interactive elements lack visible focus indicators, making keyboard navigation impossible for users who rely on it. This is a WCAG 2.1 Level A failure.

## Environment
- **Affected Components:** 
  - Episode cards in grid
  - Custom button components
  - Interactive scene elements
  - Volume slider
  - Progress bar
- **Impact:** All keyboard users
- **WCAG Criterion:** 2.4.7 Focus Visible (Level AA)

## Accessibility Standards Violated
- **WCAG 2.4.7:** Focus Visible - Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible
- **Section 508:** Keyboard accessible controls must have visible focus

## Expected Behavior
Per design system (`techflix-design-system.css`):
```css
/* Defined but not consistently applied */
:focus-visible {
  outline: 2px solid var(--color-info); /* #3B82F6 */
  outline-offset: 2px;
}
```

All interactive elements should:
- Show clear focus indicator on keyboard navigation
- Use consistent focus style (2px solid blue outline)
- Maintain 3:1 contrast ratio for focus indicator
- Not rely on color alone

## Actual Behavior
- Episode cards: No focus indicator at all
- Custom buttons: Browser default outline removed, no replacement
- Sliders: Focus barely visible
- Some elements: outline: none with no alternative

## Code Evidence
```css
/* Problematic code found */
.netflix-button:focus {
  outline: none; /* Removed without replacement */
}

.episode-card:focus {
  /* No focus styles defined */
}

/* Should be */
.netflix-button:focus-visible {
  outline: 2px solid var(--color-info);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}
```

## User Impact
- **Keyboard users:** Cannot see where focus is - navigation impossible
- **Screen reader users:** May announce focus but no visual indicator
- **Motor impaired users:** Cannot track navigation progress
- **Legal risk:** Non-compliance with accessibility laws

## Severity Justification
This is P1 because:
1. Blocks entire user groups from using the application
2. Legal compliance requirement (ADA, Section 508)
3. Fails WCAG Level A criteria
4. No workaround available

## Recommended Fix

### Immediate Global Fix:
```css
/* Add to global.css */
*:focus-visible {
  outline: 2px solid var(--color-info) !important;
  outline-offset: 2px !important;
}

/* Remove all outline: none without replacements */
```

### Component-Specific Fixes:
1. **Episode Cards:**
```css
.episode-card:focus-visible {
  outline: 2px solid var(--color-info);
  outline-offset: 4px;
  transform: scale(1.02); /* Additional indicator */
}
```

2. **Custom Buttons:**
```css
.netflix-button:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.2);
}
```

3. **Sliders/Progress Bars:**
```css
input[type="range"]:focus-visible {
  outline: 2px solid var(--color-info);
  outline-offset: 4px;
}
```

## Testing Requirements
1. Navigate entire app using only keyboard (Tab, Shift+Tab, Enter, Space)
2. Verify every interactive element shows focus
3. Test with Windows High Contrast Mode
4. Validate 3:1 contrast ratio for focus indicators
5. Test with screen readers (NVDA, JAWS, VoiceOver)

## Accessibility Testing Tools
- axe DevTools: Will flag missing focus indicators
- WAVE: Will identify focusable elements without indicators
- Keyboard Navigation Tester: Manual verification required

## Prevention
1. Add ESLint rule to catch `outline: none` without replacement
2. Include focus states in component library
3. Add automated accessibility tests (jest-axe)
4. Require accessibility review in PR process

## Related Issues
- General accessibility audit needed
- Component library missing focus state documentation
- No automated accessibility testing in place

---
**Assignment:** Accessibility Team (URGENT)  
**Fix Version:** 2.0.1 (Hotfix required)  
**Compliance Deadline:** Immediate - Legal requirement