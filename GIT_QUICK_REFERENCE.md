# Git Quick Reference for 4-Track Development (Worktree Based)

## 🌳 Initial Worktree Setup

### One-Time Setup
```bash
# Clone repository
git clone <repo-url> qslab
cd qslab

# Set up all worktrees
./setup_git_worktrees.sh

# Or manually:
git worktree add ../qslab-track1-content track-1-content
git worktree add ../qslab-track2-interactive track-2-interactive
git worktree add ../qslab-track3-analytics track-3-analytics
git worktree add ../qslab-track4-polish track-4-polish
```

### Your Working Directories
```
parent-directory/
├── qslab/                    # Main repo (for releases)
├── qslab-track1-content/     # Your Track 1 workspace
├── qslab-track2-interactive/ # Your Track 2 workspace
├── qslab-track3-analytics/   # Your Track 3 workspace
└── qslab-track4-polish/      # Your Track 4 workspace
```

## 🚀 Daily Commands

### Starting Work
```bash
# Navigate to your track worktree
cd ../qslab-track1-content

# Update your track branch
git pull origin track-1-content

# Create feature branch
git checkout -b track-1-content/add-quiz-module
```

### During Development
```bash
# Check status
git status

# Stage and commit
git add .
git commit -m "content(quiz): add multiple choice questions for lesson 3"

# Push to remote
git push -u origin track-1-content/add-quiz-module
```

### Creating Pull Request
```bash
# Push latest changes
git push

# Create PR via GitHub/GitLab UI
# Target: Your track branch (e.g., track-1-content)
# Title: [Track 1] Add quiz module for lesson 3
```

## 📋 Branch Naming Conventions

### Feature Branches
```
track-1-content/course-name
track-1-content/lesson-update
track-2-interactive/drag-enhance
track-2-interactive/new-simulation
track-3-analytics/dashboard-v2
track-3-analytics/metrics-api
track-4-polish/fix-audio-sync
track-4-polish/dark-mode
```

### Commit Messages by Track

**Track 1 (Content)**
```bash
git commit -m "content(python): add variables lesson with 10 segments"
git commit -m "assets(diagrams): create flow charts for algorithms course"
git commit -m "template(quiz): add new quiz template for checkpoints"
```

**Track 2 (Interactive)**
```bash
git commit -m "interact(drag): support multi-category sorting"
git commit -m "enhance(simulation): add real-time graph updates"
git commit -m "cue(hover): improve mobile touch support"
```

**Track 3 (Analytics)**
```bash
git commit -m "analytics(events): track interaction completion time"
git commit -m "metrics(api): add learning effectiveness endpoint"
git commit -m "dashboard(ui): create progress visualization component"
```

**Track 4 (Polish)**
```bash
git commit -m "fix(audio): resolve playback stuttering on Safari"
git commit -m "perf(images): implement progressive loading"
git commit -m "ui(nav): add keyboard shortcuts for navigation"
```

## 🔄 Weekly Integration

### Monday - Prepare Your Track PR
```bash
# Ensure your track is up to date
git checkout track-1-content
git pull origin track-1-content
git pull origin develop
git push origin track-1-content

# Create PR: track-1-content → develop
```

### Integration Order
1. ⚙️ **Track 4** (Polish) - Bug fixes first
2. 📚 **Track 1** (Content) - New content
3. 🎮 **Track 2** (Interactive) - New features  
4. 📊 **Track 3** (Analytics) - New tracking

## 🚨 Common Scenarios

### Sync with Latest Develop
```bash
# In your track worktree
cd ../qslab-track1-content
git fetch origin
git merge origin/develop
git push origin track-1-content
```

### Fix Merge Conflicts
```bash
# Pull latest develop
git pull origin develop

# Resolve conflicts in editor
# Look for <<<<<<< HEAD markers

# After resolving
git add .
git commit -m "merge: resolve conflicts with develop"
git push
```

### Switch Between Tracks
```bash
# Simply change directories!
cd ../qslab-track2-interactive

# Your work in track 1 remains untouched
# No need to stash or commit
```

### Emergency Hotfix
```bash
# Create hotfix worktree
cd /path/to/qslab
git worktree add ../qslab-hotfix main -b hotfix/critical-audio-fix

# Work in hotfix worktree
cd ../qslab-hotfix
# Fix issue
git add .
git commit -m "hotfix: prevent audio memory leak"
git push origin hotfix/critical-audio-fix

# Create PR to main
# After merge, remove hotfix worktree
git worktree remove ../qslab-hotfix
```

## 📁 File Ownership Quick Guide

| File | Primary Owner | Coordination Needed |
|------|--------------|-------------------|
| `/learning_content/*` | Track 1 | No |
| `interactive_cues.js` | Track 2 | No |
| Analytics endpoints | Track 3 | No |
| `styles.css` | Track 4 | No |
| `app.py` | Shared | Yes - Monday sync |
| `models.py` | Shared | Yes - Team consensus |
| `script.js` | Shared | Yes - Feature flags |

## 🏃 Shortcuts

### Check Your Branch
```bash
git branch --show-current
```

### See Track Divergence
```bash
git rev-list --count develop..track-1-content
```

### Quick Status
```bash
git status -s
```

### Recent Commits
```bash
git log --oneline -10
```

### Who Changed What
```bash
git blame <filename>
```

## 🛟 Help Commands

```bash
# See all worktrees
git worktree list

# See all branches
git branch -a

# Check remote URL
git remote -v

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard local changes
git checkout -- <filename>

# See merge conflicts
git diff --name-only --diff-filter=U

# Clean up old worktrees
git worktree prune
```

## 🎯 Golden Rules

1. **Never commit directly to main or develop**
2. **Always create feature branches from your track branch**
3. **Pull before you push**
4. **Write clear commit messages**
5. **Test before creating PR**
6. **Communicate in daily standups**
7. **Use feature flags for new features**

## 🔗 Useful Links

- [Full Git Workflow](./GIT_WORKFLOW.md)
- [Unified Implementation Plan](./UNIFIED_IMPLEMENTATION_PLAN.md)
- [Project Guidelines](./CLAUDE.md)