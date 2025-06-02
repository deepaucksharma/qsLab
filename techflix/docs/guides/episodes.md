# Episode Development Guide

This guide covers everything you need to know about creating episodes for TechFlix.

## Episode Structure

Each episode consists of:
1. **Metadata** - Title, runtime, synopsis, etc.
2. **Scenes** - Time-based visual components
3. **Interactions** - Optional pause points for exercises

## Creating a New Episode

### 1. Create Episode Directory

```bash
src/episodes/seasonX/epY-episode-name/
└── index.js
```

### 2. Define Episode Data

```javascript
// src/episodes/seasonX/epY-episode-name/index.js
import Scene1Component from '../../../components/scenes/Scene1Component'
import Scene2Component from '../../../components/scenes/Scene2Component'

export const myEpisode = {
  metadata: {
    seriesId: 'tech-insights',
    seasonNumber: 1,
    episodeNumber: 1,
    title: 'Episode Title',
    synopsis: 'Brief description of the episode content',
    runtime: 45, // minutes
    rating: 'Intermediate', // Beginner/Intermediate/Advanced
    genres: ['Topic1', 'Topic2']
  },
  scenes: [
    {
      id: 'scene-1',
      title: 'Opening Scene',
      duration: 300, // seconds
      component: Scene1Component
    },
    {
      id: 'scene-2', 
      title: 'Main Content',
      duration: 600,
      component: Scene2Component
    }
  ],
  interactiveComponents: {
    'exercise-1': {
      component: ExerciseComponent,
      pauseAt: 450 // seconds
    }
  }
}
```

### 3. Create Scene Components

```javascript
// src/components/scenes/MySceneComponent.jsx
import React from 'react'
import { motion } from 'framer-motion'

const MySceneComponent = ({ time, duration }) => {
  // Calculate progress (0 to 1)
  const progress = time / duration
  
  return (
    <div className="scene-container">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <h1>Scene Title</h1>
        {/* Scene content */}
      </motion.div>
      
      {/* Time-based animations */}
      {progress > 0.5 && (
        <motion.div
          initial={{ x: -100 }}
          animate={{ x: 0 }}
        >
          Additional content appears halfway through
        </motion.div>
      )}
    </div>
  )
}

export default MySceneComponent
```

### 4. Register Episode

Add to `src/episodes/index.js`:

```javascript
import { myEpisode } from './seasonX/epY-episode-name'

export { 
  // ... other episodes
  myEpisode
}
```

### 5. Add to Series Data

Update `src/data/seriesData.js`:

```javascript
import { myEpisode } from '../episodes'

export const SERIES_DATA = {
  seasons: [
    {
      number: X,
      episodes: [
        {
          number: Y,
          title: "Episode Title",
          episodeData: myEpisode,
          hasContent: true
        }
      ]
    }
  ]
}
```

## Scene Design Guidelines

### Time-Based Progression

Scenes receive `time` and `duration` props:
- `time`: Current playback time in seconds
- `duration`: Total scene duration in seconds

Use these to create progressive animations:

```javascript
const progress = time / duration

// Show different content based on progress
{progress < 0.3 && <Introduction />}
{progress >= 0.3 && progress < 0.7 && <MainContent />}
{progress >= 0.7 && <Summary />}
```

### Animation Best Practices

1. **Entry Animations**: Use Framer Motion for smooth entrances
2. **Progress-Based Reveals**: Show content progressively
3. **Exit Transitions**: Clean transitions between scenes
4. **Performance**: Avoid heavy computations in render

### Visual Effects

Common effects used in TechFlix:

```javascript
// Particle effect
<div className="particle-container">
  {[...Array(20)].map((_, i) => (
    <div key={i} className="particle" />
  ))}
</div>

// Glow effect
<div className="glow-effect">
  <div className="glow-inner" />
</div>

// Code display with syntax highlighting
<pre className="code-block">
  <code>{codeContent}</code>
</pre>
```

## Interactive Components

### Creating Interactions

```javascript
const InteractiveExercise = ({ onComplete }) => {
  const [answer, setAnswer] = useState('')
  
  const handleSubmit = () => {
    if (validateAnswer(answer)) {
      onComplete()
    }
  }
  
  return (
    <div className="interactive-exercise">
      <h2>Quick Exercise</h2>
      <input 
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  )
}
```

### Registering Interactions

In your episode definition:

```javascript
interactiveComponents: {
  'partition-exercise': {
    component: PartitionExercise,
    pauseAt: 300, // Pause at 5 minutes
    duration: 60  // Give 60 seconds to complete
  }
}
```

## Testing Episodes

### Local Testing

1. Start dev server: `npm run dev`
2. Navigate to your episode
3. Use debug panel (Ctrl+Shift+D) to monitor:
   - Scene transitions
   - Timing accuracy
   - Performance metrics

### Common Issues

- **Scene not rendering**: Check component imports
- **Timing off**: Verify duration calculations
- **Animations janky**: Check for performance issues
- **Interactive not pausing**: Verify pauseAt timing

## Performance Considerations

1. **Lazy Load Heavy Assets**: Import large resources conditionally
2. **Optimize Animations**: Use CSS transforms over position changes
3. **Memoize Expensive Calculations**: Use React.memo and useMemo
4. **Monitor Bundle Size**: Keep scenes under 100KB each

## Episode Checklist

Before submitting an episode:

- [ ] All scenes render correctly
- [ ] Timing matches narration (if applicable)
- [ ] Interactions work as expected
- [ ] No console errors
- [ ] Performance is smooth (60fps)
- [ ] Content is accurate and clear
- [ ] Episode exports correctly
- [ ] Added to series data
- [ ] Tested on multiple browsers