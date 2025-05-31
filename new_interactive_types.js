/**
 * New Interactive Types for Track 2
 * Adds 8 new interaction types to reach total of 20
 */

// === Timeline Scrubber Handler ===
class TimelineScrubberHandler extends InteractiveCueHandler {
    create(cue, segmentId) {
        const container = super.create(cue, segmentId);
        
        container.innerHTML = `
            <div class="timeline-scrubber-container">
                <div class="timeline-prompt">
                    <i class="fas fa-history"></i>
                    <span>${cue.promptText || 'Drag to explore the timeline'}</span>
                </div>
                <div class="timeline-display">
                    <div class="timeline-track">
                        <div class="timeline-progress"></div>
                        <div class="timeline-handle" draggable="true">
                            <i class="fas fa-grip-vertical"></i>
                        </div>
                        <div class="timeline-markers"></div>
                    </div>
                    <div class="timeline-info glass-effect">
                        <h4 class="timeline-title">Start</h4>
                        <p class="timeline-description">Drag the handle to begin exploring</p>
                    </div>
                </div>
            </div>
        `;
        
        return container;
    }
    
    activate(element, cue) {
        super.activate(element, cue);
        this.setupTimeline(element, cue);
    }
    
    setupTimeline(element, cue) {
        const handle = element.querySelector('.timeline-handle');
        const track = element.querySelector('.timeline-track');
        const progress = element.querySelector('.timeline-progress');
        const info = element.querySelector('.timeline-info');
        const markers = element.querySelector('.timeline-markers');
        
        const events = cue.timelineEvents || [];
        let isDragging = false;
        let currentPosition = 0;
        
        // Create markers for events
        events.forEach((event, index) => {
            const marker = document.createElement('div');
            marker.className = 'timeline-marker';
            marker.style.left = `${event.position}%`;
            marker.dataset.eventIndex = index;
            
            marker.innerHTML = `
                <div class="marker-dot"></div>
                <div class="marker-label">${event.label || ''}</div>
            `;
            
            markers.appendChild(marker);
        });
        
        const updateTimeline = (percentage) => {
            currentPosition = Math.max(0, Math.min(100, percentage));
            handle.style.left = `${currentPosition}%`;
            progress.style.width = `${currentPosition}%`;
            
            // Find nearest event
            const nearestEvent = this.findNearestEvent(currentPosition, events);
            if (nearestEvent) {
                this.updateInfo(info, nearestEvent);
                
                // Highlight marker
                markers.querySelectorAll('.timeline-marker').forEach(m => {
                    m.classList.toggle('active', 
                        parseInt(m.dataset.eventIndex) === events.indexOf(nearestEvent));
                });
            }
        };
        
        // Mouse events
        handle.addEventListener('mousedown', (e) => {
            isDragging = true;
            handle.classList.add('dragging');
            window.interactiveCueManager.playSound('click');
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const rect = track.getBoundingClientRect();
            const percentage = ((e.clientX - rect.left) / rect.width) * 100;
            updateTimeline(percentage);
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                handle.classList.remove('dragging');
                
                this.logInteraction(element.dataset.segmentId, {
                    type: 'timeline_scrub',
                    position: currentPosition,
                    timestamp: Date.now()
                });
            }
        });
        
        // Touch support
        this.addTouchSupport(handle, track, updateTimeline);
        
        // Click on track to jump
        track.addEventListener('click', (e) => {
            if (e.target === handle || handle.contains(e.target)) return;
            
            const rect = track.getBoundingClientRect();
            const percentage = ((e.clientX - rect.left) / rect.width) * 100;
            updateTimeline(percentage);
            
            window.interactiveCueManager.playSound('click');
        });
    }
    
    findNearestEvent(position, events) {
        let nearest = null;
        let minDistance = Infinity;
        
        events.forEach(event => {
            const distance = Math.abs(event.position - position);
            if (distance < minDistance && distance < 10) {
                minDistance = distance;
                nearest = event;
            }
        });
        
        return nearest;
    }
    
    updateInfo(infoElement, event) {
        const title = infoElement.querySelector('.timeline-title');
        const description = infoElement.querySelector('.timeline-description');
        
        title.textContent = event.title || 'Event';
        description.textContent = event.description || '';
        
        // Animation
        infoElement.style.opacity = '0';
        setTimeout(() => {
            infoElement.style.opacity = '1';
        }, 100);
        
        window.interactiveCueManager.playSound('hover');
    }
}

// === Pattern Matcher Handler ===
class PatternMatcherHandler extends InteractiveCueHandler {
    create(cue, segmentId) {
        const container = super.create(cue, segmentId);
        
        container.innerHTML = `
            <div class="pattern-matcher-container">
                <div class="pattern-prompt">
                    <i class="fas fa-th"></i>
                    <span>${cue.promptText || 'Match the pattern sequence'}</span>
                </div>
                <div class="pattern-game">
                    <div class="pattern-display glass-effect">
                        <div class="pattern-grid"></div>
                    </div>
                    <div class="pattern-controls">
                        <button class="pattern-btn" data-value="0">
                            <i class="fas fa-square"></i>
                        </button>
                        <button class="pattern-btn" data-value="1">
                            <i class="fas fa-circle"></i>
                        </button>
                        <button class="pattern-btn" data-value="2">
                            <i class="fas fa-star"></i>
                        </button>
                        <button class="pattern-btn" data-value="3">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                    <div class="pattern-progress">
                        <div class="progress-bar"></div>
                    </div>
                </div>
            </div>
        `;
        
        return container;
    }
    
    activate(element, cue) {
        super.activate(element, cue);
        this.setupPatternGame(element, cue);
    }
    
