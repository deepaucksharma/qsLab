/**
 * Adaptive Learning Frontend Components
 * Handles personalized learning experiences and spaced repetition
 */

class AdaptiveLearningManager {
    constructor() {
        this.profile = null;
        this.currentPath = null;
        this.reviewSession = null;
        this.performanceTracker = new PerformanceTracker();
    }
    
    async initialize(userId) {
        try {
            // Load user's learning profile
            this.profile = await this.loadLearningProfile(userId);
            
            // Update UI with profile info
            this.displayLearningProfile();
            
            // Check for due reviews
            await this.checkDueReviews(userId);
            
        } catch (error) {
            console.error('Failed to initialize adaptive learning:', error);
        }
    }
    
    async loadLearningProfile(userId) {
        const response = await fetch(`http://localhost:5000/api/v1/adaptive/profile/${userId}`);
        if (!response.ok) {
            throw new Error(`Failed to load profile: ${response.status}`);
        }
        return await response.json();
    }
    
    displayLearningProfile() {
        if (!this.profile) return;
        
        // Create profile widget
        const profileWidget = document.createElement('div');
        profileWidget.className = 'learning-profile-widget';
        profileWidget.innerHTML = `
            <div class="profile-header">
                <h4>Your Learning Profile</h4>
                <button class="profile-details-btn" onclick="adaptiveLearning.showFullProfile()">
                    <i class="fas fa-chart-line"></i>
                </button>
            </div>
            <div class="profile-summary">
                <div class="profile-item">
                    <span class="profile-label">Learning Style:</span>
                    <span class="profile-value">${this.profile.learning_style}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Level:</span>
                    <span class="profile-value">${this.profile.preferred_difficulty}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Success Rate:</span>
                    <span class="profile-value">${Math.round(this.profile.interaction_success_rate * 100)}%</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Best Time:</span>
                    <span class="profile-value">${this.profile.best_learning_time}</span>
                </div>
            </div>
        `;
        
        // Insert into UI
        const container = document.getElementById('learningProfileContainer');
        if (container) {
            container.appendChild(profileWidget);
        }
    }
    
