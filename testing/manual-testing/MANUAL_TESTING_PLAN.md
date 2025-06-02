# Manual Testing Plan for TechFlix (qsLab)

## Overview

TechFlix is a Netflix-style technical learning platform featuring interactive episodes, quizzes, rich animations, and a built-in debug panel. This comprehensive manual testing plan covers all features and components through parallel tracks, with each track focusing on different quality dimensions.

## Testing Environment
- **Primary Browser**: Chrome (Desktop)  
- **Operating System**: Windows 11 with WSL Ubuntu
- **Test Location**: `\\wsl.localhost\Ubuntu\home\deepak\src\qsLab\techflix`
- **Start Command**: `npm run dev` (runs on http://localhost:3000)

## Parallel Testing Tracks

### 1. Functional Testing Track (`/functional/`)
**Goal**: Ensure all business logic, user workflows, and interactive functionality behave as intended.

**Key Areas**:
- Episode browsing and selection
- Video playback and controls
- Interactive decision points
- Quiz question handling
- Audio and voiceover controls
- Episode completion and navigation
- Debug panel functionality
- Error handling and edge conditions

### 2. Design and Visual Testing Track (`/design-visual/`)
**Goal**: Verify UI/UX alignment with design expectations and visual consistency.

**Key Areas**:
- Layout fidelity (pixel-perfect positioning)
- Responsive design (desktop range: 1024px - 1920px+)
- Typography and color scheme consistency
- Interactive states (hover, focus, active)
- Animation smoothness
- Loading and error state visuals

### 3. Cross-Domain Testing Track (`/cross-domain/`)
**Goal**: Verify integration between different components and systems.

**Key Areas**:
- End-to-end episode flow integration
- Form validation and feedback integration
- Global settings persistence
- State consistency across components
- Data persistence and refresh handling

### 4. Regression and Exploratory Testing Track (`/regression-exploratory/`)
**Goal**: Ensure changes don't break existing functionality and discover edge cases.

**Key Areas**:
- Comprehensive regression suite
- Unscripted exploratory testing
- Stress testing with unusual inputs
- Cross-browser compatibility checks

## Testing Schedule

### Daily Testing
- Smoke tests (critical path verification)
- New feature testing
- Bug verification/retesting

### Weekly Testing  
- Full regression suite
- Exploratory testing sessions
- UI/UX review and screenshot analysis

### Pre-Release Testing
- Complete end-to-end testing
- Performance and load testing
- Final UI polish review

## Documentation Structure

```
manual-testing/
├── functional/
│   ├── test-scenarios.md
│   ├── test-results.md
│   └── evidence/
├── design-visual/
│   ├── ui-checkpoints.md
│   ├── visual-regression-log.md
│   └── screenshots/
├── cross-domain/
│   ├── integration-scenarios.md
│   └── state-validation.md
├── regression-exploratory/
│   ├── regression-suite.md
│   └── exploratory-sessions.md
├── screenshots/
│   ├── baseline/
│   ├── current/
│   └── issues/
├── templates/
│   ├── bug-report-template.md
│   ├── test-case-template.md
│   └── session-report-template.md
└── bug-reports/
    └── [dated-bug-reports]
```

## Success Criteria

### Functional Track
- All user workflows complete successfully
- No critical bugs in episode playback
- Interactive elements respond correctly
- Error handling is graceful

### Design Track  
- UI matches design specifications
- Responsive layout works across desktop sizes
- Interactive states are consistent
- No visual regressions

### Cross-Domain Track
- Component integration is seamless
- State management is consistent
- Data persistence works as expected
- Settings sync across components

### Regression Track
- No new bugs introduced
- All fixed bugs remain fixed
- Performance hasn't degraded
- Edge cases are handled properly

## Bug Severity Levels

### Critical (P0)
- App crashes or won't start
- Core episode playback broken
- Data corruption or loss

### High (P1)  
- Major feature completely broken
- Blocking user workflows
- Significant UI issues

### Medium (P2)
- Feature partially broken
- Minor workflow disruptions
- Cosmetic UI issues

### Low (P3)
- Enhancement requests
- Minor polish items
- Documentation issues

## Testing Tools and Evidence Collection

### Required Tools
- Chrome DevTools (console monitoring)
- Screenshot capture tool
- Video recording for complex issues
- Browser responsive testing tools

### Evidence Requirements
- Screenshots for all UI issues
- Console logs for errors
- Step-by-step reproduction
- Expected vs actual results
- Environment details

## Contact and Escalation

### Test Lead
- **Responsible for**: Test planning, execution coordination, reporting
- **Escalation Path**: Direct to development team

### Bug Triage
- **P0/P1 bugs**: Immediate escalation
- **P2 bugs**: Next business day
- **P3 bugs**: Weekly triage

---

*Last Updated: [Current Date]*
*Version: 1.0*
