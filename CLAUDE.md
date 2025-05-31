# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Neural Learn is a comprehensive AI-powered learning platform designed to create immersive, interactive learning experiences. The platform features both glassmorphism and minimal UI designs, adaptive learning capabilities, and supports complex course structures with 30+ segment types and 20 interactive elements. Audio is served from pre-generated files (no real-time TTS).

## Common Commands

### Running the Application

```bash
# Start the Flask backend
python app.py

# Or use the launcher script (auto-installs dependencies)
python run.py

# Switch to minimal design (currently active)
./switch_to_minimal.sh

# Access the application at http://localhost:5000
```

### Dependencies Installation

```bash
pip install -r requirements.txt
```

Note: The application will automatically create the SQLite database and required directories on first run.

## Current State

- **Active Design**: Minimal design (index_minimal.html served as index.html)
- **Frontend Location**: All frontend files are in `/static/` directory
- **Audio System**: Pre-generated audio files only (no real-time TTS)
- **Database**: SQLite with SQLAlchemy ORM (`instance/neural_learn_v2.db`)

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
  - 40+ RESTful API endpoints
  - Serves pre-generated audio files
  - SQLAlchemy database: `instance/neural_learn_v2.db`
  - Auto-creates database tables on startup
  - CORS enabled for all origins
  - No audio generation functionality (uses pre-existing files)

- **models.py**: Database models
  - Comprehensive course structure with UUID primary keys
  - Rich metadata support for all entities
  - Support for 30+ segment types and 20 interaction types

- **adaptive_learning.py**: Adaptive learning engine
  - Learning profile analysis and personalization
  - Spaced repetition scheduling (SM-2 algorithm)
  - Difficulty adjustment based on performance
  - Learning path generation

### Frontend Structure (in /static/ directory)

- **index.html** (served from /templates/): Main UI with course navigation
- **/static/css/styles.css**: Core styles (both glassmorphism and minimal)
- **/static/css/segment_styles.css**: Styles for 30+ segment types
- **/static/css/styles_minimal.css**: Minimal design styles
- **/static/css/segment_styles_minimal.css**: Minimal segment styles
- **/static/css/visual_assets_minimal.css**: Minimal visual assets styles
- **/static/js/script.js**: Core application logic with integrated analytics
  - State management with AppState
  - Event bus for component communication
  - API service layer
  - Consolidated analytics module with IndexedDB storage

- **/static/js/segment_renderers.js**: Renders all 30+ segment types
- **/static/js/interactive_cues.js**: Implements 20 interactive elements
- **/static/js/visual_assets.js**: Lazy loading and zoom/pan for visuals
- **/static/js/adaptive_learning.js**: Frontend adaptive learning features

### Key API Endpoints

#### Course Management
- `/api/courses` - List all courses
- `/api/courses/<id>` - Get course details
- `/api/lessons/<id>` - Get lesson with episodes
- `/api/episodes/<id>` - Get episode with segments
- `/api/segments/<id>/complete` - Mark segment complete

#### Media & Assets
- `/api/visual-assets/<id>` - Get visual asset metadata
- `/audio/<filename>` - Serve pre-generated audio files
- `/api/upload-media` - Upload media assets

#### Progress & Gamification
- `/api/users/<id>/progress` - Get user progress
- `/api/badges/award` - Award badge to user
- `/api/checkpoints/<id>/submit` - Submit checkpoint answers
- `/api/certificates/award` - Award certificate

#### Analytics
- `/api/analytics/track` - Track analytics events
- `/api/analytics/events` - Get analytics events
- `/api/analytics/summary` - Get analytics summary

#### Adaptive Learning
- `/api/v1/adaptive/profile/<user_id>` - Get learning profile
- `/api/v1/adaptive/personalize` - Personalize content
- `/api/v1/spaced-repetition/generate-session` - Create review session

#### System
- `/api/health` - Health check endpoint
- `/api/llm/generate-visuals` - Generate visuals with LLM (experimental)

### Directory Structure

