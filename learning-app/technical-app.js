// Technical App - Q&S Extension Lab
// Global state for technical implementation
const techState = {
    currentModule: 'overview',
    milestones: {
        architecture_mapped: false,
        nri_kafka_analyzed: false,
        gap_analysis_complete: false,
        poc_implemented: false,
        tests_passing: false
    },
    moduleProgress: {
        module1: { completed: false, objectives: {} },
        module2: { completed: false, objectives: {} },
        module3: { completed: false, objectives: {} },
        module4: { completed: false, objectives: {} },
        module5: { completed: false, objectives: {} }
    },
    labData: {
        qsPayload: null,
        nriKafkaPayload: null,
        transformationRules: {}
    }
};

// Terminal instances for labs
const labTerminals = {};

// Initialize the technical app
document.addEventListener('DOMContentLoaded', () => {
    setupTechnicalNavigation();
    loadTechnicalProgress();
    initializeArchitectureDiagram();
    setupLabEnvironments();
    
    // Add professional loading animation
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// Technical Navigation
function setupTechnicalNavigation() {
    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            showTechnicalSection(sectionId);
            updateTechnicalNav(link);
        });
    });
    
    // Module objective tracking
    document.querySelectorAll('.objective-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateModuleProgress();
            checkMilestoneCompletion();
        });
    });
}

function showTechnicalSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        techState.currentModule = sectionId;
        
        // Initialize section-specific features
        if (sectionId === 'module1' && !labTerminals['m1-capture']) {
            initializeModule1Labs();
        }
    }
}

