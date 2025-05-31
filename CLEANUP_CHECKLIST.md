# Pre-Cleanup Checklist

Before running the cleanup script, ensure:

## 1. Backup
- [ ] Create a backup of the entire project directory
- [ ] Ensure the SQLite database is backed up
- [ ] Save any work in progress

## 2. Dependencies
- [ ] Note any custom changes in old files that need to be preserved
- [ ] Check if any external scripts reference the old filenames
- [ ] Verify requirements.txt is up to date

## 3. Current State
- [ ] The application runs with current v2 files
- [ ] No critical bugs that need old files for reference
- [ ] All team members are aware of the cleanup

## 4. Files to Preserve
Review these files before archiving:
- [ ] `app.py` - Check for any custom routes not in v2
- [ ] `models.py` - Check for any models not in v2
- [ ] Test scripts - Determine if any are still useful

## 5. Post-Cleanup Tasks
After cleanup, you'll need to:
- [ ] Update any deployment scripts
- [ ] Update CI/CD configurations
- [ ] Update documentation that references old filenames
- [ ] Update .gitignore if needed
- [ ] Test all major features

## Running the Cleanup

When ready:
```bash
python cleanup_codebase.py
```

Follow the prompts and review the cleanup report.

## Emergency Rollback

If something goes wrong:
1. The archive directory contains all original files
2. Copy them back to restore the original state
3. Review what went wrong before attempting again