    setupPatternGame(element, cue) {
        const grid = element.querySelector('.pattern-grid');
        const controls = element.querySelectorAll('.pattern-btn');
        const progressBar = element.querySelector('.progress-bar');
        
        const patterns = cue.patterns || this.generateDefaultPatterns();
        let currentLevel = 0;
        let userPattern = [];
        let isShowingPattern = false;
        
        const showPattern = (pattern) => {
            isShowingPattern = true;
            grid.innerHTML = '';
            
            pattern.forEach((value, index) => {
                setTimeout(() => {
                    const cell = document.createElement('div');
                    cell.className = 'pattern-cell active';
                    cell.innerHTML = this.getPatternIcon(value);
                    grid.appendChild(cell);
                    
                    window.interactiveCueManager.playSound('hover');
                    
                    setTimeout(() => cell.classList.remove('active'), 500);
                }, index * 600);
            });
            
            setTimeout(() => {
                isShowingPattern = false;
                grid.innerHTML = '<p>Your turn!</p>';
            }, pattern.length * 600 + 500);
        };
        
        const checkPattern = () => {
            const currentPattern = patterns[currentLevel];
            const isCorrect = JSON.stringify(userPattern) === JSON.stringify(currentPattern);
            
            if (isCorrect) {
                window.interactiveCueManager.playSound('success');
                window.interactiveCueManager.triggerHaptic([50, 100, 50]);
                
                currentLevel++;
                const progress = (currentLevel / patterns.length) * 100;
                progressBar.style.width = `${progress}%`;
                
                if (currentLevel < patterns.length) {
                    userPattern = [];
                    setTimeout(() => showPattern(patterns[currentLevel]), 1000);
                } else {
                    this.onComplete(element);
                }
            } else {
                window.interactiveCueManager.playSound('click');
                window.interactiveCueManager.triggerHaptic([100, 50, 100]);
                
                userPattern = [];
                grid.innerHTML = '<p class="error">Try again!</p>';
                setTimeout(() => showPattern(currentPattern), 1500);
            }
            
            this.logInteraction(element.dataset.segmentId, {
                type: 'pattern_attempt',
                level: currentLevel,
                success: isCorrect,
                pattern: userPattern
            });
        };
        
        // Control buttons
        controls.forEach(btn => {
            btn.addEventListener('click', () => {
                if (isShowingPattern) return;
                
                const value = parseInt(btn.dataset.value);
                userPattern.push(value);
                
                // Visual feedback
                btn.classList.add('pressed');
                setTimeout(() => btn.classList.remove('pressed'), 200);
                
                window.interactiveCueManager.playSound('click');
                
                // Add to display
                const cell = document.createElement('div');
                cell.className = 'pattern-cell user-input';
                cell.innerHTML = this.getPatternIcon(value);
                
                if (grid.querySelector('p')) {
                    grid.innerHTML = '';
                }
                grid.appendChild(cell);
                
                // Check if pattern complete
                if (userPattern.length === patterns[currentLevel].length) {
                    setTimeout(checkPattern, 500);
                }
            });
        });
        
        // Start game
        showPattern(patterns[0]);
    }
    
    getPatternIcon(value) {
        const icons = [
            '<i class="fas fa-square"></i>',
            '<i class="fas fa-circle"></i>',
            '<i class="fas fa-star"></i>',
            '<i class="fas fa-heart"></i>'
        ];
        return icons[value] || icons[0];
    }
    
    generateDefaultPatterns() {
        return [
            [0, 1, 0],
            [1, 2, 1, 2],
            [0, 1, 2, 1, 0],
            [3, 2, 1, 0, 1, 2, 3]
        ];
    }
    
    onComplete(element) {
        const container = element.querySelector('.pattern-matcher-container');
        container.classList.add('completed');
        
        const grid = element.querySelector('.pattern-grid');
        grid.innerHTML = '<h3>🎉 Pattern Master!</h3><p>You completed all patterns!</p>';
        
        // Celebration
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                window.interactiveCueManager.particleSystem.createBurst(
                    grid.getBoundingClientRect(),
                    'celebration'
                );
            }, i * 200);
        }
    }
}

// === Code Sandbox Handler ===
class CodeSandboxHandler extends InteractiveCueHandler {
    create(cue, segmentId) {
        const container = super.create(cue, segmentId);
        
        container.innerHTML = `
            <div class="code-sandbox-container">
                <div class="sandbox-prompt">
                    <i class="fas fa-code"></i>
                    <span>${cue.promptText || 'Write and test your code'}</span>
                </div>
                <div class="sandbox-editor glass-effect">
                    <div class="editor-header">
                        <span class="file-name">${cue.fileName || 'main.js'}</span>
                        <button class="run-btn">
                            <i class="fas fa-play"></i> Run
                        </button>
                    </div>
                    <div class="editor-content">
                        <div class="line-numbers"></div>
                        <textarea class="code-input" placeholder="// Write your code here...">${cue.starterCode || ''}</textarea>
                    </div>
                </div>
                <div class="sandbox-output glass-effect">
                    <div class="output-header">
                        <i class="fas fa-terminal"></i> Output
                    </div>
                    <div class="output-content">
                        <pre class="output-text">Ready to run...</pre>
                    </div>
                </div>
                <div class="test-cases">
                    <h4>Test Cases</h4>
                    <div class="test-list"></div>
                </div>
            </div>
        `;
        
        return container;
    }
    
    activate(element, cue) {
        super.activate(element, cue);
        this.setupCodeSandbox(element, cue);
    }
    
    setupCodeSandbox(element, cue) {
        const codeInput = element.querySelector('.code-input');
        const runBtn = element.querySelector('.run-btn');
        const output = element.querySelector('.output-text');
        const lineNumbers = element.querySelector('.line-numbers');
        const testList = element.querySelector('.test-list');
        
        const testCases = cue.testCases || [];
        
        // Setup line numbers
        const updateLineNumbers = () => {
            const lines = codeInput.value.split('\n').length;
            lineNumbers.innerHTML = Array.from({length: lines}, (_, i) => 
                `<div class="line-number">${i + 1}</div>`
            ).join('');
        };
        
        // Syntax highlighting (basic)
        const highlightCode = () => {
            const code = codeInput.value;
            const keywords = ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while'];
            
            // This is a simplified version - in production, use a proper syntax highlighter
            keywords.forEach(keyword => {
                const regex = new RegExp(`\\b${keyword}\\b`, 'g');
                // Note: This is for demonstration - proper implementation would use a syntax highlighting library
            });
        };
        
        // Code input handling
        codeInput.addEventListener('input', () => {
            updateLineNumbers();
            highlightCode();
        });
        
        codeInput.addEventListener('keydown', (e) => {
            // Tab handling
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = codeInput.selectionStart;
                const end = codeInput.selectionEnd;
                
                codeInput.value = codeInput.value.substring(0, start) + '  ' + 
                                 codeInput.value.substring(end);
                codeInput.selectionStart = codeInput.selectionEnd = start + 2;
            }
        });
        
        // Display test cases
        testCases.forEach((test, index) => {
            const testEl = document.createElement('div');
            testEl.className = 'test-case';
            testEl.innerHTML = `
                <div class="test-header">
                    <span>Test ${index + 1}: ${test.name || 'Test Case'}</span>
                    <span class="test-status" id="test-${index}">
                        <i class="fas fa-circle"></i>
                    </span>
                </div>
                <div class="test-details">
                    <code>Input: ${JSON.stringify(test.input)}</code>
                    <code>Expected: ${JSON.stringify(test.expected)}</code>
                </div>
            `;
            testList.appendChild(testEl);
        });
        
        // Run code
        runBtn.addEventListener('click', () => {
            runBtn.disabled = true;
            runBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
            
            output.textContent = 'Running code...\n';
            
            // Simulate code execution
            setTimeout(() => {
                try {
                    const results = this.executeCode(codeInput.value, testCases);
                    this.displayResults(output, results, testList);
                    
                    window.interactiveCueManager.playSound(results.allPassed ? 'success' : 'click');
                    
                    this.logInteraction(element.dataset.segmentId, {
                        type: 'code_run',
                        code: codeInput.value,
                        testsPassed: results.passed,
                        totalTests: results.total
                    });
                    
                    if (results.allPassed) {
                        this.onComplete(element);
                    }
                } catch (error) {
                    output.textContent = `Error: ${error.message}`;
                    output.className = 'output-text error';
                }
                
                runBtn.disabled = false;
                runBtn.innerHTML = '<i class="fas fa-play"></i> Run';
            }, 1000);
        });
        
