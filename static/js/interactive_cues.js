/**
 * Interactive Cue Implementations for Neural Learn Course Platform
 * Handles all interactive elements from the Kafka course
 */

class InteractiveCueManager {
    constructor() {
        this.activeInteractions = new Map();
        this.hapticFeedback = this.initHapticFeedback();
        this.soundEffects = this.initSoundEffects();
        this.particleSystem = new ParticleSystem();
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
    
    initHapticFeedback() {
        // Check for haptic feedback support
        return 'vibrate' in navigator;
    }
    
    initSoundEffects() {
        const sounds = {
            hover: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAABCxAgAEABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'),
            click: new Audio('data:audio/wav;base64,UklGRjIGAABXQVZFZm10IBAAAAABAAEARKwAABCxAgAEABAAZGF0YQoGAAB/hIuFaVVMbp23rnZFDCxpwvXUnhYDH2+78OOhUAsLT6zn88ZcBAtQqOPuyVkQC1io5e/AYRQKUavq9bllFApJmtPyvH8pBDJzy/PYdBoLN4LK79SHLwU/e73n5aZPBAlTrO74sFsGFFax7PGsWgYWaLzx56hODApMqeP1u2MTC0ep4/K9Xg4NU6zs9L9eFAlFo9XvxnkdDS2C0/Xde'),
            success: new Audio('data:audio/wav;base64,UklGRogGAABXQVZFZm10IBAAAAABAAEARKwAABCxAgAEABAAZGF0YQoGAAB3hIuDblVMcJ+9rnVFDjJzyPLRfBsEPnq77OaeRgoQW7Pr7btiFwZCk87tsnslAzSB0/fUdRYHQYbP89V+LARCiNPy0HIdBkKJzvXTgikGPYHH7N2GMgUxc77p66pTCgxVr+n1x2YVCVGo4vfOZxgJVazr88NYDg1PqN/wyHEtBjiS2PnObBYGPIfN7tyCKgU2c8Ts4ooyBSNqu+/lmj4KD1ux8+ubQQwTX7bv5ZU2CxBZr+3wsGQcCUGK0vrTeBkGPIbP8dx4Lg==')
        };
        
        // Set volume
        Object.values(sounds).forEach(sound => sound.volume = 0.1);
        return sounds;
    }
    
    triggerHaptic(pattern = [10]) {
        if (this.hapticFeedback) {
            navigator.vibrate(pattern);
        }
    }
    
    playSound(type) {
        if (this.soundEffects[type]) {
            this.soundEffects[type].currentTime = 0;
            this.soundEffects[type].play().catch(() => {});
        }
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
        
        // Track interaction in analytics
        if (window.analytics) {
            window.analytics.trackInteraction(
                segmentId, 
                interactionData.interactionType, 
                interactionData
            );
        }
    }
}

// === Enhanced Hover to Explore Handler ===
class HoverToExploreHandler extends InteractiveCueHandler {
    create(cue, segmentId) {
        const container = super.create(cue, segmentId);
        
        container.innerHTML = `
            <div class="hover-explore-container">
                <div class="hover-prompt animated-prompt">
                    <i class="fas fa-hand-pointer pulse-icon"></i>
                    <span>${cue.promptText || 'Hover over elements to explore'}</span>
                </div>
                <div class="hover-zones" id="hover-zones-${segmentId}"></div>
                <div class="hover-progress">
                    <div class="progress-bar"></div>
                </div>
            </div>
        `;
        
        return container;
    }
    
    activate(element, cue) {
        super.activate(element, cue);
        const visualElement = document.querySelector(`[data-visual-id="${cue.targetVisualId}"]`);
        
        if (visualElement) {
            // Create hover zones with smooth transitions
            this.createHoverZones(visualElement, element, cue);
            
            // Add glow effect to visual
            visualElement.classList.add('hover-target-glow');
        }
    }
    
