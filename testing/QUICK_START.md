# TechFlix Testing - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Set Up Test Environment
```bash
# Navigate to TechFlix directory
cd techflix/

# Install dependencies
npm install

# Start single test instance
npm run dev

# Or start multiple test instances
./scripts/parallel-instances.sh
```

### 2. Choose Your Testing Track

#### 🔧 Functional Testing (Port 3001)
```bash
PORT=3001 npm run dev
# Open manual-testing/functional/TC001_HomePage_Navigation.md
# Follow test steps
```

#### 🎨 Visual Testing (Port 3002)
```bash
PORT=3002 npm run dev
# Open manual-testing/design-visual/DV001_HomePage_Layout.md
# Compare against baseline screenshots
```

#### 🔗 Integration Testing (Port 3003)
```bash
PORT=3003 npm run dev
# Open manual-testing/cross-domain/CD001_State_Persistence.md
# Test cross-component functionality
```

#### 🔍 Exploratory Testing (Port 3004)
```bash
PORT=3004 npm run dev
# Open manual-testing/regression-exploratory/EXPLORATORY_TESTING_CHARTERS.md
# Pick a charter and explore
```

## 📋 Test Execution Workflow

### Daily Testing Routine
1. **Morning Smoke Test** (15 min)
   - Run REGRESSION_TEST_SUITE.md smoke tests
   - Report any blockers immediately

2. **Feature Testing** (2-3 hours)
   - Execute assigned test cases
   - Log bugs using templates/BUG_REPORT_TEMPLATE.md
   - Update test execution tracking

3. **End of Day Report**
   - Use templates/DAILY_TEST_REPORT.md
   - Submit to team lead

### Bug Reporting Process
```bash
1. Find bug → Take screenshot
2. Open templates/BUG_REPORT_TEMPLATE.md
3. Fill out all sections
4. Save as: bug-reports/BUG-[NUMBER]-[SHORT-DESCRIPTION].md
5. Link in daily report
```

## 🛠️ Common Commands

```bash
# Development
npm run dev                      # Start dev server
npm run build                    # Build for production
npm run preview                  # Preview production build

# Testing
npm test                         # Run automated tests
npm run test:coverage           # Generate coverage report

# Parallel Testing
./scripts/parallel-instances.sh  # Start 4 instances
pm2 start config/ecosystem.config.js  # Using PM2
docker-compose -f docker-compose.testing.yml up  # Using Docker

# Utilities
Ctrl+Shift+D                    # Open debug panel
?debug=true                     # Enable debug mode via URL
```

## 📁 Key Locations

| What | Where |
|------|-------|
| Test Cases | `manual-testing/[category]/` |
| Bug Reports | `manual-testing/bug-reports/` |
| Templates | `manual-testing/templates/` |
| Screenshots | `manual-testing/screenshots/` |
| Test Strategy | `TESTING_STRATEGY.md` |
| Environment Setup | `docs/TEST_ENVIRONMENT_SETUP.md` |

## 🔍 Finding Test Cases

### By Test Type
- **Functional**: `manual-testing/functional/TC*.md`
- **Visual**: `manual-testing/design-visual/DV*.md`
- **Integration**: `manual-testing/cross-domain/CD*.md`
- **Regression**: `manual-testing/regression-exploratory/REGRESSION_TEST_SUITE.md`

### By Priority
Look for "Priority: High/Medium/Low" in test case headers

## 💡 Tips for Effective Testing

1. **Always Clear State Before Testing**
   ```javascript
   // In browser console
   localStorage.clear()
   location.reload()
   ```

2. **Use Different Browser Profiles**
   ```bash
   # Chrome with clean profile
   google-chrome --user-data-dir=/tmp/test-profile http://localhost:3001
   ```

3. **Monitor Performance**
   - Open DevTools → Performance tab
   - Record while testing
   - Look for FPS drops or memory leaks

4. **Take Screenshots Liberally**
   - Before and after states
   - Error messages
   - Unexpected behavior

## 🚨 When You Find a Bug

1. **Can you reproduce it?** Try 3 times
2. **Is it already reported?** Check bug-reports/
3. **Is it environment-specific?** Test in another instance
4. **Document everything:** Screenshots, console logs, steps

## 📞 Getting Help

- **Testing Strategy**: Read TESTING_STRATEGY.md
- **Environment Issues**: See docs/TEST_ENVIRONMENT_SETUP.md
- **Parallel Testing**: Check docs/PARALLEL_TESTING_SETUP.md
- **Team Support**: Post in #techflix-testing channel

## ✅ Daily Checklist

- [ ] Test environment running
- [ ] Correct test instance/port
- [ ] Browser console open
- [ ] Screenshot tool ready
- [ ] Bug report template handy
- [ ] Test tracking sheet updated

---

**Remember**: Good testing finds bugs before users do! 🐛🔍