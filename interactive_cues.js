/**
 * Interactive Cue Implementations for Neural Learn Course Platform
 * Handles all interactive elements from the Kafka course
 */

class InteractiveCueManager {
    constructor() {
        this.activeInteractions = new Map();
        this.interactionHandlers = {
            'hover_to_explore': new HoverToExploreHandler(),
            'drag_to_distribute': new DragToDistributeHandler(),
            'click_to_compare': new ClickToCompareHandler(),
            'simulation': new SimulationHandler(),
            'predict_value_change': new PredictValueChangeHandler(),
            'code_completion': new CodeCompletionHandler(),
            'scenario_selection': new ScenarioSelectionHandler(),
            'pause_and_reflect': new PauseAndReflectHandler(),
            'important_note': new ImportantNoteHandler(),
            'interactive_explorer': new InteractiveExplorerHandler(),
            'field_mapping_exercise': new FieldMappingHandler(),
            'ui_simulation': new UISimulationHandler()
        };
    }
    
    initialize(segmentId, interactiveCue) {
        if (!interactiveCue || !interactiveCue.cueType) return;
        
        const handler = this.interactionHandlers[interactiveCue.cueType];
        if (!handler) {
            console.warn(`No handler for interaction type: ${interactiveCue.cueType}`);
            return;
        }
        
        // Clean up any existing interaction for this segment
        this.cleanup(segmentId);
        
        // Initialize new interaction
        const container = document.getElementById('segmentContainer');
        const interactionEl = handler.create(interactiveCue, segmentId);
        
        if (interactionEl) {
            // Add to DOM
            container.appendChild(interactionEl);
            
            // Store reference
            this.activeInteractions.set(segmentId, {
                element: interactionEl,
                handler: handler,
                cue: interactiveCue
            });
            
            // Trigger at specified time if needed
            if (interactiveCue.triggerAtSeconds) {
                setTimeout(() => {
                    handler.activate(interactionEl, interactiveCue);
                }, interactiveCue.triggerAtSeconds * 1000);
            } else {
                handler.activate(interactionEl, interactiveCue);
            }
        }
    }
    
    cleanup(segmentId) {
        const interaction = this.activeInteractions.get(segmentId);
        if (interaction) {
            interaction.handler.cleanup(interaction.element);
            interaction.element.remove();
            this.activeInteractions.delete(segmentId);
        }
    }
    
    cleanupAll() {
        this.activeInteractions.forEach((interaction, segmentId) => {
            this.cleanup(segmentId);
        });
    }
}

// Base handler class
class InteractiveCueHandler {
    create(cue, segmentId) {
        const container = document.createElement('div');
        container.className = `interactive-cue ${cue.cueType.replace(/_/g, '-')}`;
        container.dataset.segmentId = segmentId;
        container.dataset.cueType = cue.cueType;
        return container;
    }
    
    activate(element, cue) {
        element.classList.add('active');
    }
    
    cleanup(element) {
        // Override in subclasses if needed
    }
    
    logInteraction(segmentId, interactionData) {
        // Send interaction data to backend
        if (window.api && window.api.logInteraction) {
            window.api.logInteraction(segmentId, interactionData);
        }
    }
}

// === Hover to Explore Handler ===
class HoverToExploreHandler extends InteractiveCueHandler {
    create(cue, segmentId) {
        const container = super.create(cue, segmentId);
        
        container.innerHTML = `
            <div class="interaction-prompt">
                <i class="fas fa-hand-pointer"></i>
                ${cue.promptText || 'Hover over elements to explore'}
            </div>
            <div class="hover-zones-container">
                ${this.createHoverZones(cue)}
            </div>
        `;
        
        this.setupHoverEvents(container, cue, segmentId);
        return container;
    }
    
    createHoverZones(cue) {
        const zones = cue.hoverZones || [];
        return zones.map((zone, index) => `
            <div class="hover-zone" data-zone-id="${index}">
                <div class="hover-zone-trigger">
                    <i class="fas fa-info-circle"></i>
                    ${zone.label || `Zone ${index + 1}`}
                </div>
                <div class="hover-zone-content">
                    ${zone.content || 'Hover content'}
                </div>
            </div>
        `).join('');
    }
    
