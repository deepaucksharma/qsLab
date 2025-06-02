# TechFlix Project Structure

This document provides a comprehensive overview of the TechFlix project directory structure and organization.

## Root Directory

```
techflix/
├── README.md                    # Main project documentation
├── CHANGELOG.md                 # Version history and updates
├── PROJECT_STRUCTURE.md         # This file - directory guide
├── package.json                 # Node.js dependencies and scripts
├── vite.config.js              # Vite build configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── .gitignore                  # Git ignore patterns
├── .env.example                # Environment variables template
└── index.html                  # Application entry point
```

## Source Code Structure

```
src/
├── main.jsx                    # React application entry
├── App.jsx                     # Main application component
├── router/index.jsx            # Route definitions
│
├── components/                 # Reusable React components
│   ├── Header.jsx             # Navigation header
│   ├── EpisodeCard.jsx        # Episode display card
│   ├── LoadingSpinner.jsx     # Loading indicator
│   ├── InteractiveQuiz.jsx    # Quiz component
│   └── scenes/                # Episode scene components
│       └── BaseScene.jsx      # Base scene template
│
├── episodes/                   # Episode definitions
│   ├── index.js               # Episode registry
│   ├── season1/               # Season 1 episodes
│   │   ├── ep1-partition-barrier/
│   │   └── ep2-critical-metrics/
│   ├── season2/               # Season 2 episodes
│   │   ├── ep1-kafka-share-groups/
│   │   ├── ep2-jmx-exploration/
│   │   ├── ep3-prometheus-setup/
│   │   ├── ep4-custom-ohi/
│   │   ├── ep5-critical-metrics/
│   │   ├── ep6-data-ingestion-paths/
│   │   └── ep7-kafka-evolution-limits/
│   └── season3/               # Season 3 episodes
│       └── ep3-series-finale/
│
├── pages/                     # Route page components
│   ├── HomePage.jsx          # Landing page
│   ├── BrowsePage.jsx        # Episode browser
│   ├── SeriesPage.jsx        # Series details
│   └── EpisodePage.jsx       # Episode player
│
├── layouts/                   # Layout components
│   └── MainLayout.jsx        # Primary layout wrapper
│
├── hooks/                     # Custom React hooks
│   ├── useEpisode.js         # Episode management
│   └── usePerformanceMonitor.js # Performance tracking
│
├── stores/                    # State management
│   └── episodeStore.js       # Zustand episode store
│
├── utils/                     # Utility functions
│   ├── logger.js             # Logging system
│   ├── time.js               # Time formatting
│   └── errorTracking.js      # Error tracking utilities
│
├── data/                      # Static data
│   ├── seriesData.js         # Series/episode metadata
│   └── constants.js          # App constants
│
└── styles/                    # Global styles
    ├── globals.css           # Global CSS
    └── tailwind.css          # Tailwind imports
```

## Documentation Structure

```
docs/
├── README.md                  # Documentation index
├── guides/                    # Development guides
│   ├── development.md        # Development workflow
│   ├── episodes.md           # Episode creation guide
│   ├── components.md         # Component reference
│   ├── debugging.md          # Debugging guide
│   └── voiceovers.md         # Voice-over integration
├── reference/                 # Technical references
│   └── api.md               # API documentation
└── archives/                  # Historical documents
    ├── BUILD_OPTIMIZATION.md
    ├── MODERNIZATION_SUMMARY.md
    ├── ultra/                # Legacy Ultra docs
    └── ... (other archives)
```

## Public Assets

```
public/
├── favicon.ico               # Site favicon
└── images/                   # Static images
    ├── logo.png             # TechFlix logo
    └── episodes/            # Episode thumbnails
```

## Build Output

```
dist/                         # Production build (git-ignored)
├── index.html               # Entry HTML
├── assets/                  # Compiled assets
│   ├── index-[hash].js     # Main bundle
│   ├── vendor-[hash].js    # Vendor chunks
│   └── index-[hash].css    # Compiled styles
└── images/                  # Copied static assets
```

## Key Files

### Configuration Files
- `vite.config.js` - Vite bundler configuration with path aliases
- `tailwind.config.js` - Tailwind CSS theme and plugins
- `package.json` - Dependencies and npm scripts

### Episode System
- `src/episodes/index.js` - Central episode registry
- `src/data/seriesData.js` - Episode metadata and organization

### Core Components
- `src/App.jsx` - Main application with routing
- `src/components/Header.jsx` - Netflix-style navigation
- `src/pages/EpisodePage.jsx` - Episode player implementation

### Utilities
- `src/utils/logger.js` - Comprehensive logging system
- `src/hooks/usePerformanceMonitor.js` - Performance tracking

## Development Workflow

1. **Creating Episodes**: Add to `src/episodes/seasonX/`
2. **Adding Components**: Place in `src/components/`
3. **New Pages**: Create in `src/pages/` and add to router
4. **Documentation**: Update relevant files in `docs/`
5. **Static Assets**: Add to `public/` directory

## Import Aliases

Configured in `vite.config.js`:
- `@components` → `src/components`
- `@episodes` → `src/episodes`
- `@pages` → `src/pages`
- `@hooks` → `src/hooks`
- `@utils` → `src/utils`
- `@data` → `src/data`
- `@styles` → `src/styles`