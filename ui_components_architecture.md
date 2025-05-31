# UI Components Architecture for Neural Learn Course Platform

## Overview
This document outlines the comprehensive UI component architecture needed to support the complex course structure with interactive learning experiences.

## Component Hierarchy

### 1. Core Navigation Components

#### CourseNavigator
```javascript
// Main course selection and overview
{
  props: {
    courses: Array,
    userProgress: Object,
    onCourseSelect: Function
  },
  features: [
    'Grid/list view toggle',
    'Progress indicators per course',
    'Filter by completion status',
    'Search functionality'
  ]
}
```

#### CourseSidebar
```javascript
// Hierarchical navigation for lessons/episodes
{
  props: {
    courseStructure: Object,
    currentLocation: Object,
    userProgress: Object,
    onNavigate: Function
  },
  features: [
    'Collapsible lesson groups',
    'Episode completion checkmarks',
    'Current position indicator',
    'Prerequisites lock icons',
    'Progress percentages'
  ]
}
```

#### BreadcrumbNav
```javascript
// Course > Lesson > Episode > Segment navigation
{
  props: {
    path: Array,
    onNavigate: Function
  }
}
```

### 2. Content Display Components

#### EpisodePlayer
```javascript
// Main content container
{
  props: {
    episode: Object,
    currentSegmentIndex: Number,
    userProgress: Object,
    onSegmentComplete: Function,
    onInteraction: Function
  },
  features: [
    'Segment progression',
    'Auto-advance option',
    'Segment timer',
    'Points accumulation display'
  ]
}
```

#### SegmentRenderer
```javascript
// Dynamic segment type renderer
{
  props: {
    segment: Object,
    onComplete: Function,
    onInteraction: Function
  },
  renders: 'Appropriate segment component based on type'
}
```

### 3. Segment Type Components (15+ types)

#### CourseOpeningSegment
```javascript
{
  features: [
    'Welcome animation',
    'Course overview',
    'Instructor introduction',
    'Learning objectives display'
  ]
}
```

#### ConceptExplanationSegment
```javascript
{
  features: [
    'Text + visual layout',
    'Key points highlighting',
    'Animated diagrams',
    'Audio narration sync'
  ]
}
```

#### CodeWalkthroughSegment
```javascript
{
  features: [
    'Syntax highlighted code',
    'Line-by-line animations',
    'Execution visualization',
    'Interactive code editing'
  ]
}
```

#### HistoricalContextSegment
```javascript
{
  features: [
    'Timeline visualization',
    'Era comparisons',
    'Interactive date explorer',
    'Context cards'
  ]
}
```

#### MetricDeepDiveSegment
```javascript
{
  features: [
    'Live metric graphs',
    'Interactive data exploration',
    'Threshold indicators',
    'Comparison views'
  ]
}
```

### 4. Interactive Element Components

#### HoverToExplore
```javascript
{
  props: {
    targetElements: Array,
    revelations: Object,
    onHover: Function
  },
  features: [
    'Hover zones visualization',
    'Smooth reveal animations',
    'Progress tracking',
    'Touch support for mobile'
  ]
}
```

#### DragToDistribute
```javascript
{
  props: {
    draggables: Array,
    dropZones: Array,
    correctMapping: Object,
    onComplete: Function
  },
  features: [
    'Drag feedback',
    'Snap-to-zone',
    'Visual validation',
    'Reset capability'
  ]
}
```

#### InteractiveSimulation
```javascript
{
  props: {
    simulationType: String,
    parameters: Object,
    onInteraction: Function
  },
  features: [
    'Real-time updates',
    'Parameter controls',
    'State visualization',
    'Result display'
  ]
}
```

#### CodeCompletionExercise
```javascript
{
  props: {
    template: String,
    correctAnswer: String,
    hints: Array,
    onSubmit: Function
  },
  features: [
    'Code editor integration',
    'Syntax validation',
    'Hint system',
    'Diff visualization'
  ]
}
```

#### ScenarioSelector
```javascript
{
  props: {
    scenarios: Array,
    correctAnswers: Array,
    onSelect: Function
  },
  features: [
    'Card-based selection',
    'Immediate feedback',
    'Explanation reveals',
    'Progress indicators'
  ]
}
```

### 5. Progress & Gamification Components

#### ProgressBar
```javascript
{
  variants: [
    'SegmentProgress',
    'EpisodeProgress', 
    'LessonProgress',
    'CourseProgress'
  ],
  features: [
    'Animated fills',
    'Milestone markers',
    'Percentage display',
    'Time estimates'
  ]
}
```

