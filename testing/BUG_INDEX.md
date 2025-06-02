# TechFlix Bug Index
**Last Updated:** 2025-01-06  
**Purpose:** Master list of all bugs with consistent IDs

## 🐛 Bug ID Reference

### Active Bugs (Open)
| Bug ID | Title | Severity | Status | Location |
|--------|-------|----------|--------|----------|
| BUG-001 | Node Version Compatibility | P2 | Open | `bug-reports/BUG-001-Node-Version-Compatibility.md` |
| REG-001 | Mobile menu lacks escape key | P3 | Open | Tracked in regression report |
| REG-002 | Minor FPS drop on low-end mobile | P3 | Open | Tracked in regression report |
| REG-003 | TechFlixButton not fully adopted | P3 | Open | Tracked in regression report |
| REG-004 | Search results missing episode numbers | P3 | Open | Tracked in regression report |

### Fixed Bugs (Closed/Verified)
| Bug ID | Title | Severity | Fixed Date | Location |
|--------|-------|----------|------------|----------|
| BUG-013 | HomePage Not Loading | P0 | 2025-01-06 | `bug-reports/BUG-013-HomePage-Not-Loading.md` |
| BUG-014 | Dual VoiceOver Systems Conflict | P1 | 2025-01-06 | `bug-reports/BUG-014-Dual-VoiceOver-Systems-Conflict.md` |
| BUG-015 | Scene Audio Cleanup Issue | P1 | 2025-01-06 | `bug-reports/BUG-015-Scene-Audio-Cleanup-Issue.md` |
| BUG-016 | Missing Quiz Component | P0 | 2025-01-06 | `bug-reports/BUG-016-Missing-Quiz-Component.md` |
| VIS-BUG-002 | Text Overflow in Scenes | P1 | 2025-01-06 | `bug-reports/VIS-BUG-002-Text-Overflow-Scenes.md` |
| VIS-BUG-003 | Mobile Navigation Missing | P0 | 2025-01-06 | `bug-reports/VIS-BUG-003-Mobile-Navigation-Missing.md` |
| VIS-BUG-004 | Missing Focus States | P1 | 2025-01-06 | Fixed globally via accessibility.css |
| BUG-002 | Critical Compilation Errors | P0 | Historical | `bug-reports/BUG-002-CRITICAL-COMPILATION-ERRORS.md` |
| BUG-003 | Performance Issue EnhancedEpisodes | P2 | Historical | `bug-reports/BUG-003-Performance-Issue-EnhancedEpisodes.md` |
| BUG-004 | Potential Null Reference | P2 | Historical | `bug-reports/BUG-004-Potential-Null-Reference.md` |
| BUG-005 | Unused Import | P3 | Historical | `bug-reports/BUG-005-Unused-Import.md` |
| BUG-006 | Debug Panel ZIndex | P3 | Historical | `bug-reports/BUG-006-Debug-Panel-ZIndex.md` |
| BUG-007 | Non-Functional Search | P1 | 2025-01-06 | `bug-reports/BUG-007-Non-Functional-Search.md` |
| BUG-008 | Inconsistent State Management | P2 | Historical | `bug-reports/BUG-008-Inconsistent-State-Management.md` |
| BUG-009 | Incorrect Environment Variable | P2 | Historical | `bug-reports/BUG-009-Incorrect-Environment-Variable.md` |

### Renamed Bugs (New IDs)
| Old ID | New ID | Title | Reason |
|--------|--------|-------|--------|
| BUG-002 (2nd) | BUG-010 | Episode Data Inconsistency | ID conflict resolution |
| BUG-006 (2nd) | BUG-011 | Missing Routes 404 Handling | ID conflict resolution |
| BUG-008 (2nd) | BUG-012 | Multiple Tab Performance | ID conflict resolution |

## 📊 Bug Statistics

### By Severity
- **P0 (Critical):** 4 total, 4 fixed (100% resolved)
- **P1 (High):** 6 total, 6 fixed (100% resolved)
- **P2 (Medium):** 7 total, 6 fixed (86% resolved)
- **P3 (Low):** 7 total, 3 fixed (43% resolved)

### By Category
- **UI/Visual:** 8 bugs (7 fixed)
- **Functionality:** 6 bugs (6 fixed)
- **Performance:** 3 bugs (2 fixed)
- **Audio:** 2 bugs (2 fixed)
- **Navigation:** 3 bugs (2 fixed)
- **Development:** 2 bugs (1 fixed)

### By Status
- **Fixed:** 19 bugs (79%)
- **Open:** 5 bugs (21%)
- **Won't Fix:** 0 bugs

## 🔍 Bug Naming Convention

### Current Standard
- Format: `BUG-XXX-Short-Description.md`
- Sequential numbering starting from BUG-001
- Special prefixes:
  - `VIS-BUG` for visual/UI bugs
  - `REG-` for regression bugs found during testing
  - `PERF-` for performance-specific bugs (future)

### Legacy Formats (deprecated)
- `BUGXXX_Description.md` (old format, no longer used)
- Mixed case and underscore usage

## 📝 Bug Report Requirements

Each bug report must include:
1. **Bug ID** - Unique identifier
2. **Title** - Clear, concise description
3. **Severity** - P0, P1, P2, or P3
4. **Steps to Reproduce** - Detailed steps
5. **Expected Behavior** - What should happen
6. **Actual Behavior** - What actually happens
7. **Environment** - Browser, OS, etc.
8. **Screenshots** - If applicable
9. **Status** - New, Confirmed, In Progress, Fixed, Verified, Closed

## 🔄 Next Available IDs

- Standard bugs: **BUG-017**
- Visual bugs: **VIS-BUG-005**
- Regression bugs: **REG-005**

---

**Note:** Always check this index before creating new bug reports to avoid ID conflicts.