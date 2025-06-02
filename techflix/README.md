# TechFlix - Netflix for Technical Learning

TechFlix is a Netflix-style streaming platform for technical educational content, specializing in Kafka monitoring, distributed systems, and modern observability through interactive, cinematic episodes.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎬 Features

- **Netflix-Style UI**: Immersive streaming experience with cinematic episode presentation
- **Interactive Episodes**: Decision points, quizzes, and hands-on exercises
- **Cinematic Storytelling**: Phase-based scenes with dramatic reveals and animations
- **Rich Animations**: Particle effects, 3D transforms, and smooth transitions
- **Debug Panel**: Built-in development tools (Ctrl+Shift+D)
- **Modern Build System**: Vite 5.4 with lightning-fast HMR

## 🛠 Technology Stack

- **Framework**: React 18 with Vite 5.4
- **Styling**: Tailwind CSS + Custom Design System
- **Animations**: Framer Motion + Advanced CSS
- **State Management**: Custom stores with React hooks
- **Build Tool**: Vite with code splitting and optimization
- **Testing**: Vitest + React Testing Library

## 📁 Project Structure

```
techflix/
├── src/
│   ├── components/        # React components
│   │   ├── scenes/       # Episode scene components
│   │   └── ...          # UI components
│   ├── episodes/         # Episode definitions
│   │   ├── season1/
│   │   ├── season2/
│   │   └── season3/
│   ├── data/            # Series and episode data
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   └── main.jsx         # Application entry point
├── public/              # Static assets
├── docs/               # Documentation
└── vite.config.js      # Vite configuration
```

## 📚 Current Content

### Season 1: Foundations
1. **Breaking the Partition Barrier** - Understanding Kafka's core limitations
2. **Critical Performance Metrics** - Essential monitoring fundamentals

### Season 2: Advanced Topics
1. **Kafka Share Groups** - Revolutionary consumption model in Kafka 4.0
2. **JMX Exploration** - Deep dive into Java monitoring
3. **Prometheus Setup** - Modern metrics collection and alerting
4. **Custom OHI Development** - Building observability integrations
5. **Key Shifts in Critical Metrics** ⭐ NEW - Evolution from lag to processing time
6. **Data Ingestion Paths** ⭐ NEW - Producer patterns and stream processing
7. **Kafka Evolution and Limits** ⭐ NEW - Architecture limits and future vision

### Season 3: Mastery
3. **Series Finale** - Complete monitoring platform integration

## 🧪 Development

### Creating New Episodes

See [Episode Development Guide](docs/guides/episodes.md) for detailed instructions.

Basic structure:
```javascript
// src/episodes/seasonX/epY-name/index.js
export const myEpisode = {
  metadata: {
    title: 'Episode Title',
    runtime: 45,
    // ...
  },
  scenes: [
    {
      id: 'scene-1',
      component: MySceneComponent,
      duration: 300 // seconds
    }
  ]
}
```

### Debug Mode

- Press `Ctrl+Shift+D` to toggle debug panel
- Add `?debug=true` to URL for auto-open
- Features: Real-time logs, performance metrics, log export

### Performance Monitoring

```javascript
import { usePerformanceMonitor } from '@hooks/usePerformanceMonitor'

// In your component
usePerformanceMonitor('ComponentName', props)
```

## 🚢 Deployment

```bash
# Build for production
npm run build

# Preview build locally
npm run preview

# Deploy dist/ folder to your hosting service
```

## 📖 Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory:

- [Development Guide](docs/guides/development.md)
- [Episode Creation](docs/guides/episodes.md)
- [Component Reference](docs/guides/components.md)
- [API Documentation](docs/reference/api.md)
- [Debugging Guide](docs/guides/debugging.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.