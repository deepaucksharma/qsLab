# Git Workflow for 4-Track Parallel Development

## Overview

This document defines the Git branching strategy for the 4 independent development tracks, based on industry best practices for parallel development. We use a modified GitFlow approach optimized for our 4-track system.

## Why This Workflow?

Based on best practices research:
- **Feature branches** enable parallel development without conflicts
- **Regular integration** prevents merge conflicts from growing
- **Clear naming conventions** improve team communication
- **Topic branches** allow context switching between features
- **Pull requests** ensure code quality through reviews

## Branch Structure

```
main (production-ready code)
├── develop (integration branch)
│   ├── track-1-content (Content Production base)
│   │   └── feature branches (track-1-content/*)
│   ├── track-2-interactive (Interactive Learning base)
│   │   └── feature branches (track-2-interactive/*)
│   ├── track-3-analytics (Learning Analytics base)
│   │   └── feature branches (track-3-analytics/*)
│   └── track-4-polish (Platform Polish base)
│       └── feature branches (track-4-polish/*)
├── release/* (release preparation)
└── hotfix/* (emergency fixes)
```

## Best Practices Applied

### 1. **Stable Main Branch**
- Main branch is always deployable
- Only tested, reviewed code reaches main
- Protects production stability

### 2. **Feature Branch Isolation**
- Each feature in its own branch
- Enables parallel work without conflicts
- Easy to review and test in isolation

### 3. **Regular Integration**
- Weekly merges prevent drift
- Continuous integration reduces conflicts
- Keeps all tracks synchronized

### 4. **Clear Naming Conventions**
- `track-X-base/feature-name` format
- Self-documenting branch names
- Easy to identify ownership

## Initial Setup - Worktree Only Approach

### 1. Clone Repository and Create Develop Branch
```bash
# Clone main repository
git clone <repository-url> qslab
cd qslab

# Create develop branch if it doesn't exist
git checkout -b develop
git push -u origin develop
```

### 2. Create Worktrees for Each Track
```bash
# From the main qslab directory
cd /path/to/qslab

# Create track branches in origin first
git push origin develop:track-1-content
git push origin develop:track-2-interactive
git push origin develop:track-3-analytics
git push origin develop:track-4-polish

# Create worktrees for each track
git worktree add ../qslab-track1-content track-1-content
git worktree add ../qslab-track2-interactive track-2-interactive
git worktree add ../qslab-track3-analytics track-3-analytics
git worktree add ../qslab-track4-polish track-4-polish
```

### 3. Directory Structure After Setup
```
parent-directory/
├── qslab/                    # Main repository (develop branch)
├── qslab-track1-content/     # Track 1 worktree
├── qslab-track2-interactive/ # Track 2 worktree
├── qslab-track3-analytics/   # Track 3 worktree
└── qslab-track4-polish/      # Track 4 worktree
```

## Daily Workflow - Worktree Based

### For Track Team Members

#### 1. Start New Feature
```bash
# Navigate to your track's worktree
cd ../qslab-track1-content

# Update your track branch
git pull origin track-1-content

# Create feature branch
git checkout -b track-1-content/add-python-course
```

#### 2. Work on Feature
```bash
# Make changes
git add .
git commit -m "feat(content): add Python fundamentals lesson 1"

# Push feature branch
git push -u origin track-1-content/add-python-course
```

#### 3. Create Pull Request
- Target: Your track branch (e.g., `track-1-content`)
- Title: `[Track 1] Add Python fundamentals course`
- Description: Include what was added/changed
- Label: `track-1`, `content`

#### 4. After PR Approval
```bash
# In your track worktree
cd ../qslab-track1-content

# Merge via GitHub/GitLab UI or locally
git checkout track-1-content
git merge track-1-content/add-python-course
git push origin track-1-content

# Delete feature branch
git branch -d track-1-content/add-python-course
git push origin --delete track-1-content/add-python-course
```

## Weekly Integration Process

### Monday Integration Meeting

#### 1. Track Leads Prepare PRs
Each track lead creates a PR from their track branch to develop:

```bash
# Track 1 Lead
git checkout track-1-content
git pull origin track-1-content
# Create PR: track-1-content → develop
```