    setupHoverEvents(container, cue, segmentId) {
        const zones = container.querySelectorAll('.hover-zone');
        const hoveredZones = new Set();
        
        zones.forEach(zone => {
            zone.addEventListener('mouseenter', () => {
                zone.classList.add('hovered');
                const zoneId = zone.dataset.zoneId;
                
                if (!hoveredZones.has(zoneId)) {
                    hoveredZones.add(zoneId);
                    this.logInteraction(segmentId, {
                        interactionType: 'hover',
                        zoneId: zoneId,
                        timestamp: Date.now()
                    });
                    
                    // Check if all zones explored
                    if (hoveredZones.size === zones.length) {
                        container.classList.add('completed');
                        this.logInteraction(segmentId, {
                            interactionType: 'hover_complete',
                            zonesExplored: hoveredZones.size
                        });
                    }
                }
            });
            
            zone.addEventListener('mouseleave', () => {
                setTimeout(() => zone.classList.remove('hovered'), 300);
            });
        });
    }
}

// === Drag to Distribute Handler ===
class DragToDistributeHandler extends InteractiveCueHandler {
    create(cue, segmentId) {
        const container = super.create(cue, segmentId);
        
        container.innerHTML = `
            <div class="interaction-prompt">
                <i class="fas fa-hand-rock"></i>
                ${cue.promptText || 'Drag items to the correct categories'}
            </div>
            <div class="drag-distribute-container">
                <div class="drag-items">
                    ${this.createDraggableItems(cue)}
                </div>
                <div class="drop-zones">
                    ${this.createDropZones(cue)}
                </div>
            </div>
            <button class="reset-btn">
                <i class="fas fa-redo"></i> Reset
            </button>
        `;
        
        this.setupDragAndDrop(container, cue, segmentId);
        return container;
    }
    
    createDraggableItems(cue) {
        const items = cue.draggables || [];
        return items.map((item, index) => `
            <div class="draggable-item" draggable="true" data-item-id="${index}">
                <i class="fas fa-grip-vertical"></i>
                ${item.label || `Item ${index + 1}`}
            </div>
        `).join('');
    }
    
    createDropZones(cue) {
        const zones = cue.dropZones || [];
        return zones.map((zone, index) => `
            <div class="drop-zone" data-zone-id="${index}">
                <h4>${zone.label || `Category ${index + 1}`}</h4>
                <div class="drop-area" data-zone-id="${index}">
                    Drop items here
                </div>
            </div>
        `).join('');
    }
    
