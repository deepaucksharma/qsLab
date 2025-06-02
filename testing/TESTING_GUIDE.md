# TechFlix Testing Guide - Complete Reference
**Last Updated:** 2025-06-02  
**Purpose:** Comprehensive testing guide consolidating all reference materials

## Table of Contents

1. [Quick Start](#quick-start)
2. [Testing Overview](#testing-overview)
3. [Directory Structure](#directory-structure)
4. [Test Execution](#test-execution)
5. [Bug Management](#bug-management)
6. [Tools & Resources](#tools--resources)
7. [Best Practices](#best-practices)

## Quick Start

### Prerequisites
- Node.js 18.17.0 or higher
- npm 9.x or higher
- Chrome/Firefox/Safari browser
- Git

### Initial Setup
```bash
# Navigate to project
cd /home/deepak/src/qsLab/techflix

# Install dependencies
npm install

# Start development server
npm run dev

# Access application
http://localhost:3000
```

### Essential Commands
```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run lint         # Run linting
npm run type-check   # TypeScript checking
npm test            # Run unit tests (when available)

# Debugging
# Add ?debug=true to URL or press Ctrl+Shift+D
```

## Testing Overview

### Current Status
- **Production Readiness:** 85%
- **Test Pass Rate:** 98.8%
- **Critical Bugs:** 0
- **Open Issues:** 4 (all minor)

### Testing Philosophy
1. **User-Centric:** Real user journeys
2. **Visual Focus:** Screenshots for media platform
3. **Performance Aware:** Monitor metrics
4. **Continuous:** Regular updates

### Test Categories
1. **Functional Testing** - Core features
2. **Visual Testing** - UI consistency
3. **Performance Testing** - Speed metrics
4. **Usability Testing** - User experience
5. **Integration Testing** - Component interaction

## Directory Structure

```
testing/
├── README.md                    # Main documentation hub
├── TESTING_STRATEGY.md         # Comprehensive strategy
├── TESTING_GUIDE.md           # This file
├── CONSOLIDATED_BUG_TRACKING.md   # All bug information
├── CONSOLIDATED_TEST_RESULTS.md   # All test results
│
├── docs/                       # Additional documentation
│   ├── USER_JOURNEYS.md      # Test scenarios by persona
│   ├── TEST_ENVIRONMENT_SETUP.md
│   └── PARALLEL_TESTING_SETUP.md
│
├── manual-testing/            # Test execution
│   ├── functional/           # Feature tests
│   ├── design-visual/        # UI tests
│   ├── regression-exploratory/
│   ├── bug-reports/          # Bug documentation
│   └── templates/            # Reusable templates
│
└── archive/                   # Historical data
```

## Test Execution

### Before Testing Checklist
- [ ] Clear browser cache
- [ ] Check console for errors
- [ ] Note browser/OS version
- [ ] Review test cases
- [ ] Prepare bug template

### Test Execution Flow
1. **Setup Environment**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

2. **Execute Test Cases**
   - Follow steps in `/manual-testing/functional/TC*.md`
   - Document all observations
   - Capture screenshots for issues

3. **Report Results**
   - Update test execution status
   - File bug reports if needed
   - Update consolidated documents

### Critical Test Paths
1. **First Visit Flow**
   - Homepage loads
   - Browse episodes
   - Start playback
   - Progress saves

2. **Returning User Flow**
   - Progress restored
   - Continue watching works
   - Navigation smooth

3. **Search Flow**
   - Search accessible
   - Results relevant
   - Navigation works

## Bug Management

### Bug Naming Convention
Format: `[PREFIX]-[NUMBER]-[Description].md`

**Prefixes:**
- BUG: General issues
- VIS-BUG: Visual issues
- REG: Regression bugs
- PERF: Performance issues

### Bug Severity Levels
- **P0 (Critical):** Blocks core functionality
- **P1 (High):** Major feature broken
- **P2 (Medium):** Feature partially broken
- **P3 (Low):** Minor/cosmetic issues

### Bug Reporting Process
1. Check `CONSOLIDATED_BUG_TRACKING.md` for duplicates
2. Use template from `/manual-testing/templates/`
3. File in `/manual-testing/bug-reports/`
4. Update consolidated tracking

### Current Open Issues
1. REG-001: Mobile menu escape key (P3)
2. REG-002: Low-end mobile FPS (P3)
3. REG-003: Button styling consistency (P3)
4. REG-004: Search result details (P3)

## Tools & Resources

### Development Tools
- **Chrome DevTools** - Debugging & performance
- **React DevTools** - Component inspection
- **Lighthouse** - Performance audits

### Testing Resources
- Bug Template: `/manual-testing/templates/BUG_REPORT_TEMPLATE.md`
- User Journeys: `/docs/USER_JOURNEYS.md`
- Test Cases: `/manual-testing/functional/`

### Useful Console Commands
```javascript
// Check episode store
window.episodeStore = useEpisodeStore.getState()

// View current episode
console.log(episodeStore.currentEpisode)

// Check localStorage
localStorage.getItem('episode-progress')

// Enable debug mode
localStorage.setItem('debug', 'true')
```

## Best Practices

### Testing Guidelines
1. **Be Systematic** - Follow test cases exactly
2. **Document Everything** - Even minor observations
3. **Reproduce Issues** - Verify bugs before reporting
4. **Think Like Users** - Consider real usage patterns

### Performance Targets
| Metric | Target | Current |
|--------|--------|---------|
| FCP | <1.5s | ✅ 1.2s |
| TTI | <3.5s | ✅ 2.9s |
| CLS | <0.1 | ✅ 0.03 |
| FPS | >30 | ✅ 52-60 |

### Communication
- Daily status updates during active testing
- Immediate alerts for critical bugs
- Weekly summaries of findings
- Monthly metrics review

## Appendix

### Test Data
- Use incognito/private mode for fresh state
- Test with various progress levels
- Consider different screen sizes
- Test network conditions

### Common Issues & Solutions
| Issue | Solution |
|-------|----------|
| Blank page | Check console errors |
| Slow loading | Check network tab |
| Layout broken | Check responsive mode |
| Features missing | Clear cache |

### Archive Policy
- Sessions older than 30 days → `/archive/`
- Closed bugs → `/archive/closed-bugs/`
- Superseded docs → `/archive/legacy-docs/`

---
*This guide consolidates Quick Start, Quick Reference, and Index documents*