    showFullProfile() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Learning Profile Analysis</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="profile-section">
                        <h4>Learning Preferences</h4>
                        <div class="preference-grid">
                            <div class="preference-card ${this.profile.learning_style}">
                                <i class="fas fa-${this.getLearningStyleIcon(this.profile.learning_style)}"></i>
                                <h5>${this.profile.learning_style} Learner</h5>
                                <p>${this.getLearningStyleDescription(this.profile.learning_style)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="profile-section">
                        <h4>Performance Metrics</h4>
                        <div class="metrics-grid">
                            <div class="metric-card">
                                <div class="metric-value">${Math.round(this.profile.interaction_success_rate * 100)}%</div>
                                <div class="metric-label">Success Rate</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value">${Math.round(this.profile.average_segment_time / 60)}min</div>
                                <div class="metric-label">Avg. Segment Time</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value">${this.profile.optimal_session_length}min</div>
                                <div class="metric-label">Optimal Session</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="profile-section">
                        <h4>Strengths & Areas for Improvement</h4>
                        <div class="skills-grid">
                            <div class="skills-column">
                                <h5>Strengths</h5>
                                <ul class="skill-list strengths">
                                    ${this.profile.strength_areas.map(s => `<li>${s}</li>`).join('')}
                                </ul>
                            </div>
                            <div class="skills-column">
                                <h5>Focus Areas</h5>
                                <ul class="skill-list weaknesses">
                                    ${this.profile.weakness_areas.map(w => `<li>${w}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    getLearningStyleIcon(style) {
        const icons = {
            'visual': 'eye',
            'auditory': 'headphones',
            'kinesthetic': 'hand-paper',
            'reading': 'book'
        };
        return icons[style] || 'brain';
    }
    
    getLearningStyleDescription(style) {
        const descriptions = {
            'visual': 'You learn best through diagrams, charts, and visual representations',
            'auditory': 'You prefer listening to explanations and benefit from audio content',
            'kinesthetic': 'You learn by doing and prefer hands-on interactive exercises',
            'reading': 'You excel at learning through written text and documentation'
        };
        return descriptions[style] || 'Balanced learning approach';
    }
    
    async personalizeSegment(segmentId) {
        try {
            const response = await fetch('/api/v1/adaptive/personalize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: AppState.currentUser.id,
                    segment_id: segmentId
                })
            });
            
            const personalization = await response.json();
            
            // Apply personalizations to the segment
            this.applyPersonalizations(personalization);
            
            return personalization;
            
        } catch (error) {
            console.error('Failed to personalize segment:', error);
            return null;
        }
    }
    
    applyPersonalizations(personalization) {
        const adaptations = personalization.adaptations;
        
        adaptations.forEach(adaptation => {
            switch (adaptation.type) {
                case 'visual_enhancement':
                    this.enhanceVisuals(adaptation.suggestions);
                    break;
                    
                case 'audio_enhancement':
                    this.enhanceAudio(adaptation.suggestions);
                    break;
                    
                case 'interactive_enhancement':
                    this.enhanceInteractivity(adaptation.suggestions);
                    break;
                    
                case 'difficulty_adjustment':
                    this.adjustDifficulty(adaptation);
                    break;
                    
                case 'remediation':
                    this.addRemediation(adaptation);
                    break;
            }
        });
        
        // Show personalization indicator
        this.showPersonalizationIndicator(adaptations);
    }
    
    enhanceVisuals(suggestions) {
        // Add visual enhancement indicators
        const container = document.getElementById('segmentContainer');
        if (!container) return;
        
        const visualNote = document.createElement('div');
        visualNote.className = 'personalization-note visual';
        visualNote.innerHTML = `
            <i class="fas fa-eye"></i>
            <span>Enhanced for visual learning</span>
        `;
        container.prepend(visualNote);
    }
    
    enhanceAudio(suggestions) {
        // Adjust audio settings
        if (audioManager) {
            // Emphasize audio narration
            audioManager.setVolume(1.0);
            audioManager.enableAutoPlay(true);
        }
        
        const audioNote = document.createElement('div');
        audioNote.className = 'personalization-note audio';
        audioNote.innerHTML = `
            <i class="fas fa-headphones"></i>
            <span>Optimized for auditory learning</span>
        `;
        document.getElementById('segmentContainer')?.prepend(audioNote);
    }
    
    enhanceInteractivity(suggestions) {
        // Add extra interactive elements
        const interactiveNote = document.createElement('div');
        interactiveNote.className = 'personalization-note interactive';
        interactiveNote.innerHTML = `
            <i class="fas fa-hand-pointer"></i>
            <span>Extra interactions added for hands-on learning</span>
        `;
        document.getElementById('segmentContainer')?.prepend(interactiveNote);
    }
    
    adjustDifficulty(adaptation) {
        const { current, target, suggestions } = adaptation;
        
        // Show difficulty adjustment notification
        showToast(`Content adjusted from ${current} to ${target} level`, 'info');
        
        // Apply specific adjustments
        if (target === 'beginner' && current !== 'beginner') {
            // Simplify content
            this.simplifyContent();
        } else if (target === 'advanced' && current !== 'advanced') {
            // Add complexity
            this.addComplexity();
        }
    }
    
    addRemediation(adaptation) {
        const { concepts, suggestions } = adaptation;
        
        // Create remediation panel
        const remediationPanel = document.createElement('div');
        remediationPanel.className = 'remediation-panel';
        remediationPanel.innerHTML = `
            <div class="remediation-header">
                <i class="fas fa-info-circle"></i>
                <span>Review recommended for: ${concepts.join(', ')}</span>
            </div>
            <div class="remediation-actions">
                <button onclick="adaptiveLearning.startRemediation('${concepts.join(',')}')">
                    Review Now
                </button>
                <button onclick="this.closest('.remediation-panel').remove()">
                    Continue
                </button>
            </div>
        `;
        
        document.getElementById('segmentContainer')?.prepend(remediationPanel);
    }
    
    showPersonalizationIndicator(adaptations) {
        const indicator = document.createElement('div');
        indicator.className = 'personalization-indicator';
        indicator.innerHTML = `
            <i class="fas fa-magic"></i>
            <span>${adaptations.length} personalizations applied</span>
        `;
        
        document.getElementById('segmentContainer')?.appendChild(indicator);
        
        // Auto-hide after 3 seconds
        setTimeout(() => indicator.style.opacity = '0.5', 3000);
    }
    
    async trackPerformance(segmentId, interactionData) {
        // Track local performance
        this.performanceTracker.recordInteraction(segmentId, interactionData);
        
        // Check if difficulty adjustment needed
        const performance = this.performanceTracker.getSegmentPerformance(segmentId);
        
        if (performance.interactions >= 3) {
            // Send performance data for difficulty adjustment
            const response = await fetch('/api/v1/adaptive/adjust-difficulty', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: AppState.currentUser.id,
                    segment_id: segmentId,
                    performance: performance
                })
            });
            
            const adjustments = await response.json();
            
            if (adjustments.next_difficulty !== 'maintain') {
                this.showDifficultyAdjustment(adjustments);
            }
        }
    }
    
    showDifficultyAdjustment(adjustments) {
        const message = adjustments.next_difficulty === 'easier' 
            ? "We'll slow down a bit - you're doing great!"
            : "Great job! Let's challenge you a bit more!";
            
        showToast(message, 'info');
    }
    
    async generateLearningPath(courseId) {
        try {
            const response = await fetch(`/api/v1/adaptive/learning-path/${courseId}?user_id=${AppState.currentUser.id}`);
            const data = await response.json();
            
            this.currentPath = data.learning_path;
            this.displayLearningPath();
            
        } catch (error) {
            console.error('Failed to generate learning path:', error);
        }
    }
    
    displayLearningPath() {
        if (!this.currentPath) return;
        
        const pathViewer = document.createElement('div');
        pathViewer.className = 'learning-path-viewer';
        pathViewer.innerHTML = `
            <div class="path-header">
                <h3>Your Personalized Learning Path</h3>
                <button class="path-close" onclick="this.closest('.learning-path-viewer').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="path-content">
                ${this.currentPath.map((item, index) => this.renderPathItem(item, index)).join('')}
            </div>
            <div class="path-summary">
                <p>Total estimated time: ${this.calculateTotalTime()} minutes</p>
                <p>Episodes to study: ${this.currentPath.filter(i => i.action === 'study').length}</p>
                <p>Episodes to skip: ${this.currentPath.filter(i => i.action === 'skip').length}</p>
            </div>
        `;
        
        document.body.appendChild(pathViewer);
    }
    
    renderPathItem(item, index) {
        if (item.action === 'skip') {
            return `
                <div class="path-item skip">
                    <div class="path-number">${index + 1}</div>
                    <div class="path-details">
                        <h4>Episode: ${item.episode_id}</h4>
                        <p class="skip-reason">Skip: ${item.reason}</p>
                    </div>
                    <i class="fas fa-forward"></i>
                </div>
            `;
        }
        
        return `
            <div class="path-item study">
                <div class="path-number">${index + 1}</div>
                <div class="path-details">
                    <h4>Episode: ${item.episode_id}</h4>
                    <p>Estimated time: ${item.estimated_time} minutes</p>
                    <div class="path-adaptations">
                        <span class="adaptation-tag">${item.adaptations.pace} pace</span>
                        <span class="adaptation-tag">${item.adaptations.depth} depth</span>
                        <span class="adaptation-tag">${item.adaptations.interaction_level} interaction</span>
                    </div>
                    ${item.focus_segments.length > 0 ? `
                        <p class="focus-note">Focus on ${item.focus_segments.length} key segments</p>
                    ` : ''}
                </div>
                <i class="fas fa-play-circle"></i>
            </div>
        `;
    }
    
    calculateTotalTime() {
        return this.currentPath
            .filter(i => i.action === 'study')
            .reduce((sum, item) => sum + item.estimated_time, 0);
    }
    
    // Spaced Repetition Features
    async checkDueReviews(userId) {
        try {
            const response = await fetch(`/api/v1/spaced-repetition/due-reviews/${userId}`);
            const data = await response.json();
            
            if (data.total > 0) {
                this.showReviewNotification(data.total);
            }
            
        } catch (error) {
            console.error('Failed to check due reviews:', error);
        }
    }
    
    showReviewNotification(count) {
        const notification = document.createElement('div');
        notification.className = 'review-notification';
        notification.innerHTML = `
            <i class="fas fa-bell"></i>
            <span>You have ${count} concepts due for review</span>
            <button onclick="adaptiveLearning.startReviewSession()">
                Review Now
            </button>
            <button onclick="this.closest('.review-notification').remove()">
                Later
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-hide after 10 seconds
        setTimeout(() => notification.remove(), 10000);
    }
    
    async startReviewSession() {
        try {
            showLoading(true);
            
            const response = await fetch('/api/v1/spaced-repetition/generate-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: AppState.currentUser.id,
                    max_items: 20
                })
            });
            
            this.reviewSession = await response.json();
            this.displayReviewSession();
            
        } catch (error) {
            showToast('Failed to start review session', 'error');
        } finally {
            showLoading(false);
        }
    }
    
    displayReviewSession() {
        if (!this.reviewSession || this.reviewSession.session_type === 'no_reviews') {
            showToast('No concepts due for review!', 'success');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal review-session-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Spaced Review Session</h3>
                    <div class="session-info">
                        <span>${this.reviewSession.total_items} items</span>
                        <span>~${this.reviewSession.estimated_time} minutes</span>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="review-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 0%"></div>
                        </div>
                        <span class="progress-text">0 / ${this.reviewSession.total_items}</span>
                    </div>
                    <div class="review-content" id="reviewContent">
                        <!-- Review items will be displayed here -->
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="adaptiveLearning.skipReview()" class="secondary-btn">
                        Skip Review
                    </button>
                    <button onclick="adaptiveLearning.nextReviewItem()" class="primary-btn">
                        Start Review
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Initialize review
        this.currentReviewIndex = -1;
        this.reviewResults = [];
    }
    
    nextReviewItem() {
        this.currentReviewIndex++;
        
        if (this.currentReviewIndex >= this.reviewSession.items.length) {
            this.completeReviewSession();
            return;
        }
        
        const item = this.reviewSession.items[this.currentReviewIndex];
        this.displayReviewItem(item);
        
        // Update progress
        const progress = ((this.currentReviewIndex + 1) / this.reviewSession.total_items) * 100;
        document.querySelector('.review-session-modal .progress-fill').style.width = `${progress}%`;
        document.querySelector('.review-session-modal .progress-text').textContent = 
            `${this.currentReviewIndex + 1} / ${this.reviewSession.total_items}`;
    }
    
    displayReviewItem(item) {
        const content = document.getElementById('reviewContent');
        content.innerHTML = `
            <div class="review-item">
                <h4>Review: ${item.concept}</h4>
                <p class="last-seen">Last reviewed: ${this.formatDate(item.last_seen)}</p>
                
                <div class="segment-options">
                    <h5>Choose a segment to review this concept:</h5>
                    ${item.segment_options.map((seg, index) => `
                        <div class="segment-option" onclick="adaptiveLearning.selectReviewSegment(${index})">
                            <span class="segment-type">${seg.segment_type.replace(/_/g, ' ')}</span>
                            <p>${seg.preview}</p>
                        </div>
                    `).join('')}
                </div>
                
                <div class="review-actions" style="display: none;">
                    <h5>How well did you remember this concept?</h5>
                    <div class="performance-buttons">
                        <button onclick="adaptiveLearning.ratePerformance(0.2)" class="perf-btn poor">
                            <i class="fas fa-times"></i> Forgot
                        </button>
                        <button onclick="adaptiveLearning.ratePerformance(0.5)" class="perf-btn fair">
                            <i class="fas fa-minus"></i> Struggled
                        </button>
                        <button onclick="adaptiveLearning.ratePerformance(0.8)" class="perf-btn good">
                            <i class="fas fa-check"></i> Remembered
                        </button>
                        <button onclick="adaptiveLearning.ratePerformance(1.0)" class="perf-btn excellent">
                            <i class="fas fa-star"></i> Perfect
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    selectReviewSegment(index) {
        // Hide segment options, show performance rating
        document.querySelector('.segment-options').style.display = 'none';
        document.querySelector('.review-actions').style.display = 'block';
        
        // Load the selected segment content
        const item = this.reviewSession.items[this.currentReviewIndex];
        const segment = item.segment_options[index];
        
        // Could load full segment content here
        showToast(`Reviewing segment: ${segment.segment_type}`, 'info');
    }
    
    async ratePerformance(score) {
        const item = this.reviewSession.items[this.currentReviewIndex];
        
        // Record the result
        this.reviewResults.push({
            concept: item.concept,
            performance: score
        });
        
        // Schedule next review
        try {
            await fetch('/api/v1/spaced-repetition/schedule-review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    concept: item.concept,
                    user_id: AppState.currentUser.id,
                    performance: score
                })
            });
        } catch (error) {
            console.error('Failed to schedule review:', error);
        }
        
        // Move to next item
        this.nextReviewItem();
    }
    
    completeReviewSession() {
        // Calculate statistics
        const avgPerformance = this.reviewResults.reduce((sum, r) => sum + r.performance, 0) / this.reviewResults.length;
        const perfect = this.reviewResults.filter(r => r.performance === 1.0).length;
        const struggled = this.reviewResults.filter(r => r.performance < 0.6).length;
        
        // Show completion screen
        const content = document.getElementById('reviewContent');
        content.innerHTML = `
            <div class="review-complete">
                <i class="fas fa-trophy fa-3x"></i>
                <h3>Review Session Complete!</h3>
                
                <div class="review-stats">
                    <div class="stat">
                        <div class="stat-value">${this.reviewResults.length}</div>
                        <div class="stat-label">Concepts Reviewed</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${Math.round(avgPerformance * 100)}%</div>
                        <div class="stat-label">Average Score</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${perfect}</div>
                        <div class="stat-label">Perfect Recalls</div>
                    </div>
                </div>
                
                ${struggled > 0 ? `
                    <p class="review-note">
                        ${struggled} concepts need more practice. They'll appear sooner in your next review.
                    </p>
                ` : ''}
                
                <button onclick="document.querySelector('.review-session-modal').remove()" class="primary-btn">
                    Continue Learning
                </button>
            </div>
        `;
    }
    
    skipReview() {
        if (confirm('Are you sure you want to skip this review session?')) {
            document.querySelector('.review-session-modal').remove();
        }
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        
        return date.toLocaleDateString();
    }
    
    // Utility methods
    simplifyContent() {
        // Add visual cues for simplified content
        const segments = document.querySelectorAll('.segment-content p');
        segments.forEach(segment => {
            // Break long sentences
            const text = segment.textContent;
            if (text.length > 100) {
                const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
                segment.innerHTML = sentences.map(s => `<span class="simplified-sentence">${s.trim()}</span>`).join(' ');
            }
        });
        
        // Add tooltips for complex terms
        this.addGlossaryTooltips();
    }
    
    addComplexity() {
        // Add advanced information panels
        const advancedPanel = document.createElement('div');
        advancedPanel.className = 'advanced-info-panel';
        advancedPanel.innerHTML = `
            <div class="panel-header">
                <i class="fas fa-graduation-cap"></i>
                <span>Advanced Details</span>
            </div>
            <div class="panel-content">
                <p>Additional technical details and edge cases are available for this topic.</p>
                <button onclick="adaptiveLearning.loadAdvancedContent()">
                    Explore Advanced Content
                </button>
            </div>
        `;
        
        document.getElementById('segmentContainer')?.appendChild(advancedPanel);
    }
    
    addGlossaryTooltips() {
        // Add tooltips for technical terms
        const technicalTerms = ['algorithm', 'optimization', 'latency', 'throughput', 'scalability'];
        const content = document.getElementById('segmentContainer');
        
        if (!content) return;
        
        technicalTerms.forEach(term => {
            const regex = new RegExp(`\\b${term}\\b`, 'gi');
            content.innerHTML = content.innerHTML.replace(regex, 
                `<span class="glossary-term" title="Click for definition">${term}</span>`);
        });
    }
    
    startRemediation(conceptsStr) {
        const concepts = conceptsStr.split(',');
        showToast(`Starting remediation for: ${concepts.join(', ')}`, 'info');
        
        // In a real implementation, this would load remediation content
        // For now, just show a message
    }
    
    loadAdvancedContent() {
        showToast('Loading advanced content...', 'info');
        // Implementation would load additional advanced segments
    }
}

// Performance Tracker
class PerformanceTracker {
    constructor() {
        this.interactions = new Map();
    }
    
    recordInteraction(segmentId, data) {
        if (!this.interactions.has(segmentId)) {
            this.interactions.set(segmentId, []);
        }
        
        this.interactions.get(segmentId).push({
            timestamp: Date.now(),
            ...data
        });
    }
    
    getSegmentPerformance(segmentId) {
        const segmentInteractions = this.interactions.get(segmentId) || [];
        
        if (segmentInteractions.length === 0) {
            return { interactions: 0 };
        }
        
        const totalTime = segmentInteractions.reduce((sum, i) => sum + (i.time_taken || 0), 0);
        const completed = segmentInteractions.filter(i => i.completed).length;
        const errors = segmentInteractions.reduce((sum, i) => sum + (i.errors || 0), 0);
        
        return {
            interactions: segmentInteractions.length,
            time_taken: totalTime / segmentInteractions.length,
            interactions_completed: completed,
            interactions_total: segmentInteractions.length,
            errors: errors / segmentInteractions.length
        };
    }
}

// Initialize adaptive learning manager
const adaptiveLearning = new AdaptiveLearningManager();

// Integrate with existing episode player
if (typeof episodePlayer !== 'undefined') {
    const originalLoadSegment = episodePlayer.loadSegment.bind(episodePlayer);
    episodePlayer.loadSegment = async function(index) {
        await originalLoadSegment(index);
        
        // Personalize the segment
        const segment = this.segments[index];
        if (segment && adaptiveLearning.profile) {
            await adaptiveLearning.personalizeSegment(segment.id);
        }
    };
}

// Add styles for adaptive learning components
const style = document.createElement('style');
style.textContent = `
/* Learning Profile Widget */
.learning-profile-widget {
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1rem;
}

.profile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.profile-header h4 {
    margin: 0;
    font-size: 1rem;
}

.profile-details-btn {
    background: none;
    border: none;
    color: var(--primary-color);
    cursor: pointer;
    font-size: 1.2rem;
}

.profile-summary {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
}

.profile-item {
    display: flex;
    flex-direction: column;
}

.profile-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
}

.profile-value {
    font-weight: 600;
    color: var(--primary-color);
}

/* Personalization Notes */
.personalization-note {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--glass-bg);
    border-left: 3px solid var(--primary-color);
    margin-bottom: 1rem;
    border-radius: 4px;
}