function updateTechnicalNav(activeLink) {
    document.querySelectorAll('.nav-item').forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

// Module Progress Tracking
function updateModuleProgress() {
    const currentModuleMatch = techState.currentModule.match(/module(\d)/);
    if (!currentModuleMatch) return;
    
    const moduleNum = currentModuleMatch[1];
    const checkboxes = document.querySelectorAll(`#module${moduleNum} .objective-item input[type="checkbox"]`);
    const completed = Array.from(checkboxes).filter(cb => cb.checked).length;
    const total = checkboxes.length;
    
    // Update module status
    const statusIndicator = document.getElementById(`m${moduleNum}-status`);
    if (statusIndicator) {
        if (completed === 0) {
            statusIndicator.textContent = '⚪';
            statusIndicator.classList.remove('completed', 'in-progress');
        } else if (completed < total) {
            statusIndicator.textContent = '🟡';
            statusIndicator.classList.remove('completed');
            statusIndicator.classList.add('in-progress');
        } else {
            statusIndicator.textContent = '🟢';
            statusIndicator.classList.add('completed');
            statusIndicator.classList.remove('in-progress');
            techState.moduleProgress[`module${moduleNum}`].completed = true;
        }
    }
    
    saveTechnicalProgress();
}

// Milestone Tracking
function checkMilestoneCompletion() {
    // Check specific milestones based on module completion
    if (techState.moduleProgress.module1.completed) {
        updateMilestone(1, true);
        techState.milestones.architecture_mapped = true;
    }
    
    if (techState.moduleProgress.module2.completed) {
        updateMilestone(2, true);
        techState.milestones.nri_kafka_analyzed = true;
    }
    
    if (techState.labData.transformationRules && Object.keys(techState.labData.transformationRules).length > 0) {
        updateMilestone(3, true);
        techState.milestones.gap_analysis_complete = true;
    }
}

function updateMilestone(number, completed) {
    const milestone = document.getElementById(`milestone-${number}`);
    if (milestone) {
        if (completed) {
            milestone.classList.add('completed');
        } else {
            milestone.classList.remove('completed');
        }
    }
}

// Progress Persistence
function saveTechnicalProgress() {
    localStorage.setItem('qsExtensionProgress', JSON.stringify(techState));
}

function loadTechnicalProgress() {
    const saved = localStorage.getItem('qsExtensionProgress');
    if (saved) {
        const savedState = JSON.parse(saved);
        Object.assign(techState, savedState);
        
        // Restore UI state
        Object.keys(techState.milestones).forEach((milestone, index) => {
            if (techState.milestones[milestone]) {
                updateMilestone(index + 1, true);
            }
        });
    }
}

// Lab Environment Setup
function setupEnvironment() {
    const button = event.target;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Setting up...';
    button.disabled = true;
    
    // Simulate environment setup
    setTimeout(() => {
        button.innerHTML = '<i class="fas fa-check"></i> Environment Ready';
        button.style.background = 'linear-gradient(135deg, #00d084 0%, #00a86b 100%)';
        
        // Show notification
        showNotification('Lab environment is ready! MSK and nri-kafka clusters are running.', 'success');
    }, 3000);
}

function loadSampleData() {
    // Load sample Q&S and nri-kafka data
    techState.labData.qsPayload = generateQSSampleData();
    techState.labData.nriKafkaPayload = generateNRIKafkaSampleData();
    
    showNotification('Sample data loaded. Check the Data Analyzer tool.', 'info');
}

function startModule1() {
    showTechnicalSection('module1');
    document.querySelector('a[href="#module1"]').click();
}

// Architecture Visualization
function initializeArchitectureDiagram() {
    const container = document.getElementById('qs-architecture');
    if (!container) return;
    
    // Create SVG architecture diagram
    const svg = `
        <svg viewBox="0 0 800 500" style="width: 100%; height: 100%;">
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                        refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#00d084" />
                </marker>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            
            <!-- Background -->
            <rect width="800" height="500" fill="#0f1419"/>
            
            <!-- Title -->
            <text x="400" y="30" text-anchor="middle" fill="#fff" font-size="18" font-weight="bold">
                Queues & Streams Data Flow Architecture
            </text>
            
            <!-- Data Sources -->
            <g id="data-sources">
                <rect x="50" y="100" width="150" height="80" rx="8" fill="#1a1f2e" stroke="#00d084"/>
                <text x="125" y="130" text-anchor="middle" fill="#fff" font-size="14">MSK</text>
                <text x="125" y="150" text-anchor="middle" fill="#8b92a1" font-size="12">Java Agent</text>
                
                <rect x="50" y="200" width="150" height="80" rx="8" fill="#1a1f2e" stroke="#00d084"/>
                <text x="125" y="230" text-anchor="middle" fill="#fff" font-size="14">Confluent</text>
                <text x="125" y="250" text-anchor="middle" fill="#8b92a1" font-size="12">Platform API</text>
                
                <rect x="50" y="300" width="150" height="80" rx="8" fill="#1a1f2e" stroke="#ff5252" stroke-dasharray="5,5"/>
                <text x="125" y="330" text-anchor="middle" fill="#ff5252" font-size="14">nri-kafka</text>
                <text x="125" y="350" text-anchor="middle" fill="#8b92a1" font-size="12">OHI Integration</text>
            </g>
            
            <!-- Ingestion Layer -->
            <g id="ingestion-layer">
                <rect x="300" y="150" width="200" height="180" rx="8" fill="#252a34" stroke="#00d084"/>
                <text x="400" y="180" text-anchor="middle" fill="#00d084" font-size="16" font-weight="bold">
                    Q&S Ingestion
                </text>
                <text x="400" y="210" text-anchor="middle" fill="#fff" font-size="12">Entity Mapper</text>
                <text x="400" y="230" text-anchor="middle" fill="#fff" font-size="12">Metric Transformer</text>
                <text x="400" y="250" text-anchor="middle" fill="#fff" font-size="12">Trace Context</text>
                <text x="400" y="270" text-anchor="middle" fill="#fff" font-size="12">Relationship Builder</text>
            </g>
            
            <!-- Visualization -->
            <g id="visualization">
                <rect x="600" y="150" width="150" height="180" rx="8" fill="#1a1f2e" stroke="#00d084"/>
                <text x="675" y="180" text-anchor="middle" fill="#fff" font-size="14">Honeycomb</text>
                <text x="675" y="200" text-anchor="middle" fill="#fff" font-size="14">View</text>
                
                <!-- Honeycomb preview -->
                <g transform="translate(625, 220)">
                    <path d="M 25,10 L 45,10 L 55,25 L 45,40 L 25,40 L 15,25 Z" 
                          fill="#00d084" fill-opacity="0.3" stroke="#00d084"/>
                    <path d="M 55,25 L 75,25 L 85,40 L 75,55 L 55,55 L 45,40 Z" 
                          fill="#00d084" fill-opacity="0.3" stroke="#00d084"/>
                    <path d="M 25,40 L 45,40 L 55,55 L 45,70 L 25,70 L 15,55 Z" 
                          fill="#00d084" fill-opacity="0.3" stroke="#00d084"/>
                </g>
            </g>
            
            <!-- Arrows -->
            <line x1="200" y1="140" x2="300" y2="200" stroke="#00d084" stroke-width="2" marker-end="url(#arrowhead)"/>
            <line x1="200" y1="240" x2="300" y2="240" stroke="#00d084" stroke-width="2" marker-end="url(#arrowhead)"/>
            <line x1="200" y1="340" x2="300" y2="280" stroke="#ff5252" stroke-width="2" stroke-dasharray="5,5" marker-end="url(#arrowhead)"/>
            <line x1="500" y1="240" x2="600" y2="240" stroke="#00d084" stroke-width="2" marker-end="url(#arrowhead)"/>
            
            <!-- Labels -->
            <text x="250" y="130" text-anchor="middle" fill="#8b92a1" font-size="10">Trace Context</text>
            <text x="250" y="240" text-anchor="middle" fill="#8b92a1" font-size="10">Metrics API</text>
            <text x="250" y="360" text-anchor="middle" fill="#ff5252" font-size="10">Need Adapter</text>
        </svg>
    `;
    
    container.innerHTML = svg;
}

// Data Flow Tracing
function traceDataFlow(source) {
    const paths = {
        'msk': ['data-sources', 'ingestion-layer', 'visualization'],
        'confluent': ['data-sources', 'ingestion-layer', 'visualization']
    };
    
    // Animate the flow
    let step = 0;
    const animateStep = () => {
        if (step < paths[source].length) {
            const element = document.getElementById(paths[source][step]);
            if (element) {
                element.style.filter = 'url(#glow)';
                setTimeout(() => {
                    element.style.filter = '';
                }, 1000);
            }
            step++;
            setTimeout(animateStep, 800);
        }
    };
    
    animateStep();
}

function highlightEntities() {
    showNotification('Entity Model: KafkaCluster → KafkaTopic → Producer/Consumer Services', 'info');
}

// Lab Execution
function executeLab(labId) {
    const button = event.target;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Executing...';
    button.disabled = true;
    
    // Simulate lab execution
    setTimeout(() => {
        button.innerHTML = '<i class="fas fa-check"></i> Completed';
        button.style.background = '#00d084';
        
        if (labId === 'm1-step1') {
            showLabOutput('MSK cluster started with Q&S agent\nCapturing metrics on port 8125\nHoneycomb data available at http://localhost:8080/qs');
        }
    }, 2000);
}

// Module 1 Lab Initialization
function initializeModule1Labs() {
    // Initialize capture terminal
    const captureTerminal = document.getElementById('m1-capture-terminal');
    if (captureTerminal && !labTerminals['m1-capture']) {
        labTerminals['m1-capture'] = new KafkaTerminal(captureTerminal, {
            serverUrl: 'ws://localhost:3001',
            theme: 'dark',
            prompt: 'capture> '
        });
    }
    
    // Initialize data inspector
    const dataInspector = document.getElementById('m1-data-inspector');
    if (dataInspector) {
        dataInspector.innerHTML = '<pre>' + JSON.stringify(generateQSSampleData(), null, 2) + '</pre>';
    }
    
    // Initialize entity tree
    renderEntityTree();
}

// Entity Tree Rendering
function renderEntityTree() {
    const treeContainer = document.getElementById('qs-entity-tree');
    if (!treeContainer) return;
    
    const treeHTML = `
        <div class="tree-node">
            <span class="node-toggle">▼</span> KafkaCluster
            <div class="tree-children">
                <div class="tree-node">
                    <span class="node-toggle">▼</span> KafkaTopic: orders
                    <div class="tree-children">
                        <div class="tree-node">→ Producer: order-service</div>
                        <div class="tree-node">→ Consumer: payment-service</div>
                        <div class="tree-node">→ Consumer: inventory-service</div>
                    </div>
                </div>
                <div class="tree-node">
                    <span class="node-toggle">▶</span> KafkaTopic: payments
                </div>
            </div>
        </div>
    `;
    
    treeContainer.innerHTML = treeHTML;
    
    // Add toggle functionality
    treeContainer.querySelectorAll('.node-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const children = toggle.parentElement.querySelector('.tree-children');
            if (children) {
                children.style.display = children.style.display === 'none' ? 'block' : 'none';
                toggle.textContent = children.style.display === 'none' ? '▶' : '▼';
            }
        });
    });
}