        // Initialize
        updateLineNumbers();
    }
    
    executeCode(code, testCases) {
        // This is a simplified execution - in production, use a proper sandboxed environment
        const results = {
            outputs: [],
            passed: 0,
            total: testCases.length,
            allPassed: false
        };
        
        try {
            // Create a function from the code
            const func = new Function('input', code + '\n return solution(input);');
            
            testCases.forEach((test, index) => {
                try {
                    const result = func(test.input);
                    const passed = JSON.stringify(result) === JSON.stringify(test.expected);
                    
                    results.outputs.push({
                        testIndex: index,
                        input: test.input,
                        expected: test.expected,
                        actual: result,
                        passed: passed
                    });
                    
                    if (passed) results.passed++;
                } catch (error) {
                    results.outputs.push({
                        testIndex: index,
                        error: error.message,
                        passed: false
                    });
                }
            });
            
            results.allPassed = results.passed === results.total;
        } catch (error) {
            throw new Error(`Syntax error: ${error.message}`);
        }
        
        return results;
    }
    
    displayResults(output, results, testList) {
        let outputText = `Test Results: ${results.passed}/${results.total} passed\n\n`;
        
        results.outputs.forEach(result => {
            const testStatus = testList.querySelector(`#test-${result.testIndex}`);
            
            if (result.passed) {
                outputText += `✓ Test ${result.testIndex + 1} passed\n`;
                testStatus.innerHTML = '<i class="fas fa-check-circle" style="color: #48bb78;"></i>';
            } else if (result.error) {
                outputText += `✗ Test ${result.testIndex + 1} failed: ${result.error}\n`;
                testStatus.innerHTML = '<i class="fas fa-times-circle" style="color: #f56565;"></i>';
            } else {
                outputText += `✗ Test ${result.testIndex + 1} failed\n`;
                outputText += `  Expected: ${JSON.stringify(result.expected)}\n`;
                outputText += `  Got: ${JSON.stringify(result.actual)}\n`;
                testStatus.innerHTML = '<i class="fas fa-times-circle" style="color: #f56565;"></i>';
            }
        });
        
        output.textContent = outputText;
        output.className = results.allPassed ? 'output-text success' : 'output-text';
    }
    
    onComplete(element) {
        const container = element.querySelector('.code-sandbox-container');
        container.classList.add('completed');
        
        window.interactiveCueManager.particleSystem.createBurst(
            container.getBoundingClientRect(),
            'success'
        );
    }
}

// === Visual Constructor Handler ===
class VisualConstructorHandler extends InteractiveCueHandler {
    create(cue, segmentId) {
        const container = super.create(cue, segmentId);
        
        container.innerHTML = `
            <div class="visual-constructor-container">
                <div class="constructor-prompt">
                    <i class="fas fa-shapes"></i>
                    <span>${cue.promptText || 'Build the structure'}</span>
                </div>
                <div class="constructor-workspace">
                    <div class="component-palette glass-effect">
                        <h4>Components</h4>
                        <div class="component-list"></div>
                    </div>
                    <div class="construction-area glass-effect">
                        <h4>Construction Area</h4>
                        <div class="grid-canvas"></div>
                    </div>
                    <div class="target-preview glass-effect">
                        <h4>Target</h4>
                        <div class="target-display"></div>
                    </div>
                </div>
                <div class="constructor-controls">
                    <button class="clear-btn">
                        <i class="fas fa-trash"></i> Clear
                    </button>
                    <button class="validate-btn">
                        <i class="fas fa-check"></i> Validate
                    </button>
                </div>
            </div>
        `;
        
        return container;
    }
    
    activate(element, cue) {
        super.activate(element, cue);
        this.setupConstructor(element, cue);
    }
    
    setupConstructor(element, cue) {
        const palette = element.querySelector('.component-list');
        const canvas = element.querySelector('.grid-canvas');
        const targetDisplay = element.querySelector('.target-display');
        const clearBtn = element.querySelector('.clear-btn');
        const validateBtn = element.querySelector('.validate-btn');
        
        const components = cue.components || this.getDefaultComponents();
        const targetStructure = cue.targetStructure || [];
        const gridSize = cue.gridSize || { rows: 5, cols: 5 };
        
        let placedComponents = [];
        
        // Create grid
        canvas.style.gridTemplateColumns = `repeat(${gridSize.cols}, 1fr)`;
        canvas.style.gridTemplateRows = `repeat(${gridSize.rows}, 1fr)`;
        
        for (let i = 0; i < gridSize.rows * gridSize.cols; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.index = i;
            
            cell.addEventListener('dragover', (e) => e.preventDefault());
            cell.addEventListener('drop', (e) => this.handleDrop(e, cell, placedComponents));
            
            canvas.appendChild(cell);
        }
        
        // Create component palette
        components.forEach(comp => {
            const compEl = document.createElement('div');
            compEl.className = 'component-item';
            compEl.draggable = true;
            compEl.dataset.componentId = comp.id;
            compEl.innerHTML = `
                <i class="${comp.icon}"></i>
                <span>${comp.name}</span>
            `;
            
            compEl.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('componentId', comp.id);
                compEl.classList.add('dragging');
            });
            
            compEl.addEventListener('dragend', () => {
                compEl.classList.remove('dragging');
            });
            
            palette.appendChild(compEl);
        });
        
        // Display target structure
        this.displayTarget(targetDisplay, targetStructure, gridSize);
        
        // Clear button
        clearBtn.addEventListener('click', () => {
            canvas.querySelectorAll('.placed-component').forEach(el => el.remove());
            placedComponents = [];
            window.interactiveCueManager.playSound('click');
        });
        
        // Validate button
        validateBtn.addEventListener('click', () => {
            const isValid = this.validateStructure(placedComponents, targetStructure);
            
            if (isValid) {
                window.interactiveCueManager.playSound('success');
                window.interactiveCueManager.triggerHaptic([50, 100, 50]);
                this.onComplete(element);
            } else {
                window.interactiveCueManager.playSound('click');
                this.showValidationFeedback(element, false);
            }
            
            this.logInteraction(element.dataset.segmentId, {
                type: 'structure_validate',
                placed: placedComponents,
                success: isValid
            });
        });
    }
    
    handleDrop(e, cell, placedComponents) {
        e.preventDefault();
        
        const componentId = e.dataTransfer.getData('componentId');
        const cellIndex = parseInt(cell.dataset.index);
        
        // Remove existing component in this cell
        const existing = placedComponents.findIndex(p => p.position === cellIndex);
        if (existing !== -1) {
            placedComponents.splice(existing, 1);
            cell.querySelector('.placed-component')?.remove();
        }
        
        // Add new component
        const comp = document.createElement('div');
        comp.className = 'placed-component';
        comp.dataset.componentId = componentId;
        comp.innerHTML = this.getComponentVisual(componentId);
        
        cell.appendChild(comp);
        placedComponents.push({ componentId, position: cellIndex });
        
        window.interactiveCueManager.playSound('click');
    }
    
    getComponentVisual(componentId) {
        const visuals = {
            'block': '<i class="fas fa-cube"></i>',
            'connector': '<i class="fas fa-link"></i>',
            'processor': '<i class="fas fa-microchip"></i>',
            'storage': '<i class="fas fa-database"></i>'
        };
        return visuals[componentId] || '<i class="fas fa-square"></i>';
    }
    
    displayTarget(container, structure, gridSize) {
        const grid = document.createElement('div');
        grid.className = 'target-grid';
        grid.style.gridTemplateColumns = `repeat(${gridSize.cols}, 1fr)`;
        grid.style.gridTemplateRows = `repeat(${gridSize.rows}, 1fr)`;
        
        for (let i = 0; i < gridSize.rows * gridSize.cols; i++) {
            const cell = document.createElement('div');
            cell.className = 'target-cell';
            
            const component = structure.find(s => s.position === i);
            if (component) {
                cell.innerHTML = this.getComponentVisual(component.componentId);
                cell.classList.add('has-component');
            }
            
            grid.appendChild(cell);
        }
        
        container.appendChild(grid);
    }
    
    validateStructure(placed, target) {
        if (placed.length !== target.length) return false;
        
        return target.every(targetComp => 
            placed.some(placedComp => 
                placedComp.componentId === targetComp.componentId &&
                placedComp.position === targetComp.position
            )
        );
    }
    
    showValidationFeedback(element, success) {
        const feedback = document.createElement('div');
        feedback.className = `validation-feedback ${success ? 'success' : 'error'}`;
        feedback.innerHTML = success ? 
            '<i class="fas fa-check"></i> Perfect match!' :
            '<i class="fas fa-times"></i> Not quite right. Check the target structure.';
        
        element.querySelector('.constructor-workspace').appendChild(feedback);
        
        setTimeout(() => feedback.remove(), 3000);
    }
    
    getDefaultComponents() {
        return [
            { id: 'block', name: 'Block', icon: 'fas fa-cube' },
            { id: 'connector', name: 'Connector', icon: 'fas fa-link' },
            { id: 'processor', name: 'Processor', icon: 'fas fa-microchip' },
            { id: 'storage', name: 'Storage', icon: 'fas fa-database' }
        ];
    }
    
    onComplete(element) {
        const container = element.querySelector('.visual-constructor-container');
        container.classList.add('completed');
        
        this.showValidationFeedback(element, true);
        
        window.interactiveCueManager.particleSystem.createBurst(
            container.getBoundingClientRect(),
            'success'
        );
    }
}

