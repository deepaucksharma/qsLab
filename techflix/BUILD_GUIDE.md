# TechFlix Build & Development Guide

## Project Overview
TechFlix is a Netflix-style streaming platform for technical content, built with React and Vite, featuring interactive technical episodes about Kafka, monitoring, and distributed systems.

## Build System
Using **Vite 5.0** for lightning-fast development experience and optimized production builds.

### Why Vite?
- ⚡ Instant server start (<1s)
- 🔥 Lightning fast HMR (<100ms)
- 📦 Optimized production builds with code splitting
- 🛠️ Zero-config TypeScript/JSX support
- 🎯 Built-in optimization features

## Development Workflow

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Mode
```bash
npm run dev
# Runs on http://localhost:3000
# Auto-opens in browser
```

### 3. Production Build
```bash
npm run build
# Creates optimized build in dist/
# ~15s build time, ~700KB total (250KB gzipped)
```

### 4. Preview Production Build
```bash
npm run preview
# Serves production build locally for testing
```

## Episode Structure

Episodes use direct imports (no dynamic loading):

```
src/episodes/
├── index.js              # Central episode registry
├── season1/
│   ├── ep1-partition-barrier/
│   ├── ep2-critical-metrics/
│   └── ep3-microservices/
├── season2/
│   ├── ep1-kafka-share-groups/
│   ├── ep2-jmx-exploration/
│   ├── ep3-prometheus-setup/
│   └── ep4-custom-ohi/
└── season3/
    └── ep3-series-finale/
```

### Current Episodes
- **Season 1: Foundations**
  - Episode 1: Breaking the Partition Barrier ✅
  - Episode 2: Performance Metrics Deep Dive ✅
  - Episode 3: Microservices Architecture ⚠️ (partial)
  
- **Season 2: Advanced Topics**
  - Episode 1: Kafka Share Groups ✅
  - Episode 2: JMX Exploration ✅
  - Episode 3: Prometheus Setup ✅
  - Episode 4: Custom OHI ✅
  
- **Season 3: Mastery**
  - Episode 3: Series Finale ✅

## Build Configuration

### Vite Features
```javascript
// vite.config.js highlights
{
  // Path aliases for clean imports
  '@components': './src/components',
  '@episodes': './src/episodes',
  '@hooks': './src/hooks',
  
  // Optimized chunk splitting
  manualChunks: {
    'react-vendor': ['react', 'react-dom'],
    'animation-vendor': ['framer-motion'],
    'ui-vendor': ['lucide-react']
  }
}
```

### Environment Variables
```bash
# Create .env file for environment-specific config
VITE_API_URL=your_api_url
VITE_DEBUG=true

# Access in code
import.meta.env.VITE_API_URL
```

## Performance Optimization

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
# Check dist/ folder for chunk sizes
```

### Current Metrics
- **Dev server start**: <1 second
- **HMR updates**: <100ms
- **Production build**: ~15 seconds
- **Bundle sizes**:
  - Main: ~450KB
  - React vendor: ~140KB
  - Animation vendor: ~80KB
  - Total gzipped: ~250KB

## Recommended Commands

### Quick Development Start
```bash
# Clean start
rm -rf node_modules dist
npm install
npm run dev
```

### Production Deployment
```bash
# Build and verify
npm run build
npm run preview
# Deploy dist/ folder to hosting
```

### Troubleshooting
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Check for port conflicts
lsof -i :3000

# Run with debug logging
DEBUG=vite:* npm run dev
```

## Key Features
- ⚛️ React 18 with Fast Refresh
- 🎨 Tailwind CSS with Netflix theme
- 🎬 Framer Motion animations
- 📱 Fully responsive design
- 🐛 Built-in debug panel (Ctrl+Shift+D)
- 📊 Performance monitoring hooks
- 🎯 Interactive learning exercises

## Development Tips

1. **Use Path Aliases**: Import with `@components/Header` instead of relative paths
2. **Check Bundle Size**: Run build periodically to monitor size
3. **Use Debug Panel**: Press Ctrl+Shift+D for real-time debugging
4. **Test Production**: Always preview build before deployment
5. **Monitor Performance**: Use built-in performance hooks

## Next Steps
- See [Episode Development Guide](docs/guides/episodes.md) for creating new content
- Check [Debugging Guide](docs/guides/debugging.md) for troubleshooting
- Review [Component Reference](docs/guides/components.md) for UI components