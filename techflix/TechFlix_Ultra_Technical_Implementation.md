# TechFlix Ultra: Technical Implementation Guide
## Kafka 4.0 Share Groups + New Relic Observability Series

---

## Episode Structure Implementation

### Directory Structure Per Episode
```
kafka-share-groups-[episode-name]/
├── manifest.json              # Episode metadata
├── index.js                  # Main episode class
├── README.md                 # Documentation
├── assets/                   # All media assets
│   ├── audio/               # Voice-over and music
│   ├── images/              # SVGs, PNGs, JPGs
│   ├── animations/          # Lottie JSON files
│   └── data/               # Mock data for visualizations
├── scenes/                  # Scene components
│   ├── [SceneName].jsx
│   └── shared/             # Shared scene utilities
├── components/             # Reusable components
│   ├── interactive/        # Interactive overlays
│   ├── visualizations/     # Data viz components
│   └── ui/                # UI elements
└── styles/                # CSS modules
    └── ultra-theme.css    # Ultra-specific styles
```

---

## Season 1 Technical Implementation

### Episode 1.1: kafka-evolution-limits

#### index.js Implementation
```javascript
import { EpisodePlugin } from '../../core/EpisodePlugin';
import KafkaRefresherScene from './scenes/KafkaRefresherScene';
import TraditionalLimitsScene from './scenes/TraditionalLimitsScene';
import SkipInteractive from './components/interactive/SkipInteractive';

export default class KafkaEvolutionLimitsEpisode extends EpisodePlugin {
  getMetadata() {
    return {
      id: 'kafka-evolution-limits',
      title: 'The Evolution & Limitations of Kafka',
      description: 'Explore Kafka\'s journey from traditional consumer groups to the need for Share Groups',
      seasonNumber: 1,
      episodeNumber: 1,
      duration: 195, // 3:15 in seconds
      level: 'Intermediate',
      tags: ['kafka', 'consumer-groups', 'scalability', 'share-groups'],
      thumbnailUrl: './assets/S1_E1_thumb_episode-thumbnail.jpg',
      releaseDate: '2024-02-01',
      prerequisites: ['Basic messaging concepts'],
      learningOutcomes: [
        'Understand traditional Kafka consumer group architecture',
        'Identify scalability limitations',
        'Recognize when Share Groups are needed'
      ]
    };
  }

  getScenes() {
    return [
      {
        id: 'kafka-refresher',
        type: 'intro',
        component: KafkaRefresherScene,
        title: 'Kafka Refresher / Jump Ahead',
        duration: 45,
        category: 'Introduction',
        description: 'Optional Kafka fundamentals refresher with skip option',
        narration: 'New to Kafka or need a quick primer? Great!',
        mood: 'epic-intro',
        backgroundImage: './assets/S1_E1_S1_bg_kafka-universe.jpg'
      },
      {
        id: 'traditional-limits',
        type: 'content',
        component: TraditionalLimitsScene,
        title: 'Traditional Consumer Group Limits',
        duration: 150,
        category: 'Core Concepts',
        description: 'Understanding the bottlenecks of traditional consumer groups',
        narration: 'Imagine Kafka partitions as highway lanes...',
        mood: 'tension-building'
      }
    ];
  }

  getInteractiveElements() {
    return [
      {
        id: 'skip-intro',
        sceneId: 'kafka-refresher',
        timestamp: 3,
        component: SkipInteractive,
        duration: 10,
        data: {
          skipToScene: 'traditional-limits',
          buttonText: 'Kafka Pro? Jump to Share Groups',
          analytics: {
            action: 'skip_intro',
            category: 'navigation'
          }
        }
      }
    ];
  }
}
```

