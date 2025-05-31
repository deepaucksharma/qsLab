/**
 * Neural Learn Course Platform - Core JavaScript Implementation
 * Handles course navigation, content rendering, and user interactions
 */

// Global application state
const AppState = {
    currentUser: {
        id: 'user_' + Date.now(), // Temporary user ID
        name: 'Guest User',
        points: 0,
        badges: []
    },
    currentCourse: null,
    currentLesson: null,
    currentEpisode: null,
    currentSegment: null,
    currentSegmentIndex: 0,
    courseStructure: null,
    userProgress: null,
    audioState: {
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        speed: 1
    },
    settings: {
        autoAdvance: true,
        audioSpeed: 1
    }
};

// Event Bus for component communication
class EventBus {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }
    
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
}

const eventBus = new EventBus();

// API Service Layer
class APIService {
    constructor() {
        this.baseURL = 'http://localhost:5000/api';
    }
    
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                // Try to parse error response as JSON
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    // If not JSON, use status text
                    errorData = { error: response.statusText };
                }
                
                const error = new Error(`API Error: ${response.status}`);
                error.status = response.status;
                error.data = errorData;
                throw error;
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }
    
    // Course APIs
    async fetchCourses() {
        return this.request('/courses');
    }
    
    async fetchCourseDetails(courseId) {
        return this.request(`/courses/${courseId}?user_id=${AppState.currentUser.id}`);
    }
    
    async fetchCourseStructure(courseId) {
        return this.request(`/courses/${courseId}/structure`);
    }
    
    // Episode APIs
    async fetchEpisode(episodeId) {
        return this.request(`/episodes/${episodeId}`);
    }
    
    async canAccessEpisode(episodeId) {
        return this.request(`/episodes/${episodeId}/can-access?user_id=${AppState.currentUser.id}`);
    }
    
    async submitCheckpoint(episodeId, answers) {
        return this.request(`/episodes/${episodeId}/checkpoint`, {
            method: 'POST',
            body: JSON.stringify({
                userId: AppState.currentUser.id,
                answers
            })
        });
    }
    
    // Segment APIs
    async markSegmentComplete(segmentId) {
        return this.request(`/segments/${segmentId}/complete`, {
            method: 'POST',
            body: JSON.stringify({
                userId: AppState.currentUser.id
            })
        });
    }
    
    async logInteraction(segmentId, interactionData) {
        return this.request(`/segments/${segmentId}/interaction`, {
            method: 'POST',
            body: JSON.stringify({
                userId: AppState.currentUser.id,
                ...interactionData
            })
        });
    }
    
    // Audio APIs
    async generateSegmentAudio(segmentId, text) {
        return this.request('/generate-segment-audio', {
            method: 'POST',
            body: JSON.stringify({
                segmentId,
                text,
                language: 'en'
            })
        });
    }
    
    async checkAudioStatus(taskId) {
        return this.request(`/audio-status/${taskId}`);
    }
    
    // Interaction logging
    async logInteraction(segmentId, interactionData) {
        return this.request('/interactions/log', {
            method: 'POST',
            body: JSON.stringify({
                segmentId,
                interactionData
            })
        });
    }
    
    // Progress APIs
    async getUserProgress(courseId) {
        return this.request(`/users/${AppState.currentUser.id}/progress?course_id=${courseId}`);
    }
}

const api = new APIService();

// Make API globally available for other components
window.api = api;

// Course Navigator
class CourseNavigator {
    constructor() {
        this.coursesGrid = document.getElementById('coursesGrid');
        this.courseSelectionView = document.getElementById('courseSelectionView');
        this.episodePlayerView = document.getElementById('episodePlayerView');
        this.courseSidebar = document.getElementById('courseSidebar');
        this.courseStructureEl = document.getElementById('courseStructure');
        this.breadcrumbNav = document.getElementById('breadcrumbNav');
    }
    
    async initialize() {
        await this.loadCourses();
        this.setupEventListeners();
    }
    
    async loadCourses() {
        try {
            showLoading(true);
            const courses = await api.fetchCourses();
            this.renderCourses(courses);
        } catch (error) {
            showToast('Failed to load courses', 'error');
        } finally {
            showLoading(false);
        }
    }
    
