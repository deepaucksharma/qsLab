# Neural Learn Codebase Cleanup Summary

## Overview

This document summarizes the cleanup plan for the Neural Learn codebase to remove duplicates, consolidate files, and create a cleaner structure.

## Files to be Archived (20 files)

### Old Python Application Files (5 files)
- `app.py` - Original basic app (superseded by app_v2.py)
- `app_audio_gen.py` - Test variant with audio generation
- `app_simple_audio.py` - Test variant without TTS
- `app_tts_auto.py` - Test variant with auto license
- `app_xtts_optimized.py` - Another test variant
- `models.py` - Original models (superseded by models_v2.py)

### Old Frontend Files (3 files)
- `index.html` - Original UI (superseded by index_v2.html)
- `script.js` - Original JavaScript (superseded by script_v2.js)
- `styles.css` - Original styles (superseded by styles_v2.css)

### Old Documentation (7 files)
- `README.md` - Original readme (superseded by README_V2.md)
- `CLAUDE.md` - Original Claude instructions (superseded by CLAUDE_CLEAN.md)
- `IMPLEMENTATION_PLAN.md` - Initial plan
- `DETAILED_IMPLEMENTATION_PLAN.md` - Detailed version
- `IMPLEMENTATION_PLAN_V2.md` - Version 2
- `IMPLEMENTATION_PLAN_ENHANCED.md` - Enhanced version
- `CONTENT_IMPLEMENTATION_PLAN.md` - Content-specific plan

### Test/Demo Scripts (3 files)
- `test_integration.py` - Integration tests (may keep if needed)
- `demo_adaptive_learning.py` - Demo script
- `generate_all_audio.py` - Audio generation script

### Migration Script (1 file)
- `migrate_to_v2.py` - Database migration (archive for reference)

## Files to be Renamed (8 files)

All "v2" files will have the version suffix removed:

1. `app_v2.py` → `app.py`
2. `models_v2.py` → `models.py`
3. `index_v2.html` → `index.html`
4. `script_v2.js` → `script.js`
5. `styles_v2.css` → `styles.css`
6. `run_v2.py` → `run.py`
7. `README_V2.md` → `README.md`
8. `CLAUDE_CLEAN.md` → `CLAUDE.md`

## Files to Keep As-Is

### Core JavaScript Modules
- `segment_renderers.js` - 30+ segment type renderers
- `interactive_cues.js` - 12 interactive element implementations
- `visual_assets.js` - Visual asset management with lazy loading
- `adaptive_learning.js` - Frontend adaptive learning features

### Python Modules
- `adaptive_learning.py` - Backend adaptive learning engine

### Styles
- `segment_styles.css` - Segment-specific styling

### Documentation
- `CONSOLIDATED_IMPLEMENTATION_PLAN.md` - Final consolidated plan
- `IMPLEMENTATION_SUMMARY.md` - Current implementation summary

### Data & Assets
- `learning_content/` directory with JSON files
- `audio_outputs/` directory for generated audio
- `static/placeholders/` for placeholder images
- `neural_learn_v2.db` - SQLite database

## Import Updates Required

After renaming, the following replacements will be made in all relevant files:

- `from models_v2 import` → `from models import`
- `from app_v2 import` → `from app import`
- `app_v2.py` → `app.py`
- `models_v2.py` → `models.py`
- `index_v2.html` → `index.html`
- `script_v2.js` → `script.js`
- `styles_v2.css` → `styles.css`

## Benefits of Cleanup

1. **Clarity**: Single version of each file, no confusion
2. **Maintainability**: Easier to navigate and update
3. **Professional**: Clean structure for production
4. **Size Reduction**: ~20 fewer files in the repository
5. **Consistency**: All files follow standard naming

## Running the Cleanup

Execute the cleanup script:
```bash
python cleanup_codebase.py
```

This will:
1. Create a timestamped archive directory
2. Move old files to the archive
3. Rename v2 files to remove version suffix
4. Update all imports and references
5. Generate a cleanup report

## Post-Cleanup Structure

```
qslab/
├── app.py                    # Main application
├── models.py                 # Database models
├── adaptive_learning.py      # Adaptive learning
├── run.py                    # Launcher script
├── requirements.txt          # Dependencies
├── index.html                # Main UI
├── styles.css                # Core styles
├── segment_styles.css        # Segment styles
├── script.js                 # Core JavaScript
├── segment_renderers.js      # Segment renderers
├── interactive_cues.js       # Interactive elements
├── visual_assets.js          # Visual assets
├── adaptive_learning.js      # Adaptive frontend
├── CLAUDE.md                 # Claude instructions
├── README.md                 # Project readme
├── archive_[timestamp]/      # Archived old files
└── [data directories]/       # Audio, content, etc.
```

## Verification Steps

After cleanup:
1. Run `python app.py` to test the application
2. Check that all imports work correctly
3. Verify the UI loads properly at http://localhost:5000
4. Test a few interactions to ensure functionality
5. If everything works, the archive directory can be deleted

## Rollback

If needed, all original files are preserved in the timestamped archive directory and can be restored.