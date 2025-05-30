const Redis = require('ioredis');
const config = require('../config');

class RedisService {
  constructor() {
    this.client = null;
    this.pubClient = null;
    this.subClient = null;
  }

  async connect() {
    const redisConfig = {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      }
    };

    // Main client for general operations
    this.client = new Redis(redisConfig);
    
    // Pub/Sub clients for real-time features
    this.pubClient = new Redis(redisConfig);
    this.subClient = new Redis(redisConfig);

    // Error handlers
    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis connected successfully');
    });

    // Wait for connection
    await this.client.ping();
    
    return this;
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
    }
    if (this.pubClient) {
      await this.pubClient.quit();
    }
    if (this.subClient) {
      await this.subClient.quit();
    }
  }

  // Session management
  async setSession(sessionId, data, ttl = 86400) {
    const key = `session:${sessionId}`;
    await this.client.setex(key, ttl, JSON.stringify(data));
  }

  async getSession(sessionId) {
    const key = `session:${sessionId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteSession(sessionId) {
    const key = `session:${sessionId}`;
    await this.client.del(key);
  }

  async extendSession(sessionId, ttl = 86400) {
    const key = `session:${sessionId}`;
    await this.client.expire(key, ttl);
  }

  // User container mapping
  async setUserContainer(userId, containerInfo) {
    const key = `user:container:${userId}`;
    await this.client.setex(key, 3600, JSON.stringify(containerInfo));
  }

  async getUserContainer(userId) {
    const key = `user:container:${userId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteUserContainer(userId) {
    const key = `user:container:${userId}`;
    await this.client.del(key);
  }

  // Cache management
  async setCache(key, value, ttl = 300) {
    const cacheKey = `cache:${key}`;
    await this.client.setex(cacheKey, ttl, JSON.stringify(value));
  }

  async getCache(key) {
    const cacheKey = `cache:${key}`;
    const data = await this.client.get(cacheKey);
    return data ? JSON.parse(data) : null;
  }

  async invalidateCache(pattern) {
    const keys = await this.client.keys(`cache:${pattern}`);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  // Rate limiting
  async checkRateLimit(identifier, limit = 100, window = 900) {
    const key = `rate:${identifier}`;
    const current = await this.client.incr(key);
    
    if (current === 1) {
      await this.client.expire(key, window);
    }
    
    const ttl = await this.client.ttl(key);
    
    return {
      allowed: current <= limit,
      count: current,
      remaining: Math.max(0, limit - current),
      resetIn: ttl
    };
  }

  // Terminal session management
  async setTerminalSession(terminalId, data) {
    const key = `terminal:${terminalId}`;
    await this.client.setex(key, 7200, JSON.stringify(data)); // 2 hours
  }

  async getTerminalSession(terminalId) {
    const key = `terminal:${terminalId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async updateTerminalActivity(terminalId) {
    const key = `terminal:${terminalId}`;
    await this.client.expire(key, 7200); // Reset TTL
  }

  // Command history
  async addCommandHistory(userId, command, result) {
    const key = `history:${userId}`;
    const entry = {
      command,
      result,
      timestamp: new Date().toISOString()
    };
    
    await this.client.lpush(key, JSON.stringify(entry));
    await this.client.ltrim(key, 0, 999); // Keep last 1000 commands
    await this.client.expire(key, 86400 * 30); // 30 days
  }

  async getCommandHistory(userId, limit = 50) {
    const key = `history:${userId}`;
    const history = await this.client.lrange(key, 0, limit - 1);
    return history.map(item => JSON.parse(item));
  }

  // Pub/Sub for real-time features
  async publish(channel, message) {
    await this.pubClient.publish(channel, JSON.stringify(message));
  }

  async subscribe(channel, callback) {
    await this.subClient.subscribe(channel);
    this.subClient.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        callback(JSON.parse(message));
      }
    });
  }

  async unsubscribe(channel) {
    await this.subClient.unsubscribe(channel);
  }

  // Distributed locks
  async acquireLock(resource, ttl = 5000) {
    const lockKey = `lock:${resource}`;
    const lockValue = Date.now() + ttl;
    
    const result = await this.client.set(lockKey, lockValue, 'NX', 'PX', ttl);
    return result === 'OK' ? lockValue : null;
  }

  async releaseLock(resource, lockValue) {
    const lockKey = `lock:${resource}`;
    const currentValue = await this.client.get(lockKey);
    
    if (currentValue === lockValue.toString()) {
      await this.client.del(lockKey);
      return true;
    }
    return false;
  }

  // Queue management (using Bull)
  createQueue(name) {
    const Bull = require('bull');
    return new Bull(name, {
      redis: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        db: config.redis.db
      }
    });
  }
}

module.exports = new RedisService();