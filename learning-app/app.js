// Global state
const state = {
    currentSection: 'overview',
    progress: {
        week1: 0,
        week2: 0,
        week3: 0,
        week4: 0,
        week5: 0,
        overall: 0
    },
    checklistItems: {},
    jmxCommands: {
        'help': 'Available commands: open, domains, domain, beans, bean, info, get, quit',
        'open localhost:9999': 'Connected to localhost:9999',
        'domains': 'kafka.server\nkafka.network\nkafka.log\nkafka.controller\njava.lang',
        'domain kafka.server': 'Domain kafka.server selected',
        'beans': 'kafka.server:name=MessagesInPerSec,type=BrokerTopicMetrics\nkafka.server:name=BytesInPerSec,type=BrokerTopicMetrics\nkafka.server:name=BytesOutPerSec,type=BrokerTopicMetrics',
        'bean kafka.server:name=MessagesInPerSec,type=BrokerTopicMetrics': 'Bean selected',
        'info': 'Attributes:\n  Count (long): Total number of messages\n  OneMinuteRate (double): Messages per second (1 minute average)\n  FiveMinuteRate (double): Messages per second (5 minute average)',
        'get Count': 'Count = 15823',
        'get OneMinuteRate': 'OneMinuteRate = 1024.5'
    }
};

// Store terminal instances
const terminals = {};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadProgress();
    setupEventListeners();
    updateProgressDisplay();
    checkCompletionStatus();
    initializeAnimations();
    addSmoothScrolling();
    Prism.highlightAll();
    
    // Initialize main terminal when playground is visited
    const playgroundObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.id === 'playground' && !terminals['playground-main']) {
                terminals['playground-main'] = initializeTerminal('playground-main-terminal', {
                    serverUrl: 'ws://localhost:3001',
                    theme: 'dark'
                });
            }
        });
    });
    
    const playgroundSection = document.getElementById('playground');
    if (playgroundSection) {
        playgroundObserver.observe(playgroundSection);
    }
    
    // Initialize honeycomb visualization when Queues & Streams section is visited
    const queuesStreamsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.id === 'queues-streams' && !honeycomb) {
                honeycomb = new HoneycombVisualizer('honeycomb-demo');
            }
        });
    });
    
    const queuesStreamsSection = document.getElementById('queues-streams');
    if (queuesStreamsSection) {
        queuesStreamsObserver.observe(queuesStreamsSection);
    }
    
    // Add loading animation
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// Navigation
function setupEventListeners() {
    // Navigation links
    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            showSection(sectionId);
            updateActiveNav(link);
        });
    });

    // Checklist items
    document.querySelectorAll('.checklist input[type="checkbox"], .objective-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateProgress();
            saveProgress();
            checkCompletionStatus();
        });
    });
}

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        state.currentSection = sectionId;
    }
}

function updateActiveNav(activeLink) {
    document.querySelectorAll('.nav-item').forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

// Tab functionality
function showTab(tabId) {
    const tabContent = document.getElementById(tabId);
    const container = tabContent.parentElement;
    
    container.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    container.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    tabContent.classList.add('active');
    event.target.classList.add('active');
}

function showPlaygroundTab(tabName) {
    document.querySelectorAll('.playground-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.playground-tabs .tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    document.getElementById(`playground-${tabName}`).classList.add('active');
    event.target.classList.add('active');
}

// Copy command to terminal
function copyToTerminal(command) {
    // Switch to terminal tab
    document.querySelector('.playground-tabs .tab-button').click();
    
    // Insert command into terminal
    const terminal = terminals['playground-main'];
    if (terminal) {
        terminal.elements.input.value = command;
        terminal.elements.input.focus();
    }
}

// Progress tracking
function updateProgress() {
    const weeks = ['week1', 'week2', 'week3', 'week4', 'week5'];
    let totalCompleted = 0;
    let totalItems = 0;
    
    weeks.forEach((week, index) => {
        const weekNum = index + 1;
        const checkboxes = document.querySelectorAll(`#w${weekNum}-1, #w${weekNum}-2, #w${weekNum}-3, #w${weekNum}-4, #w${weekNum}-5`);
        const completed = Array.from(checkboxes).filter(cb => cb.checked).length;
        const weekProgress = (completed / checkboxes.length) * 100;
        
        state.progress[week] = weekProgress;
        totalCompleted += completed;
        totalItems += checkboxes.length;
        
        // Update week progress badge
        const weekNav = document.querySelector(`a[href="#${week}"] .progress-badge`);
        if (weekNav) {
            weekNav.textContent = `${Math.round(weekProgress)}%`;
            if (weekProgress === 100) {
                weekNav.style.backgroundColor = 'var(--success-color)';
            }
        }
    });
    
    // Update overall progress
    state.progress.overall = (totalCompleted / totalItems) * 100;
    updateProgressDisplay();
}

function updateProgressDisplay() {
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    if (progressFill && progressText) {
        progressFill.style.width = `${state.progress.overall}%`;
        progressText.textContent = `${Math.round(state.progress.overall)}% Complete`;
    }
}

function saveProgress() {
    localStorage.setItem('kafkaLabProgress', JSON.stringify(state.progress));
    
    // Save checkbox states
    const checkboxStates = {};
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        if (checkbox.id) {
            checkboxStates[checkbox.id] = checkbox.checked;
        }
    });
    localStorage.setItem('kafkaLabCheckboxes', JSON.stringify(checkboxStates));
}

