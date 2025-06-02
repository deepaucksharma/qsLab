# TechFlix Test Environment Setup Guide

**Version:** 2.0  
**Last Updated:** 2025-02-06

## Overview

This guide provides comprehensive instructions for setting up testing environments for TechFlix, including single and parallel instance configurations, required tools, and troubleshooting steps.

**Note:** TechFlix has undergone a major project reorganization:
- Configuration files moved to `config/` directory
- Scripts moved to `scripts/` directory
- Server files moved to `server/` directory
- Documentation reorganized into hierarchical `docs/` structure
- All npm scripts updated to use `--config` flags

## Prerequisites

### System Requirements
- **OS:** Windows 10+, macOS 10.15+, or Ubuntu 20.04+
- **RAM:** Minimum 8GB (16GB recommended for parallel testing)
- **Storage:** 10GB free space
- **CPU:** 4 cores minimum (8 cores for parallel testing)

### Software Requirements
```bash
# Required
- Node.js 18+ (LTS recommended)
- npm 8+ or yarn 1.22+
- Git 2.30+
- Chrome (latest stable)

# Optional but Recommended
- Visual Studio Code
- Chrome DevTools
- Docker Desktop (for containerized testing)
- PM2 (for process management)
```

## Initial Setup

### 1. Clone Repository
```bash
# Clone the project
git clone https://github.com/deepaucksharma-nr/qsLab.git
cd qsLab/techflix

# Verify you're on the correct branch
git branch
# Should show: * main
```

### 2. Install Dependencies
```bash
# Install project dependencies
npm install

# Verify installation
npm list --depth=0

# Install global testing tools (optional)
npm install -g pm2
npm install -g http-server
```

### 3. Environment Configuration
```bash
# Create environment file (if it exists)
cp .env.example .env 2>/dev/null || echo "No .env.example found, skipping..."

# Edit .env file with your settings (if needed)
# For testing, typically:
NODE_ENV=test
DEBUG=true
LOG_LEVEL=debug

# Note: TechFlix uses Vite's environment variable system
# Create .env.test for test-specific settings
```

### 4. Verify Basic Setup
```bash
# Run development server (uses config/vite.config.js)
npm run dev

# Should output:
# VITE ready in XXX ms
# ➜ Local: http://localhost:3000/

# Open browser and verify app loads

# Alternative: Run production build and preview
npm run build
npm run preview
```

## Single Instance Testing Setup

### Standard Development Environment
```bash
# Terminal 1: Start the application (uses config/vite.config.js)
npm run dev

# The app will be available at:
# http://localhost:3000

# Terminal 2: Run automated tests (uses config/vitest.config.js)
npm test

# Terminal 3: Run test UI for interactive testing
npm run test:ui

# Terminal 4: Run server (if using server-side features)
npm run serve
```

### Debug Mode Setup
```bash
# Method 1: URL Parameter
# Navigate to: http://localhost:3000?debug=true

# Method 2: Environment Variable
DEBUG=true npm run dev

# Method 3: LocalStorage (in browser console)
localStorage.setItem('debug_enabled', 'true')
location.reload()
```

## Parallel Testing Setup (Multiple Instances)

### Method 1: Manual Port Configuration
```bash
# Terminal 1 - Functional Testing
PORT=3001 npm run dev

# Terminal 2 - Visual Testing
PORT=3002 npm run dev

# Terminal 3 - Integration Testing
PORT=3003 npm run dev

# Terminal 4 - Performance Testing
PORT=3004 npm run dev
```

### Method 2: PM2 Configuration
```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem config in config directory
# See config/ecosystem.config.js below

# Start all test instances
pm2 start config/ecosystem.config.js

# Monitor all instances
pm2 monit

# View logs
pm2 logs

# Stop all instances
pm2 stop all
```

### Method 3: Docker Compose
```bash
# Build and start all containers
docker-compose -f docker-compose.testing.yml up -d

# View running containers
docker ps

# View logs
docker-compose -f docker-compose.testing.yml logs -f

# Stop all containers
docker-compose -f docker-compose.testing.yml down
```