// Save Findings
function saveFindings(moduleId) {
    const findings = document.getElementById(`${moduleId}-findings`).value;
    if (!findings) {
        showNotification('Please document your findings before saving.', 'warning');
        return;
    }
    
    techState.labData[`${moduleId}_findings`] = findings;
    saveTechnicalProgress();
    showNotification('Findings saved successfully!', 'success');
}

// Data Analyzer Functions
function loadQSData() {
    const panel = document.querySelector('#qs-data-panel .data-viewer');
    panel.innerHTML = '<pre>' + JSON.stringify(generateQSSampleData(), null, 2) + '</pre>';
    showNotification('Q&S sample data loaded', 'info');
}

function loadNRIData() {
    const panel = document.querySelector('#nri-data-panel .data-viewer');
    panel.innerHTML = '<pre>' + JSON.stringify(generateNRIKafkaSampleData(), null, 2) + '</pre>';
    showNotification('nri-kafka sample data loaded', 'info');
}

function compareData() {
    const results = document.getElementById('analysis-results');
    results.innerHTML = `
        <h3>Comparison Analysis</h3>
        <div class="comparison-result">
            <h4>✅ Matching Fields</h4>
            <ul>
                <li>cluster_name → clusterName</li>
                <li>topic → topic.name</li>
                <li>broker.messagesInPerSec → messageRate</li>
            </ul>
            
            <h4>⚠️ Missing in nri-kafka</h4>
            <ul>
                <li>Producer service name (needs correlation)</li>
                <li>Consumer service name (needs correlation)</li>
                <li>Trace context headers</li>
            </ul>
            
            <h4>🔄 Transformation Required</h4>
            <ul>
                <li>Entity structure: Flat → Hierarchical</li>
                <li>Metric names: Snake case → Camel case</li>
                <li>Relationships: Implicit → Explicit</li>
            </ul>
        </div>
    `;
    
    // Update milestone
    techState.labData.transformationRules = {
        entityMapping: true,
        metricTransformation: true,
        relationshipBuilding: true
    };
    checkMilestoneCompletion();
}