#### 2. Integration Order
Follow this order to minimize conflicts:
1. **Track 4 (Polish)** - Bug fixes first
2. **Track 1 (Content)** - New content
3. **Track 2 (Interactive)** - New features
4. **Track 3 (Analytics)** - New tracking

#### 3. Resolve Conflicts
```bash
# In your track worktree
cd ../qslab-track1-content

# Pull latest develop
git fetch origin
git merge origin/develop
# Resolve conflicts
git add .
git commit -m "merge: resolve conflicts with develop"
git push origin track-1-content
```

## Bi-Weekly Release Process

### 1. Create Release Candidate
```bash
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0
git push -u origin release/v1.2.0
```

### 2. Test & Fix
```bash
# Bug fixes go directly to release branch
git checkout -b release/v1.2.0-fix-audio-bug
# Fix bug
git add .
git commit -m "fix: audio playback issue in segment renderer"
```

### 3. Merge to Main
```bash
# After testing passes
git checkout main
git merge release/v1.2.0
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin main --tags
```

### 4. Back-merge to Develop and Update Worktrees
```bash
# In main repository
cd /path/to/qslab
git checkout develop
git merge main
git push origin develop

# Update each worktree
cd ../qslab-track1-content && git pull origin develop && git push
cd ../qslab-track2-interactive && git pull origin develop && git push
cd ../qslab-track3-analytics && git pull origin develop && git push
cd ../qslab-track4-polish && git pull origin develop && git push
```

## Commit Message Convention

Use conventional commits for clarity:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types by Track

**Track 1 (Content)**
- `content`: New course/lesson content
- `assets`: Visual/audio assets
- `template`: Content templates

**Track 2 (Interactive)**
- `interact`: New interaction types
- `enhance`: Interaction improvements
- `cue`: Interactive cue updates

**Track 3 (Analytics)**
- `analytics`: Analytics features
- `metrics`: New metrics
- `dashboard`: Dashboard updates

**Track 4 (Polish)**
- `fix`: Bug fixes
- `perf`: Performance improvements
- `ui`: UI enhancements
- `a11y`: Accessibility improvements

### Examples
```bash
# Track 1
git commit -m "content(kafka): add share groups lesson with 5 episodes"

# Track 2
git commit -m "interact(drag): add multi-category support to drag_to_distribute"

# Track 3
git commit -m "analytics(dashboard): add learning effectiveness chart"

# Track 4
git commit -m "fix(audio): resolve playback sync issues on segment transition"
```

## Handling Conflicts

### Shared File Conflicts

When multiple tracks modify shared files:

1. **models.py** - Database schema changes
   ```bash
   # Coordinate in Monday sync before changing
   # Use migrations for schema changes
   ```

2. **app.py** - New endpoints
   ```bash
   # Add endpoints at the end of sections
   # Use clear section comments
   # Track 1: Course content endpoints
   # Track 2: Interaction endpoints
   # Track 3: Analytics endpoints
   ```

3. **script.js** - Core functionality
   ```bash
   # Use feature flags for new features
   if (FEATURES.NEW_INTERACTIONS) {
     // Track 2 code
   }
   ```

### Conflict Resolution Strategy

1. **Communication First**
   - Post in Slack: "Track 2 needs to modify app.py for new endpoints"
   - Wait for acknowledgment from other tracks

2. **Minimal Changes**
   - Make smallest possible change
   - Don't refactor while adding features

3. **Test Integration**
   ```bash
   # In your worktree, test against develop
   cd ../qslab-track2-interactive
   git fetch origin
   git merge origin/develop --no-commit --no-ff
   npm test
   python test_integration.py
   # If tests pass, complete the merge
   git commit
   ```

## Protection Rules

### Branch Protection (GitHub/GitLab)

1. **main**
   - Require PR reviews: 2
   - Require status checks
   - No force push
   - No deletion

2. **develop**
   - Require PR reviews: 1 (track lead)
   - Require status checks
   - No force push

3. **track-* branches**
   - Require PR reviews: 1 (team member)
   - Allow track lead to merge

## Git Hooks

### Pre-commit Hook
```bash
#!/bin/sh
# .git/hooks/pre-commit

# Run linting
npm run lint
python -m flake8 .

# Check for merge conflicts
if grep -rn "^<<<<<<< " .; then
  echo "Merge conflicts detected!"
  exit 1
fi
```

