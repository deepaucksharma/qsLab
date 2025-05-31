// script_fluid.js - Efficient, Fluid Layout JavaScript

const API_URL = 'http://localhost:5000/api';

// State
let currentMode = 'learn';
let currentUser = 'user123';
let currentCourse = null;
let currentLesson = null;
let currentSegments = [];
let currentSegmentIndex = 0;
let completedSegments = new Set();
let audioPlayer = null;
let playbackSpeed = 1;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    audioPlayer = document.getElementById('audioPlayer');
    initializeEventListeners();
    loadCourses();
    initializeSampleData();
});

function initializeEventListeners() {
    // Audio events
    audioPlayer.addEventListener('timeupdate', updateAudioProgress);
    audioPlayer.addEventListener('ended', onAudioEnded);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
    
    // Save notes on blur
    const notesInput = document.getElementById('notesInput');
    if (notesInput) {
        notesInput.addEventListener('blur', saveNotes);
    }
}

function handleKeyboard(e) {
    if (currentMode === 'learn') {
        switch(e.key) {
            case 'ArrowLeft':
                if (!e.target.matches('input, textarea')) {
                    navigateSegment('prev');
                }
                break;
            case 'ArrowRight':
                if (!e.target.matches('input, textarea')) {
                    navigateSegment('next');
                }
                break;
            case ' ':
                if (!e.target.matches('input, textarea')) {
                    e.preventDefault();
                    toggleAudio();
                }
                break;
        }
    }
}

// Mode switching
function switchMode(mode) {
    currentMode = mode;
    
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    document.querySelectorAll('.mode-container').forEach(container => {
        container.classList.toggle('active', container.id === mode + 'Mode');
    });
    
    if (mode === 'create') {
        loadContentTree();
    }
}

// Initialize sample data
async function initializeSampleData() {
    try {
        await fetch(`${API_URL}/init-sample-data`, { method: 'POST' });
    } catch (error) {
        console.error('Error initializing sample data:', error);
    }
}

