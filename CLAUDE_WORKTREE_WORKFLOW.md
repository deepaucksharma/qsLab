# Claude Code + Git Worktree Workflow

## Overview

This document explains how to use Git worktree with Claude Code for maximum productivity in our 4-track parallel development system. This pattern allows you to have Claude working on one track while you review or work on another.

## Why This Pattern?

Based on Anthropic's best practices and community patterns:
- **No Idle Time**: While Claude generates code in one worktree, you can work in another
- **Clean Isolation**: Each Claude instance works in its own directory without conflicts
- **Parallel AI Assistance**: Run multiple Claude instances for different tracks simultaneously
- **No Context Switching**: Each track has its own persistent workspace

## Setting Up Worktrees for Claude Code

### Initial Setup

```bash
# From your main qslab directory
cd /path/to/qslab

# Create worktrees for each track
git worktree add ../qslab-track1-content track-1-content
git worktree add ../qslab-track2-interactive track-2-interactive
git worktree add ../qslab-track3-analytics track-3-analytics
git worktree add ../qslab-track4-polish track-4-polish

# Your directory structure:
# qslab/                    (main repository)
# qslab-track1-content/     (Track 1 worktree)
# qslab-track2-interactive/ (Track 2 worktree)
# qslab-track3-analytics/   (Track 3 worktree)
# qslab-track4-polish/      (Track 4 worktree)
```

### Launching Claude in Each Worktree

```bash
# Terminal 1: Content Development
cd ../qslab-track1-content
claude code
# "Create a Python fundamentals course with 5 lessons"

# Terminal 2: Interactive Features (while Claude works on content)
cd ../qslab-track2-interactive
claude code
# "Enhance the drag_to_distribute interaction with multi-category support"

# Terminal 3: Analytics (parallel work)
cd ../qslab-track3-analytics
claude code
# "Build a learning effectiveness dashboard"

# Terminal 4: Polish (concurrent fixes)
cd ../qslab-track4-polish
claude code
# "Fix all audio playback issues and improve performance"
```

## Workflow Patterns

### Pattern 1: Feature Development with AI

```bash
# Create feature branch in worktree
cd ../qslab-track1-content
git checkout -b track-1-content/kafka-course

# Start Claude for this feature
claude code
# "Create a comprehensive Kafka monitoring course with share groups"

# While Claude works, switch to another terminal
cd ../qslab-track2-interactive
# Review or work on interactive features
```

### Pattern 2: Code Review While AI Generates

```bash
# Terminal 1: Let Claude generate new content
cd ../qslab-track1-content
claude code
# Claude is generating course content...

# Terminal 2: Review PR from Track 2
cd ../qslab-track2-interactive
git pull origin track-2-interactive
git checkout track-2-interactive/pr-branch
# Review code while Claude works
```

### Pattern 3: Parallel Bug Fixes

```bash
# Have Claude fix bugs in Track 4
cd ../qslab-track4-polish
claude code
# "Find and fix all performance issues in segment rendering"

# Meanwhile, manually fix urgent bug in Track 1
cd ../qslab-track1-content
# Fix critical content issue
```

## Best Practices

### 1. One Claude Per Worktree
- Each worktree should have at most one Claude instance
- This prevents conflicts and confusion
- Claude can understand the full context of that track

### 2. Clear Task Delegation
```bash
# Be specific about what Claude should work on
claude code
# Good: "Create a complete Python basics lesson with 10 segments covering variables, data types, and operators"
# Bad: "Make some content"
```

### 3. Sync Regularly
```bash
# Before starting Claude in a worktree
cd ../qslab-track1-content
git pull origin track-1-content
```

### 4. Commit Claude's Work Promptly
```bash
# After Claude completes a task
git add .
git commit -m "content(python): add variables lesson via Claude"
git push origin track-1-content/feature-branch
```

## Advanced Patterns

### Automated Worktree Setup Script

Create `setup_claude_worktrees.sh`:
```bash
#!/bin/bash

# Function to create worktree and start Claude
create_claude_worktree() {
    local track_name=$1
    local track_branch=$2
    local task_description=$3
    
    echo "Setting up worktree for $track_name..."
    git worktree add "../qslab-$track_name" "$track_branch"
    
    echo "Task for Claude: $task_description" > "../qslab-$track_name/CLAUDE_TASK.md"
    
    echo "Worktree ready at ../qslab-$track_name"
    echo "Run 'cd ../qslab-$track_name && claude code' to start"
}

# Set up all tracks
create_claude_worktree "track1-content" "track-1-content" "Create course content"
create_claude_worktree "track2-interactive" "track-2-interactive" "Enhance interactions"
create_claude_worktree "track3-analytics" "track-3-analytics" "Build analytics"
create_claude_worktree "track4-polish" "track-4-polish" "Fix bugs and polish"
```

### Task Queue Pattern

Create `CLAUDE_TASKS.md` in each worktree:
```markdown
# Claude Tasks for Track 1 (Content)

## Current Task
- [ ] Create Python basics course with 5 lessons

## Queued Tasks
- [ ] Add JavaScript fundamentals course
- [ ] Create data structures course
- [ ] Add quizzes for all Python lessons

## Completed Tasks
- [x] Create Kafka monitoring course
- [x] Add visual assets for lesson 1
```

### Parallel Testing

```bash
# Run app in main directory
cd qslab
python app.py  # Port 5000

# Test Track 1 changes
cd ../qslab-track1-content
python app.py  # Port 5001

# Test Track 2 changes
cd ../qslab-track2-interactive
python app.py  # Port 5002

# All running simultaneously!
```

## Troubleshooting

### Issue: Worktree Branch Already Checked Out
```bash
# Remove stale worktree
git worktree remove ../qslab-track1-content
git worktree prune

# Recreate
git worktree add ../qslab-track1-content track-1-content
```

### Issue: Claude Seems Confused
- Ensure each Claude instance is in a separate terminal
- Check that you're in the correct worktree directory
- Provide clear, track-specific instructions

### Issue: Merge Conflicts After Claude's Work
```bash
# In worktree
git pull origin track-1-content
# Resolve conflicts
git add .
git commit -m "merge: resolve conflicts with upstream"
```

## Productivity Tips

### 1. Morning Routine
```bash
# Start all Claude instances with daily tasks
for track in track1-content track2-interactive track3-analytics track4-polish; do
    cd "../qslab-$track"
    git pull
    # Review CLAUDE_TASKS.md
    # Start Claude with specific task
done
```

### 2. Context Switching
- Use terminal tabs/tmux for each worktree
- Name terminals by track
- Keep Claude conversations focused on track goals

### 3. Integration Workflow
```bash
# After Claude completes work in all tracks
cd qslab  # Main directory
git pull origin develop

# Check each worktree's changes
git worktree list

# Create PRs from each track to develop
```

## Metrics and Monitoring

Track productivity gains:
```bash
# See commits across all worktrees
for worktree in $(git worktree list --porcelain | grep "worktree" | cut -d' ' -f2); do
    echo "=== $worktree ==="
    cd "$worktree"
    git log --oneline --since="1 day ago"
done
```

## Conclusion

The Claude + worktree pattern enables true parallel development where:
- AI and human developers work simultaneously
- No waiting or context switching
- Each track progresses independently
- Integration remains clean and controlled

This approach can significantly accelerate development, especially with our 4-track system where different aspects of the platform can evolve in parallel.