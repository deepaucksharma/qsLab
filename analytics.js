/**
 * Analytics Module for Neural Learn
 * Track 3: Learning Analytics & Insights
 * 
 * Handles event tracking, metrics calculation, and data visualization
 */

class LearningAnalytics {
    constructor() {
        this.eventQueue = [];
        this.metrics = {};
        this.sessionData = {
            sessionId: this.generateSessionId(),
            startTime: Date.now(),
            events: []
        };
        this.initializeAnalytics();
    }

    initializeAnalytics() {
        // Initialize event listeners
        this.setupEventListeners();
        
        // Start periodic metrics calculation
        this.startMetricsCalculation();
        
        // Initialize real-time dashboard updates if enabled
        if (window.FEATURES?.ANALYTICS_DASHBOARD) {
            this.initializeDashboard();
        }
    }

    /**
     * Track a learning event
     * @param {string} eventType - Type of event (e.g., 'segment_view', 'interaction_complete')
     * @param {Object} data - Event data
     */
    trackEvent(eventType, data) {
        const event = {
            id: this.generateEventId(),
            sessionId: this.sessionData.sessionId,
            userId: window.currentUser?.id || 'anonymous',
            timestamp: Date.now(),
            eventType: eventType,
            data: data,
            context: this.getEventContext()
        };

        // Add to queue for batch processing
        this.eventQueue.push(event);
        this.sessionData.events.push(event);

        // Process immediately for real-time metrics
        this.processEventForRealtime(event);

        // Batch send events every 10 events or 30 seconds
        if (this.eventQueue.length >= 10) {
            this.flushEvents();
        }

        return event;
    }

    /**
     * Track segment-specific events
     */
    trackSegmentView(segmentId, duration) {
        return this.trackEvent('segment_view', {
            segmentId: segmentId,
            duration: duration,
            completionRate: this.calculateCompletionRate(segmentId)
        });
    }

    trackInteraction(segmentId, interactionType, result) {
        return this.trackEvent('interaction_complete', {
            segmentId: segmentId,
            interactionType: interactionType,
            result: result,
            timeToComplete: this.calculateInteractionTime()
        });
    }

    trackQuizAttempt(quizId, score, answers) {
        return this.trackEvent('quiz_attempt', {
            quizId: quizId,
            score: score,
            answers: answers,
            difficulty: this.getCurrentDifficulty()
        });
    }

    trackLearningPathProgress(courseId, lessonId, progress) {
        return this.trackEvent('learning_path_progress', {
            courseId: courseId,
            lessonId: lessonId,
            progress: progress,
            estimatedTimeRemaining: this.estimateTimeRemaining(courseId, progress)
        });
    }

    /**
     * Calculate learning metrics
     */
    calculateEngagementScore() {
        const recentEvents = this.getRecentEvents(300000); // Last 5 minutes
        const activeTime = this.calculateActiveTime(recentEvents);
        const interactionRate = this.calculateInteractionRate(recentEvents);
        const completionRate = this.calculateOverallCompletionRate();

        return {
            score: (activeTime * 0.4 + interactionRate * 0.4 + completionRate * 0.2),
            components: {
                activeTime: activeTime,
                interactionRate: interactionRate,
                completionRate: completionRate
            }
        };
    }

    calculateLearningVelocity() {
        const completedSegments = this.getCompletedSegments();
        const timeSpent = this.getTotalTimeSpent();
        
        return {
            segmentsPerHour: (completedSegments.length / timeSpent) * 3600000,
            averageSegmentTime: timeSpent / completedSegments.length,
            trend: this.calculateVelocityTrend()
        };
    }

    calculateRetentionMetrics() {
        const quizScores = this.getQuizScores();
        const repeatAttempts = this.getRepeatAttempts();
        
        return {
            averageScore: this.average(quizScores),
            improvementRate: this.calculateImprovementRate(repeatAttempts),
            retentionCurve: this.generateRetentionCurve()
        };
    }