// === Decision Tree Navigator Handler ===
class DecisionTreeHandler extends InteractiveCueHandler {
    create(cue, segmentId) {
        const container = super.create(cue, segmentId);
        
        container.innerHTML = `
            <div class="decision-tree-container">
                <div class="tree-prompt">
                    <i class="fas fa-sitemap"></i>
                    <span>${cue.promptText || 'Navigate through the decisions'}</span>
                </div>
                <div class="tree-display">
                    <div class="current-node glass-effect">
                        <h4 class="node-title">Start</h4>
                        <p class="node-description">Loading...</p>
                    </div>
                    <div class="decision-options"></div>
                    <div class="path-history">
                        <h5>Your Path</h5>
                        <div class="path-list"></div>
                    </div>
                </div>
                <div class="tree-controls">
                    <button class="back-btn" disabled>
                        <i class="fas fa-arrow-left"></i> Go Back
                    </button>
                    <button class="restart-btn">
                        <i class="fas fa-redo"></i> Start Over
                    </button>
                </div>
            </div>
        `;
        
        return container;
    }
    
    activate(element, cue) {
        super.activate(element, cue);
        this.setupDecisionTree(element, cue);
    }
    
    setupDecisionTree(element, cue) {
        const currentNode = element.querySelector('.current-node');
        const optionsContainer = element.querySelector('.decision-options');
        const pathList = element.querySelector('.path-list');
        const backBtn = element.querySelector('.back-btn');
        const restartBtn = element.querySelector('.restart-btn');
        
        const tree = cue.decisionTree || this.getDefaultTree();
        const path = [];
        let currentNodeId = 'start';
        
        const displayNode = (nodeId) => {
            const node = tree[nodeId];
            if (!node) return;
            
            // Update current node display
            const title = currentNode.querySelector('.node-title');
            const description = currentNode.querySelector('.node-description');
            
            title.textContent = node.title;
            description.textContent = node.description;
            
            // Animate transition
            currentNode.style.opacity = '0';
            setTimeout(() => {
                currentNode.style.opacity = '1';
            }, 100);
            
            // Clear and display options
            optionsContainer.innerHTML = '';
            
            if (node.options && node.options.length > 0) {
                node.options.forEach((option, index) => {
                    const optionEl = document.createElement('button');
                    optionEl.className = 'decision-option glass-button';
                    optionEl.innerHTML = `
                        <i class="${option.icon || 'fas fa-chevron-right'}"></i>
                        <span>${option.text}</span>
                    `;
                    
                    optionEl.addEventListener('click', () => {
                        selectOption(option, index);
                    });
                    
                    optionsContainer.appendChild(optionEl);
                });
            } else {
                // Leaf node - show outcome
                const outcome = document.createElement('div');
                outcome.className = 'decision-outcome';
                outcome.innerHTML = `
                    <i class="fas fa-flag-checkered"></i>
                    <h4>Outcome</h4>
                    <p>${node.outcome || 'You reached an endpoint!'}</p>
                `;
                optionsContainer.appendChild(outcome);
                
                if (node.isOptimal) {
                    this.onOptimalPath(element);
                }
            }
            
            // Update back button
            backBtn.disabled = path.length === 0;
        };
        
        const selectOption = (option, index) => {
            // Add to path
            path.push({
                fromNode: currentNodeId,
                option: option,
                optionIndex: index
            });
            
            // Update path display
            const pathItem = document.createElement('div');
            pathItem.className = 'path-item';
            pathItem.innerHTML = `
                <i class="${option.icon || 'fas fa-arrow-right'}"></i>
                <span>${option.text}</span>
            `;
            pathList.appendChild(pathItem);
            
            // Navigate to next node
            currentNodeId = option.nextNode;
            displayNode(currentNodeId);
            
            window.interactiveCueManager.playSound('click');
            
            this.logInteraction(element.dataset.segmentId, {
                type: 'decision_made',
                from: path[path.length - 1].fromNode,
                to: currentNodeId,
                option: option.text,
                pathLength: path.length
            });
        };
        
        const goBack = () => {
            if (path.length === 0) return;
            
            const lastStep = path.pop();
            currentNodeId = lastStep.fromNode;
            
            // Remove from path display
            const pathItems = pathList.querySelectorAll('.path-item');
            if (pathItems.length > 0) {
                pathItems[pathItems.length - 1].remove();
            }
            
            displayNode(currentNodeId);
            window.interactiveCueManager.playSound('click');
        };
        
        const restart = () => {
            path.length = 0;
            pathList.innerHTML = '';
            currentNodeId = 'start';
            displayNode(currentNodeId);
            
            window.interactiveCueManager.playSound('click');
        };
        
        backBtn.addEventListener('click', goBack);
        restartBtn.addEventListener('click', restart);
        
        // Initialize
        displayNode(currentNodeId);
    }
    
