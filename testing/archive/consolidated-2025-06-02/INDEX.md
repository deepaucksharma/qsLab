# TechFlix Testing Documentation Index

## 📚 Complete Testing Reference

### Latest Updates

#### June 2, 2025 - Bug Fixing Session ✅
- **[Bug Fix Summary](BUG_FIX_SUMMARY_2025-06-02.md)** - Session results
- **[Detailed Session Log](BUG_FIXING_SESSION_2025-06-02.md)** - Complete fix details
- **[Updated Bug Status](OUTSTANDING_BUGS.md)** - Current outstanding issues
- **Status**: 4/4 critical bugs fixed, application production-ready

#### December 2024 - Major Status Reports
- **[Final Fix Report](FINAL_FIX_REPORT_2025-06-02.md)** - Comprehensive fix summary
- **[Critical Fixes](CRITICAL_FIXES_IMPLEMENTED.md)** - Major bug resolutions
- **[Bug Status Consolidated](BUG_STATUS_CONSOLIDATED_2025-01-06.md)** - Historical tracking

### Getting Started
- 🚀 **[Quick Start Guide](QUICK_START.md)** - Get testing in 5 minutes
- 📖 **[Testing Overview](README.md)** - Understand the testing structure
- 🛠️ **[Environment Setup](docs/TEST_ENVIRONMENT_SETUP.md)** - Detailed setup instructions

### Core Documentation
- 📋 **[Testing Strategy](TESTING_STRATEGY.md)** - Comprehensive testing approach
- 🔄 **[Parallel Testing](docs/PARALLEL_TESTING_SETUP.md)** - Run multiple test instances
- 🎯 **[User Journeys](docs/USER_JOURNEYS.md)** - Key user flows to test

### Test Cases by Category

#### Functional Testing
- **[TC001](manual-testing/functional/TC001_HomePage_Navigation.md)** - Home Page Navigation
- **[TC002](manual-testing/functional/TC002_Episode_Playback.md)** - Episode Playback
- **[TC003](manual-testing/functional/TC003_Interactive_Elements.md)** - Interactive Elements
- **[TC004](manual-testing/functional/TC004_Audio_VoiceOver_Controls.md)** - Audio & VoiceOver
- **[TC005](manual-testing/functional/TC005_Debug_Panel.md)** - Debug Panel

#### Visual/Design Testing
- **[DV001](manual-testing/design-visual/DV001_HomePage_Layout.md)** - Home Page Layout
- **[DV002](manual-testing/design-visual/DV002_Episode_Player_UI.md)** - Episode Player UI
- **[DV003](manual-testing/design-visual/DV003_Component_Consistency.md)** - Component Consistency
- **[Visual Baseline Guide](manual-testing/screenshots/VISUAL_BASELINE_GUIDE.md)** - Screenshot standards

#### Integration Testing
- **[CD001](manual-testing/cross-domain/CD001_State_Persistence.md)** - State Persistence
- **[CD002](manual-testing/cross-domain/CD002_Navigation_Flow.md)** - Navigation Flow
- **[CD003](manual-testing/cross-domain/CD003_Media_Component_Integration.md)** - Media Integration

#### Regression & Exploratory
- **[Regression Suite](manual-testing/regression-exploratory/REGRESSION_TEST_SUITE.md)** - Full regression tests
- **[Exploratory Charters](manual-testing/regression-exploratory/EXPLORATORY_TESTING_CHARTERS.md)** - Guided exploration

### Templates & Tools
- 🐛 **[Bug Report Template](manual-testing/templates/BUG_REPORT_TEMPLATE.md)** - Standardized bug reporting
- 📊 **[Daily Report Template](manual-testing/templates/DAILY_TEST_REPORT.md)** - Daily status reports
- 📈 **[Test Tracking Sheet](manual-testing/templates/TEST_EXECUTION_TRACKING.xlsx.md)** - Excel tracking template

### Test Execution Guides

#### By Testing Phase
1. **Sprint Testing**
   - Daily smoke tests (15 min)
   - Feature testing (2-3 hours)
   - Bug verification (1 hour)

2. **Release Testing**
   - Full regression (4-6 hours)
   - Performance testing (2 hours)
   - Exploratory sessions (2 hours)

3. **Hotfix Testing**
   - Targeted regression (1 hour)
   - Impact analysis (30 min)
   - Smoke test (15 min)

#### By Test Type Priority
1. **Critical Path** (Must Pass)
   - Home page loads
   - Episode playback works
   - Audio functions
   - Navigation works

2. **High Priority** (Should Pass)
   - All interactive elements
   - State persistence
   - Visual consistency
   - Performance targets

3. **Medium Priority** (Nice to Pass)
   - Edge cases
   - Browser compatibility
   - Advanced features

### Configuration & Setup

#### Test Environments
| Environment | Port | Purpose | Config |
|------------|------|---------|---------|
| Functional | 3001 | Core features | Standard |
| Visual | 3002 | UI/UX testing | CSS maps on |
| Integration | 3003 | System testing | Debug on |
| Performance | 3004 | Speed testing | Profiling on |

#### Quick Commands
```bash
# Single instance
npm run dev

# Parallel testing
./scripts/parallel-instances.sh

# Specific port
PORT=3001 npm run dev

# Debug mode
DEBUG=true npm run dev
```

### Archived Content
- 📁 **[Archive](archive/)** - Historical test sessions and outdated docs
- 📅 **[2025 Sessions](archive/test-sessions-2025/)** - Future-dated test results

### Directory Map
```
testing/
├── 📄 README.md              # Overview
├── 🚀 QUICK_START.md         # Quick guide
├── 📋 TESTING_STRATEGY.md    # Strategy doc
├── 📚 INDEX.md              # This file
│
├── 📁 manual-testing/        # Active tests
│   ├── functional/          # Feature tests
│   ├── design-visual/       # UI tests
│   ├── cross-domain/        # Integration
│   ├── regression-exploratory/
│   ├── templates/           # Templates
│   └── screenshots/         # Baselines
│
├── 📁 docs/                 # Guides
├── 📁 config/               # Test configs
├── 📁 scripts/              # Automation
├── 📁 test-results/         # Output
└── 📁 archive/              # Old content
```

### Best Practices

#### Before Testing
- ✅ Clear browser state
- ✅ Check test environment
- ✅ Review test cases
- ✅ Prepare bug templates

#### During Testing
- ✅ Follow test steps exactly
- ✅ Document everything
- ✅ Take screenshots
- ✅ Note performance

#### After Testing
- ✅ File bug reports
- ✅ Update tracking
- ✅ Submit daily report
- ✅ Clean up test data

### Contact & Support
- **Documentation Issues**: Update this INDEX.md
- **Test Case Issues**: Create bug report
- **Strategy Questions**: Review TESTING_STRATEGY.md
- **Setup Problems**: Check environment guides

---

**Last Updated**: January 2025  
**Maintained By**: QA Team  
**Version**: 2.0 (Post-Reorganization)