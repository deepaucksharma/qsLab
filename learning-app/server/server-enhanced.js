const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { passport } = require('./src/middleware/auth');
const config = require('./src/config');
const { sequelize } = require('./src/db/models');
const RedisService = require('./src/services/RedisService');
const TerminalManager = require('./src/services/TerminalManager');
const winston = require('winston');

// Initialize logger
const logger = winston.createLogger({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ 
  server,
  verifyClient: async (info, cb) => {
    // Extract token from query string
    const url = new URL(info.req.url, `http://${info.req.headers.host}`);
    const token = url.searchParams.get('token');
    
    if (!token) {
      cb(false, 401, 'Unauthorized');
      return;
    }
    
    try {
      const AuthService = require('./src/auth/AuthService');
      const payload = await AuthService.validateToken(token);
      info.req.userId = payload.userId;
      info.req.userRole = payload.role;
      cb(true);
    } catch (error) {
      cb(false, 401, 'Unauthorized');
    }
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));
app.use(compression());

// CORS configuration
app.use(cors({
  origin: config.security.corsOrigin,
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy
if (config.security.trustedProxies.length > 0) {
  app.set('trust proxy', config.security.trustedProxies);
}

// Initialize Passport
app.use(passport.initialize());

// Global rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimiting.windowMs,
  max: config.rateLimiting.maxRequests,
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Request logging
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// API Routes
app.use('/api/auth', require('./src/api/auth.routes'));
app.use('/api/users', require('./src/api/users.routes'));
app.use('/api/progress', require('./src/api/progress.routes'));
app.use('/api/labs', require('./src/api/labs.routes'));
app.use('/api/docker', require('./src/api/docker.routes'));
app.use('/api/commands', require('./src/api/commands.routes'));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Check database
    await sequelize.authenticate();
    
    // Check Redis
    await RedisService.client.ping();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: 'connected',
        redis: 'connected',
        docker: 'available'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// WebSocket connection handling
wss.on('connection', async (ws, req) => {
  const userId = req.userId;
  const sessionId = require('uuid').v4();
  
  logger.info(`WebSocket connection established for user ${userId}`);
  
  // Initialize terminal session
  const terminal = await TerminalManager.createSession(userId, sessionId, ws);
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'command':
          await terminal.executeCommand(data.command);
          break;
          
        case 'resize':
          await terminal.resize(data.cols, data.rows);
          break;
          
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
          
        default:
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Unknown message type' 
          }));
      }
    } catch (error) {
      logger.error('WebSocket message error:', error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: error.message 
      }));
    }
  });
  
  ws.on('close', async () => {
    logger.info(`WebSocket connection closed for user ${userId}`);
    await TerminalManager.closeSession(sessionId);
  });
  
  ws.on('error', (error) => {
    logger.error('WebSocket error:', error);
  });
  
  // Send initial ready message
  ws.send(JSON.stringify({ 
    type: 'ready', 
    sessionId,
    message: 'Terminal ready' 
  }));
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  
  res.status(err.status || 500).json({
    error: config.nodeEnv === 'production' 
      ? 'Internal server error' 
      : err.message,
    stack: config.nodeEnv === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down server...');
  
  // Close WebSocket server
  wss.close();
  
  // Close HTTP server
  server.close();
  
  // Close database connections
  await sequelize.close();
  
  // Close Redis connections
  await RedisService.disconnect();
  
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Initialize services and start server
const startServer = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    logger.info('Database connected successfully');
    
    // Run migrations in development
    if (config.nodeEnv === 'development') {
      const { exec } = require('child_process');
      exec('npm run db:migrate', (error, stdout, stderr) => {
        if (error) {
          logger.error('Migration error:', error);
        } else {
          logger.info('Migrations completed');
        }
      });
    }
    
    // Connect to Redis
    await RedisService.connect();
    logger.info('Redis connected successfully');
    
    // Start server
    const PORT = config.port;
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`WebSocket server ready`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = { app, server, wss };