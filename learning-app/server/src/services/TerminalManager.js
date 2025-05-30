const Docker = require('dockerode');
const { v4: uuidv4 } = require('uuid');
const CommandExecutor = require('../../CommandExecutor');
const SecurityManager = require('../../SecurityManager');
const RedisService = require('./RedisService');
const { User } = require('../db/models');
const config = require('../config');

class TerminalManager {
  constructor() {
    this.docker = new Docker({ socketPath: config.docker.socketPath });
    this.sessions = new Map();
    this.userContainers = new Map();
    this.securityManager = new SecurityManager();
  }

  async createSession(userId, sessionId, ws) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get or create user container
    const container = await this.getOrCreateUserContainer(userId);
    
    // Create terminal session
    const terminal = {
      sessionId,
      userId,
      ws,
      container,
      executor: new CommandExecutor(),
      commandHistory: [],
      startTime: new Date(),
      lastActivity: new Date()
    };

    // Store session
    this.sessions.set(sessionId, terminal);
    
    // Store in Redis
    await RedisService.setTerminalSession(sessionId, {
      userId,
      containerId: container.id,
      startTime: terminal.startTime,
      active: true
    });

    // Setup command execution
    terminal.executeCommand = async (command) => {
      try {
        // Update activity
        terminal.lastActivity = new Date();
        await RedisService.updateTerminalActivity(sessionId);

        // Validate command
        const validation = await this.securityManager.validateCommand(command, {
          role: user.role,
          permissions: user.permissions || []
        });

        if (!validation.allowed) {
          ws.send(JSON.stringify({
            type: 'error',
            message: validation.reason || 'Command not allowed'
          }));
          return;
        }

        // Add to history
        terminal.commandHistory.push({
          command,
          timestamp: new Date(),
          status: 'executing'
        });

        // Store command in Redis history
        await RedisService.addCommandHistory(userId, command, 'started');

        // Execute command in user's container
        const exec = await container.exec({
          Cmd: ['sh', '-c', command],
          AttachStdout: true,
          AttachStderr: true,
          Tty: true,
          User: 'learner', // Non-root user in container
          WorkingDir: '/home/learner/workspace'
        });

        const stream = await exec.start({
          Detach: false,
          Tty: true
        });

        // Stream output to WebSocket
        stream.on('data', (chunk) => {
          ws.send(JSON.stringify({
            type: 'output',
            data: chunk.toString('utf8')
          }));
        });

        stream.on('end', async () => {
          const inspection = await exec.inspect();
          const exitCode = inspection.ExitCode;

          // Update command history
          const lastCommand = terminal.commandHistory[terminal.commandHistory.length - 1];
          lastCommand.status = exitCode === 0 ? 'success' : 'failed';
          lastCommand.exitCode = exitCode;

          // Store result in Redis
          await RedisService.addCommandHistory(userId, command, {
            exitCode,
            status: lastCommand.status
          });

          ws.send(JSON.stringify({
            type: 'exit',
            exitCode
          }));
        });

        stream.on('error', (error) => {
          ws.send(JSON.stringify({
            type: 'error',
            message: error.message
          }));
        });

      } catch (error) {
        console.error('Command execution error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Failed to execute command'
        }));
      }
    };

    // Setup resize handler
    terminal.resize = async (cols, rows) => {
      // Container resize logic here
    };

    return terminal;
  }

  async getOrCreateUserContainer(userId) {
    // Check if user already has a container
    let containerInfo = await RedisService.getUserContainer(userId);
    
    if (containerInfo) {
      try {
        const container = this.docker.getContainer(containerInfo.id);
        const info = await container.inspect();
        
        if (info.State.Running) {
          return container;
        }
      } catch (error) {
        // Container doesn't exist or is not running
        console.log('Container not found or not running, creating new one');
      }
    }

    // Create new container for user
    return await this.createUserContainer(userId);
  }

  async createUserContainer(userId) {
    const containerName = `kafka-learning-${userId}-${Date.now()}`;
    const networkName = `user-network-${userId}`;

    try {
      // Create isolated network for user
      let network;
      try {
        network = await this.docker.createNetwork({
          Name: networkName,
          Driver: 'bridge',
          Internal: true, // No external access
          Labels: {
            'kafka-learning': 'true',
            'user-id': userId
          }
        });
      } catch (error) {
        if (error.statusCode !== 409) { // Network already exists
          throw error;
        }
        network = this.docker.getNetwork(networkName);
      }

      // Create user workspace container
      const container = await this.docker.createContainer({
        name: containerName,
        Image: 'kafka-learning-workspace:latest', // Custom image with tools
        Cmd: ['/bin/sh'],
        Tty: true,
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        OpenStdin: true,
        StdinOnce: false,
        WorkingDir: '/home/learner/workspace',
        User: 'learner',
        Env: [
          `USER_ID=${userId}`,
          'TERM=xterm-256color',
          'PS1=\\u@kafka-learning:\\w\\$ '
        ],
        HostConfig: {
          Memory: 512 * 1024 * 1024, // 512MB
          MemorySwap: 512 * 1024 * 1024, // No swap
          CpuShares: 512, // Half CPU
          PidsLimit: 100,
          ReadonlyRootfs: false,
          NetworkMode: networkName,
          AutoRemove: false,
          RestartPolicy: { Name: 'no' },
          SecurityOpt: ['no-new-privileges'],
          CapDrop: ['ALL'],
          CapAdd: ['CHOWN', 'SETUID', 'SETGID'],
          Binds: [
            // Mount read-only course materials
            '/home/deepak/src/qsLab/learning-app/labs:/home/learner/labs:ro',
            // User workspace volume
            `kafka-learning-workspace-${userId}:/home/learner/workspace:rw`
          ]
        },
        Labels: {
          'kafka-learning': 'true',
          'user-id': userId,
          'container-type': 'workspace'
        }
      });

      // Start container
      await container.start();

      // Store container info in Redis
      const containerInfo = {
        id: container.id,
        name: containerName,
        network: networkName,
        createdAt: new Date()
      };
      
      await RedisService.setUserContainer(userId, containerInfo);
      this.userContainers.set(userId, container);

      // Setup container cleanup after idle timeout
      this.scheduleContainerCleanup(userId, container.id);

      return container;
    } catch (error) {
      console.error('Error creating user container:', error);
      throw error;
    }
  }

  async closeSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Update Redis
    await RedisService.deleteTerminalSession(sessionId);

    // Remove from memory
    this.sessions.delete(sessionId);

    // Check if user has other active sessions
    const userSessions = Array.from(this.sessions.values())
      .filter(s => s.userId === session.userId);

    if (userSessions.length === 0) {
      // Schedule container cleanup if no active sessions
      this.scheduleContainerCleanup(session.userId, session.container.id, 300000); // 5 minutes
    }
  }

  scheduleContainerCleanup(userId, containerId, delay = 1800000) { // 30 minutes default
    setTimeout(async () => {
      try {
        // Check if user has active sessions
        const userSessions = Array.from(this.sessions.values())
          .filter(s => s.userId === userId);

        if (userSessions.length === 0) {
          await this.cleanupUserContainer(userId, containerId);
        }
      } catch (error) {
        console.error('Container cleanup error:', error);
      }
    }, delay);
  }

  async cleanupUserContainer(userId, containerId) {
    try {
      const container = this.docker.getContainer(containerId);
      
      // Stop container
      await container.stop({ t: 10 });
      
      // Remove container
      await container.remove();

      // Remove from Redis
      await RedisService.deleteUserContainer(userId);
      
      // Remove from memory
      this.userContainers.delete(userId);

      console.log(`Cleaned up container for user ${userId}`);
    } catch (error) {
      if (error.statusCode !== 404) {
        console.error('Error cleaning up container:', error);
      }
    }
  }

  async getActiveSessionsCount() {
    return this.sessions.size;
  }

  async getUserSessions(userId) {
    return Array.from(this.sessions.values())
      .filter(s => s.userId === userId)
      .map(s => ({
        sessionId: s.sessionId,
        startTime: s.startTime,
        lastActivity: s.lastActivity,
        commandCount: s.commandHistory.length
      }));
  }

  async getSessionMetrics() {
    const metrics = {
      totalSessions: this.sessions.size,
      activeContainers: this.userContainers.size,
      userMetrics: {}
    };

    for (const [userId, container] of this.userContainers) {
      const stats = await container.stats({ stream: false });
      metrics.userMetrics[userId] = {
        cpuUsage: this.calculateCPUUsage(stats),
        memoryUsage: stats.memory_stats.usage,
        networkIO: {
          rx: stats.networks?.eth0?.rx_bytes || 0,
          tx: stats.networks?.eth0?.tx_bytes || 0
        }
      };
    }

    return metrics;
  }

  calculateCPUUsage(stats) {
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - 
                     stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta = stats.cpu_stats.system_cpu_usage - 
                        stats.precpu_stats.system_cpu_usage;
    const cpuCount = stats.cpu_stats.online_cpus || 1;
    
    if (systemDelta > 0 && cpuDelta > 0) {
      return (cpuDelta / systemDelta) * cpuCount * 100.0;
    }
    return 0;
  }
}

module.exports = new TerminalManager();