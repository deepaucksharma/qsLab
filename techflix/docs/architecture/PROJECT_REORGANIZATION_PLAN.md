# Project Reorganization Plan

## Current Issues
1. **Confusing Root Structure**: Mix of application files, documentation, and configs at root
2. **Redundant techflix folder**: Contains only docs, creating confusion
3. **Scattered Documentation**: MD files spread across root and various folders
4. **No Clear Separation**: Source, docs, configs, and build files mixed together
5. **Multiple Config Files**: Various configs without clear organization

## Proposed New Structure

```
techflix/
├── .github/                    # GitHub specific files
│   └── workflows/             # CI/CD workflows
│
├── docs/                      # All documentation
│   ├── guides/               # How-to guides
│   │   ├── BUILD_GUIDE.md
│   │   ├── TTS_TESTING_GUIDE.md
│   │   └── VOICEOVER_GUIDE.md
│   ├── architecture/         # Technical architecture docs
│   │   ├── AUDIO_SYSTEM.md
│   │   ├── EPISODE_STRUCTURE.md
│   │   └── CINEMATIC_DESIGN.md
│   ├── api/                  # API documentation
│   └── archives/             # Old/deprecated docs
│
├── src/                       # Source code
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── utils/
│   ├── styles/
│   ├── episodes/
│   ├── data/
│   ├── layouts/
│   ├── router/
│   ├── store/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── public/                    # Static assets
│   ├── audio/
│   │   ├── voiceovers/
│   │   ├── effects/
│   │   └── music/
│   ├── images/
│   └── plugins/
│
├── scripts/                   # Build and utility scripts
│   ├── generate-voiceovers.js
│   ├── tts-api-mock.js
│   └── setup-audio.sh
│
├── tests/                     # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── config/                    # Configuration files
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vitest.config.js
│
├── .husky/                    # Git hooks
├── node_modules/             # Dependencies
├── dist/                     # Build output
│
├── .env.example              # Environment example
├── .eslintrc.json           # ESLint config
├── .gitignore               # Git ignore
├── .prettierrc.json         # Prettier config
├── CHANGELOG.md             # Project changelog
├── package.json             # Package config
├── package-lock.json        # Package lock
├── README.md                # Main readme
├── server.js                # Production server
└── tsconfig.json            # TypeScript config
```

## Reorganization Steps

### Phase 1: Documentation Consolidation
1. Create proper `docs/` structure
2. Move all `.md` files to appropriate subdirectories
3. Remove redundant techflix/docs folder
4. Update all internal links

### Phase 2: Configuration Organization
1. Create `config/` directory
2. Move all config files except essential root ones
3. Update import paths in scripts

### Phase 3: Source Code Cleanup
1. Audit `src/` for unused files
2. Organize components by feature/type
3. Create index files for cleaner imports

### Phase 4: Scripts Organization
1. Review all scripts for relevance
2. Remove outdated scripts
3. Add proper documentation

### Phase 5: Asset Organization
1. Reorganize `public/audio/` by type
2. Remove unused assets
3. Optimize file sizes

## Benefits
- **Clear Structure**: Obvious where everything belongs
- **Better Onboarding**: New developers understand layout immediately
- **Easier Maintenance**: Related files grouped together
- **Cleaner Root**: Only essential files at root level
- **Scalability**: Structure supports growth

## Migration Checklist
- [ ] Backup current structure
- [ ] Create new directory structure
- [ ] Move documentation files
- [ ] Move configuration files
- [ ] Update all import paths
- [ ] Update build scripts
- [ ] Test all functionality
- [ ] Update README with new structure
- [ ] Clean up old/empty directories
- [ ] Commit with clear message

## Files to Remove/Archive
- `Allcontent` - Unclear purpose, should be in docs or removed
- `index-simple.html` - If not used, remove
- Duplicate or outdated documentation
- Empty directories
- Unused assets

## New Files to Create
- `docs/README.md` - Documentation index
- `src/components/README.md` - Component guidelines
- `scripts/README.md` - Script documentation
- `.env.example` - With all required variables

## Import Path Updates Needed
- Vite config imports
- Component imports
- Utility imports
- Script references
- Documentation links