    createHoverZones(visualElement, container, cue) {
        const zones = cue.hoverZones || this.generateDefaultZones();
        const zonesContainer = container.querySelector('.hover-zones');
        const discovered = new Set();
        
        zones.forEach((zone, index) => {
            const zoneEl = document.createElement('div');
            zoneEl.className = 'hover-zone';
            zoneEl.style.cssText = `
                left: ${zone.x}%;
                top: ${zone.y}%;
                width: ${zone.width}%;
                height: ${zone.height}%;
            `;
            
            // Hover effect with particle animation
            zoneEl.addEventListener('mouseenter', () => {
                if (!discovered.has(index)) {
                    discovered.add(index);
                    this.onZoneDiscovered(zoneEl, zone, discovered.size, zones.length);
                    window.interactiveCueManager.playSound('hover');
                    window.interactiveCueManager.triggerHaptic([5]);
                }
            });
            
            // Touch support
            zoneEl.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (!discovered.has(index)) {
                    discovered.add(index);
                    this.onZoneDiscovered(zoneEl, zone, discovered.size, zones.length);
                    window.interactiveCueManager.playSound('hover');
                    window.interactiveCueManager.triggerHaptic([5]);
                }
            });
            
            zonesContainer.appendChild(zoneEl);
        });
    }
    
    onZoneDiscovered(zoneEl, zoneData, discoveredCount, totalZones) {
        // Add discovery animation
        zoneEl.classList.add('discovered');
        
        // Create tooltip with information
        const tooltip = document.createElement('div');
        tooltip.className = 'hover-tooltip animated-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-content">
                <h4>${zoneData.title || 'Discovery!'}</h4>
                <p>${zoneData.description || 'You found a hidden detail!'}</p>
            </div>
        `;
        zoneEl.appendChild(tooltip);
        
        // Update progress
        const progress = (discoveredCount / totalZones) * 100;
        const progressBar = document.querySelector('.hover-progress .progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        // Create particle effect
        window.interactiveCueManager.particleSystem.createBurst(
            zoneEl.getBoundingClientRect(),
            'discovery'
        );
        
        // Check completion
        if (discoveredCount === totalZones) {
            this.onComplete();
        }
    }
    
    generateDefaultZones() {
        // Generate 4 default zones in quadrants
        return [
            { x: 10, y: 10, width: 30, height: 30, title: 'Top Left Detail' },
            { x: 60, y: 10, width: 30, height: 30, title: 'Top Right Detail' },
            { x: 10, y: 60, width: 30, height: 30, title: 'Bottom Left Detail' },
            { x: 60, y: 60, width: 30, height: 30, title: 'Bottom Right Detail' }
        ];
    }
    
    onComplete() {
        window.interactiveCueManager.playSound('success');
        window.interactiveCueManager.triggerHaptic([20, 50, 20]);
        
        // Completion animation
        const container = document.querySelector('.hover-explore-container');
        container.classList.add('completed');
        
        // Log completion
        this.logInteraction(this.segmentId, {
            type: 'hover_explore_completed',
            duration: Date.now() - this.startTime,
            zonesDiscovered: this.discoveredCount
        });
    }
}

// === Enhanced Drag to Distribute Handler ===
class DragToDistributeHandler extends InteractiveCueHandler {
    create(cue, segmentId) {
        const container = super.create(cue, segmentId);
        
        container.innerHTML = `
            <div class="drag-distribute-container">
                <div class="drag-prompt">
                    <i class="fas fa-arrows-alt"></i>
                    <span>${cue.promptText || 'Drag items to the correct categories'}</span>
                </div>
                <div class="drag-source" id="drag-source-${segmentId}"></div>
                <div class="drop-zones" id="drop-zones-${segmentId}"></div>
                <button class="reset-btn glass-button">
                    <i class="fas fa-redo"></i> Reset
                </button>
            </div>
        `;
        
        return container;
    }
    
    activate(element, cue) {
        super.activate(element, cue);
        this.setupDragAndDrop(element, cue);
    }
    
    setupDragAndDrop(element, cue) {
        const sourceContainer = element.querySelector('.drag-source');
        const zonesContainer = element.querySelector('.drop-zones');
        
        // Create draggable items with enhanced visuals
        const items = cue.items || cue.draggables || [];
        items.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'draggable-item glass-effect';
            itemEl.draggable = true;
            itemEl.dataset.itemId = item.id || index;
            itemEl.innerHTML = `
                <i class="${item.icon || 'fas fa-cube'}"></i>
                <span>${item.label || item}</span>
            `;
            
            // Enhanced drag events
            itemEl.addEventListener('dragstart', (e) => this.onDragStart(e, item));
            itemEl.addEventListener('dragend', (e) => this.onDragEnd(e));
            
            // Touch support
            this.addTouchSupport(itemEl, item);
            
            sourceContainer.appendChild(itemEl);
        });
        
        // Create drop zones with visual feedback
        const zones = cue.zones || cue.dropZones || [];
        zones.forEach((zone, index) => {
            const zoneEl = document.createElement('div');
            zoneEl.className = 'drop-zone glass-effect';
            zoneEl.dataset.zoneId = zone.id || index;
            zoneEl.innerHTML = `
                <h4>${zone.label}</h4>
                <div class="drop-area">
                    <i class="fas fa-inbox"></i>
                    <p>Drop items here</p>
                </div>
                <div class="dropped-items"></div>
            `;
            
            // Enhanced drop events
            zoneEl.addEventListener('dragover', (e) => this.onDragOver(e, zoneEl));
            zoneEl.addEventListener('dragleave', (e) => this.onDragLeave(e, zoneEl));
            zoneEl.addEventListener('drop', (e) => this.onDrop(e, zoneEl, cue));
            
            zonesContainer.appendChild(zoneEl);
        });
        
        // Reset button
        element.querySelector('.reset-btn').addEventListener('click', () => {
            this.reset(element, cue);
        });
    }
    
    onDragStart(e, item) {
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', JSON.stringify(item));
        
        // Visual feedback
        document.body.classList.add('dragging-active');
        window.interactiveCueManager.playSound('click');
        window.interactiveCueManager.triggerHaptic([10]);
    }
    
    onDragEnd(e) {
        e.target.classList.remove('dragging');
        document.body.classList.remove('dragging-active');
        
        // Clean up any hover states
        document.querySelectorAll('.drop-zone.drag-over').forEach(zone => {
            zone.classList.remove('drag-over');
        });
    }
    
    onDragOver(e, zoneEl) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        if (!zoneEl.classList.contains('drag-over')) {
            zoneEl.classList.add('drag-over');
            window.interactiveCueManager.playSound('hover');
        }
    }
    
    onDragLeave(e, zoneEl) {
        if (e.target === zoneEl || !zoneEl.contains(e.relatedTarget)) {
            zoneEl.classList.remove('drag-over');
        }
    }
    
    onDrop(e, zoneEl, cue) {
        e.preventDefault();
        zoneEl.classList.remove('drag-over');
        
        const item = JSON.parse(e.dataTransfer.getData('text/plain'));
        const droppedContainer = zoneEl.querySelector('.dropped-items');
        
        // Create dropped item element
        const droppedEl = document.createElement('div');
        droppedEl.className = 'dropped-item';
        droppedEl.dataset.itemId = item.id;
        droppedEl.innerHTML = `
            <i class="${item.icon || 'fas fa-cube'}"></i>
            <span>${item.label}</span>
            <button class="remove-btn">×</button>
        `;
        
        // Remove functionality
        droppedEl.querySelector('.remove-btn').addEventListener('click', () => {
            this.removeItem(droppedEl, item, cue);
        });
        
        droppedContainer.appendChild(droppedEl);
        
        // Remove original draggable
        const originalEl = document.querySelector(`[data-item-id="${item.id}"]`);
        if (originalEl) {
            originalEl.style.opacity = '0';
            setTimeout(() => originalEl.remove(), 300);
        }
        
        // Check if correct
        const isCorrect = this.checkPlacement(item, zoneEl.dataset.zoneId, cue);
        
        if (isCorrect) {
            droppedEl.classList.add('correct');
            window.interactiveCueManager.playSound('success');
            window.interactiveCueManager.particleSystem.createBurst(
                droppedEl.getBoundingClientRect(),
                'success'
            );
        } else {
            droppedEl.classList.add('incorrect');
            window.interactiveCueManager.playSound('click');
        }
        
        // Check overall completion
        this.checkCompletion(cue);
    }
    
    addTouchSupport(element, item) {
        let touchItem = null;
        let touchOffset = { x: 0, y: 0 };
        
        element.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const rect = element.getBoundingClientRect();
            
            touchOffset = {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top
            };
            
            // Create floating element
            touchItem = element.cloneNode(true);
            touchItem.classList.add('touch-dragging');
            touchItem.style.position = 'fixed';
            touchItem.style.zIndex = '1000';
            touchItem.style.left = `${touch.clientX - touchOffset.x}px`;
            touchItem.style.top = `${touch.clientY - touchOffset.y}px`;
            touchItem.style.pointerEvents = 'none';
            
            document.body.appendChild(touchItem);
            element.style.opacity = '0.5';
            
            window.interactiveCueManager.playSound('click');
            window.interactiveCueManager.triggerHaptic([10]);
        });
        
        element.addEventListener('touchmove', (e) => {
            if (!touchItem) return;
            
            const touch = e.touches[0];
            touchItem.style.left = `${touch.clientX - touchOffset.x}px`;
            touchItem.style.top = `${touch.clientY - touchOffset.y}px`;
            
            // Check for drop zones
            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
            const dropZone = elementBelow?.closest('.drop-zone');
            
            document.querySelectorAll('.drop-zone').forEach(zone => {
                zone.classList.toggle('drag-over', zone === dropZone);
            });
        });
        
        element.addEventListener('touchend', (e) => {
            if (!touchItem) return;
            
            const touch = e.changedTouches[0];
            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
            const dropZone = elementBelow?.closest('.drop-zone');
            
            if (dropZone) {
                // Simulate drop
                const dropEvent = new DragEvent('drop', {
                    dataTransfer: new DataTransfer()
                });
                dropEvent.dataTransfer.setData('text/plain', JSON.stringify(item));
                dropZone.dispatchEvent(dropEvent);
            }
            
            // Clean up
            touchItem.remove();
            touchItem = null;
            element.style.opacity = '1';
            
            document.querySelectorAll('.drop-zone').forEach(zone => {
                zone.classList.remove('drag-over');
            });
        });
    }
    
    checkPlacement(item, zoneId, cue) {
        const correctMapping = cue.correctMapping || {};
        return correctMapping[item.id] === zoneId;
    }
    
    checkCompletion(cue) {
        const items = cue.items || cue.draggables || [];
        const totalItems = items.length;
        const placedItems = document.querySelectorAll('.dropped-item').length;
        const correctItems = document.querySelectorAll('.dropped-item.correct').length;
        
        if (placedItems === totalItems) {
            const allCorrect = correctItems === totalItems;
            
            if (allCorrect) {
                this.onSuccess();
            } else {
                this.onPartialSuccess(correctItems, totalItems);
            }
        }
    }
    
    onSuccess() {
        window.interactiveCueManager.playSound('success');
        window.interactiveCueManager.triggerHaptic([50, 100, 50]);
        
        const container = document.querySelector('.drag-distribute-container');
        container.classList.add('completed');
        
        // Celebration animation
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const rect = container.getBoundingClientRect();
                window.interactiveCueManager.particleSystem.createBurst(
                    {
                        left: rect.left + Math.random() * rect.width,
                        top: rect.top + Math.random() * rect.height,
                        width: 0,
                        height: 0
                    },
                    'celebration'
                );
            }, i * 200);
        }
    }
    
    reset(element, cue) {
        // Clear all dropped items
        element.querySelectorAll('.dropped-item').forEach(item => item.remove());
        
        // Recreate source items
        const sourceContainer = element.querySelector('.drag-source');
        sourceContainer.innerHTML = '';
        
        const items = cue.items || cue.draggables || [];
        items.forEach((item) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'draggable-item glass-effect';
            itemEl.draggable = true;
            itemEl.dataset.itemId = item.id || index;
            itemEl.innerHTML = `
                <i class="${item.icon || 'fas fa-cube'}"></i>
                <span>${item.label || item}</span>
            `;
            
            itemEl.addEventListener('dragstart', (e) => this.onDragStart(e, item));
            itemEl.addEventListener('dragend', (e) => this.onDragEnd(e));
            this.addTouchSupport(itemEl, item);
            
            sourceContainer.appendChild(itemEl);
        });
        
        // Reset completion state
        element.querySelector('.drag-distribute-container').classList.remove('completed');
        
        window.interactiveCueManager.playSound('click');
    }
    
    showFeedback(container, message, type) {
        const feedback = document.createElement('div');
        feedback.className = `interaction-feedback ${type}`;
        feedback.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i> ${message}`;
        container.appendChild(feedback);
        
        setTimeout(() => feedback.remove(), 3000);
    }
    
    onPartialSuccess(correctItems, totalItems) {
        const message = `Good effort! ${correctItems} out of ${totalItems} items placed correctly.`;
        this.showFeedback(document.querySelector('.drag-distribute-container'), message, 'warning');
    }
    
    removeItem(droppedEl, item, cue) {
        // Return item to source
        const sourceContainer = document.querySelector('.drag-source');
        const itemEl = document.createElement('div');
        itemEl.className = 'draggable-item glass-effect';
        itemEl.draggable = true;
        itemEl.dataset.itemId = item.id;
        itemEl.innerHTML = `
            <i class="${item.icon || 'fas fa-cube'}"></i>
            <span>${item.label}</span>
        `;
        
        itemEl.addEventListener('dragstart', (e) => this.onDragStart(e, item));
        itemEl.addEventListener('dragend', (e) => this.onDragEnd(e));
        this.addTouchSupport(itemEl, item);
        
        sourceContainer.appendChild(itemEl);
        droppedEl.remove();
        
        window.interactiveCueManager.playSound('click');
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

// Particle System for Visual Feedback
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.animationFrame = null;
    }
    
    createBurst(rect, type = 'default') {
        const count = type === 'celebration' ? 20 : 10;
        const colors = {
            default: ['#667eea', '#764ba2', '#f093fb'],
            success: ['#48bb78', '#38a169', '#2f855a'],
            discovery: ['#63b3ed', '#4299e1', '#3182ce'],
            celebration: ['#f6ad55', '#ed8936', '#dd6b20', '#e53e3e', '#9f7aea']
        };
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: fixed;
                left: ${rect.left + rect.width / 2}px;
                top: ${rect.top + rect.height / 2}px;
                width: 8px;
                height: 8px;
                background: ${colors[type][Math.floor(Math.random() * colors[type].length)]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
            `;
            
            document.body.appendChild(particle);
            
            const angle = (Math.PI * 2 * i) / count;
            const velocity = 2 + Math.random() * 3;
            const lifetime = 1000 + Math.random() * 500;
            
            this.animateParticle(particle, angle, velocity, lifetime);
        }
    }
    
    animateParticle(particle, angle, velocity, lifetime) {
        const startTime = Date.now();
        const startX = parseFloat(particle.style.left);
        const startY = parseFloat(particle.style.top);
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / lifetime;
            
            if (progress >= 1) {
                particle.remove();
                return;
            }
            
            const x = startX + Math.cos(angle) * velocity * elapsed;
            const y = startY + Math.sin(angle) * velocity * elapsed + 0.5 * 9.8 * Math.pow(elapsed / 100, 2);
            
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.opacity = 1 - progress;
            particle.style.transform = `scale(${1 - progress * 0.5})`;
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }
}

// Initialize enhanced interactive cue manager
window.interactiveCueManager = new InteractiveCueManager();

// Export for use in main application
window.InteractiveCueManager = InteractiveCueManager;