function loadProgress() {
    const savedProgress = localStorage.getItem('kafkaLabProgress');
    if (savedProgress) {
        state.progress = JSON.parse(savedProgress);
    }
    
    const savedCheckboxes = localStorage.getItem('kafkaLabCheckboxes');
    if (savedCheckboxes) {
        const checkboxStates = JSON.parse(savedCheckboxes);
        Object.keys(checkboxStates).forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.checked = checkboxStates[id];
            }
        });
    }
}

// Interactive features
function checkPrerequisites() {
    const button = event.target;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
    
    setTimeout(() => {
        button.innerHTML = '<i class="fas fa-check-circle"></i> All Prerequisites Met!';
        button.style.backgroundColor = 'var(--success-color)';
        button.disabled = true;
    }, 2000);
}

function copyCode(button) {
    const codeBlock = button.previousElementSibling.querySelector('code');
    const text = codeBlock.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            button.innerHTML = originalText;
        }, 2000);
    });
}

function simulateCommand(commandType) {
    const output = document.getElementById(`${commandType}-output`);
    output.innerHTML = '<div class="loading"></div> Running commands...';
    
    setTimeout(() => {
        if (commandType === 'week1-setup') {
            output.innerHTML = `<div class="command-output success">
Creating network "week1-xray_default"...
Creating kafka-xray-zookeeper ... done
Creating kafka-xray-broker    ... done
Creating kafka-xray-jmxterm   ... done
Creating kafka-xray-ui        ... done

✅ All services started successfully!

Created topic test-events.

🚀 Traffic generation started:
Records: 100000
Throughput: ~1000 msgs/sec
</div>`;
            
            // Show success message for first metric
            document.getElementById('first-metric-success').style.display = 'block';
        }
    }, 3000);
}

function handleJMXCommand(event) {
    if (event.key === 'Enter') {
        const input = event.target;
        const command = input.value.trim().toLowerCase();
        const output = document.getElementById('jmx-output');
        
        // Add command to output
        output.innerHTML += `<p style="color: #0f0;">$ ${command}</p>`;
        
        // Process command
        if (state.jmxCommands[command]) {
            output.innerHTML += `<p>${state.jmxCommands[command]}</p>`;
        } else if (command === 'quit' || command === 'exit') {
            output.innerHTML += '<p>Goodbye!</p>';
            input.disabled = true;
        } else {
            output.innerHTML += `<p style="color: #f66;">Unknown command: ${command}</p>`;
        }
        
        // Clear input and scroll to bottom
        input.value = '';
        output.scrollTop = output.scrollHeight;
    }
}

function calculateRate() {
    const count1 = parseFloat(document.getElementById('count1').value);
    const count2 = parseFloat(document.getElementById('count2').value);
    const interval = parseFloat(document.getElementById('timeInterval').value);
    
    if (isNaN(count1) || isNaN(count2) || isNaN(interval) || interval === 0) {
        document.getElementById('rate-result').innerHTML = 
            '<i class="fas fa-exclamation-circle" style="color: var(--accent-color);"></i> Please enter valid numbers';
        return;
    }
    
    const rate = (count2 - count1) / interval;
    document.getElementById('rate-result').innerHTML = 
        `<i class="fas fa-check-circle" style="color: var(--success-color);"></i> 
        Rate: <strong>${rate.toFixed(2)} messages/second</strong>`;
}