    renderCourses(courses) {
        // Use DOM optimizer for efficient rendering if available
        if (window.domOptimizer) {
            window.domOptimizer.renderList(
                this.coursesGrid,
                courses,
                (course) => {
                    const card = document.createElement('div');
                    card.className = 'course-card';
                    card.dataset.courseId = course.id;
                    card.innerHTML = `
                        <div class="course-icon">
                            <i class="fas fa-book"></i>
                        </div>
                        <h3 class="course-title">${course.title}</h3>
                        <p class="course-description">${course.description || 'No description available'}</p>
                        <div class="course-stats">
                            <div class="course-stat">
                                <span class="stat-label">Lessons</span>
                                <span class="stat-value">${course.lessonCount || 0}</span>
                            </div>
                            <div class="course-stat">
                                <span class="stat-label">Duration</span>
                                <span class="stat-value">${course.totalEstimatedDuration || 'N/A'}</span>
                            </div>
                        </div>
                    `;
                    return card;
                },
                { batchSize: 5, delay: 0 }
            );
        } else {
            // Fallback to original implementation
            this.coursesGrid.innerHTML = courses.map(course => `
                <div class="course-card" data-course-id="${course.id}">
                    <div class="course-icon">
                        <i class="fas fa-book"></i>
                    </div>
                    <h3 class="course-title">${course.title}</h3>
                    <p class="course-description">${course.description || 'No description available'}</p>
                    <div class="course-stats">
                        <div class="course-stat">
                            <span class="stat-label">Lessons</span>
                            <span class="stat-value">${course.lessonCount || 0}</span>
                        </div>
                        <div class="course-stat">
                            <span class="stat-label">Duration</span>
                            <span class="stat-value">${course.totalEstimatedDuration || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Add click handlers
            this.coursesGrid.querySelectorAll('.course-card').forEach(card => {
                card.addEventListener('click', () => this.selectCourse(card.dataset.courseId));
            });
        }
    }
    
    async selectCourse(courseId) {
        try {
            showLoading(true);
            
            // Fetch course details and structure
            const [courseDetails, courseStructure] = await Promise.all([
                api.fetchCourseDetails(courseId),
                api.fetchCourseStructure(courseId)
            ]);
            
            AppState.currentCourse = courseDetails;
            AppState.courseStructure = courseStructure;
            
            // Update UI
            this.renderCourseStructure(courseStructure);
            this.updateBreadcrumb([courseDetails.title]);
            
            // Switch views
            this.courseSelectionView.classList.remove('active');
            this.episodePlayerView.classList.add('active');
            
            // Load first available episode
            const firstEpisode = this.findFirstAvailableEpisode(courseStructure);
            if (firstEpisode) {
                await episodePlayer.loadEpisode(firstEpisode.episodeId);
            }
            
            // Update progress display
            this.updateProgressDisplay(courseDetails.userProgress);
            
        } catch (error) {
            showToast('Failed to load course', 'error');
        } finally {
            showLoading(false);
        }
    }
    
    renderCourseStructure(structure) {
        this.courseStructureEl.innerHTML = structure.lessons.map(lesson => `
            <div class="lesson-group" data-lesson-id="${lesson.lessonId}">
                <div class="lesson-header">
                    <div>
                        <div class="lesson-title">${lesson.title}</div>
                        <div class="lesson-progress">0/${lesson.episodes.length} episodes</div>
                    </div>
                    <i class="fas fa-chevron-right lesson-toggle"></i>
                </div>
                <div class="episode-list">
                    ${lesson.episodes.map(episode => `
                        <div class="episode-item" data-episode-id="${episode.episodeId}">
                            <div class="episode-status">
                                <i class="fas fa-lock"></i>
                            </div>
                            <div class="episode-info">
                                <div class="episode-title">${episode.title}</div>
                                <div class="episode-meta">${episode.segmentCount} segments</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
        
        // Add interaction handlers
        this.setupStructureInteractions();
    }
    
    setupStructureInteractions() {
        // Lesson expand/collapse
        this.courseStructureEl.querySelectorAll('.lesson-header').forEach(header => {
            header.addEventListener('click', () => {
                header.classList.toggle('expanded');
                header.nextElementSibling.classList.toggle('expanded');
            });
        });
        
        // Episode selection
        this.courseStructureEl.querySelectorAll('.episode-item').forEach(item => {
            item.addEventListener('click', async () => {
                const episodeId = item.dataset.episodeId;
                await episodePlayer.loadEpisode(episodeId);
            });
        });
    }
    
    updateBreadcrumb(path) {
        this.breadcrumbNav.innerHTML = ['Courses', ...path].map((item, index) => `
            <span class="breadcrumb-item ${index < path.length ? 'clickable' : ''}">${item}</span>
        `).join('');
    }
    
    updateProgressDisplay(progress) {
        if (progress) {
            document.getElementById('userPoints').textContent = progress.pointsEarned;
            document.getElementById('badgeCount').textContent = progress.badgesEarned.length;
            
            const percent = Math.round((progress.completedEpisodes / AppState.courseStructure.lessons.reduce((sum, l) => sum + l.episodes.length, 0)) * 100);
            document.getElementById('courseProgressFill').style.width = `${percent}%`;
            document.getElementById('progressPercent').textContent = percent;
        }
    }
    
    findFirstAvailableEpisode(structure) {
        for (const lesson of structure.lessons) {
            for (const episode of lesson.episodes) {
                return episode;
            }
        }
        return null;
    }
    
    setupEventListeners() {
        // Menu toggle
        document.getElementById('menuToggle').addEventListener('click', () => {
            this.courseSidebar.classList.toggle('collapsed');
        });
        
        // Sidebar close
        document.getElementById('sidebarClose').addEventListener('click', () => {
            this.courseSidebar.classList.add('collapsed');
        });
        
        // Back to courses
        document.getElementById('backToCoursesBtn').addEventListener('click', () => {
            this.episodePlayerView.classList.remove('active');
            this.courseSelectionView.classList.add('active');
            AppState.currentCourse = null;
        });
    }
}

// Episode Player
class EpisodePlayer {
    constructor() {
        this.episodeTitle = document.getElementById('episodeTitle');
        this.episodeDuration = document.getElementById('episodeDuration');
        this.currentSegmentEl = document.getElementById('currentSegment');
        this.totalSegmentsEl = document.getElementById('totalSegments');
        this.segmentContainer = document.getElementById('segmentContainer');
        this.prevBtn = document.getElementById('prevSegmentBtn');
        this.nextBtn = document.getElementById('nextSegmentBtn');
        
        this.segments = [];
        this.currentSegmentIndex = 0;
    }
    
    async loadEpisode(episodeId) {
        try {
            showLoading(true);
            
            // Check access
            const canAccess = await api.canAccessEpisode(episodeId);
            if (!canAccess.canAccess) {
                showToast(canAccess.reason || 'Cannot access this episode', 'error');
                return;
            }
            
            // Load episode data
            const episode = await api.fetchEpisode(episodeId);
            AppState.currentEpisode = episode;
            AppState.currentSegmentIndex = 0;
            
            this.segments = episode.segments;
            this.currentSegmentIndex = 0;
            
            // Update UI
            this.episodeTitle.textContent = episode.title;
            this.episodeDuration.textContent = `Duration: ${episode.estimatedDuration}`;
            this.totalSegmentsEl.textContent = this.segments.length;
            
            // Load first segment
            await this.loadSegment(0);
            
            // Update navigation
            this.updateNavigation();
            
        } catch (error) {
            showToast('Failed to load episode', 'error');
        } finally {
            showLoading(false);
        }
    }
    
    async loadSegment(index) {
        if (index < 0 || index >= this.segments.length) return;
        
        const startTime = Date.now();
        this.currentSegmentIndex = index;
        AppState.currentSegmentIndex = index;
        const segment = this.segments[index];
        AppState.currentSegment = segment;
        
        // Update UI
        this.currentSegmentEl.textContent = index + 1;
        
        // Show skeleton loader while rendering
        if (window.loadingManager && window.FEATURES?.SKELETON_LOADERS) {
            window.loadingManager.showSkeleton(this.segmentContainer, 'segment');
        }
        
        // Render segment
        await segmentRenderer.render(segment);
        
        // Generate audio if needed
        if (segment.textContent) {
            audioManager.loadSegmentAudio(segment);
        }
        
        // Prefetch assets for upcoming segments
        if (window.assetManager && window.FEATURES?.ASSET_PRELOADING) {
            window.assetManager.prefetchSegmentAssets(this.segments, index);
        }
        
        // Update navigation
        this.updateNavigation();
        
        // Track segment view in analytics
        if (window.analytics) {
            window.analytics.trackSegmentView(segment.id, 0);
            window.analytics.trackEvent('segment_load', {
                segmentId: segment.id,
                segmentType: segment.segmentType,
                episodeId: AppState.currentEpisode?.id,
                courseId: AppState.currentCourse?.id,
                loadTime: Date.now() - startTime
            });
        }
        
        // Log segment view
        eventBus.emit('segment:viewed', { segment });
    }
    
    updateNavigation() {
        this.prevBtn.disabled = this.currentSegmentIndex === 0;
        this.nextBtn.disabled = this.currentSegmentIndex === this.segments.length - 1;
    }
    
    async nextSegment() {
        if (this.currentSegmentIndex < this.segments.length - 1) {
            // Mark current segment as complete
            const currentSegment = this.segments[this.currentSegmentIndex];
            await this.completeSegment(currentSegment);
            
            // Load next segment
            await this.loadSegment(this.currentSegmentIndex + 1);
        } else {
            // Episode complete
            this.completeEpisode();
        }
    }
    
    async prevSegment() {
        if (this.currentSegmentIndex > 0) {
            await this.loadSegment(this.currentSegmentIndex - 1);
        }
    }
    
    async completeSegment(segment) {
        try {
            const result = await api.markSegmentComplete(segment.id);
            
            if (result.success) {
                // Update points
                AppState.currentUser.points = result.totalPoints;
                document.getElementById('userPoints').textContent = result.totalPoints;
                
                // Show points earned
                if (result.pointsEarned > 0) {
                    showToast(`+${result.pointsEarned} points earned!`, 'success');
                }
                
                // Track segment completion in analytics
                if (window.analytics) {
                    window.analytics.trackEvent('segment_complete', {
                        segmentId: segment.id,
                        segmentType: segment.segmentType,
                        episodeId: AppState.currentEpisode?.id,
                        courseId: AppState.currentCourse?.id,
                        pointsEarned: result.pointsEarned,
                        totalPoints: result.totalPoints
                    });
                }
                
                // Check if episode completed
                if (result.episodeCompleted) {
                    eventBus.emit('episode:completed', { episodeId: AppState.currentEpisode.id });
                    
                    // Track episode completion
                    if (window.analytics) {
                        window.analytics.trackEvent('episode_complete', {
                            episodeId: AppState.currentEpisode.id,
                            courseId: AppState.currentCourse?.id
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Failed to mark segment complete:', error);
        }
    }
    
    async completeEpisode() {
        // Check if there's a checkpoint
        if (AppState.currentEpisode.checkpointId) {
            checkpointManager.showCheckpoint(AppState.currentEpisode);
        } else {
            // Show completion message
            showToast('Episode completed! 🎉', 'success');
            
            // Check for badge
            if (AppState.currentEpisode.badgeOnCompletion) {
                this.showBadgeEarned(AppState.currentEpisode.badgeOnCompletion);
            }
        }
    }
    
    showBadgeEarned(badgeId) {
        const badgeModal = document.getElementById('badgeModal');
        document.getElementById('badgeName').textContent = 'Achievement Unlocked!';
        document.getElementById('badgeDescription').textContent = 'You\'ve completed this episode!';
        badgeModal.classList.remove('hidden');
    }
    
    setupEventListeners() {
        this.prevBtn.addEventListener('click', () => this.prevSegment());
        this.nextBtn.addEventListener('click', () => this.nextSegment());
        
        // Badge modal close
        document.getElementById('closeBadgeModal').addEventListener('click', () => {
            document.getElementById('badgeModal').classList.add('hidden');
        });
    }
}

// Segment Renderer
class SegmentRenderer {
    constructor() {
        this.container = document.getElementById('segmentContainer');
        // Use the comprehensive segment renderers if available
        if (window.SegmentRenderers) {
            this.segmentRenderers = new window.SegmentRenderers();
        }
        
        // Define basic renderers as fallback
        this.renderers = {
            'course_opening': this.renderCourseOpening.bind(this),
            'instructor_introduction': this.renderInstructorIntro.bind(this),
            'concept_explanation': this.renderConceptExplanation.bind(this),
            'historical_context': this.renderHistoricalContext.bind(this),
            'technical_introduction': this.renderTechnicalIntro.bind(this),
            'code_walkthrough': this.renderCodeWalkthrough.bind(this),
            'metric_deep_dive': this.renderMetricDeepDive.bind(this),
            'default': this.renderDefault.bind(this)
        };
    }
    
    async render(segment) {
        // Clear previous content
        this.container.innerHTML = '';
        
        // Use comprehensive renderers if available
        if (this.segmentRenderers) {
            const html = this.segmentRenderers.render(segment);
            this.container.innerHTML = html;
        } else {
            // Fallback to basic rendering
            const renderer = this.renderers[segment.segmentType] || this.renderers.default;
            const html = renderer(segment);
            this.container.innerHTML = html;
        }
        
        // Initialize interactive elements
        if (segment.interactiveCue && window.InteractiveCueManager) {
            const cueManager = new window.InteractiveCueManager();
            cueManager.initialize(segment.id, segment.interactiveCue);
        }
        
        // Syntax highlighting for code
        if (segment.codeExample && typeof Prism !== 'undefined') {
            Prism.highlightAll();
        }
        
        // Initialize visual assets
        if (window.visualAssetManager) {
            // Find all visual asset placeholders in the rendered content
            const placeholders = this.container.querySelectorAll('.visual-asset-placeholder');
            placeholders.forEach(placeholder => {
                window.visualAssetManager.observe(placeholder);
            });
        }
    }
    
    renderCourseOpening(segment) {
        return `
            <div class="segment course-opening-segment">
                ${this.renderSegmentHeader(segment)}
                <div class="segment-content">
                    <div class="welcome-animation">
                        <i class="fas fa-rocket fa-3x"></i>
                    </div>
                    <p class="welcome-text">${segment.textContent}</p>
                </div>
            </div>
        `;
    }
    
    renderInstructorIntro(segment) {
        return `
            <div class="segment instructor-intro-segment">
                ${this.renderSegmentHeader(segment)}
                <div class="segment-content">
                    <div class="instructor-avatar">
                        <i class="fas fa-user-tie fa-3x"></i>
                    </div>
                    <p>${segment.textContent}</p>
                </div>
            </div>
        `;
    }
    
    renderConceptExplanation(segment) {
        return `
            <div class="segment concept-explanation-segment">
                ${this.renderSegmentHeader(segment)}
                <div class="segment-content">
                    <p>${segment.textContent}</p>
                    ${segment.keywords ? this.renderKeywords(segment.keywords) : ''}
                </div>
            </div>
        `;
    }
    
    renderHistoricalContext(segment) {
        return `
            <div class="segment historical-context-segment">
                ${this.renderSegmentHeader(segment)}
                <div class="segment-content">
                    <div class="timeline-visualization">
                        <i class="fas fa-history fa-2x"></i>
                    </div>
                    <p>${segment.textContent}</p>
                </div>
            </div>
        `;
    }
    
    renderTechnicalIntro(segment) {
        return `
            <div class="segment technical-intro-segment">
                ${this.renderSegmentHeader(segment)}
                <div class="segment-content">
                    <p>${segment.textContent}</p>
                </div>
            </div>
        `;
    }
    
    renderCodeWalkthrough(segment) {
        const code = segment.codeExample || {};
        return `
            <div class="segment code-walkthrough-segment">
                ${this.renderSegmentHeader(segment)}
                <div class="segment-content">
                    <p>${segment.textContent}</p>
                    ${code.snippet ? `
                        <div class="code-segment">
                            <div class="code-header">
                                <span class="code-language">${code.language || 'code'}</span>
                                <button class="code-copy-btn" onclick="copyCode(this)">
                                    <i class="fas fa-copy"></i> Copy
                                </button>
                            </div>
                            <div class="code-content">
                                <pre><code class="language-${code.language || 'javascript'}">${escapeHtml(code.snippet)}</code></pre>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    renderMetricDeepDive(segment) {
        return `
            <div class="segment metric-deep-dive-segment">
                ${this.renderSegmentHeader(segment)}
                <div class="segment-content">
                    <p>${segment.textContent}</p>
                    <div class="metric-visualization">
                        <i class="fas fa-chart-line fa-2x"></i>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderDefault(segment) {
        return `
            <div class="segment default-segment">
                ${this.renderSegmentHeader(segment)}
                <div class="segment-content">
                    <p>${segment.textContent}</p>
                </div>
            </div>
        `;
    }
    
    renderSegmentHeader(segment) {
        return `
            <div class="segment-header">
                <span class="segment-type">${segment.segmentType.replace(/_/g, ' ')}</span>
                ${segment.title ? `<h3 class="segment-title">${segment.title}</h3>` : ''}
                ${segment.learningObjectives && segment.learningObjectives.length > 0 ? `
                    <ul class="segment-objectives">
                        ${segment.learningObjectives.map(obj => `<li>${obj}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        `;
    }
    
    renderKeywords(keywords) {
        return `
            <div class="segment-keywords">
                ${keywords.map(kw => `<span class="keyword">${kw}</span>`).join('')}
            </div>
        `;
    }
}

// Audio Manager
class AudioManager {
    constructor() {
        this.audioPlayer = document.getElementById('audioPlayer');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.audioProgressFill = document.getElementById('audioProgressFill');
        this.audioTime = document.getElementById('audioTime');
        this.audioSpeedBtn = document.getElementById('audioSpeedBtn');
        
        this.currentTaskId = null;
        this.speeds = [0.75, 1, 1.25, 1.5, 2];
        this.currentSpeedIndex = 1;
        
        this.setupEventListeners();
    }
    
    async loadSegmentAudio(segment) {
        try {
            // Generate audio
            const response = await api.generateSegmentAudio(segment.id, segment.textContent);
            
            if (response.error && response.error === 'TTS not available') {
                // TTS is not available, skip audio generation
                console.log('TTS not available, skipping audio generation');
                return;
            }
            
            this.currentTaskId = response.taskId;
            
            // Poll for completion
            this.pollAudioStatus();
            
        } catch (error) {
            // Handle 503 error gracefully
            if (error.status === 503 || (error.data && error.data.error === 'TTS not available')) {
                console.log('Audio generation service unavailable (TTS not installed)');
                // Disable audio controls
                this.playPauseBtn.disabled = true;
                this.audioSpeedBtn.disabled = true;
            } else {
                console.error('Failed to generate audio:', error);
            }
        }
    }
    
    async pollAudioStatus() {
        const checkStatus = async () => {
            try {
                const status = await api.checkAudioStatus(this.currentTaskId);
                
                if (status.status === 'completed') {
                    this.audioPlayer.src = status.audio_url;
                    this.audioPlayer.load();
                } else if (status.status === 'failed') {
                    console.error('Audio generation failed');
                } else {
                    // Still processing, check again
                    setTimeout(checkStatus, 2000);
                }
            } catch (error) {
                console.error('Failed to check audio status:', error);
            }
        };
        
        checkStatus();
    }
    
    togglePlayPause() {
        if (this.audioPlayer.paused) {
            this.audioPlayer.play();
            this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            AppState.audioState.isPlaying = true;
        } else {
            this.audioPlayer.pause();
            this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            AppState.audioState.isPlaying = false;
        }
    }
    
    updateProgress() {
        const progress = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
        this.audioProgressFill.style.width = `${progress}%`;
        
        const current = this.formatTime(this.audioPlayer.currentTime);
        const duration = this.formatTime(this.audioPlayer.duration);
        this.audioTime.textContent = `${current} / ${duration}`;
        
        AppState.audioState.currentTime = this.audioPlayer.currentTime;
        AppState.audioState.duration = this.audioPlayer.duration;
    }
    
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    changeSpeed() {
        this.currentSpeedIndex = (this.currentSpeedIndex + 1) % this.speeds.length;
        const speed = this.speeds[this.currentSpeedIndex];
        this.audioPlayer.playbackRate = speed;
        this.audioSpeedBtn.textContent = `${speed}x`;
        AppState.audioState.speed = speed;
    }
    
    setupEventListeners() {
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.audioSpeedBtn.addEventListener('click', () => this.changeSpeed());
        
        this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
        this.audioPlayer.addEventListener('ended', () => {
            this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            AppState.audioState.isPlaying = false;
            
            // Auto-advance if enabled
            if (AppState.settings.autoAdvance) {
                episodePlayer.nextSegment();
            }
        });
        
        // Progress bar click
        const progressBar = document.querySelector('.audio-progress-bar');
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.audioPlayer.currentTime = percent * this.audioPlayer.duration;
        });
    }
}

// Interaction Manager
class InteractionManager {
    constructor() {
        this.interactionHandlers = {
            'hover_to_explore': this.initHoverExplore.bind(this),
            'drag_to_distribute': this.initDragDistribute.bind(this),
            'click_to_compare': this.initClickCompare.bind(this),
            'simulation': this.initSimulation.bind(this),
            'code_completion': this.initCodeCompletion.bind(this),
            'pause_and_reflect': this.initPauseReflect.bind(this)
        };
    }
    
    initializeInteraction(interactiveCue) {
        const handler = this.interactionHandlers[interactiveCue.cueType];
        if (handler) {
            // Delay initialization to match trigger time
            if (interactiveCue.triggerAtSeconds) {
                setTimeout(() => {
                    handler(interactiveCue);
                }, interactiveCue.triggerAtSeconds * 1000);
            } else {
                handler(interactiveCue);
            }
        }
    }
    
    initHoverExplore(cue) {
        const container = document.createElement('div');
        container.className = 'interactive-cue hover-explore';
        container.innerHTML = `
            <div class="interactive-prompt">${cue.promptText}</div>
            <div class="hover-zones">
                <!-- Dynamic hover zones would be created here -->
            </div>
        `;
        
        this.insertInteractiveCue(container);
    }
    
    initDragDistribute(cue) {
        const container = document.createElement('div');
        container.className = 'interactive-cue drag-distribute';
        container.innerHTML = `
            <div class="interactive-prompt">${cue.promptText}</div>
            <div class="drag-container">
                <div class="drag-source">
                    <!-- Draggable items -->
                </div>
                <div class="drop-zone">
                    <div class="drop-zone-area">Drop items here</div>
                </div>
            </div>
        `;
        
        this.insertInteractiveCue(container);
        // Initialize drag and drop functionality
    }
    
    initClickCompare(cue) {
        const container = document.createElement('div');
        container.className = 'interactive-cue click-compare';
        container.innerHTML = `
            <div class="interactive-prompt">${cue.promptText}</div>
            <button class="compare-toggle">Click to Compare</button>
        `;
        
        this.insertInteractiveCue(container);
    }
    
    initSimulation(cue) {
        const container = document.createElement('div');
        container.className = 'interactive-cue simulation';
        container.innerHTML = `
            <div class="interactive-prompt">${cue.promptText}</div>
            <div class="simulation-container">
                <!-- Simulation UI would be rendered here -->
            </div>
        `;
        
        this.insertInteractiveCue(container);
    }
    
    initCodeCompletion(cue) {
        const container = document.createElement('div');
        container.className = 'interactive-cue code-completion';
        container.innerHTML = `
            <div class="interactive-prompt">${cue.promptText}</div>
            <div class="code-editor">
                <textarea placeholder="Complete the code..."></textarea>
            </div>
        `;
        
        this.insertInteractiveCue(container);
    }
    
    initPauseReflect(cue) {
        const container = document.createElement('div');
        container.className = 'interactive-cue pause-reflect';
        container.innerHTML = `
            <div class="interactive-prompt">${cue.promptText}</div>
            <div class="reflection-timer">Take a moment to reflect...</div>
        `;
        
        this.insertInteractiveCue(container);
        
        // Auto-hide after delay
        if (cue.revealDelay) {
            setTimeout(() => {
                container.style.opacity = '0';
                setTimeout(() => container.remove(), 300);
            }, cue.revealDelay * 1000);
        }
    }
    
    insertInteractiveCue(element) {
        const container = document.getElementById('segmentContainer');
        container.appendChild(element);
        
        // Animate entrance
        requestAnimationFrame(() => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            requestAnimationFrame(() => {
                element.style.transition = 'all 0.3s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            });
        });
    }
    
    async logInteraction(interactionType, data) {
        try {
            await api.logInteraction(AppState.currentSegment.id, {
                interactionType,
                interactionData: data
            });
        } catch (error) {
            console.error('Failed to log interaction:', error);
        }
    }
}

// Checkpoint Manager
class CheckpointManager {
    constructor() {
        this.modal = document.getElementById('checkpointModal');
        this.content = document.getElementById('checkpointContent');
        this.submitBtn = document.getElementById('submitCheckpointBtn');
        this.skipBtn = document.getElementById('skipCheckpointBtn');
        
        this.currentCheckpoint = null;
        this.answers = [];
        
        this.setupEventListeners();
    }
    
    showCheckpoint(episode) {
        this.currentCheckpoint = episode;
        this.answers = [];
        
        // For now, show a simple completion message
        this.content.innerHTML = `
            <div class="checkpoint-complete">
                <i class="fas fa-check-circle fa-3x text-success"></i>
                <h3>Episode Complete!</h3>
                <p>Great job completing "${episode.title}"</p>
            </div>
        `;
        
        this.modal.classList.remove('hidden');
    }
    
    async submitCheckpoint() {
        if (!this.currentCheckpoint) return;
        
        try {
            const result = await api.submitCheckpoint(
                this.currentCheckpoint.id,
                this.answers
            );
            
            if (result.passed) {
                showToast('Checkpoint passed! 🎉', 'success');
            } else {
                showToast(`Score: ${Math.round(result.score * 100)}%`, 'info');
            }
            
            this.modal.classList.add('hidden');
            
        } catch (error) {
            showToast('Failed to submit checkpoint', 'error');
        }
    }
    
    setupEventListeners() {
        this.submitBtn.addEventListener('click', () => this.submitCheckpoint());
        this.skipBtn.addEventListener('click', () => {
            this.modal.classList.add('hidden');
        });
        
        document.getElementById('checkpointClose').addEventListener('click', () => {
            this.modal.classList.add('hidden');
        });
    }
}

// Utility Functions
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type]} toast-icon"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function copyCode(button) {
    const codeBlock = button.closest('.code-segment').querySelector('code');
    const text = codeBlock.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        const originalHtml = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            button.innerHTML = originalHtml;
        }, 2000);
    });
}

