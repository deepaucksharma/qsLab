// API Configuration
const API_URL = 'http://localhost:5000/api';

// State Management
let currentPath = null;
let currentLanguage = 'en';
let isPlaying = false;
let currentAudioTaskId = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadLearningPaths();
    loadLanguages();
    createAudioVisualizer();
    updateProgress();
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
});

// Load Learning Paths
async function loadLearningPaths() {
    try {
        const response = await fetch(`${API_URL}/learning-paths`);
        const paths = await response.json();
        
        const container = document.getElementById('learningPaths');
        container.innerHTML = paths.map(path => `
            <div class="path-card" onclick="selectPath('${path.id}')" data-path="${path.id}">
                <div class="path-icon">${path.icon}</div>
                <div class="path-name">${path.name}</div>
                <div class="path-description">${path.description}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading paths:', error);
    }
}

// Load Supported Languages
async function loadLanguages() {
    try {
        const response = await fetch(`${API_URL}/supported-languages`);
        const languages = await response.json();
        
        const container = document.getElementById('languageSelector');
        container.innerHTML = languages.map(lang => `
            <div class="lang-chip ${lang.code === currentLanguage ? 'active' : ''}" 
                 onclick="selectLanguage('${lang.code}')" data-lang="${lang.code}">
                <span>${lang.flag}</span>
                <span>${lang.name}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading languages:', error);
    }
}

// Select Learning Path
function selectPath(pathId) {
    currentPath = pathId;
    
    // Update UI
    document.querySelectorAll('.path-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-path="${pathId}"]`).classList.add('active');
    
    // Update content
    const pathNames = {
        'vocab-builder': 'Vocabulary Builder',
        'language-learning': 'Language Learning',
        'concept-mastery': 'Concept Mastery',
        'pronunciation': 'Pronunciation Practice'
    };
    
    document.querySelector('.lesson-title').textContent = pathNames[pathId] || 'Learning Path';
    
    // Show sample content
    updateLearningCard('front', `Let's explore ${pathNames[pathId]}!`, 'Click to see more');
}

// Select Language
function selectLanguage(langCode) {
    currentLanguage = langCode;
    
    document.querySelectorAll('.lang-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    document.querySelector(`[data-lang="${langCode}"]`).classList.add('active');
}

// Flip Learning Card
function flipCard() {
    const card = document.getElementById('learningCard');
    card.classList.toggle('flipped');
}

// Update Learning Card Content
function updateLearningCard(face, title, content) {
    const selector = face === 'front' ? '.card-front .card-content' : '.card-back .card-content';
    const cardContent = document.querySelector(selector);
    cardContent.innerHTML = `
        <h3>${title}</h3>
        <p class="card-text">${content}</p>
    `;
}

// Generate Audio
async function generateAudio() {
    const text = document.getElementById('textInput').value.trim();
    if (!text) {
        alert('Please enter some text to generate audio');
        return;
    }
    
    try {
        // Show loading state
        const playButton = document.getElementById('playButton');
        playButton.innerHTML = '<div class="loading"></div>';
        
        // Request audio generation
        const response = await fetch(`${API_URL}/generate-audio`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: text,
                language: currentLanguage,
                speed: 1.0
            })
        });
        
        const data = await response.json();
        currentAudioTaskId = data.task_id;
        
        // Poll for completion
        pollAudioStatus();
        
    } catch (error) {
        console.error('Error generating audio:', error);
        alert('Failed to generate audio');
    }
}

// Poll Audio Generation Status
async function pollAudioStatus() {
    if (!currentAudioTaskId) return;
    
    try {
        const response = await fetch(`${API_URL}/audio-status/${currentAudioTaskId}`);
        const status = await response.json();
        
        if (status.status === 'completed') {
            // Load audio
            const audioPlayer = document.getElementById('audioPlayer');
            audioPlayer.src = status.url;
            audioPlayer.load();
            
            // Update UI
            document.getElementById('playButton').innerHTML = '<span id="playIcon">▶️</span>';
            
            // Update stats
            incrementStat('wordsLearned', 10);
            
        } else if (status.status === 'error') {
            alert('Audio generation failed');
            document.getElementById('playButton').innerHTML = '<span id="playIcon">▶️</span>';
            
        } else {
            // Continue polling
            setTimeout(pollAudioStatus, 1000);
        }
    } catch (error) {
        console.error('Error checking status:', error);
    }
}

