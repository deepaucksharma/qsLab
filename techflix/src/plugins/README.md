# TechFlix Episode Plugin System

## Overview

The TechFlix Episode Plugin System allows you to create modular, self-contained episodes that can be dynamically loaded into the application. Each episode is a plugin that contains its own scenes, interactive elements, and assets.

## Architecture

```
src/plugins/
├── core/                    # Core plugin system
│   ├── EpisodePlugin.js    # Base class for all episodes
│   ├── EpisodeLoader.js    # Dynamic episode loader
│   ├── EpisodeRegistry.js  # Episode discovery and management
│   └── PluginManifest.js   # Manifest schema and validation
├── episodes/               # Episode plugins
│   ├── registry.json      # Episode registry configuration
│   └── [episode-id]/      # Individual episode directories
│       ├── manifest.json  # Episode metadata
│       ├── index.js       # Episode plugin class
│       ├── scenes/        # Scene components
│       └── assets/        # Images, videos, etc.
└── utils/                 # Helper utilities
    ├── EpisodeCreator.js  # Episode creation helpers
    └── create-episode.js  # CLI tool for creating episodes
```

## Creating a New Episode

### Method 1: Using the CLI Tool

```bash
node src/plugins/utils/create-episode.js
```

Follow the prompts to create a new episode structure automatically.

### Method 2: Manual Creation

1. Create a new directory: `src/plugins/episodes/[your-episode-id]/`

2. Create `manifest.json`:
```json
{
  "version": "1.0.0",
  "name": "your-episode-id",
  "displayName": "Your Episode Title",
  "description": "Episode description",
  "author": "Your Name",
  "episodeClass": "./index.js",
  "seasonNumber": 1,
  "episodeNumber": 1,
  "dependencies": [],
  "assets": {
    "thumbnails": ["./assets/thumbnail.jpg"],
    "images": [],
    "videos": []
  }
}
```

3. Create `index.js`:
```javascript
import { EpisodePlugin } from '../../core/EpisodePlugin';
import YourScene from './scenes/YourScene';

export default class YourEpisode extends EpisodePlugin {
  getMetadata() {
    return {
      id: 'your-episode-id',
      title: 'Your Episode Title',
      description: 'Episode description',
      seasonNumber: 1,
      episodeNumber: 1,
      duration: 1800, // 30 minutes
      level: 'Intermediate',
      tags: ['topic1', 'topic2'],
      thumbnailUrl: '/episodes/your-episode-id/assets/thumbnail.jpg'
    };
  }

  getScenes() {
    return [
      {
        id: 'scene1',
        type: 'content',
        component: YourScene,
        title: 'Scene Title',
        duration: 300, // 5 minutes
        category: 'Introduction'
      }
    ];
  }
}
```

4. Create your scene components in `scenes/`

5. Add the episode to `src/plugins/episodes/registry.json`:
```json
{
  "episodes": [
    {
      "id": "your-episode-id",
      "path": "/src/plugins/episodes/your-episode-id",
      "enabled": true
    }
  ]
}
```

## Episode Structure

### Metadata Schema

```javascript
{
  id: string,              // Unique episode identifier
  title: string,           // Display title
  description: string,     // Brief description
  seasonNumber: number,    // Season number (1-based)
  episodeNumber: number,   // Episode number (1-based)
  duration: number,        // Total duration in seconds
  level: string,           // Beginner|Intermediate|Advanced|Expert
  tags: string[],          // Topic tags
  thumbnailUrl?: string,   // Optional thumbnail
  releaseDate?: string,    // Optional release date
  prerequisites?: string[], // Optional prerequisites
  learningOutcomes?: string[] // Optional learning outcomes
}
```

### Scene Structure

```javascript
{
  id: string,              // Unique scene identifier
  type: string,            // Scene type (opening, content, interactive, etc.)
  component: Component,    // React component for the scene
  title?: string,          // Optional scene title
  duration: number,        // Scene duration in seconds
  category?: string,       // Optional category
  description?: string,    // Optional description
  narration?: string,      // Optional narration text
  interactiveElements?: [] // Optional interactive elements
}
```

### Interactive Elements

```javascript
{
  id: string,              // Unique identifier
  sceneId: string,         // Scene where this appears
  timestamp: number,       // When to trigger (seconds into scene)
  component: Component,    // Interactive component
  duration: number,        // How long to display
  data: object            // Data to pass to component
}
```

## Scene Components

Scene components receive the following props:
- `time`: Current time within the scene (seconds)
- `duration`: Total scene duration (seconds)

Example scene component:

```javascript
import React from 'react';

const MyScene = ({ time, duration }) => {
  const progress = (time / duration) * 100;
  
  return (
    <div className="w-full h-full bg-gray-900 text-white p-8">
      <h2>My Scene</h2>
      <div className="progress-bar" style={{ width: `${progress}%` }} />
    </div>
  );
};

export default MyScene;
```

## Interactive Components

Interactive components receive:
- `onComplete(result)`: Function to call when interaction is complete
- Any custom data passed in the `data` field

Example interactive component:

```javascript
import React, { useState } from 'react';

const QuizComponent = ({ onComplete, data }) => {
  const [answer, setAnswer] = useState('');
  
  const handleSubmit = () => {
    onComplete({ answer, correct: answer === data.correctAnswer });
  };
  
  return (
    <div className="quiz-container">
      <h3>{data.question}</h3>
      {/* Quiz UI */}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default QuizComponent;
```

## Best Practices

1. **Keep episodes self-contained**: All assets and components should be within the episode directory
2. **Use meaningful IDs**: Episode and scene IDs should be descriptive
3. **Optimize assets**: Compress images and videos for faster loading
4. **Test thoroughly**: Test your episode in different screen sizes
5. **Document your episode**: Include a README in your episode directory
6. **Follow conventions**: Use consistent naming and structure

## Debugging

- Check the browser console for loading errors
- Verify manifest.json is valid JSON
- Ensure all component imports are correct
- Check that the episode is registered in registry.json
- Verify all scene components export default

## Advanced Features

### Dynamic Resource Loading

Episodes can specify resource requirements:

```javascript
getResourceRequirements() {
  return {
    images: ['./assets/diagram1.png'],
    videos: ['./assets/intro.mp4'],
    scripts: ['./assets/custom.js'],
    styles: ['./assets/custom.css']
  };
}
```

### Custom Configuration

Add custom configuration in manifest.json:

```json
{
  "config": {
    "theme": "dark",
    "animations": true,
    "customProperty": "value"
  }
}
```

Access in your episode:

```javascript
const config = this.manifest.config;
```