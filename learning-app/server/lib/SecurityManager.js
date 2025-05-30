class SecurityManager {
    constructor() {
        // Whitelist of allowed commands and patterns
        this.allowedCommands = [
            'docker',
            'docker-compose',
            'kubectl'  // For future Kubernetes support
        ];
        
        // Allowed Docker subcommands
        this.allowedDockerCommands = [
            'ps', 'logs', 'exec', 'stats', 'inspect', 'top',
            'run', 'stop', 'start', 'restart', 'compose'
        ];
        
        // Dangerous patterns to block
        this.dangerousPatterns = [
            /rm\s+-rf/gi,
            /dd\s+if=/gi,
            /mkfs/gi,
            /format/gi,
            />\/dev\/null/gi,
            /curl\s+.*\|\s*sh/gi,
            /wget\s+.*\|\s*sh/gi,
            /eval/gi,
            /sudo/gi,
            /chmod\s+777/gi,
            /\$\(/gi,  // Command substitution
            /`/g,      // Backticks
            /&&\s*rm/gi,
            /;\s*rm/gi
        ];
        
        // Safe container names pattern
        this.safeContainerPattern = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/;
        
        // Allowed Kafka commands
        this.allowedKafkaCommands = [
            'kafka-topics',
            'kafka-console-producer',
            'kafka-console-consumer',
            'kafka-consumer-groups',
            'kafka-broker-api-versions',
            'kafka-producer-perf-test',
            'kafka-consumer-perf-test',
            'kafka-configs',
            'kafka-acls',
            'kafka-reassign-partitions'
        ];
        
        // Allowed JMX commands
        this.allowedJMXCommands = [
            'jmxterm',
            'get',
            'info',
            'beans',
            'domains',
            'open',
            'close'
        ];
    }
    
    validateCommand(command, options = {}) {
        if (!command || typeof command !== 'string') {
            return {
                valid: false,
                reason: 'Invalid command format'
            };
        }
        
        // Trim and normalize
        const normalizedCommand = command.trim().toLowerCase();
        const originalCommand = command.trim();
        
        // Check for dangerous patterns
        for (const pattern of this.dangerousPatterns) {
            if (pattern.test(originalCommand)) {
                return {
                    valid: false,
                    reason: 'Command contains dangerous pattern'
                };
            }
        }
        
        // Parse command parts
        const parts = this.parseCommandSafely(originalCommand);
        if (parts.length === 0) {
            return {
                valid: false,
                reason: 'Empty command'
            };
        }
        
        const baseCommand = parts[0];
        
        // Validate based on command type
        if (baseCommand === 'docker') {
            return this.validateDockerCommand(parts, originalCommand);
        } else if (baseCommand === 'docker-compose') {
            return this.validateDockerComposeCommand(parts, originalCommand);
        } else if (this.allowedCommands.includes(baseCommand)) {
            return {
                valid: true,
                sanitizedCommand: originalCommand
            };
        } else {
            return {
                valid: false,
                reason: `Command '${baseCommand}' is not allowed`
            };
        }
    }
    
    validateDockerCommand(parts, originalCommand) {
        if (parts.length < 2) {
            return {
                valid: false,
                reason: 'Incomplete docker command'
            };
        }
        
        const subCommand = parts[1];
        
        if (!this.allowedDockerCommands.includes(subCommand)) {
            return {
                valid: false,
                reason: `Docker subcommand '${subCommand}' is not allowed`
            };
        }
        
        // Special validation for docker exec
        if (subCommand === 'exec') {
            return this.validateDockerExec(parts, originalCommand);
        }
        
        // Special validation for docker run
        if (subCommand === 'run') {
            return this.validateDockerRun(parts, originalCommand);
        }
        
        return {
            valid: true,
            sanitizedCommand: originalCommand
        };
    }
    
    validateDockerExec(parts, originalCommand) {
        // docker exec [OPTIONS] CONTAINER COMMAND [ARG...]
        let containerIndex = 2;
        
        // Skip options
        while (containerIndex < parts.length && parts[containerIndex].startsWith('-')) {
            containerIndex++;
            // Handle options with values
            if (parts[containerIndex - 1] === '-e' || parts[containerIndex - 1] === '--env') {
                containerIndex++;
            }
        }
        
        if (containerIndex >= parts.length) {
            return {
                valid: false,
                reason: 'No container specified'
            };
        }
        
        const containerName = parts[containerIndex];
        if (!this.isValidContainerName(containerName)) {
            return {
                valid: false,
                reason: 'Invalid container name'
            };
        }
        
        // Check if executing Kafka command
        const commandIndex = containerIndex + 1;
        if (commandIndex < parts.length) {
            const execCommand = parts[commandIndex];
            
            // Check if it's a Kafka command
            if (this.allowedKafkaCommands.some(cmd => execCommand.includes(cmd))) {
                return {
                    valid: true,
                    sanitizedCommand: originalCommand
                };
            }
            
            // Check if it's JMX related
            if (execCommand.includes('jmxterm') || execCommand.includes('java')) {
                return {
                    valid: true,
                    sanitizedCommand: originalCommand
                };
            }
            
            // Allow basic shell commands
            const allowedShellCommands = ['sh', 'bash', 'cat', 'grep', 'tail', 'head', 'ls', 'echo'];
            if (allowedShellCommands.includes(execCommand)) {
                return {
                    valid: true,
                    sanitizedCommand: originalCommand
                };
            }
        }
        
        return {
            valid: false,
            reason: 'Command not allowed in docker exec'
        };
    }
    
    validateDockerRun(parts, originalCommand) {
        // Only allow running specific images
        const allowedImages = [
            'newrelic/nri-kafka',
            'newrelic/infrastructure',
            'confluentinc/cp-kafka',
            'confluentinc/cp-zookeeper',
            'bitnami/kafka'
        ];
        
        // Find the image name in the command
        let imageFound = false;
        for (const part of parts) {
            if (allowedImages.some(img => part.includes(img))) {
                imageFound = true;
                break;
            }
        }
        
        if (!imageFound) {
            return {
                valid: false,
                reason: 'Only approved images can be run'
            };
        }
        
        // Check for volume mounts (only allow specific paths)
        const volumeRegex = /-v\s+([^:]+):([^:]+)/g;
        let match;
        while ((match = volumeRegex.exec(originalCommand)) !== null) {
            const hostPath = match[1];
            // Only allow mounting from current directory or configs
            if (!hostPath.startsWith('./') && !hostPath.startsWith('${PWD}')) {
                return {
                    valid: false,
                    reason: 'Volume mounts must be from current directory'
                };
            }
        }
        
        return {
            valid: true,
            sanitizedCommand: originalCommand
        };
    }
    
    validateDockerComposeCommand(parts, originalCommand) {
        const allowedComposeCommands = [
            'up', 'down', 'ps', 'logs', 'exec', 'stop', 'start', 'restart'
        ];
        
        if (parts.length < 2) {
            return {
                valid: false,
                reason: 'Incomplete docker-compose command'
            };
        }
        
        const subCommand = parts[1];
        if (!allowedComposeCommands.includes(subCommand)) {
            return {
                valid: false,
                reason: `Docker-compose subcommand '${subCommand}' is not allowed`
            };
        }
        
        return {
            valid: true,
            sanitizedCommand: originalCommand
        };
    }
    
    isValidContainerName(name) {
        return this.safeContainerPattern.test(name);
    }
    
    parseCommandSafely(command) {
        // Simple parsing that handles quotes
        const parts = [];
        let current = '';
        let inQuote = false;
        let quoteChar = '';
        
        for (let i = 0; i < command.length; i++) {
            const char = command[i];
            
            if (inQuote) {
                if (char === quoteChar && command[i - 1] !== '\\') {
                    inQuote = false;
                    current += char;
                } else {
                    current += char;
                }
            } else {
                if ((char === '"' || char === "'") && command[i - 1] !== '\\') {
                    inQuote = true;
                    quoteChar = char;
                    current += char;
                } else if (char === ' ' && current) {
                    parts.push(current);
                    current = '';
                } else if (char !== ' ') {
                    current += char;
                }
            }
        }
        
        if (current) {
            parts.push(current);
        }
        
        return parts;
    }
    
    // Sanitize environment variables
    sanitizeEnvVars(envVars) {
        const safe = {};
        const allowedEnvVars = [
            'BOOTSTRAP_SERVERS',
            'KAFKA_BROKER_ID',
            'KAFKA_ZOOKEEPER_CONNECT',
            'TOPIC_NAME',
            'CONSUMER_GROUP',
            'CLUSTER_NAME'
        ];
        
        for (const [key, value] of Object.entries(envVars)) {
            if (allowedEnvVars.includes(key)) {
                // Remove any command injection attempts
                safe[key] = value.replace(/[;&|`$()]/g, '');
            }
        }
        
        return safe;
    }
    
    // Get security recommendations
    getSecurityRecommendations() {
        return {
            general: [
                'Always run containers with least privileges',
                'Use read-only volumes where possible',
                'Avoid running containers as root',
                'Regularly update base images'
            ],
            kafka: [
                'Enable SASL/SSL authentication',
                'Use ACLs to restrict topic access',
                'Enable audit logging',
                'Encrypt data in transit and at rest'
            ],
            monitoring: [
                'Secure JMX ports with authentication',
                'Use HTTPS for metric endpoints',
                'Rotate API keys regularly',
                'Monitor for anomalous access patterns'
            ]
        };
    }
}

module.exports = SecurityManager;