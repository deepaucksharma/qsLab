# Neural Learn - Comprehensive Reorganization Plan

## Current State Analysis

### Critical Dependencies to Check:
1. **Flask App (app.py)**:
   - Serves static files from current directory
   - Renders index.html directly
   - Audio files served from audio_outputs/
   - Need to update static file paths

2. **Frontend Loading**:
   - index.html loads CSS/JS from root directory
   - JavaScript files reference each other
   - Audio paths hardcoded in JS
   - Visual assets loaded from static/placeholders/

3. **Database & Models**:
   - SQLite database in instance/
   - Models.py references don't need changes

4. **Content Files**:
   - JSON files in learning_content/
   - Referenced by app.py endpoints
   - Need to maintain paths

## Reorganization Strategy

### Phase 1: Prepare Minimal Design Files (DONE ✅)
- Created styles.css from minimal design
- Need to create segment_styles.css and visual_assets.css
- Already have apply_minimal_design.js

### Phase 2: Move Files Without Breaking
1. **CSS Files**:
   - Archive old: styles.css → archive/
   - Create new minimal versions in static/css/
   - Update HTML references

2. **JavaScript Files**:
   - Move to static/js/
   - Update HTML script tags
   - No internal path changes needed (relative imports)

3. **HTML Template**:
   - Move index.html to templates/
   - Update Flask render_template path

### Phase 3: Update Application Code
1. **app.py updates**:
   ```python
   # Current
   @app.route('/')
   def index():
       return send_file('index.html')
   
   # New
   @app.route('/')
   def index():
       return render_template('index.html')
   ```

2. **Static file serving**:
   ```python
   # Flask automatically serves from /static/
   # Update paths in HTML from "script.js" to "/static/js/script.js"
   ```

### Phase 4: Content Consolidation
1. **Kafka Course Files**:
   - Keep: kafka_course_complete_final.json (latest)
   - Archive: kafka_course_complete_v2.json, kafka_course_complete.json
   - Update references in app.py if needed

2. **Audio Files**:
   - Keep all .wav/.mp3 files
   - Clean duplicate .json metadata files
   - Maintain audio_outputs/ location (referenced by app.py)

### Phase 5: Documentation Organization
1. Move to docs/:
   - MINIMAL_DESIGN_GUIDE.md
   - CONTENT_CREATION_GUIDE.md
   - Design comparison files

2. Keep in root:
   - README.md
   - CLAUDE.md
   - requirements.txt

## File Path Updates Required

### In templates/index.html:
```html
<!-- Old -->
<link rel="stylesheet" href="styles.css">
<script src="script.js"></script>

<!-- New -->
<link rel="stylesheet" href="/static/css/styles.css">
<script src="/static/js/script.js"></script>
```

### In app.py:
```python
# Add at top
from flask import render_template

# Update route
@app.route('/')
def index():
    return render_template('index.html')
```

### In JavaScript files:
- No changes needed (they use relative paths)
- Audio paths remain the same (/audio/<filename>)

## Potential Issues to Avoid

1. **Breaking Changes**:
   - Don't move audio_outputs/ (hardcoded in app.py)
   - Keep instance/ location (SQLite database)
   - Maintain learning_content/ structure

2. **Path References**:
   - Update all CSS/JS paths in HTML
   - Ensure Flask static serving works
   - Test all file loading after moves

3. **Missing Files**:
   - analytics_client.js doesn't exist (remove reference or create stub)
   - Some referenced CSS files missing (create minimal versions)

## Implementation Order

1. ✅ Create directory structure
2. ✅ Create minimal CSS files in static/css/
3. ⏳ Create remaining minimal CSS files
4. ⏳ Move JavaScript files to static/js/
5. ⏳ Update templates/index.html with new paths
6. ⏳ Update app.py to use render_template
7. ⏳ Archive old design files
8. ⏳ Consolidate course JSON files
9. ⏳ Move documentation to docs/
10. ⏳ Test everything works

## Validation Steps

After reorganization:
1. Start app with `python app.py`
2. Check all CSS/JS loads correctly
3. Verify course navigation works
4. Test audio playback
5. Ensure visual assets display
6. Check all interactive elements

## Rollback Plan

If issues occur:
1. Git has all changes tracked
2. Old files in archive/ folder
3. Can quickly revert path changes
4. Original index.html backed up