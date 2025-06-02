# Debugging Guide

This guide covers the debugging tools and techniques available in TechFlix.

## Debug Panel

TechFlix includes a powerful built-in debug panel for real-time monitoring and troubleshooting.

### Accessing the Debug Panel

- **Keyboard Shortcut**: Press `Ctrl+Shift+D` (or `Cmd+Shift+D` on Mac)
- **URL Parameter**: Add `?debug=true` to any URL
- **Programmatic**: Call `window.__toggleDebugPanel()`

### Debug Panel Features

1. **Real-Time Log Stream**
   - Color-coded by log level
   - Timestamp for each entry
   - Searchable and filterable

2. **Log Level Filtering**
   - Debug (verbose)
   - Info (general)
   - Warn (warnings)
   - Error (errors only)

3. **Performance Metrics**
   - Component render times
   - Operation durations
   - Memory usage indicators

4. **Export Functionality**
   - Export logs as JSON
   - Copy to clipboard
   - Clear log history

## Using the Logger

### Basic Logging

```javascript
import logger from '@utils/logger'

// Different log levels
logger.debug('Detailed debug info', { data: someData })
logger.info('General information')
logger.warn('Warning message', { context: warningContext })
logger.error('Error occurred', { error: errorObject })
```

### Performance Timing

```javascript
// Start a timer
logger.startTimer('dataFetch')

// ... perform operation ...

// End timer and log duration
logger.endTimer('dataFetch', { recordCount: 1000 })
// Logs: "dataFetch completed in 234ms"
```

### Episode-Specific Logging

```javascript
// Log episode events
logger.logEpisodeEvent('EPISODE_PLAY', {
  episodeId: 's1e1',
  startTime: 0,
  duration: 2700
})

// Log scene transitions
logger.logSceneTransition('intro', 'main-content', 's1e1')

// Log interactions
logger.logInteraction('exercise-completed', {
  exerciseId: 'partition-quiz',
  score: 100,
  timeSpent: 45
})
```

## Performance Monitoring

### Component Performance Hook

```javascript
import { usePerformanceMonitor } from '@hooks/usePerformanceMonitor'

const MyComponent = (props) => {
  // Automatically logs render performance
  usePerformanceMonitor('MyComponent', props)
  
  return <div>Component content</div>
}
```

### Operation Timing Hook

```javascript
import { useOperationTimer } from '@hooks/usePerformanceMonitor'

const DataComponent = () => {
  const { startTimer, endTimer } = useOperationTimer('fetchData')
  
  const loadData = async () => {
    startTimer()
    const data = await fetchData()
    endTimer({ itemCount: data.length })
  }
}
```

## Common Debugging Scenarios

### 1. Episode Not Loading

```javascript
// Check episode registration
logger.debug('Episode data:', episodeData)
logger.debug('Series data:', SERIES_DATA)

// Verify imports
logger.info('Episode imported:', !!myEpisode)
```

### 2. Scene Timing Issues

```javascript
// In scene component
const MyScene = ({ time, duration }) => {
  logger.debug('Scene timing', { time, duration, progress: time/duration })
  
  // Log when specific points are reached
  useEffect(() => {
    if (time > 10) {
      logger.info('10 second mark reached')
    }
  }, [time])
}
```

### 3. Interactive Component Problems

```javascript
// Debug interaction triggers
logger.info('Interactive component rendered', { pauseAt, currentTime })

// Log user actions
const handleAnswer = (answer) => {
  logger.info('User submitted answer', { answer, timestamp: Date.now() })
}
```

### 4. Performance Issues

```javascript
// Identify slow renders
usePerformanceMonitor('SlowComponent', props, {
  warnThreshold: 16, // Warn if render takes >16ms
  errorThreshold: 50 // Error if render takes >50ms
})

// Track expensive operations
const expensiveCalculation = () => {
  logger.startTimer('heavyComputation')
  const result = performCalculation()
  logger.endTimer('heavyComputation', { resultSize: result.length })
  return result
}
```

## Browser DevTools Integration

### React DevTools

1. Install React DevTools extension
2. Use Components tab to inspect:
   - Component props and state
   - Context values
   - Performance profiling

### Performance Profiling

1. Open Chrome DevTools Performance tab
2. Start recording
3. Perform actions in TechFlix
4. Stop recording and analyze:
   - Frame rate
   - CPU usage
   - Memory consumption

### Network Monitoring

Monitor asset loading:
- Check for failed requests
- Analyze load times
- Verify caching behavior

## Debug Mode Features

When `?debug=true` is active:

1. **Verbose Logging**: All debug-level logs are shown
2. **Render Boundaries**: Visual indicators on component updates
3. **Performance Overlay**: FPS and memory usage display
4. **State Inspector**: Current app state visualization

## Troubleshooting Guide

### Issue: Blank Screen

```javascript
// Check for errors
logger.error('App failed to render', { error })

// Verify routing
logger.debug('Current route:', window.location.pathname)

// Check episode data
logger.debug('Episode exists:', !!episodeData)
```

### Issue: Choppy Animations

```javascript
// Monitor frame rate
useEffect(() => {
  let frameCount = 0
  let lastTime = performance.now()
  
  const checkFPS = () => {
    frameCount++
    const currentTime = performance.now()
    
    if (currentTime >= lastTime + 1000) {
      logger.debug('FPS:', frameCount)
      frameCount = 0
      lastTime = currentTime
    }
    
    requestAnimationFrame(checkFPS)
  }
  
  checkFPS()
}, [])
```

### Issue: Memory Leaks

```javascript
// Track component lifecycle
useEffect(() => {
  logger.debug('Component mounted')
  
  return () => {
    logger.debug('Component unmounted')
    // Ensure cleanup
  }
}, [])
```

## Production Debugging

Even in production, basic debugging is available:

1. **Error Boundaries**: Catch and log React errors
2. **Sentry Integration**: (If configured) automatic error reporting
3. **User Feedback**: Built-in feedback mechanism

## Best Practices

1. **Use Appropriate Log Levels**
   - Debug: Detailed implementation info
   - Info: User actions and flow
   - Warn: Recoverable issues
   - Error: Failures requiring attention

2. **Include Context**
   ```javascript
   logger.info('Action performed', {
     userId: user.id,
     action: 'episode_completed',
     metadata: { episodeId, duration, score }
   })
   ```

3. **Clean Up Debug Code**
   - Remove excessive debug logs before committing
   - Use conditional logging for verbose output

4. **Performance Considerations**
   - Logging has overhead; use sparingly in hot paths
   - Batch logs when possible
   - Use debug mode for detailed logging

## Quick Reference

```javascript
// Import logger
import logger from '@utils/logger'

// Basic logs
logger.debug('message', data)
logger.info('message', data)
logger.warn('message', data)
logger.error('message', data)

// Timing
logger.startTimer('operation')
logger.endTimer('operation', metadata)

// Episode events
logger.logEpisodeEvent(event, data)
logger.logSceneTransition(from, to, episodeId)
logger.logInteraction(type, data)

// Performance hooks
usePerformanceMonitor(componentName, props)
useOperationTimer(operationName)

// Debug panel
Ctrl+Shift+D or ?debug=true
```