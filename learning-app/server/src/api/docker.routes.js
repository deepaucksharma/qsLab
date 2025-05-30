const express = require('express');
const Docker = require('dockerode');
const { authenticate, authorize } = require('../middleware/auth');
const config = require('../config');

const router = express.Router();
const docker = new Docker({ socketPath: config.docker.socketPath });

// Get Docker status
router.get('/status', authenticate, async (req, res) => {
  try {
    // Check Docker daemon
    const info = await docker.info();
    
    // List user's containers
    const containers = await docker.listContainers({
      all: true,
      filters: {
        label: [`user-id=${req.user.id}`]
      }
    });

    res.json({
      docker: {
        version: info.ServerVersion,
        running: true,
        containers: info.Containers,
        images: info.Images
      },
      userContainers: containers.map(c => ({
        id: c.Id,
        name: c.Names[0],
        state: c.State,
        status: c.Status,
        created: new Date(c.Created * 1000),
        labels: c.Labels
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      docker: { running: false },
      error: error.message 
    });
  }
});

// Get container logs
router.get('/containers/:containerId/logs', authenticate, async (req, res) => {
  try {
    const { containerId } = req.params;
    const { tail = 100 } = req.query;

    // Verify container belongs to user
    const container = docker.getContainer(containerId);
    const info = await container.inspect();
    
    if (info.Config.Labels['user-id'] !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get logs
    const stream = await container.logs({
      stdout: true,
      stderr: true,
      tail: parseInt(tail),
      timestamps: true
    });

    const logs = stream.toString('utf8');
    
    res.json({ 
      containerId,
      logs: logs.split('\n').filter(line => line.trim())
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get container stats
router.get('/containers/:containerId/stats', authenticate, async (req, res) => {
  try {
    const { containerId } = req.params;

    // Verify container belongs to user
    const container = docker.getContainer(containerId);
    const info = await container.inspect();
    
    if (info.Config.Labels['user-id'] !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get stats
    const stats = await container.stats({ stream: false });
    
    res.json({
      containerId,
      stats: {
        cpu: calculateCPUUsage(stats),
        memory: {
          usage: stats.memory_stats.usage,
          limit: stats.memory_stats.limit,
          percentage: (stats.memory_stats.usage / stats.memory_stats.limit) * 100
        },
        network: stats.networks,
        pids: stats.pids_stats
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Restart container
router.post('/containers/:containerId/restart', authenticate, async (req, res) => {
  try {
    const { containerId } = req.params;

    // Verify container belongs to user
    const container = docker.getContainer(containerId);
    const info = await container.inspect();
    
    if (info.Config.Labels['user-id'] !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await container.restart();
    
    res.json({ 
      message: 'Container restarted successfully',
      containerId 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin routes
// Get all containers (admin only)
router.get('/containers', authenticate, authorize('admin'), async (req, res) => {
  try {
    const containers = await docker.listContainers({
      all: true,
      filters: {
        label: ['kafka-learning=true']
      }
    });

    res.json({
      containers: containers.map(c => ({
        id: c.Id,
        name: c.Names[0],
        userId: c.Labels['user-id'],
        type: c.Labels['container-type'],
        state: c.State,
        status: c.Status,
        created: new Date(c.Created * 1000),
        image: c.Image
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clean up unused resources (admin only)
router.post('/cleanup', authenticate, authorize('admin'), async (req, res) => {
  try {
    // Prune stopped containers
    const containersPruned = await docker.pruneContainers({
      filters: {
        label: ['kafka-learning=true']
      }
    });

    // Prune unused networks
    const networksPruned = await docker.pruneNetworks({
      filters: {
        label: ['kafka-learning=true']
      }
    });

    // Prune unused volumes
    const volumesPruned = await docker.pruneVolumes({
      filters: {
        label: ['kafka-learning=true']
      }
    });

    res.json({
      message: 'Cleanup completed',
      cleaned: {
        containers: containersPruned.ContainersDeleted?.length || 0,
        networks: networksPruned.NetworksDeleted?.length || 0,
        volumes: volumesPruned.VolumesDeleted?.length || 0,
        spaceReclaimed: containersPruned.SpaceReclaimed + 
                       volumesPruned.SpaceReclaimed || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function
function calculateCPUUsage(stats) {
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

module.exports = router;