.personalization-note i {
    color: var(--primary-color);
}

.personalization-indicator {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--primary-color);
    color: white;
    border-radius: 20px;
    font-size: 0.875rem;
    transition: opacity 0.3s ease;
}

/* Learning Path Viewer */
.learning-path-viewer {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    background: var(--bg-color);
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    overflow: hidden;
    z-index: 1000;
}

.path-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--glass-border);
}

.path-content {
    padding: 1.5rem;
    max-height: 50vh;
    overflow-y: auto;
}

.path-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    margin-bottom: 1rem;
    background: var(--glass-bg);
    border-radius: 12px;
    border: 1px solid var(--glass-border);
}

.path-item.skip {
    opacity: 0.6;
}

.path-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: var(--primary-color);
    color: white;
    border-radius: 50%;
    font-weight: bold;
}

.path-details {
    flex: 1;
}

.path-details h4 {
    margin: 0 0 0.5rem 0;
}

.path-adaptations {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.adaptation-tag {
    padding: 0.25rem 0.5rem;
    background: var(--primary-color-light);
    color: var(--primary-color);
    border-radius: 4px;
    font-size: 0.75rem;
}

/* Review Session */
.review-notification {
    position: fixed;
    top: 2rem;
    right: 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: var(--bg-color);
    border: 1px solid var(--primary-color);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    z-index: 1000;
    animation: slideIn 0.3s ease;
}

.review-session-modal .modal-content {
    width: 90%;
    max-width: 700px;
}

.session-info {
    display: flex;
    gap: 1rem;
    color: var(--text-secondary);
    font-size: 0.875rem;
}

.review-progress {
    margin-bottom: 2rem;
}

.review-item h4 {
    margin-bottom: 0.5rem;
    color: var(--primary-color);
}

.last-seen {
    color: var(--text-secondary);
    font-size: 0.875rem;
    margin-bottom: 1rem;
}

.segment-options {
    margin: 1.5rem 0;
}

.segment-option {
    padding: 1rem;
    margin-bottom: 0.5rem;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.segment-option:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
}

.performance-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1rem;
}

