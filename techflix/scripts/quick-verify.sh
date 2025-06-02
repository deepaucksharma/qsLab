#!/bin/bash

# Quick verification of reorganization

echo "TechFlix Reorganization Quick Verification"
echo "=========================================="
echo ""

# Check directories
echo "Checking directories..."
[ -d "docs/guides" ] && echo "✓ docs/guides exists" || echo "✗ docs/guides missing"
[ -d "docs/architecture" ] && echo "✓ docs/architecture exists" || echo "✗ docs/architecture missing"
[ -d "docs/archives" ] && echo "✓ docs/archives exists" || echo "✗ docs/archives missing"
[ -d "config" ] && echo "✓ config exists" || echo "✗ config missing"
echo ""

# Check config files
echo "Checking config files..."
[ -f "config/vite.config.js" ] && echo "✓ vite.config.js in config/" || echo "✗ vite.config.js missing"
[ -f "config/vitest.config.js" ] && echo "✓ vitest.config.js in config/" || echo "✗ vitest.config.js missing"
[ -f "config/tailwind.config.js" ] && echo "✓ tailwind.config.js in config/" || echo "✗ tailwind.config.js missing"
echo ""

# Check for removed files
echo "Checking cleanup..."
[ ! -f "BUILD_GUIDE.md" ] && echo "✓ BUILD_GUIDE.md removed from root" || echo "✗ BUILD_GUIDE.md still at root"
[ ! -d ".parcel-cache" ] && echo "✓ .parcel-cache removed" || echo "✗ .parcel-cache still exists"
[ ! -d "techflix/techflix" ] && echo "✓ nested techflix removed" || echo "✗ nested techflix still exists"
echo ""

# Count files
echo "File counts..."
echo "- Root files: $(ls -1 | wc -l)"
echo "- Guide docs: $(find docs/guides -name "*.md" 2>/dev/null | wc -l)"
echo "- Architecture docs: $(find docs/architecture -name "*.md" 2>/dev/null | wc -l)"
echo "- Archive files: $(ls docs/archives/ 2>/dev/null | wc -l)"
echo ""

# Check package.json
echo "Checking package.json scripts..."
if grep -q "vite --config config/vite.config.js" package.json; then
    echo "✓ package.json scripts updated"
else
    echo "✗ package.json scripts need updating"
fi
echo ""

# Git status summary
if [ -d ".git" ]; then
    echo "Git status..."
    echo "- Untracked files: $(git status --porcelain | grep "^??" | wc -l)"
    echo "- Modified files: $(git status --porcelain | grep "^ M" | wc -l)"
    echo "- Deleted files: $(git status --porcelain | grep "^ D" | wc -l)"
fi