# Neural Learn E2E Tests

This directory contains end-to-end tests for the Neural Learn application using Playwright.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers (if not already installed):
```bash
npx playwright install
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests with UI mode (recommended for development)
```bash
npm run test:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Run tests step by step (best for debugging)
```bash
npm run test:step
```

### Debug a specific test
```bash
npm run test:debug
```

### View test report
```bash
npm run test:report
```

## Test Structure

The tests follow a user journey through the application:

1. **Initial Page Load** - Verifies all UI elements load correctly
2. **Course Grid Display** - Checks course cards and hover effects
3. **Start Course** - Tests course selection and sidebar updates
4. **Select Episode** - Verifies episode player functionality
5. **Audio Playback** - Tests play/pause and progress tracking
6. **Navigate Segments** - Tests next/previous navigation
7. **Interactive Elements** - Checks interactive cues (if present)
8. **Progress Tracking** - Verifies points and progress updates
9. **Responsive Design** - Tests mobile and tablet viewports
10. **Complete User Journey** - Full flow from start to segment completion

## Manual Testing First

Before running automated tests, it's recommended to:

1. Start the application: `python3 ../app.py`
2. Open http://localhost:5000
3. Manually verify each step in `E2E_MANUAL_TEST_PLAN.md`
4. Note any issues or unexpected behaviors
5. Update tests accordingly

## Test Configuration

- Base URL: http://localhost:5000
- Default browser: Chromium
- Test timeout: 30 seconds
- Auto-starts Flask server
- Screenshots on failure
- Video on failure
- Trace on retry

## Tips

- Use `page.pause()` in tests to pause execution and inspect
- Check `test-results/` folder for failure artifacts
- Use `--grep` to run specific tests: `npx playwright test --grep "Step 1"`
- Set `PWDEBUG=1` for step-by-step debugging

## Common Issues

1. **Server not starting**: Ensure Python 3 and Flask are installed
2. **Audio not playing**: Check if audio files exist in `../audio_outputs/`
3. **Courses not loading**: Verify database initialization
4. **Timeouts**: Increase timeout in playwright.config.js if needed