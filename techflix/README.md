# TechFlix - Netflix for Technology Learning

A modern, Netflix-style streaming platform for technical educational content built with React, Vite, and Tailwind CSS.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Development server**: http://localhost:3000

## ✨ Features

- 🎬 **Netflix-style UI** - Authentic streaming platform experience
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎯 **Interactive Learning** - Quizzes, code examples, and hands-on exercises
- 🎨 **Smooth Animations** - Powered by Framer Motion
- 📊 **Progress Tracking** - Scene-based learning progression
- 🔍 **Search & Discovery** - Find content easily
- 🎵 **Audio Integration** - Text-to-speech capabilities
- 🌙 **Modern React** - Hooks, context, and best practices

## 🛠 Technology Stack

- **React 18** - Modern React with hooks and concurrent features
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Production-ready motion library
- **Lucide React** - Beautiful icon library
- **ESLint** - Code linting and formatting

## 📁 Project Structure

```
techflix/
├── src/
│   ├── components/          # React components
│   │   ├── Header.jsx       # Main navigation
│   │   ├── HeroSection.jsx  # Hero banner
│   │   ├── EpisodesSection.jsx # Episode grid
│   │   ├── NetflixEpisodePlayer.jsx # Video player
│   │   ├── interactive/     # Interactive components
│   │   └── scenes/          # Scene-specific components
│   ├── episodes/           # Episode modules (direct imports)
│   │   ├── index.js        # Episode exports
│   │   ├── season1/        # Season 1 episodes
│   │   │   └── ep1-partition-barrier/
│   │   └── season2/        # Season 2 episodes
│   │       └── ep1-kafka-share-groups/
│   ├── data/               # Content and series data
│   │   └── seriesData.js   # Series and episode metadata
│   ├── styles/             # Global CSS and themes
│   ├── App.jsx             # Main application component
│   ├── main.jsx            # React entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── dist/                   # Production build
├── package.json            # Dependencies and scripts
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS config
└── postcss.config.js      # PostCSS configuration
```

## 🎯 Key Components

### Episode Player
- **NetflixEpisodePlayer**: Full-screen video player experience
- **SceneContent**: Individual scene rendering
- **InteractiveOverlay**: Quizzes and interactive elements
- **ProgressBar**: Scene navigation and progress tracking

### Content Management
- **seriesData.js**: Series metadata and episode links
- **episodes/**: Episode modules with direct component imports
- **Scene Components**: Reusable scene components in `/components/scenes/`

### UI Components
- **Header**: Navigation and user controls
- **HeroSection**: Featured content display
- **EpisodesSection**: Content grid and discovery

## 🔧 Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Environment Setup
```bash
# Clone and setup
git clone <repository>
cd techflix
npm install
```

### Development Commands
```bash
npm run dev      # Start dev server with hot reload
npm run build    # Create production build
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

### Adding New Content

#### Creating a New Episode
1. Create episode directory: `src/episodes/season{X}/ep{Y}-{name}/`
2. Create `index.js` with episode data:
```javascript
import SceneComponent from '../../../components/scenes/SceneComponent'

export const myEpisode = {
  metadata: {
    seriesId: 'tech-insights',
    seasonNumber: 1,
    episodeNumber: 1,
    title: 'Episode Title',
    synopsis: 'Episode description...',
    runtime: 45,
    rating: 'Advanced',
    genres: ['Tech', 'Programming']
  },
  scenes: [
    {
      id: 'scene-1',
      title: 'Scene Title',
      duration: 300, // seconds
      component: SceneComponent
    }
  ]
}
```
3. Export from `src/episodes/index.js`
4. Add to `src/data/seriesData.js`

#### Interactive Elements
```javascript
{
  type: 'quiz',
  question: 'Your question?',
  options: ['A', 'B', 'C', 'D'],
  correctAnswer: 0,
  explanation: 'Explanation...'
}
```

## 🎨 Styling & Theming

### Tailwind Configuration
The app uses a Netflix-inspired design system:
```javascript
// tailwind.config.js
colors: {
  'netflix-red': '#e50914',
  'netflix-dark': '#141414',
  'netflix-gray': '#808080'
}
```

### Custom Components
- Glass morphism effects
- Netflix-style buttons and cards
- Responsive grid layouts
- Smooth hover animations

## 📱 Responsive Design

- **Desktop**: Full Netflix experience with hover states
- **Tablet**: Touch-optimized navigation
- **Mobile**: Simplified UI with swipe gestures

## 🔧 Configuration

### Vite Config
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  build: { outDir: 'dist' }
})
```

### Build Optimization
- Code splitting with React.lazy()
- Image optimization
- Bundle analysis
- Tree shaking

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deploy to Netlify/Vercel
```bash
# Build command: npm run build
# Output directory: dist
```

### Environment Variables
Create `.env.local`:
```
VITE_API_URL=https://your-api.com
VITE_ANALYTICS_ID=your-analytics-id
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Roadmap

- [ ] User authentication and profiles
- [ ] Content recommendations
- [ ] Multi-language support
- [ ] Offline viewing capabilities
- [ ] Advanced analytics dashboard
- [ ] Social features and discussions

---

**TechFlix** - Revolutionizing technical education through immersive, Netflix-style learning experiences.