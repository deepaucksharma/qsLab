const { spawn, exec } = require('child_process');
const Docker = require('dockerode');
const { promisify } = require('util');
const execAsync = promisify(exec);

class CommandExecutor {
    constructor() {
        this.docker = new Docker();
        this.runningCommands = new Map();
    }
    
    async getDockerStatus() {
        try {
            const info = await this.docker.info();
            const containers = await this.docker.listContainers();
            
            return {
                running: true,
                version: info.ServerVersion,
                containers: containers.length,
                containerDetails: containers.map(c => ({
                    id: c.Id.substring(0, 12),
                    name: c.Names[0].replace('/', ''),
                    image: c.Image,
                    state: c.State,
                    status: c.Status,
                    ports: c.Ports
                }))
            };
        } catch (error) {
            return {
                running: false,
                error: error.message
            };
        }
    }
    
    async getKafkaClusters() {
        try {
            const containers = await this.docker.listContainers({
                filters: {
                    label: ['com.docker.compose.service=kafka', 'com.docker.compose.service=broker']
                }
            });
            
            const clusters = {};
            
            for (const container of containers) {
                const projectName = container.Labels['com.docker.compose.project'] || 'default';
                if (!clusters[projectName]) {
                    clusters[projectName] = {
                        name: projectName,
                        containers: []
                    };
                }
                
                clusters[projectName].containers.push({
                    name: container.Names[0].replace('/', ''),
                    id: container.Id.substring(0, 12),
                    status: container.State,
                    ports: container.Ports
                });
            }
            
            return Object.values(clusters);
        } catch (error) {
            console.error('Error getting Kafka clusters:', error);
            return [];
        }
    }
    
    async execute(command, options = {}) {
        const {
            onStdout = () => {},
            onStderr = () => {},
            onProgress = () => {},
            timeout = 60000,
            cwd = process.cwd()
        } = options;
        
        return new Promise((resolve, reject) => {
            // Parse command
            const args = this.parseCommand(command);
            const cmd = args.shift();
            
            console.log(`Executing: ${cmd} ${args.join(' ')}`);
            
            // Spawn process
            const child = spawn(cmd, args, {
                cwd,
                env: { ...process.env, ...options.env },
                shell: true
            });
            
            const commandId = Date.now().toString();
            this.runningCommands.set(commandId, child);
            
            // Set timeout
            const timeoutId = setTimeout(() => {
                child.kill('SIGTERM');
                reject(new Error('Command timeout'));
            }, timeout);
            
            // Handle stdout
            child.stdout.on('data', (data) => {
                onStdout(data);
            });
            
            // Handle stderr
            child.stderr.on('data', (data) => {
                onStderr(data);
            });
            
            // Handle close
            child.on('close', (code) => {
                clearTimeout(timeoutId);
                this.runningCommands.delete(commandId);
                
                if (code === 0) {
                    resolve({ exitCode: code });
                } else {
                    reject(new Error(`Command exited with code ${code}`));
                }
            });
            
            // Handle error
            child.on('error', (error) => {
                clearTimeout(timeoutId);
                this.runningCommands.delete(commandId);
                reject(error);
            });
        });
    }
    
    parseCommand(command) {
        // Simple command parsing - in production, use a proper shell parser
        const args = [];
        let current = '';
        let inQuote = false;
        let quoteChar = '';
        
        for (let i = 0; i < command.length; i++) {
            const char = command[i];
            
            if (inQuote) {
                if (char === quoteChar) {
                    inQuote = false;
                    quoteChar = '';
                } else {
                    current += char;
                }
            } else {
                if (char === '"' || char === "'") {
                    inQuote = true;
                    quoteChar = char;
                } else if (char === ' ') {
                    if (current) {
                        args.push(current);
                        current = '';
                    }
                } else {
                    current += char;
                }
            }
        }
        
        if (current) {
            args.push(current);
        }
        
        return args;
    }
    
    async executeDockerCommand(containerName, command) {
        try {
            const container = this.docker.getContainer(containerName);
            
            const exec = await container.exec({
                Cmd: ['sh', '-c', command],
                AttachStdout: true,
                AttachStderr: true
            });
            
            const stream = await exec.start();
            
            return new Promise((resolve, reject) => {
                let output = '';
                let error = '';
                
                container.modem.demuxStream(stream, {
                    write: (chunk) => { output += chunk.toString(); },
                    end: () => {}
                }, {
                    write: (chunk) => { error += chunk.toString(); },
                    end: () => {}
                });
                
                stream.on('end', () => {
                    if (error) {
                        reject(new Error(error));
                    } else {
                        resolve(output);
                    }
                });
            });
        } catch (error) {
            throw error;
        }
    }
    
    cancelCommand(commandId) {
        const child = this.runningCommands.get(commandId);
        if (child) {
            child.kill('SIGTERM');
            this.runningCommands.delete(commandId);
        }
    }
    
    async testConnection() {
        try {
            await this.docker.ping();
            return { connected: true };
        } catch (error) {
            return { connected: false, error: error.message };
        }
    }
}

module.exports = CommandExecutor;