function runPlaygroundCode(language) {
    const output = document.getElementById('playground-result');
    output.textContent = 'Running...';
    
    setTimeout(() => {
        switch(language) {
            case 'bash':
                output.textContent = `kafka-broker
kafka-zookeeper
kafka-ui
jmxterm

Topic list:
test-events
payments
orders
inventory`;
                break;
            case 'nrql':
                output.textContent = `Results (5 minutes ago):
┌─────────────┬──────────────┐
│ timestamp   │ Messages/sec │
├─────────────┼──────────────┤
│ 12:00       │ 1,024        │
│ 12:01       │ 1,156        │
│ 12:02       │ 987          │
│ 12:03       │ 1,203        │
│ 12:04       │ 1,089        │
└─────────────┴──────────────┘`;
                break;
            default:
                output.textContent = 'Code executed successfully!';
        }
    }, 1500);
}

function validateYAML() {
    const button = event.target;
    const originalText = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validating...';
    
    setTimeout(() => {
        button.innerHTML = '<i class="fas fa-check"></i> Valid YAML!';
        button.style.backgroundColor = 'var(--success-color)';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.backgroundColor = '';
        }, 2000);
    }, 1000);
}

function checkCompletionStatus() {
    if (state.progress.overall === 100) {
        document.getElementById('certificate').style.display = 'block';
    }
}

function downloadCertificate() {
    // In a real app, this would generate a PDF certificate
    alert('Certificate download feature coming soon! 🎉');
}

// Mobile menu toggle
function toggleMobileMenu() {
    document.querySelector('.sidebar').classList.toggle('open');
}

// Add mobile menu button if needed
if (window.innerWidth <= 768) {
    const menuButton = document.createElement('button');
    menuButton.className = 'mobile-menu-toggle';
    menuButton.innerHTML = '<i class="fas fa-bars"></i>';
    menuButton.onclick = toggleMobileMenu;
    document.body.appendChild(menuButton);
}

// Handle window resize
window.addEventListener('resize', () => {
    const menuButton = document.querySelector('.mobile-menu-toggle');
    if (window.innerWidth <= 768) {
        if (!menuButton) {
            const button = document.createElement('button');
            button.className = 'mobile-menu-toggle';
            button.innerHTML = '<i class="fas fa-bars"></i>';
            button.onclick = toggleMobileMenu;
            document.body.appendChild(button);
        }
    } else {
        if (menuButton) {
            menuButton.remove();
        }
        document.querySelector('.sidebar').classList.remove('open');
    }
});

// Add interactive metric flow animation
function animateMetricFlow() {
    const steps = document.querySelectorAll('.journey-step');
    steps.forEach((step, index) => {
        setTimeout(() => {
            step.style.transform = 'scale(1.1)';
            setTimeout(() => {
                step.style.transform = 'scale(1)';
            }, 300);
        }, index * 500);
    });
}

// Call animation when metric journey section is visible
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.classList.contains('journey-diagram')) {
                animateMetricFlow();
            }
            entry.target.classList.add('animate-in');
        }
    });
}, { threshold: 0.1 });

const journeyDiagram = document.querySelector('.journey-diagram');
if (journeyDiagram) {
    observer.observe(journeyDiagram);
}

// Observe all feature cards and timeline items
document.querySelectorAll('.feature-card, .timeline-item, .step-card').forEach(el => {
    observer.observe(el);
});

// Initialize smooth animations
function initializeAnimations() {
    // Add stagger animation to feature cards
    document.querySelectorAll('.feature-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 100}ms`;
    });
    
    // Add hover sound effect (visual feedback)
    document.querySelectorAll('button, .nav-item').forEach(el => {
        el.addEventListener('mouseenter', () => {
            el.style.transform = 'scale(1.02)';
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'scale(1)';
        });
    });
}

// Smooth scrolling
function addSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Enhanced progress bar animation
function updateProgressWithAnimation(weekId, newProgress) {
    const badge = document.querySelector(`a[href="#${weekId}"] .progress-badge`);
    if (badge) {
        // Add animation class
        badge.classList.add('updating');
        
        // Update after animation starts
        setTimeout(() => {
            badge.textContent = `${Math.round(newProgress)}%`;
            if (newProgress === 100) {
                badge.setAttribute('data-complete', 'true');
                confetti(badge); // Celebration effect
            }
            badge.classList.remove('updating');
        }, 300);
    }
}

