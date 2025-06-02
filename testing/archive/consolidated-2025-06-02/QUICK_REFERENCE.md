# TechFlix Testing - Quick Reference Guide
**Last Updated:** 2025-01-06  
**Purpose:** Quick access to key testing information

## 🚀 Quick Start Commands

```bash
# Start TechFlix application
cd /home/deepak/src/qsLab/techflix
npm run dev

# Access application
http://localhost:3000

# Run linting
npm run lint

# Run type checking  
npm run type-check
```

## 📍 Where to Find What

### Current Status
- **Overall Status:** `CURRENT_TEST_STATUS_2025-01-06.md`
- **Bug Status:** `BUG_STATUS_CONSOLIDATED_2025-01-06.md`
- **Bug Master List:** `BUG_INDEX.md`

### Test Documentation
- **Test Strategy:** `TESTING_STRATEGY.md`
- **Test Cases:** `manual-testing/functional/TC*.md`
- **User Journeys:** `docs/USER_JOURNEYS.md`

### Bug Reports
- **Active Bugs:** `manual-testing/bug-reports/`
- **Bug Template:** `manual-testing/templates/BUG_REPORT_TEMPLATE.md`
- **Next Bug ID:** BUG-013

## 🎯 Current Testing Metrics

```
Production Readiness: 85%
Test Pass Rate:      98.8%
Critical Bugs:       0
Open Bugs:           5 (all P3)
```

## 🐛 Open Issues (Minor)

1. **REG-001:** Mobile menu lacks escape key handler
2. **REG-002:** Minor FPS drop on low-end mobile  
3. **REG-003:** TechFlixButton not fully adopted
4. **REG-004:** Search results missing episode numbers
5. **BUG-001:** Node version compatibility warning

## ✅ Recent Fixes (2025-01-06)

- Mobile navigation (hamburger menu)
- User interface improvements
- Audio system performance
- Search functionality
- Responsive text overflow
- 404 page handling

## 📋 Test Execution Checklist

### Before Testing
- [ ] Clear browser cache
- [ ] Check console for errors
- [ ] Note browser/OS version
- [ ] Have bug template ready

### During Testing
- [ ] Follow test case steps exactly
- [ ] Document all observations
- [ ] Capture screenshots for bugs
- [ ] Note performance issues

### After Testing
- [ ] Update test results
- [ ] File bug reports
- [ ] Update status documents
- [ ] Archive old reports

## 🔧 Key Test Scenarios

### Critical Paths
1. First-time user can browse episodes
2. Episode playback works smoothly
3. Progress saves and resumes
4. Search returns relevant results
5. Mobile navigation accessible

### Edge Cases
1. Multiple browser tabs
2. Network interruption
3. Long episode titles
4. Rapid navigation
5. Browser back/forward

## 📱 Device Testing Matrix

### Desktop
- Chrome 120+ ✅
- Firefox 120+ ✅
- Safari 17+ ✅
- Edge 120+ ✅

### Mobile
- iOS Safari ✅
- Chrome Android ✅
- Samsung Internet ✅

### Responsive Breakpoints
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+

## 🛠️ Debugging Tips

### Common Issues
1. **Blank page:** Check console for errors
2. **Slow loading:** Check network tab
3. **Layout broken:** Check responsive mode
4. **Features missing:** Clear cache

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

## 📊 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| FCP | < 1.5s | ✅ 1.2s |
| TTI | < 3.5s | ✅ 2.8s |
| FPS | > 30 | ⚠️ 28 (mobile) |
| Memory | < 50MB | ✅ 35MB |

## 🔗 Quick Links

### Documentation
- [Testing Strategy](./TESTING_STRATEGY.md)
- [User Journeys](./docs/USER_JOURNEYS.md)
- [Bug Index](./BUG_INDEX.md)

### External Tools
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

**Pro Tip:** Keep this guide open in a separate tab while testing!