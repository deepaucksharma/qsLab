# Component Reference Guide

This guide covers the reusable components available in TechFlix.

## Core Components

### Layout Components

#### MainLayout
The primary layout wrapper for all pages.

```javascript
import MainLayout from '@layouts/MainLayout'

<MainLayout>
  <YourPageContent />
</MainLayout>
```

### UI Components

#### Header
Netflix-style navigation header with search functionality.

```javascript
import Header from '@components/Header'

<Header />
```

#### EpisodeCard
Display card for episode information.

```javascript
import EpisodeCard from '@components/EpisodeCard'

<EpisodeCard 
  episode={episodeData}
  onPlay={() => handlePlay()}
/>
```

### Scene Components

#### BaseScene
Base component for all episode scenes.

```javascript
import BaseScene from '@components/scenes/BaseScene'

const MyScene = ({ time, duration }) => {
  return (
    <BaseScene title="Scene Title">
      {/* Scene content */}
    </BaseScene>
  )
}
```

#### InteractiveQuiz
Quiz component for interactive learning.

```javascript
import InteractiveQuiz from '@components/InteractiveQuiz'

<InteractiveQuiz
  question="What is Kafka's main purpose?"
  options={['A', 'B', 'C', 'D']}
  correctAnswer={0}
  onComplete={(correct) => handleComplete(correct)}
/>
```

### Animation Components

#### ParticleField
Background particle animation effect.

```javascript
import ParticleField from '@components/ParticleField'

<ParticleField 
  count={50}
  color="#e50914"
  speed={0.5}
/>
```

#### GlowEffect
Glowing highlight effect for emphasis.

```javascript
import GlowEffect from '@components/GlowEffect'

<GlowEffect intensity={0.8}>
  <YourContent />
</GlowEffect>
```

### Utility Components

#### LoadingSpinner
Loading indicator with Netflix styling.

```javascript
import LoadingSpinner from '@components/LoadingSpinner'

<LoadingSpinner size="large" />
```

#### ProgressBar
Episode progress indicator.

```javascript
import ProgressBar from '@components/ProgressBar'

<ProgressBar 
  current={currentTime}
  total={duration}
/>
```

## Component Patterns

### Time-Based Components

Components that react to playback time:

```javascript
const TimeBasedComponent = ({ time, duration }) => {
  const progress = time / duration
  
  return (
    <>
      {progress > 0.2 && <IntroContent />}
      {progress > 0.5 && <MainContent />}
      {progress > 0.8 && <OutroContent />}
    </>
  )
}
```

### Interactive Components

Components that pause playback for interaction:

```javascript
const InteractiveComponent = ({ onComplete }) => {
  const handleInteraction = () => {
    // Process interaction
    onComplete()
  }
  
  return (
    <div className="interactive-container">
      <button onClick={handleInteraction}>Continue</button>
    </div>
  )
}
```

## Styling Components

All components use Tailwind CSS classes with Netflix-inspired theme:

```javascript
// Theme colors available
const colors = {
  'netflix-black': '#141414',
  'netflix-red': '#e50914',
  'netflix-gray': '#808080',
  'netflix-hover': '#b3b3b3'
}
```

## Best Practices

1. **Always use path aliases** for imports
2. **Implement proper loading states** for async content
3. **Add proper error boundaries** for production
4. **Use memo for expensive components** to prevent re-renders
5. **Follow accessibility guidelines** (ARIA labels, keyboard navigation)

## Component Development

When creating new components:

1. Place in appropriate directory (`components/`, `components/scenes/`, etc.)
2. Use functional components with hooks
3. Add PropTypes or TypeScript types
4. Include JSDoc comments
5. Export from component index file

Example component structure:

```javascript
/**
 * MyComponent - Brief description
 * @param {Object} props
 * @param {string} props.title - Component title
 * @param {Function} props.onClick - Click handler
 */
const MyComponent = ({ title, onClick }) => {
  return (
    <div className="my-component">
      <h2>{title}</h2>
      <button onClick={onClick}>Action</button>
    </div>
  )
}

MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func
}

export default MyComponent
```