    setupDragAndDrop(container, cue, segmentId) {
        const draggables = container.querySelectorAll('.draggable-item');
        const dropAreas = container.querySelectorAll('.drop-area');
        const resetBtn = container.querySelector('.reset-btn');
        
        let draggedElement = null;
        const placements = new Map();
        
        // Drag start
        draggables.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedElement = item;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });
            
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
        });
        
        // Drop zones
        dropAreas.forEach(area => {
            area.addEventListener('dragover', (e) => {
                e.preventDefault();
                area.classList.add('drag-over');
            });
            
            area.addEventListener('dragleave', () => {
                area.classList.remove('drag-over');
            });
            
            area.addEventListener('drop', (e) => {
                e.preventDefault();
                area.classList.remove('drag-over');
                
                if (draggedElement) {
                    // Remove from previous location
                    if (draggedElement.parentElement.classList.contains('drop-area')) {
                        draggedElement.parentElement.classList.remove('has-items');
                    }
                    
                    // Add to new location
                    area.appendChild(draggedElement);
                    area.classList.add('has-items');
                    
                    // Track placement
                    const itemId = draggedElement.dataset.itemId;
                    const zoneId = area.dataset.zoneId;
                    placements.set(itemId, zoneId);
                    
                    // Log interaction
                    this.logInteraction(segmentId, {
                        interactionType: 'drag_drop',
                        itemId: itemId,
                        zoneId: zoneId,
                        placements: Array.from(placements.entries())
                    });
                    
                    // Check if complete
                    if (placements.size === draggables.length) {
                        this.checkCorrectPlacements(container, cue, placements, segmentId);
                    }
                    
                    draggedElement = null;
                }
            });
        });
        
        // Reset button
        resetBtn.addEventListener('click', () => {
            this.resetDragAndDrop(container, draggables);
            placements.clear();
        });
    }
    
    checkCorrectPlacements(container, cue, placements, segmentId) {
        const correctMapping = cue.correctMapping || {};
        let allCorrect = true;
        
        placements.forEach((zoneId, itemId) => {
            if (correctMapping[itemId] !== zoneId) {
                allCorrect = false;
            }
        });
        
        if (allCorrect) {
            container.classList.add('completed');
            this.showFeedback(container, 'Excellent! All items correctly placed!', 'success');
        } else {
            this.showFeedback(container, 'Not quite right. Try again!', 'warning');
        }
        
        this.logInteraction(segmentId, {
            interactionType: 'drag_complete',
            isCorrect: allCorrect,
            attempts: container.dataset.attempts || 1
        });
    }
    
    resetDragAndDrop(container, draggables) {
        const itemsContainer = container.querySelector('.drag-items');
        draggables.forEach(item => {
            itemsContainer.appendChild(item);
        });
        
        container.querySelectorAll('.drop-area').forEach(area => {
            area.classList.remove('has-items');
        });
        
        container.dataset.attempts = (parseInt(container.dataset.attempts || 0) + 1).toString();
    }
    
    showFeedback(container, message, type) {
        const feedback = document.createElement('div');
        feedback.className = `interaction-feedback ${type}`;
        feedback.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i> ${message}`;
        container.appendChild(feedback);
        
        setTimeout(() => feedback.remove(), 3000);
    }
}

// === Click to Compare Handler ===
class ClickToCompareHandler extends InteractiveCueHandler {
    create(cue, segmentId) {
        const container = super.create(cue, segmentId);
        
        container.innerHTML = `
            <div class="interaction-prompt">
                <i class="fas fa-exchange-alt"></i>
                ${cue.promptText || 'Click to compare states'}
            </div>
            <div class="comparison-container">
                <div class="comparison-view" data-state="0">
                    ${cue.states && cue.states[0] ? cue.states[0].content : 'State 1'}
                </div>
                <button class="compare-toggle-btn">
                    <i class="fas fa-sync-alt"></i>
                    Toggle View
                </button>
            </div>
        `;
        
        this.setupComparison(container, cue, segmentId);
        return container;
    }
    
    setupComparison(container, cue, segmentId) {
        const view = container.querySelector('.comparison-view');
        const toggleBtn = container.querySelector('.compare-toggle-btn');
        const states = cue.states || [{content: 'State 1'}, {content: 'State 2'}];
        let currentState = 0;
        
        toggleBtn.addEventListener('click', () => {
            currentState = (currentState + 1) % states.length;
            view.dataset.state = currentState;
            
            // Animate transition
            view.style.opacity = '0';
            setTimeout(() => {
                view.innerHTML = states[currentState].content;
                view.style.opacity = '1';
            }, 300);
            
            this.logInteraction(segmentId, {
                interactionType: 'click_compare',
                newState: currentState,
                timestamp: Date.now()
            });
        });
    }
}

// === Simulation Handler ===
class SimulationHandler extends InteractiveCueHandler {
    create(cue, segmentId) {
        const container = super.create(cue, segmentId);
        const simType = cue.simulationType || 'default';
        
        container.innerHTML = `
            <div class="interaction-prompt">
                <i class="fas fa-flask"></i>
                ${cue.promptText || 'Interact with the simulation'}
            </div>
            <div class="simulation-container" data-sim-type="${simType}">
                ${this.createSimulationUI(cue)}
            </div>
        `;
        
        this.setupSimulation(container, cue, segmentId);
        return container;
    }
    
    createSimulationUI(cue) {
        // Create different UIs based on simulation type
        if (cue.simulationType === 'kafka_load') {
            return this.createKafkaLoadSimulation(cue);
        } else if (cue.simulationType === 'metric_prediction') {
            return this.createMetricPredictionSimulation(cue);
        } else {
            return this.createDefaultSimulation(cue);
        }
    }
    
    createKafkaLoadSimulation(cue) {
        return `
            <div class="kafka-sim">
                <div class="sim-controls">
                    <label>
                        Producer Rate: <span class="value-display">100</span> msg/s
                        <input type="range" class="producer-rate" min="0" max="1000" value="100">
                    </label>
                    <label>
                        Consumers: <span class="value-display">3</span>
                        <input type="range" class="consumer-count" min="1" max="10" value="3">
                    </label>
                </div>
                <div class="sim-visualization">
                    <div class="queue-viz">
                        <div class="queue-fill" style="width: 30%"></div>
                        <span class="queue-label">Queue Depth</span>
                    </div>
                    <div class="metrics">
                        <div class="metric">Lag: <span class="lag-value">0</span></div>
                        <div class="metric">Throughput: <span class="throughput-value">100</span> msg/s</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    createMetricPredictionSimulation(cue) {
        return `
            <div class="metric-sim">
                <div class="scenario-display">
                    <p>${cue.scenario || 'What happens to the metric when...'}</p>
                </div>
                <div class="prediction-options">
                    <button class="pred-option" data-value="increase">📈 Increases</button>
                    <button class="pred-option" data-value="decrease">📉 Decreases</button>
                    <button class="pred-option" data-value="stable">➡️ Stays Stable</button>
                </div>
                <div class="result-display hidden"></div>
            </div>
        `;
    }
    
    createDefaultSimulation(cue) {
        return `
            <div class="default-sim">
                <div class="sim-area">
                    <p>Interactive simulation area</p>
                    <button class="sim-action">Run Simulation</button>
                </div>
                <div class="sim-output"></div>
            </div>
        `;
    }
    
    setupSimulation(container, cue, segmentId) {
        const simType = cue.simulationType;
        
        if (simType === 'kafka_load') {
            this.setupKafkaLoadSim(container, cue, segmentId);
        } else if (simType === 'metric_prediction') {
            this.setupMetricPredictionSim(container, cue, segmentId);
        } else {
            this.setupDefaultSim(container, cue, segmentId);
        }
    }
    
    setupKafkaLoadSim(container, cue, segmentId) {
        const producerRate = container.querySelector('.producer-rate');
        const consumerCount = container.querySelector('.consumer-count');
        const queueFill = container.querySelector('.queue-fill');
        const lagValue = container.querySelector('.lag-value');
        const throughputValue = container.querySelector('.throughput-value');
        
        const updateSimulation = () => {
            const rate = parseInt(producerRate.value);
            const consumers = parseInt(consumerCount.value);
            const consumerCapacity = consumers * 50; // Each consumer can handle 50 msg/s
            
            const lag = Math.max(0, rate - consumerCapacity);
            const queueDepth = Math.min(100, (lag / 10));
            
            // Update displays
            producerRate.previousElementSibling.textContent = rate;
            consumerCount.previousElementSibling.textContent = consumers;
            
            queueFill.style.width = `${queueDepth}%`;
            queueFill.style.backgroundColor = queueDepth > 80 ? '#fc8181' : 
                                            queueDepth > 50 ? '#f6ad55' : '#48bb78';
            
            lagValue.textContent = lag;
            throughputValue.textContent = Math.min(rate, consumerCapacity);
            
            this.logInteraction(segmentId, {
                interactionType: 'simulation_adjust',
                producerRate: rate,
                consumers: consumers,
                lag: lag
            });
        };
        
        producerRate.addEventListener('input', updateSimulation);
        consumerCount.addEventListener('input', updateSimulation);
    }
    
    setupMetricPredictionSim(container, cue, segmentId) {
        const options = container.querySelectorAll('.pred-option');
        const resultDisplay = container.querySelector('.result-display');
        
        options.forEach(option => {
            option.addEventListener('click', () => {
                const prediction = option.dataset.value;
                const correct = prediction === cue.correctAnswer;
                
                // Show result
                resultDisplay.innerHTML = correct ? 
                    `<i class="fas fa-check-circle"></i> Correct! ${cue.explanation || ''}` :
                    `<i class="fas fa-times-circle"></i> Not quite. ${cue.hint || 'Think about it...'}`;
                
                resultDisplay.className = `result-display ${correct ? 'correct' : 'incorrect'}`;
                
                this.logInteraction(segmentId, {
                    interactionType: 'prediction',
                    prediction: prediction,
                    isCorrect: correct
                });
            });
        });
    }
    
    setupDefaultSim(container, cue, segmentId) {
        const actionBtn = container.querySelector('.sim-action');
        const output = container.querySelector('.sim-output');
        
        actionBtn.addEventListener('click', () => {
            output.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running simulation...';
            
            setTimeout(() => {
                output.innerHTML = '<i class="fas fa-check"></i> Simulation complete!';
                this.logInteraction(segmentId, {
                    interactionType: 'simulation_run',
                    timestamp: Date.now()
                });
            }, 2000);
        });
    }
}

