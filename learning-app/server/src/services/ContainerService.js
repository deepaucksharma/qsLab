const Docker = require('dockerode');
const config = require('../config');
const RedisService = require('./RedisService');

class ContainerService {
  constructor() {
    this.docker = new Docker({ socketPath: config.docker.socketPath });
    this.kafkaImages = {
      broker: 'confluentinc/cp-kafka:7.5.0',
      zookeeper: 'confluentinc/cp-zookeeper:7.5.0',
      schema: 'confluentinc/cp-schema-registry:7.5.0'
    };
  }

  async createKafkaEnvironment(userId, weekId) {
    const envId = `${userId}-${weekId}-${Date.now()}`;
    const networkName = `kafka-env-${envId}`;

    try {
      // Create isolated network
      const network = await this.docker.createNetwork({
        Name: networkName,
        Driver: 'bridge',
        Labels: {
          'kafka-learning': 'true',
          'user-id': userId,
          'week-id': weekId,
          'env-id': envId
        }
      });

      // Create Zookeeper
      const zookeeper = await this.createZookeeper(envId, networkName);
      
      // Create Kafka broker
      const broker = await this.createKafkaBroker(envId, networkName);
      
      // Wait for services to be ready
      await this.waitForKafkaReady(broker, 30000); // 30 seconds timeout

      // Store environment info
      const envInfo = {
        envId,
        networkName,
        containers: {
          zookeeper: zookeeper.id,
          broker: broker.id
        },
        createdAt: new Date(),
        status: 'ready'
      };

      await RedisService.setCache(`kafka-env:${userId}:${weekId}`, envInfo, 7200); // 2 hours

      return envInfo;
    } catch (error) {
      // Cleanup on failure
      await this.cleanupEnvironment(envId);
      throw error;
    }
  }

  async createZookeeper(envId, networkName) {
    const container = await this.docker.createContainer({
      name: `zookeeper-${envId}`,
      Image: this.kafkaImages.zookeeper,
      Env: [
        'ZOOKEEPER_CLIENT_PORT=2181',
        'ZOOKEEPER_TICK_TIME=2000',
        'ZOOKEEPER_LOG4J_ROOT_LOGLEVEL=WARN'
      ],
      ExposedPorts: {
        '2181/tcp': {}
      },
      HostConfig: {
        NetworkMode: networkName,
        Memory: 256 * 1024 * 1024, // 256MB
        MemorySwap: 256 * 1024 * 1024,
        CpuShares: 256,
        AutoRemove: true,
        RestartPolicy: { Name: 'no' }
      },
      Labels: {
        'kafka-learning': 'true',
        'env-id': envId,
        'service': 'zookeeper'
      }
    });

    await container.start();
    return container;
  }

  async createKafkaBroker(envId, networkName) {
    const container = await this.docker.createContainer({
      name: `kafka-${envId}`,
      Image: this.kafkaImages.broker,
      Env: [
        `KAFKA_BROKER_ID=1`,
        `KAFKA_ZOOKEEPER_CONNECT=zookeeper-${envId}:2181`,
        `KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT`,
        `KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka-${envId}:29092,PLAINTEXT_HOST://localhost:9092`,
        `KAFKA_METRICS_REPORTERS=io.confluent.metrics.reporter.ConfluentMetricsReporter`,
        `KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1`,
        `KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS=0`,
        `KAFKA_CONFLUENT_METRICS_REPORTER_BOOTSTRAP_SERVERS=kafka-${envId}:29092`,
        `KAFKA_CONFLUENT_METRICS_REPORTER_TOPIC_REPLICAS=1`,
        `KAFKA_CONFLUENT_METRICS_ENABLE=false`,
        `KAFKA_JMX_PORT=9999`,
        `KAFKA_JMX_HOSTNAME=kafka-${envId}`,
        `KAFKA_LOG4J_ROOT_LOGLEVEL=WARN`,
        `KAFKA_TOOLS_LOG4J_LOGLEVEL=ERROR`
      ],
      ExposedPorts: {
        '9092/tcp': {},
        '29092/tcp': {},
        '9999/tcp': {}
      },
      HostConfig: {
        NetworkMode: networkName,
        Memory: 512 * 1024 * 1024, // 512MB
        MemorySwap: 512 * 1024 * 1024,
        CpuShares: 512,
        AutoRemove: true,
        RestartPolicy: { Name: 'no' },
        Links: [`zookeeper-${envId}:zookeeper`]
      },
      Labels: {
        'kafka-learning': 'true',
        'env-id': envId,
        'service': 'kafka'
      }
    });

    await container.start();
    return container;
  }