.perf-btn {
    padding: 1rem 1.5rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
}

.perf-btn.poor {
    background: #ff4444;
    color: white;
}

.perf-btn.fair {
    background: #ff8844;
    color: white;
}

.perf-btn.good {
    background: #44bb44;
    color: white;
}

.perf-btn.excellent {
    background: #4444ff;
    color: white;
}

.review-complete {
    text-align: center;
    padding: 2rem;
}

.review-stats {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin: 2rem 0;
}

.stat {
    text-align: center;
}

.stat-value {
    font-size: 2rem;
    font-weight: bold;
    color: var(--primary-color);
}

.stat-label {
    color: var(--text-secondary);
    font-size: 0.875rem;
}

/* Remediation Panel */
.remediation-panel {
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
}

.remediation-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.remediation-actions {
    display: flex;
    gap: 1rem;
}

/* Profile Modal */
.preference-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.preference-card {
    padding: 1.5rem;
    background: var(--glass-bg);
    border: 2px solid var(--glass-border);
    border-radius: 12px;
    text-align: center;
}

.preference-card.visual { border-color: #6366f1; }
.preference-card.auditory { border-color: #8b5cf6; }
.preference-card.kinesthetic { border-color: #ec4899; }
.preference-card.reading { border-color: #10b981; }

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-top: 1rem;
}

.metric-card {
    padding: 1.5rem;
    background: var(--glass-bg);
    border-radius: 12px;
    text-align: center;
}

.metric-value {
    font-size: 2rem;
    font-weight: bold;
    color: var(--primary-color);
}

.metric-label {
    color: var(--text-secondary);
    font-size: 0.875rem;
    margin-top: 0.5rem;
}

.skills-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-top: 1rem;
}

.skill-list {
    list-style: none;
    padding: 0;
}

.skill-list li {
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    background: var(--glass-bg);
    border-radius: 8px;
}

.skill-list.strengths li {
    border-left: 3px solid #10b981;
}

.skill-list.weaknesses li {
    border-left: 3px solid #f59e0b;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
`;
document.head.appendChild(style);