#### KafkaRefresherScene.jsx Implementation
```javascript
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleSystem from '../components/visualizations/ParticleSystem';
import KafkaOverview from '../components/visualizations/KafkaOverview';
import LoadingScreen from '../components/ui/LoadingScreen';
import { useAccessibility } from '../hooks/useAccessibility';

const KafkaRefresherScene = ({ time, duration }) => {
  const [phase, setPhase] = useState('loading');
  const { reduceMotion } = useAccessibility();
  
  useEffect(() => {
    if (time < 3) setPhase('loading');
    else if (time < 5) setPhase('choice');
    else setPhase('overview');
  }, [time]);

  const progress = (time / duration) * 100;

  return (
    <div className="scene-container kafka-refresher">
      <AnimatePresence mode="wait">
        {phase === 'loading' && (
          <LoadingScreen 
            key="loading"
            progress={progress}
            reduceMotion={reduceMotion}
          />
        )}
        
        {phase === 'choice' && (
          <motion.div 
            key="choice"
            className="choice-container"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Skip choice UI rendered here */}
          </motion.div>
        )}
        
        {phase === 'overview' && (
          <motion.div 
            key="overview"
            className="overview-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <KafkaOverview 
              time={time - 5} 
              duration={40}
              showProducers={time > 8}
              showPartitions={time > 15}
              showConsumers={time > 25}
            />
            {!reduceMotion && (
              <ParticleSystem 
                count={50}
                speed={1 + (progress / 100)}
                color="#5E35B1"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Voice-over sync indicator */}
      <VOSyncIndicator time={time} />
    </div>
  );
};

const VOSyncIndicator = ({ time }) => {
  const syncPoints = [
    { time: 3, label: 'Choice' },
    { time: 8, label: 'Kafka Overview' },
    { time: 25, label: 'Traditional Model' },
    { time: 35, label: 'Limitations' }
  ];

  const currentSync = syncPoints.find(
    point => Math.abs(time - point.time) < 0.5
  );

  return currentSync ? (
    <div className="vo-sync-indicator">
      {currentSync.label}
    </div>
  ) : null;
};

export default KafkaRefresherScene;
```

---

## Code Examples for Episode Content

### Kafka Share Groups Consumer Example
```java
// Traditional Consumer Group (Before)
Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("group.id", "order-processor");
props.put("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
props.put("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");

KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
consumer.subscribe(Arrays.asList("orders"));

// Limited to one consumer per partition!

// Share Groups Consumer (After)
Properties shareProps = new Properties();
shareProps.put("bootstrap.servers", "localhost:9092");
shareProps.put("group.id", "share:order-processor"); // Share group prefix
shareProps.put("group.type", "share"); // New property
shareProps.put("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
shareProps.put("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");

KafkaShareConsumer<String, String> shareConsumer = new KafkaShareConsumer<>(shareProps);
shareConsumer.subscribe(Arrays.asList("orders"));

// Multiple consumers can now process the same partition!
```

### JMX Metrics Configuration
```yaml
# jmx_exporter.yml for Share Groups
rules:
  # Share Group specific metrics
  - pattern: kafka.server<type=share-group-metrics, group=(.+), topic=(.+), partition=(.+)><>RecordsUnacked
    name: kafka_sharegroup_records_unacked
    labels:
      group: "$1"
      topic: "$2"
      partition: "$3"
    help: "Number of unacknowledged records in the share group"
    type: GAUGE

  - pattern: kafka.server<type=share-group-metrics, group=(.+), topic=(.+), partition=(.+)><>OldestUnackedMessageAgeMs
    name: kafka_sharegroup_oldest_unacked_message_age_ms
    labels:
      group: "$1"
      topic: "$2"
      partition: "$3"
    help: "Age of the oldest unacknowledged message in milliseconds"
    type: GAUGE

  # Traditional metrics for comparison
  - pattern: kafka.consumer<type=consumer-fetch-manager-metrics, client-id=(.+), topic=(.+), partition=(.+)><>records-lag
    name: kafka_consumer_lag
    labels:
      client_id: "$1"
      topic: "$2"
      partition: "$3"
    help: "Traditional consumer lag metric"
    type: GAUGE
```

