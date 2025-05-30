#!/bin/bash
# check-integrity.sh - Verify all links and references in the repository

echo "🔍 Repository Integrity Check"
echo "============================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
TOTAL_LINKS=0
BROKEN_LINKS=0
WARNINGS=0

# Function to check if file exists
check_file() {
    local file=$1
    local source=$2
    
    if [[ $file == http* ]]; then
        # External link - skip for now
        return 0
    fi
    
    # Convert relative path to absolute from source file location
    local dir=$(dirname "$source")
    local target_path="$dir/$file"
    
    # Normalize path
    target_path=$(cd "$dir" && realpath --relative-to=. "$file" 2>/dev/null || echo "$file")
    
    if [ -f "$target_path" ] || [ -d "$target_path" ]; then
        echo -e "${GREEN}✓${NC} $file"
        return 0
    else
        echo -e "${RED}✗${NC} $file (from $source)"
        ((BROKEN_LINKS++))
        return 1
    fi
}

# Function to extract links from markdown file
check_markdown_file() {
    local file=$1
    echo -e "\n${YELLOW}Checking: $file${NC}"
    
    # Extract markdown links [text](link)
    grep -oE '\[([^]]+)\]\(([^)]+)\)' "$file" | while read -r line; do
        link=$(echo "$line" | sed -E 's/\[([^]]+)\]\(([^)]+)\)/\2/')
        ((TOTAL_LINKS++))
        check_file "$link" "$file"
    done
    
    # Extract reference-style links [text][ref]
    # TODO: Add support for reference-style links if needed
}

# Find all markdown files
echo "Finding all markdown files..."
find . -name "*.md" -type f | while read -r md_file; do
    check_markdown_file "$md_file"
done

# Summary
echo -e "\n${YELLOW}=== Summary ===${NC}"
echo "Total links checked: $TOTAL_LINKS"
echo -e "Broken links: ${RED}$BROKEN_LINKS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"

if [ $BROKEN_LINKS -eq 0 ]; then
    echo -e "\n${GREEN}✓ All links are valid!${NC}"
    exit 0
else
    echo -e "\n${RED}✗ Found $BROKEN_LINKS broken links${NC}"
    exit 1
fi
