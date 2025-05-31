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

### Dependencies Installation

```bash
pip install -r requirements.txt
```

Note: The application will automatically create the SQLite database and required directories on first run.

## Architecture

### Database Structure (SQLAlchemy Models)

The application uses SQLite with SQLAlchemy ORM. Key models include:

- **Course** → **Lesson** → **Episode** → **Segment** → **Visual** (hierarchical structure)
- **User** & **UserProgress** - User management and progress tracking
- **Badge**, **UserCertificate** - Gamification elements
- **MediaAsset**, **VisualAsset** - Media management
- **InteractiveCueTemplate** - Interactive element templates
- **SegmentInteraction**, **AnalyticsEvent** - Analytics tracking

### Backend Structure

- **app.py**: Main Flask application
  - 30+ RESTful API endpoints
  - Audio generation with background worker thread
  - Uses XTTS v2 multilingual model (hardcoded to English)
  - SQLAlchemy database: `neural_learn_v2.db`
  - Auto-creates database tables on startup
  - CORS enabled for all origins

- **models.py**: Database models
  - Comprehensive course structure with UUID primary keys
  - Rich metadata support for all entities
  - Support for 30+ segment types and 12 interaction types

- **adaptive_learning.py**: Adaptive learning engine
  - Learning profile analysis and personalization
  - Spaced repetition scheduling (SM-2 algorithm)
  - Difficulty adjustment based on performance
  - Learning path generation

### Frontend Structure

- **index.html**: Main UI with course navigation
- **styles.css**: Glassmorphism design system
- **segment_styles.css**: Styles for 30+ segment types
- **script.js**: Core application logic
  - State management with AppState
  - Event bus for component communication
  - API service layer

- **segment_renderers.js**: Renders all 30+ segment types
- **interactive_cues.js**: Implements 12 interactive elements
- **visual_assets.js**: Lazy loading and zoom/pan for visuals
- **adaptive_learning.js**: Frontend adaptive learning features

### Key API Endpoints

#### Course Management
- `/api/courses` - List all courses
- `/api/courses/<id>` - Get course details
- `/api/lessons/<id>` - Get lesson with episodes
- `/api/episodes/<id>` - Get episode with segments
- `/api/segments/<id>/complete` - Mark segment complete

#### Media & Assets
- `/api/generate-segment-audio` - Queue TTS generation
- `/api/audio-status/<task_id>` - Check audio status
- `/api/visual-assets/<id>` - Get visual asset metadata
- `/audio/<filename>` - Serve audio files

#### Progress & Gamification
- `/api/users/<id>/progress` - Get user progress
- `/api/badges/award` - Award badge to user
- `/api/checkpoints/<id>/submit` - Submit checkpoint answers

#### Adaptive Learning
- `/api/v1/adaptive/profile/<user_id>` - Get learning profile
- `/api/v1/adaptive/personalize` - Personalize content
- `/api/v1/spaced-repetition/generate-session` - Create review session

### Directory Structure

```
qslab/
├── app.py                 # Main Flask application
├── models.py              # SQLAlchemy models
├── adaptive_learning.py   # Adaptive learning engine
├── requirements.txt       # Python dependencies
├── run.py                 # Launcher script
├── index.html             # Main UI
├── styles.css             # Core styles
├── segment_styles.css     # Segment-specific styles
├── script.js              # Core JavaScript
├── segment_renderers.js   # Segment rendering logic
├── interactive_cues.js    # Interactive elements
├── visual_assets.js       # Visual asset management
├── adaptive_learning.js   # Adaptive frontend
├── audio_outputs/         # Generated TTS audio
├── static/
│   └── placeholders/      # Auto-generated SVG placeholders
├── learning_content/      # Course JSON data
│   ├── course_structure.json
│   ├── lessons_structure.json
│   └── analyticsSummary.json
└── neural_learn_v2.db     # SQLite database
```

## Segment Types (30+)

The platform supports a rich variety of segment types, each with custom rendering:

- **Opening/Introduction**: course_opening, instructor_introduction, episode_opening
- **Explanation/Context**: concept_explanation, historical_context, origin_story, problem_recap, paradigm_shift
- **Technical/Code**: technical_introduction, code_walkthrough, architecture_design, practical_example, practical_configuration
- **Metrics/Data**: metric_deep_dive, new_metric_deep_dive, metrics_overview, metric_taxonomy
- **Features/Concepts**: feature_introduction, new_feature_highlight, new_feature_discovery, concept_introduction, scalability_concept, immutability_concept
- **UI/Schema**: ui_walkthrough, schema_introduction, advanced_customization
- **Assessment**: knowledge_check, checkpoint, scenario_selection, field_mapping_exercise, simulation

## Interactive Elements (12 types)

All interactions are fully implemented with visual feedback and logging:

- **hover_to_explore**: Reveal information on hover
- **drag_to_distribute**: Drag items to categories
- **click_to_compare**: Toggle between states
- **simulation**: Interactive parameter adjustment
- **predict_value_change**: Guess outcomes
- **code_completion**: Fill in code blanks
- **scenario_selection**: Multiple choice
- **pause_and_reflect**: Timed reflection
- **important_note**: Highlight critical info
- **interactive_explorer**: Click-based exploration
- **field_mapping_exercise**: Connect related items
- **ui_simulation**: Mock UI interactions

## Important Implementation Details

### Audio Generation
- Queue-based system with background worker thread
- Audio files saved as WAV format: `audio_outputs/{task_id}.wav`
- XTTS v2 model supports multiple languages but currently hardcoded to English
- No timeout implemented for generation

### Visual Assets
- Lazy loading with Intersection Observer
- Automatic SVG placeholder generation
- Zoom/pan functionality for diagrams
- Preloading support for performance

### Adaptive Learning
- Analyzes user interactions to build learning profiles
- Adjusts content difficulty in real-time
- Generates personalized learning paths
- Implements spaced repetition for optimal retention

### Security Considerations
- CORS is enabled for all origins (restrict in production)
- No authentication implemented (by design for development)
- User IDs passed as URL parameters
- SQLAlchemy ORM provides SQL injection protection

### Performance Notes
- TTS model loads on startup (~1.8GB memory)
- CUDA automatically used if available
- Basic lazy loading for images
- No Redis caching implemented yet

## Dependencies

- Flask 3.0.0 with Flask-CORS
- flask-sqlalchemy 3.1.1
- numpy >= 1.21.0 (for adaptive learning)
- TTS 0.22.0 (Coqui TTS) - Requires Python 3.9-3.11
- PyTorch 2.0+ with torchaudio
- XTTS v2 model (~1.8GB, downloads on first run)