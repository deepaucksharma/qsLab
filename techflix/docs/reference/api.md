# API Reference

Complete API documentation for TechFlix modules and utilities.

## Core APIs

### Logger API

Located at `@utils/logger`

#### Methods

##### `logger.debug(message, data?)`
Log debug-level information.

```javascript
logger.debug('Component rendered', { props: componentProps })
```

##### `logger.info(message, data?)`
Log general information.

```javascript
logger.info('User action', { action: 'play_episode', episodeId: 's1e1' })
```

##### `logger.warn(message, data?)`
Log warnings.

```javascript
logger.warn('Slow render detected', { duration: 150 })
```

##### `logger.error(message, data?)`
Log errors.

```javascript
logger.error('Failed to load episode', { error: errorObject })
```

##### `logger.startTimer(label)`
Start a performance timer.

```javascript
logger.startTimer('dataFetch')
```

##### `logger.endTimer(label, metadata?)`
End a timer and log duration.

```javascript
logger.endTimer('dataFetch', { itemCount: 100 })
```

### Episode Store API

Located at `@stores/episodeStore`

#### State

```javascript
{
  seasons: Array<Season>,
  currentEpisode: Episode | null,
  currentTime: number,
  isPlaying: boolean
}
```

#### Actions

##### `setCurrentEpisode(episode)`
Set the active episode.

##### `setCurrentTime(time)`
Update playback time.

##### `setIsPlaying(playing)`
Toggle play/pause state.

### Performance Hooks

#### `usePerformanceMonitor(name, props, options?)`

Monitor component render performance.

```javascript
import { usePerformanceMonitor } from '@hooks/usePerformanceMonitor'

usePerformanceMonitor('MyComponent', props, {
  warnThreshold: 16,
  errorThreshold: 50
})
```

#### `useOperationTimer(name)`

Time specific operations.

```javascript
const { startTimer, endTimer } = useOperationTimer('fetchData')

const loadData = async () => {
  startTimer()
  const data = await fetch('/api/data')
  endTimer({ count: data.length })
}
```

## Episode API

### Episode Structure

```typescript
interface Episode {
  metadata: {
    seriesId: string
    seasonNumber: number
    episodeNumber: number
    title: string
    synopsis: string
    runtime: number // minutes
    rating: 'Beginner' | 'Intermediate' | 'Advanced'
    genres: string[]
  }
  scenes: Scene[]
  interactiveComponents?: InteractiveComponent[]
}
```

### Scene Structure

```typescript
interface Scene {
  id: string
  title: string
  duration: number // seconds
  component: React.Component
}
```

### Interactive Component Structure

```typescript
interface InteractiveComponent {
  component: React.Component
  pauseAt: number // seconds
  duration?: number // optional timeout
}
```

## Utility Functions

### Time Formatting

```javascript
import { formatTime } from '@utils/time'

formatTime(125) // "2:05"
formatTime(3661) // "1:01:01"
```

### Progress Calculation

```javascript
import { calculateProgress } from '@utils/progress'

calculateProgress(30, 120) // 0.25 (25%)
```

## Debug Panel API

### Accessing Debug Panel

```javascript
// Toggle programmatically
window.__toggleDebugPanel()

// Check if open
window.__isDebugPanelOpen()

// Export logs
window.__exportDebugLogs()
```

### Debug URL Parameters

- `?debug=true` - Auto-open debug panel
- `?scene=2` - Start at specific scene
- `?time=300` - Start at specific time (seconds)

## Environment Variables

Access via `import.meta.env`:

```javascript
const apiUrl = import.meta.env.VITE_API_URL
const isDebug = import.meta.env.VITE_DEBUG === 'true'
```

Available variables:
- `VITE_API_URL` - Backend API URL
- `VITE_DEBUG` - Enable debug mode
- `VITE_ANALYTICS_ID` - Analytics tracking ID

## Error Handling

### Error Boundaries

Wrap components in error boundaries:

```javascript
import ErrorBoundary from '@components/ErrorBoundary'

<ErrorBoundary fallback={<ErrorFallback />}>
  <YourComponent />
</ErrorBoundary>
```

### Global Error Handler

```javascript
window.addEventListener('error', (event) => {
  logger.error('Global error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno
  })
})
```

## Event System

### Episode Events

```javascript
// Listen for episode events
window.addEventListener('episode:play', (e) => {
  console.log('Episode started:', e.detail)
})

// Dispatch episode events
window.dispatchEvent(new CustomEvent('episode:play', {
  detail: { episodeId: 's1e1' }
}))
```

Available events:
- `episode:play`
- `episode:pause`
- `episode:complete`
- `scene:change`
- `interaction:start`
- `interaction:complete`