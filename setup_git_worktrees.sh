#!/bin/bash

# Git Worktree Setup Script for Neural Learn
# This script sets up the 4-track parallel development using worktrees

echo "🚀 Setting up Git worktrees for 4-track parallel development..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not in a git repository!${NC}"
    echo "Please run this from the qslab directory"
    exit 1
fi

# Get repository root
REPO_ROOT=$(git rev-parse --show-toplevel)
REPO_NAME=$(basename "$REPO_ROOT")

echo -e "${BLUE}Repository: ${REPO_ROOT}${NC}"

# Function to create worktree
create_worktree() {
    local track_name=$1
    local branch_name=$2
    local worktree_path="../${REPO_NAME}-${track_name}"
    
    echo -e "\n${YELLOW}Setting up ${track_name}...${NC}"
    
    # Check if branch exists on remote
    if ! git ls-remote --heads origin ${branch_name} | grep ${branch_name} >/dev/null; then
        echo -e "${BLUE}Creating branch ${branch_name} on remote...${NC}"
        git push origin HEAD:${branch_name}
    fi
    
    # Check if worktree already exists
    if git worktree list | grep -q "${worktree_path}"; then
        echo -e "${GREEN}✓ Worktree ${worktree_path} already exists${NC}"
    else
        # Create worktree
        git worktree add "${worktree_path}" "${branch_name}"
        echo -e "${GREEN}✓ Created worktree at ${worktree_path}${NC}"
    fi
    
    # Create TRACK_INFO file
    cat > "${worktree_path}/TRACK_INFO.md" << EOF
# Track: ${track_name}
Branch: ${branch_name}
Purpose: See UNIFIED_IMPLEMENTATION_PLAN.md for details

## Quick Commands
\`\`\`bash
# Update from origin
git pull origin ${branch_name}

# Create feature branch
git checkout -b ${branch_name}/feature-name

# Push changes
git push origin ${branch_name}
\`\`\`
EOF
    echo -e "${GREEN}✓ Created TRACK_INFO.md${NC}"
}

# Step 1: Ensure we have the latest code
echo -e "\n${BLUE}Step 1: Updating repository...${NC}"
git fetch origin

# Step 2: Create develop branch if needed
echo -e "\n${BLUE}Step 2: Setting up develop branch...${NC}"
if ! git show-ref --verify --quiet refs/heads/develop; then
    git checkout -b develop origin/main || git checkout -b develop
    git push -u origin develop
    echo -e "${GREEN}✓ Created develop branch${NC}"
else
    echo -e "${GREEN}✓ Develop branch exists${NC}"
fi

# Step 3: Create worktrees for each track
echo -e "\n${BLUE}Step 3: Creating worktrees for all tracks...${NC}"

create_worktree "track1-content" "track-1-content"
create_worktree "track2-interactive" "track-2-interactive"
create_worktree "track3-analytics" "track-3-analytics"
create_worktree "track4-polish" "track-4-polish"

# Step 4: Create feature flags if needed
echo -e "\n${BLUE}Step 4: Setting up feature flags...${NC}"
if [ ! -f "feature_flags.js" ]; then
    cat > feature_flags.js << 'EOF'
// Feature flags for track development
const FEATURES = {
  // Track 1: Content Production
  NEW_COURSES: true,
  CONTENT_TEMPLATES: false,
  
  // Track 2: Interactive Learning
  NEW_INTERACTIONS: false,
  ENHANCED_DRAG_DROP: false,
  CODE_SANDBOX: false,
  
  // Track 3: Learning Analytics
  ANALYTICS_DASHBOARD: false,
  LEARNING_INSIGHTS: false,
  RECOMMENDATION_ENGINE: false,
  
  // Track 4: Platform Polish
  DARK_MODE: false,
  PERFORMANCE_MODE: false,
  KEYBOARD_NAV: false
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FEATURES;
}
EOF
    echo -e "${GREEN}✓ Created feature_flags.js${NC}"
else
    echo -e "${GREEN}✓ feature_flags.js already exists${NC}"
fi

# Step 5: Create convenience scripts
echo -e "\n${BLUE}Step 5: Creating convenience scripts...${NC}"

# Update all worktrees script
cat > update_all_worktrees.sh << 'EOF'
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
EOF
chmod +x update_all_worktrees.sh
echo -e "${GREEN}✓ Created update_all_worktrees.sh${NC}"

# Claude launcher script
cat > launch_claude_all_tracks.sh << 'EOF'
#!/bin/bash
echo "🤖 Instructions for launching Claude in all tracks:"
echo ""
echo "Open 4 terminal tabs/windows and run:"
echo ""
echo "Tab 1: cd ../qslab-track1-content && claude code"
echo "Tab 2: cd ../qslab-track2-interactive && claude code"
echo "Tab 3: cd ../qslab-track3-analytics && claude code"
echo "Tab 4: cd ../qslab-track4-polish && claude code"
echo ""
echo "Give each Claude instance a specific task from UNIFIED_IMPLEMENTATION_PLAN.md"
EOF
chmod +x launch_claude_all_tracks.sh
echo -e "${GREEN}✓ Created launch_claude_all_tracks.sh${NC}"

# Step 6: Summary
echo -e "\n${GREEN}✅ Worktree setup complete!${NC}"
echo -e "\n${BLUE}Directory Structure:${NC}"
echo "📁 $(dirname "$REPO_ROOT")/"
echo "  ├── ${REPO_NAME}/                    (main repository)"
echo "  ├── ${REPO_NAME}-track1-content/     (Track 1: Content Production)"
echo "  ├── ${REPO_NAME}-track2-interactive/ (Track 2: Interactive Learning)"
echo "  ├── ${REPO_NAME}-track3-analytics/   (Track 3: Learning Analytics)"
echo "  └── ${REPO_NAME}-track4-polish/      (Track 4: Platform Polish)"

echo -e "\n${BLUE}Quick Start:${NC}"
echo "1. Navigate to your track:"
echo "   cd ../${REPO_NAME}-track1-content     # For content team"
echo "   cd ../${REPO_NAME}-track2-interactive # For interactive team"
echo "   cd ../${REPO_NAME}-track3-analytics   # For analytics team"
echo "   cd ../${REPO_NAME}-track4-polish     # For polish team"
echo ""
echo "2. Start working:"
echo "   git pull origin track-X-name"
echo "   git checkout -b track-X-name/feature"
echo ""
echo "3. Use Claude Code:"
echo "   claude code"
echo ""
echo "4. Update all worktrees:"
echo "   ./update_all_worktrees.sh"

echo -e "\n${YELLOW}📖 See CLAUDE_WORKTREE_WORKFLOW.md for detailed workflow instructions${NC}"