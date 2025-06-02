# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains **TechFlix**, a Netflix-style streaming platform for technical educational content built with React, Tailwind CSS, and Vite. The platform specializes in teaching Kafka 4.0 Share Groups and New Relic observability through interactive, cinematic episodes.

## Common Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Type check (TypeScript)
npm run type-check
```

## High-Level Architecture

### Episode System Architecture
The content is organized in an episode-based structure where each episode contains:

1. **Episode Module** (`src/episodes/season{X}/ep{Y}-{name}/index.js`):
   - Exports episode metadata and scene array
   - Directly imports scene components (no dynamic loading)
   - Defines interactive moments with timestamps

2. **Scene Components** (`src/components/scenes/*.jsx`):
   - Time-based animations synchronized with narration
   - Receives `time` and `duration` props for progress tracking
   - Self-contained visual experiences with particle effects and animations

3. **Interactive System**:
   - `NetflixEpisodePlayer` manages playback and pauses for interactions
   - `InteractiveStateMachine` component for learning exercises
   - Interactive moments defined with timestamps in episode data

### State Management
- **Zustand Store** (`src/store/episodeStore.js`): 
  - Manages episode progress, current episode/season
  - Persists progress to localStorage
  - Tracks continue watching functionality
- **React Context** for UI state and player controls

### Content Structure
```
Series: Tech Insights
├── Season 1: Foundations
│   ├── Episode 1: Breaking the Partition Barrier
│   ├── Episode 2: Performance Metrics Deep Dive
│   └── Episode 3: Microservices Architecture (partial)
├── Season 2: Advanced Topics
│   ├── Episode 1: Kafka Share Groups
│   ├── Episode 2: JMX Exploration
│   ├── Episode 3: Prometheus Setup
│   └── Episode 4: Custom OHI
└── Season 3: Mastery
    └── Episode 3: Series Finale
```

### Key Architectural Patterns

1. **Episode Loading**:
   - Episodes are imported directly in `src/episodes/index.js`
   - Referenced in `src/data/seriesData.js` with metadata
   - Scene components are React components, not plugins

2. **Playback Engine**:
   - Time-based progression with 100ms intervals
   - Automatic scene transitions based on duration
   - Pause on interactive moments
   - Netflix-style controls overlay

3. **Animation System**:
   - Framer Motion for component animations
   - CSS animations for particles and effects
   - Time-synchronized scene animations
   - Progress-based visual changes

### Path Aliases (Vite)
```javascript
'@': './src'
'@components': './src/components'
'@episodes': './src/episodes'
'@hooks': './src/hooks'
'@utils': './src/utils'
'@data': './src/data'
'@styles': './src/styles'
'@pages': './src/pages'
'@store': './src/store'
'@layouts': './src/layouts'
'@router': './src/router'
```

### Important Implementation Details

- **Episode Player**: Custom implementation, not using React Player for episodes
- **Scene Timing**: All durations in seconds
- **Interactive Components**: Mapped by string reference in `NetflixEpisodePlayer`
- **Styling**: Tailwind CSS with Netflix-inspired color scheme
- **Build Tool**: Vite (not Parcel) - fast development and optimized builds
- **Port**: Development server runs on port 3000 (not 1234)
- **No Backend**: All content is frontend-only
- **No Authentication**: Public access to all content

## Episode Development

To add a new episode:
1. Create directory: `src/episodes/season{X}/ep{Y}-{name}/`
2. Export episode data with metadata and scenes array
3. Import scene components from `src/components/scenes/`
4. Add to exports in `src/episodes/index.js`
5. Reference in `src/data/seriesData.js`

## Debugging and Logging

The application includes comprehensive debugging tools:

### Debug Panel
- Press `Ctrl+Shift+D` to toggle the debug panel
- Add `?debug=true` to URL to auto-open debug panel
- Features:
  - Real-time log streaming
  - Log level filtering (debug, info, warn, error)
  - Search functionality
  - Export logs to JSON
  - Performance metrics

### Logger API
```javascript
import logger from '@utils/logger'

// Basic logging
logger.debug('Debug message', { data })
logger.info('Info message', { data })
logger.warn('Warning message', { data })
logger.error('Error message', { data })

// Performance timing
logger.startTimer('operationName')
// ... do work ...
logger.endTimer('operationName', { metadata })

// Episode events
logger.logEpisodeEvent('EPISODE_PLAY', { episodeId, duration })
logger.logSceneTransition(fromScene, toScene, episodeId)
```

### Performance Monitoring Hooks
```javascript
import { usePerformanceMonitor, useOperationTimer } from '@hooks/usePerformanceMonitor'

// Monitor component performance
usePerformanceMonitor('ComponentName', props)

// Time specific operations
const { startTimer, endTimer } = useOperationTimer('fetchData')
```

### Debugging URLs
- `http://localhost:3000/?debug=true` - Enable debug mode
- Debug data is stored in localStorage and can be exported