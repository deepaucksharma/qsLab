# TechFlix Episode Specification v1.0

## Overview

A TechFlix episode is a self-contained plugin that delivers educational content through a series of scenes. Each episode must conform to this specification to work properly in the TechFlix system.

## Required Structure

```
episode-name/
├── manifest.json          # Episode metadata (REQUIRED)
├── index.js              # Main episode class (REQUIRED)
├── scenes/               # Scene components directory (REQUIRED)
│   └── *.jsx            # Individual scene components
├── assets/              # Static assets (OPTIONAL)
│   ├── thumbnail.jpg    # Episode thumbnail (RECOMMENDED)
│   └── *.*             # Other assets (images, videos, etc.)
└── README.md           # Documentation (RECOMMENDED)
```

## 1. Manifest.json Specification

The manifest file must be valid JSON with the following structure:

```json
{
  "version": "1.0.0",
  "name": "episode-id",           // Unique identifier (kebab-case)
  "displayName": "Episode Title",  // Human-readable title
  "description": "Brief description of the episode",
  "author": "Author Name",
  "episodeClass": "./index.js",   // Entry point (always "./index.js")
  "seasonNumber": 1,              // Integer >= 1
  "episodeNumber": 1,             // Integer >= 1
  "dependencies": [],             // Array of dependency names (optional)
  "assets": {                     // Asset declarations (optional)
    "thumbnails": ["./assets/thumbnail.jpg"],
    "images": [],
    "videos": []
  },
  "config": {                     // Custom configuration (optional)
    "runtime": 45,                // Runtime in minutes
    "level": "Intermediate",      // Difficulty level
    "tags": ["topic1", "topic2"]  // Topic tags
  }
}
```

### Manifest Rules:
- `version` must be "1.0.0" (for compatibility)
- `name` must be unique, lowercase, kebab-case
- `episodeClass` must be "./index.js"
- `seasonNumber` and `episodeNumber` must be positive integers
- File paths in `assets` must be relative to episode directory

## 2. Episode Class (index.js) Specification

The main episode file must export a default class extending `EpisodePlugin`:

```javascript
import { EpisodePlugin } from '../../core/EpisodePlugin';
import Scene1 from './scenes/Scene1';
import Scene2 from './scenes/Scene2';

export default class MyEpisode extends EpisodePlugin {
  // REQUIRED: Episode metadata
  getMetadata() {
    return {
      id: 'episode-id',              // Must match manifest.name
      title: 'Episode Title',        // Display title
      description: 'Description',    // Brief description
      seasonNumber: 1,               // Must match manifest
      episodeNumber: 1,              // Must match manifest
      duration: 1800,                // Total duration in seconds
      level: 'Intermediate',         // Beginner|Intermediate|Advanced|Expert
      tags: ['topic1', 'topic2'],    // Array of topic tags
      
      // Optional fields
      thumbnailUrl: '/path/to/thumbnail.jpg',
      releaseDate: '2024-01-15',     // YYYY-MM-DD format
      prerequisites: ['Basic knowledge of X'],
      learningOutcomes: ['Understand Y', 'Master Z']
    };
  }

  // REQUIRED: Scene definitions
  getScenes() {
    return [
      {
        id: 'scene-1',               // Unique scene ID
        type: 'content',             // Scene type
        component: Scene1,           // React component (not string!)
        title: 'Introduction',       // Scene title
        duration: 300,               // Duration in seconds
        
        // Optional fields
        category: 'Introduction',    // Scene category
        description: 'Scene description',
        narration: 'Narration text',
        backgroundImage: '/path/to/image.jpg',
        interactiveElements: []      // Inline interactive elements
      }
    ];
  }

  // OPTIONAL: Interactive elements with timestamps
  getInteractiveElements() {
    return [
      {
        id: 'interactive-1',         // Unique ID
        sceneId: 'scene-1',         // Target scene ID
        timestamp: 150,             // When to trigger (seconds into scene)
        component: InteractiveComponent,  // React component
        duration: 60,               // Display duration
        data: { /* component props */ }  // Data to pass
      }
    ];
  }

  // OPTIONAL: Resource requirements
  getResourceRequirements() {
    return {
      images: ['./assets/diagram.png'],
      videos: [],
      scripts: [],
      styles: []
    };
  }
}
```

### Episode Class Rules:
- Must extend `EpisodePlugin`
- Must implement `getMetadata()` and `getScenes()`
- Scene components must be imported and passed as functions, not strings
- All durations are in seconds
- Scene IDs must be unique within the episode
- Interactive element `sceneId` must match an existing scene

