# Neural Learn v2 - Course Platform

A comprehensive learning platform that transforms from a simple vocabulary app into a full-featured course system supporting complex multi-level content structures, interactive learning experiences, and advanced progress tracking.

## 🚀 Quick Start

```bash
# Option 1: Run the launcher script (recommended)
python run_v2.py

# Option 2: Manual setup
# 1. Run migration to create database
python migrate_to_v2.py

# 2. Start Flask backend
python app_v2.py

# 3. Start frontend server (in another terminal)
python -m http.server 8000

# 4. Open browser to http://localhost:8000/index_v2.html
```

## 🎉 Track 2 Interactive Learning - COMPLETED

Track 2 has been successfully implemented, expanding interactive capabilities:

### ✅ 20 Interactive Types (8 New)
**New Interactions:**
- **Timeline Scrubber** - Explore events chronologically
- **Pattern Matcher** - Memory and pattern recognition
- **Code Sandbox** - Live code execution environment
- **Visual Constructor** - Build diagrams via drag-and-drop
- **Decision Tree** - Navigate decision paths
- **Collaborative Whiteboard** - Draw and annotate
- **Voice Commands** - Speech-based interaction
- **AR Overlay** - 3D visualization

### ✅ Interaction Analytics System
- Real-time tracking with IndexedDB storage
- Comprehensive analytics dashboard
- User journey mapping and funnel analysis
- Export capabilities (JSON, CSV, HTML)
- Heatmap generation for interaction zones

### ✅ Enhanced Features
- Particle effects for visual feedback
- Haptic feedback support
- Sound effects integration
- Full touch/mobile support

## 🎯 Features

### Course Structure
- **Multi-level Hierarchy**: Course → Lessons → Episodes → Segments
- **30+ Segment Types**: From course openings to code walkthroughs
- **Interactive Elements**: 20 different interaction types (Track 2 ✅)
- **Progress Tracking**: Points, badges, and completion tracking
- **Visual Assets**: Lazy-loaded images and diagrams with zoom/pan
- **Audio Generation**: Text-to-speech for all content
- **Interaction Analytics**: Comprehensive tracking and analysis (Track 2 ✅)

### Segment Types Implemented
1. **Opening & Introduction**
   - course_opening
   - instructor_introduction
   - episode_opening

2. **Explanation & Context**
   - concept_explanation
   - historical_context
   - origin_story
   - problem_recap
   - paradigm_shift

3. **Technical & Code**
   - technical_introduction
   - code_walkthrough
   - architecture_design
   - practical_example
   - practical_configuration

4. **Metrics & Data**
   - metric_deep_dive
   - new_metric_deep_dive
   - metrics_overview
   - metric_taxonomy

5. **Features & Concepts**
   - feature_introduction
   - new_feature_highlight
   - new_feature_discovery
   - concept_introduction
   - scalability_concept
   - immutability_concept

6. **Comparison & Decision**
   - technology_comparison
   - decision_framework

7. **UI & Schema**
   - ui_walkthrough
   - schema_introduction
   - advanced_customization

### Interactive Cue Types
1. **hover_to_explore** - Reveal information on hover
2. **drag_to_distribute** - Sort items into categories
3. **click_to_compare** - Toggle between states
4. **simulation** - Interactive simulations
5. **predict_value_change** - Predict outcomes
6. **code_completion** - Complete code snippets
7. **scenario_selection** - Choose best scenarios
8. **pause_and_reflect** - Timed reflection prompts
9. **important_note** - Highlight critical information
10. **interactive_explorer** - Click to explore content
11. **field_mapping_exercise** - Connect related fields
12. **ui_simulation** - Simulate UI interactions

### Visual Asset System
- **Lazy Loading**: Images load only when visible using Intersection Observer
- **Zoom/Pan**: Interactive controls for diagrams and large images
- **Placeholders**: Elegant loading states with SVG placeholders
- **Multiple Formats**: Support for images, diagrams, screenshots, infographics
- **Preloading**: Option to preload critical assets
- **Fullscreen Mode**: View diagrams in fullscreen
- **Error Handling**: Graceful fallback with retry options

## 📁 Project Structure