### New Relic Custom OHI Example
```go
// share-groups-ohi/main.go
package main

import (
    "fmt"
    "time"
    "github.com/newrelic/infra-integrations-sdk/v4/integration"
    "github.com/prometheus/client_golang/api"
)

func main() {
    i, err := integration.New("com.newrelic.kafka.sharegroups", "1.0.0")
    if err != nil {
        log.Fatal(err)
    }

    // Create entity
    entity, err := i.Entity("kafka-sharegroup", "kafka-sharegroup:production")
    if err != nil {
        log.Fatal(err)
    }

    // Fetch metrics from Prometheus endpoint
    client, err := api.NewClient(api.Config{
        Address: "http://localhost:9404/metrics",
    })
    
    // Query Share Group metrics
    recordsUnacked := queryMetric(client, "kafka_sharegroup_records_unacked")
    oldestMessageAge := queryMetric(client, "kafka_sharegroup_oldest_unacked_message_age_ms")

    // Create QueueSample event
    queueSample := entity.NewEvent("QueueSample")
    queueSample.SetAttribute("provider", "kafka-sharegroup")
    queueSample.SetAttribute("queue.name", "orders-topic:share-processor")
    queueSample.SetAttribute("share.group.name", "share-processor")
    queueSample.SetAttribute("queue.depth", recordsUnacked)
    queueSample.SetAttribute("queue.oldestMessageAgeSeconds", oldestMessageAge/1000)
    
    // Add custom attributes
    queueSample.SetAttribute("kafka.version", "4.0")
    queueSample.SetAttribute("share.group.state", "ACTIVE")

    if err := i.Publish(); err != nil {
        log.Fatal(err)
    }
}
```

---

## Animation Data Structures

### Particle System Configuration
```json
{
  "particleSystem": {
    "version": "1.0",
    "particles": {
      "count": 50,
      "size": {
        "min": 2,
        "max": 6
      },
      "speed": {
        "min": 0.5,
        "max": 2.0
      },
      "color": {
        "primary": "#5E35B1",
        "secondary": "#039BE5",
        "gradient": true
      },
      "behavior": {
        "gravity": 0.1,
        "bounce": 0.8,
        "fade": true,
        "glow": true
      }
    },
    "emitters": [
      {
        "id": "producer-1",
        "position": { "x": 100, "y": 200 },
        "rate": 5,
        "spread": 30
      }
    ]
  }
}
```

### Scene Transition Configurations
```javascript
// transitions.config.js
export const sceneTransitions = {
  'kafka-refresher-to-traditional-limits': {
    duration: 2,
    effect: 'morph',
    animation: {
      from: {
        elements: ['producer', 'topic', 'consumer'],
        layout: 'overview'
      },
      to: {
        elements: ['highway', 'cars', 'bottleneck'],
        layout: 'traffic-metaphor'
      },
      particles: {
        morph: true,
        colorShift: '#5E35B1 -> #E53935'
      }
    }
  }
};
```

---

## Performance Optimization

### Asset Loading Strategy
```javascript
// AssetLoader.js
class AssetLoader {
  constructor() {
    this.cache = new Map();
    this.loadingQueue = [];
    this.priorityQueue = [];
  }

  async preloadEpisode(episodeId) {
    const manifest = await this.loadManifest(episodeId);
    
    // Priority load: thumbnails and first scene assets
    await this.loadPriority([
      manifest.assets.thumbnails[0],
      ...this.getSceneAssets(manifest, 0)
    ]);

    // Background load: remaining assets
    this.queueBackgroundLoad(manifest.assets);
  }

  getSceneAssets(manifest, sceneIndex) {
    const scene = manifest.scenes[sceneIndex];
    return [
      scene.backgroundImage,
      scene.primaryAssets,
      ...scene.animations
    ].filter(Boolean);
  }
}
```

### Animation Performance
```javascript
// useOptimizedAnimation.js
export const useOptimizedAnimation = (animationData, options = {}) => {
  const [isReady, setIsReady] = useState(false);
  const animationRef = useRef(null);
  const frameRef = useRef();

  useEffect(() => {
    // Use requestAnimationFrame for smooth animations
    const animate = (timestamp) => {
      if (!animationRef.current) return;

      // Throttle to 30fps on low-end devices
      if (options.throttle && timestamp - lastFrame < 33) {
        frameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Update animation
      animationRef.current.update(timestamp);
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isReady]);

  return { isReady, animationRef };
};
```

---

## Accessibility Implementation