// === Predict Value Change Handler ===
class PredictValueChangeHandler extends InteractiveCueHandler {
    create(cue, segmentId) {
        const container = super.create(cue, segmentId);
        
        container.innerHTML = `
            <div class="interaction-prompt">
                <i class="fas fa-chart-line"></i>
                ${cue.promptText || 'Predict how the value will change'}
            </div>
            <div class="prediction-container">
                <div class="scenario-box">
                    ${cue.scenario || 'Given this scenario...'}
                </div>
                <div class="prediction-options">
                    ${this.createPredictionOptions(cue)}
                </div>
                <div class="feedback-area hidden"></div>
            </div>
        `;
        
        this.setupPrediction(container, cue, segmentId);
        return container;
    }
    
    createPredictionOptions(cue) {
        const options = cue.options || ['Increase', 'Decrease', 'Stay Same', 'Fluctuate'];
        return options.map((option, index) => `
            <button class="prediction-btn" data-option="${index}">
                ${this.getOptionIcon(option)} ${option}
            </button>
        `).join('');
    }
    
    getOptionIcon(option) {
        const icons = {
            'Increase': '📈',
            'Decrease': '📉',
            'Stay Same': '➡️',
            'Fluctuate': '📊',
            'Caps at timeout': '⏱️',
            'Resets to zero': '🔄',
            'Grows continuously': '📈',
            'Stays constant': '⏸️'
        };
        return icons[option] || '❓';
    }
    
