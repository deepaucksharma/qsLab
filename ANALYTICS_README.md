# Track 3: Learning Analytics & Insights

## Overview
This track implements comprehensive analytics and insights for the Neural Learn platform, providing real-time tracking, performance metrics, visualizations, and personalized recommendations.

## Features Implemented

### 1. Frontend Analytics Module (`analytics.js`)
- Real-time event tracking (segment views, interactions, completions)
- Session management and event batching
- Engagement score calculation
- Learning velocity metrics
- Retention tracking
- Dashboard UI with live updates
- Export functionality (JSON and CSV formats)
- Configurable settings and preferences
- Advanced filtering capabilities

### 2. Analytics Visualizations (`analytics_visualizations.js`)
- D3.js-powered interactive charts
- Line charts for time-series data
- Bar charts for categorical data
- Donut charts for distributions
- Gauge charts for progress metrics
- Real-time chart updates
- Tooltips and interactions

### 3. Analytics API Endpoints
- **GET** `/api/health` - Health check endpoint
- **POST** `/api/analytics/events` - Track analytics events
- **GET** `/api/analytics/insights` - Get analytics insights for time ranges
- **GET** `/api/analytics/metrics/<type>` - Get specific metrics (engagement, performance, retention, progress)
- **GET** `/api/analytics/recommendations` - Get personalized learning recommendations

### 4. Analytics Dashboard UI
- Real-time metrics display with visualizations
- Advanced filtering by time range, course, and event type
- Export data functionality (JSON + CSV)
- Settings panel for customization
- Responsive design with glassmorphism styling
- Dark mode support

### 5. Integration Points
- Analytics tracking integrated into `script.js` for segment views/completions
- Interactive elements tracked via `interactive_cues.js`
- Feature flag support via `feature_flags.js`
- Visualization updates on dashboard interactions

## Running the Analytics Track

```bash
# Navigate to Track 3 worktree
cd ../qslab-track3-analytics

# Install dependencies (if needed)
pip install -r requirements.txt

# Run the server on Track 3 port
python app.py --port=5003

# Test the implementation
python test_analytics.py
```

## Testing Analytics

### Manual Testing
1. Open the application at http://localhost:5003
2. Click the "Analytics" button in the header
3. Navigate through segments and complete interactions
4. Observe real-time updates in the analytics dashboard

### Automated Testing
Run the test script:
```bash
python test_analytics.py
```

## Key Files
- `analytics.js` - Frontend analytics module
- `analytics_dashboard.css` - Dashboard styling
- `app.py` - Enhanced with analytics API endpoints
- `feature_flags.js` - Enable/disable analytics features
- `test_analytics.py` - Test script for verification

## Analytics Events Tracked
- `segment_view` - When a segment is viewed
- `segment_load` - When a segment is loaded (with load time)
- `segment_complete` - When a segment is completed
- `interaction_complete` - When an interaction is completed
- `episode_complete` - When an episode is completed
- `quiz_attempt` - When a quiz is attempted
- `learning_path_progress` - Progress through learning paths

## Metrics Available
- **Engagement Score** - Combined metric of activity and interaction
- **Learning Velocity** - Speed of progress through content
- **Retention Metrics** - How well knowledge is retained
- **Performance Metrics** - Quiz scores and improvement rates
- **Progress Metrics** - Completion rates and time estimates

## Future Enhancements
- Advanced predictive analytics
- Cohort analysis
- A/B testing framework
- Export analytics data
- Custom metric definitions
- Real-time collaboration analytics