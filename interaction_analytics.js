/**
 * Interaction Analytics System for Track 2
 * Comprehensive tracking and analysis of user interactions
 */

class InteractionAnalytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.interactions = [];
        this.aggregatedData = {};
        this.realTimeListeners = new Set();
        
        // Initialize storage
        this.initializeStorage();
        
        // Start periodic sync
        this.startPeriodicSync();
    }
    
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    
    initializeStorage() {
        // Check for IndexedDB support
        if ('indexedDB' in window) {
            this.initIndexedDB();
        } else {
            // Fallback to localStorage
            this.storage = {
                save: (data) => {
                    try {
                        localStorage.setItem(`analytics_${this.sessionId}`, JSON.stringify(data));
                    } catch (e) {
                        console.error('Storage error:', e);
                    }
                },
                load: () => {
                    try {
                        const data = localStorage.getItem(`analytics_${this.sessionId}`);
                        return data ? JSON.parse(data) : null;
                    } catch (e) {
                        console.error('Storage error:', e);
                        return null;
                    }
                }
            };
        }
    }
    
    async initIndexedDB() {
        const dbName = 'InteractionAnalyticsDB';
        const dbVersion = 1;
        
        const request = indexedDB.open(dbName, dbVersion);
        
        request.onerror = () => {
            console.error('IndexedDB error:', request.error);
            this.initializeStorage(); // Fallback
        };
        
        request.onsuccess = () => {
            this.db = request.result;
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            if (!db.objectStoreNames.contains('interactions')) {
                const store = db.createObjectStore('interactions', { keyPath: 'id', autoIncrement: true });
                store.createIndex('sessionId', 'sessionId', { unique: false });
                store.createIndex('timestamp', 'timestamp', { unique: false });
                store.createIndex('interactionType', 'interactionType', { unique: false });
                store.createIndex('segmentId', 'segmentId', { unique: false });
            }
            
            if (!db.objectStoreNames.contains('sessions')) {
                const sessionStore = db.createObjectStore('sessions', { keyPath: 'sessionId' });
                sessionStore.createIndex('startTime', 'startTime', { unique: false });
            }
        };
    }
    
    // Core tracking method
    trackInteraction(segmentId, interactionData) {
        const interaction = {
            id: Date.now() + Math.random(),
            sessionId: this.sessionId,
            segmentId: segmentId,
            timestamp: Date.now(),
            ...interactionData,
            metadata: {
                userAgent: navigator.userAgent,
                screenResolution: `${window.screen.width}x${window.screen.height}`,
                viewportSize: `${window.innerWidth}x${window.innerHeight}`,
                connectionType: this.getConnectionType()
            }
        };
        
        // Add to memory
        this.interactions.push(interaction);
        
        // Save to storage
        this.saveInteraction(interaction);
        
        // Update aggregated data
        this.updateAggregatedData(interaction);
        
        // Notify real-time listeners
        this.notifyListeners(interaction);
        
        // Send to backend if online
        if (navigator.onLine) {
            this.sendToBackend(interaction);
        }
        
        return interaction;
    }
    
    saveInteraction(interaction) {
        if (this.db) {
            const transaction = this.db.transaction(['interactions'], 'readwrite');
            const store = transaction.objectStore('interactions');
            store.add(interaction);
        } else if (this.storage) {
            const existing = this.storage.load() || { interactions: [] };
            existing.interactions.push(interaction);
            this.storage.save(existing);
        }
    }
    
    updateAggregatedData(interaction) {
        // Update interaction type counts
        if (!this.aggregatedData.interactionTypes) {
            this.aggregatedData.interactionTypes = {};
        }
        const type = interaction.interactionType || interaction.type;
        this.aggregatedData.interactionTypes[type] = (this.aggregatedData.interactionTypes[type] || 0) + 1;
        
        // Update segment interaction counts
        if (!this.aggregatedData.segmentInteractions) {
            this.aggregatedData.segmentInteractions = {};
        }
        this.aggregatedData.segmentInteractions[interaction.segmentId] = 
            (this.aggregatedData.segmentInteractions[interaction.segmentId] || 0) + 1;
        
        // Update time-based metrics
        this.updateTimeMetrics(interaction);
        
        // Update success/failure rates
        this.updateSuccessRates(interaction);
    }
    
    updateTimeMetrics(interaction) {
        if (!this.aggregatedData.timeMetrics) {
            this.aggregatedData.timeMetrics = {
                totalTime: 0,
                averageTime: 0,
                interactionTimes: {}
            };
        }
        
        const type = interaction.interactionType || interaction.type;
        const duration = interaction.duration || 0;
        
        if (!this.aggregatedData.timeMetrics.interactionTimes[type]) {
            this.aggregatedData.timeMetrics.interactionTimes[type] = {
                total: 0,
                count: 0,
                average: 0,
                min: Infinity,
                max: 0
            };
        }
        
        const typeMetrics = this.aggregatedData.timeMetrics.interactionTimes[type];
        typeMetrics.total += duration;
        typeMetrics.count += 1;
        typeMetrics.average = typeMetrics.total / typeMetrics.count;
        typeMetrics.min = Math.min(typeMetrics.min, duration);
        typeMetrics.max = Math.max(typeMetrics.max, duration);
    }
    
    updateSuccessRates(interaction) {
        if (!this.aggregatedData.successRates) {
            this.aggregatedData.successRates = {};
        }
        
        const type = interaction.interactionType || interaction.type;
        
        if (!this.aggregatedData.successRates[type]) {
            this.aggregatedData.successRates[type] = {
                attempts: 0,
                successes: 0,
                failures: 0,
                rate: 0
            };
        }
        
        const rates = this.aggregatedData.successRates[type];
        rates.attempts += 1;
        
        if (interaction.isCorrect || interaction.success) {
            rates.successes += 1;
        } else if (interaction.isCorrect === false || interaction.success === false) {
            rates.failures += 1;
        }
        
        rates.rate = rates.successes / rates.attempts;
    }
    
    // Real-time analytics
    addRealTimeListener(callback) {
        this.realTimeListeners.add(callback);
        
        // Return unsubscribe function
        return () => {
            this.realTimeListeners.delete(callback);
        };
    }
    
    notifyListeners(interaction) {
        this.realTimeListeners.forEach(callback => {
            try {
                callback(interaction, this.aggregatedData);
            } catch (error) {
                console.error('Listener error:', error);
            }
        });
    }
    
    // Analytics queries
    async getInteractionsByType(type) {
        if (this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['interactions'], 'readonly');
                const store = transaction.objectStore('interactions');
                const index = store.index('interactionType');
                const request = index.getAll(type);
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } else {
            return this.interactions.filter(i => 
                (i.interactionType || i.type) === type
            );
        }
    }
    
    async getInteractionsBySegment(segmentId) {
        if (this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['interactions'], 'readonly');
                const store = transaction.objectStore('interactions');
                const index = store.index('segmentId');
                const request = index.getAll(segmentId);
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } else {
            return this.interactions.filter(i => i.segmentId === segmentId);
        }
    }
    
    async getInteractionsByTimeRange(startTime, endTime) {
        if (this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['interactions'], 'readonly');
                const store = transaction.objectStore('interactions');
                const index = store.index('timestamp');
                const range = IDBKeyRange.bound(startTime, endTime);
                const request = index.getAll(range);
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } else {
            return this.interactions.filter(i => 
                i.timestamp >= startTime && i.timestamp <= endTime
            );
        }
    }
    
    // Funnel analysis
    async getFunnelAnalysis(steps) {
        const funnel = {
            steps: steps,
            conversions: [],
            dropoffs: []
        };
        
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const interactions = await this.getInteractionsByType(step.type);
            const successful = interactions.filter(i => 
                step.successCondition ? step.successCondition(i) : true
            );
            
            funnel.conversions.push({
                step: step.name,
                total: interactions.length,
                successful: successful.length,
                rate: successful.length / interactions.length || 0
            });
            
            if (i > 0) {
                const dropoff = funnel.conversions[i - 1].successful - funnel.conversions[i].total;
                funnel.dropoffs.push({
                    from: steps[i - 1].name,
                    to: step.name,
                    count: dropoff,
                    rate: dropoff / funnel.conversions[i - 1].successful || 0
                });
            }
        }
        
        return funnel;
    }
    
    // Heatmap data
    getHeatmapData(interactionType) {
        const interactions = this.interactions.filter(i => 
            (i.interactionType || i.type) === interactionType
        );
        
        const heatmap = {};
        
        interactions.forEach(interaction => {
            if (interaction.coordinates || interaction.position) {
                const key = interaction.coordinates ? 
                    `${Math.round(interaction.coordinates.x / 10) * 10},${Math.round(interaction.coordinates.y / 10) * 10}` :
                    `${interaction.position}`;
                
                heatmap[key] = (heatmap[key] || 0) + 1;
            }
        });
        
        return heatmap;
    }
    
    // User journey analysis
    getUserJourney(userId) {
        const userInteractions = this.interactions
            .filter(i => i.userId === userId)
            .sort((a, b) => a.timestamp - b.timestamp);
        
        const journey = {
            userId: userId,
            sessionDuration: 0,
            steps: [],
            patterns: []
        };
        
        if (userInteractions.length > 0) {
            journey.sessionDuration = userInteractions[userInteractions.length - 1].timestamp - userInteractions[0].timestamp;
            
            userInteractions.forEach((interaction, index) => {
                journey.steps.push({
                    order: index + 1,
                    type: interaction.interactionType || interaction.type,
                    segmentId: interaction.segmentId,
                    timestamp: interaction.timestamp,
                    duration: interaction.duration || 0,
                    success: interaction.isCorrect || interaction.success || false
                });
            });
            
            // Identify patterns
            journey.patterns = this.identifyPatterns(journey.steps);
        }
        
        return journey;
    }
    
    identifyPatterns(steps) {
        const patterns = [];
        const sequenceLength = 3;
        
        for (let i = 0; i <= steps.length - sequenceLength; i++) {
            const sequence = steps.slice(i, i + sequenceLength).map(s => s.type).join(' -> ');
            
            const existingPattern = patterns.find(p => p.sequence === sequence);
            if (existingPattern) {
                existingPattern.count += 1;
            } else {
                patterns.push({
                    sequence: sequence,
                    count: 1,
                    averageDuration: steps.slice(i, i + sequenceLength).reduce((sum, s) => sum + s.duration, 0) / sequenceLength
                });
            }
        }
        
        return patterns.sort((a, b) => b.count - a.count);
    }
    
    // Export analytics data
    exportAnalytics(format = 'json') {
        const data = {
            sessionId: this.sessionId,
            startTime: this.startTime,
            endTime: Date.now(),
            duration: Date.now() - this.startTime,
            interactions: this.interactions,
            aggregatedData: this.aggregatedData,
            summary: this.generateSummary()
        };
        
        switch (format) {
            case 'json':
                return JSON.stringify(data, null, 2);
                
            case 'csv':
                return this.convertToCSV(data);
                
            case 'report':
                return this.generateHTMLReport(data);
                
            default:
                return data;
        }
    }
    
    convertToCSV(data) {
        const headers = ['Timestamp', 'Session ID', 'Segment ID', 'Interaction Type', 'Success', 'Duration'];
        const rows = data.interactions.map(i => [
            new Date(i.timestamp).toISOString(),
            i.sessionId,
            i.segmentId,
            i.interactionType || i.type,
            i.isCorrect || i.success || 'N/A',
            i.duration || 0
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    generateHTMLReport(data) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Interaction Analytics Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .metric { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
                    .chart { margin: 20px 0; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background: #667eea; color: white; }
                </style>
            </head>
            <body>
                <h1>Interaction Analytics Report</h1>
                <div class="metric">
                    <h2>Session Summary</h2>
                    <p>Session ID: ${data.sessionId}</p>
                    <p>Duration: ${(data.duration / 1000 / 60).toFixed(2)} minutes</p>
                    <p>Total Interactions: ${data.interactions.length}</p>
                </div>
                
                <div class="metric">
                    <h2>Interaction Types</h2>
                    <table>
                        <tr><th>Type</th><th>Count</th><th>Percentage</th></tr>
                        ${Object.entries(data.aggregatedData.interactionTypes || {})
                            .map(([type, count]) => `
                                <tr>
                                    <td>${type}</td>
                                    <td>${count}</td>
                                    <td>${((count / data.interactions.length) * 100).toFixed(1)}%</td>
                                </tr>
                            `).join('')}
                    </table>
                </div>
                
                <div class="metric">
                    <h2>Success Rates</h2>
                    <table>
                        <tr><th>Type</th><th>Attempts</th><th>Success Rate</th></tr>
                        ${Object.entries(data.aggregatedData.successRates || {})
                            .map(([type, rates]) => `
                                <tr>
                                    <td>${type}</td>
                                    <td>${rates.attempts}</td>
                                    <td>${(rates.rate * 100).toFixed(1)}%</td>
                                </tr>
                            `).join('')}
                    </table>
                </div>
            </body>
            </html>
        `;
    }
    
    generateSummary() {
        return {
            totalInteractions: this.interactions.length,
            uniqueSegments: new Set(this.interactions.map(i => i.segmentId)).size,
            averageInteractionsPerMinute: this.interactions.length / ((Date.now() - this.startTime) / 1000 / 60),
            mostCommonInteraction: this.getMostCommonInteraction(),
            successRate: this.getOverallSuccessRate()
        };
    }
    
    getMostCommonInteraction() {
        const counts = {};
        this.interactions.forEach(i => {
            const type = i.interactionType || i.type;
            counts[type] = (counts[type] || 0) + 1;
        });
        
        return Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || ['none', 0];
    }
    
    getOverallSuccessRate() {
        const withSuccess = this.interactions.filter(i => 
            i.hasOwnProperty('isCorrect') || i.hasOwnProperty('success')
        );
        
        if (withSuccess.length === 0) return 0;
        
        const successful = withSuccess.filter(i => i.isCorrect || i.success).length;
        return successful / withSuccess.length;
    }
    
    // Backend sync
    async sendToBackend(interaction) {
        if (window.api && window.api.logInteraction) {
            try {
                await window.api.logInteraction(interaction.segmentId, interaction);
            } catch (error) {
                console.error('Failed to send interaction to backend:', error);
                // Queue for retry
                this.queueForRetry(interaction);
            }
        }
    }
    
    queueForRetry(interaction) {
        if (!this.retryQueue) {
            this.retryQueue = [];
        }
        this.retryQueue.push(interaction);
    }
    
    async syncPendingInteractions() {
        if (!this.retryQueue || this.retryQueue.length === 0) return;
        
        const pending = [...this.retryQueue];
        this.retryQueue = [];
        
        for (const interaction of pending) {
            try {
                await this.sendToBackend(interaction);
            } catch (error) {
                this.queueForRetry(interaction);
            }
        }
    }
    
    startPeriodicSync() {
        // Sync every 30 seconds
        setInterval(() => {
            if (navigator.onLine) {
                this.syncPendingInteractions();
            }
        }, 30000);
        
        // Also sync when coming back online
        window.addEventListener('online', () => {
            this.syncPendingInteractions();
        });
    }
    
    getConnectionType() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            return connection.effectiveType || connection.type || 'unknown';
        }
        return 'unknown';
    }
}

// Analytics Dashboard Component
class AnalyticsDashboard {
    constructor(analytics, containerId) {
        this.analytics = analytics;
        this.container = document.getElementById(containerId);
        this.charts = {};
        
        if (this.container) {
            this.initialize();
        }
    }
    
    initialize() {
        this.container.innerHTML = `
            <div class="analytics-dashboard">
                <h2>Interaction Analytics Dashboard</h2>
                
                <div class="dashboard-controls">
                    <button class="refresh-btn">
                        <i class="fas fa-sync"></i> Refresh
                    </button>
                    <button class="export-btn">
                        <i class="fas fa-download"></i> Export
                    </button>
                    <select class="time-range-select">
                        <option value="all">All Time</option>
                        <option value="hour">Last Hour</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                    </select>
                </div>
                
                <div class="dashboard-grid">
                    <div class="metric-card">
                        <h3>Total Interactions</h3>
                        <div class="metric-value" id="total-interactions">0</div>
                    </div>
                    
                    <div class="metric-card">
                        <h3>Success Rate</h3>
                        <div class="metric-value" id="success-rate">0%</div>
                    </div>
                    
                    <div class="metric-card">
                        <h3>Active Time</h3>
                        <div class="metric-value" id="active-time">0m</div>
                    </div>
                    
                    <div class="metric-card">
                        <h3>Interactions/Min</h3>
                        <div class="metric-value" id="interaction-rate">0</div>
                    </div>
                </div>
                
                <div class="chart-container">
                    <h3>Interaction Timeline</h3>
                    <canvas id="timeline-chart"></canvas>
                </div>
                
                <div class="chart-container">
                    <h3>Interaction Types</h3>
                    <canvas id="types-chart"></canvas>
                </div>
                
                <div class="chart-container">
                    <h3>Success Rates by Type</h3>
                    <canvas id="success-chart"></canvas>
                </div>
                
                <div class="interactions-table">
                    <h3>Recent Interactions</h3>
                    <table id="interactions-table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Type</th>
                                <th>Segment</th>
                                <th>Success</th>
                                <th>Duration</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        `;
        
        this.setupEventListeners();
        this.updateDashboard();
        
        // Subscribe to real-time updates
        this.unsubscribe = this.analytics.addRealTimeListener(() => {
            this.updateDashboard();
        });
    }
    
    setupEventListeners() {
        const refreshBtn = this.container.querySelector('.refresh-btn');
        const exportBtn = this.container.querySelector('.export-btn');
        const timeRangeSelect = this.container.querySelector('.time-range-select');
        
        refreshBtn.addEventListener('click', () => {
            this.updateDashboard();
        });
        
        exportBtn.addEventListener('click', () => {
            this.exportData();
        });
        
        timeRangeSelect.addEventListener('change', (e) => {
            this.updateDashboard(e.target.value);
        });
    }
    
    async updateDashboard(timeRange = 'all') {
        const data = await this.getFilteredData(timeRange);
        
        // Update metrics
        this.updateMetrics(data);
        
        // Update charts
        this.updateCharts(data);
        
        // Update table
        this.updateTable(data);
    }
    
    async getFilteredData(timeRange) {
        let startTime = 0;
        const endTime = Date.now();
        
        switch (timeRange) {
            case 'hour':
                startTime = endTime - (60 * 60 * 1000);
                break;
            case 'today':
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                startTime = today.getTime();
                break;
            case 'week':
                startTime = endTime - (7 * 24 * 60 * 60 * 1000);
                break;
        }
        
        if (timeRange === 'all') {
            return {
                interactions: this.analytics.interactions,
                aggregated: this.analytics.aggregatedData
            };
        } else {
            const interactions = await this.analytics.getInteractionsByTimeRange(startTime, endTime);
            return {
                interactions: interactions,
                aggregated: this.recalculateAggregated(interactions)
            };
        }
    }
    
    recalculateAggregated(interactions) {
        const aggregated = {
            interactionTypes: {},
            successRates: {}
        };
        
        interactions.forEach(interaction => {
            const type = interaction.interactionType || interaction.type;
            aggregated.interactionTypes[type] = (aggregated.interactionTypes[type] || 0) + 1;
            
            if (!aggregated.successRates[type]) {
                aggregated.successRates[type] = {
                    attempts: 0,
                    successes: 0,
                    rate: 0
                };
            }
            
            aggregated.successRates[type].attempts += 1;
            if (interaction.isCorrect || interaction.success) {
                aggregated.successRates[type].successes += 1;
            }
            aggregated.successRates[type].rate = 
                aggregated.successRates[type].successes / aggregated.successRates[type].attempts;
        });
        
        return aggregated;
    }
    
    updateMetrics(data) {
        const totalEl = document.getElementById('total-interactions');
        const successEl = document.getElementById('success-rate');
        const timeEl = document.getElementById('active-time');
        const rateEl = document.getElementById('interaction-rate');
        
        totalEl.textContent = data.interactions.length;
        
        const successRate = this.calculateOverallSuccessRate(data.interactions);
        successEl.textContent = `${(successRate * 100).toFixed(1)}%`;
        
        const duration = data.interactions.length > 0 ?
            data.interactions[data.interactions.length - 1].timestamp - data.interactions[0].timestamp :
            0;
        timeEl.textContent = `${Math.floor(duration / 1000 / 60)}m`;
        
        const rate = duration > 0 ? (data.interactions.length / (duration / 1000 / 60)) : 0;
        rateEl.textContent = rate.toFixed(1);
    }
    
    calculateOverallSuccessRate(interactions) {
        const withSuccess = interactions.filter(i => 
            i.hasOwnProperty('isCorrect') || i.hasOwnProperty('success')
        );
        
        if (withSuccess.length === 0) return 0;
        
        const successful = withSuccess.filter(i => i.isCorrect || i.success).length;
        return successful / withSuccess.length;
    }
    
    updateCharts(data) {
        // This would integrate with a charting library like Chart.js
        // For now, we'll create simple text-based visualizations
        
        // Timeline chart placeholder
        const timelineCanvas = document.getElementById('timeline-chart');
        if (timelineCanvas) {
            this.drawTimelineChart(timelineCanvas, data.interactions);
        }
        
        // Types chart placeholder
        const typesCanvas = document.getElementById('types-chart');
        if (typesCanvas) {
            this.drawTypesChart(typesCanvas, data.aggregated.interactionTypes);
        }
        
        // Success chart placeholder
        const successCanvas = document.getElementById('success-chart');
        if (successCanvas) {
            this.drawSuccessChart(successCanvas, data.aggregated.successRates);
        }
    }
    
    drawTimelineChart(canvas, interactions) {
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = 200;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (interactions.length === 0) return;
        
        // Simple line chart
        const minTime = interactions[0].timestamp;
        const maxTime = interactions[interactions.length - 1].timestamp || minTime;
        const timeRange = maxTime - minTime || 1;
        
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        interactions.forEach((interaction, index) => {
            const x = ((interaction.timestamp - minTime) / timeRange) * canvas.width;
            const y = canvas.height - (index / interactions.length) * canvas.height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
    }
    
    drawTypesChart(canvas, types) {
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = 200;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const entries = Object.entries(types);
        if (entries.length === 0) return;
        
        const maxCount = Math.max(...entries.map(e => e[1]));
        const barWidth = canvas.width / entries.length;
        
        entries.forEach(([type, count], index) => {
            const height = (count / maxCount) * (canvas.height - 40);
            const x = index * barWidth + barWidth * 0.1;
            const y = canvas.height - height - 20;
            
            ctx.fillStyle = '#667eea';
            ctx.fillRect(x, y, barWidth * 0.8, height);
            
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.save();
            ctx.translate(x + barWidth * 0.4, canvas.height - 5);
            ctx.rotate(-Math.PI / 4);
            ctx.fillText(type, 0, 0);
            ctx.restore();
        });
    }
    
    drawSuccessChart(canvas, rates) {
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = 200;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const entries = Object.entries(rates);
        if (entries.length === 0) return;
        
        const barWidth = canvas.width / entries.length;
        
        entries.forEach(([type, data], index) => {
            const successHeight = data.rate * (canvas.height - 40);
            const x = index * barWidth + barWidth * 0.1;
            const y = canvas.height - successHeight - 20;
            
            // Success bar
            ctx.fillStyle = '#48bb78';
            ctx.fillRect(x, y, barWidth * 0.8, successHeight);
            
            // Rate text
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.fillText(`${(data.rate * 100).toFixed(0)}%`, x + barWidth * 0.2, y - 5);
            
            // Type label
            ctx.save();
            ctx.translate(x + barWidth * 0.4, canvas.height - 5);
            ctx.rotate(-Math.PI / 4);
            ctx.fillText(type, 0, 0);
            ctx.restore();
        });
    }
    
    updateTable(data) {
        const tbody = this.container.querySelector('#interactions-table tbody');
        tbody.innerHTML = '';
        
        // Show last 10 interactions
        const recent = data.interactions.slice(-10).reverse();
        
        recent.forEach(interaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(interaction.timestamp).toLocaleTimeString()}</td>
                <td>${interaction.interactionType || interaction.type}</td>
                <td>${interaction.segmentId}</td>
                <td>${interaction.isCorrect || interaction.success ? '✓' : '✗'}</td>
                <td>${interaction.duration ? `${interaction.duration}ms` : '-'}</td>
            `;
            tbody.appendChild(row);
        });
    }
    
    exportData() {
        const data = this.analytics.exportAnalytics('json');
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_${this.analytics.sessionId}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}

// Initialize global analytics instance
window.interactionAnalytics = new InteractionAnalytics();

// Hook into existing interaction manager
if (window.interactiveCueManager) {
    const originalLogInteraction = window.InteractiveCueHandler.prototype.logInteraction;
    
    window.InteractiveCueHandler.prototype.logInteraction = function(segmentId, interactionData) {
        // Call original method
        if (originalLogInteraction) {
            originalLogInteraction.call(this, segmentId, interactionData);
        }
        
        // Track in analytics
        window.interactionAnalytics.trackInteraction(segmentId, interactionData);
    };
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        InteractionAnalytics,
        AnalyticsDashboard
    };
}