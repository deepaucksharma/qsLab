# Kafka Learning App Backend Server

This server enables real-time command execution for the Kafka Learning App, allowing students to run actual Docker and Kafka commands from the web interface.

## Features

- **WebSocket Communication**: Real-time command execution and output streaming
- **Docker Integration**: Execute Docker and Docker Compose commands
- **Security Layer**: Command validation and sanitization
- **Command Templates**: Pre-defined safe commands for common operations
- **Session Management**: Track user sessions and permissions

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file:
```env
PORT=3001
ALLOWED_ORIGINS=http://localhost:8000,http://localhost:3000
```

### 3. Start the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### 4. Verify Connection
The server will start on port 3001 by default. You should see:
```
Kafka Learning App Server running on port 3001
WebSocket server ready for connections
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Docker Status
```
GET /api/docker/status
```
Returns Docker daemon status and running containers.

### Kafka Clusters
```
GET /api/kafka/clusters
```
Returns detected Kafka clusters from Docker containers.

### Command Templates
```
GET /api/templates/:category
```
Categories: `kafka`, `jmx`, `docker`, `monitoring`

### Command Validation
```
POST /api/command/validate
Content-Type: application/json

{
  "command": "docker ps"
}
```

## WebSocket Protocol

### Client → Server Messages

#### Authenticate
```json
{
  "type": "authenticate",
  "userId": "learner"
}
```

#### Execute Command
```json
{
  "type": "execute",
  "command": "docker ps",
  "options": {}
}
```

#### Cancel Command
```json
{
  "type": "cancel",
  "commandId": "uuid"
}
```

### Server → Client Messages

#### Connected
```json
{
  "type": "connected",
  "sessionId": "uuid",
  "message": "Connected to Kafka Learning App Terminal"
}
```

#### Command Output
```json
{
  "type": "stdout",
  "commandId": "uuid",
  "data": "output text"
}
```

#### Command Error
```json
{
  "type": "stderr",
  "commandId": "uuid",
  "data": "error text"
}
```

#### Command Complete
```json
{
  "type": "command_complete",
  "commandId": "uuid",
  "exitCode": 0
}
```

## Security

The server implements multiple security layers:

### Command Whitelisting
Only specific commands are allowed:
- Docker commands: `ps`, `logs`, `exec`, `stats`, `inspect`
- Kafka tools: `kafka-topics`, `kafka-console-producer`, etc.
- JMX tools: `jmxterm`

### Pattern Blocking
Dangerous patterns are blocked:
- `rm -rf`
- Command substitution
- Pipe to shell
- Sudo commands

### Container Validation
- Only alphanumeric container names
- No path traversal
- Limited volume mounts

### Rate Limiting
- 100 requests per 15 minutes per IP
- WebSocket message throttling

## Development

### Project Structure
```
server/
├── server.js           # Main server file
├── lib/
│   ├── CommandExecutor.js    # Docker command execution
│   └── SecurityManager.js    # Command validation
├── package.json
└── README.md
```

### Adding New Commands

1. Update `SecurityManager.js` to whitelist new commands
2. Add command templates to `server.js`
3. Test thoroughly with various inputs

### Error Handling

All errors are logged and sanitized before sending to clients. Check server logs for debugging:
```bash
tail -f server.log
```

## Deployment

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
```

### Security Checklist
- [ ] Use HTTPS in production
- [ ] Implement proper authentication
- [ ] Set up API key for production
- [ ] Enable CORS for specific domains only
- [ ] Regular security audits
- [ ] Monitor for suspicious commands

## Troubleshooting

### Connection Issues
1. Check if Docker is running
2. Verify server is running on correct port
3. Check CORS settings
4. Ensure WebSocket port is not blocked

### Command Execution Issues
1. Verify Docker permissions
2. Check container names
3. Review security logs
4. Test command directly in terminal

### Performance Issues
1. Monitor WebSocket connections
2. Check for command timeouts
3. Review rate limiting settings
4. Optimize Docker commands

## License
MIT