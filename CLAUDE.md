# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Neural Learn is a comprehensive AI-powered learning platform that uses XTTS v2 text-to-speech to create immersive, interactive learning experiences. It features a glassmorphism UI design, adaptive learning capabilities, and supports complex course structures with 30+ segment types and 12 interactive elements.

## Common Commands

### Running the Application

```bash
# Start the Flask backend (Python 3.9-3.11 required for TTS)
python app.py

# Or use the launcher script (auto-installs dependencies)
python run.py

# Access the application at http://localhost:5000
```

### Testing Commands

```bash
# Run integration tests (when implemented)
python -m pytest tests/

# Test specific track changes
python test_integration.py --track=1

# Run app on different ports for parallel testing
python app.py --port=5001  # In track 1 worktree
python app.py --port=5002  # In track 2 worktree
```

### Database Commands

```bash
# Initialize database with sample data
python migrate_to_v2.py

# Reset database
rm neural_learn_v2.db && python app.py
```

## Architecture

### Database Structure (SQLAlchemy Models)

The application uses SQLite with SQLAlchemy ORM. Key models:

- **Course** → **Lesson** → **Episode** → **Segment** → **Visual** (hierarchical structure)
- **User** & **UserProgress** - User management and progress tracking
- **Badge**, **UserCertificate** - Gamification elements
- **MediaAsset**, **VisualAsset** - Media management
- **InteractiveCueTemplate** - Interactive element templates
- **SegmentInteraction**, **AnalyticsEvent** - Analytics tracking

### Backend Architecture

**app.py** - Main Flask application
- 30+ RESTful API endpoints
- Background audio generation worker thread
- XTTS v2 TTS integration (PyTorch 2.7 compatible)
- Health check endpoint at `/api/health`
- CORS enabled for development

**models.py** - Database models
- UUID primary keys for all entities
- JSON fields for flexible metadata
- Relationships properly defined with backref

**adaptive_learning.py** - Adaptive learning engine
- `AdaptiveLearningEngine` class for personalization
- `SpacedRepetitionScheduler` using SM-2 algorithm
- Learning profile analysis
- Difficulty adjustment based on performance

### Frontend Architecture

**Core Files:**
- `index.html` - Main UI with course navigation
- `script.js` - Application state management and API client
- `styles.css` - Glassmorphism design system
- `segment_styles.css` - Styles for 30+ segment types

**Feature Modules:**
- `segment_renderers.js` - Renders all segment types dynamically
- `interactive_cues.js` - 12 interactive element implementations
- `visual_assets.js` - Lazy loading, zoom/pan for images
- `adaptive_learning.js` - Frontend adaptive features

### Key API Patterns

All APIs follow RESTful conventions:
```
GET    /api/courses              # List resources
GET    /api/courses/<id>         # Get specific resource
POST   /api/segments/<id>/complete  # Action on resource
```

Response format:
```json
{
  "success": true,
  "data": {},
  "error": null,
  "metadata": {}
}
```

## 4-Track Parallel Development System

### Track 1: Content Production & Course Development
**Objective:** Create high-quality learning content

**Deliverables:**
- 5+ complete courses
- Content templates for each segment type
- Visual asset library
- Course authoring guidelines

**Key Files:**
- `/learning_content/*.json`
- Content templates
- Visual assets in `/static/`

### Track 2: Interactive Learning Enhancement
**Objective:** Enhance interactivity and engagement

**Deliverables:**
- 8 new interactive types (total 20)
- Interaction analytics
- Interaction SDK
- Performance optimization

**Key Files:**
- `interactive_cues.js`
- Interaction styles in `segment_styles.css`
- New endpoints in `app.py` under `/api/interactions/*`

### Track 3: Learning Analytics & Insights
**Objective:** Understand and improve learning effectiveness

**Deliverables:**
- Analytics dashboard
- Learning effectiveness metrics
- Recommendation engine
- Predictive models

**Key Files:**
- `analytics.js` (new)
- `/api/analytics/*` endpoints
- Dashboard components
- Analytics database tables

### Track 4: Platform Polish & User Experience
**Objective:** Make the platform delightful to use

**Deliverables:**
- Bug fixes and performance improvements
- Dark mode support
- Enhanced navigation
- Accessibility features

**Key Files:**
- Core UI files (`styles.css`, `script.js`)
- Performance optimizations
- Bug fixes across codebase

## Git Worktree Workflow

### Initial Setup
```bash
# Clone and set up all worktrees
git clone <repo-url> qslab
cd qslab
./setup_git_worktrees.sh
```

### Daily Workflow
```bash
# Navigate to your track
cd ../qslab-track1-content     # Track 1
cd ../qslab-track2-interactive # Track 2
cd ../qslab-track3-analytics   # Track 3
cd ../qslab-track4-polish      # Track 4

# Work in your worktree
git pull origin track-X-name
git checkout -b track-X-name/feature
# Make changes
git commit -m "type(scope): description"
git push origin track-X-name/feature
```

### Using Claude Code
```bash
# Launch Claude in your worktree
cd ../qslab-track1-content
claude code
# "Create a Python fundamentals course with 5 lessons"
```

## Feature Flags

All new features must be behind flags in `feature_flags.js`:
```javascript
const FEATURES = {
  // Track 1
  NEW_COURSES: true,
  
  // Track 2
  NEW_INTERACTIONS: false,
  ENHANCED_DRAG_DROP: false,
  
  // Track 3
  ANALYTICS_DASHBOARD: false,
  RECOMMENDATION_ENGINE: false,
  
  // Track 4
  DARK_MODE: false,
  KEYBOARD_NAV: false
};
```

## Track Coordination

### Shared Files (Require Review)
- `app.py` - New endpoints
- `models.py` - Schema changes
- `index.html` - Major UI changes
- `script.js` - Core functionality

### Integration Schedule
- **Daily**: Update in team channel
- **Weekly**: Monday sync meeting
- **Bi-weekly**: Integration to develop
- **Monthly**: Release to main

### API Contracts
```javascript
// All tracks use this event format
const LearningEvent = {
  userId: string,
  timestamp: Date,
  eventType: string,
  segmentId: string,
  data: object,
  track: string
};
```

## Performance Targets
- Page load: < 1 second
- API response: < 500ms
- Interaction response: < 100ms
- Audio generation: < 10 seconds

## Known Issues & Workarounds

### TTS/PyTorch Compatibility
- PyTorch 2.7 requires `weights_only=False` workaround
- Fallback to Tacotron2 if XTTS fails
- TTS can be disabled for development

### Database
- Auto-creates on first run
- Use `migrate_to_v2.py` for sample data
- SQLite file: `neural_learn_v2.db`

### CORS
- Currently allows all origins
- Restrict in production deployment

## Quick Reference

### Commit Message Format
```
Track 1: content(topic): description
Track 2: interact(feature): description  
Track 3: analytics(metric): description
Track 4: fix(component): description
```

### Testing Ports
- Main app: 5000
- Track 1: 5001
- Track 2: 5002
- Track 3: 5003
- Track 4: 5004

### Key Documentation
- [UNIFIED_IMPLEMENTATION_PLAN.md](UNIFIED_IMPLEMENTATION_PLAN.md) - 4-track development plan
- [GIT_WORKFLOW.md](GIT_WORKFLOW.md) - Git worktree workflow
- [CLAUDE_WORKTREE_WORKFLOW.md](CLAUDE_WORKTREE_WORKFLOW.md) - Claude + worktree patterns
- [README.md](README.md) - Project overview