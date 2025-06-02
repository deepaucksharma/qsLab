#!/bin/bash
# TechFlix Testing - Bug Report Naming Standardization Script
# Date: 2025-01-06
# Purpose: Rename old bug report format to new standard

cd /home/deepak/src/qsLab/testing/manual-testing/bug-reports

echo "Starting bug report naming standardization..."

# Rename old format bug reports to new format
# Format: BUGXXX_Description.md -> BUG-XXX-Description.md

# Check if files exist before renaming
if [ -f "BUG001_HomePage_Not_Loading.md" ]; then
    mv "BUG001_HomePage_Not_Loading.md" "BUG-013-HomePage-Not-Loading.md"
    echo "Renamed: BUG001 -> BUG-013"
fi

if [ -f "BUG002_Dual_VoiceOver_Systems_Conflict.md" ]; then
    mv "BUG002_Dual_VoiceOver_Systems_Conflict.md" "BUG-014-Dual-VoiceOver-Systems-Conflict.md"
    echo "Renamed: BUG002 -> BUG-014"
fi

if [ -f "BUG003_Scene_Audio_Cleanup_Issue.md" ]; then
    mv "BUG003_Scene_Audio_Cleanup_Issue.md" "BUG-015-Scene-Audio-Cleanup-Issue.md"
    echo "Renamed: BUG003 -> BUG-015"
fi

if [ -f "BUG007_Missing_Quiz_Component.md" ]; then
    mv "BUG007_Missing_Quiz_Component.md" "BUG-016-Missing-Quiz-Component.md"
    echo "Renamed: BUG007 -> BUG-016"
fi

if [ -f "VIS-BUG002_Text_Overflow_Scenes.md" ]; then
    mv "VIS-BUG002_Text_Overflow_Scenes.md" "VIS-BUG-002-Text-Overflow-Scenes.md"
    echo "Renamed: VIS-BUG002 -> VIS-BUG-002"
fi

if [ -f "VIS-BUG003_Mobile_Navigation_Missing.md" ]; then
    mv "VIS-BUG003_Mobile_Navigation_Missing.md" "VIS-BUG-003-Mobile-Navigation-Missing.md"
    echo "Renamed: VIS-BUG003 -> VIS-BUG-003"
fi

# Archive the summary file
if [ -f "BUGS_FIXED_SUMMARY.md" ]; then
    mkdir -p ../../archive/legacy-reports
    mv "BUGS_FIXED_SUMMARY.md" "../../archive/legacy-reports/"
    echo "Archived: BUGS_FIXED_SUMMARY.md"
fi

echo "Bug report naming standardization complete!"
echo ""
echo "Summary of changes:"
echo "- Old format (BUGXXX_) renamed to new format (BUG-XXX-)"
echo "- Reassigned new sequential IDs to avoid conflicts"
echo "- Visual bugs standardized to VIS-BUG-XXX format"
echo "- Archived redundant summary file"
echo ""
echo "Next available bug IDs:"
echo "- Standard bugs: BUG-017"
echo "- Visual bugs: VIS-BUG-004"