### Pre-push Hook
```bash
#!/bin/sh
# .git/hooks/pre-push

# Run tests
npm test
python -m pytest

# Check feature flags
if grep -r "FEATURES\." --include="*.js" | grep -v "FEATURES = {"; then
  echo "Feature flag usage detected - ensure flag is defined!"
fi
```

## Emergency Procedures

### Hotfix Process
```bash
# Create hotfix worktree from main
cd /path/to/qslab
git worktree add ../qslab-hotfix hotfix/critical-bug -b main

# Fix bug in hotfix worktree
cd ../qslab-hotfix
# Make fixes
git add .
git commit -m "hotfix: resolve critical auth bypass"
git push origin hotfix/critical-bug

# Create PR to main, then merge
# After merge, update all worktrees
cd ../qslab && git pull origin main && git merge main
cd ../qslab-track1-content && git fetch && git merge origin/develop
cd ../qslab-track2-interactive && git fetch && git merge origin/develop
# Continue for all tracks...

# Remove hotfix worktree
git worktree remove ../qslab-hotfix
```

### Rollback Procedure
```bash
# If release has issues, work in main repository
cd /path/to/qslab
git checkout main
git pull origin main
git revert -m 1 <merge-commit-hash>
git push origin main

# Tag as reverted
git tag -a v1.2.0-reverted -m "Reverted due to critical issues"

# Update all worktrees with reverted state
./scripts/update_all_worktrees.sh
```

## Best Practices

### DO's
- ✅ Pull latest before starting work
- ✅ Create feature branches from track branches
- ✅ Write clear commit messages
- ✅ Test locally before pushing
- ✅ Communicate in daily standups
- ✅ Keep PRs small and focused

### DON'Ts
- ❌ Don't commit directly to main/develop
- ❌ Don't merge other track branches
- ❌ Don't force push to shared branches
- ❌ Don't modify files outside your track's scope
- ❌ Don't merge without running tests
- ❌ Don't resolve conflicts without understanding them

## Track-Specific Guidelines

### Track 1 (Content)
- Commit course JSON files separately
- Use LFS for large media files
- Tag content milestones: `content-kafka-complete`

### Track 2 (Interactive)
- Feature flag all new interactions
- Include interaction demos in PRs
- Document interaction APIs

### Track 3 (Analytics)
- Keep analytics endpoints versioned
- Include data migration scripts
- Document metric calculations

### Track 4 (Polish)
- Include before/after screenshots
- Document performance improvements
- Reference issue numbers in commits

## Monitoring & Metrics

### Track Progress
```bash
# See commits by track
git log --oneline --graph track-1-content ^develop

# Count commits per track this week
git shortlog -sn --since="1 week ago" track-1-content
```

### Integration Health
```bash
# Check divergence from develop
git rev-list --count develop..track-1-content

# See files changed per track
git diff --name-only develop track-1-content
```

## Tools & Automation

### GitHub Actions / GitLab CI
```yaml
# .github/workflows/track-integration.yml
name: Track Integration Test

on:
  pull_request:
    branches: [develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run integration tests
        run: |
          npm install
          npm test
          python -m pytest
```

### Branch Cleanup Script
```bash
#!/bin/bash
# cleanup-merged-branches.sh

# Delete merged feature branches
git branch --merged | grep -E "track-[0-9]-" | xargs -n 1 git branch -d

# Delete remote tracking branches
git remote prune origin
```

## Summary

This Git workflow, based entirely on worktrees, ensures:
- **True parallel development** - Each track has its own directory
- **No context switching** - Never need to stash or switch branches
- **Clean isolation** - Changes in one track don't affect others
- **AI-friendly** - Perfect for running multiple Claude instances

See [CLAUDE_WORKTREE_WORKFLOW.md](CLAUDE_WORKTREE_WORKFLOW.md) for advanced patterns using Claude Code with git worktrees.

## Quick Reference

```bash
# Set up all worktrees
./setup_git_worktrees.sh

# Navigate to your track
cd ../qslab-track1-content

# Update all worktrees
./update_all_worktrees.sh

# See all worktrees
git worktree list

# Remove old worktrees
git worktree prune
```

With this worktree-based workflow, all 4 tracks can develop in parallel without ever interfering with each other.