    setupPrediction(container, cue, segmentId) {
        const buttons = container.querySelectorAll('.prediction-btn');
        const feedback = container.querySelector('.feedback-area');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const optionIndex = parseInt(btn.dataset.option);
                const isCorrect = optionIndex === cue.correctAnswer;
                
                // Disable all buttons
                buttons.forEach(b => b.disabled = true);
                btn.classList.add(isCorrect ? 'correct' : 'incorrect');
                
                // Show feedback
                feedback.innerHTML = `
                    <div class="prediction-result ${isCorrect ? 'correct' : 'incorrect'}">
                        <i class="fas fa-${isCorrect ? 'check' : 'times'}-circle"></i>
                        ${isCorrect ? 'Correct!' : 'Not quite.'}
                        <p>${cue.explanation || ''}</p>
                    </div>
                `;
                feedback.classList.remove('hidden');
                
                this.logInteraction(segmentId, {
                    interactionType: 'value_prediction',
                    selectedOption: optionIndex,
                    isCorrect: isCorrect
                });
            });
        });
    }
}

// === Code Completion Handler ===
class CodeCompletionHandler extends InteractiveCueHandler {
    create(cue, segmentId) {
        const container = super.create(cue, segmentId);
        
        container.innerHTML = `
            <div class="interaction-prompt">
                <i class="fas fa-code"></i>
                ${cue.promptText || 'Complete the code'}
            </div>
            <div class="code-completion-container">
                <pre class="code-template">${this.formatCodeTemplate(cue.template)}</pre>
                <div class="completion-input">
                    <textarea placeholder="Type your answer here..." rows="3"></textarea>
                    <button class="submit-code-btn">Submit</button>
                </div>
                <div class="code-feedback hidden"></div>
            </div>
        `;
        
        this.setupCodeCompletion(container, cue, segmentId);
        return container;
    }
    
    formatCodeTemplate(template) {
        // Highlight the blanks in the template
        return (template || 'function example() { ___ }')
            .replace(/___/g, '<span class="code-blank">___</span>');
    }
    
    setupCodeCompletion(container, cue, segmentId) {
        const textarea = container.querySelector('textarea');
        const submitBtn = container.querySelector('.submit-code-btn');
        const feedback = container.querySelector('.code-feedback');
        
        submitBtn.addEventListener('click', () => {
            const answer = textarea.value.trim();
            const isCorrect = answer === cue.correctAnswer;
            
            feedback.innerHTML = `
                <div class="code-result ${isCorrect ? 'correct' : 'incorrect'}">
                    <i class="fas fa-${isCorrect ? 'check' : 'times'}-circle"></i>
                    ${isCorrect ? 'Perfect!' : 'Not quite right.'}
                    ${!isCorrect && cue.hint ? `<p class="hint">Hint: ${cue.hint}</p>` : ''}
                </div>
            `;
            feedback.classList.remove('hidden');
            
            if (isCorrect) {
                textarea.disabled = true;
                submitBtn.disabled = true;
            }
            
            this.logInteraction(segmentId, {
                interactionType: 'code_completion',
                answer: answer,
                isCorrect: isCorrect,
                attempts: parseInt(container.dataset.attempts || '0') + 1
            });
            
            container.dataset.attempts = (parseInt(container.dataset.attempts || '0') + 1).toString();
        });
    }
}