// Load courses
async function loadCourses() {
    try {
        const response = await fetch(`${API_URL}/courses`);
        const courses = await response.json();
        
        const selector = document.getElementById('courseSelectorInline');
        selector.innerHTML = courses.map(course => `
            <div class="course-chip" onclick="selectCourse('${course.id}')" data-course-id="${course.id}">
                ${course.title}
            </div>
        `).join('');
        
        // Auto-select first course if available
        if (courses.length > 0) {
            selectCourse(courses[0].id);
        }
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

// Select course
async function selectCourse(courseId) {
    currentCourse = courseId;
    
    // Update UI
    document.querySelectorAll('.course-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.courseId === courseId);
    });
    
    try {
        const response = await fetch(`${API_URL}/courses/${courseId}/learning-view`);
        const data = await response.json();
        
        displayModuleTree(data.modules);
        updateBreadcrumb([data.course.title]);
    } catch (error) {
        console.error('Error loading course:', error);
    }
}

// Display module tree
function displayModuleTree(modules) {
    const tree = document.getElementById('moduleTree');
    tree.innerHTML = modules.map(module => `
        <div class="module-item">
            <div class="module-header" onclick="toggleModule('${module.id}')">
                <span>📁 ${module.title}</span>
            </div>
            <div class="lesson-list" id="lessons-${module.id}">
                ${module.lessons.map(lesson => `
                    <div class="lesson-item ${lesson.id === currentLesson ? 'active' : ''}" 
                         onclick="selectLesson('${lesson.id}')" 
                         data-lesson-id="${lesson.id}">
                        <span>${lesson.title}</span>
                        <span>${lesson.duration}m</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function toggleModule(moduleId) {
    const lessonList = document.getElementById(`lessons-${moduleId}`);
    if (lessonList) {
        lessonList.style.display = lessonList.style.display === 'none' ? 'block' : 'none';
    }
}

// Select lesson
async function selectLesson(lessonId) {
    currentLesson = lessonId;
    
    // Update UI
    document.querySelectorAll('.lesson-item').forEach(item => {
        item.classList.toggle('active', item.dataset.lessonId === lessonId);
    });
    
    try {
        const response = await fetch(`${API_URL}/lessons/${lessonId}/learning-content`);
        const data = await response.json();
        
        // Update lesson info
        document.getElementById('lessonTitle').textContent = data.lesson.title;
        
        const meta = [];
        if (data.lesson.objectives && data.lesson.objectives.length > 0) {
            meta.push(data.lesson.objectives.join(' • '));
        }
        document.getElementById('lessonMeta').textContent = meta.join(' | ');
        
        // Store segments
        currentSegments = data.segments;
        currentSegmentIndex = 0;
        
        // Display first segment
        displaySegment(0);
        
        // Update timeline
        updateTimeline();
        
        // Load progress
        loadUserProgress();
    } catch (error) {
        console.error('Error loading lesson:', error);
    }
}

// Display segment
function displaySegment(index) {
    if (index < 0 || index >= currentSegments.length) return;
    
    const segment = currentSegments[index];
    currentSegmentIndex = index;
    
    // Update segment info
    document.getElementById('segmentType').textContent = segment.type.replace(/_/g, ' ');
    document.getElementById('segmentIndex').textContent = `${index + 1}/${currentSegments.length}`;
    
    // Update content
    document.getElementById('contentText').innerHTML = `<p>${segment.text}</p>`;
    
    // Handle visuals
    displayVisuals(segment.visuals);
    
    // Handle code
    if (segment.code_example) {
        const codeBlock = document.getElementById('codeBlock');
        codeBlock.style.display = 'block';
        document.getElementById('codeLang').textContent = segment.code_example.language;
        document.getElementById('codeContent').textContent = segment.code_example.code;
    } else {
        document.getElementById('codeBlock').style.display = 'none';
    }
    
    // Update audio
    if (segment.audio_url) {
        audioPlayer.src = segment.audio_url;
        document.getElementById('playBtn').disabled = false;
    } else {
        audioPlayer.src = '';
        document.getElementById('playBtn').disabled = true;
    }
    
    // Update tools
    updateTools(segment);
    
    // Update navigation
    updateNavigation();
    updateSegmentDots();
}

// Display visuals
function displayVisuals(visuals) {
    const grid = document.getElementById('visualsGrid');
    
    if (!visuals || visuals.length === 0) {
        grid.innerHTML = '';
        return;
    }
    
    grid.innerHTML = visuals.map(visual => {
        switch (visual.type) {
            case 'static_image':
            case 'annotated_diagram':
                return `
                    <div class="visual-item">
                        <img src="${visual.url}" alt="${visual.alt_text}">
                        ${visual.caption ? `<div class="visual-caption">${visual.caption}</div>` : ''}
                    </div>
                `;
            case 'data_table':
                if (visual.data) {
                    return `
                        <div class="visual-item">
                            <table>
                                <thead>
                                    <tr>${visual.data.headers.map(h => `<th>${h}</th>`).join('')}</tr>
                                </thead>
                                <tbody>
                                    ${visual.data.rows.map(row => 
                                        `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
                                    ).join('')}
                                </tbody>
                            </table>
                        </div>
                    `;
                }
                break;
        }
        return '';
    }).join('');
}

// Update tools
function updateTools(segment) {
    // Keywords
    if (segment.keywords && segment.keywords.length > 0) {
        document.getElementById('conceptsWidget').style.display = 'block';
        document.getElementById('conceptTags').innerHTML = segment.keywords.map(keyword => 
            `<span class="concept-tag" onclick="searchConcept('${keyword}')">${keyword}</span>`
        ).join('');
    } else {
        document.getElementById('conceptsWidget').style.display = 'none';
    }
    
    // References
    if (segment.further_reading_links && segment.further_reading_links.length > 0) {
        document.getElementById('referencesWidget').style.display = 'block';
        document.getElementById('referenceList').innerHTML = segment.further_reading_links.map(ref => 
            `<div class="reference-item" onclick="window.open('${ref.url}', '_blank')">
                ${ref.title} →
            </div>`
        ).join('');
    } else {
        document.getElementById('referencesWidget').style.display = 'none';
    }
    
    // Load notes
    const notes = localStorage.getItem(`notes_${currentLesson}_${currentSegmentIndex}`);
    document.getElementById('notesInput').value = notes || '';
}

// Navigation
function navigateSegment(direction) {
    const newIndex = direction === 'next' ? currentSegmentIndex + 1 : currentSegmentIndex - 1;
    
    if (newIndex >= 0 && newIndex < currentSegments.length) {
        // Mark current as completed when moving forward
        if (direction === 'next') {
            markSegmentCompleted(currentSegments[currentSegmentIndex].id);
        }
        
        displaySegment(newIndex);
    }
}

function updateNavigation() {
    document.getElementById('prevBtn').disabled = currentSegmentIndex === 0;
    document.getElementById('nextBtn').disabled = currentSegmentIndex === currentSegments.length - 1;
}

// Progress tracking
function updateSegmentDots() {
    const container = document.getElementById('segmentDots');
    
    // Show max 10 dots around current
    const start = Math.max(0, currentSegmentIndex - 4);
    const end = Math.min(currentSegments.length, start + 10);
    
    container.innerHTML = currentSegments.slice(start, end).map((segment, i) => {
        const actualIndex = start + i;
        return `<div class="segment-dot ${actualIndex === currentSegmentIndex ? 'active' : ''} 
                     ${completedSegments.has(segment.id) ? 'completed' : ''}"
                     onclick="displaySegment(${actualIndex})"
                     title="Segment ${actualIndex + 1}"></div>`;
    }).join('');
}

function markSegmentCompleted(segmentId) {
    completedSegments.add(segmentId);
    updateProgress();
    updateSegmentDots();
    updateTimeline();
    
    // Save to backend
    fetch(`${API_URL}/progress/${currentUser}/course/${currentCourse}/segment/${segmentId}`, {
        method: 'POST'
    });
}

function updateProgress() {
    const total = currentSegments.length;
    const completed = currentSegments.filter(s => completedSegments.has(s.id)).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Update progress displays
    document.getElementById('progressBadge').textContent = progress + '%';
    document.getElementById('progressText').textContent = progress + '%';
    
    // Update progress ring
    const circumference = 2 * Math.PI * 25;
    const offset = circumference - (progress / 100) * circumference;
    document.querySelector('.progress-fill').style.strokeDashoffset = offset;
    
    // Update streak
    const streak = Math.floor(completedSegments.size / 5);
    document.getElementById('streak').textContent = streak;
}

async function loadUserProgress() {
    try {
        const response = await fetch(`${API_URL}/progress/${currentUser}/course/${currentCourse}`);
        const data = await response.json();
        
        completedSegments = new Set(data.completed_segments || []);
        updateProgress();
        updateSegmentDots();
        updateTimeline();
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

// Timeline
function updateTimeline() {
    const track = document.getElementById('timelineTrack');
    track.innerHTML = currentSegments.map((segment, i) => `
        <div class="timeline-segment ${i === currentSegmentIndex ? 'active' : ''} 
             ${completedSegments.has(segment.id) ? 'completed' : ''}"
             onclick="displaySegment(${i})">
            ${segment.title || `Segment ${i + 1}`}
        </div>
    `).join('');
    
    // Scroll to active segment
    const activeSegment = track.querySelector('.active');
    if (activeSegment) {
        activeSegment.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
}

// Audio controls
function toggleAudio() {
    const btn = document.getElementById('playBtn');
    
    if (audioPlayer.paused) {
        audioPlayer.play();
        btn.textContent = '⏸';
    } else {
        audioPlayer.pause();
        btn.textContent = '▶';
    }
}

function updateAudioProgress() {
    if (audioPlayer.duration) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        document.getElementById('audioFill').style.width = progress + '%';
        document.getElementById('audioTime').textContent = formatTime(audioPlayer.currentTime);
    }
}

function onAudioEnded() {
    document.getElementById('playBtn').textContent = '▶';
    
    // Auto-advance after 1 second
    if (currentSegmentIndex < currentSegments.length - 1) {
        setTimeout(() => navigateSegment('next'), 1000);
    }
}

function cycleSpeed() {
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    playbackSpeed = speeds[(currentIndex + 1) % speeds.length];
    
    audioPlayer.playbackRate = playbackSpeed;
    document.getElementById('speedBtn').textContent = playbackSpeed + 'x';
}

// Notes
function saveNotes() {
    const notes = document.getElementById('notesInput').value;
    localStorage.setItem(`notes_${currentLesson}_${currentSegmentIndex}`, notes);
}

// Utilities
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateBreadcrumb(items) {
    const breadcrumb = document.getElementById('breadcrumb');
    breadcrumb.innerHTML = items.map((item, i) => 
        `<span>${item}</span>${i < items.length - 1 ? ' › ' : ''}`
    ).join('');
}

function searchConcept(concept) {
    console.log('Searching for concept:', concept);
    // Implement concept search
}

function copyCode() {
    const code = document.getElementById('codeContent').textContent;
    navigator.clipboard.writeText(code);
    
    // Show feedback
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
        btn.textContent = originalText;
    }, 2000);
}

// Create mode
async function loadContentTree() {
    try {
        const response = await fetch(`${API_URL}/courses`);
        const courses = await response.json();
        
        const tree = document.getElementById('treeContent');
        tree.innerHTML = courses.map(course => `
            <div class="tree-item">
                <span>📚 ${course.title}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading content tree:', error);
    }
}

function showNewDialog() {
    // Implement create dialog
}

function switchTab(tab) {
    // Implement tab switching
}

function generateAllAudio() {
    // Implement batch audio generation
}

// Floating tools
function toggleSearch() {
    // Implement search
}

function toggleBookmarks() {
    // Implement bookmarks
}

function toggleHelp() {
    // Implement help
}