// Confetti celebration
function confetti(element) {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'confetti-particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.backgroundColor = ['#FFD700', '#FF69B4', '#00CED1', '#98FB98'][Math.floor(Math.random() * 4)];
        document.body.appendChild(particle);
        
        const angle = (Math.PI * 2 * i) / 20;
        const velocity = 5 + Math.random() * 5;
        const lifetime = 1000 + Math.random() * 1000;
        
        animateParticle(particle, angle, velocity, lifetime);
    }
}

function animateParticle(particle, angle, velocity, lifetime) {
    let x = 0;
    let y = 0;
    let opacity = 1;
    const gravity = 0.3;
    let velocityY = -velocity * Math.sin(angle);
    const velocityX = velocity * Math.cos(angle);
    
    const animate = () => {
        x += velocityX;
        y += velocityY;
        velocityY += gravity;
        opacity -= 1 / (lifetime / 16);
        
        particle.style.transform = `translate(${x}px, ${y}px) rotate(${x * 2}deg)`;
        particle.style.opacity = opacity;
        
        if (opacity > 0) {
            requestAnimationFrame(animate);
        } else {
            particle.remove();
        }
    };
    
    requestAnimationFrame(animate);
}

// Share achievement function
function shareAchievement() {
    const text = "I just completed the Kafka Observability Mastery Lab! 🚀 From map-reader to map-maker! #KafkaObservability #NewRelic";
    const url = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: 'Kafka Observability Mastery Achieved!',
            text: text,
            url: url
        }).catch(err => console.log('Error sharing', err));
    } else {
        // Fallback to Twitter
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    }
}

// Toggle embedded terminal
function toggleTerminal(terminalId) {
    const container = document.getElementById(`${terminalId}-container`);
    const toggle = container.previousElementSibling;
    
    container.classList.toggle('active');
    toggle.classList.toggle('active');
    
    // Initialize terminal if not already done
    if (!terminals[terminalId] && container.classList.contains('active')) {
        terminals[terminalId] = initializeTerminal(terminalId, {
            serverUrl: 'ws://localhost:3001',
            theme: 'dark',
            fontSize: 13
        });
    }
}

// Execute command in embedded terminal
function executeInEmbeddedTerminal(terminalId, command) {
    // First, make sure terminal is visible
    const container = document.getElementById(`${terminalId}-container`);
    const toggle = container.previousElementSibling;
    
    if (!container.classList.contains('active')) {
        toggleTerminal(terminalId);
    }
    
    // Wait for terminal to initialize
    setTimeout(() => {
        const terminal = terminals[terminalId];
        if (terminal) {
            terminal.elements.input.value = command;
            terminal.executeCommand();
            
            // Scroll to terminal
            container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            console.error('Terminal not initialized');
        }
    }, 300);
}

// Command templates for exercises
const exerciseCommands = {
    'week1-setup': [
        'cd labs/week1-xray',
        'docker-compose up -d',
        'docker-compose ps'
    ],
    'week1-create-topic': [
        'docker exec -it kafka-xray-broker kafka-topics --create --topic test-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1'
    ],
    'week1-generate-traffic': [
        'docker exec -d kafka-xray-broker kafka-producer-perf-test --topic test-events --num-records 100000 --record-size 100 --throughput 1000 --producer-props bootstrap.servers=localhost:9092'
    ],
    'week1-jmx': [
        'docker exec -it kafka-xray-jmxterm java -jar /jmxterm.jar'
    ]
};

// Execute a series of commands
function executeExerciseCommands(exerciseId) {
    const commands = exerciseCommands[exerciseId];
    if (!commands || !window.terminal) return;
    
    // Execute commands sequentially
    let index = 0;
    const executeNext = () => {
        if (index < commands.length) {
            window.terminal.elements.input.value = commands[index];
            window.terminal.executeCommand();
            index++;
            setTimeout(executeNext, 1000); // Wait 1 second between commands
        }
    };
    
    executeNext();
}