// === Scenario Selection Handler ===
class ScenarioSelectionHandler extends InteractiveCueHandler {
    create(cue, segmentId) {
        const container = super.create(cue, segmentId);
        
        container.innerHTML = `
            <div class="interaction-prompt">
                <i class="fas fa-route"></i>
                ${cue.promptText || 'Select the best scenario'}
            </div>
            <div class="scenarios-container">
                ${this.createScenarios(cue)}
            </div>
            <div class="scenario-feedback hidden"></div>
        `;
        
        this.setupScenarioSelection(container, cue, segmentId);
        return container;
    }
    
    createScenarios(cue) {
        const scenarios = cue.scenarios || [];
        return scenarios.map((scenario, index) => `
            <div class="scenario-card" data-scenario="${index}">
                <h4>${scenario.title || `Scenario ${index + 1}`}</h4>
                <p>${scenario.description}</p>
                <button class="select-scenario-btn">Select This</button>
            </div>
        `).join('');
    }
    
    setupScenarioSelection(container, cue, segmentId) {
        const cards = container.querySelectorAll('.scenario-card');
        const feedback = container.querySelector('.scenario-feedback');
        
        cards.forEach(card => {
            const btn = card.querySelector('.select-scenario-btn');
            
            btn.addEventListener('click', () => {
                const scenarioIndex = parseInt(card.dataset.scenario);
                const correctAnswers = cue.correctAnswers || [];
                const isCorrect = correctAnswers.includes(scenarioIndex);
                
                // Disable all buttons
                container.querySelectorAll('.select-scenario-btn').forEach(b => b.disabled = true);
                
                // Mark selection
                card.classList.add(isCorrect ? 'correct-choice' : 'incorrect-choice');
                
                // Show correct answers
                correctAnswers.forEach(idx => {
                    cards[idx].classList.add('correct-answer');
                });
                
                // Show feedback
                feedback.innerHTML = `
                    <div class="scenario-result ${isCorrect ? 'correct' : 'incorrect'}">
                        <i class="fas fa-${isCorrect ? 'check' : 'info'}-circle"></i>
                        ${isCorrect ? 'Good choice!' : 'Consider this...'}
                        <p>${cue.feedback || ''}</p>
                    </div>
                `;
                feedback.classList.remove('hidden');
                
                this.logInteraction(segmentId, {
                    interactionType: 'scenario_selection',
                    selected: scenarioIndex,
                    isCorrect: isCorrect
                });
            });
        });
    }
}

// === Pause and Reflect Handler ===
class PauseAndReflectHandler extends InteractiveCueHandler {
    create(cue, segmentId) {
        const container = super.create(cue, segmentId);
        
        container.innerHTML = `
            <div class="pause-reflect-container">
                <div class="reflection-icon">
                    <i class="fas fa-pause-circle fa-3x"></i>
                </div>
                <div class="reflection-prompt">
                    ${cue.promptText || 'Take a moment to reflect...'}
                </div>
                <div class="reflection-timer">
                    <div class="timer-fill"></div>
                </div>
            </div>
        `;
        
        this.startReflectionTimer(container, cue, segmentId);
        return container;
    }
    
    startReflectionTimer(container, cue, segmentId) {
        const timerFill = container.querySelector('.timer-fill');
        const duration = (cue.revealDelay || 5) * 1000;
        
        // Start timer animation
        timerFill.style.transition = `width ${duration}ms linear`;
        setTimeout(() => {
            timerFill.style.width = '100%';
        }, 10);
        
        // Auto-hide after duration
        setTimeout(() => {
            container.style.opacity = '0';
            setTimeout(() => container.remove(), 500);
            
            this.logInteraction(segmentId, {
                interactionType: 'reflection_complete',
                duration: duration
            });
        }, duration);
    }
}

// === Important Note Handler ===
class ImportantNoteHandler extends InteractiveCueHandler {
    create(cue, segmentId) {
        const container = super.create(cue, segmentId);
        
        container.innerHTML = `
            <div class="important-note-container">
                <div class="note-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="note-content">
                    ${cue.promptText || 'Important information'}
                </div>
                <button class="dismiss-note-btn">Got it!</button>
            </div>
        `;
        
        this.setupImportantNote(container, cue, segmentId);
        return container;
    }
    
    setupImportantNote(container, cue, segmentId) {
        const dismissBtn = container.querySelector('.dismiss-note-btn');
        const displayDuration = (cue.displayDuration || 10) * 1000;
        
        // Auto-dismiss timer
        const autoDismissTimer = setTimeout(() => {
            this.dismissNote(container, segmentId);
        }, displayDuration);
        
        // Manual dismiss
        dismissBtn.addEventListener('click', () => {
            clearTimeout(autoDismissTimer);
            this.dismissNote(container, segmentId);
        });
    }
    