## 3. Scene Component Specification

Each scene is a React component that receives specific props:

```javascript
import React from 'react';

const MyScene = ({ time, duration }) => {
  // time: Current playback time within this scene (0 to duration)
  // duration: Total duration of this scene
  
  const progress = (time / duration) * 100;
  
  return (
    <div className="w-full h-full">
      {/* Scene content */}
      <div className="progress-bar" style={{ width: `${progress}%` }} />
    </div>
  );
};

export default MyScene;
```

### Scene Component Rules:
- Must be a valid React component
- Must accept `time` and `duration` props
- Must export as default
- Should be responsive (use relative units)
- Should handle progress visualization
- Cannot use external state management (scenes are isolated)

## 4. Interactive Component Specification

Interactive components are overlays that pause playback:

```javascript
import React from 'react';

const InteractiveComponent = ({ onComplete, data }) => {
  // onComplete: Function to call when interaction is done
  // data: Custom data passed from getInteractiveElements()
  
  const handleComplete = () => {
    onComplete({ 
      success: true, 
      answer: userAnswer 
    });
  };
  
  return (
    <div className="interactive-overlay">
      {/* Interactive content */}
      <button onClick={handleComplete}>Continue</button>
    </div>
  );
};

export default InteractiveComponent;
```

### Interactive Component Rules:
- Must call `onComplete()` to resume playback
- Should be self-contained (no external dependencies)
- Should handle all error states
- Must provide user feedback

## 5. Asset Guidelines

### File Structure:
```
assets/
├── thumbnail.jpg    # 16:9 aspect ratio, min 1280x720px
├── images/         # PNG or JPG, optimized for web
├── videos/         # MP4 format, web-optimized
└── data/          # JSON or other data files
```

### Asset Rules:
- All paths must be relative to episode directory
- Assets must be optimized for web delivery
- Use consistent naming conventions
- Include fallbacks for missing assets

## 6. Best Practices

### DO:
- ✅ Keep scenes focused (3-5 minutes each)
- ✅ Provide clear learning objectives
- ✅ Include progress indicators
- ✅ Test on different screen sizes
- ✅ Handle loading and error states
- ✅ Use semantic HTML and ARIA labels
- ✅ Optimize bundle size

### DON'T:
- ❌ Use absolute paths
- ❌ Rely on external APIs during playback
- ❌ Include sensitive data
- ❌ Use synchronous operations
- ❌ Modify global state
- ❌ Assume specific viewport sizes

## 7. Common Patterns

### Opening Scene with Animation:
```javascript
const OpeningScene = ({ time, duration }) => {
  const fadeIn = Math.min(time / 2, 1); // 2-second fade
  
  return (
    <div className="scene-container" style={{ opacity: fadeIn }}>
      <h1 className="episode-title">Episode Title</h1>
    </div>
  );
};
```

### Content Scene with Code:
```javascript
const CodeScene = ({ time, duration }) => {
  const codeLines = Math.floor(time / 0.5); // Reveal line every 0.5s
  
  return (
    <div className="code-scene">
      <pre>
        <code>{codeContent.slice(0, codeLines)}</code>
      </pre>
    </div>
  );
};
```

### Quiz Interactive:
```javascript
const QuizInteractive = ({ onComplete, data }) => {
  const [selected, setSelected] = useState(null);
  
  return (
    <div className="quiz-container">
      <h3>{data.question}</h3>
      {data.options.map((opt, i) => (
        <button 
          key={i}
          onClick={() => setSelected(i)}
          className={selected === i ? 'selected' : ''}
        >
          {opt}
        </button>
      ))}
      <button 
        onClick={() => onComplete({ answer: selected })}
        disabled={selected === null}
      >
        Submit
      </button>
    </div>
  );
};
```

## 8. Validation Checklist

Before submitting an episode, ensure:

- [ ] manifest.json is valid JSON
- [ ] All required fields are present
- [ ] Episode class extends EpisodePlugin
- [ ] All scene components are imported correctly
- [ ] Scene IDs are unique
- [ ] Interactive element scene IDs exist
- [ ] Total duration matches sum of scene durations
- [ ] All referenced assets exist
- [ ] No console errors during playback
- [ ] Episode works on mobile viewport
- [ ] All text is readable
- [ ] Interactive elements are accessible

## 9. Testing Your Episode

1. Place episode in `src/plugins/episodes/`
2. Add to registry.json
3. Run development server
4. Check browser console for errors
5. Play through entire episode
6. Test all interactive elements
7. Verify on different screen sizes

## Version History

- v1.0.0 (2024-01-15): Initial specification