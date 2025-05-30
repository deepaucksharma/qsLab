const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const CommandExecutor = require('./lib/CommandExecutor');
const SecurityManager = require('./lib/SecurityManager');

// Load environment variables
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8000', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Initialize managers
const commandExecutor = new CommandExecutor();
const securityManager = new SecurityManager();

// Store active sessions
const sessions = new Map();

// WebSocket connection handling
wss.on('connection', (ws) => {
    const sessionId = uuidv4();
    console.log(`New WebSocket connection: ${sessionId}`);
    
    sessions.set(sessionId, {
        ws,
        userId: null,
        permissions: [],
        createdAt: new Date()
    });
    
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            await handleWebSocketMessage(sessionId, data);
        } catch (error) {
            console.error('WebSocket message error:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message format'
            }));
        }
    });
    
    ws.on('close', () => {
        console.log(`WebSocket disconnected: ${sessionId}`);
        sessions.delete(sessionId);
    });
    
    // Send welcome message
    ws.send(JSON.stringify({
        type: 'connected',
        sessionId,
        message: 'Connected to Kafka Learning App Terminal'
    }));
});

// Handle WebSocket messages
async function handleWebSocketMessage(sessionId, data) {
    const session = sessions.get(sessionId);
    if (!session) return;
    
    const { ws } = session;
    
    switch (data.type) {
        case 'authenticate':
            // In a real app, implement proper authentication
            session.userId = data.userId || 'anonymous';
            session.permissions = ['execute_docker_commands'];
            ws.send(JSON.stringify({
                type: 'authenticated',
                permissions: session.permissions
            }));
            break;
            
        case 'execute':
            if (!session.permissions.includes('execute_docker_commands')) {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Unauthorized'
                }));
                return;
            }
            
            await executeCommand(sessionId, data.command, data.options);
            break;
            
        case 'cancel':
            commandExecutor.cancelCommand(data.commandId);
            break;
            
        default:
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Unknown message type'
            }));
    }
}

// Execute command with streaming output
async function executeCommand(sessionId, command, options = {}) {
    const session = sessions.get(sessionId);
    if (!session) return;
    
    const { ws } = session;
    const commandId = uuidv4();
    
    // Validate and sanitize command
    const validationResult = securityManager.validateCommand(command, options);
    if (!validationResult.valid) {
        ws.send(JSON.stringify({
            type: 'error',
            commandId,
            message: validationResult.reason
        }));
        return;
    }
    
    // Send command start message
    ws.send(JSON.stringify({
        type: 'command_start',
        commandId,
        command: validationResult.sanitizedCommand
    }));
    
    try {
        // Execute command with streaming
        await commandExecutor.execute(
            validationResult.sanitizedCommand,
            {
                ...options,
                onStdout: (data) => {
                    ws.send(JSON.stringify({
                        type: 'stdout',
                        commandId,
                        data: data.toString()
                    }));
                },
                onStderr: (data) => {
                    ws.send(JSON.stringify({
                        type: 'stderr',
                        commandId,
                        data: data.toString()
                    }));
                },
                onProgress: (progress) => {
                    ws.send(JSON.stringify({
                        type: 'progress',
                        commandId,
                        progress
                    }));
                }
            }
        );
        
        // Send completion message
        ws.send(JSON.stringify({
            type: 'command_complete',
            commandId,
            exitCode: 0
        }));
        
    } catch (error) {
        console.error('Command execution error:', error);
        ws.send(JSON.stringify({
            type: 'command_error',
            commandId,
            error: error.message
        }));
    }
}

// REST API endpoints
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        connections: sessions.size
    });
});

app.get('/api/docker/status', async (req, res) => {
    try {
        const status = await commandExecutor.getDockerStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/kafka/clusters', async (req, res) => {
    try {
        const clusters = await commandExecutor.getKafkaClusters();
        res.json(clusters);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/command/validate', (req, res) => {
    const { command } = req.body;
    const result = securityManager.validateCommand(command);
    res.json(result);
});

// Command templates endpoint
app.get('/api/templates/:category', (req, res) => {
    const { category } = req.params;
    const templates = getCommandTemplates(category);
    res.json(templates);
});

// Get command templates
function getCommandTemplates(category) {
    const templates = {
        kafka: [
            {
                name: 'List Topics',
                command: 'docker exec -it kafka-xray-broker kafka-topics --list --bootstrap-server localhost:9092',
                description: 'List all Kafka topics'
            },
            {
                name: 'Create Topic',
                command: 'docker exec -it kafka-xray-broker kafka-topics --create --topic ${TOPIC_NAME} --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1',
                description: 'Create a new Kafka topic',
                variables: ['TOPIC_NAME']
            },
            {
                name: 'Describe Topic',
                command: 'docker exec -it kafka-xray-broker kafka-topics --describe --topic ${TOPIC_NAME} --bootstrap-server localhost:9092',
                description: 'Get detailed information about a topic',
                variables: ['TOPIC_NAME']
            },
            {
                name: 'Produce Messages',
                command: 'docker exec -it kafka-xray-broker kafka-console-producer --topic ${TOPIC_NAME} --bootstrap-server localhost:9092',
                description: 'Start interactive message producer',
                variables: ['TOPIC_NAME']
            },
            {
                name: 'Consume Messages',
                command: 'docker exec -it kafka-xray-broker kafka-console-consumer --topic ${TOPIC_NAME} --from-beginning --bootstrap-server localhost:9092',
                description: 'Consume messages from beginning',
                variables: ['TOPIC_NAME']
            }
        ],
        jmx: [
            {
                name: 'JMX Connect',
                command: 'docker exec -it kafka-xray-jmxterm java -jar /jmxterm.jar',
                description: 'Connect to JMX terminal'
            },
            {
                name: 'Get Broker Metrics',
                command: 'docker exec kafka-xray-jmxterm java -jar /jmxterm.jar -n -i /scripts/broker-metrics.jmx',
                description: 'Fetch broker metrics via JMX'
            }
        ],
        docker: [
            {
                name: 'List Containers',
                command: 'docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"',
                description: 'List running Docker containers'
            },
            {
                name: 'View Logs',
                command: 'docker logs --tail 50 ${CONTAINER_NAME}',
                description: 'View recent container logs',
                variables: ['CONTAINER_NAME']
            },
            {
                name: 'Container Stats',
                command: 'docker stats --no-stream',
                description: 'Show container resource usage'
            }
        ],
        monitoring: [
            {
                name: 'Test nri-kafka',
                command: 'docker run --rm --network week1-xray_default -v ${PWD}/configs/kafka-config.yml:/etc/newrelic-infra/integrations.d/kafka-config.yml newrelic/nri-kafka:latest --metrics --pretty',
                description: 'Test New Relic Kafka integration'
            },
            {
                name: 'Check Agent Status',
                command: 'docker logs newrelic-infra --tail 20 | grep -i kafka',
                description: 'Check New Relic agent Kafka status'
            }
        ]
    };
    
    return templates[category] || [];
}

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Kafka Learning App Server running on port ${PORT}`);
    console.log(`WebSocket server ready for connections`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});