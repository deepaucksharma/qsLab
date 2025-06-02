# Development Guide

This guide covers the development setup, workflow, and best practices for working on TechFlix.

## Prerequisites

- Node.js 18+ and npm 9+
- Git
- Modern browser (Chrome, Firefox, Safari, Edge)
- Code editor (VS Code recommended)

## Initial Setup

### 1. Clone Repository

```bash
git clone [repository-url]
cd techflix
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file for environment-specific settings:

```bash
# .env
VITE_API_URL=http://localhost:3001
VITE_DEBUG=true
VITE_ANALYTICS_ID=your-analytics-id
```

### 4. Start Development Server

```bash
npm run dev
# Opens at http://localhost:3000
```

## Development Workflow

### Code Organization

```
src/
├── components/       # Reusable UI components
│   ├── scenes/      # Episode scene components
│   └── ...         
├── episodes/        # Episode definitions
├── data/           # Static data and constants
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
├── pages/          # Route pages
├── layouts/        # Layout components
├── router/         # Routing configuration
└── styles/         # Global styles
```

### Import Aliases

Use path aliases for cleaner imports:

```javascript
// Instead of: import Header from '../../../components/Header'
import Header from '@components/Header'

// Available aliases:
// @components, @episodes, @hooks, @utils, @data, @styles
```

### Component Development

#### Basic Component Structure

```javascript
// src/components/MyComponent.jsx
import React from 'react'
import { motion } from 'framer-motion'
import logger from '@utils/logger'

const MyComponent = ({ title, data }) => {
  // Log component lifecycle (dev only)
  useEffect(() => {
    logger.debug('MyComponent mounted', { title })
    return () => logger.debug('MyComponent unmounted')
  }, [])
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="my-component"
    >
      <h2>{title}</h2>
      {/* Component content */}
    </motion.div>
  )
}

export default MyComponent
```

#### Scene Component Pattern

```javascript
// src/components/scenes/MyScene.jsx
const MyScene = ({ time, duration }) => {
  const progress = time / duration
  
  return (
    <div className="scene-container">
      {/* Progressive content based on time */}
      {progress > 0.2 && <IntroContent />}
      {progress > 0.5 && <MainContent />}
      {progress > 0.8 && <Summary />}
    </div>
  )
}
```

### Styling Guidelines

#### Tailwind CSS

Primary styling method using utility classes:

```jsx
<div className="bg-netflix-black text-white p-6 rounded-lg">
  <h1 className="text-3xl font-bold mb-4">Title</h1>
  <p className="text-gray-300">Content</p>
</div>
```

#### Custom CSS

For complex animations or specific needs:

```css
/* src/styles/custom.css */
.particle-effect {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}
```

#### Design System Colors

```javascript
// Netflix-inspired color palette
colors: {
  'netflix-black': '#141414',
  'netflix-red': '#e50914',
  'netflix-gray': '#808080',
  'netflix-hover': '#b3b3b3'
}
```

### State Management

#### Local State

For component-specific state:

```javascript
const [isPlaying, setIsPlaying] = useState(false)
const [currentTime, setCurrentTime] = useState(0)
```

#### Context API

For global state (app-wide):

```javascript
import { useApp } from '@/contexts/AppContext'

const MyComponent = () => {
  const { currentEpisode, setCurrentEpisode } = useApp()
}
```

### Performance Best Practices

#### 1. Code Splitting

Episodes are automatically code-split:

```javascript
// Each episode creates its own chunk
import { episode1 } from '@episodes/season1/ep1'
```

#### 2. Lazy Loading

For heavy components:

```javascript
const HeavyComponent = lazy(() => import('./HeavyComponent'))

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <HeavyComponent />
</Suspense>
```

#### 3. Memoization

Prevent unnecessary re-renders:

```javascript
// Memoize components
const ExpensiveComponent = memo(({ data }) => {
  return <div>{/* Expensive render */}</div>
})

// Memoize values
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data)
}, [data])

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething()
}, [dependency])
```

#### 4. Image Optimization

```javascript
// Use optimized formats
<img src="/images/hero.webp" alt="Hero" loading="lazy" />

// Provide multiple sizes
<picture>
  <source srcSet="/images/hero-mobile.webp" media="(max-width: 768px)" />
  <source srcSet="/images/hero-desktop.webp" media="(min-width: 769px)" />
  <img src="/images/hero.jpg" alt="Hero" />
</picture>
```

### Testing

#### Unit Tests

```javascript
// MyComponent.test.jsx
import { render, screen } from '@testing-library/react'
import MyComponent from './MyComponent'

test('renders title', () => {
  render(<MyComponent title="Test Title" />)
  expect(screen.getByText('Test Title')).toBeInTheDocument()
})
```

#### Integration Tests

```javascript
// Episode.test.jsx
test('episode plays correctly', async () => {
  render(<Episode episodeData={testEpisode} />)
  
  const playButton = screen.getByRole('button', { name: /play/i })
  fireEvent.click(playButton)
  
  await waitFor(() => {
    expect(screen.getByText('Scene 1')).toBeInTheDocument()
  })
})
```

### Git Workflow

#### Branch Naming

```bash
feature/add-new-episode
fix/scene-timing-issue
refactor/optimize-animations
docs/update-readme
```

#### Commit Messages

```bash
# Format: type(scope): description

feat(episodes): add Kafka Share Groups episode
fix(player): resolve scene transition timing
refactor(components): optimize scene rendering
docs(readme): update installation instructions
```

#### Pull Request Process

1. Create feature branch
2. Make changes
3. Run tests: `npm test`
4. Build locally: `npm run build`
5. Create PR with description
6. Address review feedback

### Debugging Tips

#### 1. Use Debug Panel

Press `Ctrl+Shift+D` for real-time debugging info

#### 2. Browser DevTools

- React DevTools for component inspection
- Network tab for asset loading
- Performance tab for profiling

#### 3. Console Helpers

```javascript
// Temporarily expose for debugging
window.debugApp = {
  state: appState,
  logger: logger,
  resetEpisode: () => setCurrentTime(0)
}
```

### Build Optimization

#### Development Build

```bash
npm run dev
# Fast builds, HMR, source maps
```

#### Production Build

```bash
npm run build
# Minified, optimized, code-split
```

#### Analyze Bundle

```bash
npm run build
# Check dist/ for chunk sizes
# Use source-map-explorer for detailed analysis
```

### Deployment Checklist

Before deploying:

- [ ] All tests pass
- [ ] No console errors
- [ ] Build completes successfully
- [ ] Bundle size is reasonable (<1MB main)
- [ ] Performance is smooth (60fps)
- [ ] Works in all target browsers
- [ ] Environment variables are set
- [ ] Debug mode is disabled

### Common Issues

#### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Build Failures

```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run build
```

## VS Code Setup

### Recommended Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets",
    "formulahendry.auto-rename-tag"
  ]
}
```

### Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.experimental.classRegex": [
    ["className=\"([^\"]*)", "([^\"]*)""]
  ]
}
```

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [Project README](../../README.md)