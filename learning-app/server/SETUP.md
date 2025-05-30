# Kafka Learning App Backend Setup

## Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- PostgreSQL 15+ (or use Docker Compose)
- Redis 7+ (or use Docker Compose)

## Quick Start

### 1. Clone and Install Dependencies

```bash
cd learning-app/server
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Development Services

```bash
# Start PostgreSQL and Redis
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
sleep 10
```

### 4. Run Database Migrations

```bash
# Create database (if not exists)
npx sequelize-cli db:create

# Run migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

### 5. Build Workspace Docker Image

```bash
# Build the user workspace image
docker build -f Dockerfile.workspace -t kafka-learning-workspace:latest .
```

### 6. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

The server will start on http://localhost:3001

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### User Endpoints

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/progress` - Get learning progress
- `GET /api/users/leaderboard` - Get leaderboard

### Lab Endpoints

- `GET /api/labs` - List all labs
- `GET /api/labs/:weekId` - Get specific lab
- `POST /api/labs/:weekId/start` - Start lab environment
- `POST /api/labs/:weekId/stop` - Stop lab environment

### Progress Endpoints

- `GET /api/progress/:weekId/:exerciseId` - Get exercise progress
- `POST /api/progress/:weekId/:exerciseId/start` - Start exercise
- `POST /api/progress/:weekId/:exerciseId/submit` - Submit solution

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Manual Testing

1. **Test Authentication**:
```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","displayName":"Test User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

2. **Test WebSocket Terminal**:
```javascript
// In browser console
const ws = new WebSocket('ws://localhost:3001?token=YOUR_JWT_TOKEN');
ws.onmessage = (event) => console.log(JSON.parse(event.data));
ws.send(JSON.stringify({ type: 'command', command: 'ls' }));
```

## Development Tips

### Database Management

```bash
# Create new migration
npx sequelize-cli migration:generate --name your-migration-name

# Undo last migration
npm run db:migrate:undo

# Reset database
npx sequelize-cli db:drop
npx sequelize-cli db:create
npm run db:migrate
```

### Docker Commands

```bash
# View all user containers
docker ps -a --filter label=kafka-learning=true

# Clean up stopped containers
docker container prune --filter label=kafka-learning=true

# View logs
docker logs kafka-learning-postgres
docker logs kafka-learning-redis
```

### Debugging

1. **Enable Debug Logging**:
```bash
DEBUG=* npm run dev
```

2. **Connect to Database**:
   - Adminer: http://localhost:8088
   - Redis Commander: http://localhost:8089

3. **Monitor WebSocket Connections**:
```bash
# In server logs, WebSocket connections are logged
# Look for "WebSocket connection established for user"
```

## Production Deployment

### Environment Variables

Ensure these are set in production:

- `NODE_ENV=production`
- `JWT_SECRET` - Strong secret key
- `DB_PASSWORD` - Secure database password
- `REDIS_PASSWORD` - Redis password
- `CORS_ORIGIN` - Frontend URL

### Security Checklist

- [ ] Change all default passwords
- [ ] Enable SSL/TLS for database connections
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Enable security headers
- [ ] Set up monitoring and alerts
- [ ] Regular security updates

### Scaling Considerations

1. **Horizontal Scaling**:
   - Use Redis for session storage (already implemented)
   - Load balance WebSocket connections with sticky sessions
   - Use connection pooling for database

2. **Container Management**:
   - Consider Kubernetes for container orchestration
   - Implement container resource monitoring
   - Set up automatic cleanup policies

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Check PostgreSQL is running: `docker ps`
   - Verify credentials in `.env`
   - Check firewall/network settings

2. **Redis Connection Error**:
   - Check Redis is running: `docker ps`
   - Test connection: `redis-cli ping`

3. **Docker Permission Error**:
   - Add user to docker group: `sudo usermod -aG docker $USER`
   - Restart terminal/system

4. **WebSocket Connection Failed**:
   - Check JWT token is valid
   - Verify CORS settings
   - Check firewall allows WebSocket connections

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Express API   │
│   (React)       │     │   (REST/WS)     │
└─────────────────┘     └────────┬────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
              ┌─────▼─────┐           ┌──────▼──────┐
              │PostgreSQL │           │    Redis    │
              │           │           │             │
              │ • Users   │           │ • Sessions  │
              │ • Progress│           │ • Cache     │
              │ • Orgs    │           │ • Queues    │
              └───────────┘           └─────────────┘
                                            │
                                     ┌──────▼──────┐
                                     │   Docker    │
                                     │             │
                                     │ • User      │
                                     │   Workspace │
                                     │ • Kafka     │
                                     │   Clusters  │
                                     └─────────────┘
```

## Support

For issues or questions:
- Check the [Troubleshooting](#troubleshooting) section
- Review server logs: `docker logs kafka-learning-server`
- Open an issue on GitHub