    /**
     * Real-time metrics processing
     */
    processEventForRealtime(event) {
        // Update real-time metrics
        this.updateMetric('totalEvents', 1);
        this.updateMetric(`events_${event.eventType}`, 1);
        
        // Update engagement metrics
        if (event.eventType === 'interaction_complete') {
            this.updateEngagementMetrics(event);
        }
        
        // Trigger dashboard update if enabled
        if (window.FEATURES?.ANALYTICS_DASHBOARD) {
            this.updateDashboard(event);
        }
    }

    /**
     * Send analytics data to backend
     */
    async flushEvents() {
        if (this.eventQueue.length === 0) return;

        const events = [...this.eventQueue];
        this.eventQueue = [];

        try {
            const response = await fetch('/api/analytics/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    events: events,
                    sessionId: this.sessionData.sessionId
                })
            });

            if (!response.ok) {
                // Re-queue events on failure
                this.eventQueue.unshift(...events);
                throw new Error('Failed to send analytics events');
            }

            const result = await response.json();
            console.log('Analytics events sent:', result);
        } catch (error) {
            console.error('Error sending analytics:', error);
        }
    }

    /**
     * Get analytics insights
     */
    async getInsights(timeRange = 'week') {
        try {
            const response = await fetch(`/api/analytics/insights?range=${timeRange}`);
            const data = await response.json();
            
            return {
                engagement: data.engagement,
                performance: data.performance,
                recommendations: data.recommendations,
                trends: data.trends
            };
        } catch (error) {
            console.error('Error fetching insights:', error);
            return null;
        }
    }

    /**
     * Dashboard functionality
     */
    initializeDashboard() {
        // Create dashboard container if it doesn't exist
        if (!document.getElementById('analytics-dashboard')) {
            this.createDashboardUI();
        }
        
        // Start real-time updates
        this.dashboardUpdateInterval = setInterval(() => {
            this.refreshDashboard();
        }, 5000);
    }

    createDashboardUI() {
        const dashboard = document.createElement('div');
        dashboard.id = 'analytics-dashboard';
        dashboard.className = 'analytics-dashboard hidden';
        dashboard.innerHTML = `
            <div class="dashboard-header">
                <h3>Learning Analytics</h3>
                <div class="dashboard-actions">
                    <button class="export-btn" onclick="analytics.exportData()" title="Export Analytics Data">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="settings-btn" onclick="analytics.showSettings()" title="Analytics Settings">
                        <i class="fas fa-cog"></i>
                    </button>
                    <button class="close-dashboard" onclick="analytics.toggleDashboard()">×</button>
                </div>
            </div>
            <div class="analytics-filters">
                <div class="filter-group">
                    <label>Time Range:</label>
                    <select id="time-range-filter" onchange="analytics.applyFilters()">
                        <option value="hour">Last Hour</option>
                        <option value="day" selected>Last 24 Hours</option>
                        <option value="week">Last Week</option>
                        <option value="month">Last Month</option>
                        <option value="all">All Time</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Course:</label>
                    <select id="course-filter" onchange="analytics.applyFilters()">
                        <option value="">All Courses</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Event Type:</label>
                    <select id="event-type-filter" onchange="analytics.applyFilters()">
                        <option value="">All Events</option>
                        <option value="segment_view">Segment Views</option>
                        <option value="interaction_complete">Interactions</option>
                        <option value="quiz_attempt">Quiz Attempts</option>
                        <option value="episode_complete">Episode Completions</option>
                    </select>
                </div>
                <button class="filter-reset" onclick="analytics.resetFilters()">
                    <i class="fas fa-undo"></i> Reset
                </button>
            </div>
            <div class="dashboard-content">
                <div class="metric-card">
                    <h4>Engagement Score</h4>
                    <div class="metric-value" id="engagement-score">--</div>
                    <div class="metric-chart" id="engagement-chart"></div>
                </div>
                <div class="metric-card">
                    <h4>Learning Velocity</h4>
                    <div class="metric-value" id="learning-velocity">--</div>
                    <div class="metric-trend" id="velocity-trend"></div>
                </div>
                <div class="metric-card">
                    <h4>Retention Rate</h4>
                    <div class="metric-value" id="retention-rate">--</div>
                    <div class="metric-chart" id="retention-chart"></div>
                </div>
                <div class="metric-card full-width">
                    <h4>Activity Timeline</h4>
                    <div class="chart-container" id="activity-chart"></div>
                </div>
                <div class="metric-card">
                    <h4>Topic Progress</h4>
                    <div class="chart-container" id="topic-progress-chart"></div>
                </div>
                <div class="metric-card">
                    <h4>Performance Distribution</h4>
                    <div class="chart-container" id="performance-chart"></div>
                </div>
                <div class="metric-card full-width">
                    <h4>Recent Activity</h4>
                    <div class="activity-timeline" id="activity-timeline"></div>
                </div>
            </div>
        `;
        document.body.appendChild(dashboard);
    }

    updateDashboard(event) {
        // Update metrics displays
        const engagement = this.calculateEngagementScore();
        const velocity = this.calculateLearningVelocity();
        const retention = this.calculateRetentionMetrics();
        
        // Update UI elements
        this.updateMetricDisplay('engagement-score', engagement.score);
        this.updateMetricDisplay('learning-velocity', velocity.segmentsPerHour);
        this.updateMetricDisplay('retention-rate', retention.averageScore);
        
        // Update visualizations if available
        if (window.analyticsViz) {
            // Update engagement gauge
            if (!this.chartsInitialized) {
                this.initializeCharts();
            }
            
            // Update engagement gauge
            window.analyticsViz.updateChart('engagement-chart', engagement.score);
            
            // Update activity timeline chart
            const activityData = this.getRecentActivityData();
            window.analyticsViz.updateChart('activity-chart', activityData);
        }
        
        // Update timeline
        this.addToActivityTimeline(event);
    }
    
    initializeCharts() {
        if (!window.analyticsViz) return;
        
        // Create engagement gauge
        window.analyticsViz.createGauge('engagement-chart', 0, {
            height: 100,
            label: 'Engagement'
        });
        
        // Create activity timeline
        const activityData = this.getRecentActivityData();
        window.analyticsViz.createLineChart('activity-chart', activityData, {
            height: 150
        });
        
        // Create topic progress bars
        const topicData = this.getTopicProgressData();
        window.analyticsViz.createBarChart('topic-progress-chart', topicData, {
            height: 150
        });
        
        // Create performance distribution
        const perfData = this.getPerformanceData();
        window.analyticsViz.createDonutChart('performance-chart', perfData, {
            height: 150
        });
        
        this.chartsInitialized = true;
    }
    
    getRecentActivityData() {
        // Generate sample data - in production, this would use real event data
        const now = Date.now();
        const data = [];
        for (let i = 6; i >= 0; i--) {
            data.push({
                date: new Date(now - i * 24 * 60 * 60 * 1000).toISOString(),
                value: Math.floor(Math.random() * 50) + 20
            });
        }
        return data;
    }
    
    getTopicProgressData() {
        return [
            { label: 'Introduction', value: 100 },
            { label: 'Basics', value: 75 },
            { label: 'Advanced', value: 45 },
            { label: 'Expert', value: 20 }
        ];
    }
    
    getPerformanceData() {
        return [
            { label: 'Excellent', value: 25 },
            { label: 'Good', value: 45 },
            { label: 'Average', value: 20 },
            { label: 'Needs Work', value: 10 }
        ];
    }

    /**
     * Utility functions
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateEventId() {
        return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getEventContext() {
        return {
            url: window.location.href,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            device: this.getDeviceInfo(),
            browser: navigator.userAgent
        };
    }

    getDeviceInfo() {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        return {
            type: isMobile ? 'mobile' : 'desktop',
            screen: {
                width: screen.width,
                height: screen.height
            }
        };
    }

    /**
     * Helper methods
     */
    average(numbers) {
        return numbers.length ? numbers.reduce((a, b) => a + b) / numbers.length : 0;
    }

    updateMetric(name, increment) {
        if (!this.metrics[name]) this.metrics[name] = 0;
        this.metrics[name] += increment;
    }

    setupEventListeners() {
        // Page visibility tracking
        document.addEventListener('visibilitychange', () => {
            this.trackEvent('visibility_change', {
                hidden: document.hidden
            });
        });

        // Flush events before page unload
        window.addEventListener('beforeunload', () => {
            this.flushEvents();
        });
    }

    startMetricsCalculation() {
        // Calculate metrics every minute
        setInterval(() => {
            this.metrics.engagement = this.calculateEngagementScore();
            this.metrics.velocity = this.calculateLearningVelocity();
            this.metrics.retention = this.calculateRetentionMetrics();
        }, 60000);
    }

    // Placeholder methods to be implemented
    calculateCompletionRate(segmentId) { return 0; }
    calculateInteractionTime() { return 0; }
    getCurrentDifficulty() { return 'medium'; }
    estimateTimeRemaining(courseId, progress) { return 0; }
    getRecentEvents(timeWindow) { return []; }
    calculateActiveTime(events) { return 0; }
    calculateInteractionRate(events) { return 0; }
    calculateOverallCompletionRate() { return 0; }
    getCompletedSegments() { return []; }
    getTotalTimeSpent() { return 1; }
    calculateVelocityTrend() { return 'stable'; }
    getQuizScores() { return []; }
    getRepeatAttempts() { return []; }
    calculateImprovementRate(attempts) { return 0; }
    generateRetentionCurve() { return []; }
    updateMetricDisplay(id, value) { 
        const element = document.getElementById(id);
        if (element) element.textContent = value.toFixed(2);
    }
    addToActivityTimeline(event) { }
    refreshDashboard() { }
    toggleDashboard() {
        const dashboard = document.getElementById('analytics-dashboard');
        if (dashboard) dashboard.classList.toggle('hidden');
    }
    
    /**
     * Export analytics data
     */
    async exportData() {
        try {
            // Gather all analytics data
            const exportData = {
                metadata: {
                    exportDate: new Date().toISOString(),
                    sessionId: this.sessionData.sessionId,
                    userId: window.currentUser?.id || 'anonymous',
                    version: '1.0.0'
                },
                metrics: {
                    engagement: this.calculateEngagementScore(),
                    velocity: this.calculateLearningVelocity(),
                    retention: this.calculateRetentionMetrics()
                },
                events: this.sessionData.events,
                summary: {
                    totalEvents: this.sessionData.events.length,
                    sessionDuration: Date.now() - this.sessionData.startTime,
                    completedSegments: this.getCompletedSegments().length
                }
            };
            
            // Create and download JSON file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Also offer CSV export for events
            this.exportEventsAsCSV();
            
            console.log('Analytics data exported successfully');
        } catch (error) {
            console.error('Failed to export analytics data:', error);
        }
    }
    
    /**
     * Export events as CSV
     */
    exportEventsAsCSV() {
        const events = this.sessionData.events;
        if (events.length === 0) return;
        
        // Create CSV header
        const headers = ['Timestamp', 'Event Type', 'Segment ID', 'Course ID', 'Details'];
        const rows = [headers];
        
        // Add event rows
        events.forEach(event => {
            rows.push([
                new Date(event.timestamp).toLocaleString(),
                event.eventType,
                event.data?.segmentId || '',
                event.data?.courseId || '',
                JSON.stringify(event.data || {})
            ]);
        });
        
        // Convert to CSV string
        const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        
        // Download CSV
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-events-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    /**
     * Show analytics settings
     */
    showSettings() {
        // Create settings modal
        const modal = document.createElement('div');
        modal.className = 'analytics-settings-modal';
        modal.innerHTML = `
            <div class="settings-content">
                <h3>Analytics Settings</h3>
                <div class="settings-group">
                    <label>
                        <input type="checkbox" id="analytics-tracking" checked>
                        Enable Analytics Tracking
                    </label>
                </div>
                <div class="settings-group">
                    <label>
                        <input type="checkbox" id="analytics-realtime" checked>
                        Real-time Dashboard Updates
                    </label>
                </div>
                <div class="settings-group">
                    <label>
                        Event Batch Size:
                        <input type="number" id="batch-size" value="10" min="1" max="50">
                    </label>
                </div>
                <div class="settings-group">
                    <label>
                        Dashboard Refresh Rate:
                        <select id="refresh-rate">
                            <option value="1000">1 second</option>
                            <option value="5000" selected>5 seconds</option>
                            <option value="10000">10 seconds</option>
                            <option value="30000">30 seconds</option>
                        </select>
                    </label>
                </div>
                <div class="settings-actions">
                    <button onclick="analytics.saveSettings()">Save</button>
                    <button onclick="analytics.closeSettings()">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    saveSettings() {
        // Save settings to localStorage
        const settings = {
            trackingEnabled: document.getElementById('analytics-tracking').checked,
            realtimeUpdates: document.getElementById('analytics-realtime').checked,
            batchSize: parseInt(document.getElementById('batch-size').value),
            refreshRate: parseInt(document.getElementById('refresh-rate').value)
        };
        
        localStorage.setItem('analyticsSettings', JSON.stringify(settings));
        this.applySettings(settings);
        this.closeSettings();
    }
    
    closeSettings() {
        const modal = document.querySelector('.analytics-settings-modal');
        if (modal) modal.remove();
    }
    
    applySettings(settings) {
        // Apply the settings
        if (!settings.trackingEnabled) {
            console.log('Analytics tracking disabled');
        }
        
        if (settings.realtimeUpdates && this.dashboardUpdateInterval) {
            clearInterval(this.dashboardUpdateInterval);
            this.dashboardUpdateInterval = setInterval(() => {
                this.refreshDashboard();
            }, settings.refreshRate);
        }
    }
    
    /**
     * Apply analytics filters
     */
    applyFilters() {
        const filters = {
            timeRange: document.getElementById('time-range-filter')?.value || 'day',
            courseId: document.getElementById('course-filter')?.value || '',
            eventType: document.getElementById('event-type-filter')?.value || ''
        };
        
        // Store current filters
        this.currentFilters = filters;
        
        // Filter events based on criteria
        const filteredEvents = this.filterEvents(filters);
        
        // Recalculate metrics with filtered data
        this.updateMetricsWithFilteredData(filteredEvents);
        
        // Update visualizations
        this.updateVisualizationsWithFilteredData(filteredEvents);
        
        console.log('Filters applied:', filters);
    }
    
    /**
     * Reset all filters
     */
    resetFilters() {
        document.getElementById('time-range-filter').value = 'day';
        document.getElementById('course-filter').value = '';
        document.getElementById('event-type-filter').value = '';
        
        this.currentFilters = null;
        this.applyFilters();
    }
    
    /**
     * Filter events based on criteria
     */
    filterEvents(filters) {
        let events = [...this.sessionData.events];
        
        // Time range filter
        if (filters.timeRange && filters.timeRange !== 'all') {
            const now = Date.now();
            let cutoffTime;
            
            switch (filters.timeRange) {
                case 'hour':
                    cutoffTime = now - 60 * 60 * 1000;
                    break;
                case 'day':
                    cutoffTime = now - 24 * 60 * 60 * 1000;
                    break;
                case 'week':
                    cutoffTime = now - 7 * 24 * 60 * 60 * 1000;
                    break;
                case 'month':
                    cutoffTime = now - 30 * 24 * 60 * 60 * 1000;
                    break;
                default:
                    cutoffTime = 0;
            }
            
            events = events.filter(e => e.timestamp >= cutoffTime);
        }
        
        // Course filter
        if (filters.courseId) {
            events = events.filter(e => e.data?.courseId === filters.courseId);
        }
        
        // Event type filter
        if (filters.eventType) {
            events = events.filter(e => e.eventType === filters.eventType);
        }
        
        return events;
    }
    
    /**
     * Update metrics with filtered data
     */
    updateMetricsWithFilteredData(filteredEvents) {
        // Temporarily replace events for calculation
        const originalEvents = this.sessionData.events;
        this.sessionData.events = filteredEvents;
        
        // Recalculate metrics
        const engagement = this.calculateEngagementScore();
        const velocity = this.calculateLearningVelocity();
        const retention = this.calculateRetentionMetrics();
        
        // Update displays
        this.updateMetricDisplay('engagement-score', engagement.score);
        this.updateMetricDisplay('learning-velocity', velocity.segmentsPerHour);
        this.updateMetricDisplay('retention-rate', retention.averageScore);
        
        // Restore original events
        this.sessionData.events = originalEvents;
    }
    
    /**
     * Update visualizations with filtered data
     */
    updateVisualizationsWithFilteredData(filteredEvents) {
        if (!window.analyticsViz || !this.chartsInitialized) return;
        
        // Update charts with filtered data
        const activityData = this.getFilteredActivityData(filteredEvents);
        window.analyticsViz.updateChart('activity-chart', activityData);
        
        const topicData = this.getFilteredTopicData(filteredEvents);
        window.analyticsViz.updateChart('topic-progress-chart', topicData);
        
        const perfData = this.getFilteredPerformanceData(filteredEvents);
        window.analyticsViz.updateChart('performance-chart', perfData);
    }
    
    /**
     * Get filtered activity data for charts
     */
    getFilteredActivityData(events) {
        const dayGroups = {};
        
        events.forEach(event => {
            const date = new Date(event.timestamp).toDateString();
            if (!dayGroups[date]) {
                dayGroups[date] = 0;
            }
            dayGroups[date]++;
        });
        
        return Object.entries(dayGroups).map(([date, count]) => ({
            date: new Date(date).toISOString(),
            value: count
        })).sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    /**
     * Get filtered topic data
     */
    getFilteredTopicData(events) {
        const topicCounts = {};
        
        events.forEach(event => {
            if (event.eventType === 'segment_complete') {
                const topic = event.data?.topic || 'Unknown';
                topicCounts[topic] = (topicCounts[topic] || 0) + 1;
            }
        });
        
        return Object.entries(topicCounts).map(([topic, count]) => ({
            label: topic,
            value: count
        }));
    }
    
    /**
     * Get filtered performance data
     */
    getFilteredPerformanceData(events) {
        const scores = events
            .filter(e => e.eventType === 'quiz_attempt')
            .map(e => e.data?.score || 0);
        
        if (scores.length === 0) {
            return [
                { label: 'No Data', value: 1 }
            ];
        }
        
        const distribution = {
            'Excellent (90-100)': 0,
            'Good (70-89)': 0,
            'Average (50-69)': 0,
            'Needs Work (<50)': 0
        };
        
        scores.forEach(score => {
            if (score >= 90) distribution['Excellent (90-100)']++;
            else if (score >= 70) distribution['Good (70-89)']++;
            else if (score >= 50) distribution['Average (50-69)']++;
            else distribution['Needs Work (<50)']++;
        });
        
        return Object.entries(distribution)
            .filter(([_, count]) => count > 0)
            .map(([label, value]) => ({ label, value }));
    }
    
    /**
     * Populate course filter dropdown
     */
    populateCourseFilter() {
        const courses = new Set();
        this.sessionData.events.forEach(event => {
            if (event.data?.courseId) {
                courses.add(event.data.courseId);
            }
        });
        
        const courseFilter = document.getElementById('course-filter');
        if (courseFilter && courses.size > 0) {
            courses.forEach(courseId => {
                const option = document.createElement('option');
                option.value = courseId;
                option.textContent = `Course ${courseId}`;
                courseFilter.appendChild(option);
            });
        }
    }
}

// Initialize analytics when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.analytics = new LearningAnalytics();
    console.log('Learning Analytics initialized');
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LearningAnalytics;
}