// Function for copy code in new segment renderers
function copyCodeToClipboard(button) {
    const codeBlock = button.closest('.code-block-container').querySelector('code');
    const text = codeBlock.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        const originalHtml = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            button.innerHTML = originalHtml;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        showToast('Failed to copy code', 'error');
    });
}

// Load additional scripts if available
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Initialize application
const courseNavigator = new CourseNavigator();
const episodePlayer = new EpisodePlayer();
const segmentRenderer = new SegmentRenderer();
const audioManager = new AudioManager();
const interactionManager = new InteractionManager();
const checkpointManager = new CheckpointManager();

// Setup event listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Components are already loaded via HTML script tags
    console.log('Starting Neural Learn application...');
    // Initialize components
    await courseNavigator.initialize();
    episodePlayer.setupEventListeners();
    
    // Initialize adaptive learning if available
    if (typeof adaptiveLearning !== 'undefined' && AppState.currentUser) {
        await adaptiveLearning.initialize(AppState.currentUser.id);
    }
    
    // Sample data is already initialized via migration
    
    // Setup global event handlers
    eventBus.on('segment:viewed', (data) => {
        console.log('Segment viewed:', data.segment.id);
    });
    
    eventBus.on('episode:completed', (data) => {
        console.log('Episode completed:', data.episodeId);
    });
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        document.getElementById('courseSidebar').classList.remove('active');
    }
});

