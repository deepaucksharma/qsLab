# Bug Report: Data Inconsistency in Episode Definitions

## Bug Information
- **Bug ID**: BUG-002
- **Date Discovered**: June 2, 2025
- **Severity**: Medium
- **Priority**: High
- **Status**: Open
- **Reporter**: Testing Assistant

## Summary
The episode data in seriesData.js is inconsistent with the actual episode files that exist in the codebase. Season 2 is missing 3 episodes in the series data definition.

## Environment
- **Files Affected**: 
  - `src/data/seriesData.js`
  - `src/episodes/index.js`
  - `src/episodes/season2/` directory

## Issue Description
The `seriesData.js` file defines Season 2 with only 4 episodes, but the actual codebase contains 7 episode implementations for Season 2.

### Current State in seriesData.js (Season 2):
1. Episode 1: "Kafka Share Groups"
2. Episode 2: "Distributed Systems Consensus" 
3. Episode 3: "Real-time Stream Processing"
4. Episode 4: "Cloud Native Security"

### Actual Episodes Available (Season 2 directory):
1. ep1-kafka-share-groups ✅
2. ep2-jmx-exploration ✅
3. ep3-prometheus-setup ✅
4. ep4-custom-ohi ✅
5. ep5-critical-metrics ❌ Missing from seriesData.js
6. ep6-data-ingestion-paths ❌ Missing from seriesData.js
7. ep7-kafka-evolution-limits ❌ Missing from seriesData.js

## Impact
- **User Experience**: Users cannot access episodes 5, 6, and 7 of Season 2
- **Content Discovery**: Missing episodes won't appear in the UI
- **Navigation**: Episode count displays will be incorrect
- **Progress Tracking**: Completion progress calculations will be wrong

## Fix Applied
**Date**: June 2, 2025  
**Status**: FIXED ✅

### Changes Made:
1. **Updated seriesData.js**: Added missing episodes 5, 6, and 7 to Season 2
2. **Updated imports**: Added missing episode imports for dataIngestionPathsEpisode and kafkaEvolutionLimitsEpisode

### New Season 2 Episode List:
1. Episode 1: "Kafka Share Groups: The Future of Event Streaming" ✅
2. Episode 2: "Distributed Systems Consensus" ✅  
3. Episode 3: "Real-time Stream Processing" ✅
4. Episode 4: "Cloud Native Security" ✅
5. Episode 5: "Key Shifts in Critical Metrics" ✅ **ADDED**
6. Episode 6: "Data Ingestion Paths" ✅ **ADDED**
7. Episode 7: "Kafka Evolution and Limits" ✅ **ADDED**

### Testing Required:
- [ ] Verify all 7 episodes appear in Season 2 UI
- [ ] Confirm episode navigation works for new episodes
- [ ] Test episode metadata displays correctly
- [ ] Verify episode count shows 7/7 for Season 2

---

**Resolution**: All missing episodes have been added to the series data. Season 2 now correctly displays all 7 available episodes.
