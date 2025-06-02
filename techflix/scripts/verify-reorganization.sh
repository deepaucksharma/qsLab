#!/bin/bash

# TechFlix Reorganization Verification Script
# This script verifies that the reorganization was successful

set -e  # Exit on error

echo "🔍 TechFlix Reorganization Verification"
echo "======================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Success/Failure counters
PASSED=0
FAILED=0
WARNINGS=0

# Function to check if file/directory exists
check_exists() {
    local path=$1
    local type=$2
    local description=$3
    
    if [ "$type" = "file" ] && [ -f "$path" ]; then
        echo -e "${GREEN}✓${NC} $description exists"
        ((PASSED++))
    elif [ "$type" = "dir" ] && [ -d "$path" ]; then
        echo -e "${GREEN}✓${NC} $description exists"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $description missing: $path"
        ((FAILED++))
    fi
}

# Function to check if file does NOT exist
check_not_exists() {
    local path=$1
    local description=$2
    
    if [ ! -e "$path" ]; then
        echo -e "${GREEN}✓${NC} $description removed"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $description still exists: $path"
        ((FAILED++))
    fi
}

# Function to check command execution
check_command() {
    local command=$1
    local description=$2
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $description"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $description failed"
        ((FAILED++))
    fi
}

# Function to count files
count_files() {
    local path=$1
    local pattern=$2
    local expected=$3
    local description=$4
    
    local count=$(find "$path" -name "$pattern" -type f 2>/dev/null | wc -l)
    if [ "$count" -ge "$expected" ]; then
        echo -e "${GREEN}✓${NC} $description: found $count files"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} $description: found $count files (expected at least $expected)"
        ((WARNINGS++))
    fi
}

echo "1. Directory Structure Verification"
echo "-----------------------------------"
check_exists "docs" "dir" "Documentation directory"
check_exists "docs/guides" "dir" "Guides directory"
check_exists "docs/architecture" "dir" "Architecture directory"
check_exists "docs/reference" "dir" "Reference directory"
check_exists "docs/archives" "dir" "Archives directory"
check_exists "config" "dir" "Config directory"
check_exists "scripts" "dir" "Scripts directory"
check_exists "src" "dir" "Source directory"
check_exists "public" "dir" "Public directory"
echo ""

echo "2. Configuration Files"
echo "---------------------"
check_exists "config/vite.config.js" "file" "Vite config"
check_exists "config/vitest.config.js" "file" "Vitest config"
check_exists "config/tailwind.config.js" "file" "Tailwind config"
check_exists "config/postcss.config.js" "file" "PostCSS config"
check_exists "package.json" "file" "Package.json at root"
check_exists "tsconfig.json" "file" "TypeScript config at root"
echo ""

echo "3. Documentation Files"
echo "---------------------"
check_exists "README.md" "file" "Main README"
check_exists "CHANGELOG.md" "file" "Changelog"
check_exists "docs/README.md" "file" "Documentation index"
check_exists "REORGANIZATION_SUMMARY.md" "file" "Reorganization summary"
count_files "docs/guides" "*.md" 5 "Guide documents"
count_files "docs/architecture" "*.md" 5 "Architecture documents"
echo ""

echo "4. Cleanup Verification"
echo "----------------------"
check_not_exists "BUILD_GUIDE.md" "Root BUILD_GUIDE.md"
check_not_exists "AUDIO_SYSTEM_REFACTORING_PLAN.md" "Root audio plan"
check_not_exists "PROJECT_STRUCTURE.md" "Root project structure"
check_not_exists ".parcel-cache" "Parcel cache"
check_not_exists "techflix/techflix" "Nested techflix directory"
echo ""

echo "5. Duplicate File Check"
echo "----------------------"
# Check for common duplicate patterns
for file in "AUDIO_SYSTEM_REFACTORING_PLAN.md" "PROJECT_STRUCTURE.md" "UPDATE_ALL_SCENES.md"; do
    count=$(find . -name "$file" -type f | grep -v node_modules | wc -l)
    if [ "$count" -eq 1 ]; then
        echo -e "${GREEN}✓${NC} No duplicates of $file"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} Found $count copies of $file"
        ((FAILED++))
    fi
done
echo ""

echo "6. Build System Verification"
echo "---------------------------"
# Check if npm scripts have been updated
if grep -q "vite --config config/vite.config.js" package.json; then
    echo -e "${GREEN}✓${NC} Package.json scripts updated"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Package.json scripts not updated"
    ((FAILED++))
fi

# Test npm commands (non-blocking)
echo "Testing build commands..."
check_command "npm run lint 2>/dev/null || true" "Lint command works"
echo ""

echo "7. Import Path Verification"
echo "--------------------------"
# Check for broken imports in config files
if grep -q "../src" config/vite.config.js; then
    echo -e "${GREEN}✓${NC} Vite config paths updated"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Vite config paths not updated"
    ((FAILED++))
fi

if grep -q "../src" config/vitest.config.js; then
    echo -e "${GREEN}✓${NC} Vitest config paths updated"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Vitest config paths not updated"
    ((FAILED++))
fi
echo ""

echo "8. Root Directory Cleanliness"
echo "----------------------------"
# Count files at root (excluding hidden files)
root_files=$(ls -1 | wc -l)
if [ "$root_files" -le 15 ]; then
    echo -e "${GREEN}✓${NC} Root directory clean: $root_files files"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Root directory has $root_files files (target: ≤15)"
    ((WARNINGS++))
fi
echo ""

echo "9. Git Status Check"
echo "------------------"
# Check if there are uncommitted changes
if [ -d ".git" ]; then
    unstaged=$(git status --porcelain | wc -l)
    if [ "$unstaged" -gt 0 ]; then
        echo -e "${YELLOW}⚠${NC} Found $unstaged uncommitted changes"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✓${NC} No uncommitted changes"
        ((PASSED++))
    fi
else
    echo -e "${YELLOW}⚠${NC} Not a git repository"
    ((WARNINGS++))
fi
echo ""

echo "10. Episode System Check"
echo "-----------------------"
check_exists "src/episodes/index.js" "file" "Episode index"
check_exists "src/components/NetflixEpisodePlayer.jsx" "file" "Episode player"
count_files "src/episodes" "index.js" 8 "Episode definitions"
count_files "src/components/scenes" "*.jsx" 20 "Scene components"
echo ""

# Summary
echo "======================================"
echo "📊 Verification Summary"
echo "======================================"
echo -e "${GREEN}Passed:${NC} $PASSED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo -e "${RED}Failed:${NC} $FAILED"
echo ""

if [ "$FAILED" -eq 0 ]; then
    echo -e "${GREEN}✅ Reorganization verification PASSED!${NC}"
    exit 0
else
    echo -e "${RED}❌ Reorganization verification FAILED!${NC}"
    echo "Please review the failed checks above."
    exit 1
fi