    getDefaultTree() {
        return {
            'start': {
                title: 'Project Architecture',
                description: 'How should we structure our application?',
                options: [
                    {
                        text: 'Monolithic',
                        icon: 'fas fa-cube',
                        nextNode: 'monolithic'
                    },
                    {
                        text: 'Microservices',
                        icon: 'fas fa-cubes',
                        nextNode: 'microservices'
                    }
                ]
            },
            'monolithic': {
                title: 'Monolithic Chosen',
                description: 'Simpler deployment, but scaling challenges.',
                options: [
                    {
                        text: 'Vertical Scaling',
                        nextNode: 'vertical'
                    },
                    {
                        text: 'Optimize Code',
                        nextNode: 'optimize'
                    }
                ]
            },
            'microservices': {
                title: 'Microservices Chosen',
                description: 'Better scaling, but increased complexity.',
                options: [
                    {
                        text: 'Docker + Kubernetes',
                        nextNode: 'containers'
                    },
                    {
                        text: 'Serverless',
                        nextNode: 'serverless'
                    }
                ]
            },
            'containers': {
                title: 'Containerized Deployment',
                description: 'Excellent scaling and isolation.',
                outcome: 'Great choice for complex applications!',
                isOptimal: true
            },
            'serverless': {
                title: 'Serverless Architecture',
                description: 'Pay per use, automatic scaling.',
                outcome: 'Perfect for variable workloads!',
                isOptimal: true
            },
            'vertical': {
                title: 'Vertical Scaling',
                description: 'Limited by hardware constraints.',
                outcome: 'Works for small to medium apps.'
            },
            'optimize': {
                title: 'Code Optimization',
                description: 'Better performance, same architecture.',
                outcome: 'Good short-term solution.'
            }
        };
    }
    
    onOptimalPath(element) {
        window.interactiveCueManager.playSound('success');
        window.interactiveCueManager.triggerHaptic([50, 100, 50]);
        
        const container = element.querySelector('.decision-tree-container');
        container.classList.add('optimal-reached');
        
        window.interactiveCueManager.particleSystem.createBurst(
            container.getBoundingClientRect(),
            'success'
        );
    }
}

// === Collaborative Whiteboard Handler ===
class CollaborativeWhiteboardHandler extends InteractiveCueHandler {
    create(cue, segmentId) {
        const container = super.create(cue, segmentId);
        
        container.innerHTML = `
            <div class="whiteboard-container">
                <div class="whiteboard-prompt">
                    <i class="fas fa-chalkboard"></i>
                    <span>${cue.promptText || 'Draw and annotate your ideas'}</span>
                </div>
                <div class="whiteboard-workspace">
                    <div class="drawing-tools glass-effect">
                        <button class="tool-btn active" data-tool="pen">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="tool-btn" data-tool="eraser">
                            <i class="fas fa-eraser"></i>
                        </button>
                        <button class="tool-btn" data-tool="text">
                            <i class="fas fa-font"></i>
                        </button>
                        <button class="tool-btn" data-tool="shape">
                            <i class="fas fa-shapes"></i>
                        </button>
                        <div class="color-picker">
                            <input type="color" value="#667eea">
                        </div>
                        <div class="size-slider">
                            <input type="range" min="1" max="20" value="3">
                        </div>
                    </div>
                    <canvas class="drawing-canvas"></canvas>
                    <div class="collaboration-indicator">
                        <i class="fas fa-users"></i>
                        <span class="user-count">1 user</span>
                    </div>
                </div>
                <div class="whiteboard-controls">
                    <button class="clear-canvas-btn">
                        <i class="fas fa-trash"></i> Clear
                    </button>
                    <button class="save-canvas-btn">
                        <i class="fas fa-save"></i> Save
                    </button>
                    <button class="replay-btn">
                        <i class="fas fa-play"></i> Replay
                    </button>
                </div>
            </div>
        `;
        
        return container;
    }
    
    activate(element, cue) {
        super.activate(element, cue);
        this.setupWhiteboard(element, cue);
    }
    
