require('dotenv').config();

const config = {
  // Server
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'kafka_learning_dev',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: process.env.DB_SSL === 'true'
  },
  
  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DB || 0
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiry: process.env.JWT_EXPIRY || '24h',
    refreshExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d'
  },
  
  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8080',
    trustedProxies: process.env.TRUSTED_PROXIES?.split(',') || []
  },
  
  // Rate limiting
  rateLimiting: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX) || 100
  },
  
  // Docker
  docker: {
    socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock',
    network: process.env.DOCKER_NETWORK || 'kafka-learning-network'
  },
  
  // New Relic
  newRelic: {
    appName: process.env.NEW_RELIC_APP_NAME || 'Kafka Learning App',
    licenseKey: process.env.NEW_RELIC_LICENSE_KEY,
    enabled: process.env.NEW_RELIC_ENABLED === 'true'
  },
  
  // Email (for future use)
  email: {
    provider: process.env.EMAIL_PROVIDER || 'sendgrid',
    apiKey: process.env.EMAIL_API_KEY,
    fromAddress: process.env.EMAIL_FROM || 'noreply@kafkalearning.app'
  },
  
  // Features
  features: {
    ssoEnabled: process.env.FEATURE_SSO === 'true',
    multiTenancy: process.env.FEATURE_MULTI_TENANCY === 'true',
    analytics: process.env.FEATURE_ANALYTICS === 'true'
  }
};

// Validate required config
const validateConfig = () => {
  const required = [];
  
  if (config.nodeEnv === 'production') {
    required.push(
      'JWT_SECRET',
      'DB_PASSWORD',
      'REDIS_PASSWORD'
    );
  }
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

if (config.nodeEnv !== 'test') {
  validateConfig();
}

module.exports = config;