// Honeycomb Visualization for Queues & Streams
class HoneycombVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.topics = [
            { name: 'orders', health: 'healthy', throughput: 1250, lag: 0 },
            { name: 'payments', health: 'healthy', throughput: 890, lag: 10 },
            { name: 'inventory', health: 'healthy', throughput: 456, lag: 0 },
            { name: 'user-events', health: 'healthy', throughput: 2100, lag: 50 },
            { name: 'system-logs', health: 'healthy', throughput: 3400, lag: 0 },
            { name: 'notifications', health: 'healthy', throughput: 670, lag: 5 }
        ];
        this.init();
    }

    init() {
        this.render();
    }

    render() {
        const svg = `
            <svg viewBox="0 0 800 600" style="width: 100%; height: 100%;">
                <defs>
                    <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                        <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#333" stroke-width="1" opacity="0.1"/>
                    </pattern>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <rect width="800" height="600" fill="#1a1a1a"/>
                <rect width="800" height="600" fill="url(#grid)"/>
                
                <!-- Cluster name -->
                <text x="400" y="40" text-anchor="middle" fill="#fff" font-size="24" font-weight="bold">
                    Kafka Observability Lab Cluster
                </text>
                
                <!-- Honeycomb hexagons -->
                ${this.topics.map((topic, i) => this.createHexagon(topic, i)).join('')}
                
                <!-- Legend -->
                <g transform="translate(50, 500)">
                    <text fill="#888" font-size="14">Health Status:</text>
                    <circle cx="20" cy="30" r="8" fill="#00d084"/>
                    <text x="35" y="35" fill="#888" font-size="12">Healthy</text>
                    <circle cx="120" cy="30" r="8" fill="#ff9800"/>
                    <text x="135" y="35" fill="#888" font-size="12">Warning</text>
                    <circle cx="220" cy="30" r="8" fill="#ff5252"/>
                    <text x="235" y="35" fill="#888" font-size="12">Critical</text>
                </g>
            </svg>
        `;
        this.container.innerHTML = svg;
    }

    createHexagon(topic, index) {
        const positions = [
            { x: 200, y: 200 },
            { x: 350, y: 200 },
            { x: 500, y: 200 },
            { x: 275, y: 320 },
            { x: 425, y: 320 },
            { x: 350, y: 440 }
        ];
        
        const pos = positions[index];
        const color = this.getHealthColor(topic.health);
        const hexPath = this.getHexagonPath(pos.x, pos.y, 60);
        
        return `
            <g class="topic-hexagon" data-topic="${topic.name}">
                <path d="${hexPath}" 
                      fill="${color}" 
                      fill-opacity="0.2" 
                      stroke="${color}" 
                      stroke-width="2"
                      filter="url(#glow)"
                      style="cursor: pointer; transition: all 0.3s;"/>
                <text x="${pos.x}" y="${pos.y - 15}" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold">
                    ${topic.name}
                </text>
                <text x="${pos.x}" y="${pos.y + 5}" text-anchor="middle" fill="#aaa" font-size="12">
                    ${topic.throughput} msg/s
                </text>
                <text x="${pos.x}" y="${pos.y + 20}" text-anchor="middle" fill="${topic.lag > 100 ? '#ff9800' : '#888'}" font-size="11">
                    Lag: ${topic.lag}
                </text>
            </g>
        `;
    }

    getHexagonPath(x, y, size) {
        const angles = [0, 60, 120, 180, 240, 300];
        const points = angles.map(angle => {
            const radian = (Math.PI / 180) * angle;
            return `${x + size * Math.cos(radian)},${y + size * Math.sin(radian)}`;
        });
        return `M ${points.join(' L ')} Z`;
    }

    getHealthColor(health) {
        switch(health) {
            case 'healthy': return '#00d084';
            case 'warning': return '#ff9800';
            case 'critical': return '#ff5252';
            default: return '#666';
        }
    }

    simulateHealthy() {
        this.topics.forEach(topic => {
            topic.health = 'healthy';
            topic.lag = Math.floor(Math.random() * 50);
        });
        this.render();
    }

    simulateLag() {
        this.topics[1].health = 'warning';
        this.topics[1].lag = 5000;
        this.topics[3].health = 'critical';
        this.topics[3].lag = 15000;
        this.render();
    }

    simulateError() {
        this.topics[0].health = 'critical';
        this.topics[0].throughput = 0;
        this.topics[2].health = 'warning';
        this.render();
    }
}

// Initialize honeycomb on page load
let honeycomb;
document.addEventListener('DOMContentLoaded', () => {
    // Existing initialization code...
    
    // Initialize honeycomb if on that section
    const honeycombContainer = document.getElementById('honeycomb-demo');
    if (honeycombContainer) {
        honeycomb = new HoneycombVisualizer('honeycomb-demo');
    }
});

// Honeycomb simulation functions
function simulateHealthy() {
    if (honeycomb) honeycomb.simulateHealthy();
}

function simulateLag() {
    if (honeycomb) honeycomb.simulateLag();
}

function simulateError() {
    if (honeycomb) honeycomb.simulateError();
}