    setupWhiteboard(element, cue) {
        const canvas = element.querySelector('.drawing-canvas');
        const ctx = canvas.getContext('2d');
        const tools = element.querySelectorAll('.tool-btn');
        const colorPicker = element.querySelector('input[type="color"]');
        const sizeSlider = element.querySelector('input[type="range"]');
        const clearBtn = element.querySelector('.clear-canvas-btn');
        const saveBtn = element.querySelector('.save-canvas-btn');
        const replayBtn = element.querySelector('.replay-btn');
        
        // Canvas setup
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width - 40;
        canvas.height = 400;
        
        let isDrawing = false;
        let currentTool = 'pen';
        let currentColor = '#667eea';
        let currentSize = 3;
        let drawingHistory = [];
        let historyStep = -1;
        
        // Drawing state
        const state = {
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0
        };
        
        // Tool selection
        tools.forEach(tool => {
            tool.addEventListener('click', () => {
                tools.forEach(t => t.classList.remove('active'));
                tool.classList.add('active');
                currentTool = tool.dataset.tool;
                canvas.style.cursor = this.getCursor(currentTool);
            });
        });
        
        colorPicker.addEventListener('change', (e) => {
            currentColor = e.target.value;
        });
        
        sizeSlider.addEventListener('input', (e) => {
            currentSize = parseInt(e.target.value);
        });
        
        // Drawing functions
        const startDrawing = (x, y) => {
            isDrawing = true;
            state.startX = x;
            state.startY = y;
            
            if (currentTool === 'pen' || currentTool === 'eraser') {
                ctx.beginPath();
                ctx.moveTo(x, y);
            }
        };
        
        const draw = (x, y) => {
            if (!isDrawing) return;
            
            state.endX = x;
            state.endY = y;
            
            ctx.lineWidth = currentSize;
            ctx.lineCap = 'round';
            
            switch (currentTool) {
                case 'pen':
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.strokeStyle = currentColor;
                    ctx.lineTo(x, y);
                    ctx.stroke();
                    break;
                    
                case 'eraser':
                    ctx.globalCompositeOperation = 'destination-out';
                    ctx.lineTo(x, y);
                    ctx.stroke();
                    break;
                    
                case 'shape':
                    // Preview shape
                    this.redrawCanvas(ctx, drawingHistory);
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.strokeStyle = currentColor;
                    ctx.strokeRect(state.startX, state.startY, x - state.startX, y - state.startY);
                    break;
            }
        };
        
        const stopDrawing = () => {
            if (!isDrawing) return;
            
            isDrawing = false;
            
            // Save to history
            const action = {
                tool: currentTool,
                color: currentColor,
                size: currentSize,
                points: [state.startX, state.startY, state.endX, state.endY],
                timestamp: Date.now()
            };
            
            drawingHistory.push(action);
            historyStep++;
            
            this.logInteraction(element.dataset.segmentId, {
                type: 'whiteboard_draw',
                tool: currentTool,
                actionsCount: drawingHistory.length
            });
        };
        
        // Mouse events
        canvas.addEventListener('mousedown', (e) => {
            const rect = canvas.getBoundingClientRect();
            startDrawing(e.clientX - rect.left, e.clientY - rect.top);
        });
        
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            draw(e.clientX - rect.left, e.clientY - rect.top);
        });
        
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        // Touch support
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            startDrawing(touch.clientX - rect.left, touch.clientY - rect.top);
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            draw(touch.clientX - rect.left, touch.clientY - rect.top);
        });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            stopDrawing();
        });
        
        // Controls
        clearBtn.addEventListener('click', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawingHistory = [];
            historyStep = -1;
            window.interactiveCueManager.playSound('click');
        });
        
        saveBtn.addEventListener('click', () => {
            const dataURL = canvas.toDataURL('image/png');
            this.saveDrawing(dataURL, drawingHistory);
            window.interactiveCueManager.playSound('success');
            this.showSaveConfirmation(element);
        });
        
        replayBtn.addEventListener('click', () => {
            this.replayDrawing(ctx, canvas, drawingHistory);
        });
        
        // Simulate collaboration
        this.simulateCollaboration(element);
    }
    
    getCursor(tool) {
        const cursors = {
            'pen': 'crosshair',
            'eraser': 'grab',
            'text': 'text',
            'shape': 'crosshair'
        };
        return cursors[tool] || 'default';
    }
    
    redrawCanvas(ctx, history) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        history.forEach(action => {
            ctx.lineWidth = action.size;
            ctx.strokeStyle = action.color;
            
            if (action.tool === 'pen') {
                ctx.beginPath();
                ctx.moveTo(action.points[0], action.points[1]);
                ctx.lineTo(action.points[2], action.points[3]);
                ctx.stroke();
            } else if (action.tool === 'shape') {
                ctx.strokeRect(
                    action.points[0], 
                    action.points[1], 
                    action.points[2] - action.points[0], 
                    action.points[3] - action.points[1]
                );
            }
        });
    }
    
    replayDrawing(ctx, canvas, history) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let index = 0;
        const replayStep = () => {
            if (index < history.length) {
                const action = history[index];
                
                ctx.lineWidth = action.size;
                ctx.strokeStyle = action.color;
                
                if (action.tool === 'pen') {
                    ctx.beginPath();
                    ctx.moveTo(action.points[0], action.points[1]);
                    ctx.lineTo(action.points[2], action.points[3]);
                    ctx.stroke();
                }
                
                index++;
                setTimeout(replayStep, 50);
            }
        };
        
        replayStep();
        window.interactiveCueManager.playSound('click');
    }
    
    saveDrawing(dataURL, history) {
        // In a real implementation, this would save to a server
        const savedData = {
            image: dataURL,
            history: history,
            timestamp: Date.now()
        };
        
        // Simulate saving
        console.log('Saving drawing:', savedData);
    }
    
    showSaveConfirmation(element) {
        const confirmation = document.createElement('div');
        confirmation.className = 'save-confirmation';
        confirmation.innerHTML = '<i class="fas fa-check"></i> Drawing saved!';
        
        element.querySelector('.whiteboard-workspace').appendChild(confirmation);
        
        setTimeout(() => confirmation.remove(), 2000);
    }
    
    simulateCollaboration(element) {
        const indicator = element.querySelector('.user-count');
        let userCount = 1;
        
        // Simulate other users joining
        setTimeout(() => {
            userCount = 2;
            indicator.textContent = `${userCount} users`;
            indicator.parentElement.classList.add('pulse');
            
            setTimeout(() => {
                indicator.parentElement.classList.remove('pulse');
            }, 1000);
        }, 5000);
    }
}

// === Voice Command Handler ===
class VoiceCommandHandler extends InteractiveCueHandler {
    create(cue, segmentId) {
        const container = super.create(cue, segmentId);
        
        container.innerHTML = `
            <div class="voice-command-container">
                <div class="voice-prompt">
                    <i class="fas fa-microphone"></i>
                    <span>${cue.promptText || 'Use voice commands to interact'}</span>
                </div>
                <div class="voice-interface glass-effect">
                    <button class="voice-btn">
                        <i class="fas fa-microphone fa-3x"></i>
                    </button>
                    <div class="voice-status">Click to start</div>
                    <div class="voice-transcript"></div>
                </div>
                <div class="voice-commands">
                    <h4>Available Commands</h4>
                    <ul class="command-list"></ul>
                </div>
                <div class="voice-feedback"></div>
            </div>
        `;
        
        return container;
    }
    
    activate(element, cue) {
        super.activate(element, cue);
        this.setupVoiceCommands(element, cue);
    }
    
