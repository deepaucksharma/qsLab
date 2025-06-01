import { EpisodePlugin } from '../core/EpisodePlugin';

export class EpisodeCreator {
  static createEpisodeTemplate(config) {
    const template = `import { EpisodePlugin } from '../../core/EpisodePlugin';

// Import your scene components here
// import OpeningScene from './scenes/OpeningScene';
// import ContentScene from './scenes/ContentScene';

export default class ${config.className} extends EpisodePlugin {
  getMetadata() {
    return {
      id: '${config.id}',
      title: '${config.title}',
      description: '${config.description}',
      seasonNumber: ${config.seasonNumber},
      episodeNumber: ${config.episodeNumber},
      duration: ${config.duration}, // in seconds
      level: '${config.level}',
      tags: ${JSON.stringify(config.tags)},
      thumbnailUrl: '${config.thumbnailUrl || ''}',
      releaseDate: '${config.releaseDate || new Date().toISOString().split('T')[0]}',
      prerequisites: ${JSON.stringify(config.prerequisites || [])},
      learningOutcomes: ${JSON.stringify(config.learningOutcomes || [])}
    };
  }

  getScenes() {
    return [
      // Add your scenes here
      {
        id: 'opening',
        type: 'opening',
        component: null, // Replace with your component
        title: 'Introduction',
        duration: 60,
        category: 'Introduction'
      }
    ];
  }

  getInteractiveElements() {
    return [
      // Add interactive elements here
      // {
      //   id: 'quiz-1',
      //   sceneId: 'content',
      //   timestamp: 120,
      //   component: QuizComponent,
      //   data: { questions: [...] }
      // }
    ];
  }

  getResourceRequirements() {
    return {
      images: [],
      videos: [],
      scripts: [],
      styles: []
    };
  }
}`;

    return template;
  }

  static createManifestTemplate(config) {
    const manifest = {
      version: "1.0.0",
      name: config.id,
      displayName: config.title,
      description: config.description,
      author: config.author || "TechFlix Team",
      episodeClass: "./index.js",
      seasonNumber: config.seasonNumber,
      episodeNumber: config.episodeNumber,
      dependencies: [],
      assets: {
        thumbnails: ["./assets/thumbnail.jpg"],
        images: [],
        videos: []
      },
      config: {
        runtime: Math.floor(config.duration / 60),
        level: config.level,
        tags: config.tags
      }
    };

    return JSON.stringify(manifest, null, 2);
  }

  static createSceneTemplate(sceneType, sceneName) {
    const templates = {
      opening: `import React from 'react';

const ${sceneName} = ({ time, duration }) => {
  const progress = (time / duration) * 100;

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">
          Episode Title
        </h1>
        <div className="w-64 h-2 bg-white/20 rounded-full mx-auto">
          <div 
            className="h-full bg-white rounded-full transition-all duration-300"
            style={{ width: \`\${progress}%\` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ${sceneName};`,

      content: `import React from 'react';

const ${sceneName} = ({ time, duration }) => {
  return (
    <div className="w-full h-full bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold mb-6">Content Scene</h2>
        <p className="text-lg leading-relaxed">
          Add your content here. Time: {Math.floor(time)}s / {duration}s
        </p>
      </div>
    </div>
  );
};

export default ${sceneName};`,

      interactive: `import React, { useState } from 'react';

const ${sceneName} = ({ onComplete, data }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleSubmit = () => {
    if (selectedOption !== null) {
      onComplete({ answer: selectedOption });
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-8 max-w-2xl w-full">
      <h3 className="text-2xl font-bold text-white mb-6">
        Interactive Challenge
      </h3>
      <div className="space-y-4">
        {/* Add your interactive content here */}
        <button
          onClick={handleSubmit}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ${sceneName};`
    };

    return templates[sceneType] || templates.content;
  }

  static generateEpisodeStructure(config) {
    return {
      directory: `src/plugins/episodes/${config.id}`,
      files: [
        {
          path: 'manifest.json',
          content: this.createManifestTemplate(config)
        },
        {
          path: 'index.js',
          content: this.createEpisodeTemplate(config)
        },
        {
          path: 'scenes/OpeningScene.jsx',
          content: this.createSceneTemplate('opening', 'OpeningScene')
        },
        {
          path: 'README.md',
          content: `# ${config.title}

## Description
${config.description}

## Structure
- \`index.js\` - Main episode plugin class
- \`manifest.json\` - Episode metadata and configuration
- \`scenes/\` - Scene components
- \`assets/\` - Images, videos, and other assets

## Development
1. Add your scene components to the \`scenes/\` directory
2. Import them in \`index.js\`
3. Configure the scenes in the \`getScenes()\` method
4. Add any interactive elements in \`getInteractiveElements()\`
5. Update the manifest if needed

## Testing
Run the development server and navigate to your episode to test it.
`
        }
      ]
    };
  }
}

export default EpisodeCreator;