  async waitForKafkaReady(kafkaContainer, timeout = 30000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const exec = await kafkaContainer.exec({
          Cmd: ['kafka-broker-api-versions', '--bootstrap-server', 'localhost:9092'],
          AttachStdout: true,
          AttachStderr: true
        });

        const stream = await exec.start({ Detach: false });
        
        return new Promise((resolve, reject) => {
          let output = '';
          
          stream.on('data', (chunk) => {
            output += chunk.toString();
          });
          
          stream.on('end', async () => {
            const inspection = await exec.inspect();
            if (inspection.ExitCode === 0) {
              resolve(true);
            } else {
              // Not ready yet, continue waiting
              setTimeout(() => {
                this.waitForKafkaReady(kafkaContainer, timeout - (Date.now() - startTime))
                  .then(resolve)
                  .catch(reject);
              }, 2000);
            }
          });
        });
      } catch (error) {
        // Continue waiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    throw new Error('Kafka failed to become ready within timeout');
  }

  async getEnvironmentStatus(userId, weekId) {
    const envInfo = await RedisService.getCache(`kafka-env:${userId}:${weekId}`);
    
    if (!envInfo) {
      return { status: 'not_found' };
    }

    try {
      // Check container status
      const broker = this.docker.getContainer(envInfo.containers.broker);
      const brokerInfo = await broker.inspect();
      
      return {
        status: brokerInfo.State.Running ? 'running' : 'stopped',
        environment: envInfo,
        health: {
          broker: brokerInfo.State.Status,
          uptime: Date.now() - new Date(brokerInfo.State.StartedAt).getTime()
        }
      };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  async stopEnvironment(userId, weekId) {
    const envInfo = await RedisService.getCache(`kafka-env:${userId}:${weekId}`);
    
    if (!envInfo) {
      throw new Error('Environment not found');
    }

    await this.cleanupEnvironment(envInfo.envId);
    await RedisService.invalidateCache(`kafka-env:${userId}:${weekId}`);
  }

  async cleanupEnvironment(envId) {
    try {
      // Find all containers for this environment
      const containers = await this.docker.listContainers({
        all: true,
        filters: {
          label: [`env-id=${envId}`]
        }
      });

      // Stop and remove containers
      for (const containerInfo of containers) {
        const container = this.docker.getContainer(containerInfo.Id);
        
        if (containerInfo.State === 'running') {
          await container.stop({ t: 5 });
        }
        
        await container.remove();
      }

      // Remove network
      try {
        const network = this.docker.getNetwork(`kafka-env-${envId}`);
        await network.remove();
      } catch (error) {
        // Network might already be removed
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  async createTopics(userId, weekId, topics) {
    const envInfo = await RedisService.getCache(`kafka-env:${userId}:${weekId}`);
    
    if (!envInfo) {
      throw new Error('Environment not found');
    }

    const broker = this.docker.getContainer(envInfo.containers.broker);
    const results = [];

    for (const topic of topics) {
      const exec = await broker.exec({
        Cmd: [
          'kafka-topics',
          '--create',
          '--topic', topic.name,
          '--partitions', topic.partitions || '3',
          '--replication-factor', '1',
          '--bootstrap-server', 'localhost:9092'
        ],
        AttachStdout: true,
        AttachStderr: true
      });

      const stream = await exec.start({ Detach: false });
      
      const result = await new Promise((resolve) => {
        let output = '';
        
        stream.on('data', (chunk) => {
          output += chunk.toString();
        });
        
        stream.on('end', async () => {
          const inspection = await exec.inspect();
          resolve({
            topic: topic.name,
            success: inspection.ExitCode === 0,
            output
          });
        });
      });
      
      results.push(result);
    }

    return results;
  }

  async executeKafkaCommand(userId, weekId, command) {
    const envInfo = await RedisService.getCache(`kafka-env:${userId}:${weekId}`);
    
    if (!envInfo) {
      throw new Error('Environment not found');
    }

    const broker = this.docker.getContainer(envInfo.containers.broker);
    
    const exec = await broker.exec({
      Cmd: ['sh', '-c', command],
      AttachStdout: true,
      AttachStderr: true,
      WorkingDir: '/opt/kafka/bin'
    });

    const stream = await exec.start({ Detach: false });
    
    return new Promise((resolve, reject) => {
      let output = '';
      
      stream.on('data', (chunk) => {
        output += chunk.toString();
      });
      
      stream.on('end', async () => {
        const inspection = await exec.inspect();
        resolve({
          exitCode: inspection.ExitCode,
          output
        });
      });
      
      stream.on('error', reject);
    });
  }

  async getEnvironmentMetrics(userId, weekId) {
    const envInfo = await RedisService.getCache(`kafka-env:${userId}:${weekId}`);
    
    if (!envInfo) {
      throw new Error('Environment not found');
    }

    const metrics = {};

    for (const [service, containerId] of Object.entries(envInfo.containers)) {
      const container = this.docker.getContainer(containerId);
      const stats = await container.stats({ stream: false });
      
      metrics[service] = {
        cpu: this.calculateCPUUsage(stats),
        memory: {
          usage: stats.memory_stats.usage,
          limit: stats.memory_stats.limit,
          percentage: (stats.memory_stats.usage / stats.memory_stats.limit) * 100
        },
        network: {
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

module.exports = new ContainerService();