    setupVoiceCommands(element, cue) {
        const voiceBtn = element.querySelector('.voice-btn');
        const status = element.querySelector('.voice-status');
        const transcript = element.querySelector('.voice-transcript');
        const commandList = element.querySelector('.command-list');
        const feedback = element.querySelector('.voice-feedback');
        
        const commands = cue.voiceCommands || this.getDefaultCommands();
        let recognition = null;
        let isListening = false;
        
        // Display available commands
        commands.forEach(cmd => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>"${cmd.phrase}"</strong> - ${cmd.description}`;
            commandList.appendChild(li);
        });
        
        // Check for speech recognition support
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = cue.language || 'en-US';
            
            recognition.onstart = () => {
                isListening = true;
                voiceBtn.classList.add('listening');
                status.textContent = 'Listening...';
                window.interactiveCueManager.playSound('click');
                window.interactiveCueManager.triggerHaptic([10]);
            };
            
            recognition.onresult = (event) => {
                const current = event.resultIndex;
                const result = event.results[current];
                const transcriptText = result[0].transcript.toLowerCase();
                
                transcript.textContent = `"${transcriptText}"`;
                
                if (result.isFinal) {
                    this.processCommand(transcriptText, commands, feedback);
                    
                    this.logInteraction(element.dataset.segmentId, {
                        type: 'voice_command',
                        transcript: transcriptText,
                        timestamp: Date.now()
                    });
                }
            };
            
            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                status.textContent = 'Error: ' + event.error;
                voiceBtn.classList.remove('listening');
                isListening = false;
            };
            
            recognition.onend = () => {
                voiceBtn.classList.remove('listening');
                status.textContent = 'Click to start';
                isListening = false;
            };
            
            voiceBtn.addEventListener('click', () => {
                if (isListening) {
                    recognition.stop();
                } else {
                    recognition.start();
                }
            });
        } else {
            // Fallback for browsers without speech recognition
            status.textContent = 'Speech recognition not supported';
            voiceBtn.disabled = true;
            
            // Provide text input alternative
            this.provideTextFallback(element, commands);
        }
    }
    
    processCommand(transcript, commands, feedbackEl) {
        let commandFound = false;
        
        commands.forEach(cmd => {
            if (transcript.includes(cmd.phrase.toLowerCase())) {
                commandFound = true;
                this.executeCommand(cmd, feedbackEl);
            }
        });
        
        if (!commandFound) {
            feedbackEl.innerHTML = `
                <div class="command-not-found">
                    <i class="fas fa-question-circle"></i>
                    Command not recognized. Try again.
                </div>
            `;
            window.interactiveCueManager.playSound('click');
        }
    }
    
    executeCommand(command, feedbackEl) {
        feedbackEl.innerHTML = `
            <div class="command-executed">
                <i class="fas fa-check-circle"></i>
                <strong>Command:</strong> ${command.phrase}<br>
                <strong>Action:</strong> ${command.action}
            </div>
        `;
        
        window.interactiveCueManager.playSound('success');
        window.interactiveCueManager.triggerHaptic([50, 100, 50]);
        
        // Simulate command execution
        if (command.visual) {
            this.showVisualFeedback(feedbackEl, command.visual);
        }
    }
    
    showVisualFeedback(container, visual) {
        const visualEl = document.createElement('div');
        visualEl.className = 'command-visual';
        visualEl.innerHTML = visual;
        
        container.appendChild(visualEl);
        
        // Animate
        setTimeout(() => {
            visualEl.style.opacity = '1';
            visualEl.style.transform = 'scale(1)';
        }, 100);
    }
    
    provideTextFallback(element, commands) {
        const fallback = document.createElement('div');
        fallback.className = 'text-fallback';
        fallback.innerHTML = `
            <p>Speech recognition not available. Type commands instead:</p>
            <input type="text" class="command-input" placeholder="Type a command...">
            <button class="submit-command">Submit</button>
        `;
        
        element.querySelector('.voice-interface').appendChild(fallback);
        
        const input = fallback.querySelector('.command-input');
        const submit = fallback.querySelector('.submit-command');
        
        submit.addEventListener('click', () => {
            const text = input.value.toLowerCase();
            if (text) {
                this.processCommand(text, commands, element.querySelector('.voice-feedback'));
                input.value = '';
            }
        });
    }
    
    getDefaultCommands() {
        return [
            {
                phrase: 'next slide',
                description: 'Go to the next slide',
                action: 'Navigate forward',
                visual: '<i class="fas fa-arrow-right fa-3x"></i>'
            },
            {
                phrase: 'previous slide',
                description: 'Go to the previous slide',
                action: 'Navigate backward',
                visual: '<i class="fas fa-arrow-left fa-3x"></i>'
            },
            {
                phrase: 'show answer',
                description: 'Reveal the answer',
                action: 'Display solution',
                visual: '<i class="fas fa-lightbulb fa-3x"></i>'
            },
            {
                phrase: 'repeat question',
                description: 'Repeat the current question',
                action: 'Read question again',
                visual: '<i class="fas fa-redo fa-3x"></i>'
            }
        ];
    }
}

// === AR Overlay Handler ===
class AROverlayHandler extends InteractiveCueHandler {
    create(cue, segmentId) {
        const container = super.create(cue, segmentId);
        
        container.innerHTML = `
            <div class="ar-overlay-container">
                <div class="ar-prompt">
                    <i class="fas fa-cube"></i>
                    <span>${cue.promptText || 'Explore in 3D space'}</span>
                </div>
                <div class="ar-viewport glass-effect">
                    <canvas class="ar-canvas"></canvas>
                    <div class="ar-controls">
                        <button class="ar-btn" data-action="rotate-left">
                            <i class="fas fa-undo"></i>
                        </button>
                        <button class="ar-btn" data-action="rotate-right">
                            <i class="fas fa-redo"></i>
                        </button>
                        <button class="ar-btn" data-action="zoom-in">
                            <i class="fas fa-search-plus"></i>
                        </button>
                        <button class="ar-btn" data-action="zoom-out">
                            <i class="fas fa-search-minus"></i>
                        </button>
                        <button class="ar-btn" data-action="reset">
                            <i class="fas fa-home"></i>
                        </button>
                    </div>
                    <div class="ar-info glass-effect">
                        <h4>3D Model</h4>
                        <p>Use controls or drag to rotate</p>
                    </div>
                </div>
                <div class="ar-annotations"></div>
            </div>
        `;
        
        return container;
    }
    
    activate(element, cue) {
        super.activate(element, cue);
        this.setup3DViewer(element, cue);
    }
    
    setup3DViewer(element, cue) {
        const canvas = element.querySelector('.ar-canvas');
        const ctx = canvas.getContext('2d');
        const controls = element.querySelectorAll('.ar-btn');
        const annotations = element.querySelector('.ar-annotations');
        
        // Canvas setup
        canvas.width = canvas.parentElement.offsetWidth - 40;
        canvas.height = 400;
        
        // 3D state
        const state = {
            rotation: { x: 0, y: 0, z: 0 },
            zoom: 1,
            isDragging: false,
            lastX: 0,
            lastY: 0
        };
        
        // Simple 3D cube rendering (for demonstration)
        const render3DObject = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Save context
            ctx.save();
            
            // Center and scale
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.scale(state.zoom, state.zoom);
            
            // Draw a simple cube projection
            const size = 100;
            const vertices = this.getCubeVertices(size, state.rotation);
            
            // Draw faces
            this.drawCubeFaces(ctx, vertices);
            
            // Draw annotations
            this.drawAnnotations(ctx, vertices, cue.annotations || []);
            
            // Restore context
            ctx.restore();
        };
        
        // Control buttons
        controls.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                
                switch (action) {
                    case 'rotate-left':
                        state.rotation.y -= 0.1;
                        break;
                    case 'rotate-right':
                        state.rotation.y += 0.1;
                        break;
                    case 'zoom-in':
                        state.zoom = Math.min(state.zoom * 1.2, 3);
                        break;
                    case 'zoom-out':
                        state.zoom = Math.max(state.zoom * 0.8, 0.5);
                        break;
                    case 'reset':
                        state.rotation = { x: 0, y: 0, z: 0 };
                        state.zoom = 1;
                        break;
                }
                
                render3DObject();
                window.interactiveCueManager.playSound('click');
                
                this.logInteraction(element.dataset.segmentId, {
                    type: 'ar_control',
                    action: action,
                    state: state
                });
            });
        });
        
        // Mouse/touch controls for rotation
        canvas.addEventListener('mousedown', (e) => {
            state.isDragging = true;
            state.lastX = e.clientX;
            state.lastY = e.clientY;
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (!state.isDragging) return;
            
            const deltaX = e.clientX - state.lastX;
            const deltaY = e.clientY - state.lastY;
            
            state.rotation.y += deltaX * 0.01;
            state.rotation.x += deltaY * 0.01;
            
            state.lastX = e.clientX;
            state.lastY = e.clientY;
            
            render3DObject();
        });
        
        canvas.addEventListener('mouseup', () => {
            state.isDragging = false;
        });
        
        // Touch support
        canvas.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            state.isDragging = true;
            state.lastX = touch.clientX;
            state.lastY = touch.clientY;
        });
        
        canvas.addEventListener('touchmove', (e) => {
            if (!state.isDragging) return;
            e.preventDefault();
            
            const touch = e.touches[0];
            const deltaX = touch.clientX - state.lastX;
            const deltaY = touch.clientY - state.lastY;
            
            state.rotation.y += deltaX * 0.01;
            state.rotation.x += deltaY * 0.01;
            
            state.lastX = touch.clientX;
            state.lastY = touch.clientY;
            
            render3DObject();
        });
        
        canvas.addEventListener('touchend', () => {
            state.isDragging = false;
        });
        
        // Animation loop
        const animate = () => {
            if (cue.autoRotate && !state.isDragging) {
                state.rotation.y += 0.005;
                render3DObject();
            }
            requestAnimationFrame(animate);
        };
        
        // Initialize
        render3DObject();
        animate();
        
        // Show annotations panel
        this.displayAnnotationsList(annotations, cue.annotations || []);
    }
    
    getCubeVertices(size, rotation) {
        // Simple 3D cube vertices
        const vertices = [
            [-size/2, -size/2, -size/2],
            [size/2, -size/2, -size/2],
            [size/2, size/2, -size/2],
            [-size/2, size/2, -size/2],
            [-size/2, -size/2, size/2],
            [size/2, -size/2, size/2],
            [size/2, size/2, size/2],
            [-size/2, size/2, size/2]
        ];
        
        // Apply rotation
        return vertices.map(v => this.rotateVertex(v, rotation));
    }
    
    rotateVertex(vertex, rotation) {
        let [x, y, z] = vertex;
        
        // Rotate around X axis
        const cosX = Math.cos(rotation.x);
        const sinX = Math.sin(rotation.x);
        const y1 = y * cosX - z * sinX;
        const z1 = y * sinX + z * cosX;
        
        // Rotate around Y axis
        const cosY = Math.cos(rotation.y);
        const sinY = Math.sin(rotation.y);
        const x2 = x * cosY + z1 * sinY;
        const z2 = -x * sinY + z1 * cosY;
        
        return [x2, y1, z2];
    }
    
    drawCubeFaces(ctx, vertices) {
        // Define faces (indices of vertices)
        const faces = [
            [0, 1, 2, 3], // Front
            [4, 5, 6, 7], // Back
            [0, 1, 5, 4], // Bottom
            [2, 3, 7, 6], // Top
            [0, 3, 7, 4], // Left
            [1, 2, 6, 5]  // Right
        ];
        
        // Sort faces by depth (simple painter's algorithm)
        faces.sort((a, b) => {
            const depthA = a.reduce((sum, i) => sum + vertices[i][2], 0) / 4;
            const depthB = b.reduce((sum, i) => sum + vertices[i][2], 0) / 4;
            return depthA - depthB;
        });
        
        // Draw each face
        faces.forEach((face, index) => {
            ctx.beginPath();
            face.forEach((vertexIndex, i) => {
                const [x, y] = vertices[vertexIndex];
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.closePath();
            
            // Face color based on depth
            const depth = face.reduce((sum, i) => sum + vertices[i][2], 0) / 4;
            const brightness = Math.floor(100 + depth * 0.5);
            ctx.fillStyle = `rgba(102, 126, 234, 0.3)`;
            ctx.fill();
            ctx.strokeStyle = `rgb(${brightness}, ${brightness}, ${brightness + 50})`;
            ctx.stroke();
        });
    }
    
    drawAnnotations(ctx, vertices, annotations) {
        annotations.forEach((annotation, index) => {
            const vertex = vertices[annotation.vertexIndex || 0];
            const [x, y, z] = vertex;
            
            // Only show if facing forward
            if (z > 0) {
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.fillStyle = '#f56565';
                ctx.fill();
                
                // Label
                ctx.fillStyle = '#333';
                ctx.font = '12px Arial';
                ctx.fillText(annotation.label || (index + 1).toString(), x + 10, y + 5);
            }
        });
    }
    
    displayAnnotationsList(container, annotations) {
        container.innerHTML = '<h4>Annotations</h4>';
        
        annotations.forEach((annotation, index) => {
            const item = document.createElement('div');
            item.className = 'annotation-item';
            item.innerHTML = `
                <span class="annotation-number">${index + 1}</span>
                <span class="annotation-text">${annotation.text || 'Point of interest'}</span>
            `;
            
            item.addEventListener('click', () => {
                // Highlight annotation
                item.classList.add('highlighted');
                setTimeout(() => item.classList.remove('highlighted'), 1000);
                
                window.interactiveCueManager.playSound('hover');
            });
            
            container.appendChild(item);
        });
    }
}

// === Particle System (Enhanced) ===
// Commented out as ParticleSystem is already defined in interactive_cues.js
/* class ParticleSystem {
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
} */

// Register new handlers with the InteractiveCueManager
if (window.InteractiveCueManager) {
    // Add new handlers to the existing manager
    const addNewHandlers = () => {
        if (window.interactiveCueManager) {
            window.interactiveCueManager.interactionHandlers['timeline_scrubber'] = new TimelineScrubberHandler();
            window.interactiveCueManager.interactionHandlers['pattern_matcher'] = new PatternMatcherHandler();
            window.interactiveCueManager.interactionHandlers['code_sandbox'] = new CodeSandboxHandler();
            window.interactiveCueManager.interactionHandlers['visual_constructor'] = new VisualConstructorHandler();
            window.interactiveCueManager.interactionHandlers['decision_tree'] = new DecisionTreeHandler();
            window.interactiveCueManager.interactionHandlers['collaborative_whiteboard'] = new CollaborativeWhiteboardHandler();
            window.interactiveCueManager.interactionHandlers['voice_command'] = new VoiceCommandHandler();
            window.interactiveCueManager.interactionHandlers['ar_overlay'] = new AROverlayHandler();
        }
    };
    
    // Add handlers when manager is ready
    if (window.interactiveCueManager) {
        addNewHandlers();
    } else {
        // Wait for manager to be initialized
        const checkInterval = setInterval(() => {
            if (window.interactiveCueManager) {
                addNewHandlers();
                clearInterval(checkInterval);
            }
        }, 100);
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TimelineScrubberHandler,
        PatternMatcherHandler,
        CodeSandboxHandler,
        VisualConstructorHandler,
        DecisionTreeHandler,
        CollaborativeWhiteboardHandler,
        VoiceCommandHandler,
        AROverlayHandler
    };
}