### Method 4: Shell Script
```bash
# Scripts are now in the techflix/scripts directory
# Make script executable
chmod +x scripts/parallel-instances.sh

# Run all instances from techflix directory
./scripts/parallel-instances.sh

# Stop all (Ctrl+C or kill the script process)

# Other useful scripts:
./scripts/start-server.sh    # Start production server
./scripts/quick-verify.sh    # Quick verification
./scripts/test-app.js       # Test application
```

## Browser Configuration

### Chrome Profile Setup for Testing
```bash
# Create test profiles in testing directory
mkdir -p ../testing/chrome-profiles/test-user-1
mkdir -p ../testing/chrome-profiles/test-user-2

# Or create within techflix directory
mkdir -p test-profiles/test-user-1
mkdir -p test-profiles/test-user-2

# Launch with specific profile
google-chrome \
  --user-data-dir=./test-profiles/test-user-1 \
  --no-first-run \
  --no-default-browser-check \
  http://localhost:3001
```

### Chrome Launch Flags for Testing
```bash
# Optimal flags for testing
google-chrome \
  --disable-gpu \
  --disable-extensions \
  --disable-default-apps \
  --disable-sync \
  --disable-web-security \
  --user-data-dir=/tmp/chrome-test \
  --no-sandbox \
  --incognito \
  http://localhost:3000
```

## Test Data Setup

### 1. Clear Existing Data
```javascript
// Run in browser console
localStorage.clear()
sessionStorage.clear()
indexedDB.deleteDatabase('techflix')
```

### 2. Load Test Data
```bash
# If test data scripts exist
npm run seed:testdata

# Or manually in browser console
localStorage.setItem('test_mode', 'true')
localStorage.setItem('test_user', JSON.stringify({
  id: 'test-001',
  progress: {},
  settings: { volume: 0.5, voiceover: true }
}))
```

### 3. Preset Test Scenarios
```javascript
// Scenario 1: New User
localStorage.clear()

// Scenario 2: Returning User with Progress
localStorage.setItem('episode_progress', JSON.stringify({
  's1e1': { completed: true, timestamp: 0 },
  's2e1': { completed: false, timestamp: 150 }
}))

// Scenario 3: User with Custom Settings
localStorage.setItem('audio_settings', JSON.stringify({
  volume: 0.3,
  voiceover: false,
  muted: false
}))
```

## Network Conditions Simulation

### Chrome DevTools Network Throttling
```
1. Open DevTools (F12)
2. Go to Network tab
3. Click throttling dropdown
4. Select preset or custom:
   - Fast 3G
   - Slow 3G
   - Offline
   - Custom (set download/upload/latency)
```

### Programmatic Network Control
```javascript
// In browser console for testing
// Simulate offline
window.addEventListener('online', () => console.log('Online'))
window.addEventListener('offline', () => console.log('Offline'))

// Trigger offline event
window.dispatchEvent(new Event('offline'))
```

## Performance Monitoring Setup

### 1. Browser Performance Tools
```
Chrome DevTools:
1. Performance tab → Start recording
2. Perform actions
3. Stop recording
4. Analyze flame graph

Lighthouse:
1. Open DevTools
2. Lighthouse tab
3. Select categories
4. Generate report
```

### 2. Custom Performance Monitoring
```javascript
// Add to browser console
const perfObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log(`${entry.name}: ${entry.duration}ms`)
  })
})
perfObserver.observe({ entryTypes: ['measure'] })
```

## Debugging Tools Setup

### 1. React Developer Tools
```bash
# Install browser extension
# Chrome: React Developer Tools
# Enables component inspection and profiling
```

### 2. Redux/Zustand DevTools
```javascript
// If using Zustand, add devtools
import { devtools } from 'zustand/middleware'

const useStore = create(
  devtools(
    (set) => ({
      // store config
    }),
    { name: 'TechFlixStore' }
  )
)
```