    dismissNote(container, segmentId) {
        container.style.opacity = '0';
        setTimeout(() => container.remove(), 300);
        
        this.logInteraction(segmentId, {
            interactionType: 'note_dismissed',
            timestamp: Date.now()
        });
    }
}

// === Interactive Explorer Handler ===
class InteractiveExplorerHandler extends InteractiveCueHandler {
    create(cue, segmentId) {
        const container = super.create(cue, segmentId);
        
        container.innerHTML = `
            <div class="interaction-prompt">
                <i class="fas fa-compass"></i>
                ${cue.promptText || 'Click to explore'}
            </div>
            <div class="explorer-container">
                ${this.createExplorationPoints(cue)}
            </div>
            <div class="explorer-details hidden"></div>
        `;
        
        this.setupExplorer(container, cue, segmentId);
        return container;
    }
    
    createExplorationPoints(cue) {
        const points = cue.explorationPoints || [];
        return `
            <div class="exploration-map">
                ${points.map((point, index) => `
                    <div class="exploration-point" 
                         data-point="${index}"
                         style="left: ${point.x || 50}%; top: ${point.y || 50}%;">
                        <i class="fas fa-map-pin"></i>
                        <span class="point-label">${point.label || index + 1}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    setupExplorer(container, cue, segmentId) {
        const points = container.querySelectorAll('.exploration-point');
        const details = container.querySelector('.explorer-details');
        const explorationPoints = cue.explorationPoints || [];
        
        points.forEach(point => {
            point.addEventListener('click', () => {
                const pointIndex = parseInt(point.dataset.point);
                const pointData = explorationPoints[pointIndex];
                
                // Mark as explored
                point.classList.add('explored');
                
                // Show details
                details.innerHTML = `
                    <h4>${pointData.label}</h4>
                    <p>${pointData.details || 'Exploration details'}</p>
                `;
                details.classList.remove('hidden');
                
                this.logInteraction(segmentId, {
                    interactionType: 'explore_point',
                    pointIndex: pointIndex,
                    explored: container.querySelectorAll('.explored').length,
                    total: points.length
                });
            });
        });
    }
}

// === Field Mapping Exercise Handler ===
class FieldMappingHandler extends InteractiveCueHandler {
    create(cue, segmentId) {
        const container = super.create(cue, segmentId);
        
        container.innerHTML = `
            <div class="interaction-prompt">
                <i class="fas fa-project-diagram"></i>
                ${cue.promptText || 'Connect the matching fields'}
            </div>
            <div class="field-mapping-container">
                <div class="source-fields">
                    <h4>Source</h4>
                    ${this.createFields(cue.mappings, 'source')}
                </div>
                <div class="mapping-lines">
                    <svg class="connection-svg"></svg>
                </div>
                <div class="target-fields">
                    <h4>Target</h4>
                    ${this.createFields(cue.mappings, 'target')}
                </div>
            </div>
            <button class="check-mapping-btn">Check Mappings</button>
            <div class="mapping-feedback hidden"></div>
        `;
        
        this.setupFieldMapping(container, cue, segmentId);
        return container;
    }
    
    createFields(mappings, type) {
        if (!mappings || mappings.length === 0) return '';
        
        const fields = mappings.map(m => type === 'source' ? m.kafka : m.correct);
        return fields.map((field, index) => `
            <div class="field-item" data-field="${index}" data-type="${type}">
                ${field}
            </div>
        `).join('');
    }
    
