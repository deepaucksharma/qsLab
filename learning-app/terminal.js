// Terminal Component for real command execution
class KafkaTerminal {
    constructor(container, options = {}) {
        this.container = container;
        this.ws = null;
        this.sessionId = null;
        this.commandHistory = [];
        this.historyIndex = -1;
        this.currentCommand = '';
        this.isConnected = false;
        this.activeCommands = new Map();
        
        this.options = {
            serverUrl: options.serverUrl || 'ws://localhost:3001',
            theme: options.theme || 'dark',
            fontSize: options.fontSize || 14,
            ...options
        };
        
        this.init();
    }
    
    init() {
        this.createTerminalUI();
        this.connect();
        this.setupEventListeners();
        this.loadCommandHistory();
    }
    
    createTerminalUI() {
        this.container.innerHTML = `
            <div class="kafka-terminal ${this.options.theme}">
                <div class="terminal-header">
                    <div class="terminal-title">
                        <i class="fas fa-terminal"></i>
                        <span>Kafka Learning Terminal</span>
                        <span class="connection-status disconnected">
                            <i class="fas fa-circle"></i> Disconnected
                        </span>
                    </div>
                    <div class="terminal-controls">
                        <button class="terminal-btn" onclick="terminal.clear()">
                            <i class="fas fa-eraser"></i> Clear
                        </button>
                        <button class="terminal-btn" onclick="terminal.toggleTheme()">
                            <i class="fas fa-adjust"></i> Theme
                        </button>
                        <button class="terminal-btn" onclick="terminal.showHelp()">
                            <i class="fas fa-question-circle"></i> Help
                        </button>
                    </div>
                </div>
                <div class="terminal-body">
                    <div class="terminal-output"></div>
                    <div class="terminal-input-line">
                        <span class="terminal-prompt">kafka-lab $</span>
                        <input type="text" class="terminal-input" autofocus>
                        <div class="terminal-suggestions"></div>
                    </div>
                </div>
                <div class="terminal-status-bar">
                    <span class="status-item">Ready</span>
                    <span class="status-item" id="command-count">0 commands</span>
                </div>
            </div>
        `;
        
        this.elements = {
            output: this.container.querySelector('.terminal-output'),
            input: this.container.querySelector('.terminal-input'),
            prompt: this.container.querySelector('.terminal-prompt'),
            statusBar: this.container.querySelector('.terminal-status-bar'),
            connectionStatus: this.container.querySelector('.connection-status'),
            suggestions: this.container.querySelector('.terminal-suggestions')
        };
    }
    
    connect() {
        this.addOutput('Connecting to Kafka Lab server...', 'system');
        
        this.ws = new WebSocket(this.options.serverUrl);
        
        this.ws.onopen = () => {
            this.isConnected = true;
            this.updateConnectionStatus(true);
            this.addOutput('Connected! Type "help" for available commands.', 'success');
            
            // Authenticate
            this.ws.send(JSON.stringify({
                type: 'authenticate',
                userId: 'learner'
            }));
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleServerMessage(data);
        };
        
        this.ws.onerror = (error) => {
            this.addOutput('Connection error: ' + error.message, 'error');
        };
        
        this.ws.onclose = () => {
            this.isConnected = false;
            this.updateConnectionStatus(false);
            this.addOutput('Disconnected from server. Trying to reconnect...', 'warning');
            
            // Auto-reconnect
            setTimeout(() => {
                if (!this.isConnected) {
                    this.connect();
                }
            }, 3000);
        };
    }
    
    handleServerMessage(data) {
        switch (data.type) {
            case 'connected':
                this.sessionId = data.sessionId;
                break;
                
            case 'authenticated':
                this.addOutput('Authentication successful', 'success');
                break;
                
            case 'command_start':
                this.addOutput(`$ ${data.command}`, 'command');
                this.activeCommands.set(data.commandId, {
                    startTime: Date.now(),
                    command: data.command
                });
                break;
                
            case 'stdout':
                this.addOutput(data.data, 'stdout', false);
                break;
                
            case 'stderr':
                this.addOutput(data.data, 'stderr', false);
                break;
                
            case 'progress':
                this.updateProgress(data.commandId, data.progress);
                break;
                
            case 'command_complete':
                const cmd = this.activeCommands.get(data.commandId);
                if (cmd) {
                    const duration = Date.now() - cmd.startTime;
                    this.addOutput(`\nCommand completed in ${duration}ms`, 'success');
                    this.activeCommands.delete(data.commandId);
                }
                break;
                
            case 'command_error':
                this.addOutput(`Error: ${data.error}`, 'error');
                this.activeCommands.delete(data.commandId);
                break;
                
            case 'error':
                this.addOutput(`Error: ${data.message}`, 'error');
                break;
        }
    }
    