// Analytics Module (consolidated from analytics.js)
class LearningAnalytics {
    constructor() {
        this.eventQueue = [];
        this.metrics = {};
        this.sessionData = {
            sessionId: this.generateSessionId(),
            startTime: Date.now(),
            events: []
        };
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateEventId() {
        return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getEventContext() {
        return {
            url: window.location.href,
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`
        };
    }

    trackEvent(eventType, data) {
        const event = {
            id: this.generateEventId(),
            sessionId: this.sessionData.sessionId,
            userId: AppState.currentUser?.id || 'anonymous',
            timestamp: Date.now(),
            eventType: eventType,
            data: data,
            context: this.getEventContext()
        };

        this.eventQueue.push(event);
        this.sessionData.events.push(event);

        // Send events in batches
        if (this.eventQueue.length >= 10) {
            this.flushEvents();
        }
    }

    trackSegmentView(segmentId, duration) {
        this.trackEvent('segment_view', {
            segmentId: segmentId,
            duration: duration,
            timestamp: Date.now()
        });
    }

    async flushEvents() {
        if (this.eventQueue.length === 0) return;

        const events = [...this.eventQueue];
        this.eventQueue = [];

        try {
            await api.request('/analytics/events', {
                method: 'POST',
                body: JSON.stringify({
                    events: events,
                    sessionId: this.sessionData.sessionId
                })
            });
        } catch (error) {
            console.error('Failed to send analytics events:', error);
            // Re-add events to queue on failure
            this.eventQueue.unshift(...events);
        }
    }
}

// Initialize analytics
window.analytics = new LearningAnalytics();

// Flush analytics on page unload
window.addEventListener('beforeunload', () => {
    if (window.analytics) {
        window.analytics.flushEvents();
    }
});