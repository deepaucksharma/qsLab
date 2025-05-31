#!/usr/bin/env python3
"""
Cleanup script for Neural Learn codebase
Safely archives old files and renames v2 files
"""

import os
import shutil
from datetime import datetime
import json

# Define files to be handled
FILES_TO_ARCHIVE = [
    # Old Python app files
    'app.py',
    'app_audio_gen.py',
    'app_simple_audio.py',
    'app_tts_auto.py',
    'app_xtts_optimized.py',
    'models.py',
    
    # Old frontend files
    'index.html',
    'script.js',
    'styles.css',
    
    # Old documentation
    'README.md',
    'CLAUDE.md',  # Will be replaced by CLAUDE_CLEAN.md
    'IMPLEMENTATION_PLAN.md',
    'DETAILED_IMPLEMENTATION_PLAN.md',
    'IMPLEMENTATION_PLAN_V2.md',
    'IMPLEMENTATION_PLAN_ENHANCED.md',
    'CONTENT_IMPLEMENTATION_PLAN.md',
    
    # Test/demo scripts that might be obsolete
    'test_integration.py',
    'demo_adaptive_learning.py',
    'generate_all_audio.py',
    
    # Migration script (keep for reference)
    'migrate_to_v2.py'
]

FILES_TO_RENAME = {
    # Core application files
    'app_v2.py': 'app.py',
    'models_v2.py': 'models.py',
    'index_v2.html': 'index.html',
    'script_v2.js': 'script.js',
    'styles_v2.css': 'styles.css',
    'run_v2.py': 'run.py',
    'README_V2.md': 'README.md',
    'CLAUDE_CLEAN.md': 'CLAUDE.md'
}

# Files that need import updates after renaming
FILES_TO_UPDATE_IMPORTS = [
    'app.py',  # Will be renamed from app_v2.py
    'run.py',  # Will be renamed from run_v2.py
    'adaptive_learning.py',
    'CLAUDE.md',
    'index.html',  # Will be renamed from index_v2.html
    'migrate_to_v2.py'  # If we're keeping it in archive
]

def create_archive_directory():
    """Create archive directory with timestamp"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    archive_dir = f'archive_{timestamp}'
    os.makedirs(archive_dir, exist_ok=True)
    return archive_dir

def archive_files(archive_dir):
    """Archive old files"""
    archived = []
    not_found = []
    
    for file_path in FILES_TO_ARCHIVE:
        if os.path.exists(file_path):
            dest_path = os.path.join(archive_dir, file_path)
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            shutil.move(file_path, dest_path)
            archived.append(file_path)
            print(f"✓ Archived: {file_path}")
        else:
            not_found.append(file_path)
    
    return archived, not_found

def rename_v2_files():
    """Rename v2 files to remove version suffix"""
    renamed = []
    not_found = []
    
    for old_name, new_name in FILES_TO_RENAME.items():
        if os.path.exists(old_name):
            # Check if target exists
            if os.path.exists(new_name):
                print(f"⚠️  Warning: {new_name} already exists, skipping rename of {old_name}")
                continue
            
            os.rename(old_name, new_name)
            renamed.append((old_name, new_name))
            print(f"✓ Renamed: {old_name} → {new_name}")
        else:
            not_found.append(old_name)
    
    return renamed, not_found

def update_imports():
    """Update imports in Python files"""
    replacements = [
        ('from models_v2 import', 'from models import'),
        ('import models_v2', 'import models'),
        ('from app_v2 import', 'from app import'),
        ('import app_v2', 'import app'),
        ('app_v2.py', 'app.py'),
        ('models_v2.py', 'models.py'),
        ('index_v2.html', 'index.html'),
        ('script_v2.js', 'script.js'),
        ('styles_v2.css', 'styles.css'),
        ('run_v2.py', 'run.py')
    ]
    
    updated_files = []
    
    for file_path in FILES_TO_UPDATE_IMPORTS:
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                
                original_content = content
                for old, new in replacements:
                    content = content.replace(old, new)
                
                if content != original_content:
                    with open(file_path, 'w') as f:
                        f.write(content)
                    updated_files.append(file_path)
                    print(f"✓ Updated imports in: {file_path}")
            except Exception as e:
                print(f"✗ Error updating {file_path}: {e}")
    
    return updated_files

def clean_empty_directories():
    """Remove empty directories"""
    removed = []
    for root, dirs, files in os.walk('.', topdown=False):
        for dir_name in dirs:
            dir_path = os.path.join(root, dir_name)
            try:
                if not os.listdir(dir_path) and 'archive_' not in dir_path:
                    os.rmdir(dir_path)
                    removed.append(dir_path)
                    print(f"✓ Removed empty directory: {dir_path}")
            except:
                pass
    return removed

def create_cleanup_report(archive_dir, archived, renamed, updated, removed_dirs):
    """Create a cleanup report"""
    report = {
        'timestamp': datetime.now().isoformat(),
        'archive_directory': archive_dir,
        'files_archived': archived,
        'files_renamed': [{'from': old, 'to': new} for old, new in renamed],
        'files_updated': updated,
        'directories_removed': removed_dirs,
        'summary': {
            'total_archived': len(archived),
            'total_renamed': len(renamed),
            'total_updated': len(updated),
            'directories_removed': len(removed_dirs)
        }
    }
    
    report_path = os.path.join(archive_dir, 'cleanup_report.json')
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n✓ Cleanup report saved to: {report_path}")
    return report

def main():
    """Main cleanup process"""
    print("=== Neural Learn Codebase Cleanup ===\n")
    
    # Confirm before proceeding
    response = input("This will archive old files and rename v2 files. Continue? (yes/no): ")
    if response.lower() != 'yes':
        print("Cleanup cancelled.")
        return
    
    print("\n1. Creating archive directory...")
    archive_dir = create_archive_directory()
    print(f"   Archive directory: {archive_dir}")
    
    print("\n2. Archiving old files...")
    archived, not_found = archive_files(archive_dir)
    if not_found:
        print(f"   Files not found (already removed?): {len(not_found)}")
    
    print("\n3. Renaming v2 files...")
    renamed, rename_not_found = rename_v2_files()
    if rename_not_found:
        print(f"   Files not found for renaming: {len(rename_not_found)}")
    
    print("\n4. Updating imports...")
    updated = update_imports()
    
    print("\n5. Cleaning empty directories...")
    removed_dirs = clean_empty_directories()
    
    print("\n6. Creating cleanup report...")
    report = create_cleanup_report(archive_dir, archived, renamed, updated, removed_dirs)
    
    # Summary
    print("\n=== Cleanup Summary ===")
    print(f"Files archived: {report['summary']['total_archived']}")
    print(f"Files renamed: {report['summary']['total_renamed']}")
    print(f"Files updated: {report['summary']['total_updated']}")
    print(f"Directories removed: {report['summary']['directories_removed']}")
    
    print("\n✅ Cleanup complete!")
    print(f"   Old files are safely archived in: {archive_dir}")
    print("\nNext steps:")
    print("1. Test the application with: python app.py")
    print("2. Update any documentation that references old filenames")
    print("3. Commit the cleaned up codebase")
    print("4. You can safely delete the archive directory after verifying everything works")

if __name__ == "__main__":
    main()