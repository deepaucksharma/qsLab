# TechFlix Quick Reference - Post Reorganization

## 🗂️ Where Things Are Now

### Documentation
- **User Guides**: `docs/guides/`
- **Architecture**: `docs/architecture/`
- **API Reference**: `docs/reference/`
- **Old Docs**: `docs/archives/`
- **Index**: `docs/README.md`

### Configuration
- **Vite**: `config/vite.config.js`
- **Vitest**: `config/vitest.config.js`
- **Tailwind**: `config/tailwind.config.js`
- **PostCSS**: `config/postcss.config.js`

### Code
- **Components**: `src/components/`
- **Scenes**: `src/components/scenes/`
- **Episodes**: `src/episodes/`
- **Pages**: `src/pages/`
- **Utilities**: `src/utils/`

### Scripts & Tools
- **Build Scripts**: `scripts/`
- **Server Files**: `server/`
- **TTS Scripts**: `scripts/tts-*.js`

## 🚀 Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm test                 # Run tests
npm run lint             # Lint code

# Scripts
./scripts/verify-reorganization.sh    # Verify structure
./scripts/generate-voiceovers.js      # Generate voice-overs
```

## 📝 Key Files at Root

Only essential files remain at root:
- `README.md` - Project overview
- `CHANGELOG.md` - Version history
- `package.json` - Dependencies
- `index.html` - App entry
- `tsconfig.json` - TypeScript config
- Config redirects for compatibility

## 🔍 Finding Things

### "Where is X?"
- **Docs about Y**: Check `docs/guides/` first, then `docs/architecture/`
- **Old file Z**: Probably in `docs/archives/`
- **Config for A**: Look in `config/`
- **Script for B**: Check `scripts/`

### Common Searches
```bash
# Find a component
find src/components -name "*.jsx" | grep -i "name"

# Find documentation
find docs -name "*.md" | grep -i "topic"

# Find episode files
find src/episodes -name "index.js"
```

## ✅ What Changed

1. **Moved from root to subdirs**: 35+ files
2. **Removed duplicates**: 7 files
3. **Created structure**: 10+ new directories
4. **Updated paths**: All configs and imports
5. **Cleaned artifacts**: .parcel-cache, logs

## 🎯 Quick Checks

Everything working? Run:
```bash
npm run dev    # Should start on port 3000
npm run build  # Should create dist/
npm test       # Should run tests
```

## 📚 More Info

- Full details: `docs/architecture/REORGANIZATION_COMPLETE.md`
- What to do next: `docs/architecture/POST_REORGANIZATION_ROADMAP.md`
- All documentation: `docs/README.md`

---

**Remember**: The goal was clarity and maintainability. Mission accomplished! 🎉