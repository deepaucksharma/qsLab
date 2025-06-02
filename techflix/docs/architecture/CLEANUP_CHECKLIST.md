# TechFlix Cleanup Checklist

## Pre-Cleanup
- [ ] Create full backup: `tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz .`
- [ ] Ensure git is clean: `git status`
- [ ] Create cleanup branch: `git checkout -b feature/major-reorganization`

## 🗂️ Documentation Cleanup

### Move to `docs/guides/`:
- [ ] BUILD_GUIDE.md
- [ ] TTS_TESTING_GUIDE.md
- [ ] VOICEOVER_IMPLEMENTATION.md
- [ ] DEBUG_GUIDE.md (from archives)

### Move to `docs/architecture/`:
- [ ] AUDIO_SYSTEM_REFACTORING_PLAN.md → AUDIO_SYSTEM.md
- [ ] AUDIO_MIGRATION_GUIDE.md
- [ ] PROJECT_STRUCTURE.md
- [ ] CINEMATIC_DESIGN_UPDATE_PLAN.md → CINEMATIC_DESIGN.md
- [ ] CINEMATIC_UX_IMPROVEMENTS.md
- [ ] UPDATE_ALL_SCENES.md → SCENE_DEVELOPMENT.md

### Archive to `docs/archives/`:
- [ ] CINEMATIC_DESIGN_UPDATE_PROGRESS.md
- [ ] All files from techflix/docs/
- [ ] Allcontent file
- [ ] index-simple.html
- [ ] Old implementation summaries

### Create New Docs:
- [ ] docs/README.md (documentation index)
- [ ] docs/guides/README.md (guide index)
- [ ] docs/architecture/README.md (architecture index)

## 🗑️ Delete Completely

### Old Build System:
- [ ] `.parcel-cache/` directory
- [ ] `.parcelrc` file
- [ ] `.postcssrc` file
- [ ] `parcel-bundle-reports/` directory

### Redundant:
- [ ] `techflix/` directory (after moving docs)
- [ ] Duplicate scene components (V1, V2 versions)
- [ ] Old hook versions

## 📁 Directory Structure

### Create Directories:
- [ ] `config/` - For non-essential configs
- [ ] `tests/unit/`
- [ ] `tests/integration/`
- [ ] `tests/e2e/`
- [ ] `docs/guides/`
- [ ] `docs/architecture/`
- [ ] `docs/api/`
- [ ] `public/audio/effects/`
- [ ] `public/audio/music/`

### Move Configs:
- [ ] `vite.config.js` → `config/vite.config.js`
- [ ] `vitest.config.js` → `config/vitest.config.js`
- [ ] `tailwind.config.js` → `config/tailwind.config.js`
- [ ] `postcss.config.js` → `config/postcss.config.js`

## 🧹 Source Code Cleanup

### Components to Review:
- [ ] Merge EvolutionTimelineScene versions (keep V3)
- [ ] Remove duplicate scene components
- [ ] Organize components by feature
- [ ] Add index.js exports for cleaner imports

### Hooks to Consolidate:
- [ ] Merge useAudio and useAudioV2
- [ ] Remove duplicate voiceover hooks
- [ ] Create consistent hook naming

### Utils to Merge:
- [ ] Combine audioManager and audioManagerV2
- [ ] Remove deprecated utility functions
- [ ] Update all imports

### Episodes:
- [ ] Remove empty episode folders (ep6, ep7)
- [ ] Ensure consistent episode structure
- [ ] Update episode index

## 🔧 Configuration Updates

### Update package.json scripts:
- [ ] Update vite command to use config path
- [ ] Update test command to use config path
- [ ] Remove old parcel scripts
- [ ] Add new utility scripts

### Update imports:
- [ ] Find all config imports and update paths
- [ ] Update relative imports that will break
- [ ] Test all build processes

## 🧪 Testing

### Build Tests:
- [ ] `npm install` - Verify dependencies
- [ ] `npm run dev` - Test development server
- [ ] `npm run build` - Test production build
- [ ] `npm run preview` - Test build preview

### Feature Tests:
- [ ] Test episode playback
- [ ] Test voice-over system
- [ ] Test TTS testing page
- [ ] Test all navigation

### Import Tests:
- [ ] Verify all component imports work
- [ ] Check config file imports
- [ ] Test dynamic imports

## 📝 Final Documentation

### Update README.md:
- [ ] New project structure section
- [ ] Updated setup instructions
- [ ] New script documentation
- [ ] Contributing guidelines

### Create Migration Guide:
- [ ] Document what moved where
- [ ] Import path changes
- [ ] New script locations
- [ ] Breaking changes

## 🚀 Deployment

### Pre-deployment:
- [ ] Run full test suite
- [ ] Check bundle size
- [ ] Verify all assets load
- [ ] Test in production mode

### Git Operations:
- [ ] Stage all changes: `git add -A`
- [ ] Create detailed commit message
- [ ] Push cleanup branch
- [ ] Create PR with summary
- [ ] Get team review

### Post-deployment:
- [ ] Monitor for issues
- [ ] Update CI/CD if needed
- [ ] Communicate changes to team
- [ ] Archive backup after stable

## 📊 Success Metrics

### Before:
- Root files: _____ (count them)
- Doc files scattered: _____ locations
- Duplicate components: _____ files
- Config files at root: _____ files

### After:
- Root files: < 10
- Doc files: All in docs/
- Duplicate components: 0
- Config files at root: 4

## ⚠️ Rollback Plan

If issues arise:
1. `git checkout main`
2. `git branch -D feature/major-reorganization`
3. Restore from backup if needed
4. Document what went wrong
5. Plan smaller incremental changes

## Notes Section
_Use this space to track issues, decisions, and observations during cleanup:_

---

Remember: **Test after each major change!** Don't try to do everything at once.