    setupEventListeners() {
        this.elements.input.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'Enter':
                    this.executeCommand();
                    break;
                    
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigateHistory(-1);
                    break;
                    
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateHistory(1);
                    break;
                    
                case 'Tab':
                    e.preventDefault();
                    this.autocomplete();
                    break;
                    
                case 'Escape':
                    this.clearSuggestions();
                    break;
            }
        });
        
        this.elements.input.addEventListener('input', (e) => {
            this.showSuggestions(e.target.value);
        });
        
        // Click outside to clear suggestions
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.clearSuggestions();
            }
        });
    }
    
    executeCommand() {
        const command = this.elements.input.value.trim();
        if (!command) return;
        
        // Add to history
        this.commandHistory.push(command);
        this.historyIndex = this.commandHistory.length;
        this.saveCommandHistory();
        
        // Clear input
        this.elements.input.value = '';
        this.clearSuggestions();
        
        // Update command count
        document.getElementById('command-count').textContent = `${this.commandHistory.length} commands`;
        
        // Handle local commands
        if (this.handleLocalCommand(command)) {
            return;
        }
        
        // Send to server
        if (this.isConnected) {
            this.ws.send(JSON.stringify({
                type: 'execute',
                command: command,
                options: {}
            }));
        } else {
            this.addOutput('Not connected to server', 'error');
        }
    }
    
    handleLocalCommand(command) {
        const parts = command.split(' ');
        const cmd = parts[0].toLowerCase();
        
        switch (cmd) {
            case 'help':
                this.showHelp();
                return true;
                
            case 'clear':
                this.clear();
                return true;
                
            case 'history':
                this.showHistory();
                return true;
                
            case 'theme':
                this.toggleTheme();
                return true;
                
            case 'templates':
                this.showTemplates(parts[1]);
                return true;
                
            default:
                return false;
        }
    }
    
    showHelp() {
        const helpText = `
Kafka Learning Terminal - Available Commands:

LOCAL COMMANDS:
  help                  Show this help message
  clear                 Clear terminal output
  history               Show command history
  theme                 Toggle dark/light theme
  templates [category]  Show command templates

KAFKA COMMANDS:
  docker exec -it kafka-broker kafka-topics --list --bootstrap-server localhost:9092
  docker exec -it kafka-broker kafka-topics --create --topic <name> ...
  docker exec -it kafka-broker kafka-console-producer --topic <name> ...
  docker exec -it kafka-broker kafka-console-consumer --topic <name> ...

JMX COMMANDS:
  docker exec -it kafka-jmxterm java -jar /jmxterm.jar

MONITORING:
  docker run --rm newrelic/nri-kafka:latest --metrics --pretty
  docker logs newrelic-infra

Use TAB for command completion and arrow keys for history navigation.
        `.trim();
        
        this.addOutput(helpText, 'info');
    }
    
    showTemplates(category) {
        fetch(`http://localhost:3001/api/templates/${category || 'kafka'}`)
            .then(res => res.json())
            .then(templates => {
                let output = `\nCommand Templates${category ? ` - ${category}` : ''}:\n\n`;
                
                templates.forEach(template => {
                    output += `${template.name}:\n`;
                    output += `  ${template.command}\n`;
                    output += `  ${template.description}\n\n`;
                });
                
                this.addOutput(output, 'info');
            })
            .catch(err => {
                this.addOutput('Failed to fetch templates: ' + err.message, 'error');
            });
    }
    
    showSuggestions(input) {
        if (!input) {
            this.clearSuggestions();
            return;
        }
        
        const suggestions = this.getCommandSuggestions(input);
        
        if (suggestions.length === 0) {
            this.clearSuggestions();
            return;
        }
        
        this.elements.suggestions.innerHTML = suggestions
            .map(s => `<div class="suggestion" data-command="${s}">${s}</div>`)
            .join('');
        
        this.elements.suggestions.style.display = 'block';
        
        // Add click handlers
        this.elements.suggestions.querySelectorAll('.suggestion').forEach(el => {
            el.addEventListener('click', () => {
                this.elements.input.value = el.dataset.command;
                this.clearSuggestions();
                this.elements.input.focus();
            });
        });
    }
    
    getCommandSuggestions(input) {
        const commonCommands = [
            'docker ps',
            'docker logs',
            'docker exec -it kafka-broker kafka-topics --list --bootstrap-server localhost:9092',
            'docker exec -it kafka-broker kafka-topics --create --topic',
            'docker exec -it kafka-broker kafka-console-producer --topic',
            'docker exec -it kafka-broker kafka-console-consumer --topic',
            'docker exec -it kafka-jmxterm java -jar /jmxterm.jar',
            'docker-compose up -d',
            'docker-compose down',
            'docker-compose ps',
            'docker-compose logs'
        ];
        
        // Add history commands
        const allCommands = [...new Set([...commonCommands, ...this.commandHistory])];
        
        // Filter suggestions
        return allCommands
            .filter(cmd => cmd.toLowerCase().startsWith(input.toLowerCase()))
            .slice(0, 5);
    }
    
    clearSuggestions() {
        this.elements.suggestions.style.display = 'none';
        this.elements.suggestions.innerHTML = '';
    }
    
    autocomplete() {
        const suggestions = this.getCommandSuggestions(this.elements.input.value);
        if (suggestions.length === 1) {
            this.elements.input.value = suggestions[0];
            this.clearSuggestions();
        } else if (suggestions.length > 1) {
            this.showSuggestions(this.elements.input.value);
        }
    }
    
    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;
        
        if (this.historyIndex === this.commandHistory.length) {
            this.currentCommand = this.elements.input.value;
        }
        
        this.historyIndex += direction;
        
        if (this.historyIndex < 0) {
            this.historyIndex = 0;
        } else if (this.historyIndex > this.commandHistory.length) {
            this.historyIndex = this.commandHistory.length;
        }
        
        if (this.historyIndex === this.commandHistory.length) {
            this.elements.input.value = this.currentCommand;
        } else {
            this.elements.input.value = this.commandHistory[this.historyIndex];
        }
    }
    
    addOutput(text, className = '', newLine = true) {
        const line = document.createElement('div');
        line.className = `terminal-line ${className}`;
        
        // Handle ANSI escape codes (basic support)
        text = this.parseAnsiCodes(text);
        
        line.innerHTML = text;
        this.elements.output.appendChild(line);
        
        // Auto-scroll to bottom
        this.elements.output.scrollTop = this.elements.output.scrollHeight;
    }
    
    parseAnsiCodes(text) {
        // Basic ANSI color support
        const ansiColors = {
            '30': 'black',
            '31': 'red',
            '32': 'green',
            '33': 'yellow',
            '34': 'blue',
            '35': 'magenta',
            '36': 'cyan',
            '37': 'white'
        };
        
        return text.replace(/\x1b\[(\d+)m/g, (match, code) => {
            const color = ansiColors[code];
            return color ? `<span style="color: ${color}">` : '</span>';
        });
    }
    
    clear() {
        this.elements.output.innerHTML = '';
        this.addOutput('Terminal cleared', 'system');
    }
    
    toggleTheme() {
        const terminal = this.container.querySelector('.kafka-terminal');
        if (terminal.classList.contains('dark')) {
            terminal.classList.remove('dark');
            terminal.classList.add('light');
            this.options.theme = 'light';
        } else {
            terminal.classList.remove('light');
            terminal.classList.add('dark');
            this.options.theme = 'dark';
        }
    }
    
    updateConnectionStatus(connected) {
        const status = this.elements.connectionStatus;
        if (connected) {
            status.className = 'connection-status connected';
            status.innerHTML = '<i class="fas fa-circle"></i> Connected';
        } else {
            status.className = 'connection-status disconnected';
            status.innerHTML = '<i class="fas fa-circle"></i> Disconnected';
        }
    }
    
    showHistory() {
        let output = '\nCommand History:\n\n';
        this.commandHistory.forEach((cmd, index) => {
            output += `${index + 1}. ${cmd}\n`;
        });
        this.addOutput(output, 'info');
    }
    
    saveCommandHistory() {
        localStorage.setItem('kafkaTerminalHistory', JSON.stringify(this.commandHistory));
    }
    
    loadCommandHistory() {
        const saved = localStorage.getItem('kafkaTerminalHistory');
        if (saved) {
            this.commandHistory = JSON.parse(saved);
            this.historyIndex = this.commandHistory.length;
        }
    }
    
    updateProgress(commandId, progress) {
        // Could implement a progress bar for long-running commands
        console.log(`Command ${commandId}: ${progress}%`);
    }
}

// Initialize terminal when needed
let terminal;

function initializeTerminal(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (container) {
        terminal = new KafkaTerminal(container, options);
        return terminal;
    }
    return null;
}