```
qslab/
├── app_v2.py              # Enhanced Flask backend
├── models_v2.py           # Comprehensive data models
├── migrate_to_v2.py       # Database migration script
├── run_v2.py              # Application launcher
├── index_v2.html          # Main UI
├── styles_v2.css          # Core styles
├── segment_styles.css     # Segment-specific styles
├── script_v2.js           # Core JavaScript
├── segment_renderers.js   # All segment type renderers
├── interactive_cues.js    # Interactive element handlers
├── visual_assets.js       # Visual asset management system
├── visual_assets.css      # Visual asset styles
├── static/               # Static resources
│   └── placeholders/     # SVG placeholder images
├── learning_content/      # Course data
│   └── analyticsSummary.json
├── audio_outputs/         # Generated audio files
└── neural_learn_v2.db     # SQLite database
```

## 🗄️ Database Schema

The application uses SQLAlchemy with the following main models:
- **Course**: Top-level container
- **Lesson**: Chapter within a course
- **Episode**: Learning unit within a lesson
- **Segment**: Individual content piece
- **UserProgress**: Tracks user advancement
- **SegmentInteraction**: Logs all interactions
- **Badge**: Achievement system
- **InteractiveCueTemplate**: Interaction definitions

## 🔧 API Endpoints

### Course Management
- `GET /api/courses` - List all courses
- `GET /api/courses/{id}` - Get course details
- `GET /api/courses/{id}/structure` - Get course structure

### Episode Management
- `GET /api/episodes/{id}` - Get episode with segments
- `GET /api/episodes/{id}/can-access` - Check prerequisites
- `POST /api/episodes/{id}/checkpoint` - Submit checkpoint

### Segment Management
- `GET /api/segments/{id}` - Get segment details
- `POST /api/segments/{id}/complete` - Mark complete
- `POST /api/segments/{id}/interaction` - Log interaction

### Progress Tracking
- `GET /api/users/{id}/progress` - Get user progress
- `POST /api/users/{id}/award-badge` - Award badge

### Visual Assets
- `GET /api/visual-assets/{id}` - Get visual asset metadata

## 🎨 UI Components

### Core Navigation
- **CourseNavigator** - Browse available courses
- **CourseSidebar** - Hierarchical lesson/episode navigation
- **EpisodePlayer** - Main content player
- **SegmentRenderer** - Dynamic segment rendering

### Progress & Gamification
- Points system with visual indicators
- Badge showcase with animations
- Progress bars at multiple levels
- Completion tracking

## 🚦 Requirements

### Python Dependencies
- Python 3.9-3.11 (for TTS support)
- Flask 3.0.0
- Flask-CORS
- Flask-SQLAlchemy
- SQLAlchemy

### Optional (for TTS)
- TTS 0.22.0
- PyTorch 2.0+
- torchaudio

### Frontend
- Modern browser with ES6 support
- JavaScript enabled
- LocalStorage for progress persistence

## 🎯 Sample Course: Kafka Monitoring

The platform comes pre-loaded with a comprehensive Kafka monitoring course featuring:
- 3 Lessons
- 15+ Episodes
- 100+ Segments
- Interactive exercises
- Share Groups deep dive

## 🔍 Development Tips

### Adding New Segment Types
1. Add renderer in `segment_renderers.js`
2. Add styles in `segment_styles.css`
3. Map in backend if needed

### Adding New Interactive Cues
1. Create handler class in `interactive_cues.js`
2. Add to `interactionHandlers` map
3. Style in `segment_styles.css`

### Customizing Courses
1. Edit `learning_content/analyticsSummary.json`
2. Run migration to reload: `python migrate_to_v2.py`

## 🐛 Troubleshooting

### Database Issues
```bash
# Reset database
rm neural_learn_v2.db
python migrate_to_v2.py
```

### Audio Not Working
- Check Python version (3.9-3.11 required)
- Install TTS dependencies
- App works without audio in fallback mode

### Progress Not Saving
- Check browser LocalStorage is enabled
- Ensure user ID is consistent
- Check browser console for errors

## 📈 Performance

- Lazy loads course content
- Caches segment data in memory
- Audio generation runs in background thread
- Supports 100+ concurrent users

## 🔒 Security Notes

- CORS enabled for development
- User IDs passed as parameters (add auth in production)
- SQL injection protected via SQLAlchemy
- XSS protection via content escaping

## 🚀 Future Enhancements

- [ ] Real-time collaboration
- [ ] Mobile app
- [ ] Offline mode with service workers
- [ ] Advanced analytics dashboard
- [ ] Content authoring tools
- [ ] Multi-language support

## 📝 License

This project is for educational purposes. See LICENSE file for details.