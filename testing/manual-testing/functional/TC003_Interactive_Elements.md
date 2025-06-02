# Test Case: TC003 - Interactive Elements (Quizzes & Decisions)
**Test Track:** Functional  
**Priority:** High  
**Last Updated:** 2025-01-06

## Test Objective
Verify all interactive elements including quizzes, decision points, and hands-on exercises function correctly with proper validation and state management.

## Prerequisites
- Episode with interactive elements loaded
- Known correct/incorrect answers for quizzes
- Understanding of expected branching logic
- Browser console open for validation errors

## Test Data
- Test with multiple episodes containing different interaction types
- Sample correct answers (from episode documentation)
- Sample incorrect answers for validation testing

## Test Steps

### Step 1: Navigate to Interactive Scene
**Action:**
1. Start an episode with known interactive elements
2. Progress to first interactive moment
3. Observe when playback pauses

**Expected Result:**
- Episode pauses at interaction point
- Interactive UI appears clearly
- Instructions are visible
- Background content is dimmed/paused
- No progression until interaction complete

**Pass/Fail:** [ ]

### Step 2: Quiz Question Display
**Action:**
1. Read the quiz question text
2. Review all answer options
3. Check for any multimedia in question
4. Verify UI layout and readability

**Expected Result:**
- Question text is complete and clear
- All options are visible and selectable
- Radio buttons/checkboxes work
- Text doesn't overflow containers
- Proper contrast for readability

**Pass/Fail:** [ ]

### Step 3: Answer Selection Mechanism
**Action:**
1. Click on first answer option
2. Click on second answer option
3. Verify selection behavior

**Expected Result:**
- Only one answer selectable (if single-choice)
- Selection clearly indicated visually
- Previous selection cleared

**Pass/Fail:** [ ]

### Step 4: Submit Without Selection
**Action:**
1. Clear any selections
2. Click Submit/Continue button
3. Observe validation behavior

**Expected Result:**
- Submit blocked or warning shown
- "Please select an answer" message
- No progression without selection
- Submit button disabled or shows error

**Pass/Fail:** [ ]

### Step 5: Incorrect Answer Submission
**Action:**
1. Select a known incorrect answer
2. Click Submit
3. Observe feedback and behavior

**Expected Result:**
- Clear "incorrect" feedback
- Explanation or hint provided
- Option to try again (if allowed)
- No progression to next scene
- Answer marked visually as wrong

**Pass/Fail:** [ ]

### Step 6: Correct Answer Submission
**Action:**
1. Select the correct answer
2. Click Submit
3. Observe success feedback

**Expected Result:**
- Clear "correct" feedback
- Positive reinforcement message
- Automatic progression after delay
- Or manual continue option
- Score updated (if tracked)

**Pass/Fail:** [ ]

### Step 7: Decision Point Testing
**Action:**
1. Progress to a branching decision
2. Review all choice options
3. Select one path
4. Note which content follows

**Expected Result:**
- All choices clearly presented
- Selection triggers correct branch
- Appropriate content loads
- No mix of branch content
- State remembers choice

**Pass/Fail:** [ ]

### Step 8: Multiple Choice Questions
**Action:**
1. Find a multiple-selection quiz
2. Select multiple options
3. Deselect and reselect
4. Submit combination

**Expected Result:**
- Multiple selections allowed
- Clear indication of selected items
- Can toggle selections
- Validation for min/max selections
- Correct combination recognized

**Pass/Fail:** [ ]

### Step 9: Text Input Questions
**Action:**
1. Find text/code input question
2. Enter invalid format
3. Enter valid but wrong answer
4. Enter correct answer

**Expected Result:**
- Input field accepts typing
- Format validation works
- Clear error for invalid format
- Wrong answer handled gracefully
- Correct answer recognized

**Pass/Fail:** [ ]

### Step 10: Interactive State Persistence
**Action:**
1. Answer a quiz halfway through episode
2. Navigate away (back button)
3. Return to same episode
4. Check if answer remembered

**Expected Result:**
- Previous answers retained OR
- Clean restart (by design)
- No corrupted state
- Consistent behavior
- Progress tracked appropriately

**Pass/Fail:** [ ]

## Edge Cases

### Edge Case 1: Rapid Clicking
**Action:**
1. Click submit multiple times quickly
2. Click multiple answers rapidly
3. Try to progress during feedback

**Expected Result:**
- Only one submission processed
- No duplicate scoring
- UI remains stable
- Feedback completes normally

**Pass/Fail:** [ ]

### Edge Case 2: Special Characters
**Action:**
1. In text inputs, enter:
   - Unicode characters
   - HTML tags
   - Very long strings
   - Script injections

**Expected Result:**
- Input sanitized properly
- No rendering issues
- Length limits enforced
- No security vulnerabilities
- Graceful error handling

**Pass/Fail:** [ ]

### Edge Case 3: Browser Navigation During Quiz
**Action:**
1. Start answering a quiz
2. Use browser back button
3. Use forward to return
4. Check quiz state

**Expected Result:**
- Navigation handled gracefully
- Quiz state preserved or reset
- No broken UI elements
- Can complete quiz normally

**Pass/Fail:** [ ]

### Edge Case 4: Timeout Behavior
**Action:**
1. Start a quiz but don't complete
2. Leave for 5+ minutes
3. Return and try to submit

**Expected Result:**
- Session still valid OR
- Graceful timeout message
- Can restart if needed
- No frozen states

**Pass/Fail:** [ ]

## Validation Testing

### Format Validations
- [ ] Email format (if applicable)
- [ ] Number ranges
- [ ] Required fields
- [ ] Character limits
- [ ] Pattern matching

### Error Messages
- [ ] Helpful and specific
- [ ] Properly styled
- [ ] Appear near relevant input
- [ ] Clear on valid input

## Test Evidence
- [ ] Screenshots of each interaction type
- [ ] Video of branching logic
- [ ] Screenshots of error states
- [ ] Console logs for validation
- [ ] State inspection screenshots

## Notes
_Document any unusual behaviors or suggestions for improvement_

_______________

## Test Result Summary
**Overall Status:** [ ] PASS  [ ] FAIL  [ ] BLOCKED

**Tester Name:** _________________  
**Date Tested:** _________________  
**Episodes Tested:** _________________

**Interaction Types Tested:**
- [ ] Single choice quiz
- [ ] Multiple choice quiz  
- [ ] Text input
- [ ] Code input
- [ ] Decision branches
- [ ] Timed challenges

**Issues Found:** 
- Issue #: _________________
- Issue #: _________________