### 3. Custom Debug Utilities
```javascript
// Global debug helpers (add to console)
window.techflixDebug = {
  getState: () => JSON.parse(localStorage.getItem('app_state')),
  setState: (state) => localStorage.setItem('app_state', JSON.stringify(state)),
  clearAll: () => localStorage.clear(),
  logPerf: () => performance.getEntriesByType('navigation'),
  exportLogs: () => {
    const logs = JSON.parse(localStorage.getItem('debug_logs') || '[]')
    const blob = new Blob([JSON.stringify(logs, null, 2)], {type: 'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `techflix-logs-${Date.now()}.json`
    a.click()
  }
}
```

## Common Issues and Solutions

### Issue: Port Already in Use
```bash
# Find process using port
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows

# Or use a different port
PORT=3001 npm run dev
```

### Issue: Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache if needed
npm cache clean --force
```

### Issue: Chrome Won't Launch
```bash
# Check Chrome installation
which google-chrome  # Linux
where chrome  # Windows

# Use system Chrome path
export CHROME_PATH="/usr/bin/google-chrome"

# Or install Chrome
# Ubuntu: sudo apt install google-chrome-stable
# Mac: brew install --cask google-chrome
```

### Issue: Permission Denied
```bash
# Fix script permissions
chmod +x testing/scripts/*.sh

# Fix npm permissions
sudo npm install -g npm@latest
```

## Environment Validation Checklist

### Basic Validation
- [ ] App loads without errors
- [ ] Console shows no errors
- [ ] All episodes visible
- [ ] Can play an episode
- [ ] Audio works
- [ ] Debug panel opens (Ctrl+Shift+D)

### Extended Validation
- [ ] LocalStorage persists on refresh
- [ ] Navigation works (back/forward)
- [ ] All interactive elements respond
- [ ] Performance acceptable (<3s load)
- [ ] Memory usage stable
- [ ] No network errors

### Multi-Instance Validation
- [ ] All instances running
- [ ] No port conflicts
- [ ] Independent sessions
- [ ] Can access each instance
- [ ] No cross-instance interference

## Quick Reference Commands

```bash
# Start single instance (from techflix directory)
npm run dev

# Start on specific port
PORT=3001 npm run dev

# Start all test instances (PM2)
pm2 start config/ecosystem.config.js

# Start with debug
DEBUG=true npm run dev

# Build for production testing
npm run build      # Uses config/vite.config.js
npm run preview    # Preview production build

# Run tests
npm test           # Uses config/vitest.config.js
npm run test:ui    # Interactive test UI
npm run test:coverage  # With coverage report

# Start server
npm run serve      # Uses server/server.js
npm start          # Build and serve

# Clean everything
rm -rf node_modules dist .cache
npm install

# Check what's running
lsof -i :3000-3010  # Mac/Linux
netstat -an | grep 300  # Windows
```

## Maintenance

### Daily Tasks
1. Clear test data before testing
2. Update dependencies if needed
3. Check for console errors
4. Verify all instances healthy

### Weekly Tasks
1. Update Chrome to latest
2. Clean up old test profiles
3. Archive test screenshots
4. Review error logs

### Monthly Tasks
1. Full dependency update
2. Clean Docker images
3. Review and update test data
4. Performance baseline update

## Support and Troubleshooting

### Getting Help
1. Check console for errors
2. Review this guide
3. Check project README
4. Search existing issues
5. Ask team in Slack/Teams

### Logging Issues
When reporting setup issues, include:
- OS and version
- Node.js version (`node -v`)
- npm version (`npm -v`)
- Chrome version
- Error messages
- Steps to reproduce

## Project Structure Reference

```
techflix/
├── config/           # All configuration files
│   ├── vite.config.js
│   ├── vitest.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── scripts/          # All utility scripts
│   ├── parallel-instances.sh
│   ├── start-server.sh
│   └── generate-voiceovers.js
├── server/           # Server files
│   ├── server.js
│   └── server-wsl.js
├── docs/             # Reorganized documentation
│   ├── architecture/
│   ├── guides/
│   └── reference/
└── src/              # Source code (unchanged)
```

## Notes
_Space for environment-specific notes and team customizations_

_______________