// Generate Lesson
async function generateLesson() {
    if (!currentPath) {
        alert('Please select a learning path first');
        return;
    }
    
    const topic = document.getElementById('textInput').value.trim() || 'general topic';
    
    try {
        const response = await fetch(`${API_URL}/generate-lesson`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: currentPath,
                topic: topic,
                difficulty: 'beginner'
            })
        });
        
        const lesson = await response.json();
        
        // Update UI with lesson
        document.querySelector('.lesson-title').textContent = lesson.title;
        
        // Show first segment
        if (lesson.segments.length > 0) {
            const firstSegment = lesson.segments[0];
            updateLearningCard('front', firstSegment.type, firstSegment.text);
            
            // Start audio generation for first segment
            currentAudioTaskId = firstSegment.audio_task_id;
            pollAudioStatus();
        }
        
        // Update stats
        incrementStat('lessonsCompleted', 1);
        
    } catch (error) {
        console.error('Error generating lesson:', error);
    }
}

// Toggle Audio Playback
function togglePlay() {
    const audioPlayer = document.getElementById('audioPlayer');
    const playIcon = document.getElementById('playIcon');
    
    if (!audioPlayer.src) {
        alert('Please generate audio first');
        return;
    }
    
    if (isPlaying) {
        audioPlayer.pause();
        playIcon.textContent = '▶️';
        stopVisualizer();
    } else {
        audioPlayer.play();
        playIcon.textContent = '⏸️';
        startVisualizer();
        incrementStat('minutesListened', 1);
    }
    
    isPlaying = !isPlaying;
}

// Create Audio Visualizer
function createAudioVisualizer() {
    const visualizer = document.getElementById('visualizer');
    for (let i = 0; i < 20; i++) {
        const bar = document.createElement('div');
        bar.className = 'audio-bar';
        bar.style.height = '10px';
        visualizer.appendChild(bar);
    }
}

// Start Visualizer Animation
function startVisualizer() {
    const bars = document.querySelectorAll('.audio-bar');
    bars.forEach((bar, index) => {
        bar.style.animation = `audioWave ${0.5 + Math.random() * 1}s ease-in-out infinite`;
        bar.style.animationDelay = `${index * 0.05}s`;
    });
}

// Stop Visualizer Animation
function stopVisualizer() {
    const bars = document.querySelectorAll('.audio-bar');
    bars.forEach(bar => {
        bar.style.animation = 'none';
        bar.style.height = '10px';
    });
}

// Update Progress Stats
function updateProgress() {
    const stats = JSON.parse(localStorage.getItem('learningStats') || '{}');
    
    document.getElementById('lessonsCompleted').textContent = stats.lessonsCompleted || 0;
    document.getElementById('wordsLearned').textContent = stats.wordsLearned || 0;
    document.getElementById('minutesListened').textContent = stats.minutesListened || 0;
    
    // Update progress ring
    const progress = Math.min(((stats.lessonsCompleted || 0) / 10) * 100, 100);
    updateProgressRing(progress);
    
    // Update streak
    updateStreak();
}

// Update Progress Ring
function updateProgressRing(percent) {
    const ring = document.getElementById('progressRing');
    const circumference = 2 * Math.PI * 90;
    const offset = circumference - (percent / 100) * circumference;
    ring.style.strokeDashoffset = offset;
    
    document.querySelector('.progress-text .stat-value').textContent = `${Math.round(percent)}%`;
}

// Increment Stat
function incrementStat(statName, value = 1) {
    const stats = JSON.parse(localStorage.getItem('learningStats') || '{}');
    stats[statName] = (stats[statName] || 0) + value;
    localStorage.setItem('learningStats', JSON.stringify(stats));
    updateProgress();
}

// Update Streak
function updateStreak() {
    const lastAccess = localStorage.getItem('lastAccess');
    const today = new Date().toDateString();
    
    let streak = parseInt(localStorage.getItem('streak') || '0');
    
    if (lastAccess !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastAccess === yesterday.toDateString()) {
            streak++;
        } else {
            streak = 1;
        }
        
        localStorage.setItem('streak', streak);
        localStorage.setItem('lastAccess', today);
    }
    
    document.getElementById('streak').textContent = `🔥 ${streak} day streak`;
}

// Show New Topic Modal (placeholder)
function showNewTopicModal() {
    const topic = prompt('What would you like to learn about?');
    if (topic) {
        document.getElementById('textInput').value = topic;
        generateLesson();
    }
}

// Audio player events
document.getElementById('audioPlayer').addEventListener('ended', () => {
    document.getElementById('playIcon').textContent = '▶️';
    isPlaying = false;
    stopVisualizer();
});
