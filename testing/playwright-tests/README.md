# Playwright E2E Tests

This directory contains end-to-end tests using Playwright for automated browser testing.

## Structure

```
playwright-tests/
├── fixtures/       # Test fixtures and page objects
├── specs/          # Test specifications
├── utils/          # Test utilities and helpers
└── screenshots/    # Test failure screenshots
```

## Running Tests

```bash
# Install Playwright
npm install -D @playwright/test

# Run all tests
npx playwright test

# Run tests in headed mode
npx playwright test --headed

# Run specific test file
npx playwright test specs/episode-playback.spec.js
```

## Test Categories

- **Smoke Tests**: Critical user journeys
- **Regression Tests**: Full feature coverage
- **Visual Tests**: UI screenshot comparisons
- **Performance Tests**: Load time and metrics