```
qslab/
├── app.py                 # Main Flask application
├── models.py              # SQLAlchemy models
├── adaptive_learning.py   # Adaptive learning engine
├── requirements.txt       # Python dependencies
├── run.py                 # Launcher script
├── templates/
│   └── index.html         # Main HTML template
├── static/
│   ├── css/               # All CSS files
│   │   ├── styles.css
│   │   ├── segment_styles.css
│   │   ├── styles_minimal.css
│   │   ├── segment_styles_minimal.css
│   │   └── visual_assets_minimal.css
│   ├── js/                # All JavaScript files
│   │   ├── script.js
│   │   ├── segment_renderers.js
│   │   ├── interactive_cues.js
│   │   ├── visual_assets.js
│   │   └── adaptive_learning.js
│   └── placeholders/      # Auto-generated SVG placeholders
├── audio_outputs/         # Pre-generated audio files
├── learning_content/      # Course JSON data
│   ├── course_structure.json
│   ├── kafka_course_complete_v2.json
│   └── generated_courses/
├── instance/
│   └── neural_learn_v2.db # SQLite database
└── archive/               # Old design files
```

## Audio System

The platform uses pre-generated audio files:

- **Format**: MP3 and WAV files in `audio_outputs/` directory
- **Naming**: Files use UUID-based naming (e.g., `SEGMENT_01_01_01_LINKEDIN_2010_V2_7d226ff7.json`)
- **Serving**: Direct file serving via Flask `/audio/<filename>` endpoint
- **No Real-time Generation**: All audio must be pre-generated

## Segment Types (30+)

The platform supports a rich variety of segment types, each with custom rendering:

- **Opening/Introduction**: course_opening, instructor_introduction, episode_opening
- **Explanation/Context**: concept_explanation, historical_context, origin_story, problem_recap, paradigm_shift
- **Technical/Code**: technical_introduction, code_walkthrough, architecture_design, practical_example, practical_configuration
- **Metrics/Data**: metric_deep_dive, new_metric_deep_dive, metrics_overview, metric_taxonomy
- **Features/Concepts**: feature_introduction, new_feature_highlight, new_feature_discovery, concept_introduction, scalability_concept, immutability_concept
- **UI/Schema**: ui_walkthrough, schema_introduction, advanced_customization
- **Assessment**: knowledge_check, checkpoint, scenario_selection, field_mapping_exercise, simulation

## Interactive Elements (20 types)

Original 12 interactive types:
- hover_to_explore, drag_to_distribute, click_to_compare, simulation
- predict_value_change, code_completion, scenario_selection, pause_and_reflect
- important_note, interactive_explorer, field_mapping_exercise, ui_simulation

Track 2 additions (8 types):
- concept_connector, pattern_matcher, sequence_builder, timeline_explorer
- compare_contrast, layered_revelation, guided_practice, reflection_prompt

## Important Implementation Details

### Analytics System
- Client-side analytics with IndexedDB storage
- Comprehensive event tracking for all interactions
- Analytics summary generation for learning insights
- No external analytics services required

### Design Options
- **Glassmorphism**: Original design with glass-morphic effects
- **Minimal**: Clean, focused design (currently active)
- Switch between designs using shell scripts

### Security Considerations
- CORS is enabled for all origins (restrict in production)
- No authentication implemented (by design for development)
- User IDs passed as URL parameters
- SQLAlchemy ORM provides SQL injection protection

### Performance Notes
- Pre-generated audio files (no runtime generation)
- Lazy loading for images with Intersection Observer
- IndexedDB for client-side analytics storage
- No external API dependencies for core functionality

## Dependencies

```
flask==3.0.0
flask-cors==4.0.0
flask-sqlalchemy==3.1.1
numpy>=1.21.0  # For adaptive learning algorithms
requests>=2.28.0  # For API calls
```

## Development Notes

### Adding New Content
1. Create course JSON in `learning_content/`
2. Pre-generate any required audio files
3. Place audio files in `audio_outputs/`
4. Import course via the API or database seeding

### Common Issues
- If audio doesn't play, check file exists in `audio_outputs/`
- Database auto-creates on first run in `instance/` directory
- Frontend files must be in `/static/` directory to be served

## Important Notes

- **No Edge TTS**: Despite references in old documentation, the system uses only pre-generated audio
- **app_with_audio.py**: Alternative version exists but `app.py` is the main application
- **run.py**: Launcher script includes TTS dependency checks (not needed for current implementation)