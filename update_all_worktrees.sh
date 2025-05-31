#!/bin/bash
echo "🔄 Updating all worktrees..."

# Array of worktrees
worktrees=("track1-content" "track2-interactive" "track3-analytics" "track4-polish")

for track in "${worktrees[@]}"; do
    worktree_dir="../qslab-${track}"
    if [ -d "$worktree_dir" ]; then
        echo "📍 Updating $track..."
        cd "$worktree_dir"
        git pull origin $(git branch --show-current)
        cd - > /dev/null
    fi
done

echo "✅ All worktrees updated!"