// Sample Data Generators
function generateQSSampleData() {
    return {
        "entityType": "KAFKA_CLUSTER",
        "entityName": "production-kafka",
        "entities": [
            {
                "type": "KAFKA_TOPIC",
                "name": "orders",
                "attributes": {
                    "partitions": 12,
                    "replicationFactor": 3,
                    "messageRate": 1250.5,
                    "producers": ["order-service"],
                    "consumers": ["payment-service", "inventory-service"],
                    "traceContext": {
                        "enabled": true,
                        "propagationType": "w3c"
                    }
                }
            }
        ],
        "metrics": {
            "broker.messagesInPerSec": 5234.2,
            "consumer.lag": 125,
            "broker.bytesInPerSec": 1048576
        },
        "relationships": {
            "serviceToTopic": {
                "order-service": ["orders"],
                "payment-service": ["orders", "payments"]
            }
        }
    };
}

function generateNRIKafkaSampleData() {
    return {
        "name": "com.newrelic.kafka",
        "protocol_version": "3",
        "integration_version": "2.3.0",
        "data": [
            {
                "entity": {
                    "name": "production-kafka:broker:1",
                    "type": "KAFKA_BROKER"
                },
                "metrics": [
                    {
                        "event_type": "KafkaBrokerSample",
                        "cluster_name": "production-kafka",
                        "broker.messagesInPerSec": 5234.2,
                        "broker.bytesInPerSec": 1048576,
                        "broker.bytesOutPerSec": 2097152
                    }
                ],
                "inventory": {},
                "events": []
            },
            {
                "entity": {
                    "name": "production-kafka:topic:orders",
                    "type": "KAFKA_TOPIC"
                },
                "metrics": [
                    {
                        "event_type": "KafkaTopicSample",
                        "cluster_name": "production-kafka",
                        "topic": "orders",
                        "topic.partitions": 12,
                        "topic.replicationFactor": 3
                    }
                ]
            }
        ]
    };
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#00d084' : type === 'warning' ? '#ffa500' : '#1a73e8'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Lab Output Display
function showLabOutput(output) {
    const outputArea = document.createElement('div');
    outputArea.className = 'lab-output';
    outputArea.style.cssText = `
        background: #000;
        color: #00ff00;
        padding: 1rem;
        border-radius: 4px;
        margin-top: 1rem;
        font-family: monospace;
        white-space: pre-wrap;
    `;
    outputArea.textContent = output;
    
    const currentStep = document.querySelector('.lab-step:last-child');
    if (currentStep) {
        currentStep.appendChild(outputArea);
    }
}

// CSS Animations
const style = document.createElement('style');
style.textContent = `
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
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .tree-node {
        padding: 0.25rem 0;
        cursor: pointer;
        color: #e0e0e0;
    }
    
    .tree-node:hover {
        color: #00d084;
    }
    
    .tree-children {
        margin-left: 1.5rem;
        border-left: 1px solid #2a2f3e;
        padding-left: 1rem;
    }
    
    .node-toggle {
        display: inline-block;
        width: 1rem;
        color: #00d084;
    }
    
    .comparison-result {
        margin-top: 1rem;
    }
    
    .comparison-result h4 {
        color: #00d084;
        margin: 1rem 0 0.5rem;
    }
    
    .comparison-result ul {
        list-style: none;
        padding-left: 1rem;
    }
    
    .comparison-result li {
        padding: 0.25rem 0;
        color: #8b92a1;
    }
`;
document.head.appendChild(style);