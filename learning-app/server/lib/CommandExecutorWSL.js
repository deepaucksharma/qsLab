const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class CommandExecutorWSL {
    constructor() {
        this.runningCommands = new Map();
        // Use docker.exe for WSL
        this.dockerCmd = process.env.DOCKER_CMD || 'docker.exe';
    }
    
    async getDockerStatus() {
        try {
            // Get Docker version
            const { stdout: version } = await execAsync(`${this.dockerCmd} version --format "{{.Server.Version}}"`);
            
            // Get container list
            const { stdout: containerList } = await execAsync(`${this.dockerCmd} ps --format "{{json .}}"`);
            
            const containers = containerList.trim().split('\n')
                .filter(line => line)
                .map(line => {
                    try {
                        return JSON.parse(line);
                    } catch (e) {
                        return null;
                    }
                })
                .filter(c => c);
            
            return {
                running: true,
                version: version.trim(),
                containers: containers.length,
                containerDetails: containers.map(c => ({
                    id: c.ID,
                    name: c.Names,
                    image: c.Image,
                    state: c.State,
                    status: c.Status,
                    ports: c.Ports
                }))
            };
        } catch (error) {
            console.error('Docker status error:', error);
            return {
                running: false,
                error: error.message
            };
        }
    }
    
    async getAvailableContainers() {
        try {
            const { stdout } = await execAsync(`${this.dockerCmd} ps --format "{{.Names}}"`);
            return stdout.trim().split('\n').filter(name => name);
        } catch (error) {
            console.error('Error getting containers:', error);
            return [];
        }
    }
    
    async executeCommand(command, containerName = 'kafka-xray-broker', clientId = null) {
        // Map week names to container names
        const containerMap = {
            'week1': 'kafka-xray-broker',
            'week2': 'kafka-builder-broker',
            'week3': 'kafka-optimizer-broker',
            'week4': 'kafka-detective-broker',
            'week5': 'kafka-architect-broker'
        };
        
        // Use mapped container name if available
        const actualContainer = containerMap[containerName] || containerName;
        
        return new Promise((resolve, reject) => {
            const commandId = Date.now().toString();
            let output = '';
            let errorOutput = '';
            
            const args = ['exec', '-i', actualContainer, 'sh', '-c', command];
            const dockerProcess = spawn(this.dockerCmd, args);
            
            if (clientId) {
                this.runningCommands.set(clientId, dockerProcess);
            }
            
            dockerProcess.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            dockerProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
            
            dockerProcess.on('close', (code) => {
                if (clientId) {
                    this.runningCommands.delete(clientId);
                }
                
                if (code === 0 || code === null) {
                    resolve({
                        success: true,
                        output: output,
                        error: errorOutput,
                        exitCode: code
                    });
                } else {
                    resolve({
                        success: false,
                        output: output,
                        error: errorOutput || `Command exited with code ${code}`,
                        exitCode: code
                    });
                }
            });
            
            dockerProcess.on('error', (err) => {
                if (clientId) {
                    this.runningCommands.delete(clientId);
                }
                reject(err);
            });
        });
    }
    
    async executeStreamingCommand(command, containerName, onData, onError, onClose, clientId = null) {
        const containerMap = {
            'week1': 'kafka-xray-broker',
            'week2': 'kafka-builder-broker',
            'week3': 'kafka-optimizer-broker',
            'week4': 'kafka-detective-broker',
            'week5': 'kafka-architect-broker'
        };
        
        const actualContainer = containerMap[containerName] || containerName;
        
        const args = ['exec', '-i', actualContainer, 'sh', '-c', command];
        const dockerProcess = spawn(this.dockerCmd, args);
        
        if (clientId) {
            this.runningCommands.set(clientId, dockerProcess);
        }
        
        dockerProcess.stdout.on('data', (data) => {
            onData(data.toString());
        });
        
        dockerProcess.stderr.on('data', (data) => {
            onError(data.toString());
        });
        
        dockerProcess.on('close', (code) => {
            if (clientId) {
                this.runningCommands.delete(clientId);
            }
            onClose(code);
        });
        
        return dockerProcess;
    }
    
    terminateCommand(clientId) {
        const process = this.runningCommands.get(clientId);
        if (process) {
            process.kill('SIGTERM');
            this.runningCommands.delete(clientId);
            return true;
        }
        return false;
    }
}

module.exports = CommandExecutorWSL;