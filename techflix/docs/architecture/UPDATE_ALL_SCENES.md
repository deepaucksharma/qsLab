# Mass Update Guide for Cinematic Design System

## Quick Conversion Script

For each scene file, apply these changes:

### 1. Update Imports
```jsx
// Remove these
- import { ParticleBackground, CinematicTitle, ... } from '../StorytellingComponents';

// Add these
+ import '../../styles/techflix-cinematic-v2.css';
+ import { motion, AnimatePresence } from 'framer-motion';
```

### 2. Update Container Structure
```jsx
// Replace this pattern
- <div className="scene-container">
-   <ParticleBackground particleCount={50} />
-   <div className="bg-tech-grid" />
-   <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20" />
-   {/* content */}
- </div>

// With this
+ <div className="scene-container-v2">
+   <div className="scene-content">
+     {/* content */}
+   </div>
+ </div>
```

### 3. Update Typography
```jsx
// Replace complex titles
- <CinematicTitle title={title} subtitle={subtitle} time={time} />

// With simple ones
+ <motion.div
+   initial={{ opacity: 0 }}
+   animate={{ opacity: 1 }}
+   className="text-center"
+ >
+   <h1 className="scene-title">{title}</h1>
+   <p className="scene-subtitle">{subtitle}</p>
+ </motion.div>
```

### 4. Remove Distracting Animations
```jsx
// Remove these classes
- className="animate-pulse"
- className="animate-float"
- className="glitch-effect"
- style={{ animation: 'floatParticle ...' }}

// Replace with simple transitions
+ initial={{ opacity: 0 }}
+ animate={{ opacity: 1 }}
+ transition={{ duration: 0.8 }}
```

### 5. Update Architecture Diagrams
```jsx
// Old complex positioning
- <div className="absolute" style={{ left: '20%', top: '30%' }}>

// New clean layout
+ <div className="architecture-container">
+   <div className="architecture-node">
+     {/* node content */}
+   </div>
+ </div>
```

### 6. Update Metrics Display
```jsx
// Old gradient cards
- <div className="metric-card bg-gradient-to-r from-purple-600 to-blue-600">

// New clean cards
+ <div className="metric-card-v2">
+   <div className="metric-value">{value}</div>
+   <div className="metric-label">{label}</div>
+ </div>
```

## Files to Update (Priority Order)

### Phase 1: Core Scene Components
1. MetricSpotlightScene.jsx
2. TradeOffsScene.jsx
3. ModuleRecapScene.jsx
4. OHIBuilderScene.jsx
5. OHIConceptScene.jsx
6. PrometheusVerificationScene.jsx
7. QueuesUIIntegrationScene.jsx

### Phase 2: Episode-Specific Scenes
1. All scenes in season2/ep5-critical-metrics/
2. All scenes in season2/ep6-data-ingestion-paths/
3. All scenes in season2/ep7-kafka-evolution-limits/

### Phase 3: Main Scene Components
1. BottleneckDemoScene.jsx
2. EvolutionTimelineScene.jsx
3. ImpactMetricsScene.jsx
4. CinematicOpeningScene.jsx
5. CodeExampleScene.jsx
6. All remaining scene files

## Testing Checklist
- [ ] No ParticleBackground references
- [ ] No bg-tech-grid classes
- [ ] Content properly centered
- [ ] Clean animations only
- [ ] Proper spacing on all screen sizes
- [ ] No console errors

## Common Patterns to Replace

### Floating Elements
```jsx
// ❌ Remove
<div className="absolute animate-float">

// ✅ Replace with
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
```

### Background Effects
```jsx
// ❌ Remove all of these
<ParticleBackground />
<div className="bg-tech-grid" />
<div className="stars-background" />
<div className="animated-gradient" />

// ✅ Use clean backgrounds
<div className="scene-container-v2">
  {/* Clean dark background, no effects */}
</div>
```

### Complex Gradients
```jsx
// ❌ Remove
className="bg-gradient-to-br from-purple-900 via-blue-800 to-indigo-900"

// ✅ Use solid colors
className="bg-black" // or bg-tf-bg-primary
```

## Batch Update Commands

For VS Code users, use these regex find/replace patterns:

1. **Remove ParticleBackground imports:**
   - Find: `import.*ParticleBackground.*from.*StorytellingComponents.*\n`
   - Replace: (empty)

2. **Replace scene-container:**
   - Find: `className="scene-container"`
   - Replace: `className="scene-container-v2"`

3. **Remove bg-tech-grid:**
   - Find: `\s*className=".*bg-tech-grid.*"`
   - Replace: (empty)

4. **Remove animate-pulse:**
   - Find: `\s*animate-pulse`
   - Replace: (empty)

Remember: The goal is CLEAN, PROFESSIONAL, CONTENT-FOCUSED design!