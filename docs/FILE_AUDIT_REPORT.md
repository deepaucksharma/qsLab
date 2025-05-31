# Neural Learn - File Audit Report

## Overview
This report analyzes all files in the repository and provides recommendations for alignment with the minimal design system and overall project goals.

## File Categories & Analysis

### 1. Core Application Files ✅
- **app.py** - Main Flask application (KEEP - Core functionality)
- **models.py** - SQLAlchemy models (KEEP - Database structure)
- **run.py** - Application launcher (KEEP - Entry point)
- **adaptive_learning.py** - Backend adaptive engine (KEEP - Core feature)

### 2. Frontend Files 🔄

#### HTML Files
- **index.html** - OLD design (REPLACE with minimal version)
- **index_minimal.html** - NEW minimal design (RENAME to index.html)
- **design_comparison.html** - Comparison demo (MOVE to docs/)

#### CSS Files - Need Consolidation
**OLD (To Archive):**
- styles.css - Old glassmorphism design
- segment_styles.css - Old segment styles
- visual_assets.css - Old visual styles
- new_interaction_styles.css - Not found but referenced
- analytics_dashboard.css - Not found but referenced
- track4_styles.css - Not found but referenced

**NEW (To Keep):**
- styles_minimal.css - New minimal design
- segment_styles_minimal.css - New segment styles
- visual_assets_minimal.css - New visual styles

#### JavaScript Files ✅
- **script.js** - Core application logic (KEEP)
- **segment_renderers.js** - Segment rendering (KEEP)
- **interactive_cues.js** - Interactive elements (KEEP)
- **visual_assets.js** - Asset management (KEEP)
- **adaptive_learning.js** - Frontend adaptive (KEEP)
- **apply_minimal_design.js** - Design enforcer (KEEP)
- **analytics_client.js** - Referenced but missing (CREATE or REMOVE reference)

### 3. Course Content Files 🔄

#### Kafka Course - Multiple Versions (Need Consolidation)
- kafka_course_complete_final.json - LATEST version (KEEP)
- kafka_course_complete_v2.json - Older version (ARCHIVE)
- kafka_course_complete.json - Template/skeleton (ARCHIVE)
- kafka_course_enhanced.json - Enhancement data (ARCHIVE)

#### Other Content ✅
- course_structure.json - Course metadata (KEEP)
- lessons_structure.json - Lesson structure (KEEP)
- segment_templates.json - Content templates (KEEP)
- visual_asset_catalog.json - Asset definitions (KEEP)
- code_snippets_kafka.json - Code examples (KEEP)
- analyticsSummary.json - Analytics data (KEEP)
- generated_courses/ - Additional courses (KEEP)

### 4. Audio Files 🔄
**Duplicates to Clean:**
- AUDIO_SEG* vs AUDIO_SEGMENT_* (same content, different naming)
- Various test files (test-segment-*, test-cleanup-*)
- Generation manifests (multiple versions)

### 5. Documentation Files 🔄
**Current & Relevant:**
- README.md - Main documentation (UPDATE)
- CLAUDE.md - AI instructions (KEEP)
- MINIMAL_DESIGN_GUIDE.md - Design system (KEEP)
- CONTENT_CREATION_GUIDE.md - Content guide (KEEP)

**To Archive:**
- Multiple summary/completion files
- Old migration summaries
- Duplicate design documentation

### 6. Utility Scripts 🔄
**Active:**
- batch_generate_audio.py - Audio generation (KEEP)
- edge_tts_handler.py - TTS handler (KEEP)
- switch_to_minimal.sh - Design switcher (KEEP)

**One-time/Old:**
- migrate_to_v2.py - Migration complete (ARCHIVE)
- generate_all_audio.py - Replaced by batch (ARCHIVE)
- app_static_audio.py - Old version (ARCHIVE)
- validation_results.json - Old results (ARCHIVE)

## Recommended Actions

### 1. Immediate Actions
1. Replace index.html with index_minimal.html
2. Archive old CSS files
3. Consolidate Kafka course versions
4. Clean duplicate audio metadata files

### 2. File Structure Reorganization
```
qslab/
├── app.py
├── models.py
├── run.py
├── adaptive_learning.py
├── static/
│   ├── css/
│   │   ├── styles.css (renamed from styles_minimal.css)
│   │   ├── segment_styles.css
│   │   └── visual_assets.css
│   ├── js/
│   │   ├── script.js
│   │   ├── segment_renderers.js
│   │   ├── interactive_cues.js
│   │   ├── visual_assets.js
│   │   ├── adaptive_learning.js
│   │   └── apply_minimal_design.js
│   └── placeholders/
├── templates/
│   └── index.html
├── learning_content/
│   ├── courses/
│   │   ├── kafka_monitoring.json
│   │   ├── javascript_essentials.json
│   │   ├── data_structures.json
│   │   └── microservices.json
│   ├── templates/
│   │   ├── segment_templates.json
│   │   └── visual_asset_catalog.json
│   └── metadata/
│       ├── course_structure.json
│       └── lessons_structure.json
├── audio_outputs/
│   └── [clean audio files]
├── utils/
│   ├── batch_generate_audio.py
│   └── edge_tts_handler.py
├── docs/
│   ├── README.md
│   ├── MINIMAL_DESIGN_GUIDE.md
│   ├── CONTENT_CREATION_GUIDE.md
│   └── design_comparison.html
└── archive/
    └── [old files]
```

### 3. Dependencies to Add
- Create analytics_client.js or remove references
- Ensure all CSS references in HTML are updated
- Update file paths in Python scripts

### 4. Configuration Updates
- Update CLAUDE.md with new file structure
- Update README.md with minimal design info
- Create .gitignore for archive folder