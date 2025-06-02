# Bug Report Template

## Bug ID: [AUTO-GENERATED]
**Date Found:** [YYYY-MM-DD]  
**Reporter:** [Tester Name]  
**Status:** [New/In Progress/Fixed/Closed/Won't Fix]

## Bug Summary
[One-line description of the issue - be specific but concise]

## Environment
- **Browser:** Chrome [version]
- **OS:** [Windows/Mac/Linux] [version]
- **Build/Commit:** [Git commit hash or version]
- **Test Instance:** Port [3001/3002/3003/3004]
- **User State:** [New user/Existing user with data]

## Severity & Priority
**Severity:** [Critical/High/Medium/Low]
- Critical: App crashes, data loss, security issue
- High: Major feature broken, blocks user flow
- Medium: Feature partially broken, workaround exists  
- Low: Minor issue, cosmetic, enhancement

**Priority:** [P1/P2/P3/P4]
- P1: Fix immediately
- P2: Fix for next release
- P3: Fix when possible
- P4: Nice to have

## Bug Details

### Steps to Reproduce
1. [First step - be very specific]
2. [Second step - include exact values/clicks]
3. [Continue with each step]
4. [Final step that shows the bug]

### Expected Result
[What should happen according to requirements or common sense]

### Actual Result  
[What actually happens - be precise about the error]

### Reproducibility
- [ ] Always (100%)
- [ ] Often (75%)
- [ ] Sometimes (50%)
- [ ] Rarely (25%)
- [ ] Once (couldn't reproduce)

## Evidence

### Screenshots/Videos
[Attach screenshots showing the issue]
- Screenshot 1: [Description]
- Screenshot 2: [Description]
- Video: [Link if applicable]

### Console Errors
```
[Paste any JavaScript errors from console]
```

### Network Errors
```
[Paste any failed network requests]
```

### Debug Information
- Debug Panel Output: [If relevant]
- LocalStorage State: [If relevant]
- Performance Metrics: [If relevant]

## Impact Analysis

### Affected Features
- [List all features impacted]
- [Include related functionality]

### Affected Users
- [Who is impacted: all users, specific scenarios]
- [Frequency of use case]

### Workaround
[Describe any workaround if available, or write "None"]

## Additional Information

### Related Issues
- Related to: #[issue number]
- Blocks: #[issue number]
- Blocked by: #[issue number]

### Regression
- [ ] This is a regression (worked in previous version: _______)
- [ ] This is a new issue

### Test Case Reference
- Test Case ID: [TC001, INT-03, etc.]
- Test Track: [Functional/Visual/Integration/Exploratory]

### Notes
[Any additional context, theories about cause, or observations]

## Fix Verification

### How to Verify Fix
1. [Steps to verify the bug is fixed]
2. [What to check for]
3. [Edge cases to test]

### Verification Status
- [ ] Fix verified by QA
- Date Verified: _______
- Verified By: _______
- Build Verified: _______

---

## For Developer Use

### Root Cause
[Developer fills this out]

### Fix Description
[What was changed to fix this]

### Affected Files
- [ ] File path and changes

### Unit Tests Added
- [ ] Yes, test name: _______
- [ ] No, reason: _______

---

## Bug Lifecycle

1. **Reported:** [Date] by [Name]
2. **Assigned:** [Date] to [Developer]
3. **In Progress:** [Date]
4. **Fixed:** [Date] in commit [hash]
5. **Verified:** [Date] by [Name]
6. **Closed:** [Date]

## Quick Copy Template

```markdown
**Summary:** 
**Severity:** 
**Steps:** 
1. 
2. 
3. 
**Expected:** 
**Actual:** 
**Browser:** Chrome [version]
```