    setupFieldMapping(container, cue, segmentId) {
        const sourceFields = container.querySelectorAll('.source-fields .field-item');
        const targetFields = container.querySelectorAll('.target-fields .field-item');
        const svg = container.querySelector('.connection-svg');
        const checkBtn = container.querySelector('.check-mapping-btn');
        const feedback = container.querySelector('.mapping-feedback');
        
        let selectedSource = null;
        const connections = new Map();
        
        // Source field selection
        sourceFields.forEach(field => {
            field.addEventListener('click', () => {
                if (selectedSource) {
                    selectedSource.classList.remove('selected');
                }
                selectedSource = field;
                field.classList.add('selected');
            });
        });
        
        // Target field selection
        targetFields.forEach(field => {
            field.addEventListener('click', () => {
                if (selectedSource) {
                    const sourceIndex = selectedSource.dataset.field;
                    const targetIndex = field.dataset.field;
                    
                    // Create connection
                    connections.set(sourceIndex, targetIndex);
                    this.drawConnection(svg, selectedSource, field);
                    
                    selectedSource.classList.remove('selected');
                    selectedSource.classList.add('connected');
                    field.classList.add('connected');
                    
                    selectedSource = null;
                }
            });
        });
        
        // Check mappings
        checkBtn.addEventListener('click', () => {
            const correct = this.checkMappings(connections, cue.mappings);
            
            feedback.innerHTML = `
                <div class="mapping-result ${correct ? 'correct' : 'incorrect'}">
                    <i class="fas fa-${correct ? 'check' : 'times'}-circle"></i>
                    ${correct ? 'Perfect! All mappings are correct!' : 'Some mappings are incorrect. Try again!'}
                </div>
            `;
            feedback.classList.remove('hidden');
            
            this.logInteraction(segmentId, {
                interactionType: 'field_mapping_check',
                connections: Array.from(connections.entries()),
                isCorrect: correct
            });
        });
    }
    
    drawConnection(svg, source, target) {
        const sourceRect = source.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const svgRect = svg.getBoundingClientRect();
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', sourceRect.right - svgRect.left);
        line.setAttribute('y1', sourceRect.top + sourceRect.height/2 - svgRect.top);
        line.setAttribute('x2', targetRect.left - svgRect.left);
        line.setAttribute('y2', targetRect.top + targetRect.height/2 - svgRect.top);
        line.setAttribute('stroke', '#667eea');
        line.setAttribute('stroke-width', '2');
        
        svg.appendChild(line);
    }
    
    checkMappings(connections, correctMappings) {
        if (connections.size !== correctMappings.length) return false;
        
        for (let i = 0; i < correctMappings.length; i++) {
            if (connections.get(i.toString()) !== i.toString()) {
                return false;
            }
        }
        return true;
    }
}

// === UI Simulation Handler ===
class UISimulationHandler extends InteractiveCueHandler {
    create(cue, segmentId) {
        const container = super.create(cue, segmentId);
        
        container.innerHTML = `
            <div class="interaction-prompt">
                <i class="fas fa-desktop"></i>
                ${cue.promptText || 'Try the UI simulation'}
            </div>
            <div class="ui-simulation-container">
                ${this.createUISimulation(cue)}
            </div>
        `;
        
        this.setupUISimulation(container, cue, segmentId);
        return container;
    }
    
    createUISimulation(cue) {
        // Create mock UI based on simulation type
        if (cue.simulationType === 'filter_demo') {
            return `
                <div class="mock-ui filter-ui">
                    <div class="filter-bar">
                        <input type="text" class="filter-input" placeholder="Type to filter...">
                        <button class="filter-btn"><i class="fas fa-search"></i></button>
                    </div>
                    <div class="filter-results">
                        <div class="result-item">payment-processors</div>
                        <div class="result-item">order-validators</div>
                        <div class="result-item">payment-enrichers</div>
                        <div class="result-item">fraud-detectors</div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="mock-ui default-ui">
                    <div class="ui-header">Mock Application</div>
                    <div class="ui-content">
                        <button class="ui-action">Click Me</button>
                    </div>
                </div>
            `;
        }
    }
    
    setupUISimulation(container, cue, segmentId) {
        if (cue.simulationType === 'filter_demo') {
            this.setupFilterDemo(container, cue, segmentId);
        } else {
            this.setupDefaultUI(container, cue, segmentId);
        }
    }
    
    setupFilterDemo(container, cue, segmentId) {
        const filterInput = container.querySelector('.filter-input');
        const results = container.querySelectorAll('.result-item');
        
        filterInput.addEventListener('input', (e) => {
            const filter = e.target.value.toLowerCase();
            
            results.forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(filter) ? 'block' : 'none';
            });
            
            this.logInteraction(segmentId, {
                interactionType: 'ui_filter',
                filterValue: filter
            });
        });
    }
    
    setupDefaultUI(container, cue, segmentId) {
        const actionBtn = container.querySelector('.ui-action');
        
        actionBtn.addEventListener('click', () => {
            actionBtn.textContent = 'Clicked!';
            
            this.logInteraction(segmentId, {
                interactionType: 'ui_click',
                element: 'action_button'
            });
        });
    }
}

// Export for use in main application
window.InteractiveCueManager = InteractiveCueManager;