#### PointsDisplay
```javascript
{
  props: {
    currentPoints: Number,
    pointsEarned: Number,
    totalPossible: Number
  },
  features: [
    'Animated incrementing',
    'Achievement notifications',
    'Leaderboard position',
    'Point breakdown'
  ]
}
```

#### BadgeShowcase
```javascript
{
  props: {
    earnedBadges: Array,
    availableBadges: Array,
    recentBadge: Object
  },
  features: [
    'Badge gallery',
    'Unlock animations',
    'Progress to next badge',
    'Badge details modal'
  ]
}
```

#### CheckpointModal
```javascript
{
  props: {
    checkpoint: Object,
    onSubmit: Function,
    onSkip: Function
  },
  features: [
    'Question carousel',
    'Answer validation',
    'Score display',
    'Retry options'
  ]
}
```

### 6. Media Components

#### EnhancedAudioPlayer
```javascript
{
  props: {
    audioUrl: String,
    transcript: String,
    timestamps: Array
  },
  features: [
    'Playback controls',
    'Speed adjustment',
    'Transcript sync',
    'Chapter markers'
  ]
}
```

#### VisualDisplay
```javascript
{
  props: {
    visualId: String,
    visualType: String,
    interactiveZones: Array
  },
  features: [
    'Zoom/pan controls',
    'Hotspot indicators',
    'Fullscreen mode',
    'Annotation layer'
  ]
}
```

#### CodeHighlighter
```javascript
{
  props: {
    code: String,
    language: String,
    highlightLines: Array,
    animateTyping: Boolean
  },
  features: [
    'Syntax highlighting',
    'Line numbers',
    'Copy functionality',
    'Typing animation'
  ]
}
```

### 7. Analytics & Tracking Components

#### TimeTracker
```javascript
{
  features: [
    'Segment time tracking',
    'Idle detection',
    'Focus/blur tracking',
    'Session recording'
  ]
}
```

#### InteractionLogger
```javascript
{
  features: [
    'Click tracking',
    'Hover tracking',
    'Scroll tracking',
    'Custom event logging'
  ]
}
```

## Component Communication

### Event Bus Pattern
```javascript
// Global event system for component communication
EventBus = {
  events: {
    'segment:complete': { segment, points, duration },
    'interaction:log': { type, data, timestamp },
    'progress:update': { type, id, value },
    'audio:stateChange': { state, position },
    'navigation:request': { target, params }
  }
}
```

### State Management
```javascript
// Centralized state for course progress
CourseState = {
  currentCourse: Object,
  currentLesson: Object,
  currentEpisode: Object,
  currentSegment: Object,
  userProgress: Object,
  interactionHistory: Array,
  audioQueue: Array,
  settings: Object
}
```

## Responsive Design Patterns

### Breakpoints
```css
/* Mobile: 320px - 768px */
/* Tablet: 768px - 1024px */
/* Desktop: 1024px+ */
/* Wide: 1440px+ */
```

### Layout Adaptations
- **Mobile**: Single column, bottom navigation, swipe gestures
- **Tablet**: Collapsible sidebar, touch-optimized interactions
- **Desktop**: Full sidebar, hover interactions, keyboard shortcuts
- **Wide**: Multi-panel view, enhanced visualizations

## Accessibility Features

### WCAG 2.1 AA Compliance
- Keyboard navigation for all interactions
- Screen reader announcements
- High contrast mode
- Reduced motion options
- Captions for all audio
- Alt text for visuals

### Keyboard Shortcuts
```javascript
{
  'Space': 'Play/pause audio',
  'Arrow keys': 'Navigate segments',
  'Enter': 'Select/activate',
  'Escape': 'Close modal',
  'Tab': 'Focus navigation',
  '1-9': 'Jump to segment'
}
```

## Performance Optimizations

### Lazy Loading
- Components loaded on-demand
- Images with intersection observer
- Audio pre-buffering
- Code splitting by route

### Caching Strategy
- Segment content caching
- Audio file caching
- Progress state persistence
- Offline capability

## Implementation Priority

### Phase 1: Core Components
1. CourseNavigator
2. CourseSidebar
3. EpisodePlayer
4. SegmentRenderer
5. Basic segment types

### Phase 2: Interactive Elements
1. HoverToExplore
2. DragToDistribute
3. CodeCompletionExercise
4. CheckpointModal

### Phase 3: Advanced Features
1. All segment types
2. All interactive cues
3. Analytics components
4. Gamification elements

### Phase 4: Polish
1. Animations
2. Transitions
3. Sound effects
4. Advanced visualizations