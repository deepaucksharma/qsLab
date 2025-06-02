# TechFlix Project Structure

## Overview
TechFlix is a Netflix-style streaming platform for technical education, built with React, Vite, and Framer Motion.

## Directory Structure

```
techflix/
├── src/                      # Source code
│   ├── components/          # React components
│   │   ├── scenes/         # Episode scene components
│   │   ├── interactive/    # Interactive components
│   │   └── __tests__/      # Component tests
│   ├── episodes/           # Episode definitions
│   │   ├── season1/       # Season 1 episodes
│   │   ├── season2/       # Season 2 episodes (includes new ep5-7)
│   │   └── season3/       # Season 3 episodes
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── router/            # React Router setup
│   ├── store/             # State management
│   ├── styles/            # CSS and design system
│   ├── utils/             # Utility functions
│   └── data/              # Static data
├── dist/                   # Production build
├── docs/                   # Documentation
│   ├── guides/            # Development guides
│   └── archives/          # Historical docs
├── public/                 # Static assets
├── node_modules/          # Dependencies (git ignored)
└── Configuration Files
    ├── vite.config.js     # Vite configuration
    ├── tailwind.config.js # Tailwind CSS config
    ├── package.json       # Project dependencies
    └── tsconfig.json      # TypeScript config
```

## Key Components

### Episodes System
- **Location**: `src/episodes/`
- **Structure**: Each episode has an index.js and scene components
- **New Episodes**: 
  - Episode 5: Key Shifts in Critical Metrics
  - Episode 6: Data Ingestion Paths
  - Episode 7: Kafka Evolution and Limits

### Component Library
- **StorytellingComponents**: Reusable cinematic components
- **Interactive Components**: Quiz, decision points, etc.
- **Scene Components**: Individual episode scenes

### Styling
- **Design System**: `src/styles/techflix-design-system.css`
- **Tailwind**: Utility-first CSS framework
- **Framer Motion**: Animation library

## Scripts

```bash
# Development
npm run dev          # Start dev server on port 3000

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
```

## Recent Updates

1. **Migrated to Vite 5.4** - From Parcel for better performance
2. **Added 3 New Episodes** - Implementing cinematic design guide
3. **Enhanced Animation System** - Phase-based storytelling
4. **Improved Error Handling** - Better error boundaries

## Environment Setup

1. Node.js 18+ required
2. npm or yarn package manager
3. Port 3000 available for development

## Build System

- **Vite**: Lightning-fast HMR and optimized builds
- **Code Splitting**: Automatic chunk optimization
- **Tree Shaking**: Removes unused code
- **Asset Optimization**: Images, fonts, and media files