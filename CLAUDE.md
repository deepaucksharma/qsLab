# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains **TechFlix**, a Netflix-style streaming platform for technical educational content built with React, Tailwind CSS, and Vite. The platform specializes in teaching Kafka 4.0 Share Groups and New Relic observability through interactive, cinematic episodes.

## Recent Project Reorganization (Important)

The project underwent a major reorganization in January 2025:
- Configuration files moved to `config/` directory  
- Scripts moved to `scripts/` directory
- Server files moved to `server/` directory
- Documentation reorganized into `docs/` with hierarchical structure
- All npm scripts now use `--config` flags

## Common Development Commands

```bash
# Development - Working directory: techflix/
cd techflix/

# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Start on specific port
PORT=3001 npm run dev

# Build for production
npm run build

# Preview production build  
npm run preview

# Run tests (uses config/vitest.config.js)
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run single test file
npm test -- src/components/Header.test.jsx

# Linting and formatting
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm run type-check

# Bundle analysis
npm run build:analyze

# Parallel testing instances
./scripts/parallel-instances.sh

# Start server (after build)
node server/server.js
```

## High-Level Architecture

### Episode System Architecture

The platform uses a sophisticated episode-based content delivery system:

1. **Episode Registry** (`src/episodes/index.js`):
   ```javascript
   // All episodes are imported and exported here
   export { episode as s1e1 } from './season1/ep1-partition-barrier'
   ```

2. **Episode Structure** (`src/episodes/season{X}/ep{Y}-{name}/index.js`):
   - Exports episode metadata (title, runtime, description)
   - Imports and references scene components
   - Defines interactive moments with precise timestamps
   - No dynamic loading - all imports are static

3. **Scene Components** (`src/components/scenes/*.jsx`):
   - Receive `time` and `duration` props for animation synchronization
   - Implement phase-based animations tied to playback progress
   - Self-contained visual experiences with particle effects
   - Use Framer Motion for complex animations

4. **Interactive System**:
   - `NetflixEpisodePlayer` controls playback and handles interactions
   - Pauses automatically at interactive moments
   - `InteractiveStateMachine` manages quizzes and decision trees
   - Results tracked in global state

### State Management Architecture

- **Zustand Store** (`src/store/episodeStore.js`):
  - Episode progress persistence to localStorage
  - Current episode/season tracking
  - User preferences and settings
  - Continue watching functionality

- **Audio System** (`src/utils/audioManagerV2.js`):
  - Centralized audio context management
  - Scene-based audio lifecycle
  - VoiceOver integration with TTS
  - Volume and mute state management

### Content Organization

```
Series: Tech Insights (3 Seasons, 10+ Episodes)
├── Season 1: Foundations
│   ├── Episode 1: Breaking the Partition Barrier
│   ├── Episode 2: Performance Metrics Deep Dive
│   └── Episode 3: Microservices Architecture
├── Season 2: Advanced Topics (7 episodes)
│   ├── Episode 1: Kafka Share Groups (Kafka 4.0)
│   ├── Episode 2-4: Monitoring stack (JMX, Prometheus, OHI)
│   └── Episode 5-7: Advanced Kafka patterns
└── Season 3: Mastery
    └── Episode 3: Series Finale
```

### Key Architectural Patterns

1. **Time-Based Animation System**:
   - 100ms tick intervals for smooth playback
   - Scene progress calculated as `(currentTime - startTime) / duration`
   - Animations synchronized to progress percentage
   - Phase-based reveals for cinematic effect

2. **Component Communication**:
   - Player → Scene: time, duration, isPlaying props
   - Scene → Player: onComplete callbacks
   - Global → Components: Zustand store subscriptions
   - Debug → All: Logger events and performance metrics

3. **Build Optimization**:
   - Code splitting by season and vendor
   - Lazy loading for heavy components
   - PWA support with service workers
   - Optimized chunk sizes (<500KB warning)

### Path Aliases (Vite)

All imports use these aliases defined in `config/vite.config.js`:
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

## Critical Implementation Details

### Episode Player Specifics
- Custom implementation (NOT React Player)
- Scene transitions use opacity fades
- Interactive components mapped by ID strings
- Playback state persists across navigation

### Scene Component Requirements
- Must accept `time` and `duration` props
- Should implement `progress` calculation
- Use `isPlaying` for pause behavior
- Return null or placeholder during load

### Audio System Rules
- One audio context per session
- Scene audio cleaned up on unmount
- VoiceOver can be toggled globally
- Volume settings persist in localStorage

### Performance Considerations
- Keep scene components under 200KB
- Minimize re-renders with React.memo
- Use CSS transforms for animations
- Debounce progress updates

## Debugging and Development Tools

### Debug Panel (Ctrl+Shift+D)
- Real-time log streaming with filtering
- Performance metrics display
- State inspection tools
- Scene jump navigation
- Export logs functionality

### Logger API Usage
```javascript
import logger from '@utils/logger'

// Component lifecycle
logger.debug('Component mounted', { props })

// Performance tracking
logger.startTimer('scene-load')
// ... loading logic ...
logger.endTimer('scene-load', { sceneId })

// Episode events
logger.logEpisodeEvent('EPISODE_START', { episodeId })
logger.logSceneTransition(fromScene, toScene, episodeId)
```

### Performance Monitoring
```javascript
import { usePerformanceMonitor } from '@hooks/usePerformanceMonitor'

// In components
usePerformanceMonitor('SceneName', props)
```

## Testing Strategy

### Manual Testing Setup
```bash
# Single instance
npm run dev

# Parallel testing (4 instances)
./scripts/parallel-instances.sh

# Specific test focus
PORT=3001 npm run dev  # Functional
PORT=3002 npm run dev  # Visual
PORT=3003 npm run dev  # Integration
PORT=3004 npm run dev  # Performance
```

### Test Categories
1. **Functional**: Core features and user flows
2. **Visual**: UI consistency and design system
3. **Integration**: Cross-component interactions  
4. **Performance**: Load times and runtime metrics

Test documentation located in `/testing/` directory with comprehensive test cases and templates.

## Common Troubleshooting

### Build Issues
- Clear `.parcel-cache` if build artifacts cause issues
- Check Node version (requires 18+)
- Verify all config files are in `config/` directory

### Audio Problems
- Check browser autoplay policies
- Verify audio files exist in public directory
- Use debug panel to check audio state

### Performance Issues
- Use React DevTools Profiler
- Check for unnecessary re-renders
- Monitor bundle size with `npm run build:analyze`