### Scene Accessibility Wrapper
```javascript
// AccessibleScene.jsx
const AccessibleScene = ({ children, sceneId, narration }) => {
  const [transcriptVisible, setTranscriptVisible] = useState(false);
  const { announceToScreenReader } = useAccessibility();

  useEffect(() => {
    // Announce scene changes to screen readers
    announceToScreenReader(`Now playing: ${sceneId}`);
  }, [sceneId]);

  return (
    <div 
      className="accessible-scene"
      role="region"
      aria-label={`Scene: ${sceneId}`}
    >
      {/* Skip to content button */}
      <button 
        className="skip-animations"
        onClick={() => window.skipToNextScene()}
      >
        Skip animations
      </button>

      {/* Main content */}
      <div className="scene-content">
        {children}
      </div>

      {/* Transcript toggle */}
      <button
        className="transcript-toggle"
        onClick={() => setTranscriptVisible(!transcriptVisible)}
        aria-expanded={transcriptVisible}
      >
        {transcriptVisible ? 'Hide' : 'Show'} Transcript
      </button>

      {/* Narration transcript */}
      {transcriptVisible && (
        <div className="narration-transcript">
          <p>{narration}</p>
        </div>
      )}
    </div>
  );
};
```

---

## Testing Strategy

### Scene Component Testing
```javascript
// KafkaRefresherScene.test.jsx
import { render, screen } from '@testing-library/react';
import { KafkaRefresherScene } from './KafkaRefresherScene';

describe('KafkaRefresherScene', () => {
  it('shows loading screen for first 3 seconds', () => {
    render(<KafkaRefresherScene time={1} duration={45} />);
    expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
  });

  it('shows choice card between 3-5 seconds', () => {
    render(<KafkaRefresherScene time={4} duration={45} />);
    expect(screen.getByText(/Kafka Pro/)).toBeInTheDocument();
  });

  it('displays Kafka overview after 5 seconds', () => {
    render(<KafkaRefresherScene time={10} duration={45} />);
    expect(screen.getByTestId('kafka-overview')).toBeInTheDocument();
  });

  it('respects reduce motion preference', () => {
    // Mock accessibility context
    mockUseAccessibility({ reduceMotion: true });
    
    render(<KafkaRefresherScene time={20} duration={45} />);
    expect(screen.queryByTestId('particle-system')).not.toBeInTheDocument();
  });
});
```

### Performance Testing
```javascript
// performance.test.js
describe('Episode Performance', () => {
  it('loads first scene assets within 2 seconds', async () => {
    const start = performance.now();
    await loadEpisode('kafka-evolution-limits');
    const loadTime = performance.now() - start;
    
    expect(loadTime).toBeLessThan(2000);
  });

  it('maintains 30fps during scene transitions', async () => {
    const fps = await measureSceneTransitionFPS(
      'kafka-refresher',
      'traditional-limits'
    );
    
    expect(fps).toBeGreaterThanOrEqual(30);
  });
});
```

---

## Deployment Configuration

### Episode Bundle Configuration
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      input: {
        'main': './src/main.jsx',
        // Episodes are now directly imported in the application
      },
      output: {
        entryFileNames: '[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    // Code splitting for better performance
    manualChunks: {
      'animation-runtime': ['framer-motion', 'lottie-web'],
      'visualization': ['d3', 'recharts'],
      'interactive': ['react-dnd', '@dnd-kit/sortable']
    }
  }
};
```

---

## Monitoring & Analytics

### Episode Analytics Integration
```javascript
// analytics.js
export const trackEpisodeEvent = (event) => {
  // New Relic Browser Agent
  if (window.newrelic) {
    window.newrelic.addPageAction('episode_event', {
      episodeId: event.episodeId,
      sceneId: event.sceneId,
      action: event.action,
      timestamp: Date.now(),
      ...event.metadata
    });
  }

  // Custom analytics
  sendToAnalytics({
    category: 'Episode Engagement',
    action: event.action,
    label: `${event.episodeId}:${event.sceneId}`,
    value: event.value
  });
};

// Usage in scenes
trackEpisodeEvent({
  episodeId: 'kafka-evolution-limits',
  sceneId: 'kafka-refresher',
  action: 'skip_intro',
  metadata: {
    skipTime: 4.2,
    skipReason: 'user_initiated'
  }
});
```

---

This technical implementation guide provides the foundation for building the TechFlix Ultra series with production-ready code, performance optimizations, and comprehensive testing strategies.