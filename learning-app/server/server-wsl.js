const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const SecurityManager = require('./lib/SecurityManager');
const CommandExecutorWSL = require('./lib/CommandExecutorWSL');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const securityManager = new SecurityManager();
const commandExecutor = new CommandExecutorWSL();

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const dockerStatus = await commandExecutor.getDockerStatus();
        res.json({
            status: 'healthy',
            docker: dockerStatus,
            connections: io.engine.clientsCount,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Docker status endpoint
app.get('/api/docker/status', async (req, res) => {
    try {
        const status = await commandExecutor.getDockerStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);
    
    // Send initial connection acknowledgment
    socket.emit('connected', {
        id: socket.id,
        timestamp: new Date().toISOString()
    });
    
    // Handle command execution
    socket.on('execute', async (data) => {
        const { command, container = 'kafka-xray-broker' } = data;
        
        console.log(`Executing command: ${command} in container: ${container}`);
        
        // Validate command
        if (!securityManager.validateCommand(command)) {
            socket.emit('error', {
                message: 'Command not allowed for security reasons',
                command: command
            });
            return;
        }
        
        try {
            // Execute command with streaming output
            await commandExecutor.executeStreamingCommand(
                command,
                container,
                (output) => {
                    socket.emit('output', {
                        data: output,
                        timestamp: new Date().toISOString()
                    });
                },
                (error) => {
                    socket.emit('output', {
                        data: error,
                        isError: true,
                        timestamp: new Date().toISOString()
                    });
                },
                (exitCode) => {
                    socket.emit('commandComplete', {
                        exitCode: exitCode,
                        timestamp: new Date().toISOString()
                    });
                },
                socket.id
            );
        } catch (error) {
            console.error('Command execution error:', error);
            socket.emit('error', {
                message: error.message,
                command: command
            });
        }
    });
    
    // Handle command termination
    socket.on('terminate', () => {
        console.log(`Terminating command for client: ${socket.id}`);
        const terminated = commandExecutor.terminateCommand(socket.id);
        socket.emit('terminated', {
            success: terminated,
            timestamp: new Date().toISOString()
        });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        // Clean up any running commands
        commandExecutor.terminateCommand(socket.id);
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Terminal server (WSL) running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Using Docker command: ${process.env.DOCKER_CMD || 'docker.exe'}`);
});