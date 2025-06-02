# TechFlix Debug Guide

## Accessing Debug Features

### 1. Debug Panel
The debug panel provides real-time visibility into application behavior.

**To open:**
- Press `Ctrl+Shift+D` anywhere in the app
- OR add `?debug=true` to the URL: http://localhost:1234/?debug=true
- OR click the bug icon in the bottom-right corner

**Features:**
- **Real-time logs** - See all application events as they happen
- **Log filtering** - Filter by level: All, Errors, Warnings, Info
- **Search** - Search through logs for specific content
- **Export** - Download logs as JSON for analysis
- **Clear** - Clear current log buffer
- **Auto-scroll** - Toggle automatic scrolling to latest logs

### 2. Console Access
Open browser DevTools console and access the logger:

```javascript
// Access the logger
techflixLogger.info('Manual log entry', { custom: 'data' })

// Change log level
techflixLogger.setLogLevel('debug') // Options: debug, info, warn, error

// Export logs programmatically
techflixLogger.exportLogs()

// Search logs
techflixLogger.searchLogs('episode')

// Performance timing
techflixLogger.startTimer('myOperation')
// ... do something ...
techflixLogger.endTimer('myOperation')
```

## What Gets Logged

### Application Events
- **App Initialization** - Seasons/episodes loaded, environment info
- **Episode Events** - Play, pause, complete, load times
- **Scene Transitions** - Scene changes with timing data
- **Interactive Elements** - Start/complete of interactive moments
- **Errors** - Any errors with full stack traces

### Performance Metrics
- **Load Times** - Episode and scene load durations
- **Component Renders** - Re-render counts and timing
- **Memory Usage** - Heap size monitoring (if supported)
- **Network Requests** - API calls with timing (if implemented)

## Debug URL Parameters

- `?debug=true` - Enable debug mode and auto-open panel
- `?debug=false` - Disable debug mode

## Troubleshooting Common Issues

### Episode Won't Play
1. Open debug panel
2. Look for red error entries
3. Check for "Episode loading failed" messages
4. Verify episode data structure in logs

### Performance Issues
1. Enable debug mode
2. Look for "Component re-rendered" messages
3. Check for excessive re-renders
4. Monitor "Memory usage" logs

### Scene Transition Problems
1. Filter logs by "Scene transition"
2. Verify scene IDs and durations
3. Check for timing-related errors

## Exporting Debug Data

1. Click the download icon in debug panel
2. File will be saved as `techflix-logs-{timestamp}.json`
3. Contains:
   - All current logs
   - Stored error logs
   - Browser/environment metadata
   - Current timestamp

## Performance Monitoring

The app includes performance hooks you can use in components:

```javascript
import { usePerformanceMonitor } from './hooks/usePerformanceMonitor'

// In your component
usePerformanceMonitor('MyComponent', props)
```

This will automatically log:
- Component mount/unmount times
- Render counts
- Re-render frequency

## Best Practices

1. **Development** - Keep debug panel open to catch issues early
2. **Testing** - Export logs after test runs for analysis
3. **Production** - Use `?debug=true` for troubleshooting user issues
4. **Performance** - Monitor re-render